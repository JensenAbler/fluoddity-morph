/**
 * Telemetry: what the simulation was doing, and what Jensen thought of it.
 *
 * Two kinds of event go to the server (`POST /api/log`, see
 * `server/log_receiver.py`), one JSON object per line in a daily log:
 *
 *   - SAMPLES, every couple of seconds while evolving or morphing (and rarely
 *     otherwise): the live parameters, the rule, and the evolver's state --
 *     which favorites it is between, where on the line, which is nearest.
 *   - MARKS, when you press 👍 / 👎 / 📝: the same snapshot, at that instant,
 *     with your verdict and an optional note. Marks are what make the samples
 *     readable: "it froze here" lines up with the parameters that froze it.
 *
 * Events queue in memory and flush in batches; when the page is hidden the
 * queue goes out with `sendBeacon`, which survives the tab closing. If the
 * endpoint is missing (local dev) the queue is capped and simply dropped --
 * telemetry must never get in the way of the app.
 */

export type MarkKind = 'up' | 'down' | 'note';

export interface Snapshot {
  readonly [key: string]: unknown;
}

const ENDPOINT = '/api/log';
const FLUSH_MS = 10_000;
const MAX_QUEUE = 600;
/** Sample interval while something is driving the project, and otherwise. */
const ACTIVE_SAMPLE_MS = 2_000;
const IDLE_SAMPLE_MS = 30_000;

function newSessionId(): string {
  const bytes = new Uint8Array(6);
  try {
    crypto.getRandomValues(bytes);
  } catch {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * A per-browser id kept in localStorage, so a later reader can tell one
 * device's sessions from another's (Jensen's phone from a visitor's) without
 * anything identifying. Undefined where storage is unavailable.
 */
function deviceId(): string | undefined {
  try {
    const key = 'fm-device';
    let id = localStorage.getItem(key);
    if (id === null || id === '') {
      id = newSessionId();
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return undefined;
  }
}

export class Telemetry {
  readonly sessionId = newSessionId();
  /** Run just before the page-hide flush (UI usage closes open bursts here). */
  private readonly hideHooks: Array<() => void> = [];
  private queue: object[] = [];
  private lastSample = -Infinity;
  private lastFlush = 0;
  private seq = 0;
  private readonly enabled: boolean;

  constructor() {
    this.enabled = typeof window !== 'undefined' && typeof fetch === 'function';
    if (!this.enabled) return;
    const hide = (): void => {
      for (const hook of this.hideHooks) {
        try {
          hook();
        } catch {
          /* never in the app's way */
        }
      }
      this.flush(true);
    };
    const onHide = (): void => {
      if (document.visibilityState === 'hidden') hide();
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', hide);
    const device = deviceId();
    this.push({
      type: 'session',
      ua: navigator.userAgent,
      screen: `${screen.width}x${screen.height}`,
      ...(device !== undefined ? { device } : {}),
    });
  }

  private push(event: object): void {
    if (!this.enabled) return;
    this.queue.push({ t: Date.now(), seq: this.seq++, ...event });
    if (this.queue.length > MAX_QUEUE) this.queue.splice(0, this.queue.length - MAX_QUEUE);
  }

  /** Called every frame; takes a snapshot only when one is due. */
  tick(nowMs: number, active: boolean, snapshot: () => Snapshot): void {
    if (!this.enabled) return;
    const interval = active ? ACTIVE_SAMPLE_MS : IDLE_SAMPLE_MS;
    if (nowMs - this.lastSample >= interval) {
      this.lastSample = nowMs;
      this.push({ type: 'sample', ...snapshot() });
    }
    if (nowMs - this.lastFlush >= FLUSH_MS) {
      this.lastFlush = nowMs;
      this.flush(false);
    }
  }

  /** A verdict on what is on screen right now. Flushed at once. */
  mark(kind: MarkKind, note: string | undefined, snapshot: Snapshot): void {
    this.push({ type: 'mark', mark: kind, ...(note ? { note } : {}), ...snapshot });
    this.flush(false);
  }

  /** Something worth a line in the log that is not a sample (start, stop...). */
  event(name: string, detail: object = {}): void {
    this.push({ type: 'event', name, ...detail });
  }

  /** A UI usage record (see `uiUsage.ts`). Goes out with the next batch. */
  ui(record: object): void {
    this.push({ type: 'ui', ...record });
  }

  /** Register something to run just before the page-hide flush. */
  onHide(hook: () => void): void {
    this.hideHooks.push(hook);
  }

  private flush(beacon: boolean): void {
    if (!this.enabled || this.queue.length === 0) return;
    const batch = this.queue;
    this.queue = [];
    const body = JSON.stringify({ sid: this.sessionId, events: batch });
    if (beacon && typeof navigator.sendBeacon === 'function') {
      try {
        if (navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }))) return;
      } catch {
        /* fall through to fetch */
      }
    }
    void fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: body.length < 60_000,
    })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
      })
      .catch(() => {
        // Put the batch back (bounded) so a blip loses nothing; a missing
        // endpoint just ages out of the capped queue.
        this.queue = batch.concat(this.queue).slice(-MAX_QUEUE);
      });
  }
}

/** Round for the log: four decimals is plenty to correlate, and halves the bytes. */
export function r4(v: number): number {
  return Math.round(v * 1e4) / 1e4;
}

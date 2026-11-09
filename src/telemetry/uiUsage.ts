/**
 * UI usage log: which controls actually get touched, and what they changed.
 *
 * WHY. Jensen wants to simplify the interface by removing what he never uses,
 * and the honest way to know that is to watch for a long while before cutting
 * anything. This file only GATHERS; nothing is removed on the strength of it.
 * `server/ui_usage_report.py` turns the log into a tally (uses, sessions, first
 * and last seen, and which commands and settings have never been touched).
 *
 * Every record is a `type: 'ui'` line in the existing telemetry log (see
 * `telemetry.ts`), tagged by `via`:
 *
 *   - `cmd`     every command the UI sends the orchestrator -- the semantic
 *               "what changed": which setting, to what value. A burst of the
 *               same command on the same target (a slider drag, a hover-browse)
 *               collapses into ONE line with `n`, `ms` and the starting value
 *               in `from`, so a drag is one use, not sixty.
 *   - `click` / `change`
 *               the DOM element touched, by its visible label plus a short
 *               context path (folder, dialog, menu). This is what counts the
 *               controls that send no command -- folders, tabs, menus.
 *   - `key`     keys pressed outside text fields (hotkeys).
 *   - `canvas`  presses on a canvas, by button and pointer type -- how the
 *               tools get used.
 *
 * Only trusted events count, so the app's own synthetic clicks (the panel
 * opens folders by clicking them) are not mistaken for Jensen. A command with
 * no real input in the couple of seconds before it is tagged `auto: true` --
 * startup auto-evolve, for instance -- so the report can set it aside.
 *
 * Like the rest of telemetry, this must never get in the app's way: every
 * entry point swallows its own errors.
 */

import type { Command } from '../orchestrator/commands.ts';
import type { Telemetry } from './telemetry.ts';

export type UsageRecord = Record<string, unknown>;
type Emit = (record: UsageRecord) => void;

/** Same command + target within this gap = one gesture. */
export const BURST_GAP_MS = 1200;
/** A command this long after the last real input is tagged `auto`. */
const USER_RECENT_MS = 2000;
const MAX_TEXT = 60;

/**
 * Commands that are plumbing rather than choices. Snapshot/restore bracket a
 * menu opening and closing (the click that opened it is logged anyway), and
 * clearSaveError just dismisses a message.
 */
const IGNORED: ReadonlySet<string> = new Set(['snapshotConfigs', 'restoreConfigs', 'clearSaveError']);

function round(v: number): number {
  return Math.round(v * 1e4) / 1e4;
}

export function clip(s: string): string {
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length > MAX_TEXT ? `${t.slice(0, MAX_TEXT)}…` : t;
}

function primitive(v: unknown): unknown {
  if (typeof v === 'number') return Number.isFinite(v) ? round(v) : String(v);
  if (typeof v === 'string') return clip(v);
  if (typeof v === 'boolean' || v === null) return v;
  return undefined;
}

/**
 * A command as a small log record: its kind plus its primitive arguments.
 * Settings are named by field; a whole saved document (`loadSharedConfig`'s
 * `saved`) is left out; a flat object of primitives (`evolveSettings`) is kept.
 * Returns null for the commands in `IGNORED`.
 */
export function describeCommand(command: Command): UsageRecord | null {
  if (IGNORED.has(command.kind)) return null;
  const out: UsageRecord = { cmd: command.kind };
  for (const [k, v] of Object.entries(command)) {
    if (k === 'kind' || k === 'saved') continue;
    if (k === 'setting' && typeof v === 'object' && v !== null && 'field' in v) {
      out['setting'] = String((v as { field: unknown }).field);
      continue;
    }
    const p = primitive(v);
    if (p !== undefined) {
      out[k] = p;
      continue;
    }
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      const flat: UsageRecord = {};
      let any = false;
      for (const [k2, v2] of Object.entries(v as Record<string, unknown>)) {
        const p2 = primitive(v2);
        if (p2 !== undefined) {
          flat[k2] = p2;
          any = true;
        }
      }
      if (any) out[k] = flat;
    }
  }
  return out;
}

/** What makes two commands "the same gesture": the kind and its target. */
export function burstKey(d: UsageRecord): string {
  const settings = d['settings'];
  const target =
    d['setting'] ??
    d['field'] ??
    d['key'] ??
    d['surface'] ??
    d['layer'] ??
    (typeof settings === 'object' && settings !== null ? Object.keys(settings).sort().join(',') : '');
  return `${String(d['cmd'])}|${String(target)}`;
}

/** The fields whose value moved during a burst, at their STARTING values. */
function changedFrom(first: UsageRecord, last: UsageRecord): UsageRecord | null {
  const from: UsageRecord = {};
  let any = false;
  for (const [k, v] of Object.entries(first)) {
    if (k === 'cmd' || k === 'via' || k === 'auto') continue;
    if (JSON.stringify(v) !== JSON.stringify(last[k])) {
      from[k] = v;
      any = true;
    }
  }
  return any ? from : null;
}

interface Burst {
  key: string;
  first: UsageRecord;
  last: UsageRecord;
  n: number;
  start: number;
  end: number;
}

/**
 * Collapses a run of same-key records into one. `add` either extends the open
 * burst or closes it and opens a new one; `flush(now)` closes it once the gap
 * has passed, `flush()` closes it unconditionally.
 */
export class UsageCoalescer {
  private burst: Burst | null = null;
  private readonly emit: Emit;
  private readonly gapMs: number;

  constructor(emit: Emit, gapMs: number = BURST_GAP_MS) {
    this.emit = emit;
    this.gapMs = gapMs;
  }

  get pending(): boolean {
    return this.burst !== null;
  }

  add(record: UsageRecord, key: string, now: number): void {
    const b = this.burst;
    if (b !== null && b.key === key && now - b.end <= this.gapMs) {
      b.last = record;
      b.n += 1;
      b.end = now;
      return;
    }
    this.flush();
    this.burst = { key, first: record, last: record, n: 1, start: now, end: now };
  }

  flush(now?: number): void {
    const b = this.burst;
    if (b === null) return;
    if (now !== undefined && now - b.end <= this.gapMs) return;
    this.burst = null;
    const out: UsageRecord = { ...b.last, t: b.start };
    if (b.first['auto'] === true && b.last['auto'] !== true) delete out['auto'];
    if (b.n > 1) {
      out['n'] = b.n;
      out['ms'] = Math.round(b.end - b.start);
      const from = changedFrom(b.first, b.last);
      if (from !== null) out['from'] = from;
    }
    this.emit(out);
  }
}

const INTERACTIVE = [
  'button',
  'a[href]',
  'summary',
  'select',
  'textarea',
  'input',
  'label',
  '[role="button"]',
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="tab"]',
  '[role="checkbox"]',
  '[role="switch"]',
  '[role="option"]',
  '[role="slider"]',
  '.tp-fldv_b',
  '.tp-rotv_b',
  '[tabindex]',
].join(', ');

function isFormField(el: Element): boolean {
  if (el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) return true;
  if (el instanceof HTMLInputElement) {
    return !['button', 'submit', 'reset', 'image'].includes(el.type);
  }
  return false;
}

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable || target instanceof HTMLTextAreaElement) return true;
  if (target instanceof HTMLInputElement) {
    return !['checkbox', 'radio', 'range', 'button', 'submit', 'reset', 'color'].includes(target.type);
  }
  return false;
}

/** The name a person would use for this control. */
export function labelOf(el: Element): string {
  const aria = el.getAttribute('aria-label');
  if (aria !== null && aria.trim() !== '') return clip(aria);
  if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
    const lab = el.labels?.[0]?.textContent ?? '';
    if (lab.trim() !== '') return clip(lab);
  }
  const blade = el.closest('.tp-lblv');
  const bladeLabel = blade?.querySelector('.tp-lblv_l')?.textContent ?? '';
  if (bladeLabel.trim() !== '') return clip(bladeLabel);
  const text = (el.textContent ?? '').trim();
  const title = el.getAttribute('title') ?? '';
  if (text !== '' && (text.length <= 40 || title.trim() === '')) return clip(text);
  if (title.trim() !== '') return clip(title);
  if (el.id !== '') return `#${el.id}`;
  const placeholder = el.getAttribute('placeholder') ?? '';
  return placeholder !== '' ? clip(placeholder) : '';
}

/** Where the control sits: up to three enclosing names, innermost first. */
export function contextOf(el: Element): string {
  const parts: string[] = [];
  for (let p = el.parentElement; p !== null && p !== document.body && parts.length < 3; p = p.parentElement) {
    let name = '';
    if (p.classList.contains('tp-fldv')) {
      name = p.querySelector(':scope > .tp-fldv_b .tp-fldv_t')?.textContent ?? '';
    } else if (p instanceof HTMLDialogElement) {
      name = p.getAttribute('aria-label') ?? p.querySelector('h1, h2, h3')?.textContent ?? 'dialog';
    } else if (p.getAttribute('aria-label')) {
      name = p.getAttribute('aria-label') ?? '';
    } else if (p.id !== '') {
      name = `#${p.id}`;
    }
    name = clip(name);
    if (name !== '' && parts[parts.length - 1] !== name) parts.push(name);
  }
  return parts.join(' < ');
}

function tagOf(el: Element): string {
  let tag = el.tagName.toLowerCase();
  if (el instanceof HTMLInputElement) tag += `:${el.type}`;
  const role = el.getAttribute('role');
  if (role !== null) tag += `[${role}]`;
  return tag;
}

/** Called from inside listeners; a failure here must never reach the app. */
function guard(fn: () => void): void {
  try {
    fn();
  } catch {
    /* telemetry never breaks the app */
  }
}

export class UiUsage {
  private lastUserInput = -Infinity;
  private readonly streams = new Map<string, UsageCoalescer>();
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly emit: Emit;
  private readonly now: () => number;

  constructor(emit: Emit, now: () => number = Date.now) {
    this.emit = emit;
    this.now = now;
  }

  /** Wire to the telemetry log and, in a browser, to the document. */
  static start(telemetry: Telemetry): UiUsage {
    const usage = new UiUsage((record) => telemetry.ui(record));
    guard(() => {
      telemetry.onHide(() => usage.flushAll());
      if (typeof document !== 'undefined') usage.attach(document);
    });
    return usage;
  }

  /** Every command the orchestrator receives from outside itself. */
  command(command: Command): void {
    guard(() => {
      const d = describeCommand(command);
      if (d === null) return;
      const t = this.now();
      const record: UsageRecord = { via: 'cmd', ...d };
      if (t - this.lastUserInput > USER_RECENT_MS) record['auto'] = true;
      this.add('cmd', record, burstKey(d), t);
    });
  }

  noteUserInput(): void {
    this.lastUserInput = this.now();
  }

  /** Close every open burst now (the page is going away). */
  flushAll(): void {
    for (const stream of this.streams.values()) stream.flush();
  }

  private add(stream: string, record: UsageRecord, key: string, t: number): void {
    let c = this.streams.get(stream);
    if (c === undefined) {
      c = new UsageCoalescer(this.emit);
      this.streams.set(stream, c);
    }
    c.add(record, key, t);
    this.schedule();
  }

  private schedule(): void {
    if (this.timer !== null || typeof setTimeout !== 'function') return;
    this.timer = setTimeout(() => {
      this.timer = null;
      const t = this.now();
      let pending = false;
      for (const stream of this.streams.values()) {
        stream.flush(t);
        pending ||= stream.pending;
      }
      if (pending) this.schedule();
    }, BURST_GAP_MS + 100);
  }

  attach(doc: Document): void {
    const note = (e: Event): void => {
      if (e.isTrusted) this.noteUserInput();
    };
    for (const type of ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart']) {
      doc.addEventListener(type, note, { capture: true, passive: true });
    }

    doc.addEventListener(
      'click',
      (e) => guard(() => {
        if (e.isTrusted) this.domEvent('click', e.target);
      }),
      true,
    );
    doc.addEventListener(
      'change',
      (e) => guard(() => {
        if (e.isTrusted) this.domEvent('change', e.target);
      }),
      true,
    );
    doc.addEventListener(
      'keydown',
      (e) => guard(() => {
        if (!e.isTrusted || e.repeat || isEditable(e.target)) return;
        if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) return;
        const mods = `${e.ctrlKey ? 'Ctrl+' : ''}${e.metaKey ? 'Meta+' : ''}${e.altKey ? 'Alt+' : ''}${e.shiftKey ? 'Shift+' : ''}`;
        const key = `${mods}${e.key}`;
        this.add('key', { via: 'key', key }, `key|${key}`, this.now());
      }),
      true,
    );
    doc.addEventListener(
      'pointerdown',
      (e) => guard(() => {
        if (!e.isTrusted || !(e.target instanceof HTMLCanvasElement)) return;
        const record: UsageRecord = { via: 'canvas', button: e.button, pointer: e.pointerType };
        if (e.target.id !== '') record['el'] = `#${e.target.id}`;
        this.add('canvas', record, `canvas|${String(record['el'] ?? '')}|${e.button}|${e.pointerType}`, this.now());
      }),
      true,
    );
  }

  private domEvent(kind: 'click' | 'change', target: EventTarget | null): void {
    if (!(target instanceof Element)) return;
    if (target instanceof HTMLCanvasElement) return; // counted on pointerdown
    let el = target.closest(INTERACTIVE);
    let loose = false;
    if (el === null) {
      // Custom controls are often plain divs with a listener; keep them when
      // they at least carry a name, and say that the match was loose.
      if (target === document.body || target === document.documentElement) return;
      if (labelOf(target) === '') return;
      el = target;
      loose = true;
    }
    // A form field's choice arrives as `change`; its click would double-count.
    if (kind === 'click' && isFormField(el)) return;
    const record: UsageRecord = { via: kind, el: tagOf(el), label: labelOf(el) };
    const ctx = contextOf(el);
    if (ctx !== '') record['ctx'] = ctx;
    if (loose) record['loose'] = true;
    if (kind === 'change') {
      if (el instanceof HTMLInputElement) {
        if (el.type === 'checkbox' || el.type === 'radio') record['value'] = el.checked;
        else if (el.type === 'range' || el.type === 'number') record['value'] = primitive(Number(el.value));
        else if (el.type === 'color' || el.type === 'file') record['value'] = el.type === 'file' ? el.files?.length ?? 0 : el.value;
      } else if (el instanceof HTMLSelectElement) {
        record['value'] = clip(el.value);
      }
    }
    this.add(kind, record, `${kind}|${String(record['el'])}|${String(record['label'])}|${ctx}`, this.now());
  }
}

/**
 * The Morph panel: a small floating window for the morph timeline.
 *
 * Capture states as keyframes, give each a hold and a transition time, and play
 * -- the simulation keeps running while every setting slides from one keyframe
 * to the next, so you watch the creature turn into the next one.
 *
 * Attached to `document.body`, like `Toast` and `RecordingBar`, so hiding the
 * side panels with `X` leaves it up: a timeline is exactly the thing you want on
 * screen while the panels are out of the way. It holds no simulation state --
 * it reads `Status.morph` each frame and sends `morph*` commands, nothing else
 * (invariant 10).
 *
 * Canvas capture is decided by `event.target !== canvas` (`inputBinding.ts`),
 * so clicks here never reach the simulation, and its number inputs are
 * editable targets, so typing a duration never fires a hotkey.
 */

import type { CheckpointView, Command, Status } from '../orchestrator/commands.ts';
import type { MorphView } from '../morph/morph.ts';
import { EvolveTab } from './evolveTab.ts';

export interface MorphPanelOptions {
  readonly send: (command: Command) => void;
  readonly mobile?: boolean;
  /** Called when the user closes the window with its own × button. */
  readonly onClose?: () => void;
}

function fmt(seconds: number): string {
  if (!Number.isFinite(seconds)) return '0.0s';
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60);
    const s = seconds - m * 60;
    return `${m}:${s.toFixed(1).padStart(4, '0')}`;
  }
  return `${seconds.toFixed(1)}s`;
}

const ROOT_CSS =
  'position:fixed;top:40px;left:50%;transform:translateX(-50%);width:360px;' +
  'max-height:min(72vh,640px);overflow:auto;z-index:45;display:none;' +
  'padding:10px 12px;border-radius:8px;box-sizing:border-box;' +
  'background:rgba(28,28,30,0.95);border:1px solid rgba(255,255,255,0.12);' +
  'box-shadow:0 8px 28px rgba(0,0,0,0.55);' +
  'font:12px system-ui,sans-serif;color:#e8e8ea;-webkit-user-select:none;user-select:none;';

const TOUCH_ROOT_CSS =
  'position:fixed;top:calc(env(safe-area-inset-top,0px) + 52px);left:8px;right:8px;' +
  'max-height:52vh;overflow:auto;z-index:45;display:none;-webkit-overflow-scrolling:touch;' +
  'padding:10px 12px;border-radius:10px;box-sizing:border-box;' +
  'background:rgba(28,28,30,0.95);border:1px solid rgba(255,255,255,0.12);' +
  'box-shadow:0 8px 28px rgba(0,0,0,0.55);' +
  'font:14px system-ui,sans-serif;color:#e8e8ea;-webkit-user-select:none;user-select:none;';

export const BUTTON_CSS =
  'background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.18);' +
  'color:#e8e8ea;border-radius:4px;padding:3px 8px;font:inherit;cursor:pointer;' +
  'touch-action:manipulation;';
export const ICON_CSS = BUTTON_CSS + 'padding:2px 6px;min-width:24px;';
export const PRIMARY_CSS =
  BUTTON_CSS + 'background:#8ab4f8;color:#111;border-color:#8ab4f8;font-weight:600;min-width:72px;';
const NUMBER_CSS =
  'width:52px;background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.18);' +
  'color:#e8e8ea;border-radius:3px;padding:2px 4px;font:inherit;';
const ROW_CSS =
  'display:flex;align-items:center;gap:6px;padding:5px 6px;margin:3px 0;border-radius:5px;' +
  'background:rgba(255,255,255,0.04);border:1px solid transparent;flex-wrap:wrap;';
export const MUTED = 'color:rgba(232,232,234,0.6);';

export class MorphPanel {
  private readonly opts: MorphPanelOptions;
  private root: HTMLElement | null = null;
  private list: HTMLElement | null = null;
  private playButton: HTMLButtonElement | null = null;
  private scrub: HTMLInputElement | null = null;
  private timeLabel: HTMLElement | null = null;
  private loopBox: HTMLInputElement | null = null;
  private resetBox: HTMLInputElement | null = null;
  private easingSelect: HTMLSelectElement | null = null;
  private checkpointSelect: HTMLSelectElement | null = null;
  private rows: HTMLElement[] = [];
  private listSignature = '';
  private checkpointSignature = '';
  private scrubbing = false;
  private evolve: EvolveTab | null = null;
  private shown = false;

  constructor(opts: MorphPanelOptions) {
    this.opts = opts;
  }

  get isShown(): boolean {
    return this.shown;
  }

  setShown(shown: boolean): void {
    this.shown = shown;
    if (shown) this.ensureBuilt();
    if (this.root !== null) this.root.style.display = shown ? 'block' : 'none';
  }

  toggle(): void {
    this.setShown(!this.shown);
  }

  dispose(): void {
    this.root?.remove();
    this.root = null;
  }

  private ensureBuilt(): void {
    if (this.root !== null) return;
    const send = this.opts.send;
    const mobile = this.opts.mobile === true;

    const root = document.createElement('div');
    root.dataset['morphPanel'] = '';
    root.style.cssText = mobile ? TOUCH_ROOT_CSS : ROOT_CSS;
    // Keep wheel/touch scrolls inside the window from zooming the canvas.
    root.addEventListener('wheel', (e) => e.stopPropagation(), { passive: true });

    // --- header ---------------------------------------------------------------
    const header = document.createElement('div');
    header.style.cssText =
      'display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;';
    const title = document.createElement('div');
    title.innerHTML = '<b style="font-size:1.1em">Evolve &amp; Morph</b>';
    const sub = document.createElement('span');
    sub.textContent = '';
    sub.style.cssText = MUTED + 'margin-left:6px;';
    title.append(sub);
    const close = this.button('×', ICON_CSS, () => {
      this.setShown(false);
      this.opts.onClose?.();
    });
    close.title = 'Close (T)';
    header.append(title, close);

    // --- capture row ------------------------------------------------------------
    const capture = document.createElement('div');
    capture.style.cssText = 'display:flex;gap:6px;align-items:center;flex-wrap:wrap;';
    const addCurrent = this.button('+ Add current state', BUTTON_CSS, () =>
      send({ kind: 'morphAddCurrent' }),
    );
    addCurrent.title = 'Capture what is on screen now as the next keyframe';
    const cpSelect = document.createElement('select');
    cpSelect.style.cssText = BUTTON_CSS + 'max-width:150px;';
    cpSelect.addEventListener('change', () => {
      const key = Number(cpSelect.value);
      if (Number.isFinite(key) && cpSelect.value !== '') {
        send({ kind: 'morphAddCheckpoint', key });
      }
      cpSelect.value = '';
    });
    this.checkpointSelect = cpSelect;
    capture.append(addCurrent, cpSelect);

    // --- keyframe list ----------------------------------------------------------
    const list = document.createElement('div');
    list.style.cssText = 'margin:8px 0;';
    this.list = list;

    // --- transport --------------------------------------------------------------
    const transport = document.createElement('div');
    transport.style.cssText = 'display:flex;align-items:center;gap:8px;margin-top:4px;';
    const play = this.button('▶ Play', PRIMARY_CSS, () => {
      const playing = this.playButton?.dataset['playing'] === '1';
      send({ kind: playing ? 'morphStop' : 'morphPlay' });
    });
    this.playButton = play;
    const scrub = document.createElement('input');
    scrub.type = 'range';
    scrub.min = '0';
    scrub.max = '1';
    scrub.step = '0.01';
    scrub.value = '0';
    scrub.style.cssText = 'flex:1 1 auto;min-width:60px;accent-color:#8ab4f8;';
    scrub.addEventListener('pointerdown', () => {
      this.scrubbing = true;
      send({ kind: 'morphStop' });
    });
    const endScrub = (): void => {
      this.scrubbing = false;
    };
    scrub.addEventListener('pointerup', endScrub);
    scrub.addEventListener('pointercancel', endScrub);
    scrub.addEventListener('change', endScrub);
    scrub.addEventListener('input', () => {
      send({ kind: 'morphSeek', time: Number(scrub.value) });
    });
    this.scrub = scrub;
    const time = document.createElement('span');
    time.style.cssText = 'font-variant-numeric:tabular-nums;white-space:nowrap;' + MUTED;
    this.timeLabel = time;
    transport.append(play, scrub, time);

    // --- options ----------------------------------------------------------------
    const options = document.createElement('div');
    options.style.cssText =
      'display:flex;align-items:center;gap:12px;margin-top:8px;flex-wrap:wrap;' + MUTED;
    const loop = this.checkbox('Loop', (v) => send({ kind: 'morphSetLoop', loop: v }));
    this.loopBox = loop.input;
    const reset = this.checkbox('Restart sim on play', (v) =>
      send({ kind: 'morphSetResetOnPlay', reset: v }),
    );
    reset.label.title =
      'Grow the first keyframe from initial conditions before morphing, the way it was discovered';
    this.resetBox = reset.input;
    const easing = document.createElement('select');
    easing.style.cssText = BUTTON_CSS;
    for (const [value, label] of [
      ['smooth', 'Ease in/out'],
      ['linear', 'Linear'],
    ] as const) {
      const o = document.createElement('option');
      o.value = value;
      o.textContent = label;
      easing.append(o);
    }
    easing.addEventListener('change', () =>
      send({ kind: 'morphSetEasing', easing: easing.value === 'linear' ? 'linear' : 'smooth' }),
    );
    this.easingSelect = easing;
    options.append(loop.label, reset.label, easing);

    // --- tabs: Evolve (default) and Timeline ----------------------------------
    const tabs = document.createElement('div');
    tabs.style.cssText = 'display:flex;gap:6px;margin:2px 0 8px;';
    const timelinePane = document.createElement('div');
    timelinePane.append(capture, list, transport, options);
    const evolvePane = document.createElement('div');
    this.evolve = new EvolveTab(evolvePane, send, mobile);
    const panes = { evolve: evolvePane, timeline: timelinePane } as const;
    const tabButtons: Record<string, HTMLButtonElement> = {};
    const select = (which: keyof typeof panes): void => {
      for (const [k, pane] of Object.entries(panes)) {
        pane.style.display = k === which ? 'block' : 'none';
        const b = tabButtons[k]!;
        b.style.background = k === which ? 'rgba(138,180,248,0.25)' : 'rgba(255,255,255,0.06)';
        b.style.borderColor = k === which ? 'rgba(138,180,248,0.8)' : 'rgba(255,255,255,0.18)';
      }
    };
    for (const [k, label] of [
      ['evolve', 'Evolve'],
      ['timeline', 'Timeline'],
    ] as const) {
      tabButtons[k] = this.button(label, BUTTON_CSS + 'flex:1 1 0;', () => select(k));
      tabs.append(tabButtons[k]);
    }
    select('evolve');

    root.append(header, tabs, evolvePane, timelinePane);
    document.body.append(root);
    this.root = root;
  }

  private button(text: string, css: string, onClick: () => void): HTMLButtonElement {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = text;
    b.style.cssText = css;
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      onClick();
    });
    return b;
  }

  private checkbox(
    text: string,
    onChange: (v: boolean) => void,
  ): { label: HTMLLabelElement; input: HTMLInputElement } {
    const label = document.createElement('label');
    label.style.cssText = 'display:flex;align-items:center;gap:4px;cursor:pointer;';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.style.cssText = 'accent-color:#8ab4f8;';
    input.addEventListener('change', () => onChange(input.checked));
    label.append(input, document.createTextNode(text));
    return { label, input };
  }

  private secondsInput(value: number, title: string, onCommit: (v: number) => void): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'number';
    input.inputMode = 'decimal';
    input.min = '0';
    input.max = '600';
    input.step = '0.5';
    input.value = String(Number(value.toFixed(2)));
    input.title = title;
    input.style.cssText = NUMBER_CSS;
    input.addEventListener('change', () => {
      const v = Number(input.value);
      if (Number.isFinite(v)) onCommit(v);
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') input.blur();
    });
    return input;
  }

  private rebuildList(view: MorphView): void {
    const list = this.list;
    if (list === null) return;
    const send = this.opts.send;
    list.textContent = '';
    this.rows = [];

    if (view.keyframes.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = MUTED + 'padding:10px 4px;line-height:1.45;';
      empty.textContent =
        'No keyframes yet. Find a state you love, press “Add current state”, ' +
        'mutate your way somewhere new, add again — then press Play.';
      list.append(empty);
      return;
    }

    const n = view.keyframes.length;
    view.keyframes.forEach((k, i) => {
      const row = document.createElement('div');
      row.style.cssText = ROW_CSS;

      const name = this.button(`${i + 1}. ${k.name}`, BUTTON_CSS + 'flex:1 1 90px;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;', () =>
        send({ kind: 'morphJump', key: k.key }),
      );
      name.title = k.generated
        ? 'Show this keyframe. Its rule is generated from the seed, so it will cut rather than blend.'
        : 'Show this keyframe';
      if (k.generated) name.textContent += ' ⚡';

      const holdWrap = document.createElement('span');
      holdWrap.style.cssText = 'display:flex;align-items:center;gap:3px;' + MUTED;
      holdWrap.append(
        document.createTextNode('hold'),
        this.secondsInput(k.hold, 'Seconds to stay on this keyframe', (v) =>
          send({ kind: 'morphSetTiming', key: k.key, hold: v }),
        ),
      );

      const hasNext = n > 1 && (i < n - 1 || view.loop);
      const morphWrap = document.createElement('span');
      morphWrap.style.cssText =
        'display:flex;align-items:center;gap:3px;' + MUTED + (hasNext ? '' : 'visibility:hidden;');
      morphWrap.append(
        document.createTextNode(i === n - 1 ? '→ 1' : '→'),
        this.secondsInput(k.duration, 'Seconds to morph into the next keyframe', (v) =>
          send({ kind: 'morphSetTiming', key: k.key, duration: v }),
        ),
      );

      const tools = document.createElement('span');
      tools.style.cssText = 'display:flex;gap:3px;margin-left:auto;';
      const up = this.button('↑', ICON_CSS, () => send({ kind: 'morphMove', key: k.key, delta: -1 }));
      up.disabled = i === 0;
      up.title = 'Move earlier';
      const down = this.button('↓', ICON_CSS, () =>
        send({ kind: 'morphMove', key: k.key, delta: 1 }),
      );
      down.disabled = i === n - 1;
      down.title = 'Move later';
      const replace = this.button('⟳', ICON_CSS, () => send({ kind: 'morphReplace', key: k.key }));
      replace.title = 'Replace this keyframe with the current state';
      const remove = this.button('✕', ICON_CSS, () => send({ kind: 'morphRemove', key: k.key }));
      remove.title = 'Remove keyframe';
      for (const b of [up, down]) if (b.disabled) b.style.opacity = '0.35';
      tools.append(up, down, replace, remove);

      row.append(name, holdWrap, morphWrap, tools);
      list.append(row);
      this.rows.push(row);
    });
  }

  private syncCheckpoints(checkpoints: readonly CheckpointView[]): void {
    const select = this.checkpointSelect;
    if (select === null) return;
    const signature = checkpoints.map((c) => `${c.key}:${c.name}`).join(',');
    if (signature === this.checkpointSignature) return;
    this.checkpointSignature = signature;
    select.textContent = '';
    const head = document.createElement('option');
    head.value = '';
    head.textContent = checkpoints.length === 0 ? 'No checkpoints (C)' : '+ Add checkpoint…';
    select.append(head);
    for (const c of checkpoints) {
      const o = document.createElement('option');
      o.value = String(c.key);
      o.textContent = c.name;
      select.append(o);
    }
    select.disabled = checkpoints.length === 0;
    select.style.opacity = checkpoints.length === 0 ? '0.5' : '1';
  }

  /** Per-frame. Cheap unless the keyframe list itself changed. */
  refresh(status: Status): void {
    if (!this.shown || this.root === null) return;
    this.evolve?.refresh(status);
    const view = status.morph;

    const signature =
      `${view.loop}|` +
      view.keyframes.map((k) => `${k.key}:${k.name}:${k.hold}:${k.duration}:${k.generated}`).join(',');
    if (signature !== this.listSignature) {
      // Never rebuild under a focused input -- it would eat what is being typed.
      const active = document.activeElement;
      const typing = active instanceof HTMLInputElement && this.list?.contains(active) === true;
      if (!typing) {
        this.listSignature = signature;
        this.rebuildList(view);
      }
    }
    this.syncCheckpoints(status.checkpoints);

    this.rows.forEach((row, i) => {
      const current = i === view.segment;
      row.style.borderColor = current ? 'rgba(138,180,248,0.7)' : 'transparent';
    });

    if (this.playButton !== null) {
      const playing = view.playing ? '1' : '0';
      if (this.playButton.dataset['playing'] !== playing) {
        this.playButton.dataset['playing'] = playing;
        this.playButton.textContent = view.playing ? '■ Stop' : '▶ Play';
      }
      const disabled = view.keyframes.length === 0;
      this.playButton.disabled = disabled;
      this.playButton.style.opacity = disabled ? '0.5' : '1';
    }
    if (this.scrub !== null) {
      this.scrub.max = String(Math.max(0.01, view.total));
      if (!this.scrubbing) this.scrub.value = String(view.time);
    }
    if (this.timeLabel !== null) {
      this.timeLabel.textContent = `${fmt(view.time)} / ${fmt(view.total)}`;
    }
    if (this.loopBox !== null) this.loopBox.checked = view.loop;
    if (this.resetBox !== null) this.resetBox.checked = view.resetOnPlay;
    if (this.easingSelect !== null && document.activeElement !== this.easingSelect) {
      this.easingSelect.value = view.easing;
    }
  }
}

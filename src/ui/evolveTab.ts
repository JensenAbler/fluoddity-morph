/**
 * The Evolve tab of the Evolve & Morph window.
 *
 * Start/stop the evolver, ♥ what you like (it joins the attractor pool), shape
 * the speed distribution, set the leash, and curate the pool. Reads
 * `Status.evolve` each frame and sends `evolve*` commands -- no simulation
 * state lives here.
 */

import type { Command, Status } from '../orchestrator/commands.ts';
import {
  type EvolveSettings,
  type GeneFamily,
  GENE_COUNT,
  geneFamily,
  geneLabel,
} from '../evolve/evolve.ts';

const BUTTON =
  'background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.18);' +
  'color:#e8e8ea;border-radius:4px;padding:3px 8px;font:inherit;cursor:pointer;' +
  'touch-action:manipulation;';
const ICON = BUTTON + 'padding:2px 6px;min-width:24px;';
const PRIMARY =
  BUTTON + 'background:#8ab4f8;color:#111;border-color:#8ab4f8;font-weight:600;min-width:84px;';
const LIKE =
  BUTTON + 'background:rgba(244,114,182,0.18);border-color:rgba(244,114,182,0.7);font-weight:600;';
const MUTED = 'color:rgba(232,232,234,0.6);';
const SECTION = 'margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.08);';

const FAMILY_COLORS: Record<GeneFamily, string> = {
  rule: '#a78bfa',
  physics: '#22d3ee',
  color: '#f472b6',
  trail: '#86efac',
};

interface SliderSpec {
  readonly key: keyof EvolveSettings;
  readonly label: string;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly unit?: string;
  readonly title: string;
}

const SPEED_SLIDERS: readonly SliderSpec[] = [
  { key: 'minSeconds', label: 'fastest', min: 1, max: 60, step: 1, unit: 's', title: 'Seconds for the quickest gene to reach a new target' },
  { key: 'maxSeconds', label: 'slowest', min: 10, max: 600, step: 5, unit: 's', title: 'Seconds for the slowest gene' },
  { key: 'skew', label: 'skew', min: -1, max: 1, step: 0.05, title: 'Left crowds genes toward fast, right toward slow' },
  { key: 'colorSeconds', label: 'color pace', min: 30, max: 900, step: 10, unit: 's', title: 'Seconds for colors to settle on a new favorite. Higher = calmer color' },
  { key: 'fluidSeconds', label: 'fluidity', min: 20, max: 900, step: 10, unit: 's', title: 'Fluid mode: how long a gene takes to change speed. Lower = the distribution morphs faster' },
];

const LEASH_SLIDERS: readonly SliderSpec[] = [
  { key: 'breathSeconds', label: 'breath', min: 10, max: 180, step: 5, unit: 's', title: 'Breathe mode: seconds for one breath of mutation out and back' },
  { key: 'breathPeak', label: 'breath peak', min: 0.5, max: 6, step: 0.25, title: 'Breathe mode: how far an ordinary breath takes the mutation' },
  { key: 'bigPeak', label: 'big peak', min: 2, max: 20, step: 0.5, title: 'Breathe mode: how far a big breath takes it, at the top of which it hops to another favorite' },
  { key: 'bigEvery', label: 'big every', min: 0, max: 10, step: 1, title: 'Breathe mode: every how many breaths is a big one that hops (0 = stay on this favorite)' },
  { key: 'orbit', label: 'orbit', min: 0, max: 1, step: 0.05, title: 'Breathe mode: 0 = every breath comes back exactly to the favorite. Higher = the next breath starts before the last one ends, so the way from one mutation to the next swings past the favorite (1 = straight across, mutation to mutation)' },
  { key: 'coherence', label: 'coherence', min: 0, max: 1, step: 0.05, title: 'High: genes mostly orbit the focus favorite (whole creatures). Low: genes from different favorites recombine' },
  { key: 'ruleWander', label: 'rule wander', min: 0, max: 0.8, step: 0.01, title: 'Random jitter on top of exploration, in units of your favorites own spread' },
  { key: 'settingWander', label: 'setting wander', min: 0, max: 0.3, step: 0.005, title: 'How far sensor/force/color/trail settings may stray, as a fraction of slider range' },
  { key: 'exploration', label: 'exploration', min: 0, max: 1, step: 0.05, title: '0: only ever your favorites. Middle: anywhere between two favorites. High: past them, into what you have not seen' },
  { key: 'focusSeconds', label: 'focus', min: 5, max: 180, step: 5, unit: 's', title: 'Seconds the drift stays centred on one favorite before turning toward another' },
  { key: 'familyHop', label: 'family hops', min: 0, max: 1, step: 0.05, title: 'Chance that a change of focus jumps to a different physics family. Hops are quick and deliberate; between hops the drift stays within one family' },
  { key: 'strideSeconds', label: 'stride', min: 5, max: 180, step: 5, unit: 's', title: 'Seconds for the drift to travel from one favorite to the other. Longer = more committed, slower journeys' },
  { key: 'linger', label: 'linger', min: 0, max: 1, step: 0.05, title: 'Path mode: 0 = constant speed between favorites. Higher = more time AT each favorite and a quicker crossing between them' },
];

function fmt(v: number, step: number, unit = ''): string {
  const digits = step >= 1 ? 0 : step >= 0.1 ? 1 : step >= 0.01 ? 2 : 3;
  return `${v.toFixed(digits)}${unit}`;
}

export class EvolveTab {
  private readonly send: (command: Command) => void;
  private readonly status: HTMLElement;
  private readonly startButton: HTMLButtonElement;
  private readonly likeButton: HTMLButtonElement;
  private readonly restartBox: HTMLInputElement;
  private readonly chart: HTMLCanvasElement;
  private readonly modeSelect: HTMLSelectElement;
  private readonly motionSelect: HTMLSelectElement;
  private readonly sliders = new Map<keyof EvolveSettings, { input: HTMLInputElement; value: HTMLElement; spec: SliderSpec }>();
  private readonly list: HTMLElement;
  private listSignature = '';
  private readonly driftButton: HTMLButtonElement;
  private readonly driftRate: HTMLInputElement;
  private readonly driftRateValue: HTMLElement;
  private readonly driftScale: HTMLElement;
  private rows = new Map<number, HTMLElement>();

  constructor(host: HTMLElement, send: (command: Command) => void, mobile: boolean) {
    this.send = send;

    this.status = document.createElement('div');
    this.status.style.cssText = MUTED + 'margin-bottom:6px;min-height:1.2em;';

    // --- transport ------------------------------------------------------------
    const transport = document.createElement('div');
    transport.style.cssText = 'display:flex;align-items:center;gap:8px;flex-wrap:wrap;';
    this.startButton = this.button('▶ Evolve', PRIMARY, () => {
      const running = this.startButton.dataset['running'] === '1';
      send(running ? { kind: 'evolveStop' } : { kind: 'evolveStart', restart: this.restartBox.checked });
    });
    this.likeButton = this.button('♥ Like', LIKE, () => {
      send({ kind: 'evolveLike' });
      this.likeButton.animate?.(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }],
        { duration: 260 },
      );
    });
    this.likeButton.title = 'Add what is on screen to the attractors (L)';
    const restart = document.createElement('label');
    restart.style.cssText = 'display:flex;align-items:center;gap:4px;cursor:pointer;' + MUTED;
    this.restartBox = document.createElement('input');
    this.restartBox.type = 'checkbox';
    this.restartBox.style.cssText = 'accent-color:#8ab4f8;';
    restart.append(this.restartBox, document.createTextNode('restart sim'));
    restart.title = 'Reset the particles when evolving starts';
    transport.append(this.startButton, this.likeButton, restart);
    this.motionSelect = document.createElement('select');
    this.motionSelect.style.cssText = BUTTON;
    this.motionSelect.title =
      'Path: the whole creature walks to each favorite, arrives, and moves straight on. Leash: each part chases on its own spring and favorites are only passed near.';
    for (const [v, l] of [
      ['path', 'Path — walk through favorites'],
      ['leash', 'Leash — springs chase'],
      ['breathe', 'Breathe — mutate a favorite'],
    ] as const) {
      const o = document.createElement('option');
      o.value = v;
      o.textContent = l;
      this.motionSelect.append(o);
    }
    this.motionSelect.addEventListener('change', () =>
      send({
        kind: 'evolveSettings',
        settings: {
          motion:
            this.motionSelect.value === 'leash' ? 'leash' : this.motionSelect.value === 'breathe' ? 'breathe' : 'path',
        },
      }),
    );
    transport.append(this.motionSelect);

    // --- marks: verdicts for the server log --------------------------------
    const marks = document.createElement('div');
    marks.style.cssText = 'display:flex;align-items:center;gap:6px;margin-top:8px;flex-wrap:wrap;';
    const marksLabel = document.createElement('span');
    marksLabel.textContent = 'Mark this moment:';
    marksLabel.style.cssText = MUTED;
    const up = this.button('👍', ICON + 'font-size:1.1em;', () => send({ kind: 'logMark', mark: 'up' }));
    up.title = 'Log: this is good (Y)';
    const down = this.button('👎', ICON + 'font-size:1.1em;', () => send({ kind: 'logMark', mark: 'down' }));
    down.title = 'Log: this is bad (N)';
    const note = this.button('📝', ICON + 'font-size:1.1em;', () => {
      const text = window.prompt('What are you seeing?');
      if (text !== null && text.trim() !== '') send({ kind: 'logMark', mark: 'note', note: text });
    });
    note.title = 'Log a description of what is happening right now';
    marks.append(marksLabel, up, down, note);

    // --- mutation drift: the slider, automated and unbounded --------------
    const drift = document.createElement('div');
    drift.style.cssText = SECTION;
    const driftHead = document.createElement('div');
    driftHead.style.cssText = 'display:flex;align-items:center;gap:8px;flex-wrap:wrap;';
    const driftTitle = document.createElement('b');
    driftTitle.textContent = 'Mutation drift';
    this.driftButton = this.button('∞ Drift', PRIMARY, () => {
      const running = this.driftButton.dataset['running'] === '1';
      send({ kind: 'mutationDrift', running: !running });
    });
    this.driftButton.title =
      'Instead of evolving: push Mutation Scale up forever (0, 1, 2, 3...) at the rate below. Touch the mutation slider to stop.';
    this.driftScale = document.createElement('span');
    this.driftScale.style.cssText = 'font-variant-numeric:tabular-nums;' + MUTED;
    driftHead.append(driftTitle, this.driftButton, this.driftScale);
    const rateRow = document.createElement('label');
    rateRow.style.cssText = 'display:flex;align-items:center;gap:8px;margin-top:4px;';
    rateRow.title = 'How fast Mutation Scale climbs, per second';
    const rateName = document.createElement('span');
    rateName.textContent = 'rate';
    rateName.style.cssText = MUTED + 'flex:0 0 92px;';
    this.driftRate = document.createElement('input');
    this.driftRate.type = 'range';
    this.driftRate.min = '0.005';
    this.driftRate.max = '1';
    this.driftRate.step = '0.005';
    this.driftRate.style.cssText = 'flex:1 1 auto;min-width:60px;accent-color:#8ab4f8;';
    this.driftRateValue = document.createElement('span');
    this.driftRateValue.style.cssText =
      'flex:0 0 48px;text-align:right;font-variant-numeric:tabular-nums;' + MUTED;
    this.driftRate.addEventListener('input', () => {
      const v = Number(this.driftRate.value);
      this.driftRateValue.textContent = `${v.toFixed(3)}/s`;
      send({ kind: 'mutationDrift', rate: v });
    });
    rateRow.append(rateName, this.driftRate, this.driftRateValue);
    drift.append(driftHead, rateRow);

    // --- speeds ---------------------------------------------------------------
    const speeds = document.createElement('div');
    speeds.style.cssText = SECTION;
    const speedHead = document.createElement('div');
    speedHead.style.cssText = 'display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:4px;';
    const speedTitle = document.createElement('b');
    speedTitle.textContent = 'Speeds';
    this.modeSelect = document.createElement('select');
    this.modeSelect.style.cssText = BUTTON;
    for (const [v, l] of [
      ['fluid', 'Fluid — speeds drift'],
      ['static', 'Static — speeds fixed'],
    ] as const) {
      const o = document.createElement('option');
      o.value = v;
      o.textContent = l;
      this.modeSelect.append(o);
    }
    this.modeSelect.addEventListener('change', () =>
      send({
        kind: 'evolveSettings',
        settings: { mode: this.modeSelect.value === 'static' ? 'static' : 'fluid' },
      }),
    );
    const shuffle = this.button('Shuffle', BUTTON, () => send({ kind: 'evolveShuffleSpeeds' }));
    shuffle.title = 'Randomly reassign which genes are slow and which are fast';
    const layered = this.button('Layered', BUTTON, () => send({ kind: 'evolveLayeredSpeeds' }));
    layered.title = 'The phase-field arrangement: rule glacial, sensors slow, forces medium, color fast';
    speedHead.append(speedTitle, this.modeSelect, shuffle, layered);

    // The gene chart: one bar per gene, height = how slow it is right now.
    this.chart = document.createElement('canvas');
    this.chart.style.cssText = 'width:100%;height:64px;display:block;margin:6px 0 2px;';
    const legend = document.createElement('div');
    legend.style.cssText = MUTED + 'display:flex;gap:10px;flex-wrap:wrap;font-size:0.85em;';
    for (const [family, label] of [
      ['rule', 'rule'],
      ['physics', 'physics'],
      ['trail', 'trail'],
      ['color', 'color'],
    ] as const) {
      const span = document.createElement('span');
      span.innerHTML = `<span style="color:${FAMILY_COLORS[family]}">■</span> ${label}`;
      legend.append(span);
    }
    const legendNote = document.createElement('span');
    legendNote.textContent = '· taller = slower';
    legend.append(legendNote);
    speeds.append(speedHead, this.chart, legend);
    for (const spec of SPEED_SLIDERS) speeds.append(this.slider(spec));

    // --- leash ----------------------------------------------------------------
    const leash = document.createElement('div');
    leash.style.cssText = SECTION;
    const leashTitle = document.createElement('b');
    leashTitle.textContent = 'Leash';
    leash.append(leashTitle);
    for (const spec of LEASH_SLIDERS) leash.append(this.slider(spec));

    // --- pool -----------------------------------------------------------------
    const pool = document.createElement('div');
    pool.style.cssText = SECTION;
    const poolHead = document.createElement('div');
    poolHead.style.cssText = 'display:flex;align-items:center;justify-content:space-between;';
    const poolTitle = document.createElement('b');
    poolTitle.textContent = 'Attractors';
    const reset = this.button('Reset pool', BUTTON, () => {
      if (confirm('Forget every attractor and like, and re-seed from your saves?')) {
        send({ kind: 'evolveResetPool' });
      }
    });
    reset.style.fontSize = '0.85em';
    poolHead.append(poolTitle, reset);
    this.list = document.createElement('div');
    this.list.style.cssText = 'margin-top:4px;';
    pool.append(poolHead, this.list);

    host.append(this.status, transport, marks, drift, speeds, leash, pool);
    if (mobile) host.style.fontSize = '14px';
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

  private slider(spec: SliderSpec): HTMLElement {
    const row = document.createElement('label');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;margin-top:4px;';
    row.title = spec.title;
    const name = document.createElement('span');
    name.textContent = spec.label;
    name.style.cssText = MUTED + 'flex:0 0 92px;';
    const input = document.createElement('input');
    input.type = 'range';
    input.min = String(spec.min);
    input.max = String(spec.max);
    input.step = String(spec.step);
    input.style.cssText = 'flex:1 1 auto;min-width:60px;accent-color:#8ab4f8;';
    const value = document.createElement('span');
    value.style.cssText = 'flex:0 0 48px;text-align:right;font-variant-numeric:tabular-nums;' + MUTED;
    input.addEventListener('input', () => {
      const v = Number(input.value);
      value.textContent = fmt(v, spec.step, spec.unit);
      this.send({ kind: 'evolveSettings', settings: { [spec.key]: v } as Partial<EvolveSettings> });
    });
    row.append(name, input, value);
    this.sliders.set(spec.key, { input, value, spec });
    return row;
  }

  private rebuildList(status: Status): void {
    const send = this.send;
    this.list.textContent = '';
    this.rows.clear();
    const items = status.evolve.attractors;
    if (items.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = MUTED + 'padding:6px 2px;';
      empty.textContent = status.evolve.ready
        ? 'No attractors yet. Import your saves (Share > Import Saves) or ♥ something you like.'
        : '';
      this.list.append(empty);
      return;
    }
    for (const a of items) {
      const row = document.createElement('div');
      row.style.cssText =
        'display:flex;align-items:center;gap:6px;padding:4px 6px;margin:3px 0;border-radius:5px;' +
        'background:rgba(255,255,255,0.04);border:1px solid transparent;';
      const name = this.button(a.name, BUTTON + 'flex:1 1 auto;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;', () =>
        send({ kind: 'evolveShow', key: a.key }),
      );
      name.title = 'Stop evolving and show this one';
      const minus = this.button('−', ICON, () => send({ kind: 'evolveAdjustLikes', key: a.key, delta: -1 }));
      minus.title = 'Fewer likes. At ♥0 this one is muted: kept, but never visited';
      if (a.likes <= 0) name.style.opacity = '0.45';
      if (a.chill >= 15) {
        name.textContent = `❄ ${a.name}`;
        name.title = `Froze near here for ${String(a.chill)}s this session, so it is visited less. Stop evolving and show this one`;
      }
      const likes = document.createElement('span');
      likes.textContent = `♥${String(a.likes)}`;
      likes.style.cssText = 'min-width:30px;text-align:center;color:#f9a8d4;font-variant-numeric:tabular-nums;';
      const plus = this.button('+', ICON, () => send({ kind: 'evolveAdjustLikes', key: a.key, delta: 1 }));
      const remove = this.button('✕', ICON, () => {
        if (confirm(`Remove "${a.name}" from the attractors?`)) send({ kind: 'evolveRemove', key: a.key });
      });
      row.append(name, minus, likes, plus, remove);
      this.list.append(row);
      this.rows.set(a.key, row);
    }
  }

  private drawChart(ranks: readonly number[], progress: readonly number[]): void {
    const canvas = this.chart;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const ctx = canvas.getContext('2d');
    if (ctx === null) return;
    ctx.clearRect(0, 0, w, h);
    const n = GENE_COUNT;
    const gap = 2 * dpr;
    const bw = (w - gap * (n - 1)) / n;
    for (let i = 0; i < n; i++) {
      const rank = ranks[i] ?? 0.5;
      const x = i * (bw + gap);
      const bh = Math.max(2 * dpr, rank * (h - 6 * dpr));
      ctx.fillStyle = FAMILY_COLORS[geneFamily(i)];
      ctx.globalAlpha = 0.35;
      ctx.fillRect(x, h - bh, bw, bh);
      // Progress through the gene's current move, as a brighter fill.
      const p = progress[i];
      if (p !== undefined) {
        ctx.globalAlpha = 0.9;
        ctx.fillRect(x, h - bh * Math.min(1, p), bw, 2 * dpr);
      }
    }
    ctx.globalAlpha = 1;
    canvas.title = Array.from({ length: n }, (_, i) => geneLabel(i)).join(' · ');
  }

  refresh(status: Status): void {
    const ev = status.evolve;
    const near =
      ev.nearestName === '' ? '' : ` · nearest: ${ev.nearestName} (${ev.nearestDistance.toFixed(2)})`;
    this.status.textContent = !ev.ready
      ? 'Preparing attractors…'
      : !ev.running
        ? `${String(ev.attractors.length)} attractors · ♥ adds what you see`
        : `${ev.cold ? '❄ cold, hurrying through' : ev.hopping ? '⇄ hopping physics family' : `Drifting · ${Math.round(ev.temperature * 100)}% warm`} · focus: ${ev.focusName}${near}`;

    const running = ev.running ? '1' : '0';
    if (this.startButton.dataset['running'] !== running) {
      this.startButton.dataset['running'] = running;
      this.startButton.textContent = ev.running ? '■ Stop' : '▶ Evolve';
    }
    const canStart = ev.ready && ev.attractors.length > 0;
    this.startButton.disabled = !canStart && !ev.running;
    this.startButton.style.opacity = this.startButton.disabled ? '0.5' : '1';

    if (document.activeElement !== this.modeSelect) this.modeSelect.value = ev.settings.mode;
    if (document.activeElement !== this.motionSelect) this.motionSelect.value = ev.settings.motion;
    for (const { input, value, spec } of this.sliders.values()) {
      if (document.activeElement === input) continue;
      const v = ev.settings[spec.key] as number;
      input.value = String(v);
      value.textContent = fmt(v, spec.step, spec.unit);
    }
    const fluid = this.sliders.get('fluidSeconds');
    if (fluid !== undefined) fluid.input.disabled = ev.settings.mode === 'static';

    const signature = ev.attractors
      .map((a) => `${a.key}:${a.name}:${a.likes}:${a.chill >= 15 ? 'c' : ''}`)
      .join(',');
    if (signature !== this.listSignature) {
      this.listSignature = signature;
      this.rebuildList(status);
    }
    for (const [key, row] of this.rows) {
      row.style.borderColor = ev.running && key === ev.focusKey ? 'rgba(244,114,182,0.7)' : 'transparent';
    }

    this.drawChart(ev.ranks, ev.progress);

    const md = status.mutationDrift;
    const driftRunning = md.running ? '1' : '0';
    if (this.driftButton.dataset['running'] !== driftRunning) {
      this.driftButton.dataset['running'] = driftRunning;
      this.driftButton.textContent = md.running ? '■ Stop drift' : '∞ Drift';
    }
    this.driftScale.textContent = `scale ${md.scale.toFixed(3)}`;
    if (document.activeElement !== this.driftRate) {
      this.driftRate.value = String(md.rate);
      this.driftRateValue.textContent = `${md.rate.toFixed(3)}/s`;
    }
  }
}

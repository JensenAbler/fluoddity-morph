/**
 * THE EXPLORATION MAP HUD -- Breathe mode's journey, drawn from the evolver's
 * own record (`ExploreMapData`): a dot for every center, the live state's
 * whole path around each, and where it is now. Never pruned in a session.
 *
 * A corner card, kept on screen in immersive mode too. Tap to enlarge/shrink.
 * Redrawn at most ~15 times a second, and only when something moved.
 */

import type { EvolveView } from '../evolve/evolve.ts';

const SMALL = 170;
const LARGE = 340;
const FRAME_MS = 66;

export class ExploreMap {
  private readonly box: HTMLDivElement | null = null;
  private readonly canvas: HTMLCanvasElement | null = null;
  private big = false;
  private lastDraw = 0;
  private lastSig = '';

  constructor() {
    if (typeof document === 'undefined') return;
    const box = document.createElement('div');
    box.dataset['exploreMap'] = '';
    box.title = 'Exploration map: dots are centers (your likes), the line is every mutation visited. Tap to enlarge.';
    box.style.cssText =
      'position:fixed;left:12px;bottom:12px;z-index:40;display:none;border-radius:12px;' +
      'background:rgba(10,12,20,0.45);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);' +
      'cursor:pointer;line-height:0;user-select:none;';
    const canvas = document.createElement('canvas');
    box.append(canvas);
    box.addEventListener('click', () => {
      this.big = !this.big;
      this.lastSig = '';
      this.lastDraw = 0;
    });
    document.body.append(box);
    this.box = box;
    this.canvas = canvas;
  }

  refresh(ev: EvolveView): void {
    if (this.box === null || this.canvas === null) return;
    const m = ev.map;
    const show = ev.settings.motion === 'breathe' && m.centers.length > 0;
    this.box.style.display = show ? 'block' : 'none';
    if (!show) return;
    const now = performance.now();
    if (now - this.lastDraw < FRAME_MS) return;
    const sig = `${m.trail.length}|${m.at?.x ?? ''}|${m.at?.y ?? ''}|${m.centers.length}|${this.big ? 1 : 0}`;
    if (sig === this.lastSig) return;
    this.lastSig = sig;
    this.lastDraw = now;
    this.draw(ev);
  }

  private draw(ev: EvolveView): void {
    const canvas = this.canvas!;
    const m = ev.map;
    const css = this.big ? LARGE : SMALL;
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    if (canvas.width !== Math.round(css * dpr)) {
      canvas.width = Math.round(css * dpr);
      canvas.height = Math.round(css * dpr);
      canvas.style.width = `${css}px`;
      canvas.style.height = `${css}px`;
    }
    const ctx = canvas.getContext('2d');
    if (ctx === null) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, css, css);

    // Fit everything, but never zoom in past a couple of breaths across.
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    const t = m.trail;
    for (let i = 0; i < t.length; i += 2) {
      minX = Math.min(minX, t[i]!);
      maxX = Math.max(maxX, t[i]!);
      minY = Math.min(minY, t[i + 1]!);
      maxY = Math.max(maxY, t[i + 1]!);
    }
    for (const c of m.centers) {
      minX = Math.min(minX, c.x);
      maxX = Math.max(maxX, c.x);
      minY = Math.min(minY, c.y);
      maxY = Math.max(maxY, c.y);
    }
    const peak = Math.max(0.05, ev.mapPeak);
    const extent = Math.max(maxX - minX, maxY - minY, peak * 2.6) * 1.12;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const scale = (css - 12) / extent;
    const X = (x: number): number => css / 2 + (x - cx) * scale;
    const Y = (y: number): number => css / 2 - (y - cy) * scale;

    // The path: older journey dimmer, the recent stretch bright.
    const breaks = new Set(m.breaks);
    const n = t.length / 2;
    const recent = Math.max(0, n - 600);
    const stroke = (from: number, to: number, style: string, width: number): void => {
      if (to - from < 2) return;
      ctx.beginPath();
      for (let i = from; i < to; i++) {
        const x = X(t[i * 2]!);
        const y = Y(t[i * 2 + 1]!);
        if (i === from || breaks.has(i)) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = style;
      ctx.lineWidth = width;
      ctx.lineJoin = 'round';
      ctx.stroke();
    };
    stroke(0, recent + 1, 'rgba(138,180,248,0.35)', 1);
    stroke(recent, n, 'rgba(138,180,248,0.85)', 1.4);

    // Centers: every like (and each fresh start). The current one ringed.
    m.centers.forEach((c, i) => {
      const current = i === m.centers.length - 1;
      ctx.beginPath();
      ctx.arc(X(c.x), Y(c.y), current ? 4.5 : 3.2, 0, Math.PI * 2);
      ctx.fillStyle = '#f472b6';
      ctx.fill();
      if (current) {
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    });

    // Where it is right now.
    if (m.at !== null) {
      ctx.beginPath();
      ctx.arc(X(m.at.x), Y(m.at.y), 2.6, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  }
}

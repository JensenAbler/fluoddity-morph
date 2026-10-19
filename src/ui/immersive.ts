/**
 * Immersive mode: every piece of UI off the screen, just the simulation.
 *
 * `X` hides the side panels but deliberately keeps the mutation bar, and
 * `?nopanel` removes everything but only at load. This is the in-between: a
 * temporary, reversible "just the picture" that also asks the browser for real
 * fullscreen where it allows one (desktop, Android, iPad -- iPhone Safari does
 * not, so there it hides the UI and leaves Safari's own bars to the user).
 *
 * HOW IT HIDES: one class on <body> and one stylesheet rule that hides every
 * direct child of <body> except the canvas and the exit button. Every overlay in
 * this app (menu bar, side panels, mutation bar, toasts, tooltips, the Evolve &
 * Morph window) mounts on <body>, so nothing has to be told -- and anything
 * added later is hidden too, which is the right default for "hide all UI".
 *
 * THE WAY BACK is a small button in the bottom-right corner that fades out
 * after a moment and fades back in on any pointer movement or touch, plus
 * Escape. The canvas keeps receiving input, so pinch-zoom and pan still work.
 */

const STYLE_ID = 'fm-immersive-style';
const CLASS = 'fm-immersive';
const IDLE_MS = 2500;

const STYLE = `
body.${CLASS} > *:not(canvas):not([data-immersive-exit]) { display: none !important; }
[data-immersive-exit] {
  position: fixed; z-index: 1000; display: none;
  right: calc(env(safe-area-inset-right, 0px) + 12px);
  bottom: calc(env(safe-area-inset-bottom, 0px) + 12px);
  width: 40px; height: 40px; border-radius: 20px; padding: 0;
  align-items: center; justify-content: center;
  background: rgba(28,28,30,0.55); border: 1px solid rgba(255,255,255,0.18);
  color: #e8e8ea; cursor: pointer; touch-action: manipulation;
  transition: opacity 400ms ease; opacity: 1;
}
body.${CLASS} [data-immersive-exit] { display: flex; }
[data-immersive-exit].fm-idle { opacity: 0; }
`;

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Four corner brackets: "expand" when drawn outward, "collapse" inward. */
export function cornersIcon(outward = true, size = 16): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.style.display = 'block';
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute(
    'd',
    outward
      ? 'M1 5V1h4M11 1h4v4M15 11v4h-4M5 15H1v-4'
      : 'M5 1v4H1M15 5h-4V1M11 15v-4h4M1 11h4v4',
  );
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '1.6');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  svg.append(path);
  return svg;
}

export class Immersive {
  private active = false;
  private exitButton: HTMLButtonElement | null = null;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly onActivity = (): void => this.wake();
  private readonly onKey = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && this.active) {
      e.preventDefault();
      this.exit();
    }
  };
  private readonly onFullscreenChange = (): void => {
    // Leaving browser fullscreen by the browser's own gesture (Esc, swipe)
    // should bring the UI back too, or the user is left in a half-state.
    if (this.active && document.fullscreenElement === null && this.wentFullscreen) {
      this.exit();
    }
  };
  private wentFullscreen = false;

  get isActive(): boolean {
    return this.active;
  }

  toggle(): void {
    if (this.active) this.exit();
    else this.enter();
  }

  enter(): void {
    if (this.active) return;
    this.ensureBuilt();
    this.active = true;
    document.body.classList.add(CLASS);
    window.addEventListener('pointermove', this.onActivity, { passive: true });
    window.addEventListener('pointerdown', this.onActivity, { passive: true });
    window.addEventListener('touchstart', this.onActivity, { passive: true });
    window.addEventListener('keydown', this.onKey, true);
    document.addEventListener('fullscreenchange', this.onFullscreenChange);
    this.wake();
    // Real fullscreen where the browser offers it. Best effort: a refusal (or
    // iPhone, which has no element fullscreen) leaves the hidden-UI mode alone.
    this.wentFullscreen = false;
    const root = document.documentElement;
    if (document.fullscreenElement === null && typeof root.requestFullscreen === 'function') {
      root
        .requestFullscreen({ navigationUI: 'hide' })
        .then(() => {
          this.wentFullscreen = true;
        })
        .catch(() => {
          /* hidden UI is still the point */
        });
    }
  }

  exit(): void {
    if (!this.active) return;
    this.active = false;
    document.body.classList.remove(CLASS);
    window.removeEventListener('pointermove', this.onActivity);
    window.removeEventListener('pointerdown', this.onActivity);
    window.removeEventListener('touchstart', this.onActivity);
    window.removeEventListener('keydown', this.onKey, true);
    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
    if (this.idleTimer !== null) clearTimeout(this.idleTimer);
    this.idleTimer = null;
    if (this.wentFullscreen && document.fullscreenElement !== null) {
      void document.exitFullscreen().catch(() => {});
    }
    this.wentFullscreen = false;
  }

  dispose(): void {
    this.exit();
    this.exitButton?.remove();
    this.exitButton = null;
  }

  private wake(): void {
    const b = this.exitButton;
    if (b === null) return;
    b.classList.remove('fm-idle');
    if (this.idleTimer !== null) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => b.classList.add('fm-idle'), IDLE_MS);
  }

  private ensureBuilt(): void {
    if (document.getElementById(STYLE_ID) === null) {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = STYLE;
      document.head.append(style);
    }
    if (this.exitButton !== null) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset['immersiveExit'] = '';
    b.title = 'Show the UI again (Esc)';
    b.setAttribute('aria-label', 'Exit full screen');
    b.append(cornersIcon(false, 18));
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      this.exit();
    });
    document.body.append(b);
    this.exitButton = b;
  }
}

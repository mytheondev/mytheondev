const FINE_POINTER = "(pointer: fine) and (hover: hover)";
const REDUCE_MOTION = "(prefers-reduced-motion: reduce)";
const NARROW = "(max-width: 767px)";
const TABLET = "(max-width: 1023px)";

const MUTED = { r: 173, g: 174, b: 176 };
const BRAND = { r: 224, g: 237, b: 52 };

const BASE_ALPHA = 0.5;
const DOT_SIZE = 1.15;
const LERP = 0.15;
const MAX_WAVES = 2;
const MAX_DPR = 2;
const WAVE_DURATION = 750;
const WAVE_RADIUS = 320;
const WAVE_WIDTH = 48;
const SETTLE_PX = 0.4;
const SETTLE_HOVER = 0.5;

type Wave = {
  x: number;
  y: number;
  startedAt: number;
};

type Params = {
  gap: number;
  hoverRadius: number;
  hoverPeak: number;
  waveBoost: number;
};

const desktopParams = (): Params => ({
  gap: 32,
  hoverRadius: 140,
  hoverPeak: 0.13,
  waveBoost: 0.14,
});

const tabletParams = (): Params => ({
  gap: 40,
  hoverRadius: 120,
  hoverPeak: 0.1,
  waveBoost: 0.12,
});

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const canInteract = (fine: MediaQueryList, motion: MediaQueryList, narrow: MediaQueryList) =>
  fine.matches && !motion.matches && !narrow.matches;

export function initPageGrid(): void {
  const root = document.querySelector(".page-bg");
  const canvas = root?.querySelector("canvas.page-grid");
  if (!(root instanceof HTMLElement) || !(canvas instanceof HTMLCanvasElement)) return;

  const fine = window.matchMedia(FINE_POINTER);
  const motion = window.matchMedia(REDUCE_MOTION);
  const narrow = window.matchMedia(NARROW);
  const tablet = window.matchMedia(TABLET);

  let engine: ReturnType<typeof startEngine> | null = null;

  const sync = () => {
    if (canInteract(fine, motion, narrow)) {
      engine ??= startEngine(root, canvas, () =>
        tablet.matches ? tabletParams() : desktopParams(),
      );
      if (!engine) return;
      root.classList.add("is-interactive");
      engine.refresh();
      return;
    }

    root.classList.remove("is-interactive");
    engine?.destroy();
    engine = null;
  };

  sync();
  fine.addEventListener("change", sync);
  motion.addEventListener("change", sync);
  narrow.addEventListener("change", sync);
  tablet.addEventListener("change", sync);
}

function startEngine(
  root: HTMLElement,
  canvas: HTMLCanvasElement,
  readParams: () => Params,
): { refresh: () => void; destroy: () => void } | null {
  const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
  if (!ctx) return null;

  let params = readParams();
  let dpr = 1;
  let width = 0;
  let height = 0;
  let xs = new Float32Array(0);
  let ys = new Float32Array(0);
  let count = 0;

  let cursorX = 0;
  let cursorY = 0;
  let targetX = 0;
  let targetY = 0;
  let hoverAmount = 0;
  let targetHover = 0;
  let seeded = false;
  let raf = 0;
  let resizeRaf = 0;
  const waves: Wave[] = [];

  const stopLoop = () => {
    if (!raf) return;
    cancelAnimationFrame(raf);
    raf = 0;
  };

  const startLoop = () => {
    if (raf || document.hidden) return;
    raf = requestAnimationFrame(frame);
  };

  const rebuild = () => {
    const cols = Math.ceil(width / params.gap) + 1;
    const rows = Math.ceil(height / params.gap) + 1;
    const originX = (width - (cols - 1) * params.gap) / 2;
    const originY = (height - (rows - 1) * params.gap) / 2;

    count = cols * rows;
    xs = new Float32Array(count);
    ys = new Float32Array(count);

    let i = 0;
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        xs[i] = originX + col * params.gap;
        ys[i] = originY + row * params.gap;
        i += 1;
      }
    }
  };

  const resize = () => {
    params = readParams();
    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    width = root.clientWidth;
    height = root.clientHeight;
    if (width <= 0 || height <= 0) return;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    rebuild();
    paint(performance.now());
  };

  const scheduleResize = () => {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = 0;
      resize();
    });
  };

  const addWave = (x: number, y: number) => {
    if (waves.length >= MAX_WAVES) waves.shift();
    waves.push({ x, y, startedAt: performance.now() });
    startLoop();
  };

  const pruneWaves = (now: number) => {
    for (let i = waves.length - 1; i >= 0; i -= 1) {
      const wave = waves[i];
      if (wave && now - wave.startedAt >= WAVE_DURATION) waves.splice(i, 1);
    }
  };

  const waveAt = (x: number, y: number, now: number) => {
    let influence = 0;

    for (const wave of waves) {
      const progress = (now - wave.startedAt) / WAVE_DURATION;
      const eased = 1 - (1 - progress) * (1 - progress);
      const radius = eased * WAVE_RADIUS;
      const dist = Math.hypot(x - wave.x, y - wave.y);
      const ring = 1 - Math.abs(dist - radius) / WAVE_WIDTH;
      if (ring <= 0) continue;
      influence = Math.max(influence, ring * (1 - progress));
    }

    return influence;
  };

  const paint = (now: number) => {
    pruneWaves(now);
    ctx.clearRect(0, 0, width, height);

    const hoverR = params.hoverRadius;
    const hoverPeak = params.hoverPeak;
    const waveBoost = params.waveBoost;

    for (let i = 0; i < count; i += 1) {
      const x = xs[i];
      const y = ys[i];
      const dist = Math.hypot(x - cursorX, y - cursorY);
      const hoverT = dist >= hoverR ? 0 : (1 - dist / hoverR) ** 2;
      const hover = hoverT * hoverAmount;
      const wave = waveAt(x, y, now);
      const lit = clamp(hover + wave, 0, 1);
      const alpha = BASE_ALPHA + hover * hoverPeak + wave * waveBoost;
      if (alpha <= 0) continue;

      const r = MUTED.r + (BRAND.r - MUTED.r) * lit;
      const g = MUTED.g + (BRAND.g - MUTED.g) * lit;
      const b = MUTED.b + (BRAND.b - MUTED.b) * lit;
      const size = DOT_SIZE + lit * 0.6;

      ctx.fillStyle = `rgb(${r | 0} ${g | 0} ${b | 0} / ${alpha})`;
      ctx.fillRect(x - size / 2, y - size / 2, size, size);
    }
  };

  const settled = () =>
    waves.length === 0 &&
    Math.abs(cursorX - targetX) < SETTLE_PX &&
    Math.abs(cursorY - targetY) < SETTLE_PX &&
    Math.abs(hoverAmount - targetHover) < SETTLE_HOVER;

  const frame = (now: number) => {
    raf = 0;
    if (document.hidden) return;

    cursorX += (targetX - cursorX) * LERP;
    cursorY += (targetY - cursorY) * LERP;
    hoverAmount += (targetHover - hoverAmount) * LERP;
    paint(now);

    if (!settled()) startLoop();
  };

  const onPointerMove = (event: PointerEvent) => {
    targetX = event.clientX;
    targetY = event.clientY;
    targetHover = 1;
    if (!seeded) {
      cursorX = targetX;
      cursorY = targetY;
      seeded = true;
    }
    startLoop();
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0) return;
    targetX = event.clientX;
    targetY = event.clientY;
    if (!seeded) {
      cursorX = targetX;
      cursorY = targetY;
      seeded = true;
    }
    addWave(event.clientX, event.clientY);
  };

  const onPointerLeave = () => {
    targetHover = 0;
    startLoop();
  };

  const onVisibility = () => {
    if (document.hidden) {
      stopLoop();
      return;
    }
    if (!settled()) startLoop();
  };

  const observer = new ResizeObserver(scheduleResize);

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerdown", onPointerDown, { passive: true });
  document.documentElement.addEventListener("pointerleave", onPointerLeave);
  document.addEventListener("visibilitychange", onVisibility);
  observer.observe(root);
  resize();

  return {
    refresh: resize,
    destroy: () => {
      stopLoop();
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = 0;
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      ctx.clearRect(0, 0, width, height);
      canvas.width = 0;
      canvas.height = 0;
    },
  };
}

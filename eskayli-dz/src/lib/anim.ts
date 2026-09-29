// Deterministic animation math. Everything is a pure function of time (seconds),
// so every frame renders identically no matter the order or concurrency.
import { Easing } from "remotion";

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const invLerp = (a: number, b: number, v: number) => (b === a ? (v >= b ? 1 : 0) : clamp((v - a) / (b - a)));

// Motion language: BEFORE = snappy, overshooting, erratic. AFTER = long, precise, calm.
export const ease = {
  linear: (t: number) => t,
  outCubic: Easing.bezier(0.33, 1, 0.68, 1),
  inOutCubic: Easing.bezier(0.65, 0, 0.35, 1),
  outExpo: Easing.bezier(0.16, 1, 0.3, 1), // premium "settle"
  inExpo: Easing.bezier(0.7, 0, 0.84, 0),
  inOutExpo: Easing.bezier(0.87, 0, 0.13, 1),
  outQuint: Easing.bezier(0.22, 1, 0.36, 1),
  inCubic: Easing.bezier(0.32, 0, 0.67, 0),
  outBack: (t: number) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  outBackSoft: (t: number) => {
    const c1 = 1.1, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
};

/** Progress 0..1 of a window [t0, t0+dur] with easing. */
export const prog = (t: number, t0: number, dur: number, fn: (x: number) => number = ease.outExpo) =>
  fn(invLerp(t0, t0 + dur, t));

/** Tween a value between keyframes: [[time, value], ...] with one easing per segment. */
export const keys = (
  t: number,
  kf: Array<[number, number]>,
  fn: (x: number) => number = ease.inOutCubic,
) => {
  if (t <= kf[0][0]) return kf[0][1];
  for (let i = 0; i < kf.length - 1; i++) {
    const [ta, va] = kf[i];
    const [tb, vb] = kf[i + 1];
    if (t <= tb) return lerp(va, vb, fn(invLerp(ta, tb, t)));
  }
  return kf[kf.length - 1][1];
};

/** Damped spring (closed form, critically-damped-ish with overshoot). 0 -> 1. */
export const springy = (t: number, t0: number, { stiffness = 170, damping = 14, mass = 1 } = {}) => {
  const x = t - t0;
  if (x <= 0) return 0;
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * w0 * x) * (Math.cos(wd * x) + ((zeta * w0) / wd) * Math.sin(wd * x));
  }
  return 1 - Math.exp(-w0 * x) * (1 + w0 * x);
};

/** Seeded PRNG (mulberry32) so "random" layouts are identical on every frame. */
export const rng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
  return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
};

/** Smooth deterministic wobble in [-1, 1] (sum of sines) for handheld/jitter. */
export const wobble = (t: number, seed = 0, speed = 1) =>
  (Math.sin(t * 2.1 * speed + seed * 1.7) * 0.6 + Math.sin(t * 3.7 * speed + seed * 2.9) * 0.3 +
    Math.sin(t * 7.3 * speed + seed * 0.3) * 0.1);

/** Numeric velocity (units/second) of a time function, for motion blur. */
export const velocity = (fn: (t: number) => number, t: number, dt = 1 / 60) => (fn(t) - fn(t - dt)) / dt;

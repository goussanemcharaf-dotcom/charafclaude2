import React from "react";
import { AbsoluteFill } from "remotion";
import { color } from "../../../styles/tokens";
import { MUSIC, beatPulse, buildProgress, Hit } from "../../music";
import { clamp, ease, rng } from "./anim";
import { starPath } from "./Shapes";

// Energy layer, driven by config/music.json so every effect lands on the sound:
// - Camera: beat punches on the kicks, a short shake + zoom punch on each hit, a slow
//   zoom creep through each build (released by the drop).
// - Flash, Shockwaves, Burst (brand-star particles): only on the drops, the CTA and the send.
// - GlitchFilter: RGB split + sliced displacement, only on the chaos glitches.
// - LightSweep: a glint across a pill.
// Used sparingly on purpose: the drops must feel like events, not like a template.

const SHAKE: Record<Hit["kind"], number> = { hook: 9, section: 7, drop: 16, cta: 11, final: 8 };
const PUNCH: Record<Hit["kind"], number> = { hook: 0.07, section: 0.02, drop: 0.055, cta: 0.035, final: 0.025 };

export const cameraAt = (t: number) => {
  let scale = beatPulse(t) * (t >= MUSIC.start_b ? 0.012 : 0.006);
  let dx = 0, dy = 0, rot = 0;
  for (const h of MUSIC.hits) {
    const dt = t - h.t;
    if (dt < 0 || dt > 0.6) continue;
    const env = Math.exp(-dt / 0.11);
    const a = SHAKE[h.kind];
    dx += a * env * Math.sin(dt * 2 * Math.PI * 17 + h.t * 7);
    dy += a * env * Math.cos(dt * 2 * Math.PI * 13 + h.t * 3);
    rot += 0.35 * (a / 16) * env * Math.sin(dt * 2 * Math.PI * 11 + h.t);
    scale += PUNCH[h.kind] * (1 - ease.outCubic(clamp(dt / 0.35)));
  }
  const b = buildProgress(t);
  scale += 0.035 * b * b;
  // never show the frame's edge: cover the shake and the rotation with a little extra zoom
  const cover = (2 * Math.max(Math.abs(dx), Math.abs(dy))) / 1080 + Math.abs(rot) * 0.035;
  return { dx, dy, rot, scale: 1 + scale + cover };
};

export const Camera: React.FC<{ t: number; children: React.ReactNode }> = ({ t, children }) => {
  const c = cameraAt(t);
  return (
    <AbsoluteFill style={{ transform: `translate(${c.dx.toFixed(2)}px, ${c.dy.toFixed(2)}px) rotate(${c.rot.toFixed(3)}deg) scale(${c.scale.toFixed(4)})`, transformOrigin: "540px 960px" }}>
      {children}
    </AbsoluteFill>
  );
};

const FLASH: Partial<Record<Hit["kind"], [number, string]>> = { drop: [0.55, "#F4EFFF"], cta: [0.4, "#FFFFFF"], final: [0.22, "#FFFFFF"] };

export const Flash: React.FC<{ t: number }> = ({ t }) => {
  let o = 0, col = "#FFFFFF";
  for (const h of MUSIC.hits) {
    const f = FLASH[h.kind];
    const dt = t - h.t;
    if (!f || dt < 0 || dt > 0.3) continue;
    const v = f[0] * Math.exp(-dt / 0.055);
    if (v > o) [o, col] = [v, f[1]];
  }
  return o < 0.01 ? null : <AbsoluteFill style={{ background: col, opacity: o }} />;
};

export type Wave = { t: number; x: number; y: number; stroke: string; r0: number; r1: number; width: number };

/** Two thin rings racing out from an impact point. */
export const Shockwaves: React.FC<{ t: number; waves: Wave[] }> = ({ t, waves }) => (
  <AbsoluteFill>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {waves.flatMap((w, i) =>
        [0, 0.08].map((delay, j) => {
          const p = clamp((t - w.t - delay) / 0.65);
          if (p <= 0 || p >= 1) return null;
          const r = w.r0 + (w.r1 - w.r0) * ease.outExpo(p);
          return (
            <circle key={`${i}-${j}`} cx={w.x} cy={w.y} r={r} fill="none" stroke={w.stroke}
              strokeWidth={w.width * (1 - p) ** 1.2 * (j ? 0.6 : 1)} opacity={(1 - p) ** 1.6 * 0.9} />
          );
        }),
      )}
    </svg>
  </AbsoluteFill>
);

const STAR_D = starPath(50);

/** Burst of brand stars and dots (seeded, physically damped), from an impact point. */
export const Burst: React.FC<{
  t: number; t0: number; x: number; y: number; n: number; colors: string[]; seed: number; speed?: number; life?: number;
}> = ({ t, t0, x, y, n, colors, seed, speed = 1300, life = 0.9 }) => {
  const dt = t - t0;
  if (dt < 0 || dt > life) return null;
  const r = rng(seed);
  const k = 3.4; // drag
  const parts = Array.from({ length: n }, (_, i) => {
    const a = r() * Math.PI * 2;
    const v = speed * (0.45 + 0.75 * r());
    const size = 12 + 26 * r();
    const spin = (r() - 0.5) * 700;
    const star = r() < 0.65;
    const d = (v * (1 - Math.exp(-k * dt))) / k;
    return {
      x: x + Math.cos(a) * d, y: y + Math.sin(a) * d + 220 * dt * dt,
      s: size * (1 - 0.35 * (dt / life)) / 100, rot: spin * dt, star, c: colors[i % colors.length],
    };
  });
  const o = (1 - dt / life) ** 1.5;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {parts.map((p, i) =>
          p.star ? (
            <path key={i} d={STAR_D} fill={p.c} opacity={o} transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.rot.toFixed(1)}) scale(${(p.s * 2).toFixed(3)})`} />
          ) : (
            <circle key={i} cx={p.x} cy={p.y} r={p.s * 22} fill={p.c} opacity={o * 0.9} />
          ),
        )}
      </svg>
    </AbsoluteFill>
  );
};

/** 0..1 intensity of a chaos glitch at t (each lasts ~4 frames). */
export const glitchAt = (t: number) => {
  for (const g of MUSIC.glitches) if (t >= g && t < g + 0.13) return 1 - (t - g) / 0.13 * 0.5;
  return 0;
};

/** SVG filter defs for the glitch: sliced horizontal displacement + RGB split. Render once per frame. */
export const GlitchFilter: React.FC<{ t: number; id: string }> = ({ t, id }) => {
  const g = glitchAt(t);
  const frame = Math.round(t * 30);
  const split = 10 * g * (frame % 2 ? 1 : -1);
  return (
    <svg width={0} height={0} style={{ position: "absolute" }}>
      <filter id={id} x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0 0.02" numOctaves={1} seed={frame % 7} result="n" />
        <feComponentTransfer in="n" result="bands">
          <feFuncR type="discrete" tableValues="0.5 0.5 0.18 0.5 0.84 0.5 0.3 0.5" />
          <feFuncB type="linear" slope={0} intercept={0.5} />
        </feComponentTransfer>
        <feDisplacementMap in="SourceGraphic" in2="bands" scale={64 * g} xChannelSelector="R" yChannelSelector="B" result="d" />
        <feColorMatrix in="d" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
        <feOffset in="r" dx={split} dy={0} result="r2" />
        <feColorMatrix in="d" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
        <feColorMatrix in="d" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
        <feOffset in="b" dx={-split} dy={0} result="b2" />
        <feBlend in="r2" in2="g" mode="screen" result="rg" />
        <feBlend in="rg" in2="b2" mode="screen" />
      </filter>
    </svg>
  );
};

/** A glint crossing a (rounded) element; put it inside a position:relative parent. */
export const LightSweep: React.FC<{ t: number; at: number; dur?: number; radius?: number; opacity?: number }> = ({
  t, at, dur = 0.55, radius = 999, opacity = 0.75,
}) => {
  const p = (t - at) / dur;
  if (p <= 0 || p >= 1) return null;
  return (
    <div style={{ position: "absolute", inset: 0, borderRadius: radius, overflow: "hidden", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute", top: "-20%", bottom: "-20%", left: `${-50 + 170 * ease.inOutCubic(p)}%`, width: "38%",
          background: "linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)",
          opacity, transform: "skewX(-18deg)",
        }}
      />
    </div>
  );
};

export const FX_COLORS = {
  onViolet: ["#FFFFFF", color.lavender, color.lavenderSoft],
  onLight: [color.violet, color.violetBright, color.lavender],
};

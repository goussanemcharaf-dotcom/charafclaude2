import React from "react";
import { AbsoluteFill } from "remotion";
import { color, font } from "../lib/tokens";
import { clamp } from "../lib/anim";

/** Hairline 12-column grid of the "system" world. `o` = overall opacity; `flash` lights one column band. */
export const Grid: React.FC<{ o?: number; cols?: number; rows?: number; flash?: { col: number; a: number } }> = ({
  o = 1, cols = 12, rows = 20, flash,
}) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: o }}>
    <defs>
      <radialGradient id="gridFade" cx="50%" cy="46%" r="62%">
        <stop offset="0%" stopColor="#fff" stopOpacity="1" />
        <stop offset="70%" stopColor="#fff" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
      <mask id="gridMask">
        <rect width={1080} height={1920} fill="url(#gridFade)" />
      </mask>
    </defs>
    <g mask="url(#gridMask)" stroke="rgba(255,255,255,0.075)" strokeWidth={1}>
      {Array.from({ length: cols + 1 }, (_, i) => {
        const x = 60 + (i * 960) / cols;
        return <line key={`c${i}`} x1={x} y1={0} x2={x} y2={1920} />;
      })}
      {Array.from({ length: rows + 1 }, (_, i) => {
        const y = (i * 1920) / rows;
        return <line key={`r${i}`} x1={0} y1={y} x2={1080} y2={y} />;
      })}
    </g>
    {flash && flash.a > 0 && (
      <rect x={60 + (flash.col * 960) / cols} y={0} width={960 / cols} height={1920} fill={color.signal} opacity={0.06 * flash.a} />
    )}
  </svg>
);

/** Deterministic film grain (noise world). */
export const Grain: React.FC<{ t: number; o?: number }> = ({ t, o = 0.08 }) => {
  const seed = Math.floor(t * 24) % 16;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: o, mixBlendMode: "screen" }}>
      <filter id={`grain${seed}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width={1080} height={1920} filter={`url(#grain${seed})`} />
    </svg>
  );
};

export const Vignette: React.FC<{ o?: number }> = ({ o = 1 }) => (
  <AbsoluteFill
    style={{
      background: "radial-gradient(75% 55% at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.65) 100%)",
      opacity: o,
      pointerEvents: "none",
    }}
  />
);

/** Small mono metadata label (uppercase, tracked). */
export const Mono: React.FC<{ children: React.ReactNode; size?: number; c?: string; style?: React.CSSProperties }> = ({
  children, size = 22, c = color.mist, style,
}) => (
  <span
    style={{
      fontFamily: font.mono, fontSize: size, fontWeight: 500, letterSpacing: "0.08em",
      textTransform: "uppercase", color: c, whiteSpace: "nowrap", ...style,
    }}
  >
    {children}
  </span>
);

/** Status dot: accent when active; soft ring pulses with `pulse` (0..1 phase). */
export const Dot: React.FC<{ on?: boolean; size?: number; pulse?: number }> = ({ on = true, size = 14, pulse }) => (
  <span style={{ position: "relative", display: "inline-block", width: size, height: size, flex: "none" }}>
    {on && pulse !== undefined && (
      <span
        style={{
          position: "absolute", inset: -size * 0.9 * pulse, borderRadius: "50%",
          border: `2px solid ${color.signal}`, opacity: 0.6 * (1 - pulse),
        }}
      />
    )}
    <span
      style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: on ? color.signal : "transparent",
        border: on ? "none" : `2px solid ${color.mist2}`,
      }}
    />
  </span>
);

/** Rounded dark panel with hairline border (cards of the fictional tools). */
export const Panel: React.FC<{
  w: number; h?: number; children?: React.ReactNode; style?: React.CSSProperties; active?: number; pad?: number;
}> = ({ w, h, children, style, active = 0, pad = 28 }) => (
  <div
    style={{
      width: w, height: h, padding: pad, boxSizing: "border-box", borderRadius: 28,
      background: `linear-gradient(180deg, ${color.panel2} 0%, ${color.panel} 100%)`,
      border: `1.5px solid ${active > 0 ? `rgba(255,90,31,${0.2 + 0.6 * clamp(active)})` : color.line2}`,
      boxShadow: "0 40px 80px -30px rgba(0,0,0,0.75), 0 12px 24px -12px rgba(0,0,0,0.6)",
      fontFamily: font.sans, color: color.paper, position: "relative", overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Pill / chip. `tone`: "line" (outline), "solid" (paper), "signal" (accent). */
export const Pill: React.FC<{
  children: React.ReactNode; tone?: "line" | "solid" | "signal" | "ghost"; size?: number; style?: React.CSSProperties;
}> = ({ children, tone = "line", size = 30, style }) => {
  const tones = {
    line: { background: "rgba(255,255,255,0.03)", border: `1.5px solid ${color.line2}`, color: color.paper },
    solid: { background: color.paper, border: `1.5px solid ${color.paper}`, color: color.ink },
    signal: { background: color.signal, border: `1.5px solid ${color.signal}`, color: "#140700" },
    ghost: { background: "transparent", border: `1.5px dashed ${color.line2}`, color: color.mist },
  }[tone];
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: size * 0.4, padding: `${size * 0.42}px ${size * 0.8}px`,
        borderRadius: 999, fontFamily: font.sans, fontWeight: 600, fontSize: size, letterSpacing: "-0.01em",
        whiteSpace: "nowrap", ...tones, ...style,
      }}
    >
      {children}
    </span>
  );
};

/** Label / value row used inside panels. */
export const Field: React.FC<{ k: string; v: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({ k, v, size = 30, style }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, ...style }}>
    <Mono size={size * 0.72}>{k}</Mono>
    <span style={{ fontFamily: font.sans, fontSize: size, fontWeight: 600, color: color.paper, textAlign: "right" }}>{v}</span>
  </div>
);

/** Thin horizontal progress bar (no numbers: concept only). */
export const Bar: React.FC<{ p: number; w: number; h?: number; on?: boolean; style?: React.CSSProperties }> = ({
  p, w, h = 8, on = true, style,
}) => (
  <div style={{ width: w, height: h, borderRadius: h, background: "rgba(255,255,255,0.08)", overflow: "hidden", ...style }}>
    <div style={{ width: `${clamp(p) * 100}%`, height: "100%", borderRadius: h, background: on ? color.signal : color.mist }} />
  </div>
);

export const Center: React.FC<{ x: number; y: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  x, y, children, style,
}) => (
  <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)", ...style }}>{children}</div>
);

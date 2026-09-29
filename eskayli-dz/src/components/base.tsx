import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { color, font } from "../lib/tokens";
import { clamp } from "../lib/anim";

/** Hairline 12-column grid of the "system" world (pre-drawn, radially faded — utils/make_grain.py).
 *  `o` = overall opacity; `flash` lights one column band. */
export const Grid: React.FC<{ o?: number; flash?: { col: number; a: number } }> = ({ o = 1, flash }) => {
  if (o <= 0.001) return null;
  return (
    <AbsoluteFill style={{ opacity: o, pointerEvents: "none" }}>
      <Img src={staticFile("assets/grain/grid_1080x1920.png")} style={{ width: 1080, height: 1920 }} />
      {flash && flash.a > 0 && (
        <div style={{ position: "absolute", left: 60 + flash.col * 80, top: 0, width: 80, height: 1920, background: color.signal, opacity: 0.06 * flash.a }} />
      )}
    </AbsoluteFill>
  );
};

/** Film grain of the noise world. The lift it gives the blacks is a flat layer (free to encode); only a light,
 *  coarse grain rides on it — one noise tile at 2×, re-offset 24 times a second — so the texture survives Meta's
 *  re-encode instead of turning into compression noise. */
export const Grain: React.FC<{ t: number; o?: number }> = ({ t, o = 0.08 }) => {
  if (o <= 0.001) return null;
  const k = Math.floor(t * 24);
  const x = (k * 197) % 1024, y = (k * 331 + 101) % 1024;
  return (
    <>
      <AbsoluteFill style={{ opacity: o * 0.62, mixBlendMode: "screen", background: "rgb(128,128,128)", pointerEvents: "none" }} />
      <AbsoluteFill style={{ opacity: o * 0.45, mixBlendMode: "screen", pointerEvents: "none",
        backgroundImage: `url(${staticFile("assets/grain/grain_512.png")})`, backgroundRepeat: "repeat", backgroundSize: "1024px 1024px",
        backgroundPosition: `${x}px ${y}px` }} />
    </>
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

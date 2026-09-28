import React from "react";
import { color, font } from "../../../styles/tokens";
import { clamp } from "../motion/anim";

// "Build" progress per layer (0 = not yet built, 1 = final). Lets the ad show
// the portfolio assembling itself (grid -> nav -> type -> image -> work ...).
export type Build = {
  grid?: number; nav?: number; heroType?: number; heroImage?: number; heroCopy?: number;
  work?: number; rest?: number; guides?: number;
};
export const B = (b: Build | undefined, k: keyof Build) => clamp(b?.[k] ?? 1);

/** Fade + rise style for a build progress. */
export const rise = (p: number, dist = 34): React.CSSProperties => ({
  opacity: clamp(p * 1.4),
  transform: `translateY(${(1 - p) * dist}px)`,
});

/** Image mask reveal (bottom -> top). */
export const unmask = (p: number, radius = 18): React.CSSProperties => ({
  clipPath: `inset(${(1 - p) * 100}% 0 0 0 round ${radius}px)`,
});

/** Figma-like selection box with handles and a label tag (drawn in page px). */
export const Guide: React.FC<{
  x: number; y: number; w: number; h: number; label: string; o: number; side?: "top" | "bottom";
}> = ({ x, y, w, h, label, o, side = "top" }) => {
  if (o <= 0.01) return null;
  const hs = 11;
  const handles: Array<[number, number]> = [[x, y], [x + w, y], [x, y + h], [x + w, y + h]];
  return (
    <div style={{ position: "absolute", left: 0, top: 0, opacity: o, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: x, top: y, width: w, height: h, border: `2px solid ${color.violet}`, boxSizing: "border-box" }} />
      {handles.map(([hx, hy], i) => (
        <div key={i} style={{ position: "absolute", left: hx - hs / 2, top: hy - hs / 2, width: hs, height: hs, background: "#fff", border: `2px solid ${color.violet}`, boxSizing: "border-box" }} />
      ))}
      <div
        style={{
          position: "absolute", left: x, top: side === "top" ? y - 34 : y + h + 8, height: 26, padding: "0 10px",
          background: color.violet, color: "#fff", borderRadius: 6, fontFamily: font.mono, fontSize: 15, fontWeight: 500,
          display: "flex", alignItems: "center", whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
    </div>
  );
};

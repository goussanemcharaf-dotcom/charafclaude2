import React from "react";
import { color } from "../lib/tokens";
import { clamp } from "../lib/anim";

// The film's recurring object: one orange signal (the ad budget) and the routes it travels.

export type Pt = [number, number];

/** Point at arc-length fraction u (0..1) of a polyline. */
export const along = (pts: Pt[], u: number): Pt => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0) || 1;
  let d = clamp(u) * total;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) {
      const k = seg[i] ? Math.min(1, d / seg[i]) : 0;
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k];
    }
    d -= seg[i];
  }
  return pts[pts.length - 1];
};

export const polyLength = (pts: Pt[]) =>
  pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);

/** SVG path with rounded corners (radius r) through the points. */
export const roundedPath = (pts: Pt[], r = 18) => {
  if (pts.length < 3) return `M${pts.map((p) => p.join(",")).join(" L")}`;
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1], [cx, cy] = pts[i], [nx, ny] = pts[i + 1];
    const l1 = Math.hypot(cx - px, cy - py), l2 = Math.hypot(nx - cx, ny - cy);
    const rr = Math.min(r, l1 / 2, l2 / 2);
    const ax = cx - ((cx - px) / l1) * rr, ay = cy - ((cy - py) / l1) * rr;
    const bx = cx + ((nx - cx) / l2) * rr, by = cy + ((ny - cy) / l2) * rr;
    d += ` L${ax},${ay} Q${cx},${cy} ${bx},${by}`;
  }
  const last = pts[pts.length - 1];
  return `${d} L${last[0]},${last[1]}`;
};

/** A route drawn from 0 to `p` (0..1), with the signal at its head; `fade` dims the drawn trail. */
export const Route: React.FC<{
  pts: Pt[]; p: number; o?: number; width?: number; dashed?: boolean; base?: boolean; head?: boolean; r?: number; tone?: "signal" | "mist";
}> = ({ pts, p, o = 1, width = 3, dashed = false, base = true, head = true, r = 18, tone = "signal" }) => {
  const d = roundedPath(pts, r);
  const L = polyLength(pts) * 1.02;
  const [hx, hy] = along(pts, p);
  const c = tone === "signal" ? color.signal : color.mist;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: o }}>
      {base && <path d={d} stroke="rgba(255,255,255,0.10)" strokeWidth={width} fill="none" strokeDasharray={dashed ? "6 10" : undefined} strokeLinecap="round" />}
      <path d={d} stroke={c} strokeWidth={width} fill="none" strokeLinecap="round" strokeDasharray={`${L * clamp(p)} ${L}`} />
      {head && p > 0 && p < 1 && <SignalGlyph x={hx} y={hy} size={16} />}
    </svg>
  );
};

/** The signal itself as SVG: solid core + soft halo (no neon: a single subtle falloff). */
export const SignalGlyph: React.FC<{ x: number; y: number; size?: number; o?: number; ring?: number }> = ({
  x, y, size = 18, o = 1, ring,
}) => (
  <g opacity={o}>
    <circle cx={x} cy={y} r={size * 2.2} fill={color.signal} opacity={0.12} />
    {ring !== undefined && ring > 0 && ring < 1 && (
      <circle cx={x} cy={y} r={size * (1 + ring * 3.2)} fill="none" stroke={color.signal} strokeWidth={2} opacity={0.7 * (1 - ring)} />
    )}
    <circle cx={x} cy={y} r={size / 2} fill={color.signal} />
  </g>
);

/** Standalone signal (HTML layer), for use inside positioned layouts. */
export const Signal: React.FC<{ x: number; y: number; size?: number; o?: number; ring?: number }> = (p) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
    <SignalGlyph {...p} />
  </svg>
);

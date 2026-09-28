import React from "react";
import { color } from "../../../styles/tokens";
import { clamp, ease, prog } from "./anim";

// Graphic devices lifted from the reference's motion language, redrawn as
// original SVG: the soft 4-point star, viewfinder brackets, concentric rings,
// a drawn zigzag line and a light-bar sweep.

/** Soft 4-point star (superellipse with n < 1), centred on 0,0, radius R. */
export const starPath = (R = 100, n = 0.62, samples = 320) => {
  const e = 2 / n;
  const pts: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const a = (i / samples) * Math.PI * 2;
    const c = Math.cos(a), s = Math.sin(a);
    const x = R * Math.sign(c) * Math.pow(Math.abs(c), e);
    const y = R * Math.sign(s) * Math.pow(Math.abs(s), e);
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return `M${pts.join(" L")} Z`;
};

const STAR = starPath();

export const Star: React.FC<{
  size: number;
  stroke?: string;
  strokeWidth?: number; // in viewBox units (R = 100)
  fill?: string;
  fillOpacity?: number;
  draw?: number; // 0..1 stroke reveal
  rotate?: number;
  sx?: number;
  sy?: number;
  style?: React.CSSProperties;
}> = ({ size, stroke = color.violetBright, strokeWidth = 3.2, fill = "none", fillOpacity = 1, draw = 1, rotate = 0, sx = 1, sy = 1, style }) => (
  <svg
    viewBox="-120 -120 240 240"
    width={size}
    height={size}
    style={{ overflow: "visible", ...style }}
    aria-hidden
  >
    <g transform={`rotate(${rotate}) scale(${sx} ${sy})`}>
      <path
        d={STAR}
        fill={fill}
        fillOpacity={fillOpacity}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={draw < 1 ? "1 1" : undefined}
        strokeDashoffset={draw < 1 ? 1 - draw : undefined}
      />
    </g>
  </svg>
);

/** Viewfinder corner brackets around a box. */
export const Brackets: React.FC<{
  x: number; y: number; w: number; h: number; len?: number; stroke?: string; width?: number;
  opacity?: number; spread?: number;
}> = ({ x, y, w, h, len = 70, stroke = color.violet, width = 6, opacity = 1, spread = 0 }) => {
  const s = spread;
  const X0 = x - s, Y0 = y - s, X1 = x + w + s, Y1 = y + h + s;
  const d = [
    `M${X0},${Y0 + len} L${X0},${Y0} L${X0 + len},${Y0}`,
    `M${X1 - len},${Y0} L${X1},${Y0} L${X1},${Y0 + len}`,
    `M${X1},${Y1 - len} L${X1},${Y1} L${X1 - len},${Y1}`,
    `M${X0 + len},${Y1} L${X0},${Y1} L${X0},${Y1 - len}`,
  ].join(" ");
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity, overflow: "visible" }} aria-hidden>
      <path d={d} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/** Concentric rings that slowly flow outward (behind the phone, reference-style). */
export const Rings: React.FC<{
  t: number; cx: number; cy: number; count?: number; base?: number; gap?: number; stroke?: string;
  speed?: number; opacity?: number; width?: number;
}> = ({ t, cx, cy, count = 9, base = 160, gap = 95, stroke = color.violetBright, speed = 38, opacity = 1, width = 3 }) => {
  const off = (t * speed) % gap;
  const rings = Array.from({ length: count }, (_, i) => base + i * gap + off);
  const maxR = base + count * gap;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity }} aria-hidden>
      {rings.map((r, i) => {
        const fadeIn = clamp((r - base) / (gap * 0.8));
        const fadeOut = 1 - clamp((r - base) / (maxR - base));
        return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth={width} opacity={0.34 * fadeIn * fadeOut} />;
      })}
    </svg>
  );
};

/** A polyline that draws itself (dotted or solid). */
export const DrawLine: React.FC<{
  points: Array<[number, number]>; draw: number; stroke?: string; width?: number; dashed?: boolean; opacity?: number;
}> = ({ points, draw, stroke = color.violetBright, width = 6, dashed = false, opacity = 1 }) => {
  // Cumulative length so the reveal is uniform along the path.
  const seg = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  let remain = clamp(draw) * total;
  const out: Array<[number, number]> = [points[0]];
  for (let i = 0; i < seg.length && remain > 0; i++) {
    const k = Math.min(1, remain / seg[i]);
    const [ax, ay] = points[i], [bx, by] = points[i + 1];
    out.push([ax + (bx - ax) * k, ay + (by - ay) * k]);
    remain -= seg[i];
  }
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity }} aria-hidden>
      <polyline
        points={out.map((p) => p.join(",")).join(" ")}
        fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={dashed ? `0 ${width * 2.6}` : undefined}
      />
    </svg>
  );
};

/** White light bar sweeping across (the reference's bar wipe). */
export const LightBar: React.FC<{ t: number; at: number; dur?: number; y: number; h?: number; angle?: number }> = ({
  t, at, dur = 0.45, y, h = 46, angle = 0,
}) => {
  const p = prog(t, at, dur, ease.inOutCubic);
  if (p <= 0 || p >= 1) return null;
  const x = -1300 + p * 2600;
  return (
    <div
      style={{
        position: "absolute", left: x, top: y - h / 2, width: 1300, height: h,
        transform: `rotate(${angle}deg)`,
        background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, #fff 30%, #fff 70%, rgba(255,255,255,0) 100%)",
        boxShadow: "0 0 40px rgba(255,255,255,0.8)",
      }}
    />
  );
};

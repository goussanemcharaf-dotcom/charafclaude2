import React from "react";
import { AbsoluteFill } from "remotion";
import { keys, ease } from "../lib/anim";

// Virtual camera: keyframed pan / zoom / tilt over a layer. Transform origin is the frame
// centre, so `z` pushes in on the centre and `x`/`y` move the world (in px of the frame).

export type CamKey = [number, { x?: number; y?: number; z?: number; r?: number }];

export const camAt = (t: number, kf: CamKey[], fn = ease.inOutCubic) => {
  const pick = (k: "x" | "y" | "z" | "r", d: number) =>
    keys(t, kf.map(([tt, v]) => [tt, v[k] ?? d] as [number, number]), fn);
  return { x: pick("x", 0), y: pick("y", 0), z: pick("z", 1), r: pick("r", 0) };
};

export const Camera: React.FC<{ t: number; kf: CamKey[]; children: React.ReactNode; blurFrom?: number; fn?: (x: number) => number }> = ({
  t, kf, children, blurFrom = 0, fn,
}) => {
  const c = camAt(t, kf, fn);
  const c2 = camAt(t - 1 / 30, kf, fn);
  // motion blur proportional to camera speed (only on fast moves)
  const v = Math.hypot(c.x - c2.x, c.y - c2.y) + Math.abs(c.z - c2.z) * 900;
  const blur = v > 14 + blurFrom ? Math.min(6, (v - 14 - blurFrom) * 0.12) : 0;
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${c.x}px, ${c.y}px) scale(${c.z}) rotate(${c.r}deg)`,
        transformOrigin: "540px 960px",
        filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Depth layer: defocus (px blur) and dim — for rack-focus moments. */
export const Depth: React.FC<{ blur?: number; dim?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  blur = 0, dim = 0, children, style,
}) => (
  <AbsoluteFill style={{ filter: blur > 0.2 ? `blur(${blur}px)` : undefined, opacity: 1 - dim, ...style }}>{children}</AbsoluteFill>
);

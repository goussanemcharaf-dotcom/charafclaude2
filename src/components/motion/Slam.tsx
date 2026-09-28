import React from "react";
import { clamp, ease, invLerp, wobble } from "./anim";
import { MotionBlur } from "./MotionBlur";

// An element that slams into place with velocity-matched motion blur and a
// small settle, then idles with optional jitter (the "chaos" energy).
export type SlamProps = {
  t: number;
  at: number;
  x: number;
  y: number;
  rot?: number;
  from?: [number, number]; // offset the element travels from
  fromRot?: number;
  fromScale?: number;
  dur?: number;
  jitter?: number;
  seed?: number;
  out?: number; // time it leaves
  outTo?: [number, number];
  outDur?: number;
  z?: number;
  children: React.ReactNode;
};

const pose = (p: SlamProps, time: number) => {
  const { at, x, y, rot = 0, from = [0, -600], fromRot = 0, fromScale = 1, dur = 0.34, jitter = 0, seed = 0, out, outTo = [0, -1400], outDur = 0.35 } = p;
  const k = ease.outExpo(clamp(invLerp(at, at + dur, time)));
  let px = x + from[0] * (1 - k);
  let py = y + from[1] * (1 - k);
  let pr = rot + fromRot * (1 - k);
  let ps = fromScale + (1 - fromScale) * k;
  // settle bump right after impact
  const b = clamp(invLerp(at + dur * 0.55, at + dur * 1.6, time));
  ps *= 1 + Math.sin(b * Math.PI) * 0.035;
  if (jitter > 0 && time > at) {
    px += wobble(time, seed, 3.2) * jitter;
    py += wobble(time, seed + 7, 2.7) * jitter;
    pr += wobble(time, seed + 3, 2.2) * jitter * 0.35;
  }
  if (out !== undefined) {
    const q = ease.inExpo(clamp(invLerp(out, out + outDur, time)));
    px += outTo[0] * q;
    py += outTo[1] * q;
  }
  return { px, py, pr, ps };
};

export const Slam: React.FC<SlamProps> = (props) => {
  const { t, at, z } = props;
  if (t < at) return null;
  const a = pose(props, t);
  const b = pose(props, t - 1 / 60);
  const vx = (a.px - b.px) * 60;
  const vy = (a.py - b.py) * 60;
  const k = 0.012; // blur px per (px/s)
  return (
    <div style={{ position: "absolute", left: 0, top: 0, zIndex: z, transform: `translate(${a.px}px, ${a.py}px) rotate(${a.pr}deg) scale(${a.ps})`, transformOrigin: "50% 50%" }}>
      <MotionBlur x={Math.abs(vx) * k} y={Math.abs(vy) * k}>{props.children}</MotionBlur>
    </div>
  );
};

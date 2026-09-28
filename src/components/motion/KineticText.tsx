import React from "react";
import { color, font } from "../../../styles/tokens";
import { clamp, ease, invLerp, prog } from "./anim";
import { MotionBlur } from "./MotionBlur";

// Word-by-word kinetic type (the reference's signature move): each word
// slides in with a short directional smear, timed to its spoken word.

export type KWord = { text: string; at: number; style?: React.CSSProperties };
type Dir = "right" | "left" | "up" | "down";

const vec = (d: Dir): [number, number] =>
  d === "right" ? [1, 0] : d === "left" ? [-1, 0] : d === "up" ? [0, -1] : [0, 1];

export const KineticLine: React.FC<{
  t: number;
  words: KWord[];
  size: number;
  color?: string;
  family?: string;
  weight?: number;
  italic?: boolean;
  tracking?: string;
  gap?: string;
  from?: Dir;
  distance?: number;
  dur?: number;
  blur?: number;
  exit?: { at: number; dur?: number; to?: Dir; distance?: number; blur?: number };
  justify?: React.CSSProperties["justifyContent"];
  style?: React.CSSProperties;
}> = ({
  t, words, size, color: c = color.ink, family = font.display, weight = 800, italic = false,
  tracking = "-0.045em", gap = "0.24em", from = "right", distance = 110, dur = 0.5, blur = 26,
  exit, justify = "center", style,
}) => {
  const [fx, fy] = vec(from);
  let ex = 0, ey = 0, eo = 1, eb = 0;
  if (exit) {
    const [tx, ty] = vec(exit.to ?? "left");
    const d = exit.dur ?? 0.3;
    const p = prog(t, exit.at, d, ease.inExpo);
    const dist = exit.distance ?? 160;
    ex = tx * p * dist;
    ey = ty * p * dist;
    eo = 1 - clamp(invLerp(exit.at + d * 0.45, exit.at + d, t));
    eb = p * (exit.blur ?? 30);
  }
  return (
    <div
      style={{
        display: "flex", flexWrap: "nowrap", justifyContent: justify, alignItems: "baseline",
        columnGap: gap, fontFamily: family, fontWeight: weight, fontStyle: italic ? "italic" : "normal",
        fontSize: size, letterSpacing: tracking, lineHeight: 1, color: c, whiteSpace: "nowrap",
        transform: `translate(${ex}px, ${ey}px)`, opacity: eo, ...style,
      }}
    >
      {words.map((w, i) => {
        const p = prog(t, w.at, dur, ease.outExpo);
        const o = clamp(invLerp(w.at, w.at + 0.09, t)) * eo;
        const rest = 1 - p;
        const smear = Math.pow(rest, 1.4) * blur + eb;
        return (
          <MotionBlur
            key={i}
            x={Math.abs(fx) > 0 || exit?.to === "left" || exit?.to === "right" ? smear : 0}
            y={Math.abs(fy) > 0 || exit?.to === "up" || exit?.to === "down" ? smear : 0}
            style={{
              display: "inline-block",
              transform: `translate(${fx * rest * distance}px, ${fy * rest * distance}px)`,
              opacity: t < w.at ? 0 : o,
            }}
          >
            <span style={w.style}>{w.text}</span>
          </MotionBlur>
        );
      })}
    </div>
  );
};

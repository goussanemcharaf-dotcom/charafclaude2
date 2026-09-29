import React from "react";
import { color, font } from "../lib/tokens";
import { clamp, ease, invLerp, lerp } from "../lib/anim";

// Kinetic typography. Words rise out of a baseline mask on their cue (editorial, precise);
// a "ghost" word first appears at 35 % opacity with a slight blur, then solidifies on its
// second cue (the two-beat reveal from the reference grammar).

export type KWord = {
  text: string;
  at: number; // entrance time (s)
  solid?: number; // two-beat reveal: time the ghosted word solidifies
  accent?: boolean; // the one orange word
  dim?: boolean; // connector word in grey
  size?: number; // per-word size override
};

export const KineticLine: React.FC<{
  t: number; words: KWord[]; size?: number; weight?: number; align?: "center" | "left";
  out?: number; outDur?: number; lineHeight?: number; tracking?: string; gap?: number; style?: React.CSSProperties;
}> = ({ t, words, size = 96, weight = 800, align = "center", out, outDur = 0.35, lineHeight = 1.05, tracking = "-0.045em", gap, style }) => {
  const outP = out === undefined ? 0 : ease.inCubic(invLerp(out, out + outDur, t));
  return (
    <div
      style={{
        display: "flex", flexWrap: "wrap", justifyContent: align === "center" ? "center" : "flex-start",
        columnGap: gap ?? size * 0.26, rowGap: size * 0.02, fontFamily: font.sans, fontWeight: weight,
        letterSpacing: tracking, lineHeight, opacity: 1 - outP, filter: outP > 0 ? `blur(${outP * 10}px)` : undefined,
        transform: `translateY(${-outP * 40}px)`, ...style,
      }}
    >
      {words.map((w, i) => {
        const p = ease.outExpo(invLerp(w.at, w.at + 0.55, t));
        if (t < w.at - 0.001) return <span key={i} style={{ opacity: 0, fontSize: w.size ?? size }}>{w.text}</span>;
        const ghost = w.solid !== undefined && t < w.solid;
        const solidP = w.solid === undefined ? 1 : ease.outCubic(invLerp(w.solid, w.solid + 0.3, t));
        const c = w.accent ? color.signal : w.dim ? color.mist : color.paper;
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: (w.size ?? size) * 0.1, marginBottom: -(w.size ?? size) * 0.1 }}>
            <span
              style={{
                display: "inline-block", fontSize: w.size ?? size, color: c,
                transform: `translateY(${(1 - p) * 105}%)`,
                opacity: ghost ? 0.35 : lerp(0.35, 1, solidP) * clamp(p * 1.4),
                filter: ghost ? "blur(5px)" : solidP < 1 ? `blur(${(1 - solidP) * 5}px)` : undefined,
              }}
            >
              {w.text}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/** Split a text into KWords timed from a list of cue times (one per word). */
export const kw = (text: string, times: number[], opts: Partial<KWord>[] = []): KWord[] =>
  text.split(" ").map((w, i) => ({ text: w, at: times[Math.min(i, times.length - 1)], ...(opts[i] ?? {}) }));

/** Small mono label that types in (for system labels). */
export const TypeOn: React.FC<{ t: number; at: number; text: string; cps?: number; style?: React.CSSProperties; caret?: boolean }> = ({
  t, at, text, cps = 28, style, caret = false,
}) => {
  const n = Math.max(0, Math.min(text.length, Math.floor((t - at) * cps)));
  const blink = caret && Math.floor(t * 2.2) % 2 === 0 && n < text.length;
  return (
    <span style={{ whiteSpace: "pre", ...style }}>
      {text.slice(0, n)}
      {caret && <span style={{ opacity: blink || n < text.length ? 1 : 0, color: color.signal }}>▍</span>}
    </span>
  );
};

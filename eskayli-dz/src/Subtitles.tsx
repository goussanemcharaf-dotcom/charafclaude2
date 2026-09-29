import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FPS, color, font } from "./lib/tokens";
import { clamp, ease, invLerp } from "./lib/anim";
import captions from "../config/captions.json";

// Burned-in captions, rendered as their own transparent layer (ProRes 4444) and composited at
// export, so the clean and the captioned versions share the exact same picture.
// The film's kinetic typography already sets most of the narration word by word; this layer only
// speaks where the words are not on screen (see utils/build_captions.py). Same type language as
// the film: grey connectors, white key words, one orange accent — no box, no bounce. Each word
// brightens on its spoken syllable. One line, centred in the band just above Meta's bottom UI.

type CueWord = { w: string; start: number; kind: "dim" | "key" | "accent" };
type Cue = { start: number; end: number; words: CueWord[] };
const CUES = captions as Cue[];
const BAND_Y = 1452; // text centre line (bottom UI starts ~1500)

const Caption: React.FC<{ cue: Cue; t: number }> = ({ cue, t }) => {
  const inP = ease.outExpo(clamp(invLerp(cue.start, cue.start + 0.25, t)));
  const outP = ease.inCubic(clamp(invLerp(cue.end - 0.16, cue.end, t)));
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: BAND_Y, transform: `translateY(calc(-50% + ${(1 - inP) * 14}px))`,
      display: "flex", justifyContent: "center", flexWrap: "wrap", columnGap: 14, opacity: inP * (1 - outP),
      fontFamily: font.sans, fontSize: 50, lineHeight: 1.1, letterSpacing: "-0.02em",
      textShadow: "0 2px 14px rgba(0,0,0,0.9), 0 0 32px rgba(0,0,0,0.6)" }}>
      {cue.words.map((w, i) => {
        const said = ease.outCubic(clamp(invLerp(w.start - 0.02, w.start + 0.14, t)));
        const base = w.kind === "accent" ? color.signal : w.kind === "key" ? color.paper : color.mist;
        return (
          <span key={i} style={{ color: base, fontWeight: w.kind === "dim" ? 600 : 800, opacity: 0.3 + 0.7 * said, whiteSpace: "nowrap" }}>{w.w}</span>
        );
      })}
    </div>
  );
};

export const Subtitles: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const cue = CUES.find((c) => t >= c.start && t < c.end);
  return <AbsoluteFill style={{ backgroundColor: "transparent" }}>{cue && <Caption cue={cue} t={t} />}</AbsoluteFill>;
};

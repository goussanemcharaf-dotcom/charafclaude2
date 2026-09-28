import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { color, font, FPS } from "../styles/tokens";
import captions from "../config/captions.json";
import { clamp, ease, invLerp } from "./components/motion/anim";

// Designed captions, rendered as a separate transparent layer (ProRes 4444)
// and composited in the export step — so the clean and subtitled versions
// share the exact same picture. Word-by-word highlight follows the voice.
// Placed above Meta's bottom UI zone (pill bottom at y = 1486 < 1500).

type Cue = { text: string; start: number; end: number; words: Array<{ w: string; start: number }> };
const CUES = captions as Cue[];

export const CaptionBlock: React.FC<{ cue: Cue; t: number }> = ({ cue, t }) => {
  const inP = ease.outExpo(clamp(invLerp(cue.start, cue.start + 0.22, t)));
  const outP = clamp(invLerp(cue.end - 0.12, cue.end, t));
  return (
    <div
      style={{
        position: "absolute", left: 90, right: 90, bottom: 1920 - 1486, display: "flex", justifyContent: "center",
        opacity: inP * (1 - outP), transform: `translateY(${(1 - inP) * 18}px) scale(${0.96 + 0.04 * inP})`,
      }}
    >
      <div
        style={{
          maxWidth: 900, padding: "18px 30px 20px", borderRadius: 30, background: "rgba(11,11,18,0.78)",
          textAlign: "center", fontFamily: font.display, fontWeight: 650, fontSize: 52, lineHeight: 1.18,
          letterSpacing: "-0.02em", color: "#fff", boxShadow: "0 18px 40px -18px rgba(0,0,0,0.5)",
        }}
      >
        {cue.words.map((w, i) => {
          const next = cue.words[i + 1]?.start ?? cue.end;
          const active = t >= w.start && t < next;
          const said = t >= w.start;
          return (
            <span key={i} style={{ color: active ? color.lavender : "#fff", opacity: said ? 1 : 0.55 }}>
              {w.w}
              {i < cue.words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const Subtitles: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const cue = CUES.find((c) => t >= c.start && t < c.end);
  return <AbsoluteFill style={{ backgroundColor: "transparent" }}>{cue && <CaptionBlock cue={cue} t={t} />}</AbsoluteFill>;
};

/** Program + captions in one pass (preview / QA only; exports composite the layers). */
export const SubtitlesPreview: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill>
    {children}
    <Subtitles />
  </AbsoluteFill>
);

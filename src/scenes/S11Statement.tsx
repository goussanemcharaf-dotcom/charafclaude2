import React from "react";
import { Img } from "remotion";
import { color, font, shadow } from "../../styles/tokens";
import { cue } from "../timeline";
import { clamp, ease, invLerp, lerp, prog, springy } from "../components/motion/anim";
import { MotionBlur } from "../components/motion/MotionBlur";
import { img, pf, persona } from "../components/portfolio/data";
import { Fill, SceneProps } from "./shared";
import { S11_ZOOM } from "./S10Client";

// S11 — THE STATEMENT. "…professionnel, clair et différent." The portfolio's
// strongest section, full frame, editorial: the person, the name, and three
// words landing on the voice. The design breathes; nothing else moves.

const WORDS = [
  { text: "Professionnel.", at: cue("professionnel") - 0.03, y: 690 },
  { text: "Clair.", at: cue("clair") - 0.03, y: 818 },
  { text: "Différent.", at: cue("different") - 0.03, y: 946 },
];

export const S11Statement: React.FC<SceneProps> = ({ t }) => {
  const inP = prog(t, S11_ZOOM + 0.12, 0.5, ease.outExpo);
  const push = lerp(1.0, 1.07, clamp(invLerp(S11_ZOOM, 33.9, t)));
  const nameP = prog(t, S11_ZOOM + 0.3, 0.7, ease.outExpo);
  return (
    <Fill bg={pf.paper}>
      <div
        style={{
          position: "absolute", inset: 0, opacity: clamp(inP * 1.6), transform: `scale(${lerp(1.12, 1, inP)})`,
          filter: inP < 0.98 ? `blur(${(1 - inP) * 16}px)` : undefined,
        }}
      >
        {/* thin top rule with the placeholder domain, like the site header */}
        <div style={{ position: "absolute", left: 160, right: 160, top: 262, display: "flex", justifyContent: "space-between", fontFamily: pf.mono, fontSize: 24, color: pf.mute, letterSpacing: "0.06em" }}>
          <span>{persona.url}</span><span>UGC · VOICE OVER</span>
        </div>
        <div style={{ position: "absolute", left: 160, top: 310, width: 760, height: 900, borderRadius: 26, overflow: "hidden", boxShadow: shadow.card }}>
          <Img src={img.hero()} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 30%", transform: `scale(${push})` }} />
        </div>
        <div
          style={{
            position: "absolute", left: 104, top: 1128, fontFamily: pf.serif, fontSize: 176, lineHeight: 0.9, color: pf.ink, letterSpacing: "-0.03em",
            opacity: clamp(nameP * 1.5), transform: `translateY(${(1 - nameP) * 40}px)`,
          }}
        >
          Inès <span style={{ fontStyle: "italic" }}>Morel</span>
        </div>
      </div>
      {WORDS.map((w) => {
        if (t < w.at) return null;
        const k = ease.outExpo(clamp(invLerp(w.at, w.at + 0.45, t)));
        const s = springy(t, w.at, { stiffness: 330, damping: 17 });
        return (
          <div key={w.text} style={{ position: "absolute", left: 92, top: w.y, transform: `translateX(${(1 - k) * -260}px) scale(${0.75 + 0.25 * s})`, transformOrigin: "0% 50%" }}>
            <MotionBlur x={(1 - k) * 30}>
              <div
                style={{
                  display: "inline-flex", alignItems: "center", gap: 18, padding: "24px 40px 24px 30px", borderRadius: 999,
                  background: color.violet, color: "#fff", fontFamily: font.display, fontWeight: 800, fontSize: 68,
                  letterSpacing: "-0.045em", lineHeight: 1, boxShadow: "0 28px 60px -22px rgba(62,19,166,0.65)",
                }}
              >
                <div style={{ width: 22, height: 22, borderRadius: 11, background: color.lavender }} />
                {w.text}
              </div>
            </MotionBlur>
          </div>
        );
      })}
    </Fill>
  );
};

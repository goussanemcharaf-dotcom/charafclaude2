import React from "react";
import { bg, color, font, shadow } from "../../styles/tokens";
import { phraseWords } from "../timeline";
import { clamp, ease, invLerp, prog, springy } from "../components/motion/anim";
import { KineticLine } from "../components/motion/KineticText";
import { Star } from "../components/motion/Shapes";
import { IconLink, IconSend } from "../components/ui/Icons";
import { LightSweep } from "../components/motion/FX";
import { beatPulse } from "../music";
import { Fill, SceneProps } from "./shared";

// S12 — CTA (violet world). "TON TRAVAIL. TON STYLE. TON PORTFOLIO. UN SEUL
// LIEN." + one call to action, typed in a message composer as it is spoken:
// "Écris-moi et on commence." No other button, no urgency.

export const S12_WIPE = 33.6;
const LINES_AT = [33.99, 34.13, 34.27, 34.41];

/** Message-composer CTA; the text types itself word by word with the voice. */
export const CTA: React.FC<{ t: number; text: string; wordTimes: number[]; enter: number; tapAt: number }> = ({ t, text, wordTimes, enter, tapAt }) => {
  const s = springy(t, enter, { stiffness: 220, damping: 18 });
  const words = text.split(" ");
  // characters typed so far: each word types over ~70% of the gap to the next word
  let shown = "";
  words.forEach((w, i) => {
    const a = wordTimes[i];
    const b = i + 1 < wordTimes.length ? wordTimes[i + 1] : a + 0.45;
    const k = clamp(invLerp(a, a + Math.max(0.12, (b - a) * 0.7), t));
    const part = w.slice(0, Math.round(w.length * k));
    if (t >= a) shown += (i ? " " : "") + part;
  });
  const typing = t < wordTimes[wordTimes.length - 1] + 0.5;
  const caretOn = typing || Math.floor(t * 2.2) % 2 === 0;
  const tap = clamp(invLerp(tapAt, tapAt + 0.5, t));
  const press = t > tapAt && t < tapAt + 0.16 ? 0.9 : 1;
  const glow = 0.5 + 0.5 * Math.sin((t - tapAt) * 3.2);
  const beat = t < tapAt ? beatPulse(t) : 0; // the send button breathes with the kick until it's tapped
  return (
    <div style={{ position: "absolute", left: 60, top: 1090, width: 960, height: 172, transform: `translateY(${(1 - s) * 260}px)`, opacity: clamp(s * 2) }}>
      <div
        style={{
          position: "absolute", inset: 0, borderRadius: 86, background: "#FFFFFF", boxShadow: shadow.float,
          display: "flex", alignItems: "center", padding: "0 26px 0 48px", boxSizing: "border-box",
        }}
      >
        <div style={{ flex: 1, fontFamily: font.display, fontWeight: 700, fontSize: 60, letterSpacing: "-0.045em", color: color.ink, whiteSpace: "nowrap" }}>
          {shown}
          <span style={{ display: "inline-block", width: 4, height: 62, marginLeft: 4, background: color.violet, verticalAlign: "-9px", opacity: caretOn ? 1 : 0 }} />
        </div>
        <div style={{ position: "relative", width: 116, height: 116, flexShrink: 0 }}>
          {tap > 0 && tap < 1 && (
            <div style={{ position: "absolute", left: 58 - 58 * (1 + tap), top: 58 - 58 * (1 + tap), width: 116 * (1 + tap), height: 116 * (1 + tap), borderRadius: "50%", border: `4px solid ${color.lavender}`, opacity: 1 - tap, boxSizing: "border-box" }} />
          )}
          <div
            style={{
              position: "relative", width: 116, height: 116, borderRadius: 58, background: color.violet, display: "flex", alignItems: "center", justifyContent: "center",
              transform: `scale(${press * (1 + 0.08 * beat)})`,
              boxShadow: t > tapAt ? `0 0 ${24 + glow * 26}px rgba(148,102,255,${0.35 + glow * 0.3})` : `0 0 ${10 + 30 * beat}px rgba(148,102,255,${0.25 + 0.4 * beat})`,
            }}
          >
            <IconSend size={56} color="#fff" stroke={2.3} />
            <LightSweep t={t} at={tapAt - 0.7} dur={0.5} radius={58} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const S12CTA: React.FC<SceneProps> = ({ t }) => {
  // star wipe in (callback to the reveal)
  const wipe = prog(t, S12_WIPE, 0.4, ease.inExpo);
  const words = phraseWords(17);
  const lineStyle = { size: 104, color: "#FFFFFF", from: "left" as const, distance: 160, dur: 0.5, blur: 30, justify: "flex-start" as const };
  const pill = springy(t, LINES_AT[3], { stiffness: 300, damping: 16 });
  return (
    <>
      {wipe < 1 && (
        <div style={{ position: "absolute", left: 540 - 744, top: 900 - 744, transform: `scale(${0.02 + wipe * 7})`, transformOrigin: "744px 744px" }}>
          <Star size={1488} fill={color.violet} stroke={color.violet} strokeWidth={4} rotate={-20 + wipe * 60} sy={1.1} />
        </div>
      )}
      {wipe >= 0.999 && (
        <Fill bg={bg.violet}>
          <div style={{ position: "absolute", left: 80, top: 404, width: 940 }}>
            <KineticLine t={t} {...lineStyle} words={[{ text: "TON TRAVAIL.", at: LINES_AT[0] }]} />
            <KineticLine t={t} {...lineStyle} style={{ marginTop: 12 }} words={[{ text: "TON STYLE.", at: LINES_AT[1] }]} />
            <KineticLine t={t} {...lineStyle} style={{ marginTop: 12 }} words={[{ text: "TON PORTFOLIO.", at: LINES_AT[2] }]} />
            {t >= LINES_AT[3] && (
              <div
                style={{
                  marginTop: 30, display: "inline-flex", alignItems: "center", gap: 22, padding: "18px 40px 18px 22px", borderRadius: 999,
                  background: "#FFFFFF", transform: `translateX(${(1 - pill) * -200}px) scale(${(0.8 + 0.2 * pill) * (1 + 0.025 * beatPulse(t))})`, transformOrigin: "0% 50%",
                  opacity: clamp(invLerp(LINES_AT[3], LINES_AT[3] + 0.08, t)), boxShadow: shadow.float,
                }}
              >
                <div style={{ width: 84, height: 84, borderRadius: 42, background: color.violet, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IconLink size={46} color="#fff" stroke={2.5} />
                </div>
                <span style={{ fontFamily: font.display, fontWeight: 800, fontSize: 96, letterSpacing: "-0.045em", color: color.violet, lineHeight: 1 }}>UN SEUL LIEN.</span>
              </div>
            )}
          </div>
          <CTA
            t={t} text="Écris-moi et on commence." enter={words[0].start - 0.3}
            wordTimes={words.map((w) => w.start)} tapAt={words[words.length - 1].end + 0.2}
          />
        </Fill>
      )}
    </>
  );
};

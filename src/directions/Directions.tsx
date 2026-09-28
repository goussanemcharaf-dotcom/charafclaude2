import React from "react";
import { AbsoluteFill, Img } from "remotion";
import { bg, color, font, shadow } from "../../styles/tokens";
import { Star } from "../components/motion/Shapes";
import { BrowserFrame } from "../components/ui/Frames";
import { PortfolioPage } from "../components/portfolio/PortfolioPage";
import { img, persona, DESK } from "../components/portfolio/data";

// Three genuinely different creative directions, as style frames of the same
// beat ("Ton travail mérite une meilleure présentation"). A was retained and
// fused with the reference's motion language.

const Tag: React.FC<{ label: string; sub: string; dark?: boolean }> = ({ label, sub, dark }) => (
  <div style={{ position: "absolute", left: 60, top: 60, right: 60, display: "flex", justifyContent: "space-between", fontFamily: font.mono, fontSize: 24, letterSpacing: "0.08em", color: dark ? "rgba(255,255,255,0.7)" : color.mute }}>
    <span>{label}</span><span>{sub}</span>
  </div>
);

/** A — PREMIUM DIGITAL (retained): white studio, violet, Inter Tight + Instrument Serif, soft star. */
export const DirectionA: React.FC = () => (
  <AbsoluteFill style={{ background: bg.studio }}>
    <Tag label="A — PREMIUM DIGITAL" sub="RETENUE ✓" />
    <div style={{ position: "absolute", left: 540 - 620, top: 640 - 620 }}>
      <Star size={1240} stroke={color.violetBright} strokeWidth={2.6} rotate={-8} sy={1.06} />
    </div>
    <div style={{ position: "absolute", left: 0, top: 500, width: 1080, textAlign: "center" }}>
      <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 88, letterSpacing: "-0.045em", color: color.ink }}>Ton travail mérite</div>
      <div style={{ fontFamily: font.serif, fontStyle: "italic", fontSize: 140, color: color.violet, lineHeight: 1 }}>une meilleure</div>
      <div style={{ fontFamily: font.serif, fontStyle: "italic", fontSize: 140, color: color.violet, lineHeight: 1 }}>présentation.</div>
    </div>
    <div style={{ position: "absolute", left: 110, top: 1130 }}>
      <BrowserFrame width={860} height={560} url={persona.url} pageWidth={DESK.width}><PortfolioPage /></BrowserFrame>
    </div>
    <div style={{ position: "absolute", left: 60, bottom: 60, fontFamily: font.mono, fontSize: 22, color: color.mute }}>
      Studio clair ↔ monde violet · type cinétique + flou directionnel · bulles, étoile, rails · UI originale
    </div>
  </AbsoluteFill>
);

/** B — CREATOR CINEMATIC: dark, large media, warm grade, serif, letterbox. */
export const DirectionB: React.FC = () => (
  <AbsoluteFill style={{ background: "#0B0B0E" }}>
    <div style={{ position: "absolute", left: 0, top: 240, width: 1080, height: 1300, overflow: "hidden" }}>
      <Img src={img.hero()} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 30%", filter: "contrast(1.12) saturate(0.8) sepia(0.18) brightness(0.82)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 50% 40%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.75) 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 520, background: "linear-gradient(180deg, rgba(11,11,14,0), #0B0B0E)" }} />
    </div>
    <Tag label="B — CREATOR CINEMATIC" sub="EXPLORÉE" dark />
    <div style={{ position: "absolute", left: 80, top: 1180, fontFamily: font.serif, color: "#F2E9DC", lineHeight: 0.92 }}>
      <div style={{ fontSize: 150 }}>Ton travail</div>
      <div style={{ fontSize: 150, fontStyle: "italic" }}>mérite mieux.</div>
    </div>
    <div style={{ position: "absolute", left: 84, top: 1500, fontFamily: font.mono, fontSize: 24, letterSpacing: "0.2em", color: "rgba(242,233,220,0.7)" }}>
      UGC · VOICE OVER · PORTFOLIO
    </div>
    <div style={{ position: "absolute", left: 60, bottom: 60, fontFamily: font.mono, fontSize: 22, color: "rgba(255,255,255,0.5)" }}>
      Sombre · médias plein cadre · étalonnage chaud · serif · rythme lent — moins lisible sans le son
    </div>
  </AbsoluteFill>
);

/** C — AWWWARDS / EXPERIMENTAL: black, acid lavender, oversized numerals, asymmetric grid. */
export const DirectionC: React.FC = () => (
  <AbsoluteFill style={{ background: "#09090B" }}>
    {Array.from({ length: 5 }, (_, i) => (
      <div key={i} style={{ position: "absolute", left: 60 + i * 240, top: 0, bottom: 0, width: 1, background: "rgba(201,182,255,0.12)" }} />
    ))}
    <Tag label="C — AWWWARDS / EXPÉRIMENTAL" sub="EXPLORÉE" dark />
    <div style={{ position: "absolute", left: 30, top: 170, fontFamily: font.display, fontWeight: 900, fontSize: 620, letterSpacing: "-0.08em", lineHeight: 0.8, color: "transparent", WebkitTextStroke: "4px #C9B6FF" }}>10</div>
    <div style={{ position: "absolute", left: 640, top: 360, fontFamily: font.mono, fontSize: 30, color: "#C9B6FF", transform: "rotate(90deg)", transformOrigin: "0 0" }}>LIENS ÉPARPILLÉS →</div>
    <div style={{ position: "absolute", right: 60, top: 820, fontFamily: font.display, fontWeight: 900, fontSize: 760, letterSpacing: "-0.08em", lineHeight: 0.8, color: "#C9B6FF" }}>1</div>
    <div style={{ position: "absolute", left: 70, top: 1080, width: 520, fontFamily: font.display, fontWeight: 800, fontSize: 84, letterSpacing: "-0.05em", lineHeight: 0.95, color: "#fff" }}>
      Ton travail mérite mieux que dix liens.
    </div>
    <div style={{ position: "absolute", left: 70, top: 1520, padding: "16px 26px", border: "2px solid #C9B6FF", fontFamily: font.mono, fontSize: 30, color: "#C9B6FF" }}>
      {persona.url} ↗
    </div>
    <div style={{ position: "absolute", left: 60, bottom: 60, fontFamily: font.mono, fontSize: 22, color: "rgba(255,255,255,0.5)" }}>
      Noir + lavande acide · chiffres géants · grille asymétrique — fort, mais le portfolio passe au second plan
    </div>
  </AbsoluteFill>
);

/** All three side by side (3240 x 1920) for the creative review. */
export const Directions: React.FC = () => (
  <AbsoluteFill style={{ flexDirection: "row", background: "#111" }}>
    {[DirectionA, DirectionB, DirectionC].map((D, i) => (
      <div key={i} style={{ position: "relative", width: 1080, height: 1920, overflow: "hidden", boxShadow: shadow.card }}>
        <D />
      </div>
    ))}
  </AbsoluteFill>
);

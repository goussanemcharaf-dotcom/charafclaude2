import React from "react";
import { AbsoluteFill } from "remotion";
import { bg, color, font, shadow } from "../styles/tokens";
import { BrowserFrame } from "./components/ui/Frames";
import { IconLink } from "./components/ui/Icons";
import { Star } from "./components/motion/Shapes";
import { PortfolioPage } from "./components/portfolio/PortfolioPage";
import { persona, DESK } from "./components/portfolio/data";

// 05_THUMBNAIL — cover frame for the ad (feed / Reels grid). The core idea in
// one line, the product as hero, the one link as the payoff.
export const Thumbnail: React.FC = () => (
  <AbsoluteFill style={{ background: bg.violet }}>
    <div style={{ position: "absolute", left: 0, top: 290, width: 1080, textAlign: "center" }}>
      <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 96, letterSpacing: "-0.05em", color: "#fff", lineHeight: 1 }}>
        Ton travail mérite
      </div>
      <div style={{ fontFamily: font.serif, fontStyle: "italic", fontSize: 150, letterSpacing: "-0.02em", color: color.lavender, lineHeight: 1.05, marginTop: 10 }}>
        mieux que 10 liens.
      </div>
    </div>
    <div style={{ position: "absolute", left: 890, top: 236 }}>
      <Star size={120} fill={color.lavender} stroke={color.lavender} strokeWidth={2} rotate={12} />
    </div>
    <div style={{ position: "absolute", left: 70, top: 640 }}>
      <BrowserFrame width={940} height={680} url={persona.url} pageWidth={DESK.width}>
        <div style={{ transform: "translateY(-10px)" }}>
          <PortfolioPage />
        </div>
      </BrowserFrame>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1262, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          display: "flex", alignItems: "center", gap: 22, padding: "18px 44px 18px 20px", borderRadius: 999, background: "#fff",
          boxShadow: shadow.float, transform: "rotate(-2deg)",
        }}
      >
        <div style={{ width: 96, height: 96, borderRadius: 48, background: color.violet, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconLink size={52} color="#fff" stroke={2.5} />
        </div>
        <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 84, letterSpacing: "-0.045em", color: color.violet, lineHeight: 1 }}>
          1 seul lien
        </div>
      </div>
    </div>
  </AbsoluteFill>
);

import React from "react";
import { Img } from "remotion";
import { IconPlay, IconArrowRight } from "../ui/Icons";
import { img, pf, persona, DESK } from "./data";
import { B, Build, rise, unmask } from "./build";

export const PortfolioHero: React.FC<{ build?: Build; imageScale?: number }> = ({ build, imageScale = 1 }) => {
  const pt = B(build, "heroType");
  const pi = B(build, "heroImage");
  const pc = B(build, "heroCopy");
  return (
    <div style={{ position: "absolute", left: 0, top: DESK.hero, width: 1200, height: 700 }}>
      {/* left column: identity */}
      <div style={{ position: "absolute", left: 64, top: 64, ...rise(pt, 20) }}>
        <div style={{ fontFamily: pf.mono, fontSize: 15, letterSpacing: "0.16em", color: pf.mute, textTransform: "uppercase" }}>
          UGC Creator — Voice Over — {persona.city}
        </div>
      </div>
      <div style={{ position: "absolute", left: 58, top: 108, fontFamily: pf.serif, color: pf.ink, lineHeight: 0.86, letterSpacing: "-0.025em" }}>
        <div style={{ fontSize: 186, ...rise(pt, 46) }}>Inès</div>
        <div style={{ fontSize: 186, fontStyle: "italic", ...rise(Math.max(0, pt * 1.25 - 0.25), 46) }}>Morel</div>
      </div>
      <div
        style={{
          position: "absolute", left: 64, top: 470, width: 480, fontFamily: pf.sans, fontSize: 23, lineHeight: 1.42,
          color: pf.inkSoft, letterSpacing: "-0.01em", ...rise(pc, 24),
        }}
      >
        Je crée des vidéos UGC et des voix off naturelles pour les marques beauté, food et lifestyle.
      </div>
      <div style={{ position: "absolute", left: 64, top: 596, display: "flex", gap: 14, ...rise(Math.max(0, pc * 1.3 - 0.3), 24) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: pf.ink, color: pf.paper, borderRadius: 999, padding: "16px 26px", fontFamily: pf.sans, fontSize: 18, fontWeight: 500 }}>
          Voir les projets <IconArrowRight size={19} color={pf.paper} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, border: `1.5px solid ${pf.ink}`, color: pf.ink, borderRadius: 999, padding: "14.5px 24px", fontFamily: pf.sans, fontSize: 18, fontWeight: 500 }}>
          <IconPlay size={16} color={pf.ink} fill={pf.ink} /> Écouter ma voix
        </div>
      </div>
      {/* right column: portrait */}
      <div style={{ position: "absolute", left: 664, top: 40, width: 472, height: 620, borderRadius: 18, overflow: "hidden", background: pf.paperDeep, ...unmask(pi, 18) }}>
        <Img
          src={img.hero()}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 30%", transform: `scale(${(1 + (1 - pi) * 0.12) * imageScale})` }}
        />
        <div
          style={{
            position: "absolute", left: 18, bottom: 18, display: "flex", alignItems: "center", gap: 9, background: "rgba(244,241,236,0.9)",
            borderRadius: 999, padding: "9px 15px", fontFamily: pf.mono, fontSize: 13.5, color: pf.ink, letterSpacing: "0.04em",
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: 4, background: "#6E9B6A" }} /> Disponible
        </div>
      </div>
    </div>
  );
};

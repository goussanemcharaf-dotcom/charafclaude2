import React from "react";
import { Img } from "remotion";
import { img, pf, persona, DESK } from "./data";
import { B, Build, rise } from "./build";

/** "Mon univers": the creator's style system (palette, type, tone). */
export const PortfolioStyle: React.FC<{ build?: Build }> = ({ build }) => {
  const p = B(build, "rest");
  const swatches = [
    { name: "Papier", hex: pf.paper, border: true },
    { name: "Encre", hex: pf.ink },
    { name: "Argile", hex: pf.clay },
    { name: "Sauge", hex: pf.sage },
  ];
  return (
    <div style={{ position: "absolute", left: 0, top: DESK.style, width: 1200, height: 600, ...rise(p, 30) }}>
      <div style={{ position: "absolute", left: 64, top: 56, fontFamily: pf.serif, fontSize: 84, color: pf.ink, letterSpacing: "-0.02em", lineHeight: 1 }}>
        Mon <span style={{ fontStyle: "italic" }}>univers</span>
      </div>
      <div style={{ position: "absolute", left: 64, top: 200, width: 500, height: 330, borderRadius: 20, background: pf.paperDeep, padding: 36, boxSizing: "border-box" }}>
        <div style={{ fontFamily: pf.mono, fontSize: 14, color: pf.mute, letterSpacing: "0.12em" }}>PALETTE</div>
        <div style={{ display: "flex", gap: 22, marginTop: 30 }}>
          {swatches.map((s) => (
            <div key={s.name} style={{ textAlign: "center" }}>
              <div style={{ width: 92, height: 92, borderRadius: 46, background: s.hex, border: s.border ? `1px solid ${pf.line}` : undefined }} />
              <div style={{ fontFamily: pf.sans, fontSize: 16, color: pf.ink, marginTop: 14 }}>{s.name}</div>
              <div style={{ fontFamily: pf.mono, fontSize: 12.5, color: pf.mute, marginTop: 4 }}>{s.hex.toUpperCase()}</div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: pf.sans, fontSize: 18, color: pf.inkSoft, marginTop: 34 }}>Naturel · Chaleureux · Précis</div>
      </div>
      <div style={{ position: "absolute", left: 588, top: 200, width: 548, height: 330, borderRadius: 20, border: `1px solid ${pf.line}`, padding: 36, boxSizing: "border-box" }}>
        <div style={{ fontFamily: pf.mono, fontSize: 14, color: pf.mute, letterSpacing: "0.12em" }}>TYPOGRAPHIE</div>
        <div style={{ display: "flex", gap: 44, marginTop: 14, alignItems: "flex-end" }}>
          <div>
            <div style={{ fontFamily: pf.serif, fontSize: 150, lineHeight: 1, color: pf.ink }}>Aa</div>
            <div style={{ fontFamily: pf.sans, fontSize: 16, color: pf.inkSoft, marginTop: 8 }}>Instrument Serif</div>
          </div>
          <div>
            <div style={{ fontFamily: pf.sans, fontSize: 130, lineHeight: 1, color: pf.ink, fontWeight: 500, letterSpacing: "-0.04em" }}>Aa</div>
            <div style={{ fontFamily: pf.sans, fontSize: 16, color: pf.inkSoft, marginTop: 14 }}>Geist</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PortfolioAbout: React.FC<{ build?: Build }> = ({ build }) => {
  const p = B(build, "rest");
  return (
    <div style={{ position: "absolute", left: 0, top: DESK.about, width: 1200, height: 440, ...rise(p, 30) }}>
      <div style={{ position: "absolute", left: 64, top: 40, width: 300, height: 360, borderRadius: 16, overflow: "hidden" }}>
        <Img src={img.hero()} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 22%", transform: "scale(1.35)", transformOrigin: "50% 25%" }} />
      </div>
      <div style={{ position: "absolute", left: 430, top: 52, width: 700 }}>
        <div style={{ fontFamily: pf.mono, fontSize: 14, color: pf.mute, letterSpacing: "0.12em" }}>À PROPOS</div>
        <div style={{ fontFamily: pf.serif, fontSize: 50, lineHeight: 1.08, color: pf.ink, marginTop: 22, letterSpacing: "-0.015em" }}>
          Je filme et je prête ma voix aux marques qui veulent <span style={{ fontStyle: "italic" }}>parler vrai.</span>
        </div>
        <div style={{ fontFamily: pf.sans, fontSize: 19, lineHeight: 1.55, color: pf.inkSoft, marginTop: 26, width: 600 }}>
          Je m'appelle {persona.first}. Depuis {persona.city}, je conçois des contenus simples, sincères et soignés — du script au montage.
        </div>
      </div>
    </div>
  );
};

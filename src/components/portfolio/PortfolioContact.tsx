import React from "react";
import { IconArrowRight } from "../ui/Icons";
import { pf, persona, DESK } from "./data";
import { B, Build, rise } from "./build";

export const PortfolioContact: React.FC<{ build?: Build }> = ({ build }) => {
  const p = B(build, "rest");
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: DESK.contact, width: 1200, height: 440, textAlign: "center", ...rise(p, 30) }}>
        <div style={{ fontFamily: pf.mono, fontSize: 14, color: pf.mute, letterSpacing: "0.14em", marginTop: 56 }}>CONTACT</div>
        <div style={{ fontFamily: pf.serif, fontSize: 124, lineHeight: 0.95, color: pf.ink, marginTop: 24, letterSpacing: "-0.025em" }}>
          Travaillons <span style={{ fontStyle: "italic" }}>ensemble.</span>
        </div>
        <div style={{ fontFamily: pf.sans, fontSize: 28, color: pf.ink, marginTop: 34, textDecoration: "underline", textUnderlineOffset: 8, textDecorationThickness: 1.5 }}>
          {persona.email}
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginTop: 34, background: pf.ink, color: pf.paper, borderRadius: 999, padding: "17px 30px", fontFamily: pf.sans, fontSize: 19, fontWeight: 500 }}>
          Écrire un message <IconArrowRight size={19} color={pf.paper} />
        </div>
      </div>
      <div
        style={{
          position: "absolute", left: 64, right: 64, top: DESK.footer, height: 80, borderTop: `1px solid ${pf.line}`,
          display: "flex", alignItems: "center", justifyContent: "space-between", ...rise(p, 10),
        }}
      >
        <div style={{ fontFamily: pf.serif, fontSize: 24, color: pf.ink }}>{persona.name}</div>
        <div style={{ fontFamily: pf.mono, fontSize: 14, color: pf.mute }}>{persona.url} · © 2026</div>
      </div>
    </>
  );
};

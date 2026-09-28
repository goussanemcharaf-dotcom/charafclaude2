import React from "react";
import { pf, persona } from "./data";
import { B, Build, rise } from "./build";

export const PortfolioNav: React.FC<{ build?: Build }> = ({ build }) => {
  const p = B(build, "nav");
  return (
    <div
      style={{
        position: "absolute", left: 0, top: 0, width: 1200, height: 84, display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 64px", boxSizing: "border-box", borderBottom: `1px solid ${pf.line}`,
        ...rise(p, 18),
      }}
    >
      <div style={{ fontFamily: pf.serif, fontSize: 30, color: pf.ink, letterSpacing: "-0.01em" }}>{persona.name}</div>
      <div style={{ display: "flex", gap: 38, fontFamily: pf.sans, fontSize: 17, color: pf.inkSoft, fontWeight: 450 }}>
        <span>Projets</span><span>Services</span><span>À propos</span><span>Contact</span>
      </div>
      <div
        style={{
          fontFamily: pf.sans, fontSize: 16, fontWeight: 500, color: pf.paper, background: pf.ink, borderRadius: 999,
          padding: "12px 22px",
        }}
      >
        Me contacter
      </div>
    </div>
  );
};

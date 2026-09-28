import React from "react";
import { IconArrowUpRight } from "../ui/Icons";
import { pf, services, DESK } from "./data";
import { B, Build, rise } from "./build";

export const PortfolioServices: React.FC<{ build?: Build; highlight?: number }> = ({ build, highlight = -1 }) => {
  const p = B(build, "rest");
  return (
    <div style={{ position: "absolute", left: 0, top: DESK.services, width: 1200, height: 600, ...rise(p, 30) }}>
      <div style={{ position: "absolute", left: 64, top: 56, fontFamily: pf.serif, fontSize: 84, color: pf.ink, letterSpacing: "-0.02em", lineHeight: 1 }}>
        Services
      </div>
      <div style={{ position: "absolute", left: 64, right: 64, top: 182 }}>
        {services.map((s, i) => (
          <div
            key={s.n}
            style={{
              height: 96, borderTop: `1px solid ${pf.line}`, display: "flex", alignItems: "center",
              background: i === highlight ? "rgba(184,107,75,0.08)" : undefined,
            }}
          >
            <div style={{ width: 90, fontFamily: pf.mono, fontSize: 15, color: pf.mute, paddingLeft: 4 }}>{s.n}</div>
            <div style={{ width: 400, fontFamily: pf.serif, fontSize: 46, color: pf.ink, letterSpacing: "-0.015em" }}>{s.title}</div>
            <div style={{ flex: 1, fontFamily: pf.sans, fontSize: 19, color: pf.mute, lineHeight: 1.4 }}>{s.text}</div>
            <IconArrowUpRight size={26} color={pf.ink} stroke={1.8} />
          </div>
        ))}
        <div style={{ borderTop: `1px solid ${pf.line}` }} />
      </div>
    </div>
  );
};

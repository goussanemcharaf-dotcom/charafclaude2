import React from "react";
import { Img } from "remotion";
import { IconMenu, IconPlay, IconArrowRight, IconArrowUpRight } from "../ui/Icons";
import { img, pf, persona, projects, services, MOB } from "./data";

/** Mobile version of the same portfolio (authored at 390 px wide). */
export const PortfolioMobile: React.FC<{ heroZoom?: number; played?: number }> = ({ heroZoom = 1, played = 0.3 }) => {
  const bars = 36;
  return (
    <div style={{ position: "relative", width: MOB.width, height: MOB.total, background: pf.paper, overflow: "hidden" }}>
      {/* nav */}
      <div style={{ position: "absolute", left: 20, right: 20, top: MOB.nav, height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: pf.serif, fontSize: 25, color: pf.ink }}>{persona.name}</div>
        <IconMenu size={26} color={pf.ink} stroke={1.8} />
      </div>
      {/* hero */}
      <div style={{ position: "absolute", left: 16, top: MOB.hero, width: 358, height: 468, borderRadius: 18, overflow: "hidden" }}>
        <Img src={img.hero()} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 28%", transform: `scale(${heroZoom})` }} />
        <div style={{ position: "absolute", left: 14, bottom: 14, display: "flex", alignItems: "center", gap: 7, background: "rgba(244,241,236,0.92)", borderRadius: 999, padding: "7px 12px", fontFamily: pf.mono, fontSize: 11, color: pf.ink }}>
          <div style={{ width: 7, height: 7, borderRadius: 4, background: "#6E9B6A" }} /> Disponible
        </div>
      </div>
      <div style={{ position: "absolute", left: 20, right: 20, top: MOB.intro }}>
        <div style={{ fontFamily: pf.mono, fontSize: 11, letterSpacing: "0.14em", color: pf.mute }}>UGC CREATOR — VOICE OVER</div>
        <div style={{ fontFamily: pf.serif, fontSize: 64, lineHeight: 0.95, color: pf.ink, marginTop: 12, letterSpacing: "-0.02em" }}>
          Inès <span style={{ fontStyle: "italic" }}>Morel</span>
        </div>
        <div style={{ fontFamily: pf.sans, fontSize: 16, lineHeight: 1.45, color: pf.inkSoft, marginTop: 14 }}>
          Vidéos UGC et voix off naturelles pour les marques de beauté, de cuisine et de mode.
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, background: pf.ink, color: pf.paper, borderRadius: 999, padding: "12px 18px", fontFamily: pf.sans, fontSize: 14.5, fontWeight: 500 }}>
            Voir les projets <IconArrowRight size={15} color={pf.paper} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, border: `1.3px solid ${pf.ink}`, color: pf.ink, borderRadius: 999, padding: "10.7px 16px", fontFamily: pf.sans, fontSize: 14.5, fontWeight: 500 }}>
            <IconPlay size={13} color={pf.ink} fill={pf.ink} /> Ma voix
          </div>
        </div>
      </div>
      {/* work */}
      <div style={{ position: "absolute", left: 20, top: MOB.work, fontFamily: pf.serif, fontSize: 46, color: pf.ink, letterSpacing: "-0.02em" }}>
        Projets <span style={{ fontFamily: pf.mono, fontSize: 12, color: pf.mute, verticalAlign: "top" }}>(03)</span>
      </div>
      <div style={{ position: "absolute", left: 20, top: MOB.work + 76, display: "flex", gap: 12 }}>
        {projects.map((p) => (
          <div key={p.key} style={{ width: 200 }}>
            <div style={{ width: 200, height: 290, borderRadius: 14, overflow: "hidden", position: "relative" }}>
              <Img src={img[p.key]()} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: p.pos ?? "50% 50%" }} />
              <div style={{ position: "absolute", right: 10, top: 10, display: "flex", alignItems: "center", gap: 5, background: "rgba(22,20,15,0.55)", color: "#fff", borderRadius: 999, padding: "5px 9px", fontFamily: pf.mono, fontSize: 11 }}>
                <IconPlay size={11} color="#fff" fill="#fff" /> {p.duration}
              </div>
            </div>
            <div style={{ fontFamily: pf.sans, fontSize: 16, fontWeight: 500, color: pf.ink, marginTop: 10 }}>{p.title}</div>
            <div style={{ fontFamily: pf.mono, fontSize: 11, color: pf.mute, marginTop: 3 }}>{p.meta}</div>
          </div>
        ))}
      </div>
      {/* voice demo */}
      <div style={{ position: "absolute", left: 16, right: 16, top: MOB.voice, height: 104, borderRadius: 16, background: pf.paperDeep, display: "flex", alignItems: "center", gap: 14, padding: "0 16px", boxSizing: "border-box" }}>
        <div style={{ width: 50, height: 50, borderRadius: 25, background: pf.ink, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <IconPlay size={21} color={pf.paper} fill={pf.paper} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: pf.sans, fontSize: 15.5, fontWeight: 500, color: pf.ink }}>
            <span>Démo voix off</span><span style={{ fontFamily: pf.mono, fontSize: 12, color: pf.mute, fontWeight: 400 }}>0:45</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 2.5, height: 34, marginTop: 6 }}>
            {Array.from({ length: bars }, (_, i) => {
              const v = Math.abs(Math.sin(i * 0.9) * 0.55 + Math.sin(i * 0.31 + 1) * 0.45);
              return <div key={i} style={{ flex: 1, height: 5 + v * 26, borderRadius: 2, background: i / bars < played ? pf.ink : "rgba(22,20,15,0.22)" }} />;
            })}
          </div>
        </div>
      </div>
      {/* services */}
      <div style={{ position: "absolute", left: 20, right: 20, top: MOB.services }}>
        <div style={{ fontFamily: pf.serif, fontSize: 46, color: pf.ink, letterSpacing: "-0.02em", marginBottom: 14 }}>Services</div>
        {services.map((s) => (
          <div key={s.n} style={{ height: 70, borderTop: `1px solid ${pf.line}`, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontFamily: pf.mono, fontSize: 11, color: pf.mute, width: 22 }}>{s.n}</div>
            <div style={{ flex: 1, fontFamily: pf.serif, fontSize: 27, color: pf.ink }}>{s.title}</div>
            <IconArrowUpRight size={19} color={pf.ink} stroke={1.7} />
          </div>
        ))}
      </div>
      {/* contact */}
      <div style={{ position: "absolute", left: 20, right: 20, top: MOB.contact, textAlign: "center" }}>
        <div style={{ fontFamily: pf.serif, fontSize: 52, lineHeight: 0.98, color: pf.ink, letterSpacing: "-0.02em" }}>
          Travaillons <span style={{ fontStyle: "italic" }}>ensemble.</span>
        </div>
        <div style={{ fontFamily: pf.sans, fontSize: 17, color: pf.ink, marginTop: 18, textDecoration: "underline", textUnderlineOffset: 5 }}>{persona.email}</div>
      </div>
    </div>
  );
};

import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { color, font } from "../lib/tokens";
import { clamp, ease, invLerp, lerp, prog } from "../lib/anim";
import { at, ph } from "../timeline";
import { Dot, Mono, Panel } from "../components/base";
import { SignalGlyph } from "../components/Signal";
import { IconRefresh } from "../components/Icons";

// 07 — TESTING & OPTIMISATION. Launch → three tests run → two stop, one is kept → the loop
// test · analyse · apprendre · optimiser turns once → relaunch; the kept campaign runs on
// Facebook Ads and Instagram Ads. No invented results: only the method.

const T = {
  puis: at(14, "puis"), lancons: at(14, "lançons"), testons: at(14, "testons"), optimisons: at(14, "optimisons"),
  campagnes: at(14, "campagnes"), facebook: at(14, "facebook"), instagram: at(14, "instagram"), ads: at(14, "ads"),
  end: ph(14).end, next: ph(15).start,
};
export const TESTING_IN = T.puis - 0.35;
export const TESTING_OUT = T.next - 0.3;

const LANES = [
  { k: "TEST A", what: "Accroche", line: "« Enfin simple. »", img: "ad_shop.jpg" },
  { k: "TEST B", what: "Créative", line: "Visuel produit", img: "ad_clinic.jpg" },
  { k: "TEST C", what: "Message", line: "« Découvrez notre offre »", img: "ad_local.jpg" },
];
const KEEP = 0;
const LOOP = ["TESTER", "ANALYSER", "APPRENDRE", "OPTIMISER"];

export const C07Testing: React.FC<{ t: number }> = ({ t }) => {
  const inP = prog(t, TESTING_IN, 0.5);
  const out = ease.inCubic(invLerp(TESTING_OUT - 0.1, TESTING_OUT + 0.35, t));
  const launched = t > T.lancons + 0.1;
  const knob = ease.outBackSoft(invLerp(T.lancons, T.lancons + 0.35, t));
  const decide = prog(t, T.optimisons - 0.05, 0.4);
  const collapse = ease.inOutCubic(invLerp(T.optimisons + 0.35, T.optimisons + 0.9, t));
  const loopIn = prog(t, T.optimisons + 0.45, 0.5);
  const loopRun = clamp(invLerp(T.optimisons + 0.6, T.campagnes + 0.2, t));
  const relaunch = prog(t, T.campagnes - 0.1, 0.4);
  const place = (at_: number) => prog(t, at_ - 0.05, 0.35);
  return (
    <AbsoluteFill style={{ opacity: inP * (1 - out), transform: `translateY(${(1 - inP) * 40}px)` }}>
      {/* campaign header with launch toggle and placements */}
      <div style={{ position: "absolute", left: 80, top: 450 }}>
        <Panel w={920} pad={30} active={launched ? 1 : 0}>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <div>
              <Mono size={19}>Campagne Meta Ads</Mono>
              <div style={{ fontSize: 44, fontWeight: 750, letterSpacing: "-0.02em", marginTop: 4 }}>Acquisition</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontFamily: font.sans, fontSize: 28, fontWeight: 650, color: launched ? color.paper : color.mist }}>{launched ? "Active" : "Lancer"}</span>
              <div style={{ width: 96, height: 54, borderRadius: 27, background: launched ? color.signal : color.panel3, position: "relative", transition: "none" }}>
                <div style={{ position: "absolute", top: 6, left: lerp(6, 48, clamp(knob)), width: 42, height: 42, borderRadius: 21, background: color.paper }} />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 22 }}>
            {[["Facebook Ads", T.facebook], ["Instagram Ads", T.instagram]].map(([k, a]) => {
              const p = place(a as number);
              return (
                <span key={k as string} style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "12px 20px", borderRadius: 999,
                  fontFamily: font.sans, fontSize: 30, fontWeight: 700, color: p > 0.5 ? color.paper : color.mist,
                  border: `1.5px solid ${p > 0.5 ? color.signal : color.line2}`, background: p > 0.5 ? "rgba(255,90,31,0.1)" : "transparent" }}>
                  <Dot on={p > 0.5} size={13} pulse={p > 0.5 ? ((t - (a as number)) * 1.1) % 1 : undefined} />{k as string}
                </span>
              );
            })}
          </div>
        </Panel>
      </div>
      {/* the three tests */}
      {LANES.map((l, i) => {
        const p = prog(t, T.testons - 0.15 + i * 0.12, 0.45);
        const kept = i === KEEP;
        const stopped = !kept && decide > 0.5;
        const run = clamp(invLerp(T.testons, T.testons + 2.2, t)) * (stopped ? 0.55 : 1);
        const y0 = 760 + i * 150;
        const y = kept ? lerp(y0, 760, collapse) : y0;
        const o = clamp(p) * (stopped ? lerp(1, 0.3, decide) * (1 - collapse) : 1);
        return (
          <div key={l.k} style={{ position: "absolute", left: 80, top: y, width: 920, height: 128, boxSizing: "border-box", borderRadius: 22,
            display: "flex", alignItems: "center", gap: 22, padding: "0 22px", opacity: o, transform: `translateX(${(1 - clamp(p)) * 60}px)`,
            background: kept && decide > 0.5 ? "rgba(255,90,31,0.08)" : color.panel, border: `1.5px solid ${kept && decide > 0.5 ? color.signal : color.line2}` }}>
            <div style={{ width: 84, height: 84, borderRadius: 16, overflow: "hidden", flex: "none" }}>
              <Img src={staticFile(`assets/images/${l.img}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ width: 330 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                <span style={{ fontFamily: font.sans, fontWeight: 800, fontSize: 32 }}>{l.k}</span>
                <Mono size={17}>{l.what}</Mono>
              </div>
              <div style={{ fontFamily: font.sans, fontSize: 24, color: color.mist, marginTop: 4, whiteSpace: "nowrap" }}>{l.line}</div>
            </div>
            <div style={{ flex: 1, height: 10, borderRadius: 10, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
              <div style={{ width: `${run * 100}%`, height: "100%", background: kept && decide > 0.5 ? color.signal : color.mist, borderRadius: 10 }} />
            </div>
            <span style={{ width: 120, textAlign: "right", fontFamily: font.sans, fontWeight: 700, fontSize: 24,
              color: kept ? color.signal : color.mist, opacity: decide }}>{kept ? "Retenu" : "Arrêté"}</span>
          </div>
        );
      })}
      {/* the optimisation loop */}
      <div style={{ position: "absolute", left: 540, top: 1200, transform: "translate(-50%, -50%)", opacity: loopIn, width: 620, height: 400 }}>
        <svg width={620} height={400} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <ellipse cx={310} cy={200} rx={250} ry={150} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={2} strokeDasharray="5 10" />
          {(() => {
            const a = -Math.PI / 2 + loopRun * Math.PI * 2;
            return loopRun > 0 && loopRun < 1 ? <SignalGlyph x={310 + 250 * Math.cos(a)} y={200 + 150 * Math.sin(a)} size={16} /> : null;
          })()}
        </svg>
        {LOOP.map((k, i) => {
          const a = -Math.PI / 2 + (i / 4) * Math.PI * 2;
          const lit = loopRun >= i / 4 + 0.02;
          return (
            <div key={k} style={{ position: "absolute", left: 310 + 250 * Math.cos(a), top: 200 + 150 * Math.sin(a), transform: "translate(-50%, -50%)",
              padding: "10px 18px", borderRadius: 999, background: color.ink, border: `1.5px solid ${lit ? color.signal : color.line2}`,
              fontFamily: font.sans, fontWeight: 750, fontSize: 25, letterSpacing: "0.04em", color: lit ? color.paper : color.mist, whiteSpace: "nowrap" }}>{k}</div>
          );
        })}
        <div style={{ position: "absolute", left: 310, top: 200, transform: "translate(-50%, -50%)", display: "flex", alignItems: "center", gap: 12,
          opacity: relaunch, fontFamily: font.sans, fontWeight: 800, fontSize: 34, letterSpacing: "0.06em", color: color.signal }}>
          <IconRefresh s={36} c={color.signal} w={2} />RELANCE
        </div>
      </div>
    </AbsoluteFill>
  );
};

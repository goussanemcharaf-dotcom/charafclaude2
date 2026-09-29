import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { color } from "../lib/tokens";
import { clamp, ease, invLerp, keys, lerp, prog } from "../lib/anim";
import { at, ph } from "../timeline";
import { Dot, Mono, Panel } from "../components/base";
import { SignalGlyph, along, polyLength } from "../components/Signal";
import { KineticLine } from "../components/Kinetic";
import { IconRefresh } from "../components/Icons";

// 07 — TESTING & OPTIMISATION. The campaign is switched on (big, centred) → it docks at the top as
// three tests run → two stop, one is kept → the loop tester · analyser · apprendre · optimiser turns
// once → relaunch → the placements, said and shown: FACEBOOK & INSTAGRAM ADS. No invented results:
// only the method (bars are test progress, never numbers).

const T = {
  puis: at(14, "puis"), lancons: at(14, "lançons"), testons: at(14, "testons"), optimisons: at(14, "optimisons"),
  vos: at(14, "vos"), campagnes: at(14, "campagnes"), facebook: at(14, "facebook"), et: at(14, "&"), instagram: at(14, "instagram"),
  ads: at(14, "ads"), end: ph(14).end, next: ph(15).start,
};
export const TESTING_IN = T.puis - 0.35;
export const TESTING_OUT = T.next - 0.3;

const LANES = [
  { k: "TEST A", what: "Accroche", line: "« Enfin simple. »", img: "ad_shop.jpg", runTo: 0.62 },
  { k: "TEST B", what: "Créative", line: "Visuel produit", img: "ad_clinic.jpg", runTo: 0.34 },
  { k: "TEST C", what: "Message", line: "« Découvrez notre offre »", img: "ad_local.jpg", runTo: 0.41 },
];
const KEEP = 0;
const LOOP = ["TESTER", "ANALYSER", "APPRENDRE", "OPTIMISER"];
const LANE_Y0 = 690, LANE_STEP = 158, LANE_H = 138;
const LOOP_Y = 1090;
// the loop, sampled clockwise from the top so the drawn stroke and the signal share one parameter
const ELLIPSE = Array.from({ length: 97 }, (_, i) => {
  const a = -Math.PI / 2 + (i / 96) * Math.PI * 2;
  return [310 + 250 * Math.cos(a), 190 + 140 * Math.sin(a)] as [number, number];
});
const ELLIPSE_D = `M${ELLIPSE.map((q) => q.map((v) => v.toFixed(1)).join(",")).join(" L")}`;
const ELLIPSE_L = polyLength(ELLIPSE);

export const C07Testing: React.FC<{ t: number }> = ({ t }) => {
  const inP = prog(t, TESTING_IN + 0.1, 0.45); // rises in as 06 leaves
  const out = ease.inCubic(invLerp(TESTING_OUT - 0.1, TESTING_OUT + 0.35, t));
  const launched = t > T.lancons + 0.08;
  const knob = ease.outBackSoft(invLerp(T.lancons, T.lancons + 0.35, t));
  const ring = clamp(invLerp(T.lancons + 0.05, T.lancons + 0.75, t));
  // the campaign panel: centred and large for the launch, docks at the top when the tests arrive
  const dock = ease.inOutCubic(invLerp(T.testons - 0.3, T.testons + 0.15, t));
  const panelY = lerp(800, 450, dock), panelS = lerp(1.14, 1, dock);
  const decide = prog(t, T.optimisons - 0.05, 0.4);
  const collapse = ease.inOutCubic(invLerp(T.optimisons + 0.3, T.optimisons + 0.8, t));
  const loopIn = prog(t, T.optimisons + 0.35, 0.45) * (1 - ease.inCubic(invLerp(T.facebook - 0.3, T.facebook + 0.05, t)));
  const loopRun = clamp(invLerp(T.optimisons + 0.45, T.campagnes + 0.05, t));
  const relaunch = prog(t, T.campagnes - 0.12, 0.35);
  const bigType = t > T.facebook - 0.05;
  const place = (a: number) => prog(t, a - 0.05, 0.35);
  return (
    <AbsoluteFill style={{ opacity: inP * (1 - out), transform: `translateY(${(1 - inP) * 90}px)` }}>
      {/* campaign panel with the launch switch and the two placements */}
      <div style={{ position: "absolute", left: 80, top: panelY, transform: `scale(${panelS})`, transformOrigin: "460px 0px" }}>
        <Panel w={920} pad={30} active={launched ? 1 : 0}>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <div>
              <Mono size={20}>Campagne Meta Ads</Mono>
              <div style={{ fontSize: 46, fontWeight: 750, letterSpacing: "-0.02em", marginTop: 4 }}>Acquisition</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 30, fontWeight: 650, color: launched ? color.paper : color.mist }}>{launched ? "Active" : "Lancer"}</span>
              <div style={{ width: 100, height: 56, borderRadius: 28, background: launched ? color.signal : color.panel3, position: "relative" }}>
                <div style={{ position: "absolute", top: 6, left: lerp(6, 50, clamp(knob)), width: 44, height: 44, borderRadius: 22, background: color.paper }} />
                {ring > 0 && ring < 1 && (
                  <div style={{ position: "absolute", inset: -ring * 26, borderRadius: 999, border: `2px solid rgba(255,90,31,${0.7 * (1 - ring)})` }} />
                )}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 22 }}>
            {([["Facebook Ads", T.facebook], ["Instagram Ads", T.instagram]] as [string, number][]).map(([k, a]) => {
              const p = place(a);
              return (
                <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "12px 20px", borderRadius: 999,
                  fontSize: 30, fontWeight: 700, color: p > 0.5 ? color.paper : color.mist,
                  border: `1.5px solid ${p > 0.5 ? color.signal : color.line2}`, background: p > 0.5 ? "rgba(255,90,31,0.1)" : "transparent" }}>
                  <Dot on={p > 0.5} size={13} pulse={p > 0.5 ? ((t - a) * 1.1) % 1 : undefined} />{k}
                </span>
              );
            })}
          </div>
        </Panel>
      </div>
      {/* the three tests */}
      {LANES.map((l, i) => {
        const p = prog(t, T.testons - 0.05 + i * 0.1, 0.45);
        if (p <= 0) return null;
        const kept = i === KEEP;
        const stopped = !kept && decide > 0.5;
        const run = keys(t, [[T.testons + 0.05, 0], [T.optimisons, l.runTo], [T.end, kept ? 1 : l.runTo]], ease.outCubic);
        const y0 = LANE_Y0 + i * LANE_STEP;
        const y = kept ? lerp(y0, LANE_Y0, collapse) : y0 - collapse * 40;
        const o = clamp(p) * (stopped ? lerp(1, 0.3, decide) * (1 - collapse) : 1);
        const on = kept && decide > 0.5;
        const label = kept ? (relaunch > 0.5 ? "Relancé" : "Retenu") : "Arrêté";
        return (
          <div key={l.k} style={{ position: "absolute", left: 80, top: y, width: 920, height: LANE_H, boxSizing: "border-box", borderRadius: 24,
            display: "flex", alignItems: "center", gap: 22, padding: "0 24px", opacity: o, transform: `translateX(${(1 - clamp(p)) * 60}px)`,
            background: on ? "rgba(255,90,31,0.08)" : color.panel, border: `1.5px solid ${on ? color.signal : color.line2}` }}>
            <div style={{ width: 96, height: 96, borderRadius: 18, overflow: "hidden", flex: "none", filter: stopped ? "grayscale(1)" : undefined }}>
              <Img src={staticFile(`assets/images/${l.img}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ width: 330 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                <span style={{ fontWeight: 800, fontSize: 34 }}>{l.k}</span>
                <Mono size={19}>{l.what}</Mono>
              </div>
              <div style={{ fontSize: 25, color: color.mist, marginTop: 4, whiteSpace: "nowrap" }}>{l.line}</div>
            </div>
            <div style={{ flex: 1, height: 10, borderRadius: 10, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
              <div style={{ width: `${run * 100}%`, height: "100%", background: on ? color.signal : color.mist, borderRadius: 10 }} />
            </div>
            <span style={{ width: 130, display: "inline-flex", justifyContent: "flex-end", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 25,
              color: kept ? color.signal : color.mist, opacity: decide }}>
              {kept && relaunch > 0.5 && <IconRefresh s={24} c={color.signal} w={2.2} />}{label}
            </span>
          </div>
        );
      })}
      {/* the optimisation loop */}
      {loopIn > 0.01 && (
        <div style={{ position: "absolute", left: 540, top: LOOP_Y, transform: `translate(-50%, -50%) scale(${0.92 + 0.08 * loopIn})`, opacity: loopIn, width: 620, height: 380 }}>
          <svg width={620} height={380} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            <ellipse cx={310} cy={190} rx={250} ry={140} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={2} strokeDasharray="5 10" />
            <path d={ELLIPSE_D} fill="none" stroke={color.signal} strokeWidth={3} strokeLinecap="round"
              strokeDasharray={`${loopRun * ELLIPSE_L} ${ELLIPSE_L}`} />
            {loopRun > 0 && loopRun < 1 && (() => {
              const [x, y] = along(ELLIPSE, loopRun);
              return <SignalGlyph x={x} y={y} size={16} />;
            })()}
          </svg>
          {LOOP.map((k, i) => {
            const a = -Math.PI / 2 + (i / 4) * Math.PI * 2;
            const lit = loopRun >= i / 4 + 0.02 || (i === 0 && loopRun > 0);
            return (
              <div key={k} style={{ position: "absolute", left: 310 + 250 * Math.cos(a), top: 190 + 140 * Math.sin(a), transform: "translate(-50%, -50%)",
                padding: "12px 20px", borderRadius: 999, background: color.ink, border: `1.5px solid ${lit ? color.signal : color.line2}`,
                fontWeight: 750, fontSize: 26, letterSpacing: "0.04em", color: lit ? color.paper : color.mist, whiteSpace: "nowrap" }}>{k}</div>
            );
          })}
          <div style={{ position: "absolute", left: 310, top: 190, transform: `translate(-50%, -50%) scale(${0.9 + 0.1 * relaunch})`, display: "flex", alignItems: "center", gap: 12,
            opacity: relaunch, fontWeight: 800, fontSize: 36, letterSpacing: "0.06em", color: color.signal }}>
            <IconRefresh s={38} c={color.signal} w={2.2} />RELANCE
          </div>
        </div>
      )}
      {/* the placements — said and shown */}
      {bigType && (
        <div style={{ position: "absolute", left: 80, right: 60, top: 960 }}>
          <Mono size={24} c={color.mist} style={{ opacity: prog(t, T.facebook - 0.05, 0.3) }}>Vos campagnes</Mono>
          <KineticLine t={t} size={104} align="left" style={{ marginTop: 14 }}
            words={[{ text: "FACEBOOK", at: T.facebook }, { text: "&", at: T.et, dim: true }]} />
          <KineticLine t={t} size={104} align="left"
            words={[{ text: "INSTAGRAM", at: T.instagram }, { text: "ADS", at: T.ads, accent: true }]} />
        </div>
      )}
    </AbsoluteFill>
  );
};

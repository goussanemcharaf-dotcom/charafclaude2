import React from "react";
import { AbsoluteFill } from "remotion";
import { color, font } from "../lib/tokens";
import { clamp, ease, invLerp, prog } from "../lib/anim";
import { at, ph } from "../timeline";
import { KineticLine } from "../components/Kinetic";
import { Wordmark } from "../components/Wordmark";
import { SignalGlyph } from "../components/Signal";
import { IconChat, IconCheckCircle, IconFlask, IconLayers, IconMegaphone, IconUser } from "../components/Icons";

// 10 — BRAND & CTA. Hard cut to paper: the wordmark, then Meta Ads · Stratégie · Création ·
// Performance on the beat. The system returns, organised, under the question. Then the final,
// quiet screen and one action: « Parlons de votre projet. »

const T = {
  eskayli: at(23, "eskayli"), meta: at(24, "meta"), strategie: at(25, "stratégie"), creation: at(26, "création"), performance: at(27, "performance"),
  p27end: ph(27).end, vous: at(28, "vous"), facebook: at(28, "facebook"), instagram: at(28, "instagram"), veritable: at(28, "véritable"),
  canal: at(28, "canal"), acquisition: at(28, "d’acquisition"), business: at(28, "business"), p28end: ph(28).end,
  parlons: at(29, "parlons"), projet: at(29, "projet"),
};
export const BRAND_IN = ph(23).start - 0.3; // = IDEA_OUT
export const SYSTEM_BACK = T.vous - 0.35; // back to dark: the organised system
export const FINAL_AT = T.parlons - 0.3; // the final screen
const INK = color.ink;

const FOUR = [
  { k: "META ADS", at: T.meta },
  { k: "STRATÉGIE", at: T.strategie },
  { k: "CRÉATION", at: T.creation },
  { k: "PERFORMANCE", at: T.performance },
];
const MAP = [
  { k: "CAMPAGNE", x: 196, y: 1150, icon: IconMegaphone }, { k: "CRÉATIVES", x: 540, y: 1150, icon: IconLayers }, { k: "TESTS", x: 884, y: 1150, icon: IconFlask },
  { k: "CLIENTS", x: 196, y: 1370, hot: true, icon: IconCheckCircle }, { k: "CONVERSATIONS", x: 540, y: 1370, icon: IconChat }, { k: "PROSPECTS", x: 884, y: 1370, icon: IconUser },
];
const WORD_Y = (i: number) => 1010 + i * 106;

export const C10Brand: React.FC<{ t: number }> = ({ t }) => {
  const paper1 = t < SYSTEM_BACK;
  const final = t >= FINAL_AT;
  // the wordmark lands on the hard cut with the sonic logo; the i-dot pops on its second tone
  const mark = ease.outExpo(invLerp(BRAND_IN, BRAND_IN + 0.7, t));
  const dotPop = ease.outBackSoft(invLerp(BRAND_IN - 0.02, BRAND_IN + 0.33, t));
  if (paper1) {
    return (
      <AbsoluteFill style={{ background: color.paper }}>
        <div style={{ position: "absolute", left: 540, top: 780, transform: `translate(-50%, -50%) scale(${0.94 + 0.06 * mark})`, opacity: mark }}>
          <Wordmark size={180} ink={INK} dot={dotPop} />
        </div>
        {FOUR.map((w, i) => {
          const p = prog(t, w.at - 0.08, 0.45);
          const next = i < FOUR.length - 1 ? FOUR[i + 1].at - 0.08 : Infinity;
          const on = prog(t, w.at - 0.08, 0.3) * (1 - prog(t, next, 0.2)) * (1 - prog(t, T.p27end + 0.1, 0.3));
          return (
            <div key={w.k} style={{ position: "absolute", left: 0, right: 0, top: WORD_Y(i), textAlign: "center", opacity: p,
              transform: `translateY(${(1 - p) * 24}px)`, fontFamily: font.sans, fontWeight: 800, fontSize: 76, letterSpacing: "-0.03em",
              color: t < next || t > T.p27end ? INK : "rgba(11,11,12,0.38)" }}>
              <span style={{ position: "relative", display: "inline-block" }}>
                <span style={{ position: "absolute", left: -44, top: "50%", width: 18, height: 18, marginTop: -9, borderRadius: 9, background: color.signal,
                  opacity: on, transform: `scale(${0.4 + 0.6 * on})` }} />
                {w.k}
              </span>
            </div>
          );
        })}
      </AbsoluteFill>
    );
  }
  if (!final) {
    // the system returns — organised, calm, on the grid
    const route = clamp(invLerp(T.vous, T.business, t));
    const pts = MAP.map((m) => [m.x, m.y] as [number, number]);
    const path = [pts[0], pts[1], pts[2], [pts[2][0], (pts[2][1] + pts[5][1]) / 2], pts[5], pts[4], pts[3]] as [number, number][];
    const segs = path.slice(1).map((p, i) => Math.hypot(p[0] - path[i][0], p[1] - path[i][1]));
    const total = segs.reduce((a, b) => a + b, 0);
    let rem = route * total;
    let hx = path[0][0], hy = path[0][1];
    for (let i = 0; i < segs.length; i++) {
      if (rem <= segs[i]) { const k = rem / segs[i]; hx = path[i][0] + (path[i + 1][0] - path[i][0]) * k; hy = path[i][1] + (path[i + 1][1] - path[i][1]) * k; break; }
      rem -= segs[i]; hx = path[i + 1][0]; hy = path[i + 1][1];
    }
    const d = `M${path.map((p) => p.join(",")).join(" L")}`;
    return (
      <AbsoluteFill>
        <div style={{ position: "absolute", left: 80, right: 60, top: 440 }}>
          <KineticLine t={t} size={44} weight={600} align="left" tracking="-0.02em"
            words={[{ text: "Vous", at: T.vous, dim: true }, { text: "voulez", at: at(28, "voulez"), dim: true }, { text: "faire", at: at(28, "faire"), dim: true },
              { text: "de", at: at(28, "de"), dim: true }]} />
          <KineticLine t={t} size={80} align="left" style={{ marginTop: 6 }}
            words={[{ text: "FACEBOOK", at: T.facebook }, { text: "&", at: at(28, "et"), dim: true }, { text: "INSTAGRAM", at: T.instagram }]} />
          <KineticLine t={t} size={44} weight={600} align="left" tracking="-0.02em" style={{ marginTop: 10 }}
            words={[{ text: "un", at: at(28, "un"), dim: true }, { text: "véritable", at: T.veritable, dim: true }]} />
          <KineticLine t={t} size={80} align="left" style={{ marginTop: 6 }}
            words={[{ text: "CANAL", at: T.canal, accent: true }, { text: "D’ACQUISITION", at: T.acquisition, accent: true }]} />
          <KineticLine t={t} size={44} weight={600} align="left" tracking="-0.02em" style={{ marginTop: 10 }}
            words={[{ text: "pour", at: at(28, "pour"), dim: true }, { text: "votre", at: at(28, "votre"), dim: true }, { text: "business ?", at: T.business }]} />
        </div>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: prog(t, SYSTEM_BACK, 0.5) }}>
          <path d={d} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={3} />
          <path d={d} fill="none" stroke={color.signal} strokeWidth={3} strokeDasharray={`${route * total} ${total}`} />
          {route > 0 && route < 1 && <SignalGlyph x={hx} y={hy} size={16} />}
        </svg>
        {MAP.map((m, i) => {
          const p = prog(t, SYSTEM_BACK + 0.1 + i * 0.08, 0.5);
          const lit = route >= [0, 0.18, 0.36, 1, 0.82, 0.64][i];
          const hot = m.hot && lit;
          const Ic = m.icon;
          return (
            <div key={m.k} style={{ position: "absolute", left: m.x, top: m.y, transform: `translate(-50%, -50%) scale(${(0.9 + 0.1 * p) * (hot ? 1.08 : 1)})`, opacity: p,
              display: "flex", alignItems: "center", gap: 12, padding: "20px 22px", borderRadius: 22, whiteSpace: "nowrap", fontFamily: font.sans, fontWeight: 750,
              fontSize: 26, letterSpacing: "0.03em", background: hot ? color.signal : color.panel2, color: hot ? "#170800" : lit ? color.paper : color.mist,
              border: `1.5px solid ${lit ? (m.hot ? color.signal : color.line2) : color.line}`, boxShadow: hot ? "0 0 0 10px rgba(255,90,31,0.12)" : undefined }}>
              <Ic s={30} c={hot ? "#170800" : lit ? color.signal : color.mist} w={1.8} />{m.k}
            </div>
          );
        })}
      </AbsoluteFill>
    );
  }
  // final screen
  const f = (d: number, dur = 0.5) => prog(t, FINAL_AT + d, dur);
  const cta = prog(t, T.parlons - 0.05, 0.5);
  const rule = ease.inOutCubic(invLerp(T.projet, T.projet + 0.7, t));
  const pulse = ((t - T.projet) * 0.6) % 1;
  return (
    <AbsoluteFill style={{ background: color.paper }}>
      <div style={{ position: "absolute", left: 540, top: 600, transform: "translate(-50%, -50%)", opacity: f(0) }}>
        <Wordmark size={130} ink={INK} dotPulse={t > T.projet + 0.3 ? pulse : undefined} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 730, textAlign: "center", opacity: f(0.1), fontFamily: font.mono, fontWeight: 600,
        fontSize: 27, letterSpacing: "0.1em", color: INK }}>
        META ADS <span style={{ color: color.signal }}>•</span> STRATÉGIE <span style={{ color: color.signal }}>•</span> CRÉATION <span style={{ color: color.signal }}>•</span> PERFORMANCE
      </div>
      <div style={{ position: "absolute", left: 120, right: 120, top: 860, textAlign: "center", opacity: f(0.2), fontFamily: font.sans, fontWeight: 600,
        fontSize: 38, lineHeight: 1.3, letterSpacing: "-0.01em", color: "rgba(11,11,12,0.66)" }}>
        Vous voulez transformer Facebook &amp; Instagram en canal d’acquisition{" "}?
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1080, display: "flex", flexDirection: "column", alignItems: "center", opacity: cta,
        transform: `translateY(${(1 - cta) * 26}px)` }}>
        <div style={{ fontFamily: font.sans, fontWeight: 800, fontSize: 92, letterSpacing: "-0.04em", lineHeight: 1.02, color: INK, textAlign: "center" }}>
          PARLONS DE<br />VOTRE PROJET.
        </div>
        <div style={{ marginTop: 40, display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ width: 18, height: 18, borderRadius: 9, background: color.signal, boxShadow: `0 0 0 ${10 * pulse}px rgba(255,90,31,${0.25 * (1 - pulse)})` }} />
          <span style={{ width: 360 * rule, height: 5, borderRadius: 3, background: color.signal }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

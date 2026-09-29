import React from "react";
import { AbsoluteFill } from "remotion";
import { color, font } from "../lib/tokens";
import { clamp, ease, invLerp, keys, lerp, prog } from "../lib/anim";
import { at, ph } from "../timeline";
import { Mono, Panel } from "../components/base";
import { KineticLine } from "../components/Kinetic";
import { SignalGlyph } from "../components/Signal";
import { IconAlert, IconBolt, IconChat, IconPin, IconTag, IconUser, IconUsers } from "../components/Icons";
import { DIVE_AT } from "./C03Problem";

// 04 — BUSINESS INTELLIGENCE. The business as a precise core; six satellites light on their words and
// each becomes marketing material: offer architecture, market, an audience profile, intent signals,
// pain points, purchase triggers.

const T = {
  comprendre: at(4, "comprendre"), votre: at(4, "votre", 1), business: at(4, "business"), p4end: ph(4).end,
  offre: at(5, "offre"), marche: at(6, "marché"), client: at(7, "client"), ideal: at(7, "idéal"), p7end: ph(7).end,
  besoins: at(8, "besoins"), frustrations: at(8, "frustrations"), motivations: at(8, "motivations"),
  chez: at(9, "chez"),
};
export const CORE = { x: 540, y: 1000, r: 330 };
export const BUSINESS_OUT = T.chez + 0.9;

export type Sat = { k: string; angle: number; at: number; icon: (c: string) => React.ReactNode; tags: string[]; hot?: boolean };
export const SATS: Sat[] = [
  { k: "OFFRE", angle: -120, at: T.offre, icon: (c) => <IconTag s={28} c={c} />, tags: ["Produit", "Prix", "Promesse"] },
  { k: "MARCHÉ", angle: -60, at: T.marche, icon: (c) => <IconPin s={28} c={c} />, tags: ["Alger", "Oran", "Constantine"] },
  { k: "CLIENT IDÉAL", angle: 0, at: T.client, icon: (c) => <IconUser s={28} c={c} />, tags: ["Profil d’audience"] },
  { k: "BESOINS", angle: 60, at: T.besoins, icon: (c) => <IconChat s={28} c={c} />, tags: ["Rapidité", "Clarté"] },
  { k: "FRUSTRATIONS", angle: 120, at: T.frustrations, icon: (c) => <IconAlert s={28} c={c} />, tags: ["Délais", "Prix flou"] },
  { k: "MOTIVATIONS", angle: 180, at: T.motivations, icon: (c) => <IconBolt s={28} c={c} />, tags: ["Qualité", "Confiance"], hot: true },
];
export const satPos = (s: Sat, rot = 0) => {
  const a = ((s.angle + rot) * Math.PI) / 180;
  return [CORE.x + CORE.r * Math.cos(a), CORE.y + CORE.r * Math.sin(a)] as [number, number];
};

export const SatPill: React.FC<{ s: Sat; on: number; w?: number }> = ({ s, on, w }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 22px", borderRadius: 20, whiteSpace: "nowrap", width: w, boxSizing: "border-box",
    background: on > 0.5 ? (s.hot ? "rgba(255,90,31,0.14)" : color.panel2) : "rgba(255,255,255,0.03)",
    border: `1.5px solid ${on > 0.5 ? (s.hot ? color.signal : color.line2) : color.line}`,
    fontFamily: font.sans, fontWeight: 750, fontSize: 31, letterSpacing: "0.02em", color: on > 0.5 ? color.paper : color.mist2,
    boxShadow: on > 0.5 ? "0 24px 48px -24px rgba(0,0,0,0.8)" : undefined }}>
    {s.icon(on > 0.5 ? (s.hot ? color.signal : color.paper) : color.mist2)}
    {s.k}
  </div>
);

const Profile: React.FC<{ p: number }> = ({ p }) => (
  <Panel w={760} pad={40} active={1} style={{ transform: `scale(${0.7 + 0.3 * p})`, opacity: p }}>
    <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
      <div style={{ width: 96, height: 96, borderRadius: 48, background: color.panel3, display: "grid", placeItems: "center" }}>
        <IconUser s={54} c={color.mist} w={1.5} />
      </div>
      <div>
        <Mono size={21} c={color.signal}>Client idéal · Profil d’audience</Mono>
        <div style={{ fontSize: 46, fontWeight: 750, letterSpacing: "-0.02em", marginTop: 4 }}>Qui achète, et pourquoi</div>
      </div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 28px", marginTop: 28 }}>
      {[["Âge", "25 – 44 ans"], ["Ville", "Alger · Oran"], ["Centres d’intérêt", "Maison · Bien-être"], ["Comportement", "Compare avant d’acheter"]].map(([k, v]) => (
        <div key={k}>
          <Mono size={18}>{k}</Mono>
          <div style={{ fontSize: 30, fontWeight: 600, marginTop: 6 }}>{v}</div>
        </div>
      ))}
    </div>
  </Panel>
);

export const C04Business: React.FC<{ t: number }> = ({ t }) => {
  const coreIn = ease.outExpo(invLerp(DIVE_AT + 0.25, DIVE_AT + 1.0, t));
  const rot = (t - DIVE_AT) * 2.2; // slow orbit drift (deg)
  const profile = clamp(ease.outExpo(invLerp(T.client + 0.05, T.client + 0.6, t)) - ease.inCubic(invLerp(T.besoins - 0.45, T.besoins - 0.05, t)));
  const push = keys(t, [[DIVE_AT + 0.3, 1.08], [T.chez, 1.0]], ease.outCubic);
  const out = ease.inCubic(invLerp(T.chez + 0.3, BUSINESS_OUT, t)); // satellites leave for the Eskayli grid (C05)
  const headO = prog(t, DIVE_AT + 0.2, 0.4) * (1 - prog(t, T.offre - 0.35, 0.3));
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <div style={{ position: "absolute", left: 60, right: 60, top: 440, opacity: headO }}>
        <KineticLine t={t} size={46} weight={600} align="left" tracking="-0.02em"
          words={[{ text: "il", at: at(4, "il"), dim: true }, { text: "faut", at: at(4, "faut"), dim: true }, { text: "comprendre", at: T.comprendre },
            { text: "votre", at: T.votre, dim: true }]} />
        <KineticLine t={t} size={130} align="left" words={[{ text: "BUSINESS", at: T.business }]} />
      </div>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: `${CORE.x}px ${CORE.y}px` }}>
        {/* orbit */}
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <circle cx={CORE.x} cy={CORE.y} r={CORE.r} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth={2} strokeDasharray="5 11"
            opacity={coreIn} transform={`rotate(${rot * 3} ${CORE.x} ${CORE.y})`} />
          <circle cx={CORE.x} cy={CORE.y} r={CORE.r * 0.62} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1.5} opacity={coreIn} />
          {SATS.map((s) => {
            const [x, y] = satPos(s, rot);
            const on = prog(t, s.at - 0.1, 0.5);
            return <line key={s.k} x1={CORE.x} y1={CORE.y} x2={x} y2={y} stroke={s.hot ? color.signal : "rgba(255,255,255,0.22)"}
              strokeWidth={s.hot ? 2.5 : 1.5} opacity={on * coreIn} strokeDasharray={`${CORE.r * on} ${CORE.r}`} />;
          })}
          {SATS.map((s) => {
            // a signal travels from the core to each satellite as it lights
            const u = invLerp(s.at - 0.15, s.at + 0.25, t);
            if (u <= 0 || u >= 1) return null;
            const [x, y] = satPos(s, rot);
            return <SignalGlyph key={s.k} x={lerp(CORE.x, x, ease.inOutCubic(u))} y={lerp(CORE.y, y, ease.inOutCubic(u))} size={14} />;
          })}
        </svg>
        {/* core */}
        <div style={{ position: "absolute", left: CORE.x, top: CORE.y, transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * coreIn})`, opacity: coreIn }}>
          <div style={{ width: 250, height: 250, borderRadius: 64, background: `radial-gradient(80% 80% at 30% 25%, #2A2A2E 0%, #151517 70%)`,
            border: `1.5px solid ${color.line2}`, display: "grid", placeItems: "center", boxShadow: "0 50px 100px -40px rgba(0,0,0,0.9)" }}>
            <div style={{ textAlign: "center" }}>
              <IconUsers s={46} c={color.paper} w={1.6} />
              <div style={{ fontFamily: font.sans, fontWeight: 800, fontSize: 30, letterSpacing: "0.02em", marginTop: 12, lineHeight: 1.05 }}>VOTRE<br />BUSINESS</div>
            </div>
          </div>
        </div>
        {/* satellites + their transformations */}
        {SATS.map((s) => {
          const [x, y] = satPos(s, rot);
          const on = prog(t, s.at - 0.1, 0.45);
          const appear = prog(t, T.business + 0.1 + SATS.indexOf(s) * 0.07, 0.5);
          const below = s.angle > 10 && s.angle < 170;
          const tagsP = s.k === "CLIENT IDÉAL" ? 0 : prog(t, s.at + 0.2, 0.5);
          return (
            <div key={s.k} style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${0.9 + 0.1 * on})`, opacity: appear,
              display: "flex", flexDirection: below ? "column" : "column-reverse", alignItems: "center", gap: 12 }}>
              <SatPill s={s} on={on} />
              <div style={{ display: "flex", gap: 8, opacity: tagsP, transform: `translateY(${(below ? 1 : -1) * (1 - tagsP) * 14}px)` }}>
                {s.tags.map((g) => (
                  <span key={g} style={{ fontFamily: font.sans, fontSize: 24, fontWeight: 600, padding: "8px 15px", borderRadius: 999,
                    color: s.hot ? color.signal : color.paperDim, border: `1.5px solid ${s.hot ? color.signalLine : color.line2}`, background: "rgba(11,11,12,0.85)" }}>{g}</span>
                ))}
              </div>
            </div>
          );
        })}
        {/* the ideal-client profile comes forward, then returns */}
        {profile > 0.01 && (
          <div style={{ position: "absolute", left: CORE.x, top: CORE.y, transform: "translate(-50%, -50%)" }}>
            <Profile p={profile} />
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

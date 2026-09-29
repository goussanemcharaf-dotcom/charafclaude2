import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { color, font } from "../lib/tokens";
import { clamp, ease, invLerp, keys, lerp, prog } from "../lib/anim";
import { at, ph } from "../timeline";
import { Mono, Panel } from "../components/base";
import { KineticLine } from "../components/Kinetic";
import { SignalGlyph } from "../components/Signal";
import { IconCheckCircle, IconEye, IconUser } from "../components/Icons";

// 08 — BUSINESS OUTCOME. « L'objectif ? » — visual silence. Then one page the camera scrolls down:
// the budget signal drops along a spine through four real business events — the feed stops on the
// ad, a qualified inquiry, a professional conversation, a confirmed order — and the camera pulls
// back as a pulse runs through all four: one continuous acquisition flow.

const T = {
  objectif: at(15, "l’objectif"), p15end: ph(15).end,
  transformer: at(16, "transformer"), budget: at(16, "budget"), publicitaire: at(16, "publicitaire"), en: at(16, "en"),
  attention: at(17, "attention"), prospects: at(18, "prospects"), conversations: at(19, "conversations"), clients: at(20, "clients"),
  end: ph(20).end, next: ph(21).start,
};
export const OUTCOME_IN = T.objectif - 0.35;
export const OUTCOME_OUT = T.next - 0.35;

const SPINE_X = 112;
const STAGE_Y = [700, 990, 1280, 1570]; // world y (top) of each stage
const STAGES = [
  { k: "ATTENTION", at: T.attention },
  { k: "PROSPECTS", at: T.prospects },
  { k: "CONVERSATIONS", at: T.conversations },
  { k: "CLIENTS", at: T.clients },
];
const DOT = (i: number) => STAGE_Y[i] + 34; // spine dot level = title centre
const FEED = ["ad_food.jpg", "ad_estate.jpg", "ad_shop.jpg"];

const Bubble: React.FC<{ text: string; me?: boolean; p: number }> = ({ text, me, p }) => (
  <div style={{ alignSelf: me ? "flex-end" : "flex-start", whiteSpace: "nowrap", padding: "14px 20px", borderRadius: 22,
    borderBottomRightRadius: me ? 6 : 22, borderBottomLeftRadius: me ? 22 : 6, fontSize: 25, fontWeight: 550, lineHeight: 1.25,
    background: me ? color.paper : color.panel3, color: me ? color.ink : color.paper, opacity: p, transform: `translateY(${(1 - p) * 14}px)` }}>{text}</div>
);

export const C08Outcome: React.FC<{ t: number }> = ({ t }) => {
  const inP = prog(t, OUTCOME_IN, 0.4);
  const out = ease.inCubic(invLerp(OUTCOME_OUT - 0.1, OUTCOME_OUT + 0.4, t));
  // 8.1 visual silence
  const q = prog(t, T.objectif - 0.1, 0.5) * (1 - prog(t, T.transformer - 0.35, 0.3));
  // 8.2 / 8.3 the page and its spine
  const page = prog(t, T.transformer - 0.15, 0.4);
  const spine = prog(t, T.transformer + 0.2, 0.8);
  const drop = keys(t, [[T.transformer, DOT(0) - 150], [T.attention - 0.1, DOT(0) - 150], [T.attention + 0.2, DOT(0)],
    [T.prospects - 0.1, DOT(0)], [T.prospects + 0.2, DOT(1)], [T.conversations - 0.1, DOT(1)], [T.conversations + 0.2, DOT(2)],
    [T.clients - 0.1, DOT(2)], [T.clients + 0.2, DOT(3)]], ease.inOutCubic);
  const camY = keys(t, [[T.conversations - 0.25, 0], [T.conversations + 0.25, -170], [T.clients - 0.25, -170], [T.clients + 0.25, -390],
    [T.clients + 0.45, -390], [T.end + 0.25, -187]], ease.inOutCubic);
  const camZ = keys(t, [[T.clients + 0.45, 1], [T.end + 0.25, 0.78]], ease.inOutCubic);
  const pulse = clamp(invLerp(T.end - 0.05, T.end + 0.55, t)); // one pulse through the four events
  const pulseY = lerp(DOT(0), DOT(3), ease.inOutCubic(pulse));
  const headOut = prog(t, T.conversations - 0.3, 0.4);
  return (
    <AbsoluteFill style={{ opacity: inP * (1 - out) }}>
      {/* L'objectif ? */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 850, textAlign: "center", opacity: q, transform: `scale(${0.97 + 0.03 * q})`,
        fontFamily: font.sans, fontWeight: 700, fontSize: 104, letterSpacing: "-0.035em", color: color.paper }}>
        L’objectif{" "}?
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: q }}>
        <SignalGlyph x={540} y={1060} size={20} ring={((t - T.objectif) * 0.8) % 1} />
      </svg>
      {/* the page */}
      <AbsoluteFill style={{ opacity: page, transform: `translateY(${camY}px) scale(${camZ})`, transformOrigin: "540px 1000px" }}>
        <div style={{ position: "absolute", left: 80, right: 60, top: 440, opacity: 1 - headOut }}>
          <KineticLine t={t} size={62} weight={750} align="left" tracking="-0.03em"
            words={[{ text: "Transformer", at: T.transformer }, { text: "votre", at: at(16, "votre"), dim: true }, { text: "budget", at: T.budget },
              { text: "publicitaire", at: T.publicitaire }, { text: "en :", at: T.en, dim: true }]} />
        </div>
        <svg width={1080} height={2400} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <line x1={SPINE_X} y1={DOT(0) - 150} x2={SPINE_X} y2={lerp(DOT(0) - 150, DOT(3), spine)} stroke="rgba(255,255,255,0.13)" strokeWidth={3} />
          <line x1={SPINE_X} y1={DOT(0) - 150} x2={SPINE_X} y2={drop} stroke={color.signal} strokeWidth={3 + 2 * pulse} opacity={spine > 0 ? 1 : 0} />
          {pulse > 0 && pulse < 1 && <line x1={SPINE_X} y1={Math.max(DOT(0), pulseY - 140)} x2={SPINE_X} y2={pulseY} stroke="#FFD2BF" strokeWidth={6} strokeLinecap="round" />}
          {STAGES.map((s, i) => {
            const hit = t > s.at + 0.15;
            const flash = pulse > 0 && pulse < 1 ? clamp(1 - Math.abs(pulseY - DOT(i)) / 90) : 0;
            return (
              <g key={s.k} opacity={spine}>
                <circle cx={SPINE_X} cy={DOT(i)} r={12 + 6 * flash} fill={hit ? color.signal : color.panel3} />
                {flash > 0 && <circle cx={SPINE_X} cy={DOT(i)} r={26 + 20 * flash} fill={color.signal} opacity={0.18 * flash} />}
              </g>
            );
          })}
          {spine > 0 && t < T.end + 0.1 && <SignalGlyph x={SPINE_X} y={drop} size={18} />}
        </svg>
        {STAGES.map((s, i) => {
          const p = prog(t, s.at - 0.12, 0.5);
          if (p <= 0) return null;
          const last = i === 3;
          return (
            <div key={s.k} style={{ position: "absolute", left: SPINE_X + 52, top: STAGE_Y[i], width: 860, opacity: clamp(p), transform: `translateX(${(1 - clamp(p)) * 50}px)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18, height: 68 }}>
                <Mono size={22} c={last ? color.signal : color.mist}>{`0${i + 1}`}</Mono>
                <span style={{ fontWeight: 800, fontSize: 68, letterSpacing: "-0.035em", color: last ? color.signal : color.paper }}>{s.k}</span>
              </div>
              <div style={{ marginTop: 14 }}>
                {i === 0 && (
                  <Panel w={680} pad={18} active={clamp((t - s.at) * 2)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
                      <div style={{ width: 130, height: 130, borderRadius: 18, overflow: "hidden", flex: "none", position: "relative" }}>
                        <div style={{ transform: `translateY(${-260 * ease.outCubic(invLerp(s.at - 0.15, s.at + 0.5, t))}px)` }}>
                          {FEED.map((f) => <Img key={f} src={staticFile(`assets/images/${f}`)} style={{ width: 130, height: 130, objectFit: "cover", display: "block" }} />)}
                        </div>
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <IconEye s={28} c={color.signal} />
                          <Mono size={18} c={color.signal}>Publicité · Sponsorisé</Mono>
                        </div>
                        <div style={{ fontSize: 30, fontWeight: 650, lineHeight: 1.2, marginTop: 8 }}>Le défilement s’arrête<br />sur votre publicité.</div>
                      </div>
                    </div>
                  </Panel>
                )}
                {i === 1 && (
                  <Panel w={680} pad={24} active={clamp((t - s.at) * 2)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                      <div style={{ width: 64, height: 64, borderRadius: 32, background: color.panel3, display: "grid", placeItems: "center", flex: "none" }}><IconUser s={34} c={color.paper} /></div>
                      <div>
                        <Mono size={18} c={color.signal}>Nouvelle demande · qualifiée</Mono>
                        <div style={{ fontSize: 31, fontWeight: 700, marginTop: 4 }}>Demande d’informations et de prix</div>
                        <div style={{ fontSize: 24, color: color.mist, marginTop: 2 }}>Oran · via Instagram</div>
                      </div>
                    </div>
                  </Panel>
                )}
                {i === 2 && (
                  <Panel w={680} pad={20}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <Bubble text="Bonjour, c’est disponible cette semaine ?" p={prog(t, s.at + 0.05, 0.3)} />
                      <Bubble me text="Bonjour ! Oui. Je vous envoie les détails." p={prog(t, s.at + 0.5, 0.3)} />
                    </div>
                  </Panel>
                )}
                {i === 3 && (
                  <Panel w={680} pad={26} active={1}>
                    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                      <IconCheckCircle s={62} c={color.signal} w={2} />
                      <div>
                        <div style={{ fontSize: 38, fontWeight: 750 }}>Commande confirmée</div>
                        <div style={{ fontSize: 24, color: color.mist, marginTop: 2 }}>Un nouveau client</div>
                      </div>
                    </div>
                  </Panel>
                )}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

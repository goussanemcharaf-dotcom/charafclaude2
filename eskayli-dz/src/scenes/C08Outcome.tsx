import React from "react";
import { AbsoluteFill } from "remotion";
import { color, font } from "../lib/tokens";
import { clamp, ease, invLerp, keys, lerp, prog } from "../lib/anim";
import { at, ph } from "../timeline";
import { Mono, Panel } from "../components/base";
import { AdPost, CREATIVES } from "../components/Campaign";
import { KineticLine } from "../components/Kinetic";
import { SignalGlyph } from "../components/Signal";
import { IconCheckCircle, IconEye, IconUser } from "../components/Icons";

// 08 — BUSINESS OUTCOME. « L'objectif ? » — visual silence. Then the budget signal drops down one
// spine through four real business events: attention (the feed stops on the ad), a qualified inquiry,
// a professional conversation, a confirmed order. Then the four join into one flow.

const T = {
  objectif: at(15, "l’objectif"), p15end: ph(15).end,
  transformer: at(16, "transformer"), budget: at(16, "budget"), en: at(16, "en"),
  attention: at(17, "attention"), prospects: at(18, "prospects"), conversations: at(19, "conversations"), clients: at(20, "clients"),
  end: ph(20).end, next: ph(21).start,
};
export const OUTCOME_IN = T.objectif - 0.35;
export const OUTCOME_OUT = T.next - 0.35;

const SPINE_X = 110;
const STAGE_Y = [620, 930, 1240, 1550]; // world y of each stage
const STAGES = [
  { k: "ATTENTION", at: T.attention },
  { k: "PROSPECTS", at: T.prospects },
  { k: "CONVERSATIONS", at: T.conversations },
  { k: "CLIENTS", at: T.clients },
];

const Bubble: React.FC<{ text: string; me?: boolean; p: number }> = ({ text, me, p }) => (
  <div style={{ alignSelf: me ? "flex-end" : "flex-start", maxWidth: 440, padding: "14px 18px", borderRadius: 20,
    borderBottomRightRadius: me ? 6 : 20, borderBottomLeftRadius: me ? 20 : 6, fontSize: 23, fontWeight: 550, lineHeight: 1.25,
    background: me ? color.paper : color.panel3, color: me ? color.ink : color.paper, opacity: p, transform: `translateY(${(1 - p) * 14}px)` }}>{text}</div>
);

export const C08Outcome: React.FC<{ t: number }> = ({ t }) => {
  const inP = prog(t, OUTCOME_IN, 0.4);
  const out = ease.inCubic(invLerp(OUTCOME_OUT - 0.1, OUTCOME_OUT + 0.4, t));
  // 8.1 visual silence
  const q = prog(t, T.objectif - 0.1, 0.5) * (1 - prog(t, T.transformer - 0.3, 0.35));
  // 8.2 / 8.3 spine
  const spine = prog(t, T.transformer - 0.2, 0.5);
  const drop = keys(t, [[T.transformer, 0], [T.attention, 0.02], ...STAGES.map((s, i) => [s.at + 0.15, i / 3] as [number, number])], ease.inOutCubic);
  const camY = keys(t, [[T.conversations - 0.3, 0], [T.conversations + 0.3, -250], [T.clients - 0.25, -250], [T.clients + 0.3, -470],
    [T.end + 0.1, -470], [T.end + 0.6, -200]], ease.inOutCubic);
  const camZ = keys(t, [[T.end + 0.1, 1], [T.end + 0.6, 0.72]], ease.inOutCubic);
  const joined = prog(t, T.end + 0.2, 0.5);
  const sy = lerp(STAGE_Y[0] - 80, STAGE_Y[3] + 60, drop);
  return (
    <AbsoluteFill style={{ opacity: inP * (1 - out) }}>
      {/* L'objectif ? */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, textAlign: "center", opacity: q,
        fontFamily: font.sans, fontWeight: 700, fontSize: 84, letterSpacing: "-0.03em", color: color.paper }}>
        L’objectif{" "}?
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: q }}>
        <SignalGlyph x={540} y={1040} size={22} ring={((t - T.objectif) * 0.8) % 1} />
      </svg>
      {/* headline of the flow */}
      <div style={{ position: "absolute", left: 80, right: 60, top: 430, opacity: spine * (1 - prog(t, T.attention + 0.4, 0.4)) }}>
        <KineticLine t={t} size={44} weight={600} align="left" tracking="-0.02em"
          words={[{ text: "Transformer", at: T.transformer }, { text: "votre", at: at(16, "votre"), dim: true }, { text: "budget", at: T.budget },
            { text: "publicitaire", at: at(16, "publicitaire") }, { text: "en :", at: T.en, dim: true }]} />
      </div>
      <AbsoluteFill style={{ transform: `translateY(${camY}px) scale(${camZ})`, transformOrigin: "540px 1000px" }}>
        {/* spine */}
        <svg width={1080} height={2400} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <line x1={SPINE_X} y1={STAGE_Y[0] - 80} x2={SPINE_X} y2={lerp(STAGE_Y[0] - 80, STAGE_Y[3] + 60, spine)} stroke="rgba(255,255,255,0.12)" strokeWidth={3} />
          <line x1={SPINE_X} y1={STAGE_Y[0] - 80} x2={SPINE_X} y2={sy} stroke={color.signal} strokeWidth={joined > 0 ? 3 + joined * 2 : 3} />
          {STAGES.map((s, i) => <circle key={s.k} cx={SPINE_X} cy={STAGE_Y[i] + 20} r={11} fill={t > s.at ? color.signal : color.panel3} />)}
          {spine > 0 && <SignalGlyph x={SPINE_X} y={sy} size={20} />}
        </svg>
        {STAGES.map((s, i) => {
          const p = prog(t, s.at - 0.12, 0.55);
          const y = STAGE_Y[i];
          const last = i === 3;
          return (
            <div key={s.k} style={{ position: "absolute", left: SPINE_X + 50, top: y - 20, width: 860, opacity: clamp(p), transform: `translateX(${(1 - clamp(p)) * 50}px)` }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
                <Mono size={22} c={last ? color.signal : color.mist}>{`0${i + 1}`}</Mono>
                <span style={{ fontFamily: font.sans, fontWeight: 800, fontSize: 64, letterSpacing: "-0.03em", color: last ? color.signal : color.paper }}>{s.k}</span>
              </div>
              <div style={{ marginTop: 14 }}>
                {i === 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
                    <AdPost c={CREATIVES.shop} w={260} highlight={clamp((t - s.at) * 2)} />
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <IconEye s={40} c={color.signal} />
                      <span style={{ fontFamily: font.sans, fontSize: 28, fontWeight: 600, color: color.paperDim }}>Le défilement s’arrête<br />sur votre publicité.</span>
                    </div>
                  </div>
                )}
                {i === 1 && (
                  <Panel w={620} pad={24} active={1}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 60, height: 60, borderRadius: 30, background: color.panel3, display: "grid", placeItems: "center" }}><IconUser s={32} c={color.paper} /></div>
                      <div>
                        <Mono size={16} c={color.signal}>Nouvelle demande · qualifiée</Mono>
                        <div style={{ fontSize: 28, fontWeight: 700, marginTop: 2 }}>Demande d’informations et de prix</div>
                        <div style={{ fontSize: 22, color: color.mist, marginTop: 2 }}>Oran · via Instagram</div>
                      </div>
                    </div>
                  </Panel>
                )}
                {i === 2 && (
                  <Panel w={620} pad={22}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <Bubble text="Bonjour, c’est disponible cette semaine ?" p={prog(t, s.at + 0.1, 0.35)} />
                      <Bubble me text="Bonjour ! Oui. Je vous envoie les détails." p={prog(t, s.at + 0.6, 0.35)} />
                    </div>
                  </Panel>
                )}
                {i === 3 && (
                  <Panel w={620} pad={24} active={1}>
                    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                      <IconCheckCircle s={58} c={color.signal} w={2} />
                      <div>
                        <div style={{ fontSize: 34, fontWeight: 750 }}>Commande confirmée</div>
                        <div style={{ fontSize: 22, color: color.mist, marginTop: 2 }}>Un nouveau client</div>
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

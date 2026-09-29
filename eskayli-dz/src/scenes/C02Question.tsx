import React from "react";
import { AbsoluteFill } from "remotion";
import { color, font } from "../lib/tokens";
import { clamp, ease, invLerp, keys, prog } from "../lib/anim";
import { at, ph } from "../timeline";
import { Mono } from "../components/base";
import { KineticLine } from "../components/Kinetic";
import { Route, SignalGlyph } from "../components/Signal";
import { IconEye, IconCursor, IconUser, IconCheck } from "../components/Icons";

// 02 — THE QUESTION. BUDGET → PUBLICITÉ → an empty destination. Views and clicks tick; the clients
// row stays empty while the voice lets the question hang.

const T = {
  mais: at(2, "mais"), votre: at(2, "votre"), budget: at(2, "budget"), vous: at(2, "vous"), apporte: at(2, "apporte"),
  vraiment: at(2, "vraiment"), des: at(2, "des"), clients: at(2, "clients"), end: ph(2).end,
};
export const QUESTION_OUT = ph(3).start - 0.35;

const FLOW_Y = 1010;
const N1 = { x: 205, label: "BUDGET" };
const N2 = { x: 540, label: "PUBLICITÉ" };
const DEST = { x: 875, r: 72 };

const Node: React.FC<{ x: number; label: string; p: number; lit: boolean; icon: React.ReactNode }> = ({ x, label, p, lit, icon }) => (
  <div style={{ position: "absolute", left: x, top: FLOW_Y, transform: `translate(-50%, -50%) scale(${0.9 + 0.1 * p})`, opacity: p,
    display: "flex", alignItems: "center", gap: 14, padding: "20px 26px", borderRadius: 22, whiteSpace: "nowrap",
    background: lit ? "rgba(255,90,31,0.08)" : color.panel, border: `1.5px solid ${lit ? color.signalLine : color.line2}`,
    fontFamily: font.sans, fontWeight: 700, fontSize: 32, letterSpacing: "-0.01em", color: color.paper }}>
    {icon}{label}
  </div>
);

const LADDER = [
  { k: "VUES", icon: <IconEye s={30} c={color.mist} />, fill: 0.92 },
  { k: "CLICS", icon: <IconCursor s={30} c={color.mist} />, fill: 0.55 },
  { k: "PROSPECTS", icon: <IconUser s={30} c={color.mist} />, fill: 0.12 },
  { k: "CLIENTS", icon: <IconCheck s={30} c={color.signal} />, fill: 0 },
];

export const C02Question: React.FC<{ t: number }> = ({ t }) => {
  const out = ease.inCubic(invLerp(QUESTION_OUT, QUESTION_OUT + 0.45, t));
  const n1 = prog(t, T.votre - 0.1, 0.5), n2 = prog(t, T.vous - 0.15, 0.5), d = prog(t, T.apporte - 0.1, 0.6);
  // the signal: in from the left edge (from the hook) → budget → publicité → the destination
  const pts: [number, number][] = [[-40, FLOW_Y], [N1.x, FLOW_Y], [N2.x, FLOW_Y], [DEST.x - DEST.r - 6, FLOW_Y]];
  const r = keys(t, [[T.mais, 0], [T.budget + 0.05, 0.33], [T.vous, 0.33], [T.apporte + 0.15, 0.66], [T.vraiment, 0.66], [T.vraiment + 0.5, 1]], ease.inOutCubic);
  const ladderIn = (i: number) => prog(t, T.vraiment + 0.05 + i * 0.12 + (i === 3 ? T.clients - T.vraiment - 0.5 : 0), 0.55);
  const pulse = ((t - T.clients) * 0.9) % 1;
  return (
    <AbsoluteFill style={{ opacity: 1 - out, transform: `translateY(${-40 * out}px)`, filter: out > 0.02 ? `blur(${out * 8}px)` : undefined }}>
      {/* headline */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 440 }}>
        <KineticLine t={t} size={44} weight={600} align="left" tracking="-0.02em"
          words={[{ text: "Mais", at: T.mais, dim: true }, { text: "est-ce", at: T.mais + 0.08, dim: true }, { text: "que", at: T.votre - 0.08, dim: true }, { text: "votre", at: T.votre, dim: true }]} />
        <KineticLine t={t} size={124} align="left" words={[{ text: "BUDGET", at: T.budget }]} style={{ marginTop: 4 }} />
        <KineticLine t={t} size={44} weight={600} align="left" tracking="-0.02em" style={{ marginTop: 12 }}
          words={[{ text: "vous", at: T.vous, dim: true }, { text: "apporte", at: T.apporte, dim: true }, { text: "vraiment", at: T.vraiment }]} />
        <KineticLine t={t} size={124} align="left" style={{ marginTop: 4 }}
          words={[{ text: "des", at: T.des, dim: true, size: 64 }, { text: "CLIENTS ?", at: T.clients, accent: true }]} />
      </div>
      {/* flow */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={N1.x} y1={FLOW_Y} x2={DEST.x - DEST.r} y2={FLOW_Y} stroke="rgba(255,255,255,0.12)" strokeWidth={2} strokeDasharray="4 10"
          opacity={Math.max(n1, d)} />
        <circle cx={DEST.x} cy={FLOW_Y} r={DEST.r} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={2} strokeDasharray="6 9"
          opacity={d} transform={`rotate(${t * 12} ${DEST.x} ${FLOW_Y})`} />
        <g opacity={d * 0.7} stroke="rgba(255,255,255,0.5)" strokeWidth={1.5}>
          <line x1={DEST.x - 12} y1={FLOW_Y} x2={DEST.x + 12} y2={FLOW_Y} />
          <line x1={DEST.x} y1={FLOW_Y - 12} x2={DEST.x} y2={FLOW_Y + 12} />
        </g>
      </svg>
      <div style={{ position: "absolute", left: DEST.x, top: FLOW_Y + DEST.r + 22, transform: "translateX(-50%)", opacity: d }}>
        <Mono size={18}>Destination ?</Mono>
      </div>
      <Node x={N1.x} label="BUDGET" p={n1} lit={t > T.budget} icon={<span style={{ width: 14, height: 14, borderRadius: 7, background: color.signal }} />} />
      <Node x={N2.x} label="PUBLICITÉ" p={n2} lit={t > T.apporte} icon={<span style={{ width: 14, height: 14, borderRadius: 7, border: `2px solid ${color.mist}` }} />} />
      <Route pts={pts} p={r} width={3.5} base={false} head={false} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {(() => {
          const L = pts;
          const seg = r * 3;
          const i = Math.min(2, Math.floor(seg));
          const k = seg - i;
          const x = L[i][0] + (L[i + 1][0] - L[i][0]) * k;
          return <SignalGlyph x={x} y={FLOW_Y} size={18} ring={t > T.vraiment + 0.5 ? ((t - T.vraiment) * 0.8) % 1 : undefined} />;
        })()}
      </svg>
      {/* the ladder */}
      <div style={{ position: "absolute", left: 180, top: 1150, width: 720 }}>
        {LADDER.map((row, i) => {
          const p = ladderIn(i);
          const last = i === 3;
          const tick = (t * (i === 0 ? 0.9 : 0.5)) % 1;
          return (
            <div key={row.k} style={{ display: "flex", alignItems: "center", gap: 20, height: 74, marginTop: i ? 10 : 0, padding: "0 24px",
              borderRadius: 18, opacity: p, transform: `translateY(${(1 - p) * 20}px)`,
              border: `1.5px ${last ? "dashed" : "solid"} ${last ? `rgba(255,90,31,${0.35 + 0.35 * (1 - pulse)})` : color.line}`,
              background: last ? "transparent" : "rgba(255,255,255,0.025)" }}>
              {row.icon}
              <span style={{ fontFamily: font.sans, fontWeight: 700, fontSize: 30, letterSpacing: "0.02em", color: last ? color.signal : color.paper, width: 230 }}>{row.k}</span>
              <div style={{ flex: 1, height: 8, borderRadius: 8, background: "rgba(255,255,255,0.07)", overflow: "hidden", position: "relative" }}>
                {!last && <div style={{ width: `${row.fill * 100 * clamp(p)}%`, height: "100%", background: i < 2 ? color.mist : color.mist2, borderRadius: 8 }} />}
                {!last && i < 2 && <div style={{ position: "absolute", top: 0, left: `${tick * 100 * row.fill}%`, width: 30, height: "100%", background: "rgba(255,255,255,0.35)" }} />}
              </div>
              {last && <span style={{ fontFamily: font.mono, fontSize: 30, color: color.signal, opacity: 0.8 }}>?</span>}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

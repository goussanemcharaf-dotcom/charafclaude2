import React from "react";
import { AbsoluteFill } from "remotion";
import { color, font } from "../lib/tokens";
import { clamp, ease, invLerp, keys, lerp, prog } from "../lib/anim";
import { at, ph } from "../timeline";
import { Mono } from "../components/base";
import { KineticLine } from "../components/Kinetic";
import { IconCalendar, IconChat, IconCheckCircle, IconEye, IconSpark, IconUser, IconBag, IconUsers } from "../components/Icons";

// 09 — THE BIG IDEA. « VUES » — then deliberately past them: the camera flies through views,
// interest, prospect, conversation, client, and lands on the business the ads were for: qualified
// inquiries, appointments, orders, customer relationships.

const T = {
  parce: at(21, "parce"), publicite: at(21, "publicité"), seulement: at(21, "seulement"), generer: at(21, "générer"), vues: at(21, "vues"),
  elle: at(22, "elle"), creer: at(22, "créer"), veritables: at(22, "véritables"), opportunites: at(22, "opportunités"), commerciales: at(22, "commerciales"),
  end: ph(22).end, next: ph(23).start,
};
export const IDEA_IN = T.parce - 0.35;
export const IDEA_OUT = T.next - 0.3; // hard cut to the brand frame

const PLANES = [
  { k: "VUES", icon: <IconEye s={70} c={color.mist} w={1.5} /> },
  { k: "INTÉRÊT", icon: <IconSpark s={70} c={color.mist} w={1.5} /> },
  { k: "PROSPECT", icon: <IconUser s={70} c={color.mist} w={1.5} /> },
  { k: "CONVERSATION", icon: <IconChat s={70} c={color.mist} w={1.5} /> },
  { k: "CLIENT", icon: <IconCheckCircle s={70} c={color.signal} w={1.5} /> },
];
const COLS = [
  { k: "Demande qualifiée", icon: <IconUser s={30} c={color.paper} /> },
  { k: "Rendez-vous", icon: <IconCalendar s={30} c={color.paper} /> },
  { k: "Commande", icon: <IconBag s={30} c={color.paper} /> },
  { k: "Relation client", icon: <IconUsers s={30} c={color.paper} /> },
];

export const C09Idea: React.FC<{ t: number }> = ({ t }) => {
  const inP = prog(t, IDEA_IN, 0.4);
  const flyStart = T.vues + 0.35, flyEnd = T.opportunites - 0.05;
  const camZ = keys(t, [[flyStart, 0], [flyEnd, PLANES.length - 1]], ease.inOutCubic);
  const views = prog(t, T.parce, 0.6) * (1 - prog(t, flyStart - 0.2, 0.3));
  const pipe = prog(t, T.opportunites - 0.15, 0.6);
  return (
    <AbsoluteFill style={{ opacity: inP }}>
      {/* 9.1 views */}
      <div style={{ position: "absolute", left: 80, right: 60, top: 440, opacity: 1 - prog(t, flyStart - 0.1, 0.3) }}>
        <KineticLine t={t} size={44} weight={600} align="left" tracking="-0.02em"
          words={[{ text: "Parce", at: T.parce, dim: true }, { text: "qu’une", at: at(21, "qu’une"), dim: true }, { text: "bonne", at: at(21, "bonne"), dim: true },
            { text: "publicité", at: T.publicite }, { text: "ne", at: at(21, "ne"), dim: true }, { text: "doit", at: at(21, "doit"), dim: true },
            { text: "pas", at: at(21, "pas"), dim: true }, { text: "seulement", at: T.seulement }, { text: "générer", at: T.generer, dim: true },
            { text: "des", at: at(21, "des"), dim: true }]} />
        <KineticLine t={t} size={200} align="left" words={[{ text: "VUES.", at: T.vues }]} style={{ marginTop: 10 }} />
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: views }}>
        {(() => {
          const n = 40;
          const p = clamp(invLerp(T.parce, T.vues + 0.3, t));
          const pts = Array.from({ length: n }, (_, i) => {
            const x = 90 + (i / (n - 1)) * 900;
            const y = 1330 - (Math.pow(i / (n - 1), 1.6) * 330 + Math.sin(i * 0.9) * 14);
            return [x, y];
          }).filter((_, i) => i / (n - 1) <= p);
          return <polyline points={pts.map((q) => q.join(",")).join(" ")} fill="none" stroke={color.mist} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />;
        })()}
        <line x1={90} y1={1360} x2={990} y2={1360} stroke="rgba(255,255,255,0.12)" strokeWidth={2} />
      </svg>
      {/* 9.2 the flight through the funnel */}
      {PLANES.map((pl, i) => {
        const rel = i - camZ;
        if (t < flyStart - 0.3 || rel < -0.45 || t > flyEnd + 0.6) return null;
        const scale = rel >= 0 ? 1 / (1 + rel * 0.9) : 1 + -rel * 3.5;
        const o = rel >= 0 ? clamp(1 - rel * 0.45) : clamp(1 + rel * 2.4);
        const last = i === PLANES.length - 1;
        return (
          <div key={pl.k} style={{ position: "absolute", left: 540, top: 960, transform: `translate(-50%, -50%) scale(${scale})`, opacity: o * clamp(invLerp(flyStart - 0.3, flyStart, t)),
            display: "flex", flexDirection: "column", alignItems: "center", gap: 18, filter: rel < -0.05 ? `blur(${-rel * 18}px)` : rel > 1 ? `blur(${(rel - 1) * 3}px)` : undefined }}>
            {pl.icon}
            <span style={{ fontFamily: font.sans, fontWeight: 800, fontSize: 120, letterSpacing: "-0.04em", color: last ? color.signal : color.paper, whiteSpace: "nowrap" }}>{pl.k}</span>
          </div>
        );
      })}
      {/* 9.3 real opportunities */}
      <div style={{ position: "absolute", left: 80, right: 60, top: 440, opacity: pipe }}>
        <KineticLine t={t} size={44} weight={600} align="left" tracking="-0.02em"
          words={[{ text: "Elle", at: T.elle, dim: true }, { text: "doit", at: at(22, "doit"), dim: true }, { text: "créer", at: T.creer }, { text: "de", at: at(22, "de"), dim: true },
            { text: "véritables", at: T.veritables }]} />
        <KineticLine t={t} size={104} align="left" style={{ marginTop: 8 }}
          words={[{ text: "OPPORTUNITÉS", at: T.opportunites }]} />
        <KineticLine t={t} size={104} align="left" words={[{ text: "COMMERCIALES.", at: T.commerciales, accent: true }]} />
      </div>
      <div style={{ position: "absolute", left: 80, top: 960, width: 920, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, opacity: pipe }}>
        {COLS.map((c, i) => {
          const p = prog(t, T.opportunites + 0.1 + i * 0.16, 0.5, ease.outBackSoft);
          const lit = t > T.commerciales + 0.1 + i * 0.1;
          return (
            <div key={c.k} style={{ height: 150, borderRadius: 24, boxSizing: "border-box", padding: "0 28px", display: "flex", alignItems: "center", gap: 18,
              background: lit ? "rgba(255,90,31,0.08)" : color.panel2, border: `1.5px solid ${lit ? color.signalLine : color.line2}`,
              opacity: clamp(p), transform: `translateY(${(1 - clamp(p)) * 30}px)` }}>
              {c.icon}
              <div>
                <Mono size={17} c={lit ? color.signal : color.mist}>{`Opportunité 0${i + 1}`}</Mono>
                <div style={{ fontFamily: font.sans, fontWeight: 750, fontSize: 32, marginTop: 4, whiteSpace: "nowrap" }}>{c.k}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 540, top: 1330, transform: "translateX(-50%)", opacity: pipe * prog(t, T.commerciales + 0.4, 0.4), width: 920, height: 4 }}>
        <div style={{ width: `${lerp(0, 100, clamp(invLerp(T.commerciales + 0.4, T.end, t)))}%`, height: 4, background: color.signal, borderRadius: 2 }} />
      </div>
    </AbsoluteFill>
  );
};

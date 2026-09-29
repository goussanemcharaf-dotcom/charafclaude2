import React from "react";
import { AbsoluteFill } from "remotion";
import { color, font } from "../lib/tokens";
import { clamp, ease, invLerp, keys, lerp, prog, rng } from "../lib/anim";
import { at, ph } from "../timeline";
import { Mono } from "../components/base";
import { AdPost, CREATIVES } from "../components/Campaign";
import { KineticLine } from "../components/Kinetic";
import { along } from "../components/Signal";
import { IconBag, IconCalendar, IconChat, IconCheckCircle, IconEye, IconSpark, IconUser, IconUsers } from "../components/Icons";

// 09 — THE BIG IDEA. « VUES. » grows with its curve — then the camera flies straight through the
// word and keeps going, deeper into the funnel: intérêt, prospect, conversation, client. It lands
// on what the ads were for: qualified inquiries, appointments, orders, customer relationships.

const T = {
  parce: at(21, "parce"), publicite: at(21, "publicité"), seulement: at(21, "seulement"), generer: at(21, "générer"), vues: at(21, "vues"),
  p21end: ph(21).end,
  elle: at(22, "elle"), creer: at(22, "créer"), veritables: at(22, "véritables"), opportunites: at(22, "opportunités"), commerciales: at(22, "commerciales"),
  end: ph(22).end, next: ph(23).start,
};
export const IDEA_IN = T.parce - 0.35;
export const IDEA_OUT = T.next - 0.3; // hard cut to the brand frame

// plane 0 is the « VUES. » headline itself: the camera passes through it
const PLANES = [
  { k: "INTÉRÊT", icon: (c: string) => <IconSpark s={76} c={c} w={1.5} /> },
  { k: "PROSPECT", icon: (c: string) => <IconUser s={76} c={c} w={1.5} /> },
  { k: "CONVERSATION", icon: (c: string) => <IconChat s={76} c={c} w={1.5} /> },
  { k: "CLIENT", icon: (c: string) => <IconCheckCircle s={76} c={c} w={1.5} /> },
];
const FLY0 = T.p21end + 0.04; // leave the views
const HOP = 0.42; // one plane per hop: 0.30 s travel + 0.12 s settle
const COLS = [
  { k: "Demande qualifiée", icon: <IconUser s={34} c={color.paper} /> },
  { k: "Rendez-vous", icon: <IconCalendar s={34} c={color.paper} /> },
  { k: "Commande", icon: <IconBag s={34} c={color.paper} /> },
  { k: "Relation client", icon: <IconUsers s={34} c={color.paper} /> },
];
const CURVE = Array.from({ length: 48 }, (_, i) => {
  const u = i / 47;
  return [90 + u * 900, 1440 - (Math.pow(u, 1.7) * 230 + Math.sin(i * 0.85) * 10 * (1 - u))] as [number, number];
});
// views gathering around a good ad (no counters: each eye is one person who saw it)
const EYES = (() => {
  const r = rng(9);
  return Array.from({ length: 12 }, (_, i) => {
    const left = i % 2 === 0;
    return { x: left ? 110 + r() * 170 : 800 + r() * 170, y: 660 + ((i * 0.37) % 1) * 460 + (r() - 0.5) * 40 };
  });
})();

export const C09Idea: React.FC<{ t: number }> = ({ t }) => {
  const inP = prog(t, IDEA_IN, 0.4);
  // camera depth: 0 = on « VUES. », 1..4 = on each plane; stepped hops with a short settle on each
  const hopKeys: [number, number][] = [[FLY0, 0]];
  PLANES.forEach((_, i) => { hopKeys.push([FLY0 + i * HOP + 0.3, i + 1], [FLY0 + (i + 1) * HOP, i + 1]); });
  const camZ = keys(t, hopKeys, ease.inOutCubic);
  const flying = t >= FLY0 - 0.05;
  const sentence = 1 - prog(t, FLY0 - 0.1, 0.3);
  const curve = clamp(invLerp(T.parce + 0.1, T.vues + 0.35, t));
  const grid = prog(t, T.opportunites + 0.05, 0.5);
  const leave = ease.inOutCubic(invLerp(T.opportunites - 0.12, T.opportunites + 0.16, t)); // CLIENT hands over to the grid
  // plane 0 (the big word): pushes past the camera when the flight starts
  const v0 = -camZ; // relative depth of the « VUES. » plane
  const vScale = v0 >= 0 ? 1 : 1 + -v0 * 3.2;
  const vOp = t < T.vues ? 1 : clamp(1 + v0 * 3.6);
  const [hx, hy] = along(CURVE, curve);
  return (
    <AbsoluteFill style={{ opacity: inP }}>
      {/* 9.1 « … générer des VUES. » */}
      <div style={{ position: "absolute", left: 80, right: 60, top: 440, opacity: sentence }}>
        <KineticLine t={t} size={50} weight={650} align="left" tracking="-0.025em"
          words={[{ text: "Parce", at: T.parce, dim: true }, { text: "qu’une", at: at(21, "qu’une"), dim: true }, { text: "bonne", at: at(21, "bonne") },
            { text: "publicité", at: T.publicite }, { text: "ne", at: at(21, "ne"), dim: true }, { text: "doit", at: at(21, "doit"), dim: true },
            { text: "pas", at: at(21, "pas"), dim: true }, { text: "seulement", at: T.seulement }, { text: "générer", at: T.generer, dim: true },
            { text: "des", at: at(21, "des"), dim: true }]} />
      </div>
      {t < T.vues + 0.3 && (() => {
        const adIn = prog(t, T.publicite - 0.15, 0.5);
        const adOut = ease.inCubic(invLerp(T.vues - 0.12, T.vues + 0.12, t));
        const gather = ease.inCubic(invLerp(T.vues - 0.08, T.vues + 0.18, t));
        return (
          <>
            <div style={{ position: "absolute", left: 540, top: 880, transform: `translate(-50%, -50%) translateY(${(1 - adIn) * 40}px) scale(${1 - 0.15 * adOut})`,
              opacity: adIn * (1 - adOut) }}>
              <AdPost c={CREATIVES.service} w={400} highlight={clamp(invLerp(T.publicite + 0.2, T.publicite + 0.6, t))} />
            </div>
            <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              {EYES.map((e, i) => {
                const a0 = T.publicite + 0.35 + i * 0.14;
                const p = ease.outBackSoft(clamp(invLerp(a0, a0 + 0.3, t)));
                if (p <= 0) return null;
                const x = lerp(e.x, 540, gather), y = lerp(e.y, 960, gather);
                return (
                  <g key={i} transform={`translate(${x - 18 * p}, ${y - 18 * p}) scale(${p})`} opacity={1 - gather}>
                    <IconEye s={36} c={i % 4 === 3 ? color.signal : color.paperDim} w={1.8} />
                  </g>
                );
              })}
            </svg>
          </>
        );
      })()}
      <div style={{ position: "absolute", left: 0, right: 0, top: 960, transform: `translateY(-50%) scale(${vScale})`, transformOrigin: "540px 50%",
        opacity: vOp, filter: v0 < -0.05 ? `blur(${-v0 * 22}px)` : undefined }}>
        <KineticLine t={t} size={220} align="center" words={[{ text: "VUES.", at: T.vues }]} />
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: sentence }}>
        <line x1={90} y1={1430} x2={990} y2={1430} stroke="rgba(255,255,255,0.12)" strokeWidth={2} />
        <polyline points={CURVE.filter((_, i) => i / 47 <= curve).map((q) => q.join(",")).join(" ") + ` ${hx},${hy}`} fill="none"
          stroke={color.mist} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" />
        {curve > 0 && (
          <g transform={`translate(${hx - 22}, ${hy - 70})`}><IconEye s={44} c={color.paper} w={1.8} /></g>
        )}
      </svg>
      {/* 9.2 the flight through the funnel */}
      {flying && PLANES.map((pl, n) => {
        const i = n + 1;
        const rel = i - camZ;
        if (rel < -0.5 || rel > 2.6) return null;
        const last = i === PLANES.length;
        const scale = (rel >= 0 ? 1 / (1 + rel * 1.1) : 1 + -rel * 3.2) * (last ? lerp(1, 0.62, leave) : 1);
        const o = (rel >= 0 ? clamp(1 - rel * 0.8) : clamp(1 + rel * 3.6)) * clamp(invLerp(FLY0 - 0.05, FLY0 + 0.15, t)) * (last ? 1 - leave : 1);
        const blur = rel < -0.04 ? -rel * 22 : rel > 0.25 ? (rel - 0.25) * 7 : 0;
        const c = last ? color.signal : color.paper;
        return (
          <div key={pl.k} style={{ position: "absolute", left: 540, top: last ? lerp(960, 1116, leave) : 960, transform: `translate(-50%, -50%) scale(${scale})`, opacity: o,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 20, filter: blur > 0.2 ? `blur(${blur}px)` : undefined }}>
            {pl.icon(last ? color.signal : color.mist)}
            <span style={{ fontFamily: font.sans, fontWeight: 800, fontSize: 132, letterSpacing: "-0.045em", color: c, whiteSpace: "nowrap" }}>{pl.k}</span>
          </div>
        );
      })}
      {/* the sentence that carries the flight */}
      <div style={{ position: "absolute", left: 80, right: 60, top: 440, opacity: flying ? 1 : 0 }}>
        <KineticLine t={t} size={50} weight={650} align="left" tracking="-0.025em"
          words={[{ text: "Elle", at: T.elle, dim: true }, { text: "doit", at: at(22, "doit"), dim: true }, { text: "créer", at: T.creer },
            { text: "de", at: at(22, "de"), dim: true }, { text: "véritables", at: T.veritables }]} />
        <KineticLine t={t} size={112} align="left" style={{ marginTop: 10 }} words={[{ text: "OPPORTUNITÉS", at: T.opportunites }]} />
        <KineticLine t={t} size={112} align="left" words={[{ text: "COMMERCIALES.", at: T.commerciales, accent: true }]} />
      </div>
      {/* 9.3 real opportunities */}
      <div style={{ position: "absolute", left: 80, top: 930, width: 920, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, opacity: grid }}>
        {COLS.map((c, i) => {
          const p = prog(t, T.opportunites + 0.14 + i * 0.14, 0.5, ease.outBackSoft);
          const lit = t > T.commerciales + 0.05 + i * 0.12;
          return (
            <div key={c.k} style={{ height: 176, borderRadius: 26, boxSizing: "border-box", padding: "0 28px", display: "flex", alignItems: "center", gap: 20,
              background: lit ? "rgba(255,90,31,0.09)" : color.panel2, border: `1.5px solid ${lit ? color.signalLine : color.line2}`,
              opacity: clamp(p), transform: `translateY(${(1 - clamp(p)) * 34}px)` }}>
              <div style={{ width: 64, height: 64, borderRadius: 32, background: lit ? "rgba(255,90,31,0.16)" : color.panel3, display: "grid", placeItems: "center", flex: "none" }}>{c.icon}</div>
              <div>
                <Mono size={18} c={lit ? color.signal : color.mist}>{`Opportunité 0${i + 1}`}</Mono>
                <div style={{ fontWeight: 750, fontSize: 34, marginTop: 6, whiteSpace: "nowrap" }}>{c.k}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 80, top: 1332, width: 920, height: 4, opacity: grid * prog(t, T.commerciales + 0.3, 0.4) }}>
        <div style={{ width: `${lerp(0, 100, clamp(invLerp(T.commerciales + 0.3, T.end, t)))}%`, height: 4, background: color.signal, borderRadius: 2 }} />
      </div>
    </AbsoluteFill>
  );
};

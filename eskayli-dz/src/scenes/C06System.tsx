import React from "react";
import { AbsoluteFill } from "remotion";
import { color, font } from "../lib/tokens";
import { clamp, ease, invLerp, keys, lerp, prog, rng } from "../lib/anim";
import { at, ph } from "../timeline";
import { Mono, Panel } from "../components/base";
import { AdPost, CREATIVES } from "../components/Campaign";
import { TypeOn } from "../components/Kinetic";
import { IconCheck, IconClock, IconPin, IconSpark, IconTag, IconFilter } from "../components/Icons";

// 06 — THE META ADS SYSTEM. One column of four modules the camera travels down: the right angle,
// message, creative and targeting — each a small piece of real strategy work, no dashboard numbers.

const T = {
  nous: at(10, "nous"), angle: at(10, "angle"), le: at(11, "le"), message: at(11, "message"),
  la: at(12, "la"), creative: at(12, "créative"), le2: at(13, "le"), ciblage: at(13, "ciblage"), end: ph(13).end, next: ph(14).start,
};
export const SYSTEM_IN = T.nous - 0.35;
export const SYSTEM_OUT = T.next - 0.2;

const MOD_H = 560;
const modY = (i: number) => 700 + i * (MOD_H + 110); // world y of module i (top)
const CUES = [T.nous, T.le, T.la, T.le2];

const Header: React.FC<{ i: number; title: string; note: string; on: number }> = ({ i, title, note, on }) => (
  <div style={{ display: "flex", alignItems: "baseline", gap: 20, marginBottom: 26 }}>
    <Mono size={24} c={on > 0.5 ? color.signal : color.mist}>{`0${i + 1}`}</Mono>
    <span style={{ fontFamily: font.sans, fontWeight: 800, fontSize: 64, letterSpacing: "-0.03em", color: color.paper }}>{title}</span>
    <Mono size={18} style={{ marginLeft: "auto" }}>{note}</Mono>
  </div>
);

const ANGLES = [
  { k: "Gain de temps", icon: <IconClock s={34} c={color.paper} /> },
  { k: "Qualité premium", icon: <IconSpark s={34} c={color.paper} /> },
  { k: "Prix clair", icon: <IconTag s={34} c={color.paper} /> },
  { k: "Proximité", icon: <IconPin s={34} c={color.paper} /> },
];
const PICK = 1;

const Dots: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  const r = rng(21);
  const cols = 18, rows = 7;
  const filters = [0, 1, 2, 3].map((i) => prog(t, t0 + 0.15 + i * 0.22, 0.3));
  const done = filters.reduce((a, b) => a + b, 0) / 4;
  return (
    <svg width={840} height={280}>
      {Array.from({ length: cols * rows }, (_, n) => {
        const c = n % cols, rw = Math.floor(n / cols);
        const x = 24 + c * 46 + (r() - 0.5) * 16, y = 22 + rw * 39 + (r() - 0.5) * 12;
        const inSeg = Math.hypot(c - 11.5, (rw - 3.2) * 1.6) < 3.6;
        const keep = inSeg;
        const o = keep ? 1 : lerp(1, 0.16, done);
        return <circle key={n} cx={x} cy={y} r={keep && done > 0.7 ? 8 : 6.5} fill={keep && done > 0.5 ? color.signal : color.mist} opacity={o} />;
      })}
    </svg>
  );
};

export const C06System: React.FC<{ t: number }> = ({ t }) => {
  // camera travels down the column: module i centred when its line starts
  const camY = keys(t, CUES.flatMap((c, i) => [[c - 0.3, -(modY(i) + MOD_H / 2 - 1000)], [c + 0.35, -(modY(i) + MOD_H / 2 - 1000)]] as [number, number][]),
    ease.inOutCubic);
  const vel = Math.abs(keys(t, CUES.flatMap((c, i) => [[c - 0.3, modY(i)], [c + 0.35, modY(i)]] as [number, number][]), ease.inOutCubic)
    - keys(t - 1 / 30, CUES.flatMap((c, i) => [[c - 0.3, modY(i)], [c + 0.35, modY(i)]] as [number, number][]), ease.inOutCubic));
  const blur = Math.min(6, Math.max(0, vel - 12) * 0.15);
  const inP = prog(t, SYSTEM_IN, 0.6);
  const out = ease.inCubic(invLerp(SYSTEM_OUT - 0.15, SYSTEM_OUT + 0.35, t));
  const on = (i: number) => (t > CUES[i] - 0.1 ? 1 : 0);
  const angleSel = prog(t, T.angle - 0.05, 0.35);
  const strike = clamp(invLerp(T.message - 0.1, T.message + 0.35, t));
  const creativeSel = prog(t, T.creative - 0.05, 0.35);
  return (
    <AbsoluteFill style={{ opacity: inP * (1 - out) }}>
      <AbsoluteFill style={{ transform: `translateY(${camY}px)`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
        {/* the route down the column */}
        <svg width={1080} height={4000} style={{ position: "absolute", left: 0, top: 0 }}>
          <line x1={80} y1={modY(0) + 40} x2={80} y2={modY(3) + 40} stroke="rgba(255,255,255,0.1)" strokeWidth={3} />
          <line x1={80} y1={modY(0) + 40} x2={80} y2={lerp(modY(0) + 40, modY(3) + 40, clamp(invLerp(T.nous, T.ciblage, t)))} stroke={color.signal} strokeWidth={3} />
          {[0, 1, 2, 3].map((i) => <circle key={i} cx={80} cy={modY(i) + 40} r={9} fill={on(i) ? color.signal : color.panel3} />)}
        </svg>
        {/* 01 angle */}
        <div style={{ position: "absolute", left: 130, top: modY(0), width: 890 }}>
          <Header i={0} title="L’angle" note="Pourquoi acheter ?" on={on(0)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            {ANGLES.map((a, i) => {
              const p = prog(t, T.nous + 0.1 + i * 0.12, 0.45, ease.outBackSoft);
              const chosen = i === PICK;
              const jitter = (1 - angleSel) * Math.sin(t * 9 + i * 2) * 5;
              return (
                <div key={a.k} style={{ height: 150, borderRadius: 24, boxSizing: "border-box", padding: "0 26px", display: "flex", alignItems: "center", gap: 18,
                  background: chosen && angleSel > 0.5 ? "rgba(255,90,31,0.1)" : color.panel2,
                  border: `1.5px solid ${chosen && angleSel > 0.5 ? color.signal : color.line2}`,
                  opacity: clamp(p) * (chosen ? 1 : lerp(1, 0.35, angleSel)), transform: `translate(${jitter}px, ${(1 - clamp(p)) * 30}px)` }}>
                  {a.icon}
                  <span style={{ fontFamily: font.sans, fontWeight: 700, fontSize: 34, color: color.paper, whiteSpace: "nowrap" }}>{a.k}</span>
                  {chosen && angleSel > 0.5 && <span style={{ marginLeft: "auto" }}><IconCheck s={34} c={color.signal} w={2.4} /></span>}
                </div>
              );
            })}
          </div>
        </div>
        {/* 02 message */}
        <div style={{ position: "absolute", left: 130, top: modY(1), width: 890 }}>
          <Header i={1} title="Le message" note="Ce que le client comprend" on={on(1)} />
          <Panel w={890} pad={36}>
            <Mono size={18}>Brouillon</Mono>
            <div style={{ position: "relative", display: "inline-block", marginTop: 10 }}>
              <span style={{ fontSize: 40, fontWeight: 650, color: color.mist }}>Nos produits sont les meilleurs.</span>
              <span style={{ position: "absolute", left: 0, top: "54%", height: 4, width: `${strike * 100}%`, background: color.signal, borderRadius: 2 }} />
            </div>
            <div style={{ height: 1, background: color.line, margin: "26px 0" }} />
            <Mono size={18} c={color.signal}>Version finale</Mono>
            <div style={{ fontSize: 44, fontWeight: 750, letterSpacing: "-0.02em", marginTop: 10, lineHeight: 1.15, minHeight: 104 }}>
              <TypeOn t={t} at={T.message + 0.3} cps={34} caret text={"Ce que vos clients cherchent,\ndit simplement."} />
            </div>
          </Panel>
        </div>
        {/* 03 creative */}
        <div style={{ position: "absolute", left: 130, top: modY(2), width: 890 }}>
          <Header i={2} title="La créative" note="Trois variantes" on={on(2)} />
          <div style={{ display: "flex", gap: 20 }}>
            {[CREATIVES.food, CREATIVES.estate, CREATIVES.beauty].map((c, i) => {
              const p = prog(t, T.la - 0.1 + i * 0.12, 0.5, ease.outBackSoft);
              const chosen = i === 1;
              return (
                <div key={i} style={{ opacity: clamp(p) * (chosen ? 1 : lerp(1, 0.4, creativeSel)), transform: `translateY(${(1 - clamp(p)) * 40}px) scale(${chosen ? 1 + 0.04 * creativeSel : 1})` }}>
                  <AdPost c={c} w={283} highlight={chosen ? creativeSel : 0} />
                </div>
              );
            })}
          </div>
        </div>
        {/* 04 targeting */}
        <div style={{ position: "absolute", left: 130, top: modY(3), width: 890 }}>
          <Header i={3} title="Le ciblage" note="La bonne audience" on={on(3)} />
          <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
            {["Âge", "Ville", "Centres d’intérêt", "Comportements"].map((f, i) => {
              const p = prog(t, T.le2 + 0.15 + i * 0.22, 0.3);
              return (
                <span key={f} style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "12px 18px", borderRadius: 999, fontSize: 26, fontWeight: 650,
                  border: `1.5px solid ${p > 0.5 ? color.signalLine : color.line2}`, color: p > 0.5 ? color.paper : color.mist,
                  background: p > 0.5 ? "rgba(255,90,31,0.08)" : "transparent", opacity: prog(t, T.le2 - 0.2, 0.4) }}>
                  <IconFilter s={24} c={p > 0.5 ? color.signal : color.mist} />{f}
                </span>
              );
            })}
          </div>
          <Panel w={890} pad={24} style={{ opacity: prog(t, T.le2 - 0.2, 0.4) }}>
            <Dots t={t} t0={T.le2} />
          </Panel>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

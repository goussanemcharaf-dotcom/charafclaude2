import React from "react";
import { bg, color, font, shadow } from "../../styles/tokens";
import { cue, wordAt } from "../timeline";
import { clamp, ease, invLerp, keys, lerp, prog, springy } from "../components/motion/anim";
import { KineticLine } from "../components/motion/KineticText";
import { MotionBlur } from "../components/motion/MotionBlur";
import { Brackets } from "../components/motion/Shapes";
import { IconCheck } from "../components/ui/Icons";
import { DESK } from "../components/portfolio/data";
import { PortfolioReveal } from "./S06Reveal";
import { Fill, SceneProps } from "./shared";

// S07 — EVERYTHING ORGANIZED. "Tes projets, tes services, ton style… réunis
// dans une seule expérience." The page scrolls exactly on each word, then
// zooms out to the whole site: one place, one experience.

const K = 1000 / DESK.width; // page -> frame px at reading size
const CHROME = 60;
const FULL_H = DESK.total * K + CHROME; // frame height showing the whole page
const ZOOM_AT = wordAt(12, "réunis") - 0.04;
const OUT_AT = 25.94;
const ART = { top: 520, h: 800 }; // overview artboard on screen

const zoomAt = (t: number) => prog(t, ZOOM_AT, 0.8, ease.inOutCubic);

/** Browser geometry through S06 -> S07. */
const geometry = (t: number) => {
  const rise = prog(t, 20.26, 0.55, ease.outExpo);
  const ex = prog(t, 21.48, 0.55, ease.inOutCubic);
  const z = zoomAt(t);
  const vh = lerp(lerp(760, 940, ex), FULL_H, z); // virtual (unscaled) height
  const sh = lerp(lerp(760, 940, ex), ART.h, z); // on-screen height
  const s = sh / vh;
  const w = lerp(940, 1000, ex);
  const top = lerp(lerp(560, 390, ex), ART.top, z) + (1 - rise) * 1500;
  const scroll = lerp(
    keys(t, [[21.98, 0], [22.34, DESK.work - 40], [22.7, DESK.work - 40], [23.04, DESK.services - 30], [23.48, DESK.services - 30], [23.84, DESK.style - 30]], ease.inOutCubic),
    0, z,
  );
  return { x: 540 - w / 2, y: top, w, h: vh, s, scroll: scroll, rise };
};

const TABS = [
  { label: "Projets", at: cue("projets") - 0.04 },
  { label: "Services", at: cue("services") - 0.04 },
  { label: "Style", at: cue("style") - 0.04 },
];

const SITEMAP = [
  { label: "Projets", y: DESK.work + 200, side: -1, at: 24.9 },
  { label: "Services", y: DESK.services + 250, side: 1, at: 24.98 },
  { label: "Style", y: DESK.style + 300, side: -1, at: 25.06 },
  { label: "À propos", y: DESK.about + 200, side: 1, at: 25.14 },
  { label: "Contact", y: DESK.contact + 200, side: -1, at: 25.22 },
];

export const PortfolioWorld: React.FC<SceneProps> = ({ t }) => {
  const g = geometry(t);
  const out = prog(t, OUT_AT, 0.24, ease.inExpo);
  const outX = -out * 1400;
  const outBlur = out * 40;
  const z = zoomAt(t);
  const artW = 1000 * (ART.h / FULL_H);
  const artX = 540 - artW / 2;
  const tabsOut = prog(t, ZOOM_AT - 0.1, 0.3, ease.inExpo);
  return (
    <Fill bg={bg.violet}>
      {/* headline: "pensé autour de ton univers." */}
      <div style={{ position: "absolute", left: 0, top: 262, width: 1080 }}>
        <KineticLine
          t={t} size={80} color="#FFFFFF"
          words={[{ text: "pensé", at: wordAt(11, "pensé") }, { text: "autour", at: wordAt(11, "autour") }, { text: "de", at: wordAt(11, "de") }]}
          exit={{ at: 21.46, dur: 0.3, to: "up", distance: 130 }}
        />
        <KineticLine
          t={t} size={118} color={color.lavender} family={font.serif} weight={400} italic tracking="-0.02em" style={{ marginTop: 8 }}
          words={[{ text: "ton", at: wordAt(11, "ton") }, { text: "univers.", at: wordAt(11, "univers") }]}
          exit={{ at: 21.5, dur: 0.3, to: "up", distance: 130 }}
        />
      </div>
      {/* section tabs synced to "Tes projets, tes services, ton style" */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 268, display: "flex", justifyContent: "center", gap: 18, transform: `translateY(${-tabsOut * 160}px)`, opacity: 1 - tabsOut }}>
        {TABS.map((tb, i) => {
          if (t < tb.at) return null;
          const s = springy(t, tb.at, { stiffness: 360, damping: 17 });
          const active = i === TABS.length - 1 || t < TABS[i + 1].at;
          return (
            <div
              key={tb.label}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "20px 32px", borderRadius: 999,
                background: active ? "#FFFFFF" : "rgba(255,255,255,0.16)", color: active ? color.violetDeep : "#FFFFFF",
                fontFamily: font.display, fontWeight: 800, fontSize: 50, letterSpacing: "-0.04em", lineHeight: 1,
                transform: `scale(${0.5 + 0.5 * s})`, opacity: clamp(invLerp(tb.at, tb.at + 0.06, t)),
                boxShadow: active ? shadow.soft : undefined,
              }}
            >
              {!active && <IconCheck size={36} color="#FFFFFF" stroke={3} />}
              {tb.label}
            </div>
          );
        })}
      </div>
      {/* the site */}
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${outX}px)` }}>
        <MotionBlur x={outBlur} style={{ position: "absolute", inset: 0 }}>
          {g.rise > 0 && <PortfolioReveal t={t} x={g.x} y={g.y} w={g.w} h={g.h} scroll={g.scroll} scale={g.s} />}
          {/* overview: sitemap labels + viewfinder brackets */}
          {z > 0.98 && SITEMAP.map((m) => {
            const p = springy(t, m.at, { stiffness: 300, damping: 20 });
            if (t < m.at) return null;
            const yy = ART.top + (CHROME + m.y * K) * (ART.h / FULL_H);
            const edge = m.side < 0 ? artX - 14 : artX + artW + 14;
            const lineLen = 70;
            return (
              <React.Fragment key={m.label}>
                <div style={{ position: "absolute", top: yy - 1.5, height: 3, width: lineLen * p, left: m.side < 0 ? edge - lineLen * p : edge, background: "rgba(255,255,255,0.7)", borderRadius: 2 }} />
                <div
                  style={{
                    position: "absolute", top: yy - 34, left: m.side < 0 ? undefined : edge + lineLen + 8, right: m.side < 0 ? 1080 - (edge - lineLen - 8) : undefined,
                    padding: "0 26px", height: 68, borderRadius: 34, background: "#FFFFFF", color: color.violetDeep,
                    display: "flex", alignItems: "center", fontFamily: font.display, fontWeight: 800, fontSize: 38, letterSpacing: "-0.035em",
                    opacity: clamp(p * 1.5), transform: `translateX(${(1 - p) * 40 * m.side}px)`, boxShadow: shadow.soft, whiteSpace: "nowrap",
                  }}
                >
                  {m.label}
                </div>
              </React.Fragment>
            );
          })}
          {t > cue("experience") - 0.1 && (
            <Brackets
              x={artX} y={ART.top} w={artW} h={ART.h} len={64} stroke="#FFFFFF" width={7}
              spread={(1 - ease.outExpo(clamp(invLerp(cue("experience") - 0.1, cue("experience") + 0.4, t)))) * 70 + 22}
              opacity={clamp(invLerp(cue("experience") - 0.1, cue("experience") + 0.05, t))}
            />
          )}
        </MotionBlur>
      </div>
      {/* "une seule expérience." */}
      <div style={{ position: "absolute", left: 0, top: 262, width: 1080, opacity: 1 - out }}>
        <KineticLine
          t={t} size={84} color="#FFFFFF"
          words={[{ text: "une", at: wordAt(12, "une") }, { text: "seule", at: wordAt(12, "seule") }]}
        />
        <KineticLine
          t={t} size={116} color={color.lavender} family={font.serif} weight={400} italic tracking="-0.02em" style={{ marginTop: 6 }}
          words={[{ text: "expérience.", at: wordAt(12, "expérience") }]}
        />
      </div>
    </Fill>
  );
};

export const S07Organized = PortfolioWorld;

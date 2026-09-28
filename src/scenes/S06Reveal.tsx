import React from "react";
import { bg, color, font } from "../../styles/tokens";
import { wordAt } from "../timeline";
import { clamp, ease, invLerp, lerp, prog, wobble } from "../components/motion/anim";
import { Star } from "../components/motion/Shapes";
import { KineticLine } from "../components/motion/KineticText";
import { BrowserFrame } from "../components/ui/Frames";
import { PortfolioPage } from "../components/portfolio/PortfolioPage";
import { persona, DESK } from "../components/portfolio/data";
import { Fill, SceneProps } from "./shared";

// S06 — THE REVEAL. "Je crée pour toi un Premium Website Portfolio, pensé
// autour de ton univers." A soft star draws itself around the promise, fills
// violet and swallows the frame; the portfolio then assembles itself.

export const STAR_IN = 17.5;
export const STAR_FILL = 19.9;
const W = (w: string) => wordAt(11, w);

const mixHex = (a: string, b: string, k: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(lerp(v, pb[i], k))).join(",")})`;
};

/** Star + promise, on the light studio. Ends by filling violet (wipe). */
export const StarIntro: React.FC<SceneProps> = ({ t }) => {
  const draw = prog(t, STAR_IN, 0.6, ease.inOutCubic);
  const fill = prog(t, STAR_FILL, 0.16, ease.outCubic);
  const grow = prog(t, STAR_FILL + 0.05, 0.34, ease.inExpo);
  const rot = -16 + (t - STAR_IN) * 7 + wobble(t, 2, 0.7) * 2.5;
  const sx = 1 + wobble(t, 5, 0.9) * 0.035;
  const sy = 1.08 + wobble(t, 9, 0.8) * 0.035;
  const scale = 1 + grow * 5.5;
  const studio = clamp(invLerp(STAR_IN + 0.05, STAR_IN + 0.6, t));
  const ink = mixHex(color.ink, "#FFFFFF", fill);
  const acc = mixHex(color.violet, color.lavender, fill);
  const textScale = 1 + grow * 2.6;
  const textBlur = grow * 18;
  return (
    <Fill bg="#FFFFFF">
      <div style={{ position: "absolute", inset: 0, background: bg.studio, opacity: studio }} />
      <div style={{ position: "absolute", left: 540 - 744, top: 900 - 744, transform: `scale(${scale})`, transformOrigin: "744px 744px" }}>
        <Star size={1488} draw={draw} rotate={rot} sx={sx} sy={sy} stroke={color.violetBright} strokeWidth={2.4} fill={color.violet} fillOpacity={fill} />
      </div>
      <div
        style={{
          position: "absolute", left: 0, top: 862, width: 1080, transform: `scale(${textScale})`, transformOrigin: "540px 40px",
          filter: textBlur > 0.3 ? `blur(${textBlur}px)` : undefined, opacity: 1 - clamp(invLerp(STAR_FILL + 0.25, STAR_FILL + 0.4, t)),
        }}
      >
        <KineticLine
          t={t} size={74} color={color.ink}
          words={[{ text: "Je", at: W("Je") }, { text: "crée", at: W("crée") }, { text: "pour", at: W("pour") }, { text: "toi", at: W("toi") }]}
          exit={{ at: W("Premium") - 0.16, dur: 0.22, to: "left", distance: 200 }}
        />
      </div>
      <div
        style={{
          position: "absolute", left: 0, top: 772, width: 1080, transform: `scale(${textScale})`, transformOrigin: "540px 130px",
          filter: textBlur > 0.3 ? `blur(${textBlur}px)` : undefined, opacity: 1 - clamp(invLerp(STAR_FILL + 0.25, STAR_FILL + 0.4, t)),
        }}
      >
        <KineticLine t={t} size={150} color={acc} family={font.serif} weight={400} italic tracking="-0.02em" words={[{ text: "Premium", at: W("Premium") }]} />
        <KineticLine
          t={t} size={70} color={ink} style={{ marginTop: 6 }}
          words={[{ text: "Website", at: W("Website") }, { text: "Portfolio", at: W("Portfolio") }]}
        />
      </div>
      <div style={{ position: "absolute", inset: 0, background: bg.violet, opacity: clamp(invLerp(STAR_FILL + 0.33, STAR_FILL + 0.39, t)) }} />
    </Fill>
  );
};

// Build timeline of the page (grid -> nav -> type -> image -> copy -> rest).
export const buildAt = (t: number) => ({
  build: {
    nav: prog(t, 20.56, 0.36, ease.outExpo),
    heroType: prog(t, 20.68, 0.5, ease.outExpo),
    heroImage: prog(t, 20.84, 0.55, ease.outExpo),
    heroCopy: prog(t, 21.02, 0.45, ease.outExpo),
    work: prog(t, 21.12, 0.6, ease.outExpo),
    rest: prog(t, 21.2, 0.5, ease.outExpo),
  },
  guides: {
    grid: clamp(invLerp(20.48, 20.66, t)) * (1 - clamp(invLerp(21.3, 21.55, t))),
    nav: clamp(invLerp(20.58, 20.7, t)) * (1 - clamp(invLerp(21.2, 21.45, t))),
    type: clamp(invLerp(20.72, 20.84, t)) * (1 - clamp(invLerp(21.3, 21.55, t))),
    image: clamp(invLerp(20.9, 21.02, t)) * (1 - clamp(invLerp(21.36, 21.6, t))),
    work: 0,
  },
  urlTyped: clamp(invLerp(20.42, 20.82, t)),
});

/** The portfolio in its browser, mid-build or scrolled (PortfolioReveal). */
export const PortfolioReveal: React.FC<{
  t: number; x: number; y: number; w: number; h: number; scroll: number; scale?: number;
}> = ({ t, x, y, w, h, scroll, scale = 1 }) => {
  const b = buildAt(t);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `scale(${scale})`, transformOrigin: "50% 0%" }}>
      <BrowserFrame width={w} height={h} url={persona.url} urlTyped={b.urlTyped} pageWidth={DESK.width}>
        <div style={{ transform: `translateY(${-scroll}px)` }}>
          <PortfolioPage build={b.build} guides={b.guides} voicePlayed={clamp(invLerp(22.4, 23.2, t)) * 0.7} />
        </div>
      </BrowserFrame>
    </div>
  );
};

export const S06Reveal = StarIntro;

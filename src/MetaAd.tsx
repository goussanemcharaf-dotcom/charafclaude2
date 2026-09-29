import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FPS } from "../styles/tokens";
import { TL } from "./timeline";
import { S01Identification } from "./scenes/S01Identification";
import { Workspace } from "./scenes/Workspace";
import { S05Non, S05_TEXT_OUT } from "./scenes/S05Non";
import { StarIntro, STAR_FILL } from "./scenes/S06Reveal";
import { PortfolioWorld } from "./scenes/S07Organized";
import { LinksScene } from "./scenes/S08TenLinks";
import { ClientScene, S11_ZOOM } from "./scenes/S10Client";
import { S11Statement } from "./scenes/S11Statement";
import { S12CTA, S12_WIPE } from "./scenes/S12CTA";
import { color } from "../styles/tokens";
import { hitTime } from "./music";
import { STACK_Y } from "./components/workflow/LinkStack";
import { Burst, Camera, Flash, FX_COLORS, GlitchFilter, glitchAt, Shockwaves, Wave } from "./components/motion/FX";

// Master program (no subtitles, no audio — audio is mixed and muxed in the
// export step). Scenes use global time (seconds) so every cue comes straight
// from config/timeline.json. A slot may start before / end after its scene's
// window so neighbours overlap during transitions; z decides who is on top.
type Slot = { id: string; from: number; to: number; C: React.FC<{ t: number }>; z: number };

const S = TL.scenes;
export const SLOTS: Slot[] = [
  // S01 bars split open over the workspace (S02-S04 share one space)
  { id: "s01", from: 0, to: S.s01_identification[1] + 0.32, C: S01Identification, z: 2 },
  { id: "s02-s04", from: S.s02_workflow[0] - 0.23, to: S.s04_confusion[1], C: Workspace, z: 1 },
  // hard cut to white on "Non."
  { id: "s05", from: S.s05_non[0], to: S05_TEXT_OUT + 0.4, C: S05Non, z: 5 },
  // star draws under the outgoing text, fills violet and swallows the frame
  { id: "s06a", from: S05_TEXT_OUT - 0.01, to: STAR_FILL + 0.42, C: StarIntro, z: 4 },
  // S06 build + S07 organised: the same browser, on violet
  { id: "s06b-s07", from: STAR_FILL + 0.3, to: S.s08_ten_links[0], C: PortfolioWorld, z: 3 },
  // hard cut on the beat: ten links -> one link (S08-S09 share one space)
  { id: "s08-s09", from: S.s08_ten_links[0], to: S.s09_one_link[1] + 0.2, C: LinksScene, z: 7 },
  // the client's phone rises; zoom-through into the statement
  { id: "s10", from: 29.24, to: S11_ZOOM + 0.4, C: ClientScene, z: 6 },
  { id: "s11", from: S11_ZOOM, to: S12_WIPE + 0.42, C: S11Statement, z: 5 },
  // star wipe into the violet CTA
  { id: "s12", from: S12_WIPE, to: TL.duration + 1, C: S12CTA, z: 9 },
];

// Energy layer (see components/motion/FX.tsx): impact points of the drops, the CTA and the send.
const [DROP_1, DROP_2] = [hitTime("drop", 0), hitTime("drop", 1)];
const [CTA_HIT, SEND_HIT] = [hitTime("cta"), hitTime("final")];
const SEND_BTN = { x: 936, y: 1176 }; // S12 composer send button centre
const WAVES: Wave[] = [
  { t: DROP_1, x: 540, y: 900, stroke: "#FFFFFF", r0: 60, r1: 950, width: 16 },
  { t: DROP_2, x: 540, y: STACK_Y, stroke: color.violet, r0: 120, r1: 1000, width: 14 },
  { t: CTA_HIT, x: 540, y: 900, stroke: "#FFFFFF", r0: 80, r1: 1000, width: 12 },
  { t: SEND_HIT, x: SEND_BTN.x, y: SEND_BTN.y, stroke: color.lavender, r0: 60, r1: 460, width: 10 },
];

export const MetaAd: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const glitch = glitchAt(t) > 0;
  return (
    <AbsoluteFill style={{ background: "#fff", overflow: "hidden" }}>
      <GlitchFilter t={t} id="chaos-glitch" />
      <Camera t={t}>
        {SLOTS.filter((s) => t >= s.from && t < s.to)
          .sort((a, b) => a.z - b.z)
          .map((s) => (
            <AbsoluteFill key={s.id} style={glitch && s.id === "s02-s04" ? { filter: "url(#chaos-glitch)", transform: "scale(1.065)" } : undefined}>
              <s.C t={t} />
            </AbsoluteFill>
          ))}
        <Shockwaves t={t} waves={WAVES} />
        <Burst t={t} t0={DROP_1} x={540} y={900} n={18} colors={FX_COLORS.onViolet} seed={11} speed={1500} />
        <Burst t={t} t0={DROP_2} x={540} y={STACK_Y} n={16} colors={FX_COLORS.onLight} seed={23} speed={1300} />
        <Burst t={t} t0={CTA_HIT} x={540} y={900} n={10} colors={FX_COLORS.onViolet} seed={37} speed={1100} />
        <Burst t={t} t0={SEND_HIT} x={SEND_BTN.x} y={SEND_BTN.y} n={12} colors={FX_COLORS.onViolet} seed={41} speed={900} life={0.8} />
      </Camera>
      <Flash t={t} />
    </AbsoluteFill>
  );
};

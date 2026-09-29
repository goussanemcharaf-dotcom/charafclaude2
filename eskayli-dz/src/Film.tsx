import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FPS, bgSystem } from "./lib/tokens";
import { clamp, invLerp, keys } from "./lib/anim";
import { at } from "./timeline";
import { Grain, Grid, Vignette } from "./components/base";
import { C01Hook, HOOK_OUT } from "./scenes/C01Hook";
import { C02Question, QUESTION_OUT } from "./scenes/C02Question";
import { C03Problem, DIVE_AT, PROBLEM_OUT } from "./scenes/C03Problem";
import { C04Business } from "./scenes/C04Business";
import { C05Eskayli, ESKAYLI_OUT } from "./scenes/C05Eskayli";
import { C06System, SYSTEM_IN, SYSTEM_OUT } from "./scenes/C06System";
import { C07Testing, TESTING_IN, TESTING_OUT } from "./scenes/C07Testing";
import { C08Outcome, OUTCOME_IN, OUTCOME_OUT } from "./scenes/C08Outcome";
import { C09Idea, IDEA_IN, IDEA_OUT } from "./scenes/C09Idea";
import { BRAND_IN, C10Brand, FINAL_AT, SYSTEM_BACK } from "./scenes/C10Brand";
import { TL } from "./timeline";

// Master program (no subtitles, no audio: the mix is muxed at export). Every scene takes the global
// time t (s) and keys itself to spoken words from config/timeline.json.
type Slot = { id: string; from: number; to: number; C: React.FC<{ t: number }> };

const CHEZ = at(9, "chez");
export const SLOTS: Slot[] = [
  { id: "c01", from: 0, to: HOOK_OUT + 0.5, C: C01Hook },
  { id: "c02", from: HOOK_OUT - 0.2, to: QUESTION_OUT + 0.5, C: C02Question },
  { id: "c03", from: QUESTION_OUT - 0.1, to: PROBLEM_OUT + 0.05, C: C03Problem },
  { id: "c04", from: DIVE_AT + 0.2, to: CHEZ, C: C04Business },
  { id: "c05", from: CHEZ, to: ESKAYLI_OUT + 0.5, C: C05Eskayli },
  { id: "c06", from: SYSTEM_IN, to: SYSTEM_OUT + 0.4, C: C06System },
  { id: "c07", from: TESTING_IN, to: TESTING_OUT + 0.4, C: C07Testing },
  { id: "c08", from: OUTCOME_IN, to: OUTCOME_OUT + 0.45, C: C08Outcome },
  { id: "c09", from: IDEA_IN, to: IDEA_OUT, C: C09Idea },
  { id: "c10", from: BRAND_IN, to: TL.duration + 1, C: C10Brand },
];

export const Film: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  // noise world (hook → problem) gives way to the system grid when the method arrives
  const grain = keys(t, [[0, 0.1], [DIVE_AT - 3.2, 0.1], [DIVE_AT - 2.2, 0.035]]);
  const quiet = clamp(invLerp(OUTCOME_IN, OUTCOME_IN + 0.4, t)) * (1 - clamp(invLerp(at(16, "transformer") - 0.4, at(16, "transformer"), t)));
  const grid = clamp(invLerp(DIVE_AT - 3.4, DIVE_AT - 2.4, t)) * 0.9 * (1 - 0.7 * quiet);
  const paper = (t >= BRAND_IN && t < SYSTEM_BACK) || t >= FINAL_AT;
  return (
    <AbsoluteFill style={{ background: bgSystem, overflow: "hidden" }}>
      <Grid o={grid} />
      {SLOTS.filter((s) => t >= s.from && t < s.to).map((s) => (
        <AbsoluteFill key={s.id}>
          <s.C t={t} />
        </AbsoluteFill>
      ))}
      <Grain t={t} o={paper ? 0.02 : grain} />
      <Vignette o={paper ? 0.18 : 1} />
    </AbsoluteFill>
  );
};

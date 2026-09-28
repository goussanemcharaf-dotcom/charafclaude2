import React from "react";
import { color, font } from "../../styles/tokens";
import { cue, wordAt } from "../timeline";
import { ease, prog } from "../components/motion/anim";
import { KineticLine } from "../components/motion/KineticText";
import { Fill, SceneProps } from "./shared";

// S05 — "NON." Hard cut to pure white. One word, one violet point, silence.
// Then, calmly: "Ton travail mérite une meilleure présentation."

export const S05_TEXT_OUT = 17.46;

export const S05Non: React.FC<SceneProps> = ({ t }) => {
  const nonOut = prog(t, cue("merite") - 0.24, 0.2, ease.inCubic);
  const calm = { from: "down" as const, distance: 42, dur: 0.85, blur: 12 };
  const exit = { at: S05_TEXT_OUT, dur: 0.32, to: "up" as const, distance: 90, blur: 18 };
  return (
    <Fill bg={t < S05_TEXT_OUT ? "#FFFFFF" : "transparent"}>
      {nonOut < 1 && (
        <div
          style={{
            position: "absolute", left: 0, right: 0, top: 700, display: "flex", justifyContent: "center", alignItems: "baseline",
            fontFamily: font.display, fontWeight: 800, fontSize: 330, letterSpacing: "-0.055em", color: color.ink, lineHeight: 1,
            opacity: 1 - nonOut, filter: nonOut > 0 ? `blur(${nonOut * 10}px)` : undefined,
          }}
        >
          <span>Non</span>
          <span style={{ display: "inline-block", width: 70, height: 70, borderRadius: 35, background: color.violet, marginLeft: 14 }} />
        </div>
      )}
      <div style={{ position: "absolute", left: 0, top: 690, width: 1080 }}>
        <KineticLine
          t={t} size={90} color={color.ink} {...calm} exit={exit}
          words={[
            { text: "Ton", at: wordAt(10, "Ton") },
            { text: "travail", at: wordAt(10, "travail") },
            { text: "mérite", at: wordAt(10, "mérite") },
          ]}
        />
        <KineticLine
          t={t} size={156} color={color.violet} family={font.serif} weight={400} italic tracking="-0.025em" {...calm}
          exit={{ ...exit, at: exit.at + 0.04 }} style={{ marginTop: 26 }}
          words={[
            { text: "une", at: wordAt(10, "une") },
            { text: "meilleure", at: wordAt(10, "meilleure") },
          ]}
        />
        <KineticLine
          t={t} size={156} color={color.violet} family={font.serif} weight={400} italic tracking="-0.025em" {...calm}
          exit={{ ...exit, at: exit.at + 0.08 }} style={{ marginTop: 4 }}
          words={[{ text: "présentation.", at: wordAt(10, "présentation") }]}
        />
      </div>
    </Fill>
  );
};

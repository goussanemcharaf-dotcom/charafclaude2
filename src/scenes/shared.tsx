import React from "react";
import { color, font } from "../../styles/tokens";
import { KineticLine } from "../components/motion/KineticText";

export type SceneProps = { t: number };

export const NNBSP = " "; // French punctuation spacing ("travail ?")

/** "Comment présentes-tu ton travail ?" — shared by S01 (on violet) and S02 (on light). */
export const QUESTION_AT = { comment: 4.72, presentes: 4.84, ton: 5.0, travail: 5.1 };

export const QuestionHeadline: React.FC<{
  t: number; ink: string; accent: string; y?: number; dy?: number; scale?: number; exit?: { at: number; dur?: number };
}> = ({ t, ink, accent, y = 822, dy = 0, scale = 1, exit }) => (
  <div
    style={{
      position: "absolute", left: 0, top: y, width: 1080, transform: `translateY(${dy}px) scale(${scale})`,
      transformOrigin: "50% 0%",
    }}
  >
    <KineticLine
      t={t} size={96} color={ink}
      words={[{ text: "Comment", at: QUESTION_AT.comment }, { text: "présentes-tu", at: QUESTION_AT.presentes }]}
      exit={exit ? { at: exit.at, dur: exit.dur ?? 0.3, to: "up", distance: 120 } : undefined}
    />
    <KineticLine
      t={t} size={132} color={accent} family={font.serif} weight={400} italic tracking="-0.02em"
      style={{ marginTop: 8 }}
      words={[{ text: "ton", at: QUESTION_AT.ton }, { text: `travail${NNBSP}?`, at: QUESTION_AT.travail }]}
      exit={exit ? { at: exit.at + 0.04, dur: exit.dur ?? 0.3, to: "up", distance: 120 } : undefined}
    />
  </div>
);

export const Fill: React.FC<{ bg: string; children?: React.ReactNode; style?: React.CSSProperties }> = ({ bg, children, style }) => (
  <div style={{ position: "absolute", inset: 0, background: bg, overflow: "hidden", ...style }}>{children}</div>
);

export const inkText = color.ink;

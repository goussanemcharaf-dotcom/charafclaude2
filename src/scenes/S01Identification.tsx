import React from "react";
import { bg, color } from "../../styles/tokens";
import { cue } from "../timeline";
import { AvatarBubble } from "../components/ui/AvatarBubble";
import { AvatarKind } from "../components/ui/Avatar";
import { KineticLine } from "../components/motion/KineticText";
import { clamp, ease, invLerp, lerp, prog, springy, wobble } from "../components/motion/anim";
import { Fill, QuestionHeadline, SceneProps } from "./shared";

// S01 — IDENTIFICATION (violet world). "Si tu es UGC Creator, Content Creator,
// Voice Over Artist ou Influenceur…" Identity bubbles pop on each spoken role,
// cluster, then spin out; the question lands; violet bars split open.

const CX = 545, CY = 1030; // cluster centre
const BUBBLES: Array<{ kind: AvatarKind; label: string; at: number; x: number; y: number; rot: number; z: number; expression: "smile" | "grin" }> = [
  { kind: "ugc", label: "UGC\nCreator", at: cue("ugc") - 0.1, x: 545, y: 760, rot: -4, z: 4, expression: "smile" },
  { kind: "content", label: "Content\nCreator", at: cue("content") - 0.1, x: 298, y: 1012, rot: 3, z: 3, expression: "grin" },
  { kind: "voice", label: "Voice Over\nArtist", at: cue("voice") - 0.1, x: 792, y: 1012, rot: -3, z: 3, expression: "smile" },
  { kind: "influence", label: "Influenceur", at: cue("influenceur") - 0.1, x: 545, y: 1262, rot: 2, z: 2, expression: "grin" },
];
const SIZE = 392;
export const S01_SPIN = 4.58;
export const S01_SPLIT = 5.4;

const clusterAngle = (t: number) => 230 * ease.inExpo(clamp(invLerp(S01_SPIN, S01_SPIN + 0.44, t)));

const Cluster: React.FC<{ t: number; angle: number; alpha?: number }> = ({ t, angle, alpha = 1 }) => {
  const q = clamp(invLerp(S01_SPIN, S01_SPIN + 0.44, t));
  const sc = 1 - 0.5 * ease.inCubic(q);
  const fade = 1 - clamp(invLerp(S01_SPIN + 0.3, S01_SPIN + 0.46, t));
  return (
    <div
      style={{
        position: "absolute", inset: 0, opacity: alpha * fade,
        transform: `rotate(${angle}deg) scale(${sc})`, transformOrigin: `${CX}px ${CY}px`,
      }}
    >
      {BUBBLES.map((b, i) => {
        if (t < b.at) return null;
        const e = springy(t, b.at, { stiffness: 190, damping: 17 });
        const s = 0.28 + 0.72 * springy(t, b.at, { stiffness: 320, damping: 15 });
        const x = lerp(CX, b.x, e) + wobble(t, i * 3, 0.9) * 5 * e;
        const y = lerp(CY, b.y, e) + wobble(t, i * 3 + 1, 0.8) * 6 * e;
        const blinkT = (t - b.at + i * 0.37) % 2.1;
        const blink = blinkT > 1.9 ? Math.sin(((blinkT - 1.9) / 0.2) * Math.PI) : 0;
        return (
          <div
            key={b.kind}
            style={{
              position: "absolute", left: x - SIZE / 2, top: y - SIZE / 2, zIndex: b.z,
              transform: `scale(${s}) rotate(${b.rot * e + (1 - e) * -14}deg)`,
              opacity: clamp(invLerp(b.at, b.at + 0.06, t)),
            }}
          >
            <AvatarBubble kind={b.kind} label={b.label} size={SIZE} expression={b.expression} blink={blink} />
          </div>
        );
      })}
    </div>
  );
};

const Content: React.FC<{ t: number }> = ({ t }) => {
  const a = clusterAngle(t);
  const av = clusterAngle(t) - clusterAngle(t - 1 / 60); // deg per 1/60 s
  // opens huge and centred (strong first frame), then settles as a headline
  const intro = prog(t, 0.16, 0.42, ease.inOutCubic);
  return (
    <Fill bg={bg.violet}>
      <div
        style={{
          position: "absolute", left: 0, top: 262, width: 1080, transformOrigin: "50% 0%",
          transform: `translateY(${(1 - intro) * 560}px) scale(${1 + (1 - intro) * 0.9})`,
        }}
      >
        <KineticLine
          t={t} size={116} color="rgba(255,255,255,0.95)"
          words={[{ text: "Tu", at: -0.42 }, { text: "es…", at: -0.24 }]}
          exit={{ at: S01_SPIN - 0.04, dur: 0.3, to: "up", distance: 140 }}
        />
      </div>
      {/* rotational motion blur: trailing ghosts while the cluster spins out */}
      {Math.abs(av) > 0.5 && [3, 2, 1].map((k) => (
        <Cluster key={k} t={t} angle={a - av * k * 0.9} alpha={0.22 / k} />
      ))}
      <Cluster t={t} angle={a} />
      <QuestionHeadline t={t} ink="#FFFFFF" accent={color.lavender} />
    </Fill>
  );
};

export const S01Identification: React.FC<SceneProps> = ({ t }) => {
  const sp = prog(t, S01_SPLIT, 0.4, ease.inOutExpo);
  if (sp <= 0) return <Content t={t} />;
  const d = sp * 1010;
  const shadow = 0.28 * (1 - sp * 0.6);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, clipPath: "inset(0 0 50% 0)", transform: `translateY(${-d}px)` }}>
        <Content t={t} />
      </div>
      <div style={{ position: "absolute", inset: 0, clipPath: "inset(50% 0 0 0)", transform: `translateY(${d}px)` }}>
        <Content t={t} />
      </div>
      {/* soft contact shadows cast by the bars onto the revealed scene */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 960 - d, height: 60, background: `linear-gradient(180deg, rgba(40,12,100,${shadow}), rgba(40,12,100,0))` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 960 + d - 60, height: 60, background: `linear-gradient(0deg, rgba(40,12,100,${shadow}), rgba(40,12,100,0))` }} />
    </>
  );
};

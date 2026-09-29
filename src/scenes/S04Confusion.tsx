import React from "react";
import { color, font, shadow } from "../../styles/tokens";
import { cue, wordAt } from "../timeline";
import { clamp, ease, invLerp, keys, lerp, prog, springy, wobble } from "../components/motion/anim";
import { DrawLine } from "../components/motion/Shapes";
import { Avatar } from "../components/ui/Avatar";
import { Cursor } from "../components/ui/Pointer";
import { IconAlert, IconLock } from "../components/ui/Icons";
import { SceneProps, NNBSP } from "./shared";

// S04 — CLIENT CONFUSION. "Et ton client doit chercher partout pour
// comprendre qui tu es et ce que tu fais ?" The client peeks in, clicks,
// gets blocked, opens tab after tab, zigzags between files.

const T_CHERCHER = wordAt(8, "chercher");
const T_PARTOUT = wordAt(8, "partout");
const T_COMPRENDRE = wordAt(8, "comprendre");

// cursor keyframes (time, x, y)
const PATH: Array<[number, number, number]> = [
  [11.3, 1130, 1010], [11.74, 728, 872], [12.06, 728, 872],
  [12.2, 262, 600], [12.36, 842, 1060], [12.52, 300, 1112], [12.68, 790, 430], [12.86, 540, 800], [13.2, 600, 1000],
];
const ZIG: Array<[number, number]> = PATH.slice(2, 8).map(([, x, y]) => [x, y]);

const cursorAt = (t: number): [number, number] => {
  const x = keys(t, PATH.map(([tt, x]) => [tt, x] as [number, number]), ease.inOutCubic);
  const y = keys(t, PATH.map(([tt, , y]) => [tt, y] as [number, number]), ease.inOutCubic);
  const idle = t > 13.2 ? 1 : 0; // impatient little circles
  return [x + idle * Math.cos(t * 9) * 14, y + idle * Math.sin(t * 9) * 10];
};

const TABS = ["Nouvel onglet", "Dossier partagé", "Vidéo (1).mp4", "Lien expiré", "portfolio_v2.pdf", "Recherche…", "Demo_voix.wav", "Nouvel onglet"];

const Bubble: React.FC<{ t: number; at: number; text: string; x: number; y: number }> = ({ t, at, text, x, y }) => {
  if (t < at) return null;
  const s = springy(t, at, { stiffness: 340, damping: 15 });
  return (
    <div style={{ position: "absolute", left: x, top: y, zIndex: 80, transform: `scale(${0.3 + 0.7 * s})`, transformOrigin: "0% 100%", opacity: clamp(invLerp(at, at + 0.06, t)) }}>
      <div
        style={{
          background: "#fff", borderRadius: 44, padding: "30px 44px", boxShadow: shadow.float, fontFamily: font.display,
          fontWeight: 800, fontSize: 80, letterSpacing: "-0.045em", color: color.ink, whiteSpace: "nowrap", lineHeight: 1,
          borderBottomLeftRadius: 10,
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const ConfusionLayer: React.FC<SceneProps> = ({ t }) => {
  const peek = springy(t, 11.24, { stiffness: 150, damping: 15 });
  const [cx, cy] = cursorAt(t);
  const click1 = invLerp(T_CHERCHER, T_CHERCHER + 0.45, t);
  const modal = t >= T_CHERCHER + 0.05 && t < T_CHERCHER + 0.5;
  const ms = springy(t, T_CHERCHER + 0.05, { stiffness: 420, damping: 20 });
  const tabsN = t < T_PARTOUT ? 0 : Math.min(TABS.length, 1 + Math.floor((t - T_PARTOUT) / 0.1));
  const tabsIn = prog(t, T_PARTOUT - 0.08, 0.3, ease.outExpo);
  const trail = clamp(invLerp(12.06, 12.86, t));
  const trailFade = 1 - clamp(invLerp(13.1, 13.45, t));
  const spin = t >= T_COMPRENDRE && t < T_COMPRENDRE + 0.8;
  const tabW = tabsN > 0 ? Math.max(104, Math.min(210, 900 / tabsN)) : 0;
  return (
    <>
      {/* the client peeks in from the left edge, puzzled */}
      {t >= 11.24 && (
        <div style={{ position: "absolute", left: lerp(-420, -96, peek), top: 598, zIndex: 70, transform: `rotate(${62 + wobble(t, 4, 0.8) * 3}deg)` }}>
          <Avatar kind="client" size={390} expression="puzzled" blink={Math.max(0, Math.sin((t - 12.5) * 14)) > 0.97 ? 1 : 0} />
        </div>
      )}
      {/* tabs multiplying */}
      {tabsN > 0 && (
        <div
          style={{
            position: "absolute", left: 40, top: 296, width: 1000, height: 76, borderRadius: 22, background: "rgba(255,255,255,0.97)",
            boxShadow: shadow.card, zIndex: 65, display: "flex", alignItems: "center", gap: 6, padding: "0 12px", boxSizing: "border-box",
            transform: `translateY(${(1 - tabsIn) * -140}px)`, overflow: "hidden",
          }}
        >
          {TABS.slice(0, tabsN).map((tb, i) => (
            <div
              key={i}
              style={{
                width: tabW, flexShrink: 0, height: 52, borderRadius: 14, background: i === tabsN - 1 ? "#EFE9FF" : "#F1F1F4",
                fontFamily: font.ui, fontSize: 20, color: color.graphite, display: "flex", alignItems: "center", gap: 8,
                padding: "0 12px", boxSizing: "border-box", whiteSpace: "nowrap", overflow: "hidden",
                border: i === tabsN - 1 ? `2px solid ${color.violet}` : "2px solid transparent",
              }}
            >
              <div style={{ width: 14, height: 14, borderRadius: 4, flexShrink: 0, background: i % 2 ? "#C9C0E8" : color.fog }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{tb}</span>
            </div>
          ))}
        </div>
      )}
      {/* dotted zigzag trail */}
      {trail > 0 && trailFade > 0 && (
        <div style={{ position: "absolute", inset: 0, zIndex: 66 }}>
          <DrawLine points={ZIG} draw={trail} stroke={color.violet} width={9} dashed opacity={trailFade} />
        </div>
      )}
      {/* loading spinner on the video card */}
      {spin && (
        <div style={{ position: "absolute", left: 186, top: 546, width: 150, height: 150, borderRadius: 75, background: "rgba(255,255,255,0.92)", zIndex: 67, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: shadow.soft }}>
          <svg width={86} height={86} viewBox="0 0 50 50" style={{ transform: `rotate(${(t - T_COMPRENDRE) * 540}deg)` }}>
            <circle cx={25} cy={25} r={19} fill="none" stroke={color.line} strokeWidth={5} />
            <path d="M25 6 A19 19 0 0 1 44 25" fill="none" stroke={color.violet} strokeWidth={5} strokeLinecap="round" />
          </svg>
        </div>
      )}
      {/* access denied */}
      {modal && (
        <div
          style={{
            position: "absolute", left: 200, top: 560, width: 680, zIndex: 75, borderRadius: 32, background: "#fff", boxShadow: shadow.float,
            padding: "34px 38px", boxSizing: "border-box", transform: `scale(${0.6 + 0.4 * ms})`, opacity: clamp(ms * 2),
            display: "flex", gap: 26, alignItems: "center",
          }}
        >
          <div style={{ width: 84, height: 84, borderRadius: 42, background: "#FDECEA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <IconLock size={44} color={color.notifRed} stroke={2.4} />
          </div>
          <div style={{ fontFamily: font.ui }}>
            <div style={{ fontSize: 40, fontWeight: 800, color: color.ink, letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: 10 }}>
              Accès refusé <IconAlert size={34} color={color.notifRed} />
            </div>
            <div style={{ fontSize: 26, color: color.mute, marginTop: 6 }}>Demande l’autorisation au propriétaire.</div>
          </div>
        </div>
      )}
      <Bubble t={t} at={cue("qui") - 0.04} text={`Qui tu es${NNBSP}?`} x={236} y={520} />
      <Bubble t={t} at={cue("que_tu_fais") - 0.04} text={`Ce que tu fais${NNBSP}?`} x={300} y={700} />
      {t >= 11.3 && (
        <div style={{ position: "absolute", inset: 0, zIndex: 90 }}>
          <Cursor x={cx} y={cy} size={64} click={click1 > 0 && click1 < 1 ? click1 : 0} />
        </div>
      )}
    </>
  );
};

export const S04Confusion = ConfusionLayer;

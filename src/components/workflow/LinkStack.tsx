import React from "react";
import { color, font, shadow } from "../../../styles/tokens";
import { clamp, ease, invLerp, lerp, prog, springy, wobble } from "../motion/anim";
import { MotionBlur } from "../motion/MotionBlur";
import { IconLink, IconSend } from "../ui/Icons";
import { LinkCard } from "./Cards";

// LinkStack: ten scattered links land one by one (S08).
// LinkCollapse: they align, collapse and merge into ONE link (S09).

export const LINKS = [
  { title: "Portfolio_v3.pdf", url: "lien-partage/…/k2x9", tint: color.notifRed },
  { title: "Google Drive — dossier", url: "lien-partage/…/d7qa", tint: color.driveBlue },
  { title: "Vidéo UGC (lien)", url: "lien-partage/…/v81m", tint: color.violet },
  { title: "Démo voix", url: "lien-partage/…/a0zc", tint: color.violet },
  { title: "Projets 2025", url: "lien-partage/…/p5rt", tint: color.chatGreen },
  { title: "Travaux récents", url: "lien-partage/…/t9w2", tint: color.driveBlue },
  { title: "Réseaux sociaux", url: "lien-partage/…/r3ne", tint: color.violet },
  { title: "Media kit", url: "lien-partage/…/m4kt", tint: color.notifRed },
  { title: "Exemples de Reels", url: "lien-partage/…/e6lq", tint: color.chatGreen },
  { title: "Contact", url: "lien-partage/…/c1xo", tint: color.driveBlue },
];

// centre x, centre y, rotation, entry offset
const SCATTER: Array<[number, number, number, number, number]> = [
  [540, 700, -7, -900, -300], [470, 842, 6, 900, -200], [600, 962, -4, -900, 200], [440, 1082, 9, 900, 300],
  [620, 622, 5, 0, -1200], [500, 1190, -8, -900, 500], [590, 782, -11, 900, -500], [455, 912, 3, -900, -100],
  [610, 1062, -3, 900, 100], [525, 1002, 12, 0, 1200],
];

const CW = 600, CH = 108;
export const STACK_Y = 930;

export type LinkTimes = { first: number; step: number; align: number; collapse: number; merge: number; send: number };

const cardPose = (i: number, t: number, T: LinkTimes) => {
  const [cx, cy, rot, fx, fy] = SCATTER[i];
  const at = T.first + i * T.step;
  const k = ease.outExpo(clamp(invLerp(at, at + 0.3, t)));
  let x = cx + fx * (1 - k);
  let y = cy + fy * (1 - k);
  let r = rot + (1 - k) * (fx > 0 ? 25 : -25);
  // nervous idle
  x += wobble(t, i * 2, 3) * 3 * k;
  y += wobble(t, i * 2 + 1, 2.6) * 3 * k;
  // align into a neat deck
  const a = ease.inOutExpo(clamp(invLerp(T.align, T.align + 0.36, t)));
  x = lerp(x, 540, a);
  y = lerp(y, STACK_Y + (i - 4.5) * 17, a);
  r = lerp(r, 0, a);
  // collapse into one
  const c = ease.inExpo(clamp(invLerp(T.collapse, T.collapse + 0.24, t)));
  y = lerp(y, STACK_Y, c);
  return { x, y, r, at, visible: t >= at };
};

export const LinkStack: React.FC<{ t: number; T: LinkTimes }> = ({ t, T }) => {
  const fade = 1 - clamp(invLerp(T.merge - 0.04, T.merge + 0.06, t));
  if (fade <= 0) return null;
  return (
    <>
      {LINKS.map((l, i) => {
        const p = cardPose(i, t, T);
        if (!p.visible) return null;
        const q = cardPose(i, t - 1 / 60, T);
        const vx = Math.abs(p.x - q.x) * 60 * 0.012;
        const vy = Math.abs(p.y - q.y) * 60 * 0.012;
        return (
          <div key={i} style={{ position: "absolute", left: p.x - CW / 2, top: p.y - CH / 2, transform: `rotate(${p.r}deg)`, zIndex: i, opacity: fade }}>
            <MotionBlur x={vx} y={vy}>
              <LinkCard title={l.title} url={l.url} width={CW} height={CH} tint={l.tint} />
            </MotionBlur>
          </div>
        );
      })}
    </>
  );
};

/** The single link that replaces them all (placeholder domain "tonnom.com"). */
export const LinkCollapse: React.FC<{ t: number; T: LinkTimes; domain: string }> = ({ t, T, domain }) => {
  if (t < T.merge - 0.04) return null;
  const s = springy(t, T.merge - 0.04, { stiffness: 300, damping: 13 });
  const fly = ease.inExpo(clamp(invLerp(T.send + 0.12, T.send + 0.42, t)));
  const y = STACK_Y - fly * 1300;
  const ring = clamp(invLerp(T.merge, T.merge + 0.55, t));
  const sendIn = springy(t, T.send - 0.2, { stiffness: 380, damping: 16 });
  const press = clamp(invLerp(T.send - 0.02, T.send + 0.1, t)) * (1 - clamp(invLerp(T.send + 0.1, T.send + 0.2, t)));
  return (
    <>
      {ring > 0 && ring < 1 && (
        <div
          style={{
            position: "absolute", left: 540 - (340 + ring * 260), top: STACK_Y - (70 + ring * 260), width: (340 + ring * 260) * 2,
            height: (70 + ring * 260) * 2, borderRadius: 999, border: `4px solid ${color.violet}`, opacity: (1 - ring) * 0.6, boxSizing: "border-box",
          }}
        />
      )}
      <div style={{ position: "absolute", left: 540 - 340, top: y - 70, zIndex: 20 }}>
        <MotionBlur y={fly * 50}>
          <div
            style={{
              width: 680, height: 140, borderRadius: 70, background: color.violet, boxShadow: shadow.float,
              display: "flex", alignItems: "center", gap: 26, padding: "0 20px 0 20px", boxSizing: "border-box",
              transform: `scale(${0.6 + 0.4 * s})`,
            }}
          >
            <div style={{ width: 100, height: 100, borderRadius: 50, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <IconLink size={52} color={color.violet} stroke={2.4} />
            </div>
            <div style={{ flex: 1, fontFamily: font.display, fontWeight: 800, fontSize: 64, letterSpacing: "-0.04em", color: "#fff" }}>{domain}</div>
            {t > T.send - 0.2 && (
              <div
                style={{
                  width: 100, height: 100, borderRadius: 50, background: color.violetNight, display: "flex", alignItems: "center",
                  justifyContent: "center", transform: `scale(${sendIn * (1 - press * 0.15)})`,
                }}
              >
                <IconSend size={48} color="#fff" stroke={2.2} />
              </div>
            )}
          </div>
        </MotionBlur>
      </div>
    </>
  );
};

export const linkCount = (t: number, T: LinkTimes) =>
  t >= T.merge ? 1 : Math.max(0, Math.min(10, Math.floor((t - T.first) / T.step) + 1));

export const counterProg = (t: number, T: LinkTimes) => prog(t, T.merge - 0.02, 0.3, ease.outExpo);

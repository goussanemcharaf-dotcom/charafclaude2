import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { color, font } from "../lib/tokens";
import { clamp, ease, invLerp, keys, lerp, prog, rng } from "../lib/anim";
import { at, ph } from "../timeline";
import { Mono, Panel } from "../components/base";
import { KineticLine } from "../components/Kinetic";
import { Route } from "../components/Signal";
import { IconClock, IconCursor, IconPlay } from "../components/Icons";

// 03 — THE REAL PROBLEM. The naive workflow (créer → choisir un bouton → publier → attendre) builds on
// the words, then breaks; the real system snaps onto the grid: comprendre → stratégie → créer →
// tester → optimiser. On « comprendre » the camera dives into the first step.

const T = {
  lancer: at(3, "lancer"), campagne: at(3, "campagne"), meta: at(3, "meta"), ads: at(3, "ads"), ce: at(3, "ce"),
  creer: at(3, "créer"), video: at(3, "vidéo"), choisir: at(3, "choisir"), bouton: at(3, "bouton"),
  appuyer: at(3, "appuyer"), publier: at(3, "publier"), p3end: ph(3).end,
  avant: at(4, "avant"), depenser: at(4, "dépenser"), budget: at(4, "budget"), publicitaire: at(4, "publicitaire"),
  comprendre: at(4, "comprendre"),
};
export const BREAK_AT = T.publier + 0.55; // the naive chain cracks
export const DIVE_AT = T.comprendre; // camera dives into COMPRENDRE
export const PROBLEM_OUT = DIVE_AT + 0.55;

const OLD = [
  { k: "CRÉER", sub: "une vidéo", at: T.creer, subAt: T.video },
  { k: "CHOISIR", sub: "un bouton", at: T.choisir, subAt: T.bouton },
  { k: "PUBLIER", sub: "et appuyer sur « Publier »", at: T.appuyer, subAt: T.publier },
  { k: "ATTENDRE", sub: "…", at: T.publier + 0.35, subAt: T.publier + 0.6 },
];
const ROW_Y0 = 660;
const ROW_STEP = 190;
const rowY = (i: number) => ROW_Y0 + i * ROW_STEP;

const NEW = ["COMPRENDRE", "STRATÉGIE", "CRÉER", "TESTER", "OPTIMISER"];
export const NEW_Y0 = 600;
export const NEW_STEP = 190;
export const newLock = (i: number) => T.avant + 0.05 + i * 0.36;

export const C03Problem: React.FC<{ t: number }> = ({ t }) => {
  // 3.1 launch card
  const launchIn = prog(t, T.lancer - 0.2, 0.7);
  const launchOut = ease.inCubic(invLerp(T.ce - 0.1, T.ce + 0.4, t));
  // 3.2 naive chain
  const brk = invLerp(BREAK_AT, BREAK_AT + 0.9, t);
  const chainO = 1 - clamp(brk * 1.3);
  // 3.3 new system
  const dive = ease.inCubic(invLerp(DIVE_AT, DIVE_AT + 0.6, t));
  const r = rng(7);
  const scatter = NEW.map(() => ({ x: (r() - 0.5) * 900, y: (r() - 0.5) * 700, rot: (r() - 0.5) * 50 }));
  const cursor = (() => {
    // the cursor picks a button in the list, then presses « Publier »
    const bx = 60 + 34 + 85, by1 = rowY(1) + 60, by2 = rowY(2) + 70;
    const x = keys(t, [[T.choisir - 0.2, bx + 160], [T.bouton, bx + 20], [T.appuyer, bx + 20], [T.publier - 0.05, bx + 10]], ease.inOutCubic);
    const y = keys(t, [[T.choisir - 0.2, by1 + 90], [T.bouton, by1 - 30], [T.appuyer, by1 - 30], [T.publier - 0.05, by2]], ease.inOutCubic);
    const o = clamp(invLerp(T.choisir - 0.3, T.choisir, t)) * (1 - clamp(invLerp(BREAK_AT, BREAK_AT + 0.3, t)));
    return { x, y, o, press: t > T.publier - 0.02 && t < T.publier + 0.14 };
  })();
  return (
    <AbsoluteFill style={{ transform: `scale(${1 + dive * 1.6})`, transformOrigin: `540px ${NEW_Y0}px`, opacity: 1 - clamp(invLerp(DIVE_AT + 0.25, PROBLEM_OUT, t)) }}>
      {/* 3.1 */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 440, opacity: 1 - launchOut }}>
        <KineticLine t={t} size={48} weight={600} align="left" tracking="-0.02em"
          words={[{ text: "Lancer", at: T.lancer, dim: true }, { text: "une", at: at(3, "une"), dim: true }, { text: "campagne", at: T.campagne, dim: true }]} />
        <KineticLine t={t} size={150} align="left" words={[{ text: "META", at: T.meta }, { text: "ADS", at: T.ads }]} />
      </div>
      <div style={{ position: "absolute", left: 160, top: 900, opacity: launchIn * (1 - launchOut), transform: `translateY(${(1 - launchIn) * 40 - launchOut * 60}px)` }}>
        <Panel w={760} pad={34}>
          <Mono size={18}>Nouvelle campagne</Mono>
          <div style={{ fontSize: 46, fontWeight: 750, letterSpacing: "-0.03em", marginTop: 8 }}>Campagne Meta Ads</div>
          <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
            <Mono size={17} c={color.paperDim}>Facebook</Mono><Mono size={17}>·</Mono><Mono size={17} c={color.paperDim}>Instagram</Mono>
          </div>
          <div style={{ marginTop: 26, height: 70, borderRadius: 16, border: `1.5px solid ${color.line2}`, display: "grid", placeItems: "center",
            fontSize: 30, fontWeight: 650, color: color.paper }}>Lancer</div>
        </Panel>
      </div>
      {/* 3.2 */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 440, opacity: chainO }}>
        <KineticLine t={t} size={56} weight={700} align="left" tracking="-0.03em"
          words={[{ text: "ce", at: T.ce, dim: true }, { text: "n’est", at: at(3, "n’est"), dim: true }, { text: "pas", at: at(3, "pas"), dim: true },
            { text: "simplement", at: at(3, "simplement") }]} />
      </div>
      {OLD.map((c, i) => {
        const p = prog(t, c.at - 0.12, 0.55);
        const sub = prog(t, c.subAt - 0.05, 0.4);
        const side = i % 2 ? 1 : -1;
        const fall = ease.inCubic(clamp(brk * 1.15 - i * 0.06));
        const y = rowY(i);
        const prop = (() => {
          if (i === 0) return (
            <div style={{ width: 96, height: 128, borderRadius: 14, overflow: "hidden", position: "relative", border: `1.5px solid ${color.line2}` }}>
              <Img src={staticFile("assets/images/ad_food.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.7) brightness(0.7)" }} />
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}><IconPlay s={34} c={color.paper} /></div>
            </div>);
          if (i === 1) return (
            <div style={{ width: 150, borderRadius: 12, padding: 6, background: color.panel2, border: `1.5px solid ${color.line2}` }}>
              {["En savoir plus", "Acheter", "Réserver"].map((o, j) => (
                <div key={o} style={{ padding: "5px 8px", borderRadius: 7, fontSize: 15, fontWeight: 600, whiteSpace: "nowrap",
                  background: j === 0 && t > T.bouton ? "rgba(255,255,255,0.12)" : "transparent", color: j === 0 && t > T.bouton ? color.paper : color.mist }}>{o}</div>
              ))}
            </div>);
          if (i === 2) return (
            <div style={{ padding: "16px 22px", borderRadius: 14, transform: `scale(${cursor.press ? 0.93 : 1})`,
              background: t > T.publier ? color.signal : color.panel3, color: t > T.publier ? "#170800" : color.paper, fontWeight: 700, fontSize: 24 }}>Publier</div>);
          return <div style={{ transform: `rotate(${t * 220}deg)` }}><IconClock s={60} c={color.mist} /></div>;
        })();
        return (
          <div key={c.k} style={{ position: "absolute", left: 60, top: y, width: 960, height: 150 }}>
            {[0, 1].map((h) => (
              <div key={h} style={{ position: "absolute", inset: 0,
                clipPath: h ? "polygon(47% 0, 100% 0, 100% 100%, 41% 100%)" : "polygon(0 0, 47% 0, 41% 100%, 0 100%)",
                transform: `translate(${(h ? 1 : -1) * 50 * fall}px, ${fall * 520}px) rotate(${(h ? 1 : -1) * side * 14 * fall}deg)`,
                opacity: clamp(p) * (1 - fall), filter: fall > 0.05 ? `blur(${fall * 7}px)` : undefined }}>
                <div style={{ width: 960, height: 150, boxSizing: "border-box", borderRadius: 26, display: "flex", alignItems: "center", gap: 34, padding: "0 34px",
                  background: "rgba(255,255,255,0.03)", border: `1.5px solid ${i === 2 && t > T.publier ? color.signalLine : color.line}`,
                  transform: `translateX(${(1 - p) * -40}px)` }}>
                  <div style={{ width: 170, display: "grid", placeItems: "center" }}>{prop}</div>
                  <div style={{ lineHeight: 1.05 }}>
                    <div style={{ fontFamily: font.sans, fontWeight: 800, fontSize: 56, letterSpacing: "-0.02em", color: color.paper }}>{c.k}</div>
                    <div style={{ fontFamily: font.sans, fontWeight: 600, fontSize: 30, color: color.mist, opacity: sub, marginTop: 6 }}>{c.sub}</div>
                  </div>
                  {i < 3 && <div style={{ marginLeft: "auto", fontFamily: font.mono, fontSize: 24, color: color.mist2 }}>{`0${i + 1}`}</div>}
                </div>
              </div>
            ))}
          </div>
        );
      })}
      {cursor.o > 0 && (
        <div style={{ position: "absolute", left: cursor.x, top: cursor.y, opacity: cursor.o, transform: `scale(${cursor.press ? 0.85 : 1})` }}>
          <IconCursor s={46} c={color.paper} w={2} />
        </div>
      )}
      {/* 3.3 the real system snaps onto the grid */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 440, opacity: prog(t, T.avant - 0.1, 0.5) * (1 - clamp(invLerp(T.comprendre - 0.2, T.comprendre + 0.2, t))) }}>
        <KineticLine t={t} size={40} weight={600} align="left" tracking="-0.02em"
          words={[{ text: "Avant", at: T.avant, dim: true }, { text: "de", at: at(4, "de"), dim: true }, { text: "dépenser", at: T.depenser },
            { text: "votre", at: at(4, "votre"), dim: true }, { text: "budget", at: T.budget }, { text: "publicitaire", at: T.publicitaire }]} />
      </div>
      <Route pts={[[279, NEW_Y0], [279, NEW_Y0 + NEW_STEP * 4]]} p={clamp(invLerp(newLock(0), newLock(4) + 0.3, t))} width={3} base={false} head={false}
        o={prog(t, newLock(0), 0.3)} />
      {NEW.map((k, i) => {
        const lk = newLock(i);
        const p = ease.outBackSoft(invLerp(lk - 0.45, lk, t));
        const s = scatter[i];
        const flash = clamp(1 - Math.abs(t - lk) / 0.25);
        const hot = i === 0 && t > T.comprendre;
        const dim = t > T.comprendre && i > 0 ? 0.35 : 1;
        const y = NEW_Y0 + i * NEW_STEP;
        return (
          <React.Fragment key={k}>
            <div style={{ position: "absolute", left: 0, top: y, width: 1080, height: 1, background: color.signal, opacity: 0.35 * flash }} />
            <div style={{ position: "absolute", left: 540, top: y, opacity: clamp(p * 1.5) * dim,
              transform: `translate(-50%, -50%) translate(${lerp(s.x, 0, clamp(p))}px, ${lerp(s.y, 0, clamp(p))}px) rotate(${lerp(s.rot, 0, clamp(p))}deg)`,
              filter: p < 0.6 ? `blur(${(0.6 - Math.max(0, p)) * 12}px)` : undefined }}>
              <div style={{ width: 600, height: 110, borderRadius: 24, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 26, padding: "0 30px",
                background: hot ? color.signal : color.panel2, border: `1.5px solid ${hot ? color.signal : color.line2}`,
                boxShadow: "0 30px 60px -30px rgba(0,0,0,0.8)" }}>
                <span style={{ width: 18, height: 18, borderRadius: 9, background: hot ? "#170800" : color.signal, flex: "none" }} />
                <Mono size={22} c={hot ? "#170800" : color.mist}>{`0${i + 1}`}</Mono>
                <span style={{ fontFamily: font.sans, fontWeight: 800, fontSize: 44, letterSpacing: "-0.02em", color: hot ? "#170800" : color.paper }}>{k}</span>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

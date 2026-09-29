import React from "react";
import { AbsoluteFill } from "remotion";
import { color, font } from "../lib/tokens";
import { clamp, ease, invLerp, keys, lerp, prog } from "../lib/anim";
import { at } from "../timeline";
import { Bar, Dot, Mono, Panel, Pill } from "../components/base";
import { AdPost, CREATIVES } from "../components/Campaign";
import { KineticLine } from "../components/Kinetic";
import { Route, SignalGlyph } from "../components/Signal";
import { IconEye, IconTarget, IconUsers } from "../components/Icons";

// 01 — HOOK. A fictional campaign manager in macro: the budget fills, the signal leaves it, runs
// through the campaign… and disappears into noise. "Where is this budget actually going?"

const T = {
  investissez: at(1, "investissez"), publicite: at(1, "publicité"), facebook: at(1, "facebook"),
  ou: at(1, "ou"), instagram: at(1, "instagram"),
};
export const HOOK_OUT = at(2, "mais") - 0.25;

// board geometry (frame px, before camera)
const B = { x: 60, y: 820, w: 960 };
const BUDGET = { x: B.x, y: B.y + 96, w: 420, h: 150 };
const TREE_Y = B.y + 280;
const ROWS = [
  { label: "Campagne", name: "Acquisition · Meta Ads", lvl: 0 },
  { label: "Ensemble de publicités", name: "Audience principale", lvl: 1 },
  { label: "Publicité", name: "Créative A", lvl: 2 },
];
const rowY = (i: number) => TREE_Y + i * 92;
const rowX = (i: number) => B.x + ROWS[i].lvl * 30;

// the signal's route: out of the budget bar, down the tree, then away into the noise (top right)
const PATH: [number, number][] = [
  [BUDGET.x + 380, BUDGET.y + 88], [BUDGET.x + 400, BUDGET.y + 88], [BUDGET.x + 400, rowY(0) + 38],
  [rowX(0) + 24, rowY(0) + 38], [rowX(0) + 24, rowY(2) + 38], [B.x + 470, rowY(2) + 38],
  [B.x + 470, B.y + 40], [1120, B.y - 260],
];

export const C01Hook: React.FC<{ t: number }> = ({ t }) => {
  const budget = lerp(0.14, 1, ease.outCubic(invLerp(0.0, 1.1, t)));
  const route = keys(t, [[0.2, 0], [2.15, 0.78], [3.1, 1]], ease.inOutCubic); // the budget is already flowing
  // camera: macro on the budget field, then pull back to the whole campaign
  const z = keys(t, [[0, 1.95], [1.15, 1.8], [2.45, 1.0]], ease.inOutCubic);
  const fx = BUDGET.x + BUDGET.w / 2, fy = BUDGET.y + BUDGET.h / 2; // focus point
  const focusMix = keys(t, [[0, 1], [1.15, 1], [2.45, 0]], ease.inOutCubic);
  const cx = lerp(540, fx, focusMix), cy = lerp(1130, fy, focusMix);
  const cam = `translate(${540 - cx * z}px, ${1130 - cy * z}px) scale(${z})`;
  const out = ease.inCubic(invLerp(HOOK_OUT - 0.1, HOOK_OUT + 0.45, t));
  const hand = ease.inOutCubic(invLerp(T.publicite - 0.14, T.publicite + 0.24, t));
  const hookOut = ease.inCubic(invLerp(HOOK_OUT, HOOK_OUT + 0.35, t));
  return (
    <AbsoluteFill>
      {/* the campaign (under the camera) */}
      <AbsoluteFill style={{ transform: `${cam} scale(${1 - 0.12 * out})`, transformOrigin: "0 0", opacity: 1 - out,
        filter: out > 0.02 ? `blur(${out * 10}px)` : undefined }}>
        <div style={{ position: "absolute", left: B.x, top: B.y, width: B.w, fontFamily: font.sans, color: color.paper }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Mono size={20}>Gestionnaire de campagnes</Mono>
            <Pill tone="signal" size={22}><Dot on size={10} pulse={(t * 1.2) % 1} />Active</Pill>
          </div>
        </div>
        {/* budget field */}
        <div style={{ position: "absolute", left: BUDGET.x, top: BUDGET.y }}>
          <Panel w={BUDGET.w} h={BUDGET.h} pad={24} active={1}>
            <Mono size={18} c={color.paperDim}>Budget publicitaire</Mono>
            <Bar p={budget} w={372} h={14} style={{ marginTop: 22 }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
              <Mono size={15}>Quotidien</Mono>
              <Mono size={15} c={color.signal}>En diffusion</Mono>
            </div>
          </Panel>
        </div>
        {/* tree */}
        {ROWS.map((r, i) => {
          const lit = route > 0.18 + i * 0.16;
          return (
            <div key={i} style={{ position: "absolute", left: rowX(i), top: rowY(i), width: 420 - r.lvl * 30, height: 76, boxSizing: "border-box",
              display: "flex", alignItems: "center", gap: 14, padding: "0 18px", borderRadius: 16,
              background: lit ? "rgba(255,90,31,0.07)" : "rgba(255,255,255,0.025)", border: `1.5px solid ${lit ? color.signalLine : color.line}` }}>
              <Dot on={lit} size={11} />
              <div style={{ lineHeight: 1.15 }}>
                <Mono size={14}>{r.label}</Mono>
                <div style={{ fontFamily: font.sans, fontSize: 22, fontWeight: 600, color: color.paper }}>{r.name}</div>
              </div>
            </div>
          );
        })}
        {/* fields */}
        <div style={{ position: "absolute", left: B.x, top: rowY(3) + 6 }}>
          <Panel w={420} pad={20}>
            {[
              [<IconTarget key="a" s={24} c={color.mist} />, "Objectif", "Prospects"],
              [<IconUsers key="b" s={24} c={color.mist} />, "Audience", "Algérie · 25–54"],
              [<IconEye key="c" s={24} c={color.mist} />, "Placements", "Facebook · Instagram"],
            ].map(([ic, k, v], i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: i ? 12 : 0 }}>
                {ic}<Mono size={14}>{k as string}</Mono>
                <span style={{ marginLeft: "auto", fontFamily: font.sans, fontSize: 19, fontWeight: 600, color: color.paper }}>{v as string}</span>
              </div>
            ))}
          </Panel>
        </div>
        {/* the ad */}
        <div style={{ position: "absolute", left: B.x + 500, top: B.y + 96 }}>
          <AdPost c={CREATIVES.shop} w={460} highlight={route > 0.62 ? 1 : 0} />
        </div>
        <Route pts={PATH} p={route} width={3.5} base={false} />
        {route > 0 && route < 1 && (
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            <SignalGlyph x={BUDGET.x + 380 * budget} y={BUDGET.y + 88} size={10} o={0.9} />
          </svg>
        )}
      </AbsoluteFill>
      {/* headline (screen space) */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 470 }}>
        {/* frame 0 speaks to the viewer: « Vous investissez » large and white from the very first frame (the feed's
            first impression), then it hands the focus to « PUBLICITÉ » — it shrinks back to a grey connector */}
        <div style={{ height: 48, position: "relative", opacity: 1 - hookOut, transform: `translateY(${-40 * hookOut}px)`,
          filter: hookOut > 0 ? `blur(${hookOut * 10}px)` : undefined }}>
          <div style={{ position: "absolute", left: 0, bottom: 0, whiteSpace: "nowrap", transformOrigin: "0% 100%", transform: `scale(${lerp(1.75, 1, hand)})`,
            fontFamily: font.sans, fontSize: 40, fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.05,
            color: hand < 1 ? `rgb(${Math.round(lerp(244, 140, hand))}, ${Math.round(lerp(242, 140, hand))}, ${Math.round(lerp(238, 146, hand))})` : color.mist }}>
            Vous investissez
          </div>
        </div>
        <KineticLine t={t} size={118} align="left" out={HOOK_OUT} style={{ marginTop: 10 }}
          words={[{ text: "PUBLICITÉ", at: T.publicite }]} />
        <KineticLine t={t} size={70} align="left" out={HOOK_OUT} style={{ marginTop: 6 }}
          words={[{ text: "FACEBOOK", at: T.facebook }, { text: "&", at: T.ou, dim: true }, { text: "INSTAGRAM", at: T.instagram }]} />
      </div>
      {/* the signal escaping into the noise: a vanishing trail at the frame edge */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: clamp((route - 0.85) * 6) * (1 - out) }}>
        <SignalGlyph x={1040} y={560} size={10} o={1 - prog(t, 3.0, 0.4)} />
      </svg>
    </AbsoluteFill>
  );
};

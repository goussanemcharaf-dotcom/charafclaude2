import React from "react";
import { AbsoluteFill } from "remotion";
import { color, font } from "../lib/tokens";
import { clamp, ease, invLerp, lerp, prog } from "../lib/anim";
import { at, ph } from "../timeline";
import { Mono } from "../components/base";
import { Wordmark } from "../components/Wordmark";
import { SignalGlyph } from "../components/Signal";
import { CORE, SATS, SatPill, satPos } from "./C04Business";
import { DIVE_AT } from "./C03Problem";

// 05 — ESKAYLI ENTERS. On « Chez » the scattered system snaps into order; on « Eskayli » the brand
// lands at the centre and the signal becomes the dot of its i. Then « STRATÉGIE META ADS », and the
// six insights align around it as a strategy map.

const T = {
  chez: at(9, "chez"), eskayli: at(9, "eskayli"), construisons: at(9, "construisons"), strategie: at(9, "stratégie"),
  meta: at(9, "meta"), autour: at(9, "autour"), business: at(9, "business"), end: ph(9).end, next: ph(10).start,
};
export const ESKAYLI_OUT = T.next - 0.3;

const MARK = { x: 540, y: 760 };
const GRID = SATS.map((_, i) => ({ x: 280 + (i % 2) * 520, y: 1085 + Math.floor(i / 2) * 128 }));

export const C05Eskayli: React.FC<{ t: number }> = ({ t }) => {
  const snap = ease.outBackSoft(invLerp(T.chez - 0.05, T.chez + 0.55, t));
  const mark = ease.outExpo(invLerp(T.eskayli - 0.05, T.eskayli + 0.7, t));
  const dotFly = ease.inOutCubic(invLerp(T.chez + 0.1, T.eskayli + 0.2, t));
  const label = prog(t, T.strategie - 0.1, 0.6);
  const links = clamp(invLerp(T.autour - 0.1, T.business + 0.3, t));
  const out = ease.inCubic(invLerp(ESKAYLI_OUT - 0.2, ESKAYLI_OUT + 0.35, t));
  const rot = (T.chez - DIVE_AT) * 2.2;
  const flash = clamp(1 - Math.abs(t - (T.chez + 0.5)) / 0.3);
  // dot target: the i of the wordmark (measured from the Wordmark geometry at size 170)
  const dotX = MARK.x + 205, dotY = MARK.y - 72;
  const fromX = CORE.x, fromY = CORE.y;
  return (
    <AbsoluteFill style={{ opacity: 1 - out, transform: `scale(${1 - 0.05 * out})` }}>
      {/* grid guides flash when the system locks */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: flash * 0.8 }}>
        {GRID.map((g, i) => <line key={i} x1={0} x2={1080} y1={g.y} y2={g.y} stroke={color.signal} strokeWidth={1} opacity={0.35} />)}
        {[280, 800].map((x) => <line key={x} x1={x} x2={x} y1={1000} y2={1460} stroke={color.signal} strokeWidth={1} opacity={0.35} />)}
      </svg>
      {/* strategy-map links */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: links }}>
        {GRID.map((g, i) => {
          const d = `M${MARK.x},${MARK.y + 150} L${MARK.x},${1010} L${g.x},${1010} L${g.x},${g.y - 36}`;
          return <path key={i} d={d} fill="none" stroke={SATS[i].hot ? color.signal : "rgba(255,255,255,0.22)"} strokeWidth={1.5}
            strokeDasharray={`${1400 * links} 1400`} />;
        })}
      </svg>
      {/* satellites travel from the orbit into the grid */}
      {SATS.map((s, i) => {
        const [ox, oy] = satPos(s, rot);
        const g = GRID[i];
        const x = lerp(ox, g.x, clamp(snap)), y = lerp(oy, g.y, clamp(snap));
        return (
          <div key={s.k} style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)" }}>
            <SatPill s={s} on={1} w={lerp(0, 460, clamp(snap)) || undefined} />
          </div>
        );
      })}
      {/* the orbit and the core dissolve as the brand arrives (C04 hands over on « Chez ») */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 1 - clamp(snap * 1.6) }}>
        <circle cx={CORE.x} cy={CORE.y} r={CORE.r} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth={2} strokeDasharray="5 11"
          transform={`rotate(${rot * 3} ${CORE.x} ${CORE.y})`} />
        <circle cx={CORE.x} cy={CORE.y} r={CORE.r * 0.62} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1.5} />
      </svg>
      <div style={{ position: "absolute", left: CORE.x, top: CORE.y, transform: `translate(-50%, -50%) scale(${1 - 0.4 * clamp(snap)})`,
        opacity: 1 - clamp(snap * 1.4), width: 250, height: 250, borderRadius: 64, background: "radial-gradient(80% 80% at 30% 25%, #2A2A2E 0%, #151517 70%)",
        border: `1.5px solid ${color.line2}`, display: "grid", placeItems: "center", fontFamily: font.sans, fontWeight: 800, fontSize: 30,
        letterSpacing: "0.02em", color: color.paper, textAlign: "center", lineHeight: 1.05, boxSizing: "border-box", paddingTop: 70 }}>VOTRE<br />BUSINESS</div>
      {/* the signal flies from the core into the i */}
      {dotFly > 0 && dotFly < 1 && (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <SignalGlyph x={lerp(fromX, dotX, dotFly)} y={lerp(fromY, dotY, dotFly) - Math.sin(dotFly * Math.PI) * 160} size={22} />
        </svg>
      )}
      <div style={{ position: "absolute", left: MARK.x, top: MARK.y, transform: `translate(-50%, -50%) scale(${0.92 + 0.08 * mark})`, opacity: mark,
        filter: mark < 0.95 ? `blur(${(1 - mark) * 8}px)` : undefined }}>
        <Wordmark size={170} dot={dotFly >= 1 ? 1 : 0} dotPulse={t > T.eskayli + 0.2 ? ((t - T.eskayli - 0.2) * 0.7) % 1 : undefined} />
      </div>
      <div style={{ position: "absolute", left: MARK.x, top: MARK.y + 150, transform: `translate(-50%, 0) translateY(${(1 - label) * 16}px)`, opacity: label,
        display: "flex", alignItems: "center", gap: 18, whiteSpace: "nowrap" }}>
        <span style={{ width: 44, height: 3, background: color.signal, borderRadius: 2 }} />
        <span style={{ fontFamily: font.sans, fontWeight: 750, fontSize: 40, letterSpacing: "0.06em", color: color.paper }}>
          STRATÉGIE <span style={{ opacity: t > T.meta ? 1 : 0.25 }}>META ADS</span>
        </span>
        <span style={{ width: 44, height: 3, background: color.signal, borderRadius: 2 }} />
      </div>
      <div style={{ position: "absolute", left: MARK.x, top: 560, transform: "translate(-50%, -50%)", opacity: prog(t, T.chez - 0.1, 0.4) * (1 - mark * 0.0) }}>
        <Mono size={22}>Chez</Mono>
      </div>
    </AbsoluteFill>
  );
};

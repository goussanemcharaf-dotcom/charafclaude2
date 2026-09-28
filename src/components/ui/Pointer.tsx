import React from "react";
import { color, font, shadow } from "../../../styles/tokens";
import { clamp, ease, invLerp } from "../motion/anim";
import { IconBell } from "./Icons";

/** Mouse cursor (original rounded arrow) with an optional click ripple. */
export const Cursor: React.FC<{
  x: number; y: number; size?: number; click?: number; hand?: boolean; opacity?: number; rippleColor?: string;
}> = ({ x, y, size = 56, click = 0, hand = false, opacity = 1, rippleColor = color.violet }) => {
  const press = click > 0 && click < 0.35 ? 1 - Math.abs(click / 0.35 - 0.5) * 2 : 0;
  const r = ease.outCubic(clamp(click)) * size * 1.3;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, opacity }}>
      {click > 0 && click < 1 && (
        <div
          style={{
            position: "absolute", left: -r, top: -r, width: r * 2, height: r * 2, borderRadius: "50%",
            border: `3px solid ${rippleColor}`, opacity: 1 - click, boxSizing: "border-box",
          }}
        />
      )}
      <svg
        viewBox="0 0 32 32" width={size} height={size}
        style={{ position: "absolute", left: hand ? -size * 0.36 : -size * 0.14, top: -size * 0.08, transform: `scale(${1 - press * 0.12})`, filter: "drop-shadow(0 6px 10px rgba(10,10,20,0.28))" }}
        aria-hidden
      >
        {hand ? (
          <path
            d="M12.5 15V6.8a1.8 1.8 0 0 1 3.6 0V13l.6-.2a1.8 1.8 0 0 1 3.5.6v.4a1.8 1.8 0 0 1 3.3.9v.8a1.8 1.8 0 0 1 3.2 1.1v5.2c0 4.3-3.1 7.2-7.4 7.2h-1.6c-2.4 0-4.3-1-5.7-3l-4-5.8a1.9 1.9 0 0 1 2.9-2.4z"
            fill="#fff" stroke={color.ink} strokeWidth={1.6} strokeLinejoin="round"
          />
        ) : (
          <path d="M6 3.5l19.5 12.2-8.6 1.9-4.6 8.4z" fill={color.ink} stroke="#fff" strokeWidth={2} strokeLinejoin="round" />
        )}
      </svg>
    </div>
  );
};

/** Touch indicator for phone taps. */
export const Tap: React.FC<{ x: number; y: number; p: number; size?: number }> = ({ x, y, p, size = 90 }) => {
  if (p <= 0 || p >= 1) return null;
  const s = size * (0.6 + 0.8 * ease.outCubic(p));
  return (
    <div
      style={{
        position: "absolute", left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: "50%",
        background: "rgba(123,63,242,0.18)", border: "3px solid rgba(123,63,242,0.55)", opacity: 1 - p,
        boxSizing: "border-box",
      }}
    />
  );
};

/** Generic push notification (not a copy of any OS banner). */
export const Notification: React.FC<{
  title: string; body: string; app?: string; width?: number; tint?: string; style?: React.CSSProperties;
}> = ({ title, body, app = "Messages", width = 560, tint = color.chatGreen, style }) => (
  <div
    style={{
      width, borderRadius: 28, background: "rgba(255,255,255,0.94)", boxShadow: shadow.card,
      padding: "20px 24px", boxSizing: "border-box", display: "flex", gap: 18, alignItems: "center",
      border: "1px solid rgba(0,0,0,0.04)", ...style,
    }}
  >
    <div style={{ width: 58, height: 58, borderRadius: 16, background: tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <IconBell size={30} color="#fff" stroke={2.2} />
    </div>
    <div style={{ flex: 1, minWidth: 0, fontFamily: font.ui }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, color: color.mute, fontWeight: 500 }}>
        <span>{app}</span><span>maintenant</span>
      </div>
      <div style={{ fontSize: 25, fontWeight: 700, color: color.ink, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
      <div style={{ fontSize: 23, color: color.graphite, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{body}</div>
    </div>
  </div>
);

/** Small label chip used for kinetic tags. */
export const Chip: React.FC<{
  children: React.ReactNode; bg?: string; fg?: string; size?: number; icon?: React.ReactNode; style?: React.CSSProperties;
}> = ({ children, bg = color.ink, fg = "#fff", size = 40, icon, style }) => (
  <div
    style={{
      display: "inline-flex", alignItems: "center", gap: size * 0.3, background: bg, color: fg,
      borderRadius: 999, padding: `${size * 0.32}px ${size * 0.62}px`, fontFamily: font.display, fontWeight: 700,
      fontSize: size, letterSpacing: "-0.035em", lineHeight: 1, whiteSpace: "nowrap", boxShadow: shadow.soft, ...style,
    }}
  >
    {icon}
    {children}
  </div>
);

/** Fade helper for pop-in chips etc. */
export const popIn = (t: number, at: number, dur = 0.18) => clamp(invLerp(at, at + dur, t));

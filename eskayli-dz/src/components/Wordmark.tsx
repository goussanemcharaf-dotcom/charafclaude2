import React from "react";
import { color, font } from "../lib/tokens";

// ESKAYLI DZ typographic wordmark: « eskaylı » in Geist 800 whose i-dot is the film's signal,
// with « DZ » set in Geist Mono. (A typographic treatment for this film — swap for the official logo
// if the brand has one.)
export const Wordmark: React.FC<{
  size?: number; ink?: string; dot?: number; dz?: number; dotPulse?: number; style?: React.CSSProperties;
}> = ({ size = 150, ink = color.paper, dot = 1, dz = 1, dotPulse, style }) => (
  <div style={{ display: "inline-flex", alignItems: "baseline", gap: size * 0.16, whiteSpace: "nowrap", width: "max-content", ...style }}>
    <span style={{ fontFamily: font.sans, fontWeight: 800, fontSize: size, letterSpacing: "-0.055em", color: ink, lineHeight: 1, position: "relative" }}>
      eskayl
      <span style={{ position: "relative", display: "inline-block" }}>
        ı
        <span style={{ position: "absolute", left: "50%", top: size * 0.035, width: size * 0.19, height: size * 0.19, borderRadius: "50%",
          background: color.signal, transform: `translate(-50%, 0) scale(${dot})`, opacity: dot > 0.01 ? 1 : 0 }} />
        {dotPulse !== undefined && (
          <span style={{ position: "absolute", left: "50%", top: size * 0.035 + size * 0.095, width: size * 0.19, height: size * 0.19, borderRadius: "50%",
            border: `${Math.max(2, size * 0.012)}px solid ${color.signal}`, transform: `translate(-50%, -50%) scale(${1 + dotPulse * 2.4})`, opacity: 0.7 * (1 - dotPulse) }} />
        )}
      </span>
    </span>
    <span style={{ fontFamily: font.mono, fontWeight: 600, fontSize: size * 0.34, letterSpacing: "0.06em", color: ink, opacity: dz,
      padding: `${size * 0.04}px ${size * 0.09}px`, border: `${Math.max(1.5, size * 0.012)}px solid ${ink === color.paper ? "rgba(244,242,238,0.35)" : "rgba(11,11,12,0.35)"}`,
      borderRadius: size * 0.08, transform: `translateY(${-size * 0.06}px)` }}>
      DZ
    </span>
  </div>
);

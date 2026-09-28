import React, { useId } from "react";

// Original flat-illustrated avatars (2D SVG with soft gradient shading).
// Inspired by the friendliness of the reference's avatar bubbles, but drawn
// from scratch: no Memoji assets, no 3D, no photoreal faces.

export type AvatarKind = "ugc" | "content" | "voice" | "influence" | "client";

type Palette = { skin: string; skinShade: string; hair: string; hairHi: string; cloth: string; clothShade: string };

const P: Record<AvatarKind, Palette> = {
  ugc: { skin: "#C98C68", skinShade: "#A86E4E", hair: "#2E1B12", hairHi: "#5A3826", cloth: "#F2E4D4", clothShade: "#D9C4AE" },
  content: { skin: "#8A5638", skinShade: "#6B3F27", hair: "#17110D", hairHi: "#3A2A20", cloth: "#2E3A4D", clothShade: "#1F2836" },
  voice: { skin: "#F0C6A6", skinShade: "#D9A583", hair: "#8A4B27", hairHi: "#B8703F", cloth: "#90A889", clothShade: "#6F8A69" },
  influence: { skin: "#DDA27B", skinShade: "#BF8360", hair: "#2A1A11", hairHi: "#553624", cloth: "#1F1F26", clothShade: "#111116" },
  client: { skin: "#B67B57", skinShade: "#93603F", hair: "#1E1510", hairHi: "#3D2B20", cloth: "#2B3040", clothShade: "#1C2030" },
};

export const Avatar: React.FC<{
  kind: AvatarKind;
  size?: number;
  expression?: "smile" | "grin" | "puzzled";
  blink?: number; // 0 open .. 1 closed
  style?: React.CSSProperties;
}> = ({ kind, size = 240, expression = "smile", blink = 0, style }) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const p = P[kind];
  const g = (n: string) => `${n}${uid}`;
  const eyeRy = 7.2 * (1 - 0.9 * blink);

  return (
    <svg viewBox="0 0 240 240" width={size} height={size} style={style} aria-hidden>
      <defs>
        <radialGradient id={g("face")} cx="42%" cy="36%" r="70%">
          <stop offset="0%" stopColor={lighten(p.skin, 0.1)} />
          <stop offset="62%" stopColor={p.skin} />
          <stop offset="100%" stopColor={p.skinShade} />
        </radialGradient>
        <linearGradient id={g("hair")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.hairHi} />
          <stop offset="70%" stopColor={p.hair} />
        </linearGradient>
        <linearGradient id={g("cloth")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.cloth} />
          <stop offset="100%" stopColor={p.clothShade} />
        </linearGradient>
        <radialGradient id={g("glow")} cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* back hair (behind head) */}
      {kind === "ugc" && (
        <path
          d="M66,96 C60,54 92,34 122,36 C156,38 182,60 176,104 C174,132 184,160 196,190 L170,206 C150,196 146,176 146,160 L96,160 C94,178 88,196 70,206 L44,190 C58,160 70,130 66,96 Z"
          fill={`url(#${g("hair")})`}
        />
      )}
      {kind === "voice" && (
        <path d="M68,104 C62,62 90,38 122,38 C154,38 180,62 174,104 L178,150 C160,158 150,150 146,140 L96,140 C92,152 80,158 64,150 Z" fill={`url(#${g("hair")})`} />
      )}

      {/* torso */}
      <path d="M18,240 C22,200 58,178 98,172 L142,172 C182,178 218,200 222,240 Z" fill={`url(#${g("cloth")})`} />
      {/* neck */}
      <path d="M103,140 L137,140 L139,176 C128,186 112,186 101,176 Z" fill={p.skinShade} />
      {kind === "client" && (
        <>
          <path d="M100,172 L120,206 L140,172 L132,168 L120,188 L108,168 Z" fill="#F5F5F7" />
          <path d="M114,190 L120,206 L126,190 L120,184 Z" fill="#7B3FF2" />
          <path d="M98,172 L120,210 L86,240 L60,240 L70,190 Z" fill="#232838" opacity="0.6" />
          <path d="M142,172 L120,210 L154,240 L180,240 L170,190 Z" fill="#232838" opacity="0.6" />
        </>
      )}
      {kind === "content" && (
        <>
          <path d="M104,176 C108,196 132,196 136,176" fill="none" stroke="#1A2230" strokeWidth="5" strokeLinecap="round" />
          <line x1="110" y1="190" x2="108" y2="214" stroke="#E9E4DC" strokeWidth="3" strokeLinecap="round" />
          <line x1="130" y1="190" x2="132" y2="214" stroke="#E9E4DC" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      {kind === "ugc" && <path d="M92,174 C104,192 136,192 148,174" fill="none" stroke="#D9C4AE" strokeWidth="4" />}
      {kind === "influence" && (
        <>
          <path d="M98,172 L118,214 L96,240 L70,240 Z" fill="#2B2B34" />
          <path d="M142,172 L122,214 L144,240 L170,240 Z" fill="#2B2B34" />
          <path d="M104,172 L120,200 L136,172 Z" fill="#ECE7E1" />
        </>
      )}

      {/* ears */}
      <ellipse cx="73" cy="110" rx="8" ry="12" fill={p.skinShade} />
      <ellipse cx="167" cy="110" rx="8" ry="12" fill={p.skinShade} />
      {kind === "ugc" && (
        <>
          <circle cx="72" cy="128" r="7" fill="none" stroke="#E2B650" strokeWidth="3" />
          <circle cx="168" cy="128" r="7" fill="none" stroke="#E2B650" strokeWidth="3" />
        </>
      )}

      {/* head */}
      <path
        d="M74,104 C74,70 94,48 120,48 C146,48 166,70 166,104 C166,134 148,158 120,158 C92,158 74,134 74,104 Z"
        fill={`url(#${g("face")})`}
      />

      {/* beard */}
      {kind === "content" && (
        <path
          d="M78,112 C80,136 96,160 120,160 C144,160 160,136 162,112 C156,126 150,132 140,134 C132,130 108,130 100,134 C90,132 84,126 78,112 Z"
          fill={p.hair}
          opacity="0.92"
        />
      )}

      {/* face features */}
      <g>
        {/* brows */}
        {expression === "puzzled" ? (
          <>
            <path d="M92,90 Q102,82 112,88" fill="none" stroke={p.hair} strokeWidth="5" strokeLinecap="round" />
            <path d="M128,92 Q138,94 148,92" fill="none" stroke={p.hair} strokeWidth="5" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M92,92 Q102,86 112,90" fill="none" stroke={p.hair} strokeWidth="4.5" strokeLinecap="round" />
            <path d="M128,90 Q138,86 148,92" fill="none" stroke={p.hair} strokeWidth="4.5" strokeLinecap="round" />
          </>
        )}
        {/* eyes */}
        <ellipse cx="102" cy="108" rx="5.6" ry={eyeRy} fill="#1B1412" />
        <ellipse cx="138" cy="108" rx="5.6" ry={eyeRy} fill="#1B1412" />
        {blink < 0.5 && (
          <>
            <circle cx="104" cy="105" r="1.9" fill="#FFFFFF" />
            <circle cx="140" cy="105" r="1.9" fill="#FFFFFF" />
          </>
        )}
        {/* nose */}
        <path d="M117,114 Q115,124 120,126 Q124,126 125,123" fill="none" stroke={p.skinShade} strokeWidth="3" strokeLinecap="round" />
        {/* cheeks */}
        <circle cx="92" cy="126" r="8" fill="#E86A6A" opacity="0.16" />
        <circle cx="148" cy="126" r="8" fill="#E86A6A" opacity="0.16" />
        {/* mouth */}
        {expression === "grin" && (
          <path d="M104,134 Q120,152 136,134 Q120,140 104,134 Z" fill="#6A2B24" stroke="#6A2B24" strokeWidth="2" strokeLinejoin="round" />
        )}
        {expression === "grin" && <path d="M108,136 Q120,141 132,136 L131,138 Q120,143 109,138 Z" fill="#FFFFFF" />}
        {expression === "smile" && (
          <path d="M106,135 Q120,147 134,135" fill="none" stroke="#6A2B24" strokeWidth="4" strokeLinecap="round" />
        )}
        {expression === "puzzled" && (
          <path d="M110,140 Q118,136 130,139" fill="none" stroke="#6A2B24" strokeWidth="4" strokeLinecap="round" />
        )}
      </g>

      {/* front hair / headwear */}
      {kind === "ugc" && (
        <path d="M72,100 C70,62 96,44 124,44 C150,46 170,64 168,100 C156,86 146,70 128,64 C118,80 96,92 72,100 Z" fill={`url(#${g("hair")})`} />
      )}
      {kind === "voice" && (
        <path d="M72,102 C70,64 94,44 122,44 C150,44 170,64 168,102 C150,98 134,84 128,70 C120,86 96,98 72,102 Z" fill={`url(#${g("hair")})`} />
      )}
      {kind === "content" && (
        <>
          <path d="M70,98 C68,58 94,34 122,34 C150,34 172,58 170,98 Z" fill="#E0673A" />
          <path d="M70,98 C68,58 94,34 122,34 C150,34 172,58 170,98 Z" fill={`url(#${g("glow")})`} />
          <rect x="66" y="84" width="108" height="20" rx="10" fill="#C9542B" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <line key={i} x1={78 + i * 14} y1="86" x2={78 + i * 14} y2="102" stroke="#B64A25" strokeWidth="3" />
          ))}
        </>
      )}
      {kind === "influence" && (
        <>
          <path d="M72,96 C68,60 90,40 118,38 C132,30 160,36 166,56 C174,72 170,88 168,98 C160,80 150,70 140,66 C126,74 100,76 72,96 Z" fill={`url(#${g("hair")})`} />
          {/* sunglasses pushed up */}
          <g transform="translate(0,-2)">
            <rect x="86" y="56" width="30" height="18" rx="9" fill="#141418" />
            <rect x="124" y="56" width="30" height="18" rx="9" fill="#141418" />
            <path d="M116,64 L124,64" stroke="#141418" strokeWidth="4" />
            <rect x="90" y="59" width="12" height="4" rx="2" fill="#FFFFFF" opacity="0.35" />
            <rect x="128" y="59" width="12" height="4" rx="2" fill="#FFFFFF" opacity="0.35" />
          </g>
        </>
      )}
      {kind === "client" && (
        <>
          <path d="M72,98 C70,62 94,42 120,42 C148,42 170,62 168,98 C164,82 154,70 136,66 C122,72 96,74 72,98 Z" fill={`url(#${g("hair")})`} />
          {/* glasses */}
          <rect x="88" y="97" width="28" height="22" rx="8" fill="#FFFFFF" fillOpacity="0.12" stroke="#15151B" strokeWidth="3.5" />
          <rect x="124" y="97" width="28" height="22" rx="8" fill="#FFFFFF" fillOpacity="0.12" stroke="#15151B" strokeWidth="3.5" />
          <path d="M116,106 L124,106" stroke="#15151B" strokeWidth="3.5" />
          {/* thinking hand under chin */}
          <path
            d="M128,164 C126,150 132,140 142,140 C150,140 156,146 156,156 L156,178 C156,188 146,194 136,192 L130,190 Z"
            fill={p.skin}
            stroke={p.skinShade}
            strokeWidth="2.5"
          />
          <path d="M134,146 C128,150 126,160 130,166" fill="none" stroke={p.skinShade} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M142,196 L140,240 L168,240 L162,190 Z" fill={p.cloth} />
        </>
      )}

      {/* headphones + mic for the voice over artist */}
      {kind === "voice" && (
        <>
          <path d="M68,108 C64,52 176,52 172,108" fill="none" stroke="#1E1E28" strokeWidth="9" strokeLinecap="round" />
          <rect x="56" y="94" width="24" height="38" rx="11" fill="#1E1E28" />
          <rect x="160" y="94" width="24" height="38" rx="11" fill="#1E1E28" />
          <rect x="62" y="100" width="6" height="26" rx="3" fill="#7B3FF2" />
          <rect x="172" y="100" width="6" height="26" rx="3" fill="#7B3FF2" />
          <path d="M150,240 L150,214" stroke="#2A2A33" strokeWidth="6" />
          <rect x="136" y="170" width="28" height="48" rx="14" fill="#2A2A33" />
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1="140" y1={180 + i * 7} x2="160" y2={180 + i * 7} stroke="#4A4A56" strokeWidth="2" />
          ))}
          <rect x="136" y="170" width="28" height="48" rx="14" fill={`url(#${g("glow")})`} />
        </>
      )}

      {/* phone in hand for the UGC creator */}
      {kind === "ugc" && (
        <g transform="rotate(-10 70 200)">
          <rect x="46" y="176" width="42" height="72" rx="9" fill="#17171F" />
          <rect x="50" y="182" width="34" height="60" rx="6" fill="#9466FF" />
          <circle cx="67" cy="212" r="7" fill="#FFFFFF" opacity="0.9" />
          <path d="M65,208 L71,212 L65,216 Z" fill="#7B3FF2" />
          <ellipse cx="84" cy="206" rx="7" ry="5" fill={p.skin} />
          <ellipse cx="85" cy="218" rx="7" ry="5" fill={p.skin} />
          <ellipse cx="84" cy="230" rx="7" ry="5" fill={p.skin} />
        </g>
      )}
    </svg>
  );
};

function lighten(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((n >> 16) & 255) + 255 * amt);
  const g = Math.min(255, ((n >> 8) & 255) + 255 * amt);
  const b = Math.min(255, (n & 255) + 255 * amt);
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

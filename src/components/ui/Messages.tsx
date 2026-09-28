import React from "react";
import { color, font } from "../../../styles/tokens";
import { IconPlay, IconFilm, IconLink } from "./Icons";

// Chat building blocks, inspired by familiar messaging patterns but drawn
// from scratch (own colours, radii, layout). Sizes are in phone design px
// (screen authored at 390 wide).

export type ChatTheme = "chat" | "dm";
const bubbleBg = (theme: ChatTheme, out: boolean) =>
  theme === "chat" ? (out ? color.chatBubbleOut : "#FFFFFF") : out ? color.lavender : "#ECECF1";

export const MessageBubble: React.FC<{
  out?: boolean; theme?: ChatTheme; children: React.ReactNode; time?: string; maxWidth?: number; style?: React.CSSProperties; pad?: number;
}> = ({ out = false, theme = "chat", children, time, maxWidth = 270, style, pad = 10 }) => (
  <div style={{ display: "flex", justifyContent: out ? "flex-end" : "flex-start", padding: "0 12px", ...style }}>
    <div
      style={{
        maxWidth, background: bubbleBg(theme, out), borderRadius: 18,
        borderBottomRightRadius: out ? 6 : 18, borderBottomLeftRadius: out ? 18 : 6,
        padding: pad, boxSizing: "border-box", fontFamily: font.ui, fontSize: 15.5, lineHeight: 1.32,
        color: color.ink, boxShadow: theme === "chat" ? "0 1px 1.5px rgba(0,0,0,0.09)" : undefined, position: "relative",
      }}
    >
      {children}
      {time && (
        <div style={{ fontSize: 11, color: color.mute, textAlign: "right", marginTop: 3 }}>{time}</div>
      )}
    </div>
  </div>
);

/** Voice note: play button + waveform + duration. `played` 0..1 colours the waveform. */
export const VoiceMessage: React.FC<{
  duration: string; played?: number; accent?: string; bars?: number; width?: number; seed?: number;
}> = ({ duration, played = 0, accent = color.chatGreen, bars = 30, width = 210, seed = 3 }) => {
  const hs = Array.from({ length: bars }, (_, i) => {
    const v = Math.abs(Math.sin(i * 1.7 + seed) * 0.6 + Math.sin(i * 0.53 + seed * 2) * 0.4);
    return 5 + v * 22;
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, width }}>
      <div style={{ width: 34, height: 34, borderRadius: 17, background: accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <IconPlay size={18} color="#fff" fill="#fff" />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 2, flex: 1, height: 30 }}>
        {hs.map((h, i) => (
          <div key={i} style={{ width: 3, height: h, borderRadius: 2, background: i / bars < played ? accent : "rgba(40,40,50,0.28)" }} />
        ))}
      </div>
      <div style={{ fontFamily: font.ui, fontSize: 12.5, color: color.mute, width: 32 }}>{duration}</div>
    </div>
  );
};

/** Video attachment inside a bubble. */
export const VideoAttachment: React.FC<{ src?: string; duration: string; width?: number; height?: number; tint?: string }> = ({
  src, duration, width = 230, height = 150, tint = "#2B2A33",
}) => (
  <div style={{ width, height, borderRadius: 12, overflow: "hidden", position: "relative", background: tint }}>
    {src && <img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.9)" }} />}
    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.18)" }} />
    <div style={{ position: "absolute", left: "50%", top: "50%", width: 48, height: 48, marginLeft: -24, marginTop: -24, borderRadius: 24, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <IconPlay size={24} color="#fff" fill="#fff" />
    </div>
    <div style={{ position: "absolute", left: 8, bottom: 7, display: "flex", alignItems: "center", gap: 5, color: "#fff", fontFamily: font.ui, fontSize: 12.5, fontWeight: 600 }}>
      <IconFilm size={15} color="#fff" /> {duration}
    </div>
  </div>
);

/** Plain link row inside a bubble (placeholder URL, never a real private link). */
export const LinkLine: React.FC<{ label: string; url: string }> = ({ label, url }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
    <div>{label}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#1C6FD1", fontSize: 14.5 }}>
      <IconLink size={14} color="#1C6FD1" /> <span style={{ textDecoration: "underline" }}>{url}</span>
    </div>
  </div>
);

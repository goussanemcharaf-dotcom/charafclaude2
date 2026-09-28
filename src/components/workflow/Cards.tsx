import React from "react";
import { Img } from "remotion";
import { color, font, shadow } from "../../../styles/tokens";
import { IconFolder, IconLink, IconPlay, IconMore } from "../ui/Icons";

// "Before" artefacts: the scattered files, folders, videos and links a creator
// sends around. Generic, original UI — no product logos.

const extColor: Record<string, string> = {
  MP4: "#E0533D", MOV: "#E0533D", WAV: "#7B3FF2", MP3: "#7B3FF2", PDF: "#D8453B", ZIP: "#8A8A99",
  DOCX: "#2F6FE0", PNG: "#1F9E6A", JPG: "#1F9E6A",
};

export const FileBadge: React.FC<{ ext: string; size?: number }> = ({ ext, size = 60 }) => (
  <div
    style={{
      width: size, height: size * 1.18, borderRadius: size * 0.16, background: extColor[ext] ?? color.graphite,
      display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: size * 0.14, boxSizing: "border-box",
      fontFamily: font.ui, fontWeight: 800, fontSize: size * 0.26, color: "#fff", letterSpacing: "0.02em", flexShrink: 0,
      position: "relative", overflow: "hidden",
    }}
  >
    <div style={{ position: "absolute", right: 0, top: 0, width: size * 0.32, height: size * 0.32, background: "rgba(255,255,255,0.35)", borderBottomLeftRadius: size * 0.1 }} />
    {ext}
  </div>
);

export const FileCard: React.FC<{ name: string; ext: string; meta: string; width?: number; style?: React.CSSProperties }> = ({
  name, ext, meta, width = 460, style,
}) => (
  <div
    style={{
      width, height: 112, borderRadius: 22, background: "#fff", boxShadow: shadow.card, display: "flex",
      alignItems: "center", gap: 20, padding: "0 24px", boxSizing: "border-box", ...style,
    }}
  >
    <FileBadge ext={ext} size={56} />
    <div style={{ flex: 1, minWidth: 0, fontFamily: font.ui }}>
      <div style={{ fontSize: 27, fontWeight: 650, color: color.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "-0.01em" }}>{name}</div>
      <div style={{ fontSize: 21, color: color.mute, marginTop: 4 }}>{meta}</div>
    </div>
    <IconMore size={28} color={color.fog} />
  </div>
);

export const FolderCard: React.FC<{ name: string; count: string; width?: number; style?: React.CSSProperties }> = ({
  name, count, width = 380, style,
}) => (
  <div
    style={{
      width, height: 112, borderRadius: 22, background: "#fff", boxShadow: shadow.card, display: "flex",
      alignItems: "center", gap: 18, padding: "0 24px", boxSizing: "border-box", ...style,
    }}
  >
    <div style={{ width: 60, height: 60, borderRadius: 16, background: "#EAF0FD", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <IconFolder size={36} color={color.driveBlue} stroke={2} />
    </div>
    <div style={{ fontFamily: font.ui }}>
      <div style={{ fontSize: 27, fontWeight: 650, color: color.ink, whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>{name}</div>
      <div style={{ fontSize: 21, color: color.mute, marginTop: 4 }}>{count}</div>
    </div>
  </div>
);

export const VideoCard: React.FC<{
  src?: string; duration: string; label?: string; width?: number; height?: number; pos?: string; style?: React.CSSProperties;
}> = ({ src, duration, label, width = 300, height = 420, pos = "50% 50%", style }) => (
  <div style={{ width, borderRadius: 24, background: "#fff", boxShadow: shadow.card, padding: 10, boxSizing: "border-box", ...style }}>
    <div style={{ width: width - 20, height, borderRadius: 16, overflow: "hidden", position: "relative", background: "#2B2A33" }}>
      {src && <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos }} />}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45))" }} />
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 76, height: 76, marginLeft: -38, marginTop: -38, borderRadius: 38, background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <IconPlay size={34} color={color.ink} fill={color.ink} style={{ marginLeft: 4 }} />
      </div>
      <div style={{ position: "absolute", right: 12, bottom: 12, background: "rgba(0,0,0,0.6)", color: "#fff", borderRadius: 8, padding: "4px 9px", fontFamily: font.ui, fontSize: 20, fontWeight: 600 }}>
        {duration}
      </div>
    </div>
    {label && (
      <div style={{ fontFamily: font.ui, fontSize: 22, fontWeight: 600, color: color.ink, padding: "12px 6px 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {label}
      </div>
    )}
  </div>
);

export const LinkCard: React.FC<{ title: string; url: string; width?: number; tint?: string; style?: React.CSSProperties; height?: number }> = ({
  title, url, width = 560, tint = color.violet, style, height = 108,
}) => (
  <div
    style={{
      width, height, borderRadius: 24, background: "#fff", boxShadow: shadow.card, display: "flex",
      alignItems: "center", gap: 20, padding: "0 26px", boxSizing: "border-box", ...style,
    }}
  >
    <div style={{ width: 58, height: 58, borderRadius: 29, background: `${tint}1A`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <IconLink size={30} color={tint} stroke={2.3} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily: font.ui, fontSize: 28, fontWeight: 650, color: color.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "-0.01em" }}>{title}</div>
      <div style={{ fontFamily: font.mono, fontSize: 19, color: color.mute, marginTop: 5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{url}</div>
    </div>
  </div>
);

/** Screenshot thumbnail (a photo in a white frame). */
export const ScreenshotCard: React.FC<{ src: string; width?: number; height?: number; pos?: string; style?: React.CSSProperties }> = ({
  src, width = 220, height = 300, pos = "50% 50%", style,
}) => (
  <div style={{ width, height, borderRadius: 18, background: "#fff", boxShadow: shadow.card, padding: 8, boxSizing: "border-box", ...style }}>
    <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, borderRadius: 12 }} />
  </div>
);

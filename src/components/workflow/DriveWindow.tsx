import React from "react";
import { color, font, shadow } from "../../../styles/tokens";
import { IconSearch, IconFolder } from "../ui/Icons";
import { FileBadge } from "./Cards";

// A generic cloud file browser — familiar interaction pattern (search, file
// list), original visual design, no product branding.
export const DRIVE_ROWS = [
  { name: "UGC_serum_final_V3.mp4", ext: "MP4", date: "12 mars", size: "84 Mo" },
  { name: "UGC_serum_final_V3 (1).mp4", ext: "MP4", date: "12 mars", size: "84 Mo" },
  { name: "Demo_voix_2025.wav", ext: "WAV", date: "3 févr.", size: "11 Mo" },
  { name: "Portfolio_ancien.pdf", ext: "PDF", date: "2023", size: "6 Mo" },
  { name: "Reel_cafe_v2_OK.mov", ext: "MOV", date: "28 avr.", size: "132 Mo" },
  { name: "Photos_shooting.zip", ext: "ZIP", date: "9 janv.", size: "1,2 Go" },
];

export const DriveWindow: React.FC<{ width?: number; rows?: number; style?: React.CSSProperties; highlight?: number }> = ({
  width = 660, rows = 6, style, highlight = -1,
}) => (
  <div style={{ width, borderRadius: 26, background: "#fff", boxShadow: shadow.float, overflow: "hidden", ...style }}>
    <div style={{ padding: "22px 26px 16px", borderBottom: `1px solid ${color.line}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: font.ui, fontSize: 30, fontWeight: 700, color: color.ink, letterSpacing: "-0.02em" }}>
          <IconFolder size={32} color={color.driveBlue} /> Mes fichiers
        </div>
        <div style={{ display: "flex", gap: 7 }}>
          {[0, 1, 2].map((i) => <div key={i} style={{ width: 11, height: 11, borderRadius: 6, background: "#DADAE1" }} />)}
        </div>
      </div>
      <div style={{ marginTop: 16, height: 52, borderRadius: 26, background: "#F1F1F4", display: "flex", alignItems: "center", gap: 12, padding: "0 20px", fontFamily: font.ui, fontSize: 22, color: color.mute }}>
        <IconSearch size={24} color={color.mute} /> Rechercher un fichier
      </div>
    </div>
    <div style={{ padding: "6px 0 10px" }}>
      {DRIVE_ROWS.slice(0, rows).map((r, i) => (
        <div
          key={i}
          style={{
            display: "flex", alignItems: "center", gap: 16, padding: "12px 26px", fontFamily: font.ui,
            background: i === highlight ? "rgba(123,63,242,0.08)" : undefined,
          }}
        >
          <FileBadge ext={r.ext} size={36} />
          <div style={{ flex: 1, fontSize: 23, fontWeight: 550, color: color.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</div>
          <div style={{ width: 86, fontSize: 19, color: color.mute, textAlign: "right" }}>{r.date}</div>
          <div style={{ width: 76, fontSize: 19, color: color.mute, textAlign: "right" }}>{r.size}</div>
        </div>
      ))}
    </div>
  </div>
);

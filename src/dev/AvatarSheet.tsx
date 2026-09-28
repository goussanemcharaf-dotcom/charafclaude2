import React from "react";
import { AbsoluteFill } from "remotion";
import { Avatar, AvatarKind } from "../components/ui/Avatar";
import { bg, color, font, shadow } from "../../styles/tokens";

const kinds: AvatarKind[] = ["ugc", "content", "voice", "influence", "client"];
export const AvatarSheet: React.FC = () => (
  <AbsoluteFill style={{ background: bg.violet, flexWrap: "wrap", flexDirection: "row", alignContent: "center", justifyContent: "center", gap: 40, padding: 40 }}>
    {kinds.map((k) => (
      <div key={k} style={{ width: 420, height: 420, borderRadius: "50%", background: "#fff", boxShadow: shadow.bubble, overflow: "hidden", position: "relative" }}>
        <Avatar kind={k} size={420} expression={k === "client" ? "puzzled" : k === "influence" ? "grin" : "smile"} />
        <div style={{ position: "absolute", bottom: 38, width: "100%", textAlign: "center", fontFamily: font.display, fontWeight: 800, fontSize: 40, letterSpacing: "-0.04em", color: color.ink }}>{k}</div>
      </div>
    ))}
  </AbsoluteFill>
);

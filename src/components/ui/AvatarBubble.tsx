import React from "react";
import { color, font, shadow } from "../../../styles/tokens";
import { Avatar, AvatarKind } from "./Avatar";

// White circular "identity bubble" (reference: avatar bubbles that pop and
// cluster). The avatar sits in the upper part and fades into white so the
// label always reads on a clean background.
export const AvatarBubble: React.FC<{
  kind: AvatarKind;
  label: string;
  size?: number;
  expression?: "smile" | "grin" | "puzzled";
  blink?: number;
  labelSize?: number;
  style?: React.CSSProperties;
}> = ({ kind, label, size = 380, expression = "smile", blink = 0, labelSize, style }) => {
  const a = size * 0.84;
  const lines = label.split("\n");
  const ls = labelSize ?? size * (lines.length > 1 ? 0.098 : 0.108);
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%", background: "#fff", position: "relative",
        overflow: "hidden", boxShadow: shadow.bubble, ...style,
      }}
    >
      <div style={{ position: "absolute", left: (size - a) / 2, top: -size * 0.02 }}>
        <Avatar kind={kind} size={a} expression={expression} blink={blink} />
      </div>
      {/* fade the torso into white under the label */}
      <div
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0, height: size * 0.44,
          background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.92) 38%, #fff 60%)",
        }}
      />
      <div
        style={{
          position: "absolute", left: 0, right: 0, bottom: size * (lines.length > 1 ? 0.1 : 0.13),
          textAlign: "center", fontFamily: font.display, fontWeight: 800, fontSize: ls,
          letterSpacing: "-0.045em", lineHeight: 0.98, color: color.ink,
        }}
      >
        {lines.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
};

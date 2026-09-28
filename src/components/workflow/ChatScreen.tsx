import React from "react";
import { color, font } from "../../../styles/tokens";
import { clamp, invLerp, springy } from "../motion/anim";
import { IconChevronLeft, IconPlus, IconCamera, IconMic } from "../ui/Icons";
import { Avatar } from "../ui/Avatar";
import { ChatTheme } from "../ui/Messages";

// Phone chat screen (authored at 390 x 844). Messages appear at given times
// with a small spring. Two themes: "chat" (the messy before) and "dm" (after).

export type ChatMsg = { at: number; out: boolean; node: React.ReactNode; h: number };

export const ChatScreen: React.FC<{
  t: number;
  theme?: ChatTheme;
  title?: string;
  subtitle?: string;
  messages: ChatMsg[];
  top?: number; // y where the thread starts
  scroll?: number;
}> = ({ t, theme = "chat", title = "Client", subtitle = "en ligne", messages, top = 130, scroll = 0 }) => {
  const chat = theme === "chat";
  let y = top;
  return (
    <div style={{ position: "absolute", inset: 0, background: chat ? color.chatBg : "#FFFFFF", overflow: "hidden" }}>
      {chat && (
        // quiet dotted texture (original, not a copy of any app wallpaper)
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(120,100,80,0.10) 1.4px, transparent 1.6px)", backgroundSize: "22px 22px" }} />
      )}
      {/* header */}
      <div
        style={{
          position: "absolute", left: 0, right: 0, top: 0, height: 112, paddingTop: 50, boxSizing: "border-box",
          background: chat ? "#1E6B57" : "rgba(255,255,255,0.96)", borderBottom: chat ? undefined : `1px solid ${color.line}`,
          display: "flex", alignItems: "center", gap: 10, paddingLeft: 10, zIndex: 2,
        }}
      >
        <IconChevronLeft size={26} color={chat ? "#fff" : color.violet} />
        <div style={{ width: 40, height: 40, borderRadius: 20, overflow: "hidden", background: "#E9E4F7" }}>
          <Avatar kind="client" size={40} expression="smile" />
        </div>
        <div style={{ fontFamily: font.ui }}>
          <div style={{ fontSize: 17, fontWeight: 650, color: chat ? "#fff" : color.ink }}>{title}</div>
          <div style={{ fontSize: 12.5, color: chat ? "rgba(255,255,255,0.8)" : "#1F9E6A" }}>{subtitle}</div>
        </div>
      </div>
      {/* thread */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, transform: `translateY(${-scroll}px)` }}>
        {messages.map((m, i) => {
          const s = springy(t, m.at, { stiffness: 320, damping: 22 });
          const o = clamp(invLerp(m.at, m.at + 0.08, t));
          const node = (
            <div
              key={i}
              style={{
                position: "absolute", left: 0, right: 0, top: y, opacity: t < m.at ? 0 : o,
                transform: `translateY(${(1 - s) * 26}px) scale(${0.92 + 0.08 * s})`,
                transformOrigin: m.out ? "100% 100%" : "0% 100%",
              }}
            >
              {m.node}
            </div>
          );
          y += m.h + 8;
          return node;
        })}
      </div>
      {/* composer */}
      <div
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0, height: 86, background: chat ? "#F3EFE9" : "#fff",
          borderTop: chat ? undefined : `1px solid ${color.line}`, display: "flex", alignItems: "center", gap: 10, padding: "0 12px 20px", boxSizing: "border-box", zIndex: 2,
        }}
      >
        <IconPlus size={24} color={chat ? "#1E6B57" : color.violet} />
        <div style={{ flex: 1, height: 38, borderRadius: 19, background: chat ? "#fff" : "#F1F1F4", fontFamily: font.ui, fontSize: 15, color: color.fog, display: "flex", alignItems: "center", padding: "0 14px" }}>
          Message
        </div>
        <IconCamera size={23} color={chat ? "#1E6B57" : color.violet} />
        <IconMic size={23} color={chat ? "#1E6B57" : color.violet} />
      </div>
    </div>
  );
};


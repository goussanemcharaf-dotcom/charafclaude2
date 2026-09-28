import React from "react";
import { color, font, shadow } from "../../../styles/tokens";
import { IconLock, IconRefresh, IconPlus } from "./Icons";

// Device frames. Original, deliberately minimal chrome (neutral dots, no OS
// branding) so the portfolio inside stays the hero.

export const URLBar: React.FC<{
  url: string;
  width: number;
  height?: number;
  typed?: number; // 0..1 of the url typed
  caret?: boolean;
  dark?: boolean;
  style?: React.CSSProperties;
}> = ({ url, width, height = 40, typed = 1, caret = false, dark = false, style }) => {
  const shown = url.slice(0, Math.round(url.length * typed));
  return (
    <div
      style={{
        width, height, borderRadius: height / 2, background: dark ? "#24242E" : "#F1F1F4",
        display: "flex", alignItems: "center", gap: height * 0.26, padding: `0 ${height * 0.42}px`,
        fontFamily: font.ui, fontSize: height * 0.42, fontWeight: 500, color: dark ? "#E8E8EE" : color.graphite,
        boxSizing: "border-box", ...style,
      }}
    >
      <IconLock size={height * 0.42} color={dark ? "#A7A7B4" : color.mute} stroke={2.2} />
      <span style={{ letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
        {shown}
        {caret && <span style={{ display: "inline-block", width: 2, height: height * 0.5, background: color.violet, marginLeft: 2, verticalAlign: "middle" }} />}
      </span>
    </div>
  );
};

/** Desktop browser window. The page is authored at `pageWidth` and scaled to fit. */
export const BrowserFrame: React.FC<{
  width: number;
  height: number;
  url: string;
  urlTyped?: number;
  pageWidth?: number;
  tabs?: string[];
  tabsShown?: number;
  radius?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  contentStyle?: React.CSSProperties;
}> = ({ width, height, url, urlTyped = 1, pageWidth = 1200, tabs, tabsShown, radius = 22, style, children, contentStyle }) => {
  const chrome = tabs ? 96 : 60;
  const k = width / pageWidth;
  const nTabs = tabs ? Math.min(tabs.length, tabsShown ?? tabs.length) : 0;
  const tabW = tabs ? Math.max(84, Math.min(230, (width - 170) / Math.max(1, nTabs))) : 0;
  return (
    <div
      style={{
        width, height, borderRadius: radius, overflow: "hidden", background: "#fff",
        boxShadow: shadow.float, position: "relative", ...style,
      }}
    >
      <div style={{ height: chrome, background: "#FAFAFB", borderBottom: `1px solid ${color.line}`, position: "relative" }}>
        <div style={{ position: "absolute", left: 22, top: tabs ? 18 : 22, display: "flex", gap: 9 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: 13, height: 13, borderRadius: 7, background: "#D6D6DD" }} />
          ))}
        </div>
        {tabs && (
          <div style={{ position: "absolute", left: 100, top: 8, right: 16, height: 36, display: "flex", gap: 6, overflow: "hidden" }}>
            {tabs.slice(0, nTabs).map((tb, i) => (
              <div
                key={i}
                style={{
                  width: tabW, flexShrink: 0, height: 36, borderRadius: 10, background: i === nTabs - 1 ? "#fff" : "#EEEEF2",
                  boxShadow: i === nTabs - 1 ? "0 1px 4px rgba(0,0,0,0.08)" : undefined,
                  fontFamily: font.ui, fontSize: 15, color: color.graphite, display: "flex", alignItems: "center",
                  padding: "0 12px", boxSizing: "border-box", whiteSpace: "nowrap", overflow: "hidden", gap: 8,
                }}
              >
                <div style={{ width: 12, height: 12, borderRadius: 3, background: i % 3 === 0 ? color.fog : i % 3 === 1 ? "#C9C0E8" : "#BFD6CC", flexShrink: 0 }} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{tb}</span>
              </div>
            ))}
            <div style={{ width: 28, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: color.mute }}>
              <IconPlus size={18} />
            </div>
          </div>
        )}
        <div style={{ position: "absolute", left: tabs ? 22 : 100, right: 22, bottom: tabs ? 8 : 10, display: "flex", alignItems: "center", gap: 14 }}>
          {tabs && <IconRefresh size={20} color={color.mute} />}
          <URLBar url={url} typed={urlTyped} width={width - (tabs ? 90 : 122)} height={tabs ? 36 : 40} />
        </div>
      </div>
      <div style={{ position: "relative", width, height: height - chrome, overflow: "hidden", ...contentStyle }}>
        <div style={{ width: pageWidth, transform: `scale(${k})`, transformOrigin: "0 0" }}>{children}</div>
      </div>
    </div>
  );
};

/** Phone frame. Screen content is authored at 390 x 844 and scaled. */
export const MobileFrame: React.FC<{
  width: number;
  style?: React.CSSProperties;
  screenStyle?: React.CSSProperties;
  statusDark?: boolean;
  time?: string;
  children?: React.ReactNode;
}> = ({ width, style, screenStyle, statusDark = true, time = "10:24", children }) => {
  const k = width / 430; // outer design width 430 incl. bezel
  const bez = 13;
  return (
    <div style={{ width, height: 900 * k, position: "relative", ...style }}>
      <div
        style={{
          position: "absolute", inset: 0, transform: `scale(${k})`, transformOrigin: "0 0", width: 430, height: 900,
        }}
      >
        {/* side buttons */}
        <div style={{ position: "absolute", left: -3, top: 170, width: 4, height: 60, borderRadius: 2, background: "#2A2A33" }} />
        <div style={{ position: "absolute", left: -3, top: 250, width: 4, height: 60, borderRadius: 2, background: "#2A2A33" }} />
        <div style={{ position: "absolute", right: -3, top: 210, width: 4, height: 96, borderRadius: 2, background: "#2A2A33" }} />
        <div
          style={{
            position: "absolute", inset: 0, borderRadius: 68, background: "linear-gradient(145deg, #3B3B46, #121217 40%, #26262E)",
            boxShadow: shadow.float,
          }}
        />
        <div
          style={{
            position: "absolute", left: bez, top: bez, width: 430 - 2 * bez, height: 900 - 2 * bez, borderRadius: 56,
            overflow: "hidden", background: "#fff", ...screenStyle,
          }}
        >
          <div style={{ width: 390, transform: `scale(${(430 - 2 * bez) / 390})`, transformOrigin: "0 0", position: "relative", height: 844 }}>
            {children}
            {/* status bar */}
            <div
              style={{
                position: "absolute", left: 0, right: 0, top: 0, height: 50, display: "flex", alignItems: "center",
                justifyContent: "space-between", padding: "6px 30px 0 34px", boxSizing: "border-box",
                fontFamily: font.ui, fontWeight: 600, fontSize: 16, color: statusDark ? color.ink : "#fff", pointerEvents: "none",
              }}
            >
              <span>{time}</span>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <div style={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
                  {[5, 7, 9, 11].map((h) => <div key={h} style={{ width: 3, height: h, borderRadius: 1, background: statusDark ? color.ink : "#fff" }} />)}
                </div>
                <div style={{ width: 24, height: 12, borderRadius: 4, border: `1.5px solid ${statusDark ? color.ink : "#fff"}`, padding: 1.5, boxSizing: "border-box" }}>
                  <div style={{ width: "72%", height: "100%", borderRadius: 2, background: statusDark ? color.ink : "#fff" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* camera island */}
        <div style={{ position: "absolute", left: 215 - 56, top: 26, width: 112, height: 32, borderRadius: 16, background: "#0A0A0D" }} />
      </div>
    </div>
  );
};

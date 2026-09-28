import React from "react";

// Original 24px line icons (stroke-based, round caps). No third-party logos.
type P = { size?: number; color?: string; stroke?: number; style?: React.CSSProperties; fill?: string };

const Svg: React.FC<P & { children: React.ReactNode }> = ({ size = 24, color = "currentColor", stroke = 2, style, children }) => (
  <svg
    viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth={stroke}
    strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }} aria-hidden
  >
    {children}
  </svg>
);

export const IconPlay: React.FC<P> = ({ fill = "currentColor", ...p }) => (
  <Svg {...p}><path d="M8 5.5v13l10.5-6.5z" fill={fill} stroke="none" /></Svg>
);
export const IconFolder: React.FC<P> = (p) => (
  <Svg {...p}><path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2.2h7a2 2 0 0 1 2 2v7.8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" /></Svg>
);
export const IconFile: React.FC<P> = (p) => (
  <Svg {...p}><path d="M6.5 3.5h7l4.5 4.5v12a1 1 0 0 1-1 1h-10.5a1 1 0 0 1-1-1v-15.5a1 1 0 0 1 1-1z" /><path d="M13.5 3.5v4.5h4.5" /></Svg>
);
export const IconFilm: React.FC<P> = (p) => (
  <Svg {...p}><rect x="3.5" y="5" width="17" height="14" rx="2.5" /><path d="M10 9.2v5.6l4.6-2.8z" /></Svg>
);
export const IconMic: React.FC<P> = (p) => (
  <Svg {...p}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" /></Svg>
);
export const IconLink: React.FC<P> = (p) => (
  <Svg {...p}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.2 1.2" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.2-1.2" /></Svg>
);
export const IconSearch: React.FC<P> = (p) => (
  <Svg {...p}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></Svg>
);
export const IconLock: React.FC<P> = (p) => (
  <Svg {...p}><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></Svg>
);
export const IconArrowRight: React.FC<P> = (p) => (
  <Svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>
);
export const IconArrowUpRight: React.FC<P> = (p) => (
  <Svg {...p}><path d="M7 17L17 7M9 7h8v8" /></Svg>
);
export const IconSend: React.FC<P> = (p) => (
  <Svg {...p}><path d="M4 12l16-8-6 16-2.5-6.5z" /><path d="M11.5 13.5L20 4" /></Svg>
);
export const IconCheck: React.FC<P> = (p) => (
  <Svg {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></Svg>
);
export const IconClose: React.FC<P> = (p) => (
  <Svg {...p}><path d="M6 6l12 12M18 6L6 18" /></Svg>
);
export const IconMore: React.FC<P> = ({ color = "currentColor", ...p }) => (
  <Svg {...p} color={color}>
    <circle cx="5.5" cy="12" r="1.2" fill={color} /><circle cx="12" cy="12" r="1.2" fill={color} /><circle cx="18.5" cy="12" r="1.2" fill={color} />
  </Svg>
);
export const IconImage: React.FC<P> = (p) => (
  <Svg {...p}><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><circle cx="9" cy="10" r="1.8" /><path d="M20.5 16l-5-5-8.5 8.5" /></Svg>
);
export const IconBell: React.FC<P> = (p) => (
  <Svg {...p}><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></Svg>
);
export const IconChevronLeft: React.FC<P> = (p) => (
  <Svg {...p}><path d="M15 5l-7 7 7 7" /></Svg>
);
export const IconMenu: React.FC<P> = (p) => (
  <Svg {...p}><path d="M4 8h16M4 16h16" /></Svg>
);
export const IconMail: React.FC<P> = (p) => (
  <Svg {...p}><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" /><path d="M4.5 7l7.5 6 7.5-6" /></Svg>
);
export const IconPaperclip: React.FC<P> = (p) => (
  <Svg {...p}><path d="M20 11.5l-7.8 7.8a5 5 0 0 1-7.1-7.1l8.2-8.2a3.3 3.3 0 0 1 4.7 4.7l-8.1 8.1a1.7 1.7 0 0 1-2.4-2.4l7.4-7.4" /></Svg>
);
export const IconDownload: React.FC<P> = (p) => (
  <Svg {...p}><path d="M12 4v11M7 10.5l5 5 5-5M5 19.5h14" /></Svg>
);
export const IconAlert: React.FC<P> = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5v5.5M12 16.3v.2" /></Svg>
);
export const IconCamera: React.FC<P> = (p) => (
  <Svg {...p}><path d="M4 8.5a2 2 0 0 1 2-2h2l1.5-2h5L16 6.5h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" /><circle cx="12" cy="13" r="3.5" /></Svg>
);
export const IconGlobe: React.FC<P> = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.5 2.6 3.6 5.4 3.6 8.5s-1.1 5.9-3.6 8.5c-2.5-2.6-3.6-5.4-3.6-8.5s1.1-5.9 3.6-8.5z" /></Svg>
);
export const IconSparkle: React.FC<P> = ({ fill = "currentColor", ...p }) => (
  <Svg {...p}><path d="M12 2.5c.6 4.6 2.9 6.9 7.5 7.5-4.6.6-6.9 2.9-7.5 7.5-.6-4.6-2.9-6.9-7.5-7.5 4.6-.6 6.9-2.9 7.5-7.5z" fill={fill} stroke="none" /></Svg>
);
export const IconRefresh: React.FC<P> = (p) => (
  <Svg {...p}><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4h-4" /></Svg>
);
export const IconPlus: React.FC<P> = (p) => (
  <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>
);

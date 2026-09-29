import React from "react";

// Original line icons (24 × 24 grid, 1.75 stroke, round caps). No brand marks.
type P = { s?: number; c?: string; w?: number; style?: React.CSSProperties };
const I: React.FC<P & { children: React.ReactNode }> = ({ s = 40, c = "currentColor", w = 1.75, style, children }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {children}
  </svg>
);

export const IconEye: React.FC<P> = (p) => (
  <I {...p}><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></I>
);
export const IconCursor: React.FC<P> = (p) => (
  <I {...p}><path d="M5 3.5 18.5 10l-5.8 1.9L10.8 18z" /></I>
);
export const IconUser: React.FC<P> = (p) => (
  <I {...p}><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20c.9-3.8 3.9-6 7.5-6s6.6 2.2 7.5 6" /></I>
);
export const IconUsers: React.FC<P> = (p) => (
  <I {...p}><circle cx="9" cy="8.5" r="3.2" /><path d="M2.8 19.5c.7-3.2 3.2-5.2 6.2-5.2s5.5 2 6.2 5.2" /><path d="M15.5 5.6a3.2 3.2 0 0 1 0 6" /><path d="M17.6 14.6c1.8.7 3.1 2.4 3.6 4.9" /></I>
);
export const IconChat: React.FC<P> = (p) => (
  <I {...p}><path d="M4 5.5h16v10.5H9.5L5 19.8V16H4z" /><path d="M8 10.8h8M8 7.9h5" /></I>
);
export const IconCheck: React.FC<P> = (p) => (
  <I {...p}><path d="m5 12.5 4.3 4.2L19 7" /></I>
);
export const IconCheckCircle: React.FC<P> = (p) => (
  <I {...p}><circle cx="12" cy="12" r="9" /><path d="m7.8 12.3 2.9 2.8 5.5-5.8" /></I>
);
export const IconCalendar: React.FC<P> = (p) => (
  <I {...p}><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M3.5 9.5h17M8 3v4M16 3v4" /><path d="m9 14.6 2 1.9 4-4" /></I>
);
export const IconBag: React.FC<P> = (p) => (
  <I {...p}><path d="M5 8h14l-1.1 12H6.1z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></I>
);
export const IconTarget: React.FC<P> = (p) => (
  <I {...p}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.6" /><circle cx="12" cy="12" r="1" fill="currentColor" /></I>
);
export const IconCompass: React.FC<P> = (p) => (
  <I {...p}><circle cx="12" cy="12" r="9" /><path d="m15.8 8.2-2.2 5.4-5.4 2.2 2.2-5.4z" /></I>
);
export const IconLayers: React.FC<P> = (p) => (
  <I {...p}><path d="m12 3 9 4.8-9 4.8-9-4.8z" /><path d="m3 12.2 9 4.8 9-4.8" /><path d="m3 16.6 9 4.8 9-4.8" /></I>
);
export const IconFlask: React.FC<P> = (p) => (
  <I {...p}><path d="M9.5 3h5M10.5 3v6L5 18.5A1.6 1.6 0 0 0 6.4 21h11.2a1.6 1.6 0 0 0 1.4-2.5L13.5 9V3" /><path d="M7.4 15h9.2" /></I>
);
export const IconRefresh: React.FC<P> = (p) => (
  <I {...p}><path d="M20 11.5A8 8 0 0 0 5.6 7" /><path d="M5 3.5V7.4h3.9" /><path d="M4 12.5A8 8 0 0 0 18.4 17" /><path d="M19 20.5v-3.9h-3.9" /></I>
);
export const IconPlay: React.FC<P> = (p) => (
  <I {...p}><path d="M8 5.5v13l10.5-6.5z" /></I>
);
export const IconSpark: React.FC<P> = (p) => (
  <I {...p}><path d="M12 3v4.5M12 16.5V21M3 12h4.5M16.5 12H21M5.6 5.6l3.2 3.2M15.2 15.2l3.2 3.2M5.6 18.4l3.2-3.2M15.2 8.8l3.2-3.2" /></I>
);
export const IconBolt: React.FC<P> = (p) => (
  <I {...p}><path d="M13 2.8 5.5 13.2H12l-1 8 7.5-10.4H12z" /></I>
);
export const IconAlert: React.FC<P> = (p) => (
  <I {...p}><path d="M12 3.5 21.5 20h-19z" /><path d="M12 10v4.5M12 17.2v.1" /></I>
);
export const IconClock: React.FC<P> = (p) => (
  <I {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5.2l3.4 2" /></I>
);
export const IconPin: React.FC<P> = (p) => (
  <I {...p}><path d="M12 21s6.8-6.1 6.8-11.2A6.8 6.8 0 0 0 5.2 9.8C5.2 14.9 12 21 12 21Z" /><circle cx="12" cy="9.8" r="2.4" /></I>
);
export const IconTag: React.FC<P> = (p) => (
  <I {...p}><path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1.4 1.4 0 0 1 0 2l-6.2 6.2a1.4 1.4 0 0 1-2 0z" /><circle cx="8" cy="8" r="1.3" /></I>
);
export const IconMegaphone: React.FC<P> = (p) => (
  <I {...p}><path d="M3.5 10v4h3l8 4.5v-13l-8 4.5z" /><path d="M18 9a4 4 0 0 1 0 6" /><path d="M7 14l1.2 5h2.6l-1-4.3" /></I>
);
export const IconSend: React.FC<P> = (p) => (
  <I {...p}><path d="M21 3 10.2 13.8" /><path d="M21 3 14.4 21l-4.2-7.2L3 9.6z" /></I>
);
export const IconArrowRight: React.FC<P> = (p) => (
  <I {...p}><path d="M4 12h15.5M13.5 6l6 6-6 6" /></I>
);
export const IconArrowDown: React.FC<P> = (p) => (
  <I {...p}><path d="M12 4v15.5M6 13.5l6 6 6-6" /></I>
);
export const IconChart: React.FC<P> = (p) => (
  <I {...p}><path d="M3.5 20.5h17" /><path d="m5 16 4.5-4.5 3.5 3 6-6.5" /><path d="M15.5 8h3.5v3.5" /></I>
);
export const IconFilter: React.FC<P> = (p) => (
  <I {...p}><path d="M3.5 5h17l-6.6 7.8V19l-3.8 1.8v-8z" /></I>
);
export const IconBriefcase: React.FC<P> = (p) => (
  <I {...p}><rect x="3" y="7.5" width="18" height="12.5" rx="2.2" /><path d="M8.5 7.5V5.8A1.8 1.8 0 0 1 10.3 4h3.4a1.8 1.8 0 0 1 1.8 1.8v1.7" /><path d="M3 12.5h18" /></I>
);
export const IconStore: React.FC<P> = (p) => (
  <I {...p}><path d="M4 9.5 5.5 4h13L20 9.5" /><path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0" /><path d="M5.5 11.8V20h13v-8.2" /><path d="M10 20v-4.6h4V20" /></I>
);
export const IconHome: React.FC<P> = (p) => (
  <I {...p}><path d="m3.5 11 8.5-7 8.5 7" /><path d="M5.8 9.3V20h12.4V9.3" /><path d="M10 20v-5.5h4V20" /></I>
);
export const IconHeart: React.FC<P> = (p) => (
  <I {...p}><path d="M12 20s-7.5-4.4-8.6-9.4A4.6 4.6 0 0 1 12 7.5a4.6 4.6 0 0 1 8.6 3.1C19.5 15.6 12 20 12 20Z" /><path d="M7.5 12.2h2.2l1.3-2.2 2 4.2 1.3-2h2.2" /></I>
);
export const IconDish: React.FC<P> = (p) => (
  <I {...p}><path d="M3 16.5h18" /><path d="M5 16.5a7 7 0 0 1 14 0" /><path d="M12 7.5v2" /><path d="M9.8 7.5h4.4" /></I>
);
export const IconDrop: React.FC<P> = (p) => (
  <I {...p}><path d="M12 3.2s6 6.4 6 10.6a6 6 0 0 1-12 0C6 9.6 12 3.2 12 3.2Z" /><path d="M9.2 14.6a3 3 0 0 0 2.8 2.6" /></I>
);
export const IconShirt: React.FC<P> = (p) => (
  <I {...p}><path d="M8.5 3.5 3.5 6.8l2 3.7 2.2-1.1V20.5h8.6V9.4l2.2 1.1 2-3.7-5-3.3a3.5 3.5 0 0 1-7 0Z" /></I>
);

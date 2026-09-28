// Design tokens — "Studio Violet" system.
// Derived from the reference ad's two worlds (light-gray studio radial + violet
// radial) and the brief's premium digital editorial direction. Purple is an
// accent in the light world and becomes a full surface only at story beats.

export const color = {
  ink: "#0B0B12",
  charcoal: "#1B1B24",
  graphite: "#3A3A48",
  mute: "#6B6B7B",
  fog: "#A7A7B4",
  line: "#E4E4EA",
  paper: "#FFFFFF",
  offwhite: "#F7F7F9",
  studioEdge: "#C9C9D2",

  violet: "#7B3FF2",
  violetBright: "#9466FF",
  violetDeep: "#5B21D6",
  violetNight: "#3E13A6",
  lavender: "#D9CCFF",
  lavenderSoft: "#EEE8FF",

  // "Familiar app" cues for the old workflow (original UI, not brand replicas).
  chatGreen: "#1F9E6A",
  chatBubbleOut: "#DCF7E3",
  chatBg: "#EFE9E1",
  driveBlue: "#3B6FE0",
  notifRed: "#FF3B30",
} as const;

export const font = {
  display: "'Inter Tight', 'Inter', system-ui, sans-serif",
  serif: "'Instrument Serif', Georgia, serif",
  ui: "'Inter', system-ui, sans-serif",
  site: "'Geist', 'Inter', system-ui, sans-serif",
  mono: "'Geist Mono', ui-monospace, monospace",
} as const;

export const bg = {
  studio: `radial-gradient(120% 80% at 50% 45%, #FFFFFF 0%, #F4F4F7 38%, #DADAE1 78%, #C4C4CE 100%)`,
  violet: `radial-gradient(110% 75% at 50% 48%, #9A6BFF 0%, #7B3FF2 42%, #5B21D6 78%, #45169F 100%)`,
  white: "#FFFFFF",
} as const;

export const shadow = {
  bubble: "0 24px 48px -12px rgba(46, 16, 110, 0.35), 0 8px 16px -8px rgba(46, 16, 110, 0.25)",
  card: "0 30px 60px -20px rgba(20, 16, 40, 0.30), 0 12px 24px -12px rgba(20, 16, 40, 0.18)",
  float: "0 50px 100px -30px rgba(20, 12, 50, 0.45), 0 20px 40px -20px rgba(20, 12, 50, 0.25)",
  soft: "0 10px 30px -10px rgba(20, 16, 40, 0.18)",
} as const;

export const W = 1080;
export const H = 1920;
export const FPS = 30;
// Meta Reels safe zone: keep key content out of the top ~250px and bottom ~420px.
export const SAFE = { top: 250, bottom: 420, side: 60 } as const;

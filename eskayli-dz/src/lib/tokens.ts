// ESKAYLI DZ design tokens — "Signal → System → Conversion".
// Near-black, paper, greys, and ONE accent (the signal): active states,
// conversions, progression and the CTA. Nothing else is orange.

export const color = {
  ink: "#0B0B0C", // background
  ink2: "#101012", // vignette centre
  panel: "#161618", // cards
  panel2: "#1E1E21", // raised cards / inputs
  panel3: "#26262A",
  line: "rgba(255,255,255,0.08)", // hairlines, grid
  line2: "rgba(255,255,255,0.14)", // card borders
  mist: "#8C8C92", // secondary text, metadata
  mist2: "#5E5E64", // tertiary
  paper: "#F4F2EE", // primary text on dark; the brand frame
  paperDim: "rgba(244,242,238,0.72)",
  signal: "#FF5A1F", // the accent
  signalSoft: "rgba(255,90,31,0.16)",
  signalLine: "rgba(255,90,31,0.55)",
  success: "#FF5A1F", // conversions use the accent too (one-accent rule)
} as const;

export const font = {
  sans: "'Geist', system-ui, sans-serif",
  mono: "'Geist Mono', ui-monospace, monospace",
} as const;

export const W = 1080;
export const H = 1920;
export const FPS = 30;

// Critical content stays inside the 1:1 centre crop (y 420–1500) and clear of the
// Reels UI; supporting elements may use SAFE.top..SAFE.bottom.
export const CORE = { top: 440, bottom: 1480 } as const;
export const SAFE = { top: 250, bottom: 1640, side: 72 } as const;

export const radius = { card: 28, pill: 999, input: 14 } as const;

export const shadow = {
  card: "0 40px 80px -30px rgba(0,0,0,0.75), 0 12px 24px -12px rgba(0,0,0,0.6)",
  float: "0 60px 120px -40px rgba(0,0,0,0.9)",
} as const;

// Background of the "system" world: warm near-black with a soft centre lift.
export const bgSystem = `radial-gradient(90% 60% at 50% 46%, #141416 0%, #0D0D0E 55%, #080809 100%)`;

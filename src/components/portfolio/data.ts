import { staticFile } from "remotion";

// Fictional persona used to demonstrate the service. No real person, brand,
// client, metric or testimonial. "tonnom.com" (= "your name .com") is a
// deliberate placeholder for the buyer's own domain.
export const persona = {
  name: "Inès Morel",
  first: "Inès",
  role: "UGC Creator & Voice Over",
  city: "Paris",
  url: "tonnom.com",
  email: "bonjour@tonnom.com",
};

export const pf = {
  paper: "#F4F1EC",
  paperDeep: "#ECE7DF",
  ink: "#16140F",
  inkSoft: "#3B3830",
  mute: "#78736A",
  line: "rgba(22,20,15,0.13)",
  clay: "#B86B4B",
  sage: "#A3B19B",
  serif: "'Instrument Serif', Georgia, serif",
  sans: "'Geist', 'Inter', system-ui, sans-serif",
  mono: "'Geist Mono', ui-monospace, monospace",
} as const;

export const img = {
  hero: () => staticFile("assets/images/hero.avif"),
  skincare: () => staticFile("assets/images/work_skincare.avif"),
  coffee: () => staticFile("assets/images/work_coffee.avif"),
  voice: () => staticFile("assets/images/work_voice.avif"),
};

export type Project = { key: "skincare" | "coffee" | "voice"; title: string; meta: string; duration: string; pos?: string };
export const projects: Project[] = [
  { key: "skincare", title: "Routine sérum", meta: "UGC · Beauté", duration: "0:32", pos: "50% 40%" },
  { key: "coffee", title: "Pause café", meta: "Reel · Food", duration: "0:18", pos: "50% 45%" },
  { key: "voice", title: "Spot radio", meta: "Voix off · Pub", duration: "0:45", pos: "50% 55%" },
];

export const services = [
  { n: "01", title: "Vidéos UGC", text: "Témoignages, unboxing et démonstrations produit." },
  { n: "02", title: "Voix off", text: "Publicité, narration et tutoriels, en français natif." },
  { n: "03", title: "Reels & TikTok", text: "Formats courts tournés, montés et sous-titrés." },
  { n: "04", title: "Photo produit", text: "Visuels lifestyle pour vos réseaux et votre site." },
];

// Desktop page (authored at 1200 px wide): section offsets in page px, used to
// sync the scroll in the ad with the voiceover ("Tes projets, tes services…").
export const DESK = {
  width: 1200,
  nav: 0, hero: 84, work: 784, voice: 1604, services: 1804, style: 2404, about: 3004, contact: 3444, footer: 3884, total: 3964,
};

// Mobile page (authored at 390 px wide).
export const MOB = { width: 390, nav: 50, hero: 106, intro: 586, work: 870, voice: 1400, services: 1560, contact: 1930, total: 2200 };

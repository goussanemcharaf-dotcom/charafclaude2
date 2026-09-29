import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// One family (Geist + Geist Mono), local files, blocking load: deterministic renders.
const faces = [
  { family: "Geist", file: "Geist-Variable.woff2" },
  { family: "Geist Mono", file: "GeistMono-Variable.woff2" },
];

let loaded = false;
export const ensureFonts = () => {
  if (loaded) return;
  loaded = true;
  for (const f of faces) {
    loadFont({ family: f.family, url: staticFile(`fonts/${f.file}`), weight: "100 900", format: "woff2" });
  }
};

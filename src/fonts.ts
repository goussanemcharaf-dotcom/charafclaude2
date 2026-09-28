import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// All fonts are local files (fonts/, mirrored into public/) so renders are
// deterministic and offline. loadFont() blocks rendering until each is ready.
const faces: Array<{ family: string; file: string; weight?: string; style?: string }> = [
  { family: "Inter Tight", file: "InterTight-Variable.woff2", weight: "100 900" },
  { family: "Inter Tight", file: "InterTight-Variable-Italic.woff2", weight: "100 900", style: "italic" },
  { family: "Inter", file: "Inter-Variable.woff2", weight: "100 900" },
  { family: "Geist", file: "Geist-Variable.woff2", weight: "100 900" },
  { family: "Geist Mono", file: "GeistMono-Variable.woff2", weight: "100 900" },
  { family: "Instrument Serif", file: "InstrumentSerif-Regular.woff2", weight: "400" },
  { family: "Instrument Serif", file: "InstrumentSerif-Italic.woff2", weight: "400", style: "italic" },
];

let loaded = false;
export const ensureFonts = () => {
  if (loaded) return;
  loaded = true;
  for (const f of faces) {
    loadFont({
      family: f.family,
      url: staticFile(`fonts/${f.file}`),
      weight: f.weight,
      style: f.style ?? "normal",
      format: "woff2",
    });
  }
};

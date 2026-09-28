// Render the program (no subtitles) and the transparent subtitle layer.
// Audio is mixed separately (utils/audio) and muxed in utils/export.sh.
import { renderMedia, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { browserExecutable, chromiumOptions, makeBrowser, makeBundle, root } from "./remotion-env.mjs";

const only = process.argv[2]; // optional: "program" | "subs"
const concurrency = Number(process.env.CONCURRENCY ?? 4);
const serveUrl = await makeBundle();
const browser = await makeBrowser();
mkdirSync(join(root, "renders"), { recursive: true });

async function render(id, outputLocation, extra) {
  const composition = await selectComposition({
    serveUrl, id, browserExecutable, chromiumOptions, puppeteerInstance: browser,
  });
  const t0 = Date.now();
  let last = -1;
  await renderMedia({
    composition, serveUrl, outputLocation, browserExecutable, chromiumOptions,
    puppeteerInstance: browser, concurrency, muted: true,
    onProgress: ({ progress }) => {
      const p = Math.floor(progress * 20);
      if (p !== last) { last = p; process.stdout.write(`\r${id} ${Math.round(progress * 100)}%   `); }
    },
    ...extra,
  });
  console.log(`\n${id} -> ${outputLocation} in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}

if (!only || only === "program") {
  await render("MetaAd", join(root, "renders/program_clean.mp4"), {
    codec: "h264", crf: 10, x264Preset: "slow", pixelFormat: "yuv420p",
    colorSpace: "bt709", imageFormat: "jpeg", jpegQuality: 96,
  });
}
if (!only || only === "subs") {
  await render("Subtitles", join(root, "renders/subtitles_alpha.mov"), {
    codec: "prores", proResProfile: "4444", imageFormat: "png", pixelFormat: "yuva444p10le",
  });
}
await browser.close({ silent: true });

// Render the ESKAYLI program (no subtitles) and the transparent subtitle layer.
// Audio is mixed separately (utils/audio/build_audio.py) and muxed in utils/export.sh.
//
//   node utils/render.mjs            program (all chunks) + subtitles
//   node utils/render.mjs program    program only
//   node utils/render.mjs program 3,7  re-render chunks 3 and 7 only, then re-join
//   node utils/render.mjs subs       subtitle layer only
//
// The program is rendered in chunks of CHUNK frames (identical encoder settings) and joined with
// ffmpeg's concat demuxer, so a fix late in QA only re-renders the chunks it touches.
import { renderMedia, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { browserExecutable, chromiumOptions, makeBrowser, makeBundle, root } from "./remotion-env.mjs";

const [only, pick] = process.argv.slice(2);
const concurrency = Number(process.env.CONCURRENCY ?? 4);
const CHUNK = 240;
const work = join(root, "renders/_work");
const chunkDir = join(work, "chunks");
mkdirSync(chunkDir, { recursive: true });

const serveUrl = await makeBundle();
const browser = await makeBrowser();

async function render(id, outputLocation, extra) {
  const composition = await selectComposition({ serveUrl, id, browserExecutable, chromiumOptions, puppeteerInstance: browser });
  const t0 = Date.now();
  let last = -1;
  await renderMedia({
    composition, serveUrl, outputLocation, browserExecutable, chromiumOptions,
    puppeteerInstance: browser, concurrency, muted: true,
    onProgress: ({ progress }) => {
      const p = Math.floor(progress * 10);
      if (p !== last) { last = p; process.stdout.write(`\r${id} ${Math.round(progress * 100)}%   `); }
    },
    ...extra,
  });
  console.log(`\n${id} -> ${outputLocation} in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  return composition;
}

const PROGRAM = { codec: "h264", crf: 10, x264Preset: "slow", pixelFormat: "yuv420p", colorSpace: "bt709", imageFormat: "jpeg", jpegQuality: 96 };

if (!only || only === "program") {
  const comp = await selectComposition({ serveUrl, id: "Film", browserExecutable, chromiumOptions, puppeteerInstance: browser });
  const n = Math.ceil(comp.durationInFrames / CHUNK);
  const want = pick ? pick.split(",").map(Number) : [...Array(n).keys()];
  for (const i of want) {
    const a = i * CHUNK, b = Math.min(comp.durationInFrames, (i + 1) * CHUNK) - 1;
    await render("Film", join(chunkDir, `prog_${String(i).padStart(2, "0")}.mp4`), { ...PROGRAM, frameRange: [a, b] });
  }
  const list = [...Array(n).keys()].map((i) => join(chunkDir, `prog_${String(i).padStart(2, "0")}.mp4`));
  const missing = list.filter((f) => !existsSync(f));
  if (missing.length) {
    console.log(`not joined yet — missing chunks: ${missing.map((f) => f.slice(-6, -4)).join(", ")}`);
  } else {
    writeFileSync(join(chunkDir, "list.txt"), list.map((f) => `file '${f}'`).join("\n") + "\n");
    execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", join(chunkDir, "list.txt"), "-c", "copy",
      join(work, "program_clean.mp4")]);
    console.log(`joined ${n} chunks -> renders/_work/program_clean.mp4`);
  }
}
if (!only || only === "subs") {
  await render("Subtitles", join(work, "subtitles_alpha.mov"), {
    codec: "prores", proResProfile: "4444", imageFormat: "png", pixelFormat: "yuva444p10le",
  });
}
await browser.close({ silent: true });

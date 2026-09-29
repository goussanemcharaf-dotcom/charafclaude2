// Render individual frames for design review / QA (Eskayli project).
// Usage: node utils/still.mjs <compositionId> <outDir> <t1> [t2 ...]
//   times are in seconds (e.g. 1.5) or frames with an "f" suffix (e.g. 45f).
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { browserExecutable, chromiumOptions, makeBrowser, makeBundle, root } from "./remotion-env.mjs";

const [id = "MetaAd", outDir = "previews", ...times] = process.argv.slice(2);
const inputProps = JSON.parse(process.env.PROPS ?? "{}");
const serveUrl = await makeBundle();
const browser = await makeBrowser();
const composition = await selectComposition({
  serveUrl, id, inputProps, browserExecutable, chromiumOptions, puppeteerInstance: browser,
});
const out = join(root, outDir);
mkdirSync(out, { recursive: true });
const list = times.length ? times : ["0"];
for (const t of list) {
  const frame = t.endsWith("f")
    ? parseInt(t, 10)
    : Math.min(composition.durationInFrames - 1, Math.round(parseFloat(t) * composition.fps));
  const file = join(out, `${id}_${String(frame).padStart(4, "0")}.png`);
  await renderStill({
    composition, serveUrl, output: file, frame, inputProps,
    browserExecutable, chromiumOptions, puppeteerInstance: browser, imageFormat: "png",
  });
  console.log(file);
}
await browser.close({ silent: true });

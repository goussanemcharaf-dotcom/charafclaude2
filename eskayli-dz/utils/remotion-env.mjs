// Shared bundling + browser setup for the Node render scripts (Eskayli project).
// Remotion and React resolve from the repository root's node_modules.
import { bundle } from "@remotion/bundler";
import { openBrowser } from "@remotion/renderer";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const root = join(dirname(fileURLToPath(import.meta.url)), "..");
export const browserExecutable =
  process.env.REMOTION_CHROME ??
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
export const chromiumOptions = { gl: "swangle", enableMultiProcessOnLinux: true };

export async function makeBundle() {
  const t0 = Date.now();
  const serveUrl = await bundle({
    entryPoint: join(root, "src/index.ts"),
    publicDir: join(root, "public"),
    onProgress: () => {},
  });
  console.log(`bundled in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  return serveUrl;
}

export async function makeBrowser() {
  return openBrowser("chrome", { browserExecutable, chromiumOptions });
}

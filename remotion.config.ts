// Remotion CLI config (used by `npm run studio`). Node renders use utils/render.mjs.
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setPublicDir("./public");
// Use the preinstalled Chromium headless shell instead of downloading one.
Config.setBrowserExecutable(
  process.env.REMOTION_CHROME ??
    "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell",
);

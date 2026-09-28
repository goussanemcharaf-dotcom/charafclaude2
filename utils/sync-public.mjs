// Remotion serves static files from /public. The source of truth lives in the
// requested architecture (/assets, /audio, /fonts); this mirrors what the
// compositions need at render time into /public (git-ignored).
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");

const mirror = [
  ["fonts", "fonts"],
  ["assets/images", "assets/images"],
  ["assets/generated", "assets/generated"],
  ["assets/icons", "assets/icons"],
  ["assets/ui", "assets/ui"],
];

rmSync(pub, { recursive: true, force: true });
mkdirSync(pub, { recursive: true });
for (const [from, to] of mirror) {
  const src = join(root, from);
  if (!existsSync(src)) continue;
  cpSync(src, join(pub, to), { recursive: true });
}
console.log("public/ synced");

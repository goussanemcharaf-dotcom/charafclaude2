// Remotion serves static files from public/. Sources live in fonts/ and assets/;
// this mirrors what the compositions need at render time (public/ is git-ignored).
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");
rmSync(pub, { recursive: true, force: true });
mkdirSync(pub, { recursive: true });
for (const dir of ["fonts", "assets/images", "assets/grain"]) {
  const src = join(root, dir);
  if (existsSync(src)) cpSync(src, join(pub, dir), { recursive: true });
}
console.log("public/ synced");

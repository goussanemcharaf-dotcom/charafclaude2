"""Film-grain tile for the noise world (assets/grain/grain_512.png).

One seamless 512 px grayscale noise tile, lightly softened so it reads as grain, not pixels.
The film offsets it pseudo-randomly 24 times a second (components/base.tsx → Grain), which is
visually equivalent to a per-frame turbulence filter at a fraction of the render cost.
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

out = Path(__file__).resolve().parents[1] / "assets/grain/grain_512.png"
rng = np.random.default_rng(7)
n = rng.normal(128, 46, (512, 512))
img = Image.fromarray(np.clip(n, 0, 255).astype(np.uint8), "L").filter(ImageFilter.GaussianBlur(0.6))
img.save(out, optimize=True)
print(out, out.stat().st_size // 1024, "KB")

# The system grid (12 columns × 20 rows of hairlines, radially faded) as one transparent PNG: identical
# to the SVG version but drawn once instead of re-masked every frame.
W, H, COLS, ROWS = 1080, 1920, 12, 20
yy, xx = np.mgrid[0:H, 0:W]
# radial fade: centre (50 %, 46 %), radius 62 % of the frame diagonal box (objectBoundingBox semantics)
d = np.sqrt(((xx - 0.5 * W) / (0.62 * W)) ** 2 + ((yy - 0.46 * H) / (0.62 * H)) ** 2)
fade = np.interp(d, [0, 0.7, 1.0], [1.0, 0.55, 0.0])
lines = np.zeros((H, W))
for i in range(COLS + 1):
    lines[:, int(round(60 + i * 960 / COLS)) - (1 if i == COLS else 0)] = 1
for i in range(ROWS + 1):
    lines[min(H - 1, int(round(i * H / ROWS))), :] = 1
alpha = np.clip(lines * 0.075 * fade * 255, 0, 255).astype(np.uint8)
rgba = np.dstack([np.full((H, W), 255, np.uint8)] * 3 + [alpha])
grid = out.parent / "grid_1080x1920.png"
Image.fromarray(rgba, "RGBA").save(grid, optimize=True)
print(grid, grid.stat().st_size // 1024, "KB")

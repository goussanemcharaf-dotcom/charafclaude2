"""Tile rendered frames into a labelled contact sheet for visual QA.

Usage: python3 utils/qa_sheet.py <out.jpg> <cols> <frame.png> [frame.png ...]
Frame files named <id>_<frame>.png get their timestamp (frame / 30) printed.
"""
import re
import sys
from PIL import Image, ImageDraw, ImageFont

out, cols, files = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
W, H = 360, 640  # thumbnail size (1/3 scale)
rows = (len(files) + cols - 1) // cols
sheet = Image.new("RGB", (cols * (W + 8) + 8, rows * (H + 8) + 8), (30, 30, 36))
try:
    fnt = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 22)
except OSError:
    fnt = ImageFont.load_default()
for i, f in enumerate(files):
    im = Image.open(f).convert("RGB").resize((W, H), Image.LANCZOS)
    x, y = 8 + (i % cols) * (W + 8), 8 + (i // cols) * (H + 8)
    sheet.paste(im, (x, y))
    m = re.search(r"_(\d+)\.png$", f)
    if m:
        label = f"{int(m.group(1)) / 30:.2f}s  f{int(m.group(1))}"
        d = ImageDraw.Draw(sheet)
        d.rectangle([x, y, x + 190, y + 30], fill=(0, 0, 0))
        d.text((x + 6, y + 3), label, fill=(255, 230, 0), font=fnt)
sheet.save(out, quality=86)
print(out, sheet.size)

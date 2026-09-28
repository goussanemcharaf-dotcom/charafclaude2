"""One labelled key frame per scene, pulled from a rendered deliverable.

Usage: python3 utils/qa_keyframes.py <video.mp4> <out.jpg>
"""
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

# (scene, time in s, label) — times picked where each scene's idea is fully on screen
KEYS = [
    ("S01", 3.95, "Identification"), ("S02", 7.8, "Workflow"), ("S03", 10.95, "Chaos"), ("S04", 13.9, "Confusion"),
    ("S05", 14.8, "Non."), ("S06a", 19.8, "Promise"), ("S06b", 21.3, "Build"), ("S07", 22.5, "Organized"),
    ("S07", 25.6, "One experience"), ("S08", 27.3, "10 liens"), ("S09", 28.9, "1 seul lien"), ("S10", 30.9, "Client"),
    ("S11", 33.5, "Statement"), ("S12", 36.5, "CTA"),
]


def main():
    video, out = sys.argv[1], sys.argv[2]
    W, H, cols = 360, 640, 7
    rows = (len(KEYS) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * (W + 8) + 8, rows * (H + 44) + 8), (22, 22, 26))
    fnt = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 22)
    for i, (sid, t, label) in enumerate(KEYS):
        raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", video, "-frames:v", "1", "-vf", f"scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                             capture_output=True, check=True).stdout
        im = Image.frombytes("RGB", (W, H), raw)
        x, y = 8 + (i % cols) * (W + 8), 8 + (i // cols) * (H + 44)
        sheet.paste(im, (x, y + 36))
        ImageDraw.Draw(sheet).text((x + 2, y + 4), f"{sid} · {t:.2f}s · {label}", fill=(255, 230, 0), font=fnt)
    Path(out).parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out, quality=88)
    print(out, sheet.size)


if __name__ == "__main__":
    main()

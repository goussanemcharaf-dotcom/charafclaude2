"""Contact sheets of the final deliverables for frame-by-frame QA (qa/sheets/).

  eskayli_9x16_p1.jpg, _p2.jpg   01_ESKAYLI_META_9x16.mp4 at 1 frame / s (captions burned in)
  eskayli_4x5.jpg, eskayli_1x1.jpg   the feed crops at 1 frame / 2 s — nothing critical may be cut

Usage: python3 utils/qa_sheets.py
"""
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "qa/sheets"
FONT = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 15)


def frames(video, fps, w):
    tmp = Path(tempfile.mkdtemp())
    subprocess.run(["ffmpeg", "-v", "error", "-i", str(video), "-vf", f"fps={fps},scale={w}:-2", str(tmp / "f_%04d.png")], check=True)
    return sorted(tmp.glob("f_*.png"))


def sheet(files, fps, cols, out, per=None):
    per = per or len(files)
    pages = []
    for p in range(0, len(files), per):
        fs = files[p:p + per]
        w, h = Image.open(fs[0]).size
        rows = (len(fs) + cols - 1) // cols
        im = Image.new("RGB", (cols * (w + 4) + 4, rows * (h + 22) + 4), (60, 60, 60))
        d = ImageDraw.Draw(im)
        for i, f in enumerate(fs):
            t = (p + i) / fps
            x, y = 4 + (i % cols) * (w + 4), 4 + (i // cols) * (h + 22)
            im.paste(Image.open(f), (x, y + 20))
            d.text((x, y + 2), f"{int(t // 60)}:{t % 60:04.1f}", fill=(255, 220, 0), font=FONT)
        name = out.with_name(f"{out.stem}_p{len(pages) + 1}{out.suffix}") if len(files) > per else out
        im.save(name, quality=82)
        pages.append(name)
    return pages


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    r = ROOT / "renders"
    made = []
    made += sheet(frames(r / "01_ESKAYLI_META_9x16.mp4", 1, 180), 1, 10, OUT / "eskayli_9x16.jpg", per=40)
    made += sheet(frames(r / "04_ESKAYLI_4x5.mp4", 0.5, 200), 0.5, 10, OUT / "eskayli_4x5.jpg")
    made += sheet(frames(r / "05_ESKAYLI_1x1.mp4", 0.5, 200), 0.5, 10, OUT / "eskayli_1x1.jpg")
    for m in made:
        print(m.relative_to(ROOT), Image.open(m).size)


if __name__ == "__main__":
    main()

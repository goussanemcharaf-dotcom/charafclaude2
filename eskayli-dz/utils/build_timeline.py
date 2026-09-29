"""Build config/timeline.json from the comped voice-over (config/vo.json).

The timeline is the single source of truth: every chapter window, animation cue, subtitle and sound
effect is derived from the voice's word timestamps, so picture, captions and sound can't drift apart.
"""
import json
import math
from pathlib import Path

ESK = Path(__file__).resolve().parents[1]
FPS = 30


def main():
    vo = json.loads((ESK / "config/vo.json").read_text())
    P = {p["id"]: p for p in vo["phrases"]}
    frames = int(math.ceil(vo["duration"] * FPS))
    duration = frames / FPS

    # chapter windows (s): each opens slightly before its first phrase so the picture leads the voice
    starts = [
        ("c01_hook", 0.0),
        ("c02_question", P[2]["start"] - 0.25),
        ("c03_problem", P[3]["start"] - 0.35),
        ("c04_business", P[4]["start"] - 0.3),
        ("c05_eskayli", P[9]["start"] - 0.35),
        ("c06_system", P[10]["start"] - 0.2),
        ("c07_testing", P[14]["start"] - 0.25),
        ("c08_outcome", P[15]["start"] - 0.35),
        ("c09_idea", P[21]["start"] - 0.3),
        ("c10_brand", P[23]["start"] - 0.3),
    ]
    chapters = {}
    for i, (name, t0) in enumerate(starts):
        t1 = starts[i + 1][1] if i + 1 < len(starts) else duration
        chapters[name] = [round(max(0.0, t0), 3), round(t1, 3)]

    timeline = {
        "fps": FPS, "width": 1080, "height": 1920, "duration": duration, "frames": frames,
        "vo": {"file": vo["file"], "voice": vo["voice"]},
        "phrases": vo["phrases"], "words": vo["words"], "chapters": chapters,
    }
    (ESK / "config/timeline.json").write_text(json.dumps(timeline, ensure_ascii=False, indent=1))
    print(f"duration {duration:.3f}s ({frames} frames)")
    for k, (a, b) in chapters.items():
        print(f"  {k:14s} {a:6.2f} -> {b:6.2f}  ({b - a:4.1f}s)")


if __name__ == "__main__":
    main()

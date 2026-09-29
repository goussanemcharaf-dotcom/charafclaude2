"""Fit a new full-script voiceover take onto the existing picture timeline.

Usage:
  python3 utils/voice/fit_vo.py --take TAKE.mp3 --words TAKE_words.json --label "source description"
         [--out audio/voiceover/clone/vo_packed_clone.flac] [--ref audio/voiceover/vo_packed_timing.json]

TAKE_words.json = ASR word list for the take: [[word, start, end, (prob)], ...] or {"words": [...]}.

Each of the 17 canonical phrases (utils/build_timeline.PHRASES) is located in the take by aligning
the ASR words to the script, cut, trimmed, its inner pauses tightened, then time-stretched with
rubberband (pitch preserved) to the duration it had in the reference edit — so phrase starts, and
therefore every scene boundary of the picture, stay where they are. Stretch is clamped to a natural
range; if a phrase can't fit, it keeps the clamped duration and the timeline moves with it.

Writes the packed take + vo_packed_timing.json in the format utils/build_timeline.py consumes
(phrases joined with 0.12 s gaps; words already mapped 1:1 onto the script tokens).
"""
import argparse
import difflib
import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "utils"))
from build_timeline import PHRASES  # noqa: E402

SR = 48000
GAP = 0.12            # silence between phrases in the packed file
MAX_PAUSE = 0.20      # inner pauses longer than this are shortened to it
TEMPO_RANGE = (0.84, 1.24)  # >1 = faster; beyond this a stretch starts to sound processed


def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)


def atoms(text):
    t = unicodedata.normalize("NFC", text.lower()).replace("’", "'")
    t = re.sub(r"[.,…?!:;«»\"()]", " ", t)
    return [a for a in re.split(r"[\s'\-]+", t) if a]


def align(words):
    """Map every script token to (start, end) using the ASR words."""
    tok = [(k, j, tk) for k, p in enumerate(PHRASES) for j, tk in enumerate(p.split(" "))]
    can, can_owner = [], []
    for i, (_, _, tk) in enumerate(tok):
        for a in atoms(tk):
            can.append(a)
            can_owner.append(i)
    asr, asr_time = [], []
    for w in words:
        for a in atoms(w[0]):
            asr.append(a)
            asr_time.append((w[1], w[2]))
    sm = difflib.SequenceMatcher(None, can, asr, autojunk=False)
    times = [None] * len(tok)
    for blk in sm.get_matching_blocks():
        for d in range(blk.size):
            i = can_owner[blk.a + d]
            s, e = asr_time[blk.b + d]
            times[i] = (s, e) if times[i] is None else (min(times[i][0], s), max(times[i][1], e))
    matched = sum(t is not None for t in times)
    # interpolate the rare unmatched token between its neighbours
    for i in range(len(times)):
        if times[i] is None:
            prev = next((times[j] for j in range(i - 1, -1, -1) if times[j]), (0.0, 0.0))
            nxt = next((times[j] for j in range(i + 1, len(times)) if times[j]), (prev[1] + 0.3, prev[1] + 0.3))
            times[i] = (prev[1], max(prev[1] + 0.05, nxt[0]))
    return tok, times, matched / len(tok)


def trim_bounds(x, a, b, thr_db=-42.0, pad=0.03):
    """Tighten [a, b] (s) to where the phrase is actually voiced."""
    ia, ib = max(0, int(a * SR)), min(len(x), int(b * SR))
    seg = x[ia:ib]
    w = int(0.01 * SR)
    rms = np.sqrt(np.convolve(seg ** 2, np.ones(w) / w, mode="same"))
    ref = np.max(rms) + 1e-9
    on = np.where(20 * np.log10(rms / ref + 1e-12) > thr_db)[0]
    if len(on) == 0:
        return a, b
    s = (ia + on[0]) / SR - pad
    e = (ia + on[-1]) / SR + pad
    return max(a, s), min(b, e)


def squeeze_pauses(seg, thr_db=-40.0, max_pause=MAX_PAUSE):
    """Shorten inner silences; returns audio + a time map (orig_t -> new_t) as breakpoints."""
    w = int(0.01 * SR)
    rms = np.sqrt(np.convolve(seg ** 2, np.ones(w) / w, mode="same"))
    ref = np.max(rms) + 1e-9
    quiet = 20 * np.log10(rms / ref + 1e-12) < thr_db
    d = np.diff(np.concatenate([[0], quiet.astype(int), [0]]))
    runs = list(zip(np.where(d == 1)[0], np.where(d == -1)[0]))
    keep, bp, cur_in, cur_out = [], [(0.0, 0.0)], 0, 0
    for s, e in runs:
        if s == 0 or e >= len(seg) or (e - s) <= max_pause * SR:
            continue
        cut_from = s + int(max_pause * SR / 2)
        cut_to = e - int(max_pause * SR / 2)
        keep.append(seg[cur_in:cut_from])
        cur_out += cut_from - cur_in
        bp.append((cut_from / SR, cur_out / SR))
        bp.append((cut_to / SR, cur_out / SR))
        cur_in = cut_to
    keep.append(seg[cur_in:])
    cur_out += len(seg) - cur_in
    bp.append((len(seg) / SR, cur_out / SR))
    out = np.concatenate(keep)
    # 5 ms crossfade-free joins are fine at silence points; tiny fades avoid clicks
    return out, bp


def time_map(bp, t):
    xs, ys = zip(*bp)
    return float(np.interp(t, xs, ys))


def stretch(seg, tempo):
    if abs(tempo - 1) < 0.004:
        return seg
    out = subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                          "-af", f"rubberband=tempo={tempo:.5f}:pitchq=quality:transients=smooth:detector=soft",
                          "-f", "f32le", "-"], input=seg.astype(np.float32).tobytes(), capture_output=True, check=True).stdout
    return np.frombuffer(out, np.float32).astype(np.float64)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--take", required=True)
    ap.add_argument("--words", required=True)
    ap.add_argument("--label", required=True)
    ap.add_argument("--out", default="audio/voiceover/clone/vo_packed_clone.flac")
    ap.add_argument("--ref", default="audio/voiceover/julian/vo_packed_timing.json")
    ap.add_argument("--timing-out", default="audio/voiceover/vo_packed_timing.json")
    a = ap.parse_args()

    x = load(a.take)
    wj = json.loads(Path(a.words).read_text())
    words = wj["words"] if isinstance(wj, dict) else wj
    ref = json.loads((ROOT / a.ref).read_text())
    ref_dur = {p[0]: p[2] - p[1] for p in ref["phrases"]}

    tok, times, cover = align(words)
    print(f"script tokens matched by ASR: {cover:.0%}")
    packed, phrases, out_words, t = [], [], [], 0.0
    report = []
    for k in range(len(PHRASES)):
        pid = k + 1
        idx = [i for i, (kk, _, _) in enumerate(tok) if kk == k]
        s0, e0 = times[idx[0]][0] - 0.06, times[idx[-1]][1] + 0.12
        s, e = trim_bounds(x, s0, e0)
        seg = x[int(s * SR):int(e * SR)].copy()
        seg, bp = squeeze_pauses(seg)
        nat = len(seg) / SR
        target = ref_dur[pid]
        tempo = float(np.clip(nat / target, *TEMPO_RANGE))
        seg = stretch(seg, tempo)
        f = int(0.004 * SR)
        seg[:f] *= np.linspace(0, 1, f)
        seg[-f:] *= np.linspace(1, 0, f)
        dur = len(seg) / SR
        phrases.append([pid, round(t, 3), round(t + dur, 3)])
        for i in idx:
            ws, we = times[i]
            ns = time_map(bp, max(0.0, ws - s)) / tempo
            ne = time_map(bp, max(0.0, we - s)) / tempo
            out_words.append([tok[i][2], round(t + min(ns, dur), 3), round(t + min(max(ne, ns + 0.02), dur), 3)])
        report.append(f"P{pid:<2} natural {nat:5.2f}s -> {dur:5.2f}s (target {target:5.2f}s, tempo x{tempo:.3f})")
        packed.append(seg)
        packed.append(np.zeros(int(GAP * SR)))
        t += dur + GAP
    y = np.concatenate(packed[:-1])
    out = ROOT / a.out
    out.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                    "-c:a", "flac", "-sample_fmt", "s32", str(out)], input=y.astype(np.float32).tobytes(), check=True)
    timing = {"source": a.label, "packed_file": a.out, "phrases": phrases, "words": out_words, "tokens_mapped": True}
    (ROOT / a.timing_out).write_text(json.dumps(timing, ensure_ascii=False, indent=1))
    print("\n".join(report))
    print(f"wrote {out} ({len(y) / SR:.2f}s) and {a.timing_out}")


if __name__ == "__main__":
    main()

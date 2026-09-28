"""Audio QA plots: momentary loudness of each stem over time + master spectrogram."""
import json
import subprocess
import sys
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from scipy import signal

sys.path.insert(0, str(Path(__file__).resolve().parent))
from loudness import _k_weight  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
SR = 48000


def load(p):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(p), "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)


def momentary(x, win=0.4, hop=0.05):
    y = _k_weight(x)
    sq = np.sum(y ** 2, axis=1)
    cs = np.concatenate([[0], np.cumsum(sq)])
    b, h = int(win * SR), int(hop * SR)
    idx = np.arange(0, len(sq) - b, h)
    ms = (cs[idx + b] - cs[idx]) / b
    return idx / SR + win / 2, -0.691 + 10 * np.log10(ms + 1e-12)


def main():
    tl = json.loads((ROOT / "config/timeline.json").read_text())
    vo = load(ROOT / "audio/voiceover/vo_final.wav")
    mus = load(ROOT / "audio/music/music_stem.wav")
    fx = load(ROOT / "audio/sfx/sfx_stem.wav")
    ms = load(ROOT / "audio/master_mix.wav")
    fig, ax = plt.subplots(2, 1, figsize=(18, 9), dpi=90, gridspec_kw={"height_ratios": [1, 1.1]})
    for x, lab, c in ((ms, "master", "k"), (vo, "VO (raw, pre-master)", "tab:blue"), (mus, "music (ducked)", "tab:purple"), (fx, "SFX", "tab:orange")):
        t, l = momentary(x)
        ax[0].plot(t, np.maximum(l, -60), label=lab, color=c, lw=1.2 if lab != "master" else 1.8)
    for k, (a, b) in tl["scenes"].items():
        ax[0].axvline(a, color="0.8", lw=0.8)
        ax[0].text(a + 0.05, -8, k[:3], fontsize=8, color="0.4")
    ax[0].set_ylim(-60, -5); ax[0].set_xlim(0, tl["duration"]); ax[0].set_ylabel("momentary LUFS (400 ms)")
    ax[0].legend(loc="lower right"); ax[0].grid(alpha=0.3)
    f, t, Z = signal.spectrogram(ms.mean(axis=1), SR, nperseg=2048, noverlap=1536)
    ax[1].pcolormesh(t, f, 10 * np.log10(Z + 1e-14), shading="auto", cmap="magma", vmin=-120, vmax=-30)
    ax[1].set_yscale("symlog", linthresh=200); ax[1].set_ylim(30, 20000); ax[1].set_ylabel("Hz"); ax[1].set_xlabel("s")
    fig.tight_layout()
    out = ROOT / "qa/audio_loudness_spectrogram.png"
    fig.savefig(out)
    print(out)


if __name__ == "__main__":
    main()

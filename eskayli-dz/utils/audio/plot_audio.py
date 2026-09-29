"""qa/audio_overview.png — short-term levels of voice / music / SFX over the chapters, and spectrograms of the
master and of the music + SFX buses. Usage: python3 utils/audio/plot_audio.py"""
import json
import subprocess
from pathlib import Path

import matplotlib
import numpy as np
from scipy import signal

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
SR = 48000


def load(p):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(p), "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(float)


def short_term(x, win=0.4, hop=0.1):
    n, h = int(win * SR), int(hop * SR)
    return np.array([10 * np.log10(np.mean(x[i:i + n] ** 2) + 1e-10) for i in range(0, len(x) - n, h)])


def main():
    m, mu, fx = load(ROOT / "renders/_work/master_mix.wav"), load(ROOT / "music/music_stem.flac"), load(ROOT / "sfx/sfx_stem.flac")
    n = min(len(m), len(mu), len(fx))
    m, mu, fx = m[:n].mean(1), mu[:n].mean(1), fx[:n].mean(1)
    vo = m - mu - fx
    t = np.arange(len(short_term(m))) * 0.1
    fig, ax = plt.subplots(3, 1, figsize=(22, 11), gridspec_kw={"height_ratios": [1.2, 1, 1]})
    for x, c, lab in ((m, "k", "master"), (vo, "tab:blue", "voice"), (mu, "tab:orange", "music (ducked)"), (fx, "tab:green", "SFX")):
        ax[0].plot(t, short_term(x)[: len(t)], lw=0.8, c=c, label=lab)
    tl = json.loads((ROOT / "config/timeline.json").read_text())
    for k, (a, _) in tl["chapters"].items():
        ax[0].axvline(a, c="r", lw=0.6)
        ax[0].text(a + 0.1, -8, k[4:], fontsize=8, color="r")
    ax[0].set(ylim=(-60, -5), xlim=(0, t[-1]), ylabel="dBFS (400 ms)")
    ax[0].set_xticks(np.arange(0, t[-1], 2))
    ax[0].legend(loc="lower left")
    ax[0].grid(alpha=0.3)
    for a_, x, top in ((ax[1], m, 16000), (ax[2], mu + fx, 5000)):
        f, tt, sx = signal.spectrogram(x, SR, nperseg=2048, noverlap=1024)
        a_.pcolormesh(tt, f, 10 * np.log10(sx + 1e-12), shading="auto", vmin=-120, vmax=-40, cmap="magma")
        a_.set(ylim=(0, top), xlim=(0, t[-1]), ylabel="Hz")
    ax[1].set_title("master", fontsize=9, loc="left")
    ax[2].set_title("music + SFX (voice removed)", fontsize=9, loc="left")
    plt.tight_layout()
    plt.savefig(ROOT / "qa/audio_overview.png", dpi=70)
    print("qa/audio_overview.png")


if __name__ == "__main__":
    main()

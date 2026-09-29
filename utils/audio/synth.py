"""Original synthesis toolkit (numpy/scipy only) for the ad's music and SFX.

Every sound in the mix is generated here from oscillators, noise and filters:
no samples, no library loops, no third-party notification sounds.
"""
import numpy as np
from scipy import signal

SR = 48000
_rng = np.random.default_rng(20260928)


def rng():
    return _rng


def tt(dur):
    return np.arange(int(round(dur * SR))) / SR


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def sos_filter(x, kind, f, order=2):
    nyq = SR / 2
    if kind == "band":
        lo, hi = max(20, f[0]), min(nyq * 0.95, f[1])
        if lo >= hi * 0.9:  # degenerate band: widen upward
            lo, hi = min(lo, nyq * 0.6), min(nyq * 0.95, max(hi, lo * 1.6))
        sos = signal.butter(order, [lo, hi], "bandpass", fs=SR, output="sos")
    else:
        sos = signal.butter(order, min(nyq * 0.95, max(20, f)), kind, fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def lp(x, f, order=2):
    return sos_filter(x, "lowpass", f, order)


def hp(x, f, order=2):
    return sos_filter(x, "highpass", f, order)


def bp(x, lo, hi, order=2):
    return sos_filter(x, "band", (lo, hi), order)


def noise(n):
    return _rng.standard_normal(n)


def adsr(n, a=0.005, d=0.1, s=0.0, r=0.05, sustain_len=None):
    """Simple ADSR (seconds); returns envelope of length n."""
    env = np.zeros(n)
    A, D, R = int(a * SR), int(d * SR), int(r * SR)
    S = n - A - D - R if sustain_len is None else int(sustain_len * SR)
    S = max(0, S)
    i = 0
    seg = np.linspace(0, 1, max(1, A), endpoint=False); env[i:i + len(seg)] = seg[: n - i]; i += len(seg)
    if i < n:
        seg = np.linspace(1, s, max(1, D), endpoint=False); k = min(len(seg), n - i); env[i:i + k] = seg[:k]; i += k
    if i < n:
        k = min(S, n - i); env[i:i + k] = s; i += k
    if i < n:
        seg = np.linspace(s, 0, max(1, R)); k = min(len(seg), n - i); env[i:i + k] = seg[:k]
    return env


def soft_clip(x, drive=1.0):
    return np.tanh(x * drive) / np.tanh(drive)


# ---------------------------------------------------------------- drums
def kick(dur=0.5, f0=150, f1=44, decay=7.0, click=0.25, drive=1.6):
    t = tt(dur)
    f = f1 + (f0 - f1) * np.exp(-t * 30)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * decay)
    x += click * hp(noise(len(t)), 2000) * np.exp(-t * 500)
    return soft_clip(x, drive)


def snare(dur=0.28, tone=185, bright=1.0):
    t = tt(dur)
    n = bp(noise(len(t)), 1500, 7500) * np.exp(-t * 16) * 0.9 * bright
    body = np.sin(2 * np.pi * tone * t) * np.exp(-t * 28) * 0.55
    return soft_clip(n + body, 1.2)


def clap(dur=0.32):
    t = tt(dur)
    x = np.zeros(len(t))
    for k, off in enumerate([0.0, 0.011, 0.022, 0.034]):
        i = int(off * SR)
        seg = bp(noise(len(t) - i), 900, 5000) * np.exp(-tt((len(t) - i) / SR) * (140 if k < 3 else 13))
        x[i:] += seg * (0.7 if k < 3 else 1.0)
    return x * 0.8


def hat(dur=0.06, open_=False, bright=1.0):
    d = 0.32 if open_ else dur
    t = tt(d)
    n = hp(noise(len(t)), 7000, 4) * np.exp(-t * (9 if open_ else 70))
    return n * 0.55 * bright


def crash(dur=2.2):
    t = tt(dur)
    n = hp(noise(len(t)), 4500, 2) * np.exp(-t * 2.2)
    n += bp(noise(len(t)), 3000, 9000) * np.exp(-t * 6) * 0.4
    return n * 0.35


def rev_cymbal(dur=1.0):
    return crash(dur)[::-1] * np.linspace(0, 1, int(round(dur * SR))) ** 1.5


# ---------------------------------------------------------------- tonal
def epiano(m, dur, vel=1.0):
    """FM electric piano (warm, bell attack)."""
    t = tt(dur)
    f = mtof(m)
    idx = 1.6 * np.exp(-t * 4.5) + 0.25
    mod = np.sin(2 * np.pi * f * t) * idx
    x = np.sin(2 * np.pi * f * t + mod) * 0.8
    x += 0.18 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t * 9)  # tine
    env = (1 - np.exp(-t * 400)) * np.exp(-t * 1.25)
    x *= env * (1 + 0.08 * np.sin(2 * np.pi * 4.6 * t))  # gentle tremolo
    rel = min(len(t), int(0.08 * SR))
    x[-rel:] *= np.linspace(1, 0, rel)
    return x * vel


def pluck(m, dur=0.45, bright=1.0):
    """Additive pluck: harmonics decaying faster as they go up."""
    t = tt(dur)
    f = mtof(m)
    x = np.zeros(len(t))
    for h in range(1, 9):
        if f * h > SR / 2.2:
            break
        x += (1.0 / h ** 1.1) * np.sin(2 * np.pi * f * h * t + h) * np.exp(-t * (6 + h * 5 / bright))
    x *= 1 - np.exp(-t * 900)
    return x * 0.5


def saw(f, t, detune=0.0, fmax=6000.0):
    """Band-limited sawtooth (additive, harmonics up to fmax) — no aliasing."""
    f = f * (1 + detune)
    k_max = max(1, int(min(fmax, SR / 2.2) // f))
    x = np.zeros_like(t)
    for k in range(1, k_max + 1):
        x += np.sin(2 * np.pi * k * f * t) / k
    return x * (2 / np.pi)


def pad(midis, dur, attack=1.2, release=1.2, cutoff=1800, level=1.0):
    t = tt(dur)
    x = np.zeros(len(t))
    for m in midis:
        f = mtof(m)
        for d in (-0.006, 0.0, 0.0065):
            x += saw(f, t + _rng.uniform(0, 1), d)
    x = lp(x / (3 * len(midis)), cutoff, 2)
    env = np.minimum(1, t / attack) * np.minimum(1, (dur - t) / release)
    return x * np.clip(env, 0, 1) ** 1.5 * level


def sub(m, dur, level=1.0):
    t = tt(dur)
    f = mtof(m)
    x = np.sin(2 * np.pi * f * t) + 0.18 * np.sin(4 * np.pi * f * t)
    env = (1 - np.exp(-t * 300)) * np.exp(-t * 3.2)
    rel = min(len(t), int(0.03 * SR))
    x = x * env
    x[-rel:] *= np.linspace(1, 0, rel)
    return soft_clip(x * level, 1.3)


def bass(m, dur, level=1.0):
    """Round synth bass (filtered saw + sine)."""
    t = tt(dur)
    f = mtof(m)
    x = lp(saw(f, t) * 0.5, 420, 2) + np.sin(2 * np.pi * f * t) * 0.8
    env = adsr(len(t), 0.006, 0.18, 0.6, 0.05)
    return soft_clip(x * env * level, 1.4)


# ---------------------------------------------------------------- fx
def whoosh(dur=0.5, lo=400, hi=5000, peak=0.55, rise=2.0, pan=(-0.6, 0.6)):
    """Filtered-noise swoosh with a moving centre frequency and a pan sweep. Returns stereo."""
    n = int(round(dur * SR))
    t = np.arange(n) / n
    env = np.where(t < peak, (t / peak) ** rise, ((1 - t) / (1 - peak)) ** 1.6)
    x = noise(n)
    # three overlapping bands crossfaded over time = sweeping timbre
    a = bp(x, lo, lo * 3)
    b = bp(x, lo * 2, hi * 0.6)
    c = bp(x, hi * 0.4, hi)
    w = np.clip(t * 2, 0, 1)
    y = (a * (1 - w) + b * w * (1 - t) + c * t) * env
    p = pan[0] + (pan[1] - pan[0]) * t
    th = (p + 1) * np.pi / 4
    return np.stack([y * np.cos(th), y * np.sin(th)], 1) * 0.9


def riser(dur=3.0, f0=180, f1=1400, level=1.0):
    t = tt(dur)
    k = t / dur
    f = f0 * (f1 / f0) ** (k ** 1.6)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.35 + np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR) * 0.15
    nz = hp(noise(len(t)), 1500) * 0.5
    nz = nz * (0.2 + 0.8 * k)
    env = k ** 2.2
    return (tone + nz) * env * level


def impact(dur=1.4, level=1.0, low=58):
    t = tt(dur)
    f = 30 + (low * 2 - 30) * np.exp(-t * 14)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.4)
    burst = lp(noise(len(t)), 2400) * np.exp(-t * 22) * 0.6
    return soft_clip((boom + burst) * level, 1.5)


def pop(m=74, dur=0.09, level=1.0):
    t = tt(dur)
    f0 = mtof(m)
    f = f0 * (0.55 + 0.45 * (1 - np.exp(-t * 90)))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 55)
    x += hp(noise(len(t)), 3000) * np.exp(-t * 900) * 0.25
    return x * level


def click(level=1.0, tone=2300):
    t = tt(0.025)
    x = hp(noise(len(t)), 2500) * np.exp(-t * 900) * 0.7 + np.sin(2 * np.pi * tone * t) * np.exp(-t * 400) * 0.4
    return x * level


def bell(m, dur=1.6, level=1.0, ratio=3.5, index=2.2):
    t = tt(dur)
    f = mtof(m)
    mod = np.sin(2 * np.pi * f * ratio * t) * index * np.exp(-t * 3)
    x = np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 2.4) * (1 - np.exp(-t * 800))
    return x * level * 0.6


def notif(level=1.0):
    """Original two-note soft notification (D6 -> A6), not any OS/app sound."""
    a = bell(86, 0.35, 1.0, ratio=2.0, index=0.8)
    b = bell(93, 0.45, 0.9, ratio=2.0, index=0.8)
    x = np.zeros(int(0.55 * SR))
    x[: len(a)] += a
    i = int(0.085 * SR)
    x[i:i + len(b)] += b[: len(x) - i]
    return x * level


def buzz(level=1.0):
    t = tt(0.26)
    sq = np.sign(np.sin(2 * np.pi * 146 * t))
    gate = ((t < 0.09) | ((t > 0.13) & (t < 0.22))).astype(float)
    return lp(sq * gate, 1400) * 0.35 * level


def glitch(dur=0.12, level=1.0):
    n = int(dur * SR)
    hold = np.repeat(noise(n // 60 + 1), 60)[:n]
    sq = np.sign(np.sin(2 * np.pi * _rng.uniform(300, 900) * np.arange(n) / SR))
    x = (hold * 0.6 + sq * 0.3) * (np.arange(n) % 900 < 600)
    return bp(x, 300, 6000) * np.hanning(n) * level * 0.5


def thud(level=1.0, f=95):
    t = tt(0.22)
    x = np.sin(2 * np.pi * np.cumsum(f * (0.6 + 0.4 * np.exp(-t * 40))) / SR) * np.exp(-t * 20)
    x += lp(noise(len(t)), 1800) * np.exp(-t * 60) * 0.5
    return x * level


def sub_drop(dur=1.2, f0=110, f1=32, level=1.0):
    """808-style falling sine boom for drops (felt on phones through its harmonics)."""
    t = tt(dur)
    f = f1 + (f0 - f1) * np.exp(-t * 5.5)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR)
    x = soft_clip(x * 1.8, 2.2) * np.exp(-t * 2.4) * (1 - np.exp(-t * 600))
    return x * level


def shimmer(dur=1.6, level=1.0, notes=(84, 88, 91, 96, 100, 103), n=14, spread=0.35):
    """Sparkle: a cluster of short high FM bells scattered over `spread` s (pentatonic, seeded)."""
    x = np.zeros(int(round((dur + spread) * SR)))
    for k in range(n):
        m = notes[int(_rng.integers(0, len(notes)))]
        b = bell(m, dur * _rng.uniform(0.5, 1.0), _rng.uniform(0.4, 1.0), ratio=3.0, index=1.2)
        i = int(_rng.uniform(0, spread) ** 1.6 / spread ** 0.6 * SR)
        x[i:i + len(b)] += b[: len(x) - i]
    return hp(x, 1800) * level * 0.5


def noise_riser(dur=2.0, f0=600, f1=9000, level=1.0, gate=0.0):
    """White-noise riser: band-pass sweeping up, swelling in; optional 16th tremolo gate (0..1)."""
    n = int(round(dur * SR))
    k = np.arange(n) / n
    out = np.zeros(n)
    x = noise(n)
    block = 1024
    for i in range(0, n, block):
        fc = f0 * (f1 / f0) ** k[min(i + block // 2, n - 1)]
        out[i:i + block] = bp(x[max(0, i - 2048):i + block], fc * 0.6, fc * 1.6)[-min(block, n - i):]
    env = k ** 2.4
    if gate:
        g = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * (4 + 12 * k ** 2) * np.arange(n) / SR))
        env = env * (1 - gate + gate * g)
    return out * env * level


def downlifter(dur=1.0, level=1.0):
    """Falling filtered noise + pitch: the release after a hit / into a breakdown."""
    t = tt(dur)
    k = t / dur
    tone = np.sin(2 * np.pi * np.cumsum(900 * (0.12 / 0.9) ** k) / SR) * 0.3
    nz = lp(noise(len(t)), 5000) * 0.6
    return (tone + nz) * (1 - k) ** 2.2 * (1 - np.exp(-t * 300)) * level


def stab(midis, dur=0.28, level=1.0, bright=1.0):
    """Short chord stab (house piano/organ-ish): detuned saws, fast filter decay."""
    t = tt(dur)
    x = np.zeros(len(t))
    for m in midis:
        f = mtof(m)
        x += saw(f, t, 0.0, 5000) + saw(f, t, 0.004, 5000) * 0.7
    x /= max(1, len(midis))
    y = np.zeros_like(x)
    # decaying low-pass sweep, block-wise
    for i in range(0, len(x), 512):
        fc = 600 + 5200 * bright * np.exp(-(i / SR) * 14)
        y[i:i + 512] = lp(x[max(0, i - 1024):i + 512], fc)[-min(512, len(x) - i):]
    env = (1 - np.exp(-t * 900)) * np.exp(-t * 9)
    return y * env * level


def shaker(level=1.0):
    t = tt(0.07)
    return bp(noise(len(t)), 5000, 11000) * (1 - np.exp(-t * 400)) * np.exp(-t * 55) * 0.5 * level


def tom(m=45, dur=0.32, level=1.0):
    t = tt(dur)
    f0 = mtof(m)
    f = f0 * (1 + 0.6 * np.exp(-t * 30))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11)
    x += bp(noise(len(t)), 300, 3000) * np.exp(-t * 60) * 0.3
    return soft_clip(x * level, 1.3)


def reverb_ir(rt60=1.8, dur=2.4, predelay=0.012):
    n = int(dur * SR)
    t = np.arange(n) / SR
    decay = np.exp(-6.91 * t / rt60)
    ir = np.stack([lp(noise(n), 7000) * decay, lp(noise(n), 7000) * decay], 1)
    pd = int(predelay * SR)
    ir = np.concatenate([np.zeros((pd, 2)), ir])[:n]
    ir /= np.sqrt(np.sum(ir ** 2, 0, keepdims=True))
    return ir


def convolve_stereo(x, ir):
    out = np.zeros((len(x) + len(ir) - 1, 2))
    for c in range(2):
        out[:, c] = signal.fftconvolve(x[:, c], ir[:, c])
    return out[: len(x)]

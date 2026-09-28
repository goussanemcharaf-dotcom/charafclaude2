"""Build the ad's soundtrack: original music + SFX + VO mix, mastered for Meta.

Everything is synthesized (utils/audio/synth.py) and placed on the same
timeline as the picture (config/timeline.json + the scene constants mirrored
below). Output:
  audio/music/music_stem.wav      music bus after ducking (mix level)
  audio/sfx/sfx_stem.wav          SFX bus (mix level)
  audio/master_mix.wav            final stereo master, -14 LUFS, <= -1 dBTP
  qa/audio_report.txt, qa/audio_spectrogram.png
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
from scipy import signal

sys.path.insert(0, str(Path(__file__).resolve().parent))
import synth as S  # noqa: E402
from loudness import integrated_lufs, true_peak_db, tp_limit  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
SR = S.SR
TL = json.loads((ROOT / "config/timeline.json").read_text())
DUR = TL["duration"]
N = int(round(DUR * SR))
C = TL["cues"]
W = TL["words"]


def word(pid, prefix):
    return next(w["start"] for w in W if w["phrase"] == pid and w["w"].lower().startswith(prefix.lower()))


def phrase(pid):
    return next(p for p in TL["phrases"] if p["id"] == pid)


# ---- picture events (mirrors the constants in src/scenes/*.tsx) ----------
NON = C["non"]                       # hard silence starts here
SWELL = 15.35                        # soft pad under "Ton travail mérite…"
GRID_B = 17.62                       # 96 BPM "after" grid (bar = 2.5 s)
LINK_FIRST = TL["scenes"]["s08_ten_links"][0] + 0.04
LINK_STEP = (C["dix_liens"] - 0.1 - LINK_FIRST) / 9
MERGE = C["un_seul"] - 0.02
SEND = word(14, "lien") + 0.34
CUT_LINKS = TL["scenes"]["s08_ten_links"][0]


def zeros():
    return np.zeros((N, 2))


def place(buf, x, at, gain=1.0, pan=0.0):
    """Mix mono or stereo x into buf at time `at` (s)."""
    if x.ndim == 1:
        th = (np.clip(pan, -1, 1) + 1) * np.pi / 4
        x = np.stack([x * np.cos(th), x * np.sin(th)], 1)
    i = int(round(at * SR))
    if i >= N:
        return
    if i < 0:
        x, i = x[-i:], 0
    j = min(N, i + len(x))
    buf[i:j] += x[: j - i] * gain


# ======================================================================= MUSIC
def music():
    m = zeros()     # tonal bus (filterable)
    d = zeros()     # drum bus
    # ---------------- PART A: the messy "before" (120 BPM, D minor) ----------
    chords_a = [(0, "Dm"), (2, "Bb"), (4, "Gm"), (6, "A"), (8, "Dm"), (10, "Bb"), (12, "Gm"), (14, "A")]
    root = {"Dm": 38, "Bb": 34, "Gm": 31, "A": 33}
    arp = {"Dm": [62, 65, 69, 72, 74, 72, 69, 65], "Bb": [62, 65, 70, 74, 77, 74, 70, 65],
           "Gm": [62, 67, 70, 74, 79, 74, 70, 67], "A": [61, 64, 69, 73, 76, 73, 69, 64]}
    for bi, (b0, ch) in enumerate(chords_a):
        b1 = chords_a[bi + 1][0] if bi + 1 < len(chords_a) else NON
        # pumping sub on 8ths
        k = 0
        tt_ = b0
        while tt_ < min(b1, NON):
            lvl = 0.42 if tt_ < 5.4 else 0.52 if tt_ < 8.3 else 0.6
            place(m, S.sub(root[ch], 0.23, 1.0), tt_, lvl)
            tt_ += 0.25
            k += 1
        # plucked 16th arpeggio
        tt_, k = b0, 0
        while tt_ < min(b1, NON):
            note = arp[ch][k % 8]
            lvl = 0.16 if tt_ < 5.4 else 0.19 if tt_ < 8.3 else 0.22
            place(m, S.pluck(note, 0.3), tt_, lvl * (1.0 if k % 4 == 0 else 0.75), pan=0.25 * np.sin(k * 1.3))
            if tt_ >= 8.3:
                place(m, S.pluck(note + 12, 0.22, 1.4), tt_ + 0.0625, 0.07, pan=-0.3)
            tt_ += 0.125
            k += 1
    # hook hit + rhythm section
    place(d, S.kick(0.6, 170, 40, 5.5), 0.0, 0.95)
    place(d, S.impact(1.6, 0.9), 0.0, 0.5)
    place(d, S.crash(2.0), 0.0, 0.35)
    t = 5.5
    while t < NON - 0.01:
        place(d, S.kick(), t, 0.72 if t < 8.3 else 0.8)
        if t >= 11.2 and t < 13.9:
            place(d, S.kick(0.3, 130, 50, 12), t + 0.18, 0.35)  # heartbeat double
        t += 0.5
    for b in np.arange(8.0, 14.0, 2.0):
        for off in (0.5, 1.5):
            place(d, S.clap(), b + off, 0.42, pan=0.05)
    t = 5.5
    while t < NON - 0.01:
        step = 0.25 if t < 8.3 else 0.125
        acc = 1.0 if abs((t * 4) % 2) < 1e-6 else 0.6
        place(d, S.hat(), t, 0.16 * acc, pan=0.35)
        if t >= 11.2 and abs((t - 0.25) % 0.5) < 1e-6:
            place(d, S.hat(open_=True), t, 0.12, pan=-0.3)
        t += step
    # snare roll accelerating into the wall
    t, dt = 13.0, 0.125
    while t < NON - 0.03:
        v = 0.15 + 0.5 * (t - 13.0) / (NON - 13.0)
        place(d, S.snare(0.12, 200, 1.1), t, v, pan=0.1)
        t += dt
        dt = max(0.035, dt * 0.93)
    place(m, S.riser(NON - 11.0, 160, 1500, 1.0), 11.0, 0.34)
    place(d, S.impact(1.3, 0.8), 5.43, 0.32)
    place(d, S.crash(1.6), 5.5, 0.22)
    place(d, S.crash(1.4), 8.3, 0.2)
    # hard stop — the wall of sound ends exactly on "Non."
    iN = int(NON * SR)
    for bus in (m, d):
        fade = int(0.004 * SR)
        bus[iN - fade:iN] *= np.linspace(1, 0, fade)[:, None]
        bus[iN:] = 0.0

    # ---------------- PART B: the premium "after" (96 BPM, D dorian -> F) ------
    bar = 2.5
    chords_b = [
        (GRID_B + 0 * bar, [50, 53, 57, 60, 64], 38),   # Dm9
        (GRID_B + 1 * bar, [46, 53, 57, 60, 62], 34),   # Bbmaj9
        (GRID_B + 2 * bar, [53, 57, 60, 64], 41),       # Fmaj7
        (GRID_B + 3 * bar, [48, 52, 57, 62, 67], 36),   # C6/9
        (GRID_B + 4 * bar, [50, 53, 57, 60, 64], 38),   # Dm9
        (GRID_B + 5 * bar, [46, 53, 57, 60, 62], 34),   # Bbmaj9
        (GRID_B + 6 * bar, [53, 57, 60, 64], 41),       # Fmaj7
        (GRID_B + 7 * bar, [53, 57, 60, 64, 67], 41),   # Fmaj9 (resolve on "commence")
    ]
    END = DUR
    # swell under "Ton travail mérite une meilleure présentation."
    place(m, S.pad([53, 57, 60, 64, 67], GRID_B - SWELL + 0.5, attack=1.7, release=0.5, cutoff=1300), SWELL, 0.55)
    place(d, S.rev_cymbal(1.0), GRID_B - 1.0, 0.28)
    for i, (b0, notes, r) in enumerate(chords_b):
        last = i == len(chords_b) - 1
        dur = (END - b0) if last else bar + 0.6
        place(m, S.pad(notes, dur, attack=0.35, release=0.6 if not last else 1.6, cutoff=2200), b0, 0.42)
        # e-piano comping: beat 1 and the "and" of 2
        for off, vel in ((0.0, 0.5), (0.9375, 0.33)) if not last else ((0.0, 0.55),):
            for n_ in notes[1:]:
                place(m, S.epiano(n_ + 12, 1.6 if not last else 2.4, vel / len(notes) * 2.2), b0 + off, 1.0, pan=0.12 * (n_ % 3 - 1))
        # sparkle arps (8ths) — lighter once the groove is in
        if b0 < END - 0.5 and not last:
            for k in range(8):
                note = notes[(k * 2) % len(notes)] + 24
                place(m, S.pluck(note, 0.35, 1.6), b0 + k * 0.3125, 0.09 if b0 < GRID_B + bar else 0.055, pan=0.4 * np.sin(k * 1.7))
        # bass from the drop
        if b0 >= GRID_B + bar - 0.01:
            pat = ((0.0, 0.6, 0), (0.9375, 0.28, 12), (1.25, 0.5, 0), (2.1875, 0.25, 7)) if not last else ((0.0, 1.8, 0),)
            for off, ln, iv in pat:
                place(m, S.bass(r + iv, ln, 1.0), b0 + off, 0.34)
    # drums: soft pulse during the star, full groove from the drop
    place(d, S.kick(0.6, 120, 42, 6, 0.1, 1.2), GRID_B, 0.5)
    place(d, S.kick(0.6, 120, 42, 6, 0.1, 1.2), GRID_B + bar, 0.0)
    t = GRID_B + bar
    last_bar = GRID_B + 7 * bar
    while t < last_bar - 0.01:
        in_filter = CUT_LINKS <= t < MERGE
        place(d, S.kick(0.5, 140, 44, 7.5, 0.15), t, 0.78 if not in_filter else 0.5)
        place(d, S.kick(0.4, 130, 46, 9, 0.1), t + 0.9375, 0.5 if not in_filter else 0.3)
        if not in_filter:
            place(d, S.clap(), t + 1.25, 0.4, pan=-0.05)
            place(d, S.snare(0.2, 190, 0.7), t + 1.25, 0.2)
            for k in range(8):
                sw = 0.035 if k % 2 else 0.0
                place(d, S.hat(0.05, bright=0.9), t + k * 0.3125 + sw, 0.12 if k % 2 == 0 else 0.08, pan=0.3)
            place(d, S.hat(open_=True), t + 2.1875, 0.07, pan=-0.35)
        t += bar
    place(d, S.crash(2.2), GRID_B + bar, 0.3)
    place(d, S.impact(1.4, 0.7), GRID_B + bar, 0.22)
    place(d, S.crash(2.0), MERGE, 0.26)
    place(d, S.kick(0.8, 150, 38, 4.5, 0.2), last_bar, 0.75)
    place(d, S.crash(2.4), last_bar, 0.28)

    # "filter-down" during the ten links, opening on "seul"
    m = automate_lowpass(m, [(0, 20000), (CUT_LINKS - 0.01, 20000), (CUT_LINKS + 0.12, 380), (MERGE - 0.05, 520), (MERGE + 0.25, 20000), (DUR, 20000)])
    d_f = automate_lowpass(d, [(0, 20000), (CUT_LINKS - 0.01, 20000), (CUT_LINKS + 0.08, 600), (MERGE - 0.05, 700), (MERGE + 0.2, 20000), (DUR, 20000)])
    return m, d_f


def automate_lowpass(x, points, block=256):
    """Block-wise 2nd-order low-pass with a time-varying cutoff (Hz, log-interpolated)."""
    ts = np.array([p[0] for p in points])
    fs = np.log(np.array([p[1] for p in points]))
    out = np.zeros_like(x)
    zi = np.zeros((1, 2, 2))
    for i in range(0, len(x), block):
        f = float(np.exp(np.interp((i + block / 2) / SR, ts, fs)))
        if f >= 19000:
            out[i:i + block] = x[i:i + block]
            zi = np.zeros((1, 2, 2))
            continue
        sos = signal.butter(2, f, "lowpass", fs=SR, output="sos")
        for c in range(2):
            y, z = signal.sosfilt(sos, x[i:i + block, c], zi=zi[:, :, c] if zi.shape[2] == 2 else None)
            out[i:i + block, c] = y
            zi[:, :, c] = z
    return out


# ========================================================================= SFX
def sfx():
    s = zeros()
    wo = S.whoosh
    # S01 identification
    for i, (k, m_) in enumerate([("ugc", 74), ("content", 77), ("voice", 81), ("influenceur", 86)]):
        place(s, S.pop(m_, 0.1, 1.0), C[k] - 0.1, 0.55, pan=[0.0, -0.4, 0.4, 0.0][i])
    place(s, wo(0.5, 300, 4000, 0.75, 2.2, (0.5, -0.5)), 4.54, 0.5)       # spin-out
    place(s, wo(0.45, 500, 6000, 0.45, 1.5, (-0.2, 0.2)), 5.34, 0.55)     # bars split
    # S02 workflow
    place(s, wo(0.5, 250, 3000, 0.4, 1.4, (-0.8, 0.0)), 5.8, 0.35)        # file browser slides in
    for tt_, pan in ((C["drive"] - 0.04, -0.4), (C["whatsapp"] - 0.04, 0.4), (C["liens"] - 0.02, 0.0)):
        place(s, S.pop(79, 0.09, 1.0), tt_, 0.4, pan)
    place(s, wo(0.45, 300, 3500, 0.5, 1.6, (0.6, 0.3)), C["whatsapp"] - 0.36, 0.38)  # phone rises
    chat = C["whatsapp"] - 0.22
    place(s, S.notif(0.8), chat, 0.28, 0.4)
    for tt_ in (chat + 0.28, chat + 0.52, C["liens"] - 0.2):
        place(s, S.pop(88, 0.07, 0.8), tt_, 0.22, 0.45)
    for i in range(3):
        at = C["liens"] - 0.14 + i * 0.11
        place(s, S.thud(1.0, 110 - i * 8), at + 0.18, 0.4, -0.3)
        place(s, wo(0.22, 600, 5000, 0.8, 1.2, (-0.8, -0.2)), at - 0.04, 0.22)
    place(s, wo(0.3, 500, 5000, 0.3, 1.2, (0.0, 0.2)), 8.22, 0.25)        # headline leaves
    # S03 chaos: slams accelerate
    slams = [C["video"] - 0.06, C["fichier"] - 0.06, C["autre_lien"] - 0.06, 8.98, 9.62, 9.9, 10.5, 10.68, 10.84, 11.0]
    for i, at in enumerate(slams):
        pan = [-0.5, 0.5, -0.3, 0.6, 0.6, 0.3, -0.5, -0.6, 0.5, -0.2][i]
        place(s, wo(0.2, 700, 6000, 0.85, 1.1, (pan * 1.5, pan)), at - 0.1, 0.28)
        place(s, S.thud(1.0, 120 - i * 4), at + 0.1, 0.5 if i < 3 else 0.36, pan)
    for at in (C["video"] + 0.04, C["fichier"] + 0.04, C["autre_lien"] + 0.04):
        place(s, S.pop(72, 0.12, 1.0), at, 0.42)
        place(s, S.thud(1.0, 75), at + 0.03, 0.4)
    for at in (8.78, 10.34):
        place(s, S.notif(1.0), at, 0.32, 0.3)
    for at in (9.2, 10.02, 10.92):
        place(s, S.glitch(0.1, 1.0), at, 0.22, np.sign(at - 10) * 0.4)
    # S04 confusion
    place(s, wo(0.5, 200, 2000, 0.5, 1.5, (-0.9, -0.5)), 11.2, 0.32)      # client peeks in
    t_ch = word(8, "chercher")
    place(s, S.click(1.0), t_ch, 0.55, 0.2)
    place(s, S.buzz(1.0), t_ch + 0.06, 0.5, 0.0)
    t_pa = word(8, "partout")
    for k in range(8):
        place(s, S.click(0.8, 2600 + k * 180), t_pa + k * 0.1, 0.3, 0.6 - k * 0.12)
    for at in (12.2, 12.36, 12.52, 12.68, 12.86):
        place(s, wo(0.14, 900, 7000, 0.6, 1.0, (0.3, -0.3)), at - 0.1, 0.18)
    place(s, S.pop(69, 0.14, 1.0), C["qui"] - 0.04, 0.55, -0.2)
    place(s, S.pop(72, 0.14, 1.0), C["que_tu_fais"] - 0.04, 0.55, 0.1)
    # silence window: nothing may ring into "Non."
    iN = int(NON * SR)
    fade = int(0.004 * SR)
    s[iN - fade:iN] *= np.linspace(1, 0, fade)[:, None]
    s[iN:int((SWELL + 0.3) * SR)] = 0.0
    # S06 reveal
    place(s, wo(1.0, 150, 2500, 0.97, 2.6, (-0.3, 0.3)), GRID_B - 1.0, 0.3)   # reverse swell into the star
    place(s, S.bell(98, 1.4, 1.0, 3.0, 1.2), word(11, "premium") - 0.02, 0.18, 0.3)
    place(s, wo(0.55, 200, 4500, 0.7, 1.8, (0.0, 0.0)), 19.85, 0.5)       # star fills / swallows the frame
    place(s, wo(0.55, 250, 3500, 0.35, 1.3, (0.0, 0.0)), 20.22, 0.35)     # browser rises
    for at in (20.48, 20.56, 20.68, 20.84, 21.02):
        place(s, S.click(0.7, 3200), at, 0.22, 0.2)
    # S07 organised
    place(s, wo(0.5, 300, 3000, 0.5, 1.4, (0.0, 0.0)), 21.44, 0.22)
    for at in (C["projets"] - 0.04, C["services"] - 0.04, C["style"] - 0.04):
        place(s, S.pop(84, 0.09, 1.0), at, 0.34, 0.0)
    for at in (21.98, 22.7, 23.48):
        place(s, wo(0.34, 700, 5000, 0.45, 1.3, (0.1, -0.1)), at, 0.16)
    zoom_at = word(12, "réunis") - 0.04
    place(s, wo(0.85, 180, 2600, 0.55, 1.6, (-0.2, 0.2)), zoom_at, 0.3)
    for k in range(5):
        place(s, S.click(0.7, 2800 + k * 150), 24.9 + k * 0.08, 0.2, -0.5 + k * 0.25)
    place(s, S.bell(91, 1.2, 1.0, 2.0, 0.6), C["experience"] - 0.05, 0.16)
    place(s, wo(0.28, 600, 7000, 0.85, 1.2, (0.4, -0.9)), 25.92, 0.4)     # whip out
    # S08 ten links / S09 one link
    place(s, S.impact(0.9, 0.9, 70), CUT_LINKS, 0.36)
    for i in range(10):
        at = LINK_FIRST + i * LINK_STEP
        place(s, S.thud(1.0, 100 + i * 6), at + 0.12, 0.38, (-1) ** i * 0.4)
        place(s, S.click(0.8, 2000 + i * 160), at + 0.12, 0.28, 0.0)      # counter ticks up
    place(s, wo(0.4, 400, 4000, 0.6, 1.5, (-0.4, 0.4)), word(14, "tu") - 0.04, 0.3)
    place(s, wo(0.3, 3000, 9000, 0.9, 2.5, (0.3, 0.0)), word(14, "un") - 0.1, 0.3)
    place(s, S.impact(1.4, 0.9, 64), MERGE, 0.48)
    place(s, S.bell(84, 1.8, 1.0, 3.5, 1.8), MERGE + 0.02, 0.3)
    place(s, S.bell(91, 1.8, 1.0, 3.5, 1.5), MERGE + 0.1, 0.22)
    place(s, S.pop(86, 0.08, 1.0), SEND - 0.2, 0.3)
    place(s, S.click(1.0, 2400), SEND, 0.45)
    place(s, wo(0.4, 500, 7000, 0.7, 1.8, (0.0, 0.0)), SEND + 0.1, 0.45)  # link is sent
    # S10 client
    place(s, wo(0.6, 200, 3000, 0.4, 1.4, (0.0, 0.0)), 29.3, 0.36)       # phone rises
    for at in (29.56, 29.66):
        place(s, S.pop(90, 0.07, 0.9), at, 0.2, 0.3)
    place(s, S.click(1.0, 1900), C["clique"] - 0.02, 0.55)
    place(s, wo(0.5, 400, 4500, 0.5, 1.5, (0.0, 0.0)), C["clique"] + 0.08, 0.3)
    place(s, wo(0.8, 500, 3000, 0.5, 1.3, (0.1, -0.1)), C["decouvre"] - 0.04, 0.12)
    # S11 statement
    place(s, wo(0.5, 200, 5000, 0.8, 2.0, (0.0, 0.0)), 31.18, 0.5)        # zoom-through
    for at, m_ in ((C["professionnel"], 77), (C["clair"], 81), (C["different"], 84)):
        place(s, S.pop(m_, 0.12, 1.0), at - 0.03, 0.45, -0.3)
        place(s, S.thud(1.0, 90), at, 0.3, -0.3)
    # S12 CTA
    place(s, wo(0.45, 250, 5000, 0.85, 2.2, (0.0, 0.0)), 33.52, 0.5)      # star wipe
    for i, at in enumerate((33.99, 34.13, 34.27, 34.41)):
        place(s, S.thud(1.0, 105 - i * 6), at + 0.06, 0.5 + 0.08 * i, -0.2)
        place(s, wo(0.16, 900, 8000, 0.9, 1.0, (-0.8, 0.0)), at - 0.1, 0.2)
    place(s, S.bell(86, 1.6, 1.0, 3.5, 1.4), 34.43, 0.22, 0.2)
    place(s, wo(0.4, 300, 3500, 0.5, 1.5, (0.0, 0.0)), 33.8, 0.25)        # composer rises
    cta = [w for w in W if w["phrase"] == 17]
    for i, w in enumerate(cta):
        a = w["start"]
        b = cta[i + 1]["start"] if i + 1 < len(cta) else a + 0.45
        ln = len(w["w"])
        span = max(0.12, (b - a) * 0.7)
        for k in range(ln):
            place(s, S.click(0.35 + 0.2 * S.rng().random(), 3400 + S.rng().integers(-400, 400)), a + span * k / ln, 0.16, 0.15)
    tap = cta[-1]["end"] + 0.2
    place(s, S.click(1.0, 2000), tap, 0.45)
    place(s, S.bell(89, 2.2, 1.0, 3.5, 1.6), tap + 0.02, 0.3)
    place(s, S.bell(96, 2.2, 1.0, 3.5, 1.2), tap + 0.12, 0.2)
    return s


# ========================================================================= MIX
def load_vo():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(ROOT / "audio/voiceover/vo_final.wav"), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    v = np.frombuffer(raw, np.float32).astype(np.float64)
    v = np.pad(v, (0, max(0, N - len(v))))[:N]
    v = vo_eq(v)
    return np.stack([v, v], 1)  # centred (same signal in both channels)


def peaking(f0, gain_db, q):
    """RBJ peaking-EQ biquad as SOS."""
    a = 10 ** (gain_db / 40)
    w = 2 * np.pi * f0 / SR
    al = np.sin(w) / (2 * q)
    b = [1 + al * a, -2 * np.cos(w), 1 - al * a]
    aa = [1 + al / a, -2 * np.cos(w), 1 - al / a]
    return np.array([[b[0] / aa[0], b[1] / aa[0], b[2] / aa[0], 1.0, aa[1] / aa[0], aa[2] / aa[0]]])


def vo_eq(v):
    """Clean the codec's high-band fill + 13.1 kHz tone, add a little presence for phone speakers."""
    v = signal.sosfilt(signal.butter(2, 75, "highpass", fs=SR, output="sos"), v)
    b, a = signal.iirnotch(13095, 12, fs=SR)
    v = signal.filtfilt(b, a, v)
    v = signal.sosfiltfilt(signal.butter(8, 11000, "lowpass", fs=SR, output="sos"), v)
    v = signal.sosfilt(peaking(3200, 2.0, 1.0), v)
    return v


def duck_env(vo, att=0.012, rel=0.28, depth_db=7.0):
    x = np.abs(vo[:, 0])
    win = int(0.02 * SR)
    rms = np.sqrt(np.convolve(x ** 2, np.ones(win) / win, mode="same"))
    target = np.clip(rms / (np.percentile(rms[rms > 1e-4], 70) + 1e-9), 0, 1)
    a_att, a_rel = np.exp(-1 / (att * SR)), np.exp(-1 / (rel * SR))
    env = signal.lfilter([1 - a_rel], [1, -a_rel], target)  # smooth
    env = np.maximum(env, signal.lfilter([1 - a_att], [1, -a_att], target))
    env = np.clip(env, 0, 1)
    return 10 ** (-depth_db * env / 20)


def write_wav(path, x, bits=24):
    path.parent.mkdir(parents=True, exist_ok=True)
    codec = "pcm_s24le" if bits == 24 else "pcm_s16le"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", codec, str(path)],
                   input=x.astype(np.float32).tobytes(), check=True)


def main():
    vo = load_vo()
    mus_t, mus_d = music()
    ir = S.reverb_ir(1.7, 2.2)
    mus = mus_t + 0.9 * mus_d
    mus = mus + 0.16 * S.convolve_stereo(mus_t, ir)
    # phone-speaker friendly low end: remove sub-rumble, tame the lows a little
    mus = signal.sosfilt(signal.butter(2, 34, "highpass", fs=SR, output="sos"), mus, axis=0)
    low = signal.sosfilt(signal.butter(2, 110, "lowpass", fs=SR, output="sos"), mus, axis=0)
    mus = mus - 0.3 * low
    fx = sfx()
    fx = fx + 0.12 * S.convolve_stereo(fx, S.reverb_ir(1.1, 1.6))
    # keep the "Non." silence absolute after reverb tails
    iN, iS = int(NON * SR), int((SWELL) * SR)
    fade = int(0.004 * SR)
    for bus in (mus, fx):
        bus[iN - fade:iN] *= np.linspace(1, 0, fade)[:, None]
        bus[iN:iS] = 0.0

    lv = integrated_lufs(vo)
    lm = integrated_lufs(mus)
    lf = integrated_lufs(fx)
    mus *= 10 ** (((lv - 6.5) - lm) / 20)   # music sits ~6.5 LU under the voice before ducking
    fx *= 10 ** (((lv - 9.5) - lf) / 20)    # SFX ~9.5 LU under the voice
    duck = duck_env(vo)[:, None]
    mus_d = mus * duck
    mix = vo + mus_d + fx

    lmix = integrated_lufs(mix)
    g = 10 ** ((-14.0 - lmix) / 20)
    master = tp_limit(mix * g, ceiling_db=-1.3)
    # final trim so the limiter's gain reduction doesn't pull us under target
    for _ in range(3):
        lm2 = integrated_lufs(master)
        master = tp_limit(master * 10 ** ((-14.0 - lm2) / 20), ceiling_db=-1.3)
    tp = true_peak_db(master)

    write_wav(ROOT / "audio/music/music_stem.wav", mus_d * g)
    write_wav(ROOT / "audio/sfx/sfx_stem.wav", fx * g)
    write_wav(ROOT / "audio/master_mix.wav", master)

    report = [
        f"duration            {DUR:.3f} s",
        f"VO (solo)           {lv:6.2f} LUFS",
        f"music under VO      {integrated_lufs(mus_d):6.2f} LUFS (pre-master), ducking depth 7 dB",
        f"SFX                 {integrated_lufs(fx):6.2f} LUFS (pre-master)",
        f"master integrated   {integrated_lufs(master):6.2f} LUFS (target -14.0)",
        f"master true peak    {tp:6.2f} dBTP (ceiling -1.0)",
        f"silence at 'Non.'   max |x| {np.max(np.abs((mus_d + fx)[iN:iS])):.2e} in music+SFX from {NON:.2f}s to {SWELL:.2f}s",
    ]
    (ROOT / "qa").mkdir(exist_ok=True)
    (ROOT / "qa/audio_report.txt").write_text("\n".join(report) + "\n")
    print("\n".join(report))


if __name__ == "__main__":
    main()

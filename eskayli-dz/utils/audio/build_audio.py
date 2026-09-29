"""ESKAYLI DZ — original score, sound design and final mix (voice first), mastered for Meta.

Every sound is synthesized here (numpy/scipy; oscillators, noise, filters — the repository's
utils/audio/synth.py toolkit): no samples, no library loops, no third-party sounds.
Every event sits on the voice's own timeline (config/timeline.json) or on the picture constants
mirrored below from src/scenes/*.tsx.

The score, 100 BPM, E minor → E major, grows with the story:
  PULSE      0 – 7 s       low pulse, data ticks, a filtered E-minor pad; the question hangs, then a pause
  PROBLEM    7.9 – 16 s    a half-time kick and muted bass push the naive workflow… which breaks:
                           the music tape-stops with it
  STRATEGY   16.8 – 30 s   the new system locks in (five locks) and the groove is born on its grid
  ESKAYLI    30 – 35 s     riser, impact, the sonic logo (a rising fifth, E → B) as the signal
                           lands in the wordmark; claps join
  SYSTEM     35 – 47.5 s   full groove, 16th arpeggio; whips, picks, typing, launch, tests, the loop,
                           then FACEBOOK / INSTAGRAM / ADS on stabs
  SILENCE    « L'objectif ? » — absolute silence, then a short riser
  CONVERSION 49.7 – 64.9 s the fullest groove; one refined impact per stage (attention, prospect,
                           conversation, client); a filter dip for « vues », the funnel dive
                           (four hops), then « opportunités commerciales » at full height; hard cut
  BRAND      65 – 79.6 s   the sonic logo in full on « Eskayli DZ », an E-major arpeggio on the four
                           words, the organised system returns on a soft groove, then one chord
                           resolves under « Parlons de votre projet. »

Outputs:
  music/music_stem.flac       music bus after ducking, at mix level (24-bit FLAC)
  sfx/sfx_stem.flac           SFX bus, at mix level (24-bit FLAC)
  renders/_work/master_mix.wav   stereo master, -14 LUFS integrated, <= -1 dBTP
  qa/audio_report.txt
"""
import json
import subprocess
import sys
import unicodedata
from pathlib import Path

import numpy as np
from scipy import signal

ROOT = Path(__file__).resolve().parents[2]            # eskayli-dz/
REPO = ROOT.parent
sys.path.insert(0, str(REPO / "utils/audio"))
import synth as S  # noqa: E402
from loudness import integrated_lufs, true_peak_db, tp_limit  # noqa: E402

SR = S.SR
TL = json.loads((ROOT / "config/timeline.json").read_text())
DUR = TL["duration"]
N = int(round(DUR * SR))
WORDS = TL["words"]
PH = {p["id"]: p for p in TL["phrases"]}
RNG = np.random.default_rng(20260929)


def _norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    return "".join(c for c in s if (c.isalnum() or c == "&") and not unicodedata.combining(c))


def at(pid, prefix, nth=0):
    ws = [w for w in WORDS if w["phrase"] == pid and _norm(w["w"]).startswith(_norm(prefix))]
    return ws[nth]["start"]


# ---- picture events (mirror src/scenes/*.tsx) -------------------------------------------------------
HOOK_OUT = at(2, "mais") - 0.25
Q_CLIENTS = at(2, "clients")
P3 = PH[3]["start"]                              # « Lancer… »
BREAK_AT = at(3, "publier") + 0.55               # the naive chain cracks
AVANT = at(4, "avant")
LOCKS = [AVANT + 0.05 + i * 0.36 for i in range(5)]
DIVE = at(4, "comprendre")
BUSINESS = at(4, "business")
SAT_ON = [at(5, "offre"), at(6, "marché"), at(7, "client"), at(8, "besoins"), at(8, "frustrations"), at(8, "motivations")]
CHEZ, ESKAYLI = at(9, "chez"), at(9, "eskayli")
DOT_LAND = ESKAYLI + 0.2
STRATEGIE9 = at(9, "stratégie")
AUTOUR, BUSINESS9 = at(9, "autour"), at(9, "business")
NOUS10, ANGLE = at(10, "nous"), at(10, "angle")
LE11, MESSAGE = at(11, "le"), at(11, "message")
LA12, CREATIVE = at(12, "la"), at(12, "créative")
LE13 = at(13, "le")
WHIPS = [(ANGLE + 0.45, LE11), (MESSAGE + 0.62, LA12 + 0.02), (CREATIVE + 0.66, LE13)]
PUIS, LANCONS, TESTONS, OPTIMISONS = at(14, "puis"), at(14, "lançons"), at(14, "testons"), at(14, "optimisons")
CAMPAGNES, FACEBOOK, INSTAGRAM, ADS = at(14, "campagnes"), at(14, "facebook"), at(14, "instagram"), at(14, "ads")
OBJECTIF = at(15, "l’objectif")
SILENCE_A = OBJECTIF - 0.42                      # the music stops one beat before « L'objectif ? »
SILENCE_B = PH[15]["end"] + 0.05
TRANSFORMER = at(16, "transformer")
STAGES = [at(17, "attention"), at(18, "prospects"), at(19, "conversations"), at(20, "clients")]
P20_END = PH[20]["end"]
PARCE, VUES = at(21, "parce"), at(21, "vues")
FLY0 = PH[21]["end"] + 0.04
HOPS = [FLY0 + i * 0.42 for i in range(4)]
LAND = FLY0 + 4 * 0.42
OPPORT, COMMERC = at(22, "opportunités"), at(22, "commerciales")
IDEA_OUT = PH[23]["start"] - 0.3                 # hard cut to the brand frame
ESK_C10 = at(23, "eskayli")
FOUR = [at(24, "meta"), at(25, "stratégie"), at(26, "création"), at(27, "performance")]
VOUS28 = at(28, "vous")
SYSTEM_BACK = VOUS28 - 0.35
BUSINESS28 = at(28, "business")
PARLONS, PROJET = at(29, "parlons"), at(29, "projet")
FINAL_AT = PARLONS - 0.3

BEAT = 0.6                                       # 100 BPM
BAR = 4 * BEAT

# E minor: Em9 – Cmaj9 – G6 – D(add9); E major for the brand: Emaj9 – C#m9 – Amaj9 – B6
MINOR = [(40, [52, 55, 59, 62, 66]), (36, [48, 52, 55, 59, 62]), (43, [55, 59, 62, 64, 67]), (38, [50, 54, 57, 62, 64])]
MAJOR = [(40, [52, 56, 59, 63, 66]), (37, [49, 52, 56, 59, 63]), (45, [45 + 12, 49 + 12, 52 + 12, 56 + 12, 59 + 12]), (47, [51, 54, 56, 59, 63])]


# ---- buffers -------------------------------------------------------------------------------------------
def zeros():
    return np.zeros((N, 2))


def place(buf, x, t, gain=1.0, pan=0.0):
    if x.ndim == 1:
        th = (np.clip(pan, -1, 1) + 1) * np.pi / 4
        x = np.stack([x * np.cos(th), x * np.sin(th)], 1)
    i = int(round(t * SR))
    if i >= N or gain == 0:
        return
    if i < 0:
        x, i = x[-i:], 0
    j = min(N, i + len(x))
    buf[i:j] += x[: j - i] * gain


def gate(buf, a, b, fade=0.004):
    """Absolute silence on [a, b) with tiny fades."""
    ia, ib, f = int(a * SR), min(N, int(b * SR)), int(fade * SR)
    buf[max(0, ia - f):ia] *= np.linspace(1, 0, min(f, ia))[:, None]
    buf[ia:ib] = 0.0
    if ib < N:
        k = min(f, N - ib)
        buf[ib:ib + k] *= np.linspace(0, 1, k)[:, None]


def tape_stop(buf, t, dur=0.42):
    """The music winds down like a stopped machine: playback speed 1 → 0 over `dur`."""
    i = int(t * SR)
    n = int(dur * SR)
    tau = np.arange(n) / SR
    pos = (tau - tau ** 2 / (2 * dur)) * SR          # ∫ speed, speed = 1 - τ/dur
    src = buf[i:i + n].copy()
    for c in range(2):
        buf[i:i + n, c] = np.interp(pos, np.arange(n), src[:, c]) * (1 - tau / dur) ** 0.6
    buf[i + n:] *= 0.0  # caller re-fills later sections


def automate_lowpass(x, points, block=256):
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
            y, z = signal.sosfilt(sos, x[i:i + block, c], zi=zi[:, :, c])
            out[i:i + block, c] = y
            zi[:, :, c] = z
    return out


# ---- signature sounds ------------------------------------------------------------------------------------
def logo(level=1.0, gap=0.25, full=True, voice_in=None):
    """The ESKAYLI sonic logo: two clean tones a rising fifth apart (E5 → B5), a soft low body and air.
    `voice_in` (local time, s): where the next word starts — the tail steps down 9 dB under it."""
    n = int((gap + 2.6) * SR)
    x = np.zeros((n, 2))
    place_local(x, S.bell(76, 1.8, 1.0, ratio=2.0, index=0.9), 0.0, 0.9, -0.12)
    place_local(x, S.bell(88, 1.2, 1.0, ratio=2.0, index=0.5), 0.0, 0.3, -0.12)     # octave sheen
    place_local(x, S.bell(83, 2.2, 1.0, ratio=2.0, index=1.1), gap, 1.0, 0.12)
    place_local(x, S.bell(95, 1.4, 1.0, ratio=2.0, index=0.6), gap, 0.3, 0.12)
    if full:
        body = S.sub(40, 1.6, 0.9) * 0.5                        # E2 body, felt on phones through its harmonic
        place_local(x, body, 0.0, 0.6)
        place_local(x, S.shimmer(1.4, 1.0, notes=(88, 95, 100, 107), n=10, spread=0.3), gap + 0.02, 0.35)
    if voice_in is not None:
        tt = np.arange(n) / SR
        x *= np.interp(tt, [voice_in - 0.12, voice_in + 0.06], [1.0, 10 ** (-9 / 20)])[:, None]
    return x * level


def place_local(buf, x, t, gain=1.0, pan=0.0):
    if x.ndim == 1:
        th = (np.clip(pan, -1, 1) + 1) * np.pi / 4
        x = np.stack([x * np.cos(th), x * np.sin(th)], 1)
    i = int(round(t * SR))
    j = min(len(buf), i + len(x))
    buf[i:j] += x[: j - i] * gain


def data_stream(dur, rate=26.0, lo=1700, hi=4200, level=1.0, rise=0.0):
    """Data moving: a sparse stream of tiny sine blips, random pitch and pan (optionally rising)."""
    n = int(dur * SR)
    x = np.zeros((n, 2))
    k = 0.0
    while k < dur:
        u = k / dur
        f = RNG.uniform(lo, hi) * (1 + rise * u)
        m = int(0.009 * SR)
        tt = np.arange(m) / SR
        blip = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 420) * (1 - np.exp(-tt * 5000))
        place_local(x, blip, k, RNG.uniform(0.35, 1.0) * (0.55 + 0.45 * u), RNG.uniform(-0.7, 0.7))
        k += RNG.exponential(1 / rate)
    return x * level * 0.5


def faded(x, fade=0.03):
    """Mono → stereo with a short fade-out (for risers that do not end on a hit)."""
    x = x.copy()
    k = int(fade * SR)
    x[-k:] *= np.linspace(1, 0, k)
    return np.stack([x, x], 1)


def tick(level=1.0, tone=2600):
    return S.click(level, tone)


def lock(level=1.0, m=79):
    """A precise lock: a short pitched pop, a click and a small low body."""
    t = S.tt(0.12)
    body = np.sin(2 * np.pi * 150 * t) * np.exp(-t * 60) * 0.5
    x = np.zeros(len(t))
    p = S.pop(m, 0.09, 0.8)
    x[: len(p)] += p
    c = S.click(0.7, 3200)
    x[: len(c)] += c
    return (x + body) * level


def select(level=1.0, m=88):
    x = S.pop(m, 0.09, 0.9)
    c = S.click(0.6, 4200)
    x[: len(c)] += c
    return x * level


def refined_impact(level=1.0, low=48, bright=0.5):
    """Low, short and clean: a pitched body, a filtered burst and a high transient."""
    x = S.impact(1.1, 1.0, low) * 0.8
    t = S.tt(0.05)
    x[: len(t)] += S.hp(S.noise(len(t)), 5000) * np.exp(-t * 180) * bright * 0.6
    return x * level


def keys_typing(dur, rate=13.0, level=1.0):
    n = int(dur * SR)
    x = np.zeros((n, 2))
    k = 0.0
    while k < dur:
        m = int(0.012 * SR)
        tt = np.arange(m) / SR
        c = S.bp(S.noise(m), 2500, 7000) * np.exp(-tt * 700) * 0.5 + np.sin(2 * np.pi * 1900 * tt) * np.exp(-tt * 900) * 0.2
        place_local(x, c, k, RNG.uniform(0.5, 1.0), RNG.uniform(-0.2, 0.2))
        k += RNG.uniform(0.6, 1.4) / rate
    return x * level


def swish(dur=0.35, level=1.0, lo=1200, hi=9000):
    """A short marker swipe (message strike)."""
    n = int(dur * SR)
    k = np.arange(n) / n
    x = S.noise(n)
    y = np.zeros(n)
    for i in range(0, n, 512):
        fc = lo * (hi / lo) ** k[min(n - 1, i + 256)]
        y[i:i + 512] = S.bp(x[max(0, i - 1024):i + 512], fc * 0.7, fc * 1.4)[-min(512, n - i):]
    return y * np.sin(np.pi * k) ** 1.5 * level * 0.7


# ======================================================================= MUSIC
def grid(t0, t1):
    """Beat times (and their index) on the 100 BPM grid anchored at t0, up to t1."""
    k = 0
    while t0 + k * BEAT < t1 - 1e-6:
        yield k, t0 + k * BEAT
        k += 1


def pad_chord(buf, midis, t, dur, cutoff, level, attack=0.5, release=0.9):
    place(buf, S.pad(midis, dur + release * 0.5, attack=attack, release=release, cutoff=cutoff, level=1.0), t, level)


def music():
    ton, drm = zeros(), zeros()   # tonal and drum buses
    kicks = []

    # --- PULSE (0 → pause after « clients ? ») -----------------------------------------------------------
    pulse_end = PH[2]["end"] - 0.05
    pad_chord(ton, [40, 47, 52, 55, 59], 0.0, pulse_end + 0.3, 650, 1.1, attack=0.25, release=0.6)
    for k, t in grid(0.0, pulse_end):
        place(drm, S.sub(40, 0.42, 0.8), t, 0.7 if k % 2 == 0 else 0.45)            # low pulse on each beat
        for h in (0, 0.5):                                                               # data ticks on 8ths
            place(drm, tick(0.28, 2300 if (k + h) % 2 else 3100), t + h * BEAT, 0.5, 0.25 if h else -0.25)
    # the question hangs: a suspended dyad on « clients », then the pause
    place(ton, S.bell(76, 1.8, 0.5, ratio=2.0, index=0.6) + S.bell(78, 1.8, 0.35, ratio=2.0, index=0.6), Q_CLIENTS, 0.5)
    place(ton, S.rev_cymbal(1.1)[:, None].repeat(2, 1) * 0.5, Q_CLIENTS - 1.1, 0.35)

    # --- PROBLEM (« Lancer… » → break) -------------------------------------------------------------------
    for k, t in grid(P3, BREAK_AT + 0.5):
        bar, b = divmod(k, 4)
        root, chord = MINOR[0] if bar % 2 == 0 else MINOR[1]
        if b == 0:
            pad_chord(ton, chord, t, BAR, 700 + 180 * bar, 0.55)
        if bar < 2:
            if b in (0, 2):
                place(drm, S.kick(0.45, 120, 44, 8, 0.12, 1.3), t, 0.75); kicks.append((t, 0.6))
        else:
            place(drm, S.kick(0.45, 130, 44, 8, 0.15, 1.4), t, 0.8); kicks.append((t, 0.8))
        for e in range(2):                                                               # muted bass, 8ths
            m = root if e == 0 or b % 2 == 0 else root + 12
            place(ton, S.lp(S.bass(m, 0.2, 0.9), 520), t + e * BEAT / 2, 0.55)
        for s16 in range(4):
            place(drm, S.hat(0.04, False, 0.6), t + s16 * BEAT / 4, 0.18 if s16 % 2 else 0.1, 0.3)
    # the old workflow breaks: the music tape-stops with it
    tape_stop(ton, BREAK_AT, 0.42)
    tape_stop(drm, BREAK_AT, 0.42)

    # --- STRATEGY → ESKAYLI → SYSTEM (one grid from « Avant ») ----------------------------------------------
    for k, t in grid(AVANT, SILENCE_A):
        bar, b = divmod(k, 4)
        root, chord = MINOR[bar % 4]
        system = t >= NOUS10 - 0.35
        eskayli = t >= CHEZ - 0.05
        testing = t >= PUIS - 0.35
        if b == 0:
            pad_chord(ton, chord, t, BAR, 1500 if not system else 2400, 0.55 if not system else 0.5)
        # kick: 4/4 from the first lock, softer before « business »
        kv = 0.55 if t < BUSINESS else 0.8 if not eskayli else 0.9
        place(drm, S.kick(0.45, 140, 45, 7.5, 0.18, 1.5), t, kv); kicks.append((t, kv))
        # bass: 8ths, octave on the off-beat
        for e in range(2):
            m = root if e == 0 else root + 12 if (b % 2 == 1 and eskayli) else root
            place(ton, S.lp(S.bass(m, 0.24, 1.0), 700 if not system else 1100), t + e * BEAT / 2, 0.6 if not system else 0.7)
        # hats: 8ths → 16ths in the system
        steps = 4 if system else 2
        for s in range(steps):
            place(drm, S.hat(0.045, False, 0.8), t + s * BEAT / steps, (0.16 if s % 2 else 0.09) * (1.2 if testing else 1.0), 0.28)
        if eskayli and b in (1, 3):
            place(drm, S.clap(), t, 0.5, 0.0)
        if testing and b in (1, 3):
            place(drm, S.hat(0, True, 0.7), t + BEAT / 2, 0.12, -0.2)
        # pluck arpeggio: quarter notes from « business », 16ths in the system
        if t >= BUSINESS:
            arp = [chord[1] + 12, chord[2] + 12, chord[3] + 12, chord[4] + 12]
            if system:
                for s in range(4):
                    place(ton, S.pluck(arp[(b * 4 + s) % 4], 0.3, 1.1), t + s * BEAT / 4, 0.32, 0.35 if s % 2 else -0.35)
            else:
                place(ton, S.pluck(arp[b], 0.5, 0.9), t, 0.3, 0.2)
    # lift into « Chez Eskayli DZ »
    place(ton, S.noise_riser(1.6, 500, 7000, 0.5)[:, None].repeat(2, 1), CHEZ - 1.6, 0.6)
    # stabs on the placements
    for t_, m_ in ((FACEBOOK, MINOR[2][1]), (INSTAGRAM, MINOR[3][1]), (ADS, MINOR[0][1])):
        place(ton, S.stab([n + 12 for n in m_[:4]], 0.34, 1.0, 1.1), t_, 0.35)

    # --- CONVERSION (« Transformer » → hard cut) ------------------------------------------------------------
    place(ton, S.noise_riser(TRANSFORMER - SILENCE_B, 400, 6000, 0.55)[:, None].repeat(2, 1), SILENCE_B, 0.55)
    for k, t in grid(TRANSFORMER, IDEA_OUT):
        bar, b = divmod(k, 4)
        root, chord = MINOR[bar % 4]
        dip = PARCE - 0.2 <= t < FLY0                      # « vues »: filtered, lighter
        dive = FLY0 <= t < OPPORT - 0.05                  # the funnel dive: drums out, roll builds
        if b == 0 and not dive:
            pad_chord(ton, chord, t, BAR, 2600, 0.5)
        if not dive:
            kv = 1.0 if not dip else 0.75
            place(drm, S.kick(0.5, 150, 44, 7, 0.2, 1.6), t, kv); kicks.append((t, kv))
            for e in range(2):
                m = root if e == 0 else root + 12
                place(ton, S.lp(S.bass(m, 0.24, 1.0), 1300), t + e * BEAT / 2, 0.75)
            for s in range(4):
                place(drm, S.hat(0.045, False, 0.9), t + s * BEAT / 4, 0.17 if s % 2 else 0.1, 0.28)
            if not dip:
                if b in (1, 3):
                    place(drm, S.clap(), t, 0.55)
                place(drm, S.hat(0, True, 0.8), t + BEAT / 2, 0.13, -0.2)
                if b in (0, 2):  # syncopated chord stabs: the strongest rhythmic point
                    place(ton, S.stab([n + 12 for n in chord[:4]], 0.26, 0.9, 1.0), t + (0 if b == 0 else 0.75 * BEAT), 0.22)
            arp = [chord[1] + 12, chord[2] + 12, chord[3] + 12, chord[4] + 12]
            for s in range(4):
                place(ton, S.pluck(arp[(b * 4 + s) % 4] + (12 if not dip else 0), 0.28, 1.2), t + s * BEAT / 4, 0.26, 0.35 if s % 2 else -0.35)
    # « vues »: a riser into the word; then the dive: a building snare roll into CLIENT
    place(ton, S.riser(VUES - (PARCE + 1.2), 200, 900, 0.5)[:, None].repeat(2, 1), PARCE + 1.2, 0.35)
    roll_t, roll_end = FLY0, LAND
    while roll_t < roll_end:
        u = (roll_t - FLY0) / (roll_end - FLY0)
        place(drm, S.snare(0.14, 190, 0.9), roll_t, 0.12 + 0.3 * u ** 1.5, 0.0)
        roll_t += BEAT / 4 if u < 0.5 else BEAT / 8
    place(ton, S.noise_riser(LAND - FLY0, 700, 9000, 0.55, gate=0.4)[:, None].repeat(2, 1), FLY0, 0.5)
    place(ton, S.sub_drop(1.2, 110, 36, 0.8), OPPORT, 0.6)

    # --- BRAND (no drums: logo, the four words, then the organised system, then resolve) -------------------
    emaj = MAJOR[0][1]
    pad_chord(ton, emaj, ESK_C10, SYSTEM_BACK - ESK_C10, 1600, 0.55, attack=0.8, release=1.0)
    for t_, m_ in zip(FOUR, (64, 68, 71, 76)):                     # E major arpeggio on the four words
        place(ton, S.epiano(m_, 1.6, 0.9), t_ - 0.08, 0.36, -0.1)  # with the word's visual entrance
        place(ton, S.epiano(m_ - 12, 1.2, 0.6), t_ - 0.08, 0.2, 0.1)
    for k, t in grid(SYSTEM_BACK, FINAL_AT):
        bar, b = divmod(k, 4)
        root, chord = MAJOR[bar % 4]
        if b == 0:
            pad_chord(ton, chord, t, BAR, 2000, 0.45)
        kv = 0.55 + 0.25 * min(1, k / 8)
        place(drm, S.kick(0.45, 135, 45, 8, 0.12, 1.3), t, kv); kicks.append((t, kv))
        place(ton, S.lp(S.bass(root, 0.3, 0.9), 800), t, 0.55)
        place(ton, S.lp(S.bass(root, 0.2, 0.9), 800), t + BEAT / 2, 0.35)
        for s in range(2):
            place(drm, S.hat(0.045, False, 0.7), t + s * BEAT / 2, 0.12 if s else 0.07, 0.28)
        if b in (1, 3):
            place(drm, S.clap(), t, 0.3)
        place(ton, S.pluck(chord[(b + 2) % 5] + 12, 0.5, 0.9), t + BEAT / 2, 0.22, 0.25)
    # final: one chord resolves under « Parlons de votre projet. »
    pad_chord(ton, [40, 52, 56, 59, 63, 66, 71], FINAL_AT, DUR - FINAL_AT, 2200, 0.7, attack=0.25, release=2.0)
    place(ton, S.sub(40, 2.2, 0.8), FINAL_AT, 0.5)
    place(ton, S.epiano(76, 2.5, 0.8), FINAL_AT, 0.35)

    # section silences (after tails): the pause after the question, the break, « L'objectif ? », the hard cut
    for bus in (ton, drm):
        gate(bus, PH[2]["end"] + 0.35, P3 - 0.02, fade=0.12)
        gate(bus, BREAK_AT + 0.42, AVANT - 0.01)
        gate(bus, SILENCE_A, SILENCE_B)
        gate(bus, IDEA_OUT, ESK_C10 - 0.01)
    return ton, drm, kicks


# ========================================================================= SFX
def sfx():
    s = zeros()
    wo = S.whoosh
    # 01 hook: the first frame lands, the budget starts to flow
    place(s, refined_impact(0.9, 46, 0.7), 0.0, 0.8)
    place(s, data_stream(2.5, 30, 1600, 3600, 0.9, rise=0.4), 0.55, 0.45)
    place(s, wo(1.2, 300, 3000, 0.7, 1.6, (-0.3, 0.3)), 1.2, 0.35)                     # macro → wide
    for w_ in (at(1, "publicité"), at(1, "facebook"), at(1, "instagram")):
        place(s, S.thud(0.6, 120), w_, 0.35)
    # 02 question: the flow nodes, the empty destination, the ladder
    place(s, wo(0.5, 500, 5000, 0.4, 1.5, (-0.4, 0.4)), HOOK_OUT - 0.15, 0.3)
    for i, w_ in enumerate((at(2, "votre"), at(2, "vous"), at(2, "apporte"))):
        place(s, S.pop(79 + 3 * i, 0.09, 0.8), w_, 0.4)
    for i in range(3):
        place(s, tick(0.6, 2900 + 200 * i), at(2, "vraiment") + 0.05 + i * 0.12, 0.45)
    # 03 problem: « META ADS », the naive rows (bright plastic clicks), the cursor, the break
    place(s, S.thud(0.8, 100), at(3, "meta"), 0.5)
    place(s, wo(0.4, 700, 6000, 0.4, 1.5, (0.3, -0.3)), P3 - 0.3, 0.25)
    for w_ in (at(3, "créer"), at(3, "choisir"), at(3, "appuyer"), at(3, "publier") + 0.35):
        place(s, S.pop(91, 0.07, 1.0), w_, 0.45)
        place(s, tick(0.5, 4200), w_ + 0.01, 0.3)
    place(s, S.click(1.0, 3000), at(3, "publier") - 0.05, 0.6)                          # the « Publier » click
    place(s, S.glitch(0.2, 1.0), BREAK_AT, 0.6)
    place(s, S.thud(1.0, 70), BREAK_AT + 0.02, 0.8)
    place(s, S.downlifter(0.8, 1.0)[:, None].repeat(2, 1), BREAK_AT + 0.05, 0.35)
    for i, t_ in enumerate(LOCKS):                                                       # the new system locks in
        place(s, lock(1.0, 76 + [0, 2, 4, 7, 9][i]), t_, 0.55, (i - 2) * 0.12)
    place(s, wo(0.9, 250, 4500, 0.6, 2.0, (0.0, 0.0)), DIVE - 0.35, 0.45)                # the dive into COMPRENDRE
    # 04 business: the core, the six satellites appear, then light on their words (signal zips out)
    place(s, refined_impact(0.6, 55, 0.3), BUSINESS, 0.45)
    for i in range(6):
        place(s, tick(0.35, 2400 + 150 * i), BUSINESS + 0.1 + i * 0.07, 0.3, (i - 2.5) * 0.15)
    for i, t_ in enumerate(SAT_ON):
        place(s, data_stream(0.4, 45, 2200, 4600, 1.0, rise=0.6), t_ - 0.15, 0.35)
        place(s, lock(0.8, 83 + [0, 2, 4, 7, 9, 12][i]), t_ + 0.24, 0.35, [-0.5, 0.5, 0.6, 0.5, -0.5, -0.6][i])
    place(s, wo(0.45, 600, 5000, 0.35, 1.4, (0.0, 0.0)), SAT_ON[2] + 0.2, 0.2)          # the client profile opens
    # 05 Eskayli: snap to grid, the signal flies into the i-dot, the logo, the strategy links
    for i in range(6):
        place(s, lock(0.7, 79 + i), CHEZ + 0.1 + i * 0.03, 0.25, (i % 2 - 0.5) * 0.6)
    place(s, data_stream(0.45, 60, 2500, 5200, 1.0, rise=0.8), CHEZ + 0.1, 0.4)
    place(s, refined_impact(0.9, 44, 0.4), CHEZ, 0.55)
    place(s, lock(0.6, 95), DOT_LAND, 0.3)                                               # the signal lands in the i-dot
    place(s, S.thud(0.5, 110), STRATEGIE9, 0.3)
    place(s, data_stream(BUSINESS9 + 0.3 - AUTOUR, 34, 1800, 4000, 0.8), AUTOUR - 0.1, 0.3)
    # 06 system: the angle pick, the whips, the strike + typing, the creative pick, the targeting filters
    for i in range(4):
        place(s, S.pop(84 + 2 * i, 0.08, 0.7), NOUS10 + 0.1 + i * 0.12, 0.25, (i - 1.5) * 0.3)
    place(s, select(1.0, 91), ANGLE - 0.05, 0.5)
    for a_, b_ in WHIPS:
        place(s, wo(b_ - a_ + 0.2, 500, 7000, 0.55, 1.4, (0.25, -0.25)), a_ - 0.08, 0.3)
    place(s, swish(0.32, 1.0), LE11 + 0.12, 0.25)
    place(s, keys_typing(0.7, 14, 0.8), LE11 + 0.36, 0.28)
    for i in range(3):
        place(s, S.pop(86 + 2 * i, 0.08, 0.7), LA12 - 0.1 + i * 0.12, 0.25, (i - 1) * 0.4)
    place(s, select(1.0, 93), CREATIVE - 0.05, 0.5)
    for i in range(4):
        place(s, lock(0.6, 84 + [0, 3, 5, 7][i]), LE13 + 0.15 + i * 0.22, 0.3, (i - 1.5) * 0.25)
    place(s, S.shimmer(0.9, 1.0, notes=(91, 95, 98, 103), n=8, spread=0.5), LE13 + 0.3, 0.18)
    # 07 testing: the switch and the launch, the tests, stop / keep, the loop, relaunch, the placements
    place(s, S.click(1.0, 1800), LANCONS, 0.7)
    place(s, lock(1.0, 88), LANCONS + 0.02, 0.5)
    place(s, wo(0.8, 300, 7000, 0.35, 1.6, (-0.2, 0.2)), LANCONS + 0.02, 0.45)
    place(s, refined_impact(0.8, 50, 0.5), LANCONS + 0.03, 0.5)
    for i in range(3):
        place(s, tick(0.6, 3000 + 250 * i), TESTONS - 0.05 + i * 0.1, 0.4, (i - 1) * 0.3)
    for i in range(2):
        place(s, S.thud(0.5, 160 - 20 * i), OPTIMISONS + 0.02 + i * 0.07, 0.35, 0.3)
    place(s, select(1.0, 95), OPTIMISONS + 0.02, 0.45, -0.2)
    place(s, data_stream(0.62, 40, 2000, 4500, 0.9, rise=0.5), OPTIMISONS + 0.45, 0.35)
    for i in range(4):
        place(s, tick(0.6, 3200 + 300 * i), OPTIMISONS + 0.45 + i * 0.155, 0.35, [0, 0.4, 0, -0.4][i])
    place(s, wo(0.5, 800, 6000, 0.6, 1.4, (0.3, -0.3)), CAMPAGNES - 0.2, 0.35)
    for t_, lv in ((FACEBOOK, 0.55), (INSTAGRAM, 0.55), (ADS, 0.7)):
        place(s, refined_impact(lv, 52, 0.45), t_, 0.55)
    # 08 outcome: « L'objectif ? » is silent. Then one event per stage.
    s_att, s_pro, s_con, s_cli = STAGES
    place(s, S.thud(0.5, 120), TRANSFORMER, 0.3)
    for i, t_ in enumerate(STAGES):
        place(s, refined_impact(0.75 + 0.1 * i, 50 - 2 * i, 0.25), t_ - 0.05, 0.55 + 0.05 * i)
    for i, d in enumerate((0.0, 0.08, 0.2)):                                             # the feed stops on the ad
        place(s, tick(0.7 - 0.15 * i, 2600), s_att - 0.15 + d, 0.4)
    place(s, S.notif(0.9), s_pro - 0.32, 0.25)                                            # a new inquiry (before the word)
    place(s, S.pop(84, 0.1, 0.9), s_con + 0.05, 0.4, -0.3)                                # the two messages
    place(s, S.pop(88, 0.1, 0.9), s_con + 0.5, 0.4, 0.3)
    place(s, logo(0.7, 0.14, full=False, voice_in=0.4), s_cli - 0.4, 0.35)                # « Commande confirmée » (before the word)
    place(s, wo(0.5, 400, 4000, 0.5, 1.5, (0.0, 0.0)), s_con - 0.25, 0.25)
    place(s, wo(0.5, 400, 4000, 0.5, 1.5, (0.0, 0.0)), s_cli - 0.25, 0.25)
    place(s, faded(S.riser(0.6, 400, 1600, 0.8)), P20_END - 0.05, 0.3)                     # one flow: the pulse runs
    place(s, S.shimmer(1.0, 1.0), P20_END + 0.5, 0.25)
    # 09 big idea: the views curve, « VUES. », the dive (four hops), CLIENT, the opportunities
    place(s, data_stream(VUES + 0.35 - PARCE, 24, 1500, 3200, 0.8, rise=0.9), PARCE + 0.1, 0.3)
    place(s, refined_impact(0.8, 46, 0.6), VUES, 0.55)
    for i, h in enumerate(HOPS):
        place(s, wo(0.42, 400 + 150 * i, 6000 + 800 * i, 0.72, 1.8, (-0.1, 0.1)), h - 0.05, 0.5)
        place(s, S.pop(79 + [0, 2, 4, 7][i], 0.09, 0.7), h + 0.3, 0.3)
    place(s, refined_impact(0.9, 48, 0.7), LAND, 0.6)
    for i in range(4):
        place(s, S.pop(84 + [0, 2, 4, 7][i], 0.08, 0.7), OPPORT + 0.14 + i * 0.14, 0.3, [-0.4, 0.4, -0.4, 0.4][i])
    place(s, refined_impact(1.0, 44, 0.6), COMMERC, 0.6)
    for i in range(4):
        place(s, tick(0.5, 3000 + 250 * i), COMMERC + 0.05 + i * 0.12, 0.3)
    # 10 brand: the full logo on « Eskayli DZ » (the second tone lands with the i-dot), the four words,
    # the system returns, the route, CLIENTS, the final screen
    # the first tone pre-laps the hard cut, the second lands on it (the i-dot pops), then the voice says the name
    place(s, logo(1.0, 0.25, full=True, voice_in=ESK_C10 - (IDEA_OUT - 0.25)), IDEA_OUT - 0.25, 0.75)
    for t_ in FOUR:
        place(s, tick(0.4, 2200), t_ - 0.06, 0.25)
    place(s, wo(0.6, 300, 5000, 0.6, 1.6, (0.0, 0.0)), SYSTEM_BACK - 0.35, 0.4)
    for i in range(6):
        place(s, tick(0.4, 2500 + 120 * i), SYSTEM_BACK + 0.1 + i * 0.08, 0.3, (i % 3 - 1) * 0.5)
    place(s, data_stream(BUSINESS28 - VOUS28, 22, 1700, 3600, 0.8, rise=0.5), VOUS28, 0.3)
    for u in (0.18, 0.36, 0.64, 0.82):
        place(s, tick(0.6, 3100), VOUS28 + u * (BUSINESS28 - VOUS28), 0.3)
    place(s, refined_impact(0.7, 46, 0.4), BUSINESS28, 0.45)                             # CLIENTS lights
    place(s, refined_impact(0.6, 42, 0.2), FINAL_AT, 0.4)
    place(s, logo(0.6, 0.25, full=False), PH[29]["end"] + 0.05, 0.45)                     # after « projet »
    # the silence is absolute
    gate(s, SILENCE_A, SILENCE_B)
    return s


# ========================================================================= MIX
def load_vo():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(ROOT / "voice/vo_final.wav"), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    v = np.frombuffer(raw, np.float32).astype(np.float64)
    v = np.pad(v, (0, max(0, N - len(v))))[:N]
    v = vo_comp(vo_eq(v))
    return np.stack([v, v], 1)


def peaking(f0, gain_db, q):
    a = 10 ** (gain_db / 40)
    w = 2 * np.pi * f0 / SR
    al = np.sin(w) / (2 * q)
    b = [1 + al * a, -2 * np.cos(w), 1 - al * a]
    aa = [1 + al / a, -2 * np.cos(w), 1 - al / a]
    return np.array([[b[0] / aa[0], b[1] / aa[0], b[2] / aa[0], 1.0, aa[1] / aa[0], aa[2] / aa[0]]])


def vo_eq(v):
    """High-pass, a touch of chest control and presence for phone speakers."""
    v = signal.sosfilt(signal.butter(2, 70, "highpass", fs=SR, output="sos"), v)
    v = signal.sosfilt(peaking(250, -1.5, 1.0), v)
    v = signal.sosfilt(peaking(3200, 2.0, 1.0), v)
    return v


def compress(x, thr_db, ratio, attack=0.003, release=0.08, knee=6.0, window=0.005):
    w = max(1, int(window * SR))
    lvl = 10 * np.log10(np.convolve(x ** 2, np.ones(w) / w, mode="same") + 1e-12)
    over = lvl - thr_db
    gr = np.where(over <= -knee / 2, 0.0,
                  np.where(over >= knee / 2, over * (1 - 1 / ratio), (1 - 1 / ratio) * (over + knee / 2) ** 2 / (2 * knee)))
    a_att, a_rel = np.exp(-1 / (attack * SR)), np.exp(-1 / (release * SR))
    g = signal.lfilter([1 - a_rel], [1, -a_rel], gr)
    g = np.maximum(g, signal.lfilter([1 - a_att], [1, -a_att], gr))
    return x * 10 ** (-g / 20)


def vo_comp(v):
    speech = v[np.abs(v) > 1e-4]
    ref = 10 * np.log10(np.mean(speech ** 2) + 1e-12) if len(speech) else -30
    return compress(v, ref + 2.0, 2.6, attack=0.004, release=0.09)


def duck_env(vo, att=0.012, rel=0.3):
    x = np.abs(vo[:, 0])
    win = int(0.02 * SR)
    rms = np.sqrt(np.convolve(x ** 2, np.ones(win) / win, mode="same"))
    target = np.clip(rms / (np.percentile(rms[rms > 1e-4], 70) + 1e-9), 0, 1)
    a_att, a_rel = np.exp(-1 / (att * SR)), np.exp(-1 / (rel * SR))
    env = signal.lfilter([1 - a_rel], [1, -a_rel], target)
    env = np.maximum(env, signal.lfilter([1 - a_att], [1, -a_att], target))
    return np.clip(env, 0, 1)


def spectral_duck(bus, env, low_db=3.0, mid_db=9.0, high_db=4.0):
    low = signal.sosfiltfilt(signal.butter(2, 220, "lowpass", fs=SR, output="sos"), bus, axis=0)
    high = signal.sosfiltfilt(signal.butter(2, 5200, "highpass", fs=SR, output="sos"), bus, axis=0)
    mid = bus - low - high
    g = lambda db: 10 ** (-db * env / 20)[:, None]
    return low * g(low_db) + mid * g(mid_db) + high * g(high_db)


def sidechain(kicks, depth_db=4.0, attack=0.004, release=0.16):
    duck = np.zeros(N)
    na, nr = int(attack * SR), int(release * SR)
    shape = np.concatenate([np.linspace(0, 1, na, endpoint=False), (1 - np.linspace(0, 1, nr)) ** 2])
    for t, s in kicks:
        i = int(round(t * SR))
        if 0 <= i < N:
            seg = shape[: N - i] * min(1.0, s)
            duck[i:i + len(seg)] = np.maximum(duck[i:i + len(seg)], seg)
    return 10 ** (-depth_db * duck / 20)


def write_audio(path, x):
    """24-bit WAV, or 24-bit FLAC for the committed stems."""
    path.parent.mkdir(parents=True, exist_ok=True)
    codec = ["-c:a", "flac", "-sample_fmt", "s32", "-bits_per_raw_sample", "24"] if path.suffix == ".flac" else ["-c:a", "pcm_s24le"]
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", *codec, str(path)],
                   input=x.astype(np.float32).tobytes(), check=True)


def main():
    vo = load_vo()
    ton, drm, kicks = music()
    sc = sidechain(kicks)[:, None]
    ir = S.reverb_ir(1.8, 2.4)
    drm = drm / (np.max(np.abs(drm)) + 1e-9) * 0.8
    ton = ton / (np.max(np.abs(ton)) + 1e-9) * 0.8
    mus = ton * sc + 0.85 * drm + 0.16 * S.convolve_stereo(ton, ir)
    mus = automate_lowpass(mus, [(0, 19500), (PARCE - 0.3, 19500), (PARCE + 0.4, 1400), (VUES - 0.2, 2600), (FLY0, 19500), (DUR, 19500)])
    mus = signal.sosfilt(signal.butter(2, 32, "highpass", fs=SR, output="sos"), mus, axis=0)
    fx = sfx()
    fx = fx + 0.14 * S.convolve_stereo(fx, S.reverb_ir(1.2, 1.8))
    for bus in (mus, fx):                     # reverb tails must not leak into the silences
        gate(bus, SILENCE_A, SILENCE_B)
    gate(mus, IDEA_OUT, ESK_C10 - 0.01)

    lv = integrated_lufs(vo)
    mus *= 10 ** (((lv - 5.0) - integrated_lufs(mus)) / 20)   # music ~5 LU under the voice before ducking
    fx *= 10 ** (((lv - 8.5) - integrated_lufs(fx)) / 20)     # SFX ~8.5 LU under the voice
    env = duck_env(vo)
    mus_d = spectral_duck(mus, env)
    fx_d = spectral_duck(fx, env, 1.0, 4.0, 2.0)
    for bus in (mus_d, fx_d):                 # the zero-phase band split rings into the silences: gate again
        gate(bus, SILENCE_A, SILENCE_B)
    mix = vo + mus_d + fx_d

    g = 10 ** ((-14.0 - integrated_lufs(mix)) / 20)
    master = tp_limit(mix * g, ceiling_db=-1.3)
    for _ in range(3):
        master = tp_limit(master * 10 ** ((-14.0 - integrated_lufs(master)) / 20), ceiling_db=-1.3)
    fade = int(0.6 * SR)
    master[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 0.7
    tp = true_peak_db(master)

    write_audio(ROOT / "music/music_stem.flac", mus_d * g)
    write_audio(ROOT / "sfx/sfx_stem.flac", fx_d * g)
    write_audio(ROOT / "renders/_work/master_mix.wav", master)

    sil = np.max(np.abs((mus_d + fx_d)[int(SILENCE_A * SR):int(SILENCE_B * SR)]))
    report = [
        "ESKAYLI DZ — audio report",
        f"duration            {DUR:.3f} s, 48 kHz / 24-bit stereo",
        "tempo / key         100 BPM; E minor (Em9 – Cmaj9 – G6 – Dadd9) → E major for the brand (Emaj9 – C#m9 – Amaj9 – B6)",
        f"VO (solo)           {lv:6.2f} LUFS (HPF 70 Hz, -1.5 dB @250 Hz, +2 dB @3.2 kHz, 2.6:1)",
        f"music under VO      {integrated_lufs(mus_d):6.2f} LUFS pre-master (5 LU under the voice, then band ducking 3 / 9 / 4 dB)",
        f"SFX                 {integrated_lufs(fx_d):6.2f} LUFS pre-master (8.5 LU under the voice, light band ducking)",
        f"master integrated   {integrated_lufs(master):6.2f} LUFS (target -14.0)",
        f"master true peak    {tp:6.2f} dBTP (ceiling -1.0)",
        f"« L'objectif ? »    music + SFX max |x| {sil:.1e} from {SILENCE_A:.2f} to {SILENCE_B:.2f} s (absolute silence)",
        f"sonic logo          E5 → B5 at {IDEA_OUT - 0.25:.2f} / {IDEA_OUT:.2f} s (second tone on the hard cut, before « Eskayli DZ »), "
        f"{STAGES[3] - 0.4:.2f} s (order confirmed, soft), {PH[29]['end'] + 0.05:.2f} s (after « projet », soft)",
    ]
    (ROOT / "qa").mkdir(exist_ok=True)
    (ROOT / "qa/audio_report.txt").write_text("\n".join(report) + "\n")
    print("\n".join(report))


if __name__ == "__main__":
    main()

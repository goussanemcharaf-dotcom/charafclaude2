"""Build the ad's soundtrack: original music + SFX + VO mix, mastered for Meta.

Everything is synthesized (utils/audio/synth.py) and placed on the same timeline
as the picture: every event comes from config/timeline.json (the voice) or from
the scene constants mirrored below. The music is written *around the voice*:

  0 s       hook hit, the beat is there from the first second (120 BPM, D minor)
  5.5 s     workspace: full groove, then the chaos builds (claps, 16th hats,
            heartbeat, snare roll, riser) into a wall that stops dead on « Non. »
  « Non. »  0.86 s of digital silence
  after     swell under « Ton travail mérite… », a two-bar build under the promise,
            a half-beat of silence, then DROP 1 on « pensé » (the frame turns violet):
            a premium house groove in F, sidechain-pumped (tempo chosen so that
            DROP 2 — the ten links becoming one, on « seul » — lands 16 beats later)
  links     breakdown (filter down), the counter builds 1 → 10, gap, DROP 2
  CTA       groove to the send tap, final hit on F.

Outputs:
  audio/music/music_stem.wav      music bus after ducking (mix level)
  audio/sfx/sfx_stem.wav          SFX bus (mix level)
  audio/master_mix.wav            final stereo master, -14 LUFS, <= -1 dBTP
  config/music.json               beat grid, kicks, drops, builds: the picture reacts to it
  qa/audio_report.txt
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


def word(pid, prefix, key="start"):
    return next(w[key] for w in W if w["phrase"] == pid and w["w"].lower().startswith(prefix.lower()))


# ---- picture events (mirror src/scenes/*.tsx; all derived from the voice) ---------------
NON = C["non"]                          # hard silence starts here (cut to white)
SWELL = 15.35                           # end of the silence
PENSE = word(11, "pensé")
STAR_IN = 17.5
STAR_FILL = PENSE - 0.38                # S06Reveal: fully violet at STAR_FILL + 0.39
DROP1 = STAR_FILL + 0.39                # = first downbeat of the groove
MERGE = C["un_seul"] - 0.02             # ten links become one
BEAT = (MERGE - DROP1) / 16             # both drops on a downbeat (~117 BPM)
BPM_B = 60 / BEAT
CUT_LINKS = TL["scenes"]["s08_ten_links"][0]
LINK_FIRST = CUT_LINKS + 0.04
LINK_STEP = (C["dix_liens"] - 0.1 - LINK_FIRST) / 9
SEND = word(14, "lien") + 0.34
UNIVERS, PROJETS, SERVICES, STYLE = C["univers"], C["projets"], C["services"], C["style"]
ZOOM_AT = word(12, "réunis") - 0.04
OUT_AT = 25.94
S11_ZOOM = C["professionnel"] - 0.28
S12_WIPE = 33.6
WIPE_DONE = S12_WIPE + 0.4
LINES_AT = [33.99, 34.13, 34.27, 34.41]
CTA = [w for w in W if w["phrase"] == 17]
TAP = CTA[-1]["end"] + 0.2              # S12CTA: send button tapped
GLITCHES = [9.2, 10.02, 10.92]          # chaos glitches (picture: RGB split)

# part-B harmony (F major): I – V – vi – IV, bar by bar from each drop
FMAJ9, C69, DM9, BBMAJ9 = [53, 57, 60, 64, 67], [48, 52, 57, 62, 67], [50, 53, 57, 60, 64], [46, 53, 57, 60, 62]
ROOTS = {id(FMAJ9): 41, id(C69): 36, id(DM9): 38, id(BBMAJ9): 34}
PROG = [FMAJ9, C69, DM9, BBMAJ9]


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


def silence(buf, a, b, fade=0.004):
    """Hard-gate buf to zero on [a, b) with tiny fades."""
    ia, ib, f = int(a * SR), min(N, int(b * SR)), int(fade * SR)
    buf[ia - f:ia] *= np.linspace(1, 0, f)[:, None]
    buf[ia:ib] = 0.0
    if ib < N:
        k = min(f, N - ib)
        buf[ib:ib + k] *= np.linspace(0, 1, k)[:, None]


def bt(k):
    """Time of part-B beat k (0 = DROP1)."""
    return DROP1 + k * BEAT


# ======================================================================= MUSIC
def music():
    m = zeros()     # tonal bus (sidechained, filterable)
    d = zeros()     # drum bus
    kicks = []      # (time, strength) — drives the sidechain and the picture's beat punches

    # ---------------- PART A: the messy "before" (120 BPM, D minor) -------------------------
    chords_a = [(0, "Dm"), (2, "Bb"), (4, "Gm"), (6, "A"), (8, "Dm"), (10, "Bb"), (12, "Gm"), (14, "A")]
    root = {"Dm": 38, "Bb": 34, "Gm": 31, "A": 33}
    arp = {"Dm": [62, 65, 69, 72, 74, 72, 69, 65], "Bb": [62, 65, 70, 74, 77, 74, 70, 65],
           "Gm": [62, 67, 70, 74, 79, 74, 70, 67], "A": [61, 64, 69, 73, 76, 73, 69, 64]}
    for bi, (b0, ch) in enumerate(chords_a):
        b1 = chords_a[bi + 1][0] if bi + 1 < len(chords_a) else NON
        tt_ = b0
        while tt_ < min(b1, NON):       # pumping sub on 8ths
            lvl = 0.44 if tt_ < 5.4 else 0.52 if tt_ < 8.3 else 0.6
            place(m, S.sub(root[ch], 0.23, 1.0), tt_, lvl)
            tt_ += 0.25
        tt_, k = b0, 0
        while tt_ < min(b1, NON):       # plucked 16th arpeggio
            note = arp[ch][k % 8]
            lvl = 0.17 if tt_ < 5.4 else 0.19 if tt_ < 8.3 else 0.22
            place(m, S.pluck(note, 0.3), tt_, lvl * (1.0 if k % 4 == 0 else 0.75), pan=0.25 * np.sin(k * 1.3))
            if tt_ >= 8.3:
                place(m, S.pluck(note + 12, 0.22, 1.4), tt_ + 0.0625, 0.07, pan=-0.3)
            tt_ += 0.125
            k += 1
    # hook: one big hit on the first frame, then the beat is already running
    place(d, S.kick(0.6, 170, 40, 5.5), 0.0, 0.95)
    place(d, S.impact(1.6, 0.9), 0.0, 0.55)
    place(d, S.crash(2.0), 0.0, 0.35)
    kicks.append((0.0, 1.0))
    t = 0.5
    while t < NON - 0.01:
        lvl = 0.6 if t < 5.5 else 0.74 if t < 8.3 else 0.82
        place(d, S.kick(), t, lvl)
        kicks.append((round(t, 4), 0.55 if t < 5.5 else 0.7 if t < 11.2 else 0.85))
        if 11.2 <= t < 13.9:
            place(d, S.kick(0.3, 130, 50, 12), t + 0.18, 0.35)  # heartbeat double
        t += 0.5
    for b in np.arange(2.0, 14.0, 2.0):                        # clap on 2 & 4 from bar 2
        for off in (0.5, 1.5):
            place(d, S.clap(), b + off, 0.3 if b < 5.5 else 0.42, pan=0.05)
    t = 1.0
    while t < NON - 0.01:                                       # hats: 8ths -> 16ths in the chaos
        step = 0.25 if t < 8.3 else 0.125
        acc = 1.0 if abs((t * 4) % 2) < 1e-6 else 0.6
        place(d, S.hat(), t, (0.12 if t < 5.5 else 0.16) * acc, pan=0.35)
        if t >= 5.5 and abs((t - 0.25) % 0.5) < 1e-6:
            place(d, S.hat(open_=True), t, 0.1 if t < 11.2 else 0.12, pan=-0.3)
        t += step
    t = 4.0
    while t < NON - 0.01:                                       # shaker glue
        place(d, S.shaker(), t, 0.07 if t < 8.3 else 0.09, pan=-0.45)
        t += 0.125
    t, dt = 13.0, 0.125                                         # snare roll accelerating into the wall
    while t < NON - 0.03:
        v = 0.15 + 0.5 * (t - 13.0) / (NON - 13.0)
        place(d, S.snare(0.12, 200, 1.1), t, v, pan=0.1)
        t += dt
        dt = max(0.035, dt * 0.93)
    place(m, S.riser(NON - 11.0, 160, 1500, 1.0), 11.0, 0.34)
    for a, b in ((4.4, 5.4), (7.3, 8.3), (10.2, 11.2)):        # small lifts into each section
        place(d, S.noise_riser(b - a, 800, 7000, 1.0, 0.4), a, 0.1)
    place(d, S.impact(1.3, 0.8), 5.43, 0.32)
    for at, lv in ((5.5, 0.22), (8.3, 0.2), (11.2, 0.18)):
        place(d, S.crash(1.6), at, lv)
    # the wall of sound ends exactly on "Non."
    for bus in (m, d):
        silence(bus, NON, DUR + 1)

    # ---------------- AFTER "Non.": swell, build, DROP 1 -------------------------------------
    place(m, S.pad(FMAJ9, bt(-4) - SWELL + 0.3, attack=1.6, release=0.3, cutoff=1400), SWELL, 0.5)
    place(m, S.pad(BBMAJ9, 2 * BEAT + 0.1, attack=0.25, release=0.1, cutoff=2200), bt(-4), 0.46)
    place(m, S.pad([48, 53, 55, 60, 65], 1.5 * BEAT, attack=0.1, release=0.05, cutoff=3200), bt(-2), 0.5)   # Csus4
    for k in range(-8, -4):                                     # heartbeat thumps under the promise
        place(d, S.kick(0.4, 95, 40, 9, 0.0, 1.2), bt(k), 0.22 + 0.03 * (k + 8))
        kicks.append((round(bt(k), 4), 0.25))
    for k in range(-4, -1):                                     # the build: kick on the beat...
        place(d, S.kick(0.45, 140, 44, 8, 0.1), bt(k), 0.45 + 0.08 * (k + 4))
        kicks.append((round(bt(k), 4), 0.5))
    rolls = [bt(-4 + j / 2) for j in range(4)] + [bt(-2 + j / 4) for j in range(4)] + [bt(-1 + j / 8) for j in range(4)]
    for i, at in enumerate(rolls):                              # ...and a snare roll 8ths -> 16ths -> 32nds
        place(d, S.snare(0.14, 180 + 12 * i, 1.0), at, 0.12 + 0.03 * i, pan=0.08)
    place(m, S.noise_riser(bt(-0.5) - bt(-5), 700, 9000, 1.0, 0.5), bt(-5), 0.22)
    silence(m, bt(-0.5), DROP1)                                 # half a beat of nothing before « pensé »…
    silence(d, bt(-0.5), DROP1)
    place(d, S.rev_cymbal(1.3), DROP1 - 1.3, 0.3)               # …but a reverse cymbal swells *into* the drop

    # ---------------- PART B: the premium house groove (F major) -----------------------------
    def groove(k0, k1, prog, full=True):
        """Drums, bass, pads, stabs and arp for part-B beats [k0, k1)."""
        for k in range(k0, k1):
            t0 = bt(k)
            beat_in_bar = k % 4
            chord = prog[(k - k0) // 4 % len(prog)]
            rt = ROOTS[id(chord)]
            place(d, S.kick(0.5, 150, 46, 7.0, 0.2), t0, 0.82 if beat_in_bar == 0 else 0.74)
            kicks.append((round(t0, 4), 1.0 if beat_in_bar == 0 else 0.7))
            if beat_in_bar in (1, 3):
                place(d, S.clap(), t0, 0.44, pan=-0.04)
                place(d, S.snare(0.2, 190, 0.7), t0, 0.16)
            for j in range(4):                                  # 16th hats, open hat on the "and"
                th = t0 + j * BEAT / 4
                if j == 2:
                    place(d, S.hat(open_=True), th, 0.11, pan=-0.3)
                else:
                    place(d, S.hat(0.05, bright=0.9), th, (0.1 if j == 0 else 0.07) * (1 if full else 0.6), pan=0.3)
                place(d, S.shaker(), th + 0.012, 0.06, pan=-0.5)
            # offbeat bass (house pump), octave on the last "and" of the bar
            place(m, S.bass(rt + (12 if beat_in_bar == 3 else 0), BEAT * 0.42, 1.0), t0 + BEAT / 2, 0.36)
            if beat_in_bar == 0:
                place(m, S.pad(chord, BAR + 0.15, attack=0.04, release=0.2, cutoff=2600), t0, 0.34)
                place(m, S.bass(rt, BEAT * 0.3, 1.0), t0, 0.22)
            if beat_in_bar in (1, 3):                           # chord stab on the "and" of 2 and 4
                place(m, S.stab([n + 12 for n in chord[1:]], 0.26, 1.0), t0 + BEAT / 2, 0.16, pan=0.15)
            for j in range(4):                                  # sparkle arp, sparse 16ths
                if (k * 4 + j) % 3 == 2:
                    continue
                note = chord[(k * 4 + j) % len(chord)] + 24
                place(m, S.pluck(note, 0.3, 1.5), t0 + j * BEAT / 4, 0.07, pan=0.45 * np.sin((k * 4 + j) * 1.7))
        return

    BAR = 4 * BEAT
    # DROP 1
    place(d, S.kick(0.8, 160, 38, 4.5, 0.25), DROP1, 0.9)
    place(m, S.sub_drop(1.4, 110, 32), DROP1, 0.55)
    place(d, S.impact(1.4, 0.8), DROP1, 0.3)
    place(d, S.crash(2.4), DROP1, 0.32)
    k_cut = int(np.floor((CUT_LINKS - DROP1) / BEAT))          # beats before the cut to the links
    groove(0, k_cut + 1, PROG)
    for bus in (m, d):                                          # the groove stops dead on the cut
        silence(bus, CUT_LINKS, MERGE)
    kicks[:] = [(t_, s_) for t_, s_ in kicks if not (CUT_LINKS <= t_ < MERGE)]

    # ---------------- the ten links: breakdown, count-up build, DROP 2 -----------------------
    place(m, S.pad(BBMAJ9, bt(14) - CUT_LINKS + 0.1, attack=0.05, release=0.1, cutoff=900), CUT_LINKS, 0.4)
    place(m, S.pad([48, 52, 55, 60, 62], bt(15.5) - bt(14) + 0.05, attack=0.1, release=0.05, cutoff=2400), bt(14), 0.46)  # Cadd9
    for k in range(12, 16):                                     # soft kick returns on the beat
        place(d, S.kick(0.45, 130, 44, 8, 0.1), bt(k), 0.34 + 0.08 * (k - 12))
        kicks.append((round(bt(k), 4), 0.35 + 0.1 * (k - 12)))
    rolls = [bt(12 + j / 2) for j in range(4)] + [bt(14 + j / 4) for j in range(4)] + [bt(15 + j / 8) for j in range(4)]
    for i, at in enumerate(rolls):
        place(d, S.snare(0.14, 180 + 12 * i, 1.0), at, 0.12 + 0.03 * i, pan=0.08)
    place(m, S.noise_riser(bt(15.5) - (CUT_LINKS + 0.3), 600, 9000, 1.0, 0.6), CUT_LINKS + 0.3, 0.24)
    silence(m, bt(15.5), MERGE)
    silence(d, bt(15.5), MERGE)
    place(d, S.rev_cymbal(1.2), MERGE - 1.2, 0.3)
    # DROP 2 on « seul »
    place(d, S.kick(0.8, 160, 38, 4.5, 0.25), MERGE, 0.9)
    place(m, S.sub_drop(1.4, 110, 32), MERGE, 0.55)
    place(d, S.crash(2.4), MERGE, 0.34)
    k_tap = int(np.floor((TAP - DROP1) / BEAT))
    groove(16, k_tap + 1, PROG)
    # drum fill into the statement, crash on the next downbeat
    k_zoom = int(np.floor((S11_ZOOM - DROP1) / BEAT))
    for j in range(4):
        place(d, S.tom(52 - 3 * j, 0.3, 1.0), bt(k_zoom) + j * BEAT / 4, 0.2 + 0.05 * j, pan=-0.3 + 0.2 * j)
    place(d, S.crash(1.8), bt(k_zoom + 1), 0.24)
    place(m, S.noise_riser(0.9, 900, 8000, 1.0, 0.3), S12_WIPE - 0.9, 0.16)   # lift into the CTA wipe
    place(d, S.crash(2.0), WIPE_DONE, 0.26)
    # the send tap ends the groove on the home chord
    for bus in (m, d):
        silence(bus, TAP, DUR + 1)
    kicks[:] = [(t_, s_) for t_, s_ in kicks if t_ < TAP]
    place(d, S.kick(0.9, 160, 36, 4.0, 0.25), TAP, 0.9)
    place(m, S.sub_drop(1.2, 100, 30), TAP, 0.5)
    place(d, S.crash(2.4), TAP, 0.32)
    place(m, S.pad(FMAJ9, DUR - TAP + 0.3, attack=0.02, release=0.9, cutoff=3200), TAP, 0.5)
    for n_ in FMAJ9[1:]:
        place(m, S.epiano(n_ + 12, DUR - TAP + 0.2, 0.5), TAP, 0.35, pan=0.12 * (n_ % 3 - 1))
    kicks.append((round(TAP, 4), 1.0))

    # sidechain pump on the tonal bus (house), gentler in part A
    m *= sidechain(kicks, depth_db=7.0)[:, None]
    # motion on the tonal bus: intro opens up, the build opens, the links breakdown closes then opens
    m = automate_lowpass(m, [(0, 1500), (3.6, 20000), (NON, 20000), (SWELL, 1600), (bt(-4), 2200), (bt(-0.6), 9000),
                             (DROP1 - 0.01, 20000), (CUT_LINKS - 0.01, 20000), (CUT_LINKS + 0.1, 520),
                             (bt(15.4), 4200), (MERGE - 0.01, 20000), (DUR, 20000)])
    d = automate_lowpass(d, [(0, 20000), (CUT_LINKS - 0.01, 20000), (CUT_LINKS + 0.08, 900), (bt(15.4), 5000),
                             (MERGE - 0.01, 20000), (DUR, 20000)])
    return m, d, sorted(kicks)


def sidechain(kicks, depth_db=7.0, attack=0.004, release=0.17):
    """Gain curve ducking on every kick: fast dip, smooth recovery (the house "pump")."""
    duck = np.zeros(N)
    na, nr = int(attack * SR), int(release * SR)
    shape = np.concatenate([np.linspace(0, 1, na, endpoint=False), (1 - np.linspace(0, 1, nr)) ** 2])
    for t, s in kicks:
        i = int(round(t * SR))
        if i >= N:
            continue
        seg = shape[: N - i] * min(1.0, s)
        duck[i:i + len(seg)] = np.maximum(duck[i:i + len(seg)], seg)
    return 10 ** (-depth_db * duck / 20)


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
            y, z = signal.sosfilt(sos, x[i:i + block, c], zi=zi[:, :, c])
            out[i:i + block, c] = y
            zi[:, :, c] = z
    return out


# ========================================================================= SFX
def sfx():
    s = zeros()
    wo = S.whoosh
    # S01 hook + identification
    place(s, wo(0.35, 600, 7000, 0.15, 1.0, (0.0, 0.0)), 0.0, 0.4)                 # punch-in
    for i, (k, m_) in enumerate([("ugc", 74), ("content", 77), ("voice", 81), ("influenceur", 86)]):
        place(s, S.pop(m_, 0.1, 1.0), C[k] - 0.1, 0.6, pan=[0.0, -0.4, 0.4, 0.0][i])
        place(s, wo(0.18, 1200, 8000, 0.7, 1.0, ((-1) ** i * 0.5, 0.0)), C[k] - 0.26, 0.18)
    place(s, wo(0.5, 300, 4000, 0.75, 2.2, (0.5, -0.5)), 4.54, 0.5)       # spin-out
    place(s, S.pop(69, 0.12, 1.0), 4.76, 0.35)                            # question lands
    place(s, wo(0.45, 500, 6000, 0.45, 1.5, (-0.2, 0.2)), 5.34, 0.6)      # bars split
    # S02 workflow
    place(s, wo(0.5, 250, 3000, 0.4, 1.4, (-0.8, 0.0)), 5.8, 0.38)        # file browser slides in
    for tt_, pan in ((C["drive"] - 0.04, -0.4), (C["whatsapp"] - 0.04, 0.4), (C["liens"] - 0.02, 0.0)):
        place(s, S.pop(79, 0.09, 1.0), tt_, 0.45, pan)
    place(s, wo(0.45, 300, 3500, 0.5, 1.6, (0.6, 0.3)), C["whatsapp"] - 0.36, 0.4)  # phone rises
    chat = C["whatsapp"] - 0.22
    place(s, S.notif(0.8), chat, 0.28, 0.4)
    for tt_ in (chat + 0.28, chat + 0.52, C["liens"] - 0.2):
        place(s, S.pop(88, 0.07, 0.8), tt_, 0.24, 0.45)
    for i in range(3):
        at = C["liens"] - 0.14 + i * 0.11
        place(s, S.thud(1.0, 110 - i * 8), at + 0.18, 0.44, -0.3)
        place(s, wo(0.22, 600, 5000, 0.8, 1.2, (-0.8, -0.2)), at - 0.04, 0.24)
    place(s, wo(0.3, 500, 5000, 0.3, 1.2, (0.0, 0.2)), 8.22, 0.28)        # headline leaves
    # S03 chaos: slams accelerate, glitches
    slams = [C["video"] - 0.06, C["fichier"] - 0.06, C["autre_lien"] - 0.06, 8.98, 9.62, 9.9, 10.5, 10.68, 10.84, 11.0]
    for i, at in enumerate(slams):
        pan = [-0.5, 0.5, -0.3, 0.6, 0.6, 0.3, -0.5, -0.6, 0.5, -0.2][i]
        place(s, wo(0.2, 700, 6000, 0.85, 1.1, (pan * 1.5, pan)), at - 0.1, 0.3)
        place(s, S.thud(1.0, 120 - i * 4), at + 0.1, 0.55 if i < 3 else 0.4, pan)
    for at in (C["video"] + 0.04, C["fichier"] + 0.04, C["autre_lien"] + 0.04):
        place(s, S.pop(72, 0.12, 1.0), at, 0.46)
        place(s, S.thud(1.0, 75), at + 0.03, 0.44)
    for at in (8.78, 10.34):
        place(s, S.notif(1.0), at, 0.32, 0.3)
    for at in GLITCHES:
        place(s, S.glitch(0.12, 1.0), at, 0.34, np.sign(at - 10) * 0.4)
        place(s, S.glitch(0.06, 1.0), at + 0.09, 0.2, -np.sign(at - 10) * 0.4)
    # S04 confusion
    place(s, wo(0.5, 200, 2000, 0.5, 1.5, (-0.9, -0.5)), 11.2, 0.34)      # client peeks in
    t_ch = word(8, "chercher")
    place(s, S.click(1.0), t_ch, 0.55, 0.2)
    place(s, S.buzz(1.0), t_ch + 0.06, 0.5, 0.0)
    t_pa = word(8, "partout")
    for k in range(8):
        place(s, S.click(0.8, 2600 + k * 180), t_pa + k * 0.1, 0.3, 0.6 - k * 0.12)
    for at in (12.2, 12.36, 12.52, 12.68, 12.86):
        place(s, wo(0.14, 900, 7000, 0.6, 1.0, (0.3, -0.3)), at - 0.1, 0.2)
    place(s, S.pop(69, 0.14, 1.0), C["qui"] - 0.04, 0.6, -0.2)
    place(s, S.pop(72, 0.14, 1.0), C["que_tu_fais"] - 0.04, 0.6, 0.1)
    # silence window: nothing may ring into "Non."
    silence(s, NON, SWELL + 0.3)
    # S06 reveal
    place(s, wo(0.6, 300, 3000, 0.5, 1.6, (-0.3, 0.3)), STAR_IN - 0.1, 0.25)       # star draws
    place(s, S.bell(98, 1.4, 1.0, 3.0, 1.2), C["premium"] - 0.02, 0.2, 0.3)
    place(s, wo(0.55, 200, 4500, 0.7, 1.8, (0.0, 0.0)), STAR_FILL - 0.05, 0.5)     # star fills, swallows the frame
    place(s, S.shimmer(1.6, 1.0), DROP1, 0.32)                                    # star particles
    place(s, S.impact(1.2, 0.7, 64), DROP1, 0.25)
    place(s, wo(0.55, 250, 3500, 0.35, 1.3, (0.0, 0.0)), PENSE - 0.1, 0.36)       # browser rises
    for dt in (0.2, 0.28, 0.4, 0.56, 0.74):                                        # the page builds itself
        place(s, S.click(0.7, 3200), PENSE + dt, 0.24, 0.2)
    # S07 organised
    place(s, wo(0.5, 300, 3000, 0.5, 1.4, (0.0, 0.0)), UNIVERS + 0.36, 0.24)       # browser expands
    for at in (PROJETS - 0.04, SERVICES - 0.04, STYLE - 0.04):
        place(s, S.pop(84, 0.09, 1.0), at, 0.38, 0.0)
    for at in (PROJETS - 0.16, SERVICES - 0.12, STYLE - 0.18):
        place(s, wo(0.34, 700, 5000, 0.45, 1.3, (0.1, -0.1)), at, 0.18)
    place(s, wo(0.85, 180, 2600, 0.55, 1.6, (-0.2, 0.2)), ZOOM_AT, 0.32)          # zoom out
    for k in range(5):
        place(s, S.click(0.7, 2800 + k * 150), ZOOM_AT + 0.74 + k * 0.08, 0.22, -0.5 + k * 0.25)
    place(s, S.bell(91, 1.2, 1.0, 2.0, 0.6), C["experience"] - 0.05, 0.18)
    place(s, wo(0.28, 600, 7000, 0.85, 1.2, (0.4, -0.9)), OUT_AT - 0.02, 0.44)   # whip out
    # S08 ten links / S09 one link
    place(s, S.impact(0.9, 0.9, 70), CUT_LINKS, 0.4)
    place(s, S.downlifter(0.9), CUT_LINKS + 0.02, 0.22)
    for i in range(10):
        at = LINK_FIRST + i * LINK_STEP
        place(s, S.thud(1.0, 100 + i * 6), at + 0.12, 0.4, (-1) ** i * 0.4)
        place(s, S.click(0.8, 2000 + i * 160), at + 0.12, 0.3, 0.0)       # counter ticks up
    place(s, S.stab([62, 65, 69, 74], 0.3, 1.2), C["dix_liens"], 0.14)   # "dix"
    place(s, wo(0.4, 400, 4000, 0.6, 1.5, (-0.4, 0.4)), word(14, "tu") - 0.04, 0.32)
    place(s, wo(0.3, 3000, 9000, 0.9, 2.5, (0.3, 0.0)), word(14, "un") - 0.1, 0.32)
    place(s, S.impact(1.4, 0.9, 64), MERGE, 0.5)
    place(s, S.shimmer(1.8, 1.0), MERGE, 0.36)
    place(s, S.bell(84, 1.8, 1.0, 3.5, 1.8), MERGE + 0.02, 0.3)
    place(s, S.bell(91, 1.8, 1.0, 3.5, 1.5), MERGE + 0.1, 0.22)
    place(s, S.pop(86, 0.08, 1.0), SEND - 0.2, 0.32)
    place(s, S.click(1.0, 2400), SEND, 0.48)
    place(s, wo(0.4, 500, 7000, 0.7, 1.8, (0.0, 0.0)), SEND + 0.1, 0.46)  # link is sent
    # S10 client
    place(s, wo(0.6, 200, 3000, 0.4, 1.4, (0.0, 0.0)), 29.3, 0.38)       # phone rises
    for at in (29.56, 29.66):
        place(s, S.pop(90, 0.07, 0.9), at, 0.22, 0.3)
    place(s, S.click(1.0, 1900), C["clique"] - 0.02, 0.6)
    place(s, wo(0.5, 400, 4500, 0.5, 1.5, (0.0, 0.0)), C["clique"] + 0.08, 0.32)
    place(s, wo(0.8, 500, 3000, 0.5, 1.3, (0.1, -0.1)), C["decouvre"] - 0.04, 0.14)
    # S11 statement
    place(s, wo(0.5, 200, 5000, 0.8, 2.0, (0.0, 0.0)), S11_ZOOM - 0.1, 0.52)   # zoom-through
    for i, (at, m_) in enumerate(((C["professionnel"], 77), (C["clair"], 81), (C["different"], 84))):
        place(s, S.pop(m_, 0.12, 1.0), at - 0.03, 0.5, -0.3)
        place(s, S.thud(1.0, 90), at, 0.34, -0.3)
        place(s, S.stab([n + 12 for n in (FMAJ9, C69, DM9)[i][1:]], 0.24, 1.0), at - 0.03, 0.12)
    # S12 CTA
    place(s, wo(0.45, 250, 5000, 0.85, 2.2, (0.0, 0.0)), S12_WIPE - 0.08, 0.55)     # star wipe
    place(s, S.impact(1.2, 0.8, 66), WIPE_DONE, 0.3)
    place(s, S.shimmer(1.2, 1.0), WIPE_DONE, 0.2)
    for i, at in enumerate(LINES_AT):
        place(s, S.thud(1.0, 105 - i * 6), at + 0.06, 0.52 + 0.08 * i, -0.2)
        place(s, wo(0.16, 900, 8000, 0.9, 1.0, (-0.8, 0.0)), at - 0.1, 0.22)
    place(s, S.bell(86, 1.6, 1.0, 3.5, 1.4), LINES_AT[3] + 0.02, 0.24, 0.2)
    place(s, wo(0.4, 300, 3500, 0.5, 1.5, (0.0, 0.0)), 33.8, 0.26)        # composer rises
    for i, w in enumerate(CTA):                                           # typing
        a = w["start"]
        b = CTA[i + 1]["start"] if i + 1 < len(CTA) else a + 0.45
        ln = len(w["w"])
        span = max(0.12, (b - a) * 0.7)
        for k in range(ln):
            place(s, S.click(0.35 + 0.2 * S.rng().random(), 3400 + S.rng().integers(-400, 400)), a + span * k / ln, 0.17, 0.15)
    place(s, S.click(1.0, 2000), TAP, 0.5)
    place(s, S.bell(89, 2.2, 1.0, 3.5, 1.6), TAP + 0.02, 0.32)
    place(s, S.bell(96, 2.2, 1.0, 3.5, 1.2), TAP + 0.12, 0.22)
    place(s, S.shimmer(1.4, 1.0), TAP + 0.02, 0.3)
    place(s, wo(0.5, 600, 8000, 0.3, 1.4, (0.0, 0.0)), TAP + 0.02, 0.3)   # message sent
    return s


# ========================================================================= MIX
def load_vo():
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(ROOT / "audio/voiceover/vo_final.wav"), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    v = np.frombuffer(raw, np.float32).astype(np.float64)
    v = np.pad(v, (0, max(0, N - len(v))))[:N]
    v = vo_comp(vo_eq(v))
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
    """High-pass, a little presence for phone speakers; for a lossy-codec TTS source (the ElevenLabs
    take) also clean its high-band fill + 13.1 kHz tone."""
    v = signal.sosfilt(signal.butter(2, 75, "highpass", fs=SR, output="sos"), v)
    if TL["vo"].get("codec_cleanup"):
        b, a = signal.iirnotch(13095, 12, fs=SR)
        v = signal.filtfilt(b, a, v)
        v = signal.sosfiltfilt(signal.butter(8, 11000, "lowpass", fs=SR, output="sos"), v)
    v = signal.sosfilt(peaking(3200, 2.0, 1.0), v)
    return v


def compress(x, thr_db, ratio, attack=0.003, release=0.08, knee=6.0, window=0.005):
    """Feed-forward RMS compressor (mono), soft knee; returns the gain-reduced signal."""
    w = max(1, int(window * SR))
    lvl = 10 * np.log10(np.convolve(x ** 2, np.ones(w) / w, mode="same") + 1e-12)
    over = lvl - thr_db
    gr = np.where(over <= -knee / 2, 0.0,
                  np.where(over >= knee / 2, over * (1 - 1 / ratio), (1 - 1 / ratio) * (over + knee / 2) ** 2 / (2 * knee)))
    a_att, a_rel = np.exp(-1 / (attack * SR)), np.exp(-1 / (release * SR))
    g = np.zeros_like(gr)
    prev = 0.0
    for i, v in enumerate(gr):                      # smooth the gain reduction (attack when it grows)
        coef = a_att if v > prev else a_rel
        prev = coef * prev + (1 - coef) * v
        g[i] = prev
    return x * 10 ** (-g / 20)


def vo_comp(v):
    """Ad-style voice: 3:1 on the loud syllables so every word sits forward over the music."""
    speech = v[np.abs(v) > 1e-4]
    ref = 10 * np.log10(np.mean(speech ** 2) + 1e-12) if len(speech) else -30
    return compress(v, ref + 2.0, 3.0, attack=0.004, release=0.09)


def duck_env(vo, att=0.012, rel=0.28):
    """0..1 envelope of voice presence (smoothed)."""
    x = np.abs(vo[:, 0])
    win = int(0.02 * SR)
    rms = np.sqrt(np.convolve(x ** 2, np.ones(win) / win, mode="same"))
    target = np.clip(rms / (np.percentile(rms[rms > 1e-4], 70) + 1e-9), 0, 1)
    a_att, a_rel = np.exp(-1 / (att * SR)), np.exp(-1 / (rel * SR))
    env = signal.lfilter([1 - a_rel], [1, -a_rel], target)
    env = np.maximum(env, signal.lfilter([1 - a_att], [1, -a_att], target))
    return np.clip(env, 0, 1)


def spectral_duck(mus, env, low_db=3.5, mid_db=9.0, high_db=4.5):
    """Duck the music where the voice lives (mids) much more than its lows and highs, so the
    groove keeps its weight and sparkle while the words stay clear."""
    low = signal.sosfiltfilt(signal.butter(2, 220, "lowpass", fs=SR, output="sos"), mus, axis=0)
    high = signal.sosfiltfilt(signal.butter(2, 5200, "highpass", fs=SR, output="sos"), mus, axis=0)
    mid = mus - low - high
    g = lambda db: 10 ** (-db * env / 20)[:, None]
    return low * g(low_db) + mid * g(mid_db) + high * g(high_db)


def punch(d):
    """Drum bus: parallel compression + a touch of saturation."""
    d = d / (np.max(np.abs(d)) + 1e-9) * 0.8
    mono = d.mean(axis=1)
    speech = mono[np.abs(mono) > 1e-4]
    ref = 10 * np.log10(np.mean(speech ** 2) + 1e-12)
    squash = np.stack([compress(d[:, c], ref - 4, 6.0, 0.001, 0.06) for c in range(2)], 1)
    return S.soft_clip(d + 0.6 * squash * 1.6, 1.2)


def write_wav(path, x, bits=24):
    path.parent.mkdir(parents=True, exist_ok=True)
    codec = "pcm_s24le" if bits == 24 else "pcm_s16le"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", codec, str(path)],
                   input=x.astype(np.float32).tobytes(), check=True)


def main():
    vo = load_vo()
    mus_t, mus_d, kicks = music()
    ir = S.reverb_ir(1.7, 2.2)
    mus = mus_t + 0.9 * punch(mus_d)
    mus = mus + 0.14 * S.convolve_stereo(mus_t, ir)
    # phone-speaker friendly low end: remove sub-rumble, tame the lows a little
    mus = signal.sosfilt(signal.butter(2, 34, "highpass", fs=SR, output="sos"), mus, axis=0)
    low = signal.sosfilt(signal.butter(2, 110, "lowpass", fs=SR, output="sos"), mus, axis=0)
    mus = mus - 0.25 * low
    fx = sfx()
    fx = fx + 0.12 * S.convolve_stereo(fx, S.reverb_ir(1.1, 1.6))
    # keep the "Non." silence absolute after reverb tails
    for bus in (mus, fx):
        silence(bus, NON, SWELL)

    lv = integrated_lufs(vo)
    lm = integrated_lufs(mus)
    lf = integrated_lufs(fx)
    mus *= 10 ** (((lv - 4.5) - lm) / 20)   # music sits ~4.5 LU under the voice before ducking
    fx *= 10 ** (((lv - 8.0) - lf) / 20)    # SFX ~8 LU under the voice
    env = duck_env(vo)
    mus_d = spectral_duck(mus, env)
    silence(mus_d, NON, SWELL)              # the zero-phase band split rings into the silence: gate again
    mix = vo + mus_d + fx

    lmix = integrated_lufs(mix)
    g = 10 ** ((-14.0 - lmix) / 20)
    master = tp_limit(mix * g, ceiling_db=-1.3)
    for _ in range(3):  # final trim so the limiter's gain reduction doesn't pull us under target
        lm2 = integrated_lufs(master)
        master = tp_limit(master * 10 ** ((-14.0 - lm2) / 20), ceiling_db=-1.3)
    fade = int(0.25 * SR)
    master[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 0.5
    tp = true_peak_db(master)

    write_wav(ROOT / "audio/music/music_stem.wav", mus_d * g)
    write_wav(ROOT / "audio/sfx/sfx_stem.wav", fx * g)
    write_wav(ROOT / "audio/master_mix.wav", master)

    grid = {
        "bpm_a": 120.0, "start_a": 0.0, "end_a": NON,
        "bpm_b": round(BPM_B, 3), "beat_b": round(BEAT, 5), "start_b": round(DROP1, 4), "end_b": round(TAP, 4),
        "kicks": [[round(t_, 4), round(s_, 2)] for t_, s_ in kicks],
        "hits": [{"t": 0.0, "kind": "hook"}, {"t": 5.4, "kind": "section"}, {"t": round(DROP1, 4), "kind": "drop"},
                 {"t": round(MERGE, 4), "kind": "drop"}, {"t": round(WIPE_DONE, 4), "kind": "cta"}, {"t": round(TAP, 4), "kind": "final"}],
        "builds": [[round(bt(-4), 4), round(bt(-0.5), 4)], [round(bt(12), 4), round(bt(15.5), 4)]],
        "glitches": GLITCHES,
    }
    (ROOT / "config/music.json").write_text(json.dumps(grid, indent=1))

    silent = np.max(np.abs((mus_d + fx)[int(NON * SR):int(SWELL * SR)]))
    report = [
        f"duration            {DUR:.3f} s",
        f"tempo               A 120 BPM (0 -> « Non. »), B {BPM_B:.2f} BPM (drop 1 {DROP1:.3f} s, drop 2 {MERGE:.3f} s = 16 beats later)",
        f"VO (solo)           {lv:6.2f} LUFS (EQ + 3:1 compression)",
        f"music under VO      {integrated_lufs(mus_d):6.2f} LUFS (pre-master), spectral ducking 3.5 / 9 / 4.5 dB (low / mid / high)",
        f"SFX                 {integrated_lufs(fx):6.2f} LUFS (pre-master)",
        f"master integrated   {integrated_lufs(master):6.2f} LUFS (target -14.0)",
        f"master true peak    {tp:6.2f} dBTP (ceiling -1.0)",
        f"silence at 'Non.'   max |x| {silent:.2e} in music+SFX from {NON:.2f}s to {SWELL:.2f}s",
    ]
    (ROOT / "qa").mkdir(exist_ok=True)
    (ROOT / "qa/audio_report.txt").write_text("\n".join(report) + "\n")
    print("\n".join(report))


if __name__ == "__main__":
    main()

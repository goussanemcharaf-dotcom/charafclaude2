"""Fit a new voiceover onto the existing picture timeline: from one take, or as a comp of several.

Usage:
  python3 utils/voice/fit_vo.py --take A.wav --words A_words.json [--take B.wav --words B_words.json ...]
         --label "source description" [--pick 9=2,15=1] [--emotion]
         [--ref-voice audio/voiceover/clone/voice_sample_clean.mp3]
         [--out audio/voiceover/clone/vo_packed_clone.flac] [--ref audio/voiceover/julian/vo_packed_timing.json]

TAKE_words.json = ASR word list for the take: [[word, start, end, prob], ...] or {"words": [...]}
(utils/voice/voice_qa.py --words-out writes them). A take may cover only part of the script (a pickup):
only the phrases it actually contains are offered to the comp.

Each of the 17 canonical phrases (utils/build_timeline.PHRASES) is located in every take by aligning
the ASR words to the script, then cut, trimmed and its inner pauses tightened. With several takes, the
take each phrase comes from is chosen the way a dialogue editor would comp them, jointly for all phrases
(dynamic programming) on:
  - time-stretch needed to reach the phrase's duration in the reference edit (less is better, slowing
    down costs more than speeding up, beyond TEMPO_RANGE the timeline would have to move; a reading
    shorter than its slot may rather leave a longer pause after it),
  - a clean read: ASR match to the script words and word confidence, no inserted word, and a voice
    that stays voiced (a reading whose loud frames are mostly aperiodic, creak or whisper, is a TTS
    artefact that sounds synthetic),
  - voice identity: a take whose speaker similarity to the reference voice is below SIM_OK costs,
  - pitch: the phrase's median F0 against the other takes' reading of it and against the reference voice,
  - clean cuts: a phrase the take runs into its neighbour without a pause costs (it is then cut at the
    quietest point between the two words, never through a word); so does a pause the take makes where
    the script has no punctuation ("et… découvre"),
  - continuity: every take switch costs, far more inside a sentence than at a full stop or long pause,
    plus the melodic jump it creates (the pitch step heard across the join vs the step either take
    makes there on its own).
Takes are loudness-matched first (BS.1770 on the speech); after the comp, phrase levels are evened
out (clip gain that keeps 40 % of each phrase's natural deviation) and the whole read gets a gentle
match EQ towards the long-term spectrum of the reference voice (--ref-voice), so the clone sounds like
the voice as it was recorded, not like the TTS model's own colour.

With --emotion the comp also directs the performance: every reading of a phrase is placed against the
other readings of the same phrase on four acoustic correlates of arousal and assurance (median pitch,
pitch range, loudness, vocal effort) and the reading closest to the emotion that beat of the story calls
for (EMOTION) is preferred; the pull towards the consensus pitch is halved so expressive readings can
win. It then shapes the performance across the story, as a VO editor would in Melodyne (ARC): every
sentence gets a register (median pitch vs the real voice) and a level, so the hook is bright, « Non. »
low and firm, the next line calm, the promise builds. A sentence is moved only REGISTER_AMOUNT of the
way to its register (formants preserved, at most REGISTER_MAX), all of it by the same amount so its own
melody is the take's, and never back from a reading that already goes further (a bright sentence is only
ever raised, a dark one only lowered).

Each unit (a phrase, or the opening list, see UNITS) is time-stretched with Rubber Band R3 ("finer"
engine, short window: pitch and formants kept) to the duration it had in the reference edit, so the
phrase starts the picture is cut on stay exactly where they are. A unit that can't get there within
TEMPO_RANGE keeps the clamped duration: shorter is padded with silence, longer moves the timeline
(reported).

Writes the packed take + vo_packed_timing.json in the format utils/build_timeline.py consumes
(phrases joined with 0.12 s gaps; words already mapped 1:1 onto the script tokens).
"""
import argparse
import difflib
import json
import math
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

import numpy as np
from pylibrb import Option, RubberBandStretcher, set_default_logging_level

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "utils"))
sys.path.insert(0, str(ROOT / "utils/audio"))
from build_timeline import GAPS, PHRASES  # noqa: E402
from loudness import integrated_lufs  # noqa: E402
from scipy import signal  # noqa: E402

SR = 48000
GAP = 0.12            # silence between phrases in the packed file
MAX_PAUSE = 0.20      # inner pauses longer than this are shortened to it
TIGHT_PAUSE = 0.12    # ...or to this, for a phrase that has to speed up a lot
TEMPO_RANGE = (0.82, 1.30)  # >1 = faster; the stretch is clamped to this

# comp costs (1.0 ~ "clearly noticeable")
STRETCH_UNIT = math.log(1.2)   # a 20 % stretch costs 1
SLOW_FACTOR = 1.4              # slowing speech down shows more than speeding it up
OVERRUN_UNIT = 0.025           # s of overrun costing 1: the picture has absolute cue times, so nearly forbidden
PAD_UNIT = 0.30                # s of silence padding costing 1
SWITCH_IN_SENTENCE = 3.0
SWITCH_SHORT_PAUSE = 1.0
SWITCH_LONG_PAUSE = 0.4        # at a designed pause >= 0.2 s
JOIN_PITCH = 0.15              # per semitone^2 of unnatural pitch step across a take switch
RUN_ON_CUT = 1.2               # phrase cut out of continuous speech (half when the edit keeps it tight)
MIN_SILENCE = 0.04             # a pause shorter than this between two phrases counts as run-on
UNSCRIPTED_PAUSE = 0.8         # a pause inside a phrase where the script has no punctuation (x1.5 next to its edges)
CREAK_HZ = 85.0                # voicing below this before a phrase's first phoneme is fry / a glitch, not speech
INSERTED_WORD = 1.5            # per word the take says that the script doesn't
LEVEL_KEEP = 0.4               # share of a phrase's level deviation (vs the comp median) that is kept
MATCH_AMOUNT, MATCH_MAX_DB, MATCH_BAND = 0.6, 5.0, (90.0, 10500.0)

# --emotion: the read follows the story. Per phrase, the wanted prosody as z-scores against the other
# readings of the same phrase: (pitch, pitch range, loudness, vocal effort = 1-4 kHz vs 80 Hz-1 kHz).
# Acoustic correlates of arousal / assurance; no emotion-recognition model is needed.
ENERGY, QUESTION, FIRM, CALM, WARM = (0.7, 0.8, 0.6, 0.6), (0.8, 1.0, 0.5, 0.5), (-0.8, -0.3, 0.8, 0.5), (-0.5, -0.2, -0.3, -0.5), (0.2, 0.4, 0.0, 0.2)
EMOTION = {
    0: ENERGY, 1: ENERGY, 2: ENERGY,              # the call-out
    3: (0.5, 0.6, 0.5, 0.5),                      # the mess (complicit, building)
    4: ENERGY, 5: ENERGY, 6: ENERGY,              # "Une vidéo ici. Un fichier là. Un autre lien ailleurs." (staccato)
    7: QUESTION,                                  # "…et ce que tu fais ?!" (incredulous)
    8: FIRM,                                      # "Non." (low, decisive)
    9: CALM,                                      # "Ton travail mérite une meilleure présentation." (warm conviction)
    10: (0.5, 0.7, 0.5, 0.5), 11: (0.6, 0.8, 0.6, 0.6),   # pride, rising enthusiasm
    12: (0.0, 0.4, 0.0, 0.0), 13: (0.5, 0.8, 0.7, 0.6),   # set-up, then the affirmation on "un seul lien"
    14: (0.0, 0.0, 0.3, 0.3), 15: (0.5, 0.8, 0.5, 0.5),   # "Ton client clique." assured / the three adjectives
    16: WARM,                                     # "Écris-moi et on commence." (smiling invitation)
}
EMOTION_W = 1.2
# voice identity: a take whose speaker similarity to the real voice (whole take, Resemblyzer) falls below
# SIM_OK costs ((SIM_OK - sim) / SIM_UNIT)^2 per phrase. Above it, the differences are the reading, not the voice.
SIM_OK, SIM_UNIT = 0.935, 0.03
# the arc of the read: (phrases of one sentence, register in semitones vs the real voice, level in dB)
ARC = [([0, 1, 2, 3], +1.0, 0.0),     # the call-out and the mess
       ([4, 5, 6], +1.0, +0.5),       # "Une vidéo ici. Un fichier là. Un autre lien ailleurs."
       ([7], +1.5, +0.5),             # the exasperated question
       ([8], -4.0, +1.5),             # "Non."
       ([9], -1.0, -1.0),             # "Ton travail mérite une meilleure présentation." (closer, calmer)
       ([10], +0.5, +0.5), ([11], +1.0, +0.5),   # the promise builds into the drop
       ([12, 13], +0.5, +1.0),        # "…tu envoies un seul lien."
       ([14, 15], 0.0, 0.0),          # the client's side
       ([16], 0.0, 0.0)]              # "Écris-moi et on commence." (settled, not low)
REGISTER_AMOUNT, REGISTER_MAX = 0.5, 1.5
assert sorted(k for g in ARC for k in g[0]) == list(range(len(PHRASES)))
VOICED_OK, VOICED_UNIT = 0.45, 0.10  # share of the loud frames with a pitch; below VOICED_OK: creak / whisper

# Units are fitted as a whole: inside a unit the phrases keep the take's own rhythm and only the unit's
# total duration is matched. The picture only follows word cues inside them: the opening list
# ("Si tu es UGC Creator, … ou Influenceur…"), "Au lieu d'envoyer dix liens… tu envoies un seul lien."
# and "Ton client clique. Et découvre un portfolio…". Every other phrase start is an anchor: scenes
# are cut on it at absolute times.
UNITS = [[0, 1, 2], [3], [4], [5], [6], [7], [8], [9], [10], [11], [12, 13], [14, 15], [16]]
assert sorted(k for u in UNITS for k in u) == list(range(len(PHRASES)))

set_default_logging_level(0)


def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)


def atoms(text):
    t = unicodedata.normalize("NFC", text.lower()).replace("’", "'")
    t = re.sub(r"[.,…?!:;«»\"()]", " ", t)
    return [a for a in re.split(r"[\s'\-]+", t) if a]


def align(words):
    """Map every script token to (start, end) using the ASR words; also how many of its atoms the ASR heard,
    and when the take says something the script doesn't (an inserted / repeated word: a TTS glitch)."""
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
    heard = [0] * len(tok)
    for blk in sm.get_matching_blocks():
        for d in range(blk.size):
            i = can_owner[blk.a + d]
            s, e = asr_time[blk.b + d]
            times[i] = (s, e) if times[i] is None else (min(times[i][0], s), max(times[i][1], e))
            heard[i] += 1
    n_atoms = [len(atoms(tk)) for _, _, tk in tok]
    inserted = []
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        n_ins = (j2 - j1) - (i2 - i1) if op in ("insert", "replace") else 0
        inserted += [sum(asr_time[j]) / 2 for j in range(j2 - max(0, n_ins), j2)]
    # interpolate the rare unmatched token between its neighbours
    for i in range(len(times)):
        if times[i] is None:
            prev = next((times[j] for j in range(i - 1, -1, -1) if times[j]), (0.0, 0.0))
            nxt = next((times[j] for j in range(i + 1, len(times)) if times[j]), (prev[1] + 0.3, prev[1] + 0.3))
            times[i] = (prev[1], max(prev[1] + 0.05, nxt[0]))
    return tok, times, heard, n_atoms, inserted


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
    return np.concatenate(keep), bp


def time_map(bp, t):
    xs, ys = zip(*bp)
    return float(np.interp(t, xs, ys))


def stretch(seg, tempo, semis=0.0):
    """Rubber Band R3 (finer engine, short window): cleanest on speech of the engines tested. semis: pitch
    shift with the formants preserved (the timbre stays the voice's)."""
    if abs(tempo - 1) < 0.004 and abs(semis) < 0.05:
        return seg
    opts = Option.PROCESS_OFFLINE | Option.ENGINE_FINER | Option.WINDOW_SHORT
    if abs(semis) >= 0.05:
        opts |= Option.FORMANT_PRESERVED
    st = RubberBandStretcher(SR, 1, opts, initial_time_ratio=1.0 / tempo, initial_pitch_scale=2 ** (semis / 12))
    a = seg.astype(np.float32)[None, :]
    st.set_max_process_size(a.shape[1])
    st.set_expected_input_duration(a.shape[1])
    st.study(a, final=True)
    st.process(a, final=True)
    return st.retrieve_available()[0].astype(np.float64)


def f0_track(x):
    import librosa
    y = librosa.resample(x.astype(np.float32), orig_sr=SR, target_sr=16000)
    f0, voiced, _ = librosa.pyin(y, fmin=60, fmax=400, sr=16000, frame_length=1024)
    f0[~voiced] = np.nan
    return librosa.times_like(f0, sr=16000, hop_length=256), f0


class Take:
    def __init__(self, path, words_path):
        self.name = Path(path).name
        self.x = load(path)
        wj = json.loads(Path(words_path).read_text())
        self.words = wj["words"] if isinstance(wj, dict) else wj
        self.tok, self.times, self.heard, self.n_atoms, self.inserted = align(self.words)
        heard = [sum(self.heard[i] for i, t in enumerate(self.tok) if t[0] == k)
                 / sum(self.n_atoms[i] for i, t in enumerate(self.tok) if t[0] == k) for k in range(len(PHRASES))]
        # a phrase is in the take if the ASR heard at least half of it, or it sits between two that are
        # (one misheard word, e.g. "Content créateur", doesn't make it absent)
        self.present = {k for k in range(len(PHRASES)) if heard[k] >= 0.5
                        or (0 < k < len(PHRASES) - 1 and heard[k - 1] >= 0.6 and heard[k + 1] >= 0.6)}
        self.lufs = integrated_lufs(self.x)
        self.f0_t, self.f0 = f0_track(self.x)
        self.speech_db = active_db(self.x)
        self.gain = 1.0

    def boundary(self, i):
        """Cut point between token i and token i + 1: middle of the pause, or the quietest 10 ms between
        the two words when the voice runs them together. Returns (time, measured pause length)."""
        a, b = self.times[i][1] - 0.06, self.times[i + 1][0] + 0.06
        if b - a < 0.12:
            a, b = (a + b) / 2 - 0.06, (a + b) / 2 + 0.06
        ia, ib = max(0, int(a * SR)), min(len(self.x), int(b * SR))
        w = int(0.01 * SR)
        ctx = self.x[max(0, ia - SR // 2):ib + SR // 2]
        ref = np.max(np.sqrt(np.convolve(ctx ** 2, np.ones(w) / w, mode="same"))) + 1e-9
        rms = np.sqrt(np.convolve(self.x[ia:ib] ** 2, np.ones(w) / w, mode="same"))
        quiet = np.concatenate([[0], (20 * np.log10(rms / ref + 1e-12) < -40).astype(int), [0]])
        d = np.diff(quiet)
        runs = list(zip(np.where(d == 1)[0], np.where(d == -1)[0]))
        if runs:
            r0, r1 = max(runs, key=lambda r: r[1] - r[0])
            if (r1 - r0) / SR >= MIN_SILENCE:
                return (ia + (r0 + r1) / 2) / SR, (r1 - r0) / SR
        return (ia + int(np.argmin(rms[w:-w])) + w) / SR, 0.0

    def cut(self, k, target):
        """Cut phrase k (0-based) out of this take, with everything the comp needs to judge it."""
        tok, times, x = self.tok, self.times, self.x
        idx = [i for i, (kk, _, _) in enumerate(tok) if kk == k]
        join_c = 0.0
        if idx[0] > 0 and k - 1 in self.present:
            s0, pause = self.boundary(idx[0] - 1)
            join_c += RUN_ON_CUT * (0.5 if GAPS[k - 1] <= 0.1 else 1.0) * (pause < MIN_SILENCE)
        else:
            s0 = times[idx[0]][0] - 0.3
        if idx[-1] + 1 < len(tok) and k + 1 in self.present:
            e0, pause = self.boundary(idx[-1])
            join_c += RUN_ON_CUT * (0.5 if GAPS[k] <= 0.1 else 1.0) * (pause < MIN_SILENCE)
        else:
            e0 = times[idx[-1]][1] + 0.4
        # keep breaths and room tone out: stay close to the first/last word the ASR heard
        s0, e0 = max(0.0, s0, times[idx[0]][0] - 0.12), min(len(x) / SR, e0, times[idx[-1]][1] + 0.15)
        s, e = trim_bounds(x, s0, e0, thr_db=-38.0, pad=0.04)
        s = self.speech_onset(s, e)
        raw = x[int(s * SR):int(e * SR)] * self.gain
        pause_c = self.unscripted_pauses(idx, s, raw)
        seg, bp = squeeze_pauses(raw)
        if len(seg) / SR / target > TEMPO_RANGE[1] * 0.95:
            seg, bp = squeeze_pauses(raw, max_pause=TIGHT_PAUSE)
        m = (self.f0_t >= s) & (self.f0_t <= e) & ~np.isnan(self.f0)
        ws, we = times[idx[0]][0], times[idx[-1]][1]
        probs = [w[3] for w in self.words if len(w) > 3 and w[1] >= s - 0.05 and w[2] <= e + 0.05]
        voiced = self.f0[m]
        return {
            "take": self.name, "idx": idx, "s": s, "seg": seg, "bp": bp, "nat": len(seg) / SR,
            "f0": float(np.median(voiced)) if m.sum() >= 5 else float("nan"),
            "f0_range": float(12 * np.log2(np.percentile(voiced, 90) / np.percentile(voiced, 10))) if m.sum() >= 5 else float("nan"),
            "level": active_db(raw) - self.speech_db,
            "effort": vocal_effort(raw),
            "match": sum(self.heard[i] for i in idx) / sum(self.n_atoms[i] for i in idx),
            "prob": float(np.mean(probs)) if probs else 0.5,
            "inserted": sum(1 for ti in self.inserted if s <= ti <= e),
            "join": join_c + pause_c,
            "f0_start": self.f0_median(ws - 0.05, ws + 0.35), "f0_end": self.f0_median(we - 0.35, we + 0.05),
            "voiced": self.voiced_share(s, e),
        }

    def speech_onset(self, s, e):
        """Skip a creaky / non-speech lead-in (vocal fry, a glitch) before the first real phoneme: the phrase
        starts at the first 10 ms frame that is normally voiced (F0 >= CREAK_HZ) or a fricative (> 3 kHz)."""
        seg = self.x[int(s * SR):int(e * SR)]
        hf = signal.sosfilt(signal.butter(4, 3000, "highpass", fs=SR, output="sos"), seg)
        w = int(0.01 * SR)
        hf = np.sqrt(np.convolve(hf ** 2, np.ones(w) / w, mode="same"))
        strong = np.max(hf) * 10 ** (-20 / 20)
        for t in np.arange(0.0, min(e - s, 0.8), 0.01):
            j = min(np.searchsorted(self.f0_t, s + t), len(self.f0) - 1)
            if (np.isfinite(self.f0[j]) and self.f0[j] >= CREAK_HZ) or hf[int(t * SR)] > strong:
                return s + t - 0.03 if t >= 0.1 else s
        return s

    def unscripted_pauses(self, idx, s, raw):
        """Cost of the pauses (>= 0.1 s) this reading makes inside the phrase where the script has none."""
        w = int(0.01 * SR)
        rms = np.sqrt(np.convolve(raw ** 2, np.ones(w) / w, mode="same"))
        quiet = np.concatenate([[0], (20 * np.log10(rms / (np.max(rms) + 1e-12) + 1e-12) < -40).astype(int), [0]])
        d = np.diff(quiet)
        cost = 0.0
        for r0, r1 in zip(np.where(d == 1)[0], np.where(d == -1)[0]):
            if r0 == 0 or r1 >= len(raw) or (r1 - r0) / SR < 0.1 or len(idx) < 2:
                continue
            tc = s + (r0 + r1) / 2 / SR
            j = min(range(len(idx) - 1), key=lambda n: abs((self.times[idx[n]][1] + self.times[idx[n + 1]][0]) / 2 - tc))
            if not re.search(r"[,.…?!:;]$", self.tok[idx[j]][2]):
                cost += UNSCRIPTED_PAUSE * (1.5 if j == 0 or j == len(idx) - 2 else 1.0)
        return cost

    def voiced_share(self, s, e):
        """Share of the loud 60 ms frames of [s, e] (within 20 dB of the phrase peak) that are periodic
        (normalised autocorrelation >= 0.5 at a 70-400 Hz lag, window-corrected as in Praat). pYIN is not
        used here: it drops some nasal / slightly rough vowels ("Non.") that are plainly voiced."""
        y = signal.resample_poly(self.x[int(s * SR):int(e * SR)], 1, 3)  # 16 kHz
        n, hop, lo, hi = 960, 320, 16000 // 400, 16000 // 70
        if len(y) < n:
            return 1.0
        win = np.hanning(n)
        rw = np.fft.irfft(np.abs(np.fft.rfft(win, 2 * n)) ** 2)[:n]
        fr = np.lib.stride_tricks.sliding_window_view(y, n)[::hop] * win
        en = np.sqrt(np.mean(fr ** 2, axis=1)) + 1e-12
        fr = fr[20 * np.log10(en / np.max(en)) > -20]
        ac = np.fft.irfft(np.abs(np.fft.rfft(fr, 2 * n, axis=1)) ** 2, axis=1)[:, :n]
        r = (ac[:, lo:hi] / (ac[:, :1] + 1e-12)) / (rw[lo:hi] / rw[0])
        return float(np.mean(np.max(r, axis=1) >= 0.5))

    def f0_median(self, a, b):
        v = self.f0[(self.f0_t >= a) & (self.f0_t <= b)]
        v = v[~np.isnan(v)]
        return float(np.median(v)) if len(v) >= 3 else float("nan")


def tempo_for(nat, target):
    return float(np.clip(nat / target, *TEMPO_RANGE))


def semitones(f0, f0_ref, default=0.0):
    return 12 * math.log2(f0 / f0_ref) if math.isfinite(f0) else default


def unit_cost(cs, targets, f0_ref, consensus, pitch_w=1.0):
    """Cost of one unit (its phrases cs, all from one take) stretched as a whole to sum(targets).
    consensus: per phrase, the median F0 of that phrase across the takes (semitones vs f0_ref).
    pitch_w: weight of the pitch terms (halved with --emotion, where EMOTION decides the register)."""
    if any(c is None for c in cs):  # a pickup that doesn't contain this unit
        return math.inf, {"tempo": 1.0, "resid": 0.0, "parts": ()}
    nat, target = sum(c["nat"] for c in cs), sum(targets)
    tempo = tempo_for(nat, target)
    if nat < target:  # a short reading is slowed down only as far as that beats leaving a longer pause after it
        tempo = float(min(np.linspace(tempo, 1.0, 21), key=lambda tp: len(cs) * (math.log(tp) / STRETCH_UNIT) ** 2
                          * SLOW_FACTOR + (target - nat / tp) / PAD_UNIT))
    resid = nat / tempo - target
    stretch_c = len(cs) * (math.log(tempo) / STRETCH_UNIT) ** 2 * (SLOW_FACTOR if tempo < 1 else 1.0)
    resid_c = (resid / OVERRUN_UNIT) ** 2 if resid > 0 else -resid / PAD_UNIT
    read_c = sum(3.0 * (1 - c["match"]) + 1.0 * (1 - c["prob"]) + INSERTED_WORD * c["inserted"]
                 + max(0.0, VOICED_OK - c["voiced"]) / VOICED_UNIT for c in cs)
    pitch_c = 0.0
    for c, cons in zip(cs, consensus):
        st = semitones(c["f0"], f0_ref, cons)
        pitch_c += pitch_w * (0.5 * ((st - cons) / 3.0) ** 2 + 0.25 * (st / 5.0) ** 2)
    join_c = sum(c["join"] for c in cs)
    emo_c = sum(c.get("emo_cost", 0.0) + c.get("sim_cost", 0.0) for c in cs)
    return stretch_c + resid_c + read_c + pitch_c + join_c + emo_c, {
        "tempo": tempo, "resid": resid, "parts": (stretch_c, resid_c, read_c, pitch_c, join_c, emo_c)}


def switch_cost(k):
    """Cost of changing take between phrase k-1 and phrase k (0-based)."""
    if PHRASES[k - 1].endswith(",") or PHRASES[k][0].islower():
        return SWITCH_IN_SENTENCE
    return SWITCH_LONG_PAUSE if GAPS[k - 1] >= 0.2 else SWITCH_SHORT_PAUSE


def join_pitch_cost(prev_a, cur_b, prev_b, cur_a):
    """Switch from take a (phrase k-1) to take b (phrase k): the pitch step the listener hears, compared
    with the step take b or take a makes there by itself. Arguments are cuts (see Take.cut)."""
    def step(prev, cur):
        if prev is None or cur is None or not math.isfinite(cur["f0_start"] + prev["f0_end"]):
            return float("nan")
        return 12 * math.log2(cur["f0_start"] / prev["f0_end"])
    heard = step(prev_a, cur_b)
    natural = [v for v in (step(prev_b, cur_b), step(prev_a, cur_a)) if math.isfinite(v)]
    if not math.isfinite(heard) or not natural:
        return 0.0
    return JOIN_PITCH * min(abs(heard - v) for v in natural) ** 2


def comp(costs, forced, cuts):
    """Viterbi over units: costs[u][t] per unit/take + switch costs at unit starts; forced = {u: t}."""
    U, T = len(costs), len(costs[0])
    c = np.array(costs, float)
    for u, t in forced.items():
        keep = c[u, t]
        c[u, :] = np.inf
        c[u, t] = keep
    D = np.full((U, T), np.inf)
    B = np.zeros((U, T), int)
    D[0] = c[0]
    for u in range(1, U):
        k = UNITS[u][0]
        sw = switch_cost(k)
        for t in range(T):
            opts = [D[u - 1, v] + (0.0 if v == t else sw + join_pitch_cost(cuts[k - 1][v], cuts[k][t], cuts[k - 1][t], cuts[k][v]))
                    for v in range(T)]
            B[u, t] = int(np.argmin(opts))
            D[u, t] = opts[B[u, t]] + c[u, t]
    path = [int(np.argmin(D[-1]))]
    for u in range(U - 1, 0, -1):
        path.append(B[u, path[-1]])
    return path[::-1], float(np.min(D[-1]))


def ltas(x):
    """Long-term spectrum of the voiced frames in 1/3-octave bands, dB, normalised on 200 Hz-4 kHz."""
    n, hop = 4096, 1024
    fr = np.lib.stride_tricks.sliding_window_view(x, n)[::hop] * np.hanning(n)
    e = np.sqrt(np.mean(fr ** 2, axis=1))
    fr = fr[e > np.max(e) * 10 ** (-35 / 20)]
    P = np.mean(np.abs(np.fft.rfft(fr, axis=1)) ** 2, axis=0)
    f = np.fft.rfftfreq(n, 1 / SR)
    centers = 1000 * 2 ** (np.arange(-13, 14) / 3)  # 50 Hz .. 20 kHz, every band holds FFT bins
    lv = np.array([10 * np.log10(np.mean(P[(f >= c / 2 ** (1 / 6)) & (f < c * 2 ** (1 / 6))]) + 1e-20) for c in centers])
    return centers, lv - np.mean(lv[(centers > 200) & (centers < 4000)])


def match_eq(y, ref):
    """Linear-phase EQ moving y's long-term spectrum MATCH_AMOUNT of the way to ref's (inside MATCH_BAND)."""
    c, ly = ltas(y)
    _, lr = ltas(ref)
    corr = np.clip((lr - ly) * MATCH_AMOUNT, -MATCH_MAX_DB, MATCH_MAX_DB)
    lo, hi = MATCH_BAND
    corr *= np.clip(np.log(c / (lo / 1.5)) / np.log(1.5), 0, 1) * np.clip(np.log((hi * 1.15) / c) / np.log(1.15), 0, 1)
    n = 4096
    f = np.fft.rfftfreq(n, 1 / SR)
    g = np.interp(np.log(np.maximum(f, 1.0)), np.log(c), corr, left=0.0, right=0.0)
    h = np.fft.irfft(10 ** (g / 20), n)
    h = np.roll(h, n // 2) * np.hanning(n)
    return signal.fftconvolve(y, h, mode="full")[n // 2:n // 2 + len(y)], dict(zip(np.round(c).astype(int), np.round(corr, 1)))


def vocal_effort(x):
    """Spectral balance of the loud frames, dB of 1-4 kHz over 80 Hz-1 kHz: rises with vocal effort / arousal."""
    w = int(0.02 * SR)
    n = len(x) // w
    if n < 3:
        return float("nan")
    fr = x[: n * w].reshape(n, w)
    e = np.sqrt(np.mean(fr ** 2, axis=1))
    fr = fr[e > np.max(e) * 10 ** (-25 / 20)] * np.hanning(w)
    P = np.mean(np.abs(np.fft.rfft(fr, axis=1)) ** 2, axis=0)
    f = np.fft.rfftfreq(w, 1 / SR)
    hi, lo = P[(f >= 1000) & (f < 4000)].sum(), P[(f >= 80) & (f < 1000)].sum()
    return float(10 * np.log10((hi + 1e-12) / (lo + 1e-12)))


def emotion_costs(cuts, f0_ref):
    """Per phrase, z-score each reading's prosody against the other readings of the same phrase and
    cost its distance to the wanted emotion (EMOTION). Stores c["emo"] (z-scores) and c["emo_cost"]."""
    for k, row in enumerate(cuts):
        cs = [c for c in row if c]
        feats = np.array([[semitones(c["f0"], f0_ref, np.nan), c["f0_range"], c["level"], c["effort"]] for c in cs], float)
        mu, sd = np.nanmean(feats, axis=0), np.nanstd(feats, axis=0) + 1e-6
        target = np.array(EMOTION[k])
        for c, f in zip(cs, feats):
            z = np.nan_to_num((f - mu) / sd)
            c["emo"] = z
            c["emo_cost"] = EMOTION_W * float(np.mean((np.clip(z, -2, 2) - target) ** 2)) if len(cs) > 2 else 0.0


def snap_words(seg, spans, below_db=20.0):
    """ASR word timestamps absorb the pause before a word (Whisper starts "pensé" where "Portfolio" ends):
    move each word start past leading silence (or breath) and each end before trailing silence, measured
    on the fitted audio, so on-screen words land on the sound. Quiet = more than below_db under the
    phrase's typical speech level."""
    w = int(0.01 * SR)
    env = 20 * np.log10(np.sqrt(np.convolve(seg ** 2, np.ones(w) / w, mode="same")) + 1e-9)
    speech = np.median(env[env > np.max(env) - 30])
    loud = env > speech - below_db
    out = []
    for a, b in spans:
        ia, ib = int(a * SR), int(b * SR)
        n = ib - ia
        d = np.diff(np.concatenate([[0], (~loud[ia:ib]).astype(int), [0]]))
        runs = list(zip(np.where(d == 1)[0], np.where(d == -1)[0]))
        na, nb = a, b
        # a pause folded into the start of the word (>= 100 ms: longer than a stop closure)
        lead = [r for r in runs if r[1] - r[0] >= 10 * w and r[1] <= 0.7 * n]
        if lead:
            na = a + (lead[-1][1] - w) / SR
        # silence folded into its end
        tail = [r for r in runs if r[1] - r[0] >= 6 * w and r[1] >= n - w and r[0] >= 0.3 * n]
        if tail:
            nb = a + (tail[0][0] + 2 * w) / SR
        out.append((na, max(nb, na + 0.02)))
    return out


def active_db(seg):
    w = int(0.02 * SR)
    fr = seg[: len(seg) // w * w].reshape(-1, w)
    e = np.sqrt(np.mean(fr ** 2, axis=1))
    loud = e[e > np.max(e) * 10 ** (-30 / 20)]
    return 20 * np.log10(np.sqrt(np.mean(loud ** 2)) + 1e-12)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--take", action="append", required=True)
    ap.add_argument("--words", action="append", required=True)
    ap.add_argument("--label", required=True)
    ap.add_argument("--pick", default="", help="force takes, e.g. 9=2,15=1 (1-based phrase = 1-based take; forces its unit)")
    ap.add_argument("--ref-voice", default="audio/voiceover/clone/voice_sample_clean.mp3")
    ap.add_argument("--out", default="audio/voiceover/clone/vo_packed_clone.flac")
    ap.add_argument("--ref", default="audio/voiceover/julian/vo_packed_timing.json")
    ap.add_argument("--timing-out", default="audio/voiceover/vo_packed_timing.json")
    ap.add_argument("--emotion", action="store_true", help="prefer the reading that fits each beat (EMOTION)")
    a = ap.parse_args()
    if len(a.take) != len(a.words):
        raise SystemExit("one --words per --take")

    ref = json.loads((ROOT / a.ref).read_text())
    ref_dur = [p[2] - p[1] for p in sorted(ref["phrases"])]
    ref_voice = load(ROOT / a.ref_voice)
    _, ref_f0 = f0_track(ref_voice)
    f0_ref = float(np.nanmedian(ref_f0))
    takes = [Take(t, w) for t, w in zip(a.take, a.words)]
    level = float(np.median([tk.lufs for tk in takes]))
    for tk in takes:
        tk.gain = 10 ** ((level - tk.lufs) / 20)
    from resemblyzer import VoiceEncoder, preprocess_wav
    enc = VoiceEncoder("cpu", verbose=False)
    e_ref = enc.embed_utterance(preprocess_wav(ref_voice.astype(np.float32), source_sr=SR))
    for tk in takes:
        e = enc.embed_utterance(preprocess_wav(tk.x.astype(np.float32), source_sr=SR))
        tk.sim = float(np.dot(e_ref, e) / (np.linalg.norm(e_ref) * np.linalg.norm(e)))
    print(f"reference voice F0 {f0_ref:.1f} Hz; takes matched to {level:.1f} LUFS")
    for i, tk in enumerate(takes, 1):
        have = "all phrases" if len(tk.present) == len(PHRASES) else "phrases " + ",".join(str(k + 1) for k in sorted(tk.present))
        print(f"  take {i}: {tk.name}  ({len(tk.x) / SR:.1f}s, {tk.lufs:.1f} LUFS, speaker sim {tk.sim:.3f}, {have})")

    cuts = [[tk.cut(k, ref_dur[k]) if k in tk.present else None for tk in takes] for k in range(len(PHRASES))]
    for row in cuts:
        for tk, c in zip(takes, row):
            if c:
                c["sim_cost"] = (max(0.0, SIM_OK - tk.sim) / SIM_UNIT) ** 2
    if a.emotion:
        emotion_costs(cuts, f0_ref)
    consensus = [float(np.median([semitones(c["f0"], f0_ref, np.nan) for c in row if c and math.isfinite(c["f0"])] or [0.0]))
                 for row in cuts]
    scored = [[unit_cost([cuts[k][t] for k in ks], [ref_dur[k] for k in ks], f0_ref, [consensus[k] for k in ks],
                         pitch_w=0.5 if a.emotion else 1.0)
               for t in range(len(takes))] for ks in UNITS]
    unit_of = {k: u for u, ks in enumerate(UNITS) for k in ks}
    forced = {}
    for p in filter(None, a.pick.split(",")):
        k, t = (int(v) - 1 for v in p.split("="))
        forced[unit_of[k]] = t
    upath, total = comp([[sc[0] for sc in row] for row in scored], forced, cuts)
    path = [upath[unit_of[k]] for k in range(len(PHRASES))]

    print("\nunit      target | " + " | ".join(f"take {i}: need  cost" for i in range(1, len(takes) + 1)) + " | pick")
    for u, ks in enumerate(UNITS):
        target = sum(ref_dur[k] for k in ks)
        name = f"P{ks[0] + 1}" + (f"-{ks[-1] + 1}" if len(ks) > 1 else "")
        cells = [f"{sum(cuts[k][t]['nat'] for k in ks) / target:5.2f}x {scored[u][t][0]:6.2f}"
                 if all(cuts[k][t] for k in ks) else "-" for t in range(len(takes))]
        print(f"{name:7s} {target:6.2f}s | " + " | ".join(f"{c:>14s}" for c in cells) + f" | {upath[u] + 1}"
              + (" (forced)" if u in forced else ""))
    print(f"comp cost {total:.2f}, take switches: {sum(upath[u] != upath[u - 1] for u in range(1, len(upath)))}")
    for k in range(1, len(PHRASES)):
        if path[k] != path[k - 1]:
            a_, b_ = path[k - 1], path[k]
            jc = join_pitch_cost(cuts[k - 1][a_], cuts[k][b_], cuts[k - 1][b_], cuts[k][a_])
            print(f"  switch P{k}|P{k + 1}: take {a_ + 1} -> {b_ + 1} (base {switch_cost(k):.1f}, pitch step {jc:.2f})")
    if a.emotion:
        print("\nemotion: z vs the other readings (pitch, range, loudness, effort), wanted -> chosen reading")
        for k in range(len(PHRASES)):
            c = cuts[k][path[k]]
            n = sum(1 for cc in cuts[k] if cc)
            print(f"  P{k + 1:<2} ({n:2d} readings) wanted " + " ".join(f"{v:+.1f}" for v in EMOTION[k])
                  + "  got " + " ".join(f"{v:+.1f}" for v in c["emo"]) + f"  cost {c['emo_cost']:.2f}  {PHRASES[k][:34]}")

    # performance arc: per sentence, a register shift towards ARC (duration-weighted F0 of the chosen readings)
    reg_shift, arc_db = [0.0] * len(PHRASES), [0.0] * len(PHRASES)
    if a.emotion:
        for ks, register, db in ARC:
            st = [(semitones(cuts[k][path[k]]["f0"], f0_ref), cuts[k][path[k]]["nat"]) for k in ks
                  if math.isfinite(cuts[k][path[k]]["f0"])]
            now = sum(v * w for v, w in st) / sum(w for _, w in st) if st else register
            move = REGISTER_AMOUNT * (register - now)
            if register * move < 0:  # the reading is already brighter / darker than asked: keep it
                move = 0.0
            for k in ks:
                reg_shift[k] = float(np.clip(move, -REGISTER_MAX, REGISTER_MAX))
                arc_db[k] = db
    fitted = []
    for k in range(len(PHRASES)):
        seg = stretch(cuts[k][path[k]]["seg"], scored[unit_of[k]][path[k]][1]["tempo"], reg_shift[k])
        f = int(0.004 * SR)
        seg[:f] *= np.linspace(0, 1, f)
        seg[-f:] *= np.linspace(1, 0, f)
        fitted.append(seg)
    levels = np.array([active_db(seg) for seg in fitted])
    mid = float(np.median(levels))
    fitted = [seg * 10 ** ((-(lv - mid) * (1 - LEVEL_KEEP) + db) / 20) for seg, lv, db in zip(fitted, levels, arc_db)]

    # slots (ms-exact): a unit fills exactly its reference duration, padded at its end if it could not
    # slow down enough; one that could not speed up enough overruns and moves the timeline (reported)
    slots = [0.0] * len(PHRASES)
    shift = 0.0
    for ks in UNITS:
        target = round(sum(ref_dur[k] for k in ks), 3)
        durs = [round(len(fitted[k]) / SR, 3) for k in ks]
        for k, d in zip(ks, durs):
            slots[k] = d
        if sum(durs) <= target + 0.002:
            slots[ks[-1]] = round(target - sum(durs[:-1]), 3)
        shift += sum(slots[k] for k in ks) - target

    packed, phrases, out_words, comp_log, t = [], [], [], [], 0.0
    for k in range(len(PHRASES)):
        pid, c = k + 1, cuts[k][path[k]]
        tempo = scored[unit_of[k]][path[k]][1]["tempo"]
        dur = min(len(fitted[k]) / SR, slots[k])
        n = int(round(slots[k] * SR))
        seg = np.concatenate([fitted[k], np.zeros(max(0, n - len(fitted[k])))])[:n]
        phrases.append([pid, round(t, 3), round(t + slots[k], 3)])
        spans = []
        for i in c["idx"]:
            ws, we = takes[path[k]].times[i]
            ns = min(time_map(c["bp"], max(0.0, ws - c["s"])) / tempo, dur)
            ne = min(max(time_map(c["bp"], max(0.0, we - c["s"])) / tempo, ns + 0.02), dur)
            spans.append((ns, ne))
        for i, (ns, ne) in zip(c["idx"], snap_words(fitted[k], spans)):
            out_words.append([takes[path[k]].tok[i][2], round(t + ns, 3), round(t + ne, 3)])
        comp_log.append({"phrase": pid, "take": c["take"], "tempo": round(tempo, 3),
                         "natural": round(c["nat"], 3), "fitted": round(dur, 3), "slot": round(slots[k], 3),
                         "f0": round(c["f0"], 1), "level_db": round(float(levels[k]), 1),
                         "clip_gain_db": round(-(float(levels[k]) - mid) * (1 - LEVEL_KEEP) + arc_db[k], 1),
                         **({"register_shift_st": round(reg_shift[k], 2)} if a.emotion else {}),
                         **({"emotion_z": [round(float(v), 2) for v in c["emo"]]} if a.emotion else {})})
        packed.append(seg)
        packed.append(np.zeros(int(round(GAP * SR))))
        t = round(t + slots[k] + GAP, 3)
    y = np.concatenate(packed[:-1])
    y, eq = match_eq(y, ref_voice)
    if not np.all(np.isfinite(y)) or np.max(np.abs(y)) >= 1.0:
        raise SystemExit("fitted voiceover is not finite / clips: check the takes and the reference voice")
    print("match EQ towards the reference voice (dB per 1/3 octave):",
          ", ".join(f"{fc}:{g:+.1f}" for fc, g in eq.items() if abs(g) >= 0.3))
    out = ROOT / a.out
    out.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                    "-c:a", "flac", "-sample_fmt", "s32", str(out)], input=y.astype(np.float32).tobytes(), check=True)
    timing = {"source": a.label, "packed_file": a.out, "phrases": phrases, "words": out_words,
              "tokens_mapped": True, "comp": comp_log}
    (ROOT / a.timing_out).write_text(json.dumps(timing, ensure_ascii=False, indent=1))
    print()
    for r in comp_log:
        print(f"P{r['phrase']:<2} {r['take']:22s} natural {r['natural']:5.2f}s x{r['tempo']:.3f} -> {r['fitted']:5.2f}s "
              f"(slot {r['slot']:5.2f}s)  F0 {r['f0']:6.1f} Hz  level {r['level_db']:6.1f} dB (clip gain {r['clip_gain_db']:+.1f})"
              + (f"  register {r['register_shift_st']:+.2f} st" if "register_shift_st" in r else ""))
    print(f"timeline shift vs reference edit: {shift:+.3f}s")
    print(f"wrote {out} ({len(y) / SR:.2f}s) and {a.timing_out}")


if __name__ == "__main__":
    main()

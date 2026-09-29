"""Comp the ESKAYLI DZ voice-over from the directed section takes (the user's cloned voice).

Usage: python3 utils/voice/comp_vo.py [--takes voice/takes] [--pick 9=s4_b,...] [--report qa/voice_report.txt]

Takes are named <section>_<variant>.flac (s1_a, s1_b, …; sections in script.SECTIONS). For each take:
  1. French ASR with word timestamps (faster-whisper large-v3-turbo, the brand names as a prompt),
     cached as <take>_words.json;
  2. the words are aligned to the script and every phrase is cut at its pauses, trimmed, its vocal-fry
     lead-in removed and its inner pauses kept natural (≤ 0.30 s);
  3. every reading is scored: a clean read (ASR match, confidence, no inserted word), the voice itself
     (speaker similarity of the take to the real voice, a voice that stays voiced), register (pitch vs
     the real voice), pace (duration vs the other readings, per section) and prosody (pitch, range,
     loudness, vocal effort as z-scores against the other readings, vs what the beat asks for — see
     script.py), plus clean cuts (no cut through continuous speech, no pause the script doesn't have).
One reading per phrase is chosen jointly (dynamic programming): changing take inside a section costs,
more inside a sentence, plus the melodic jump heard at the join. The read is assembled with the
designed pauses, phrase levels evened (half of each phrase's natural deviation kept), a gentle match EQ
towards the real narration, and written as voice/vo_final.wav + config/vo.json (phrases + words on the
film's timeline). Helpers are shared with the portfolio project (utils/voice/fit_vo.py).
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
from scipy import signal

HERE = Path(__file__).resolve()
ESK = HERE.parents[2]
REPO = ESK.parent
sys.path.insert(0, str(HERE.parent))
sys.path.insert(0, str(REPO / "utils/voice"))
import fit_vo as F  # noqa: E402  (shared helpers: load, trim_bounds, f0_track, match_eq, snap_words, …)
from script import LEAD_IN, NNBSP, PHRASES, SECTIONS, TAIL  # noqa: E402

SR = F.SR
REF_VOICE = REPO / "audio/voiceover/clone/voice_sample_clean.mp3"
ASR_PROMPT = "Eskayli DZ, Meta Ads, Facebook, Instagram."
MAX_PAUSE = 0.30            # inner pauses longer than this are shortened to it (natural, not sluggish)
SIM_OK, SIM_UNIT = 0.935, 0.03
VOICED_OK, VOICED_UNIT = 0.45, 0.10
EMOTION_W = 1.0
PACE_W = 3.0
PACE = {"hook": 1.0, "question": 1.04, "problem": 0.97, "business": 1.0, "eskayli": 1.02, "system": 1.0,
        "testing": 0.98, "outcome": 1.05, "idea": 1.02, "brand": 1.06, "cta": 1.06}
SWITCH_IN_SENTENCE, SWITCH_AT_PAUSE, JOIN_PITCH = 3.0, 0.8, 0.15
LEVEL_KEEP = 0.5
RUN_ON_CUT = 2.0          # a phrase cut out of continuous speech (every phrase gets a designed pause after it)


def tokens(text):
    """Display or spoken text -> word tokens (punctuation glued the French way), same count for both."""
    t = text.replace(" ?", NNBSP + "?").replace(" :", NNBSP + ":").replace("« ", "« ").replace(" »", " »")
    return t.split(" ")


def atoms(text):
    t = unicodedata.normalize("NFC", text.lower()).replace("’", "'").replace("&", " et ")
    t = re.sub(r"[.,…?!:;«»\"()  ]", " ", t)
    # French plural -s / -x is silent: « prospects » and « prospect » are the same reading
    return [re.sub(r"(?<=\w{3})[sx]$", "", a) for a in re.split(r"[\s'\-]+", t) if a]


def asr_words(take):
    cache = take.with_name(take.stem + "_words.json")
    if cache.exists():
        return json.loads(cache.read_text())
    from faster_whisper import WhisperModel
    m = WhisperModel("large-v3-turbo", device="cpu", compute_type="int8", cpu_threads=4)
    segs, _ = m.transcribe(str(take), language="fr", word_timestamps=True, initial_prompt=ASR_PROMPT, beam_size=5)
    words = [[w.word.strip(), round(w.start, 3), round(w.end, 3), round(w.probability, 3)] for s in segs for w in s.words]
    cache.write_text(json.dumps(words, ensure_ascii=False))
    return words


def voiced_share(x, s, e):
    """Share of the loud 60 ms frames that are periodic (window-corrected autocorrelation, as in fit_vo)."""
    y = signal.resample_poly(x[int(s * SR):int(e * SR)], 1, 3)
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


class Take:
    def __init__(self, path, enc, e_ref):
        self.path, self.name = path, path.stem
        self.section = self.name.split("_")[0]
        self.ks = SECTIONS[self.section]
        self.x = F.load(path)
        self.words = asr_words(path)
        from resemblyzer import preprocess_wav
        e = enc.embed_utterance(preprocess_wav(self.x.astype(np.float32), source_sr=SR))
        self.sim = float(np.dot(e_ref, e) / (np.linalg.norm(e_ref) * np.linalg.norm(e)))
        self.f0_t, self.f0 = F.f0_track(self.x)
        self.speech_db = F.active_db(self.x)
        self.lufs = F.integrated_lufs(self.x)
        # Seed Audio sometimes stops the file mid-syllable: then the take's last phrase is clipped
        self.truncated = 20 * np.log10(np.sqrt(np.mean(self.x[-int(0.03 * SR):] ** 2)) + 1e-12) - self.speech_db > -30
        self.gain = 1.0
        self.align()

    def align(self):
        self.tok = [(k, j, tk) for k in self.ks for j, tk in enumerate(tokens(PHRASES[k][2]))]
        can, owner = [], []
        for i, (_, _, tk) in enumerate(self.tok):
            for a in atoms(tk):
                can.append(a)
                owner.append(i)
        asr, at = [], []
        for w in self.words:
            for a in atoms(w[0]):
                asr.append(a)
                at.append((w[1], w[2]))
        sm = difflib.SequenceMatcher(None, can, asr, autojunk=False)
        self.times = [None] * len(self.tok)
        self.heard = [0] * len(self.tok)
        for b in sm.get_matching_blocks():
            for d in range(b.size):
                i = owner[b.a + d]
                s, e = at[b.b + d]
                self.times[i] = (s, e) if self.times[i] is None else (min(self.times[i][0], s), max(self.times[i][1], e))
                self.heard[i] += 1
        self.n_atoms = [len(atoms(tk)) for _, _, tk in self.tok]
        self.inserted = []
        for op, i1, i2, j1, j2 in sm.get_opcodes():
            n_ins = (j2 - j1) - (i2 - i1) if op in ("insert", "replace") else 0
            self.inserted += [sum(at[j]) / 2 for j in range(j2 - max(0, n_ins), j2)]
        for i in range(len(self.times)):
            if self.times[i] is None:
                prev = next((self.times[j] for j in range(i - 1, -1, -1) if self.times[j]), (0.0, 0.0))
                nxt = next((self.times[j] for j in range(i + 1, len(self.times)) if self.times[j]), (prev[1] + 0.3, prev[1] + 0.3))
                self.times[i] = (prev[1], max(prev[1] + 0.05, nxt[0]))

    def boundary(self, i):
        """Cut point between token i and i + 1: middle of the longest silence, else the quietest 10 ms."""
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
            if (r1 - r0) / SR >= F.MIN_SILENCE:
                return (ia + (r0 + r1) / 2) / SR, (r1 - r0) / SR
        return (ia + int(np.argmin(rms[w:-w])) + w) / SR, 0.0

    def speech_onset(self, s, e):
        seg = self.x[int(s * SR):int(e * SR)]
        hf = signal.sosfilt(signal.butter(4, 3000, "highpass", fs=SR, output="sos"), seg)
        w = int(0.01 * SR)
        hf = np.sqrt(np.convolve(hf ** 2, np.ones(w) / w, mode="same"))
        strong = np.max(hf) * 10 ** (-20 / 20)
        for tt in np.arange(0.0, min(e - s, 0.8), 0.01):
            j = min(np.searchsorted(self.f0_t, s + tt), len(self.f0) - 1)
            if (np.isfinite(self.f0[j]) and self.f0[j] >= F.CREAK_HZ) or hf[int(tt * SR)] > strong:
                return s + tt - 0.03 if tt >= 0.1 else s
        return s

    def cut(self, k):
        idx = [i for i, (kk, _, _) in enumerate(self.tok) if kk == k]
        join = 0.0
        if idx[0] > 0:
            s0, pause = self.boundary(idx[0] - 1)
            join += RUN_ON_CUT * (pause < F.MIN_SILENCE)
        else:
            s0 = self.times[idx[0]][0] - 0.3
        if idx[-1] + 1 < len(self.tok):
            e0, pause = self.boundary(idx[-1])
            join += RUN_ON_CUT * (pause < F.MIN_SILENCE)
        else:
            e0 = self.times[idx[-1]][1] + 0.45
        s0 = max(0.0, s0, self.times[idx[0]][0] - 0.12)
        e0 = min(len(self.x) / SR, e0, self.times[idx[-1]][1] + 0.18)
        s, e = F.trim_bounds(self.x, s0, e0, thr_db=-38.0, pad=0.04)
        s = self.speech_onset(s, e)
        # let the phrase finish: Whisper ends a word before its final fricative / release ("business",
        # "prospects"), so follow the sound until it is quiet — at most 0.25 s, never into the next word
        nxt = self.times[idx[-1] + 1][0] - 0.03 if idx[-1] + 1 < len(self.tok) else len(self.x) / SR
        e = self.ring_out(s, e, min(nxt, e + 0.25))
        raw = self.x[int(s * SR):int(e * SR)] * self.gain
        join += self.unscripted_pauses(idx, s, raw)
        seg, bp = F.squeeze_pauses(raw, max_pause=MAX_PAUSE)
        m = (self.f0_t >= s) & (self.f0_t <= e) & ~np.isnan(self.f0)
        v = self.f0[m]
        probs = [w[3] for w in self.words if w[1] >= s - 0.05 and w[2] <= e + 0.05]
        return {
            "take": self.name, "k": k, "idx": idx, "s": s, "e": e, "seg": seg, "bp": bp, "nat": len(seg) / SR,
            "f0": float(np.median(v)) if m.sum() >= 5 else float("nan"),
            "f0_range": float(12 * np.log2(np.percentile(v, 90) / np.percentile(v, 10))) if m.sum() >= 5 else float("nan"),
            "level": F.active_db(raw) - self.speech_db, "effort": F.vocal_effort(raw),
            "voiced": voiced_share(self.x, s, e),
            "match": sum(self.heard[i] for i in idx) / max(1, sum(self.n_atoms[i] for i in idx)),
            "prob": float(np.mean(probs)) if probs else 0.5,
            "inserted": sum(1 for ti in self.inserted if s <= ti <= e),
            "join": join,
            # clipped only if the file stops on this phrase (a pickup's throwaway ending absorbs the cut)
            "clipped": bool(self.truncated and k == self.ks[-1] and len(self.x) / SR - self.times[idx[-1]][1] < 0.6),
            "f0_start": self.f0_median(self.times[idx[0]][0] - 0.05, self.times[idx[0]][0] + 0.35),
            "f0_end": self.f0_median(self.times[idx[-1]][1] - 0.35, self.times[idx[-1]][1] + 0.05),
        }

    def ring_out(self, s, e, limit):
        """Extend the end e while the signal is still above -42 dB re the phrase peak (5 ms steps)."""
        w = int(0.005 * SR)
        peak = np.max(np.abs(self.x[int(s * SR):int(e * SR)])) + 1e-9
        t = e
        while t + 0.005 <= limit:
            fr = self.x[int(t * SR):int(t * SR) + w]
            if 20 * np.log10(np.sqrt(np.mean(fr ** 2)) / peak + 1e-12) < -42:
                break
            t += 0.005
        return min(limit, t + 0.02) if t > e else e

    def unscripted_pauses(self, idx, s, raw):
        """0.8 per pause (>= 0.12 s) inside the phrase where the script has no punctuation (x1.5 next to its edges)."""
        w = int(0.01 * SR)
        rms = np.sqrt(np.convolve(raw ** 2, np.ones(w) / w, mode="same"))
        quiet = np.concatenate([[0], (20 * np.log10(rms / (np.max(rms) + 1e-12) + 1e-12) < -40).astype(int), [0]])
        d = np.diff(quiet)
        cost = 0.0
        for r0, r1 in zip(np.where(d == 1)[0], np.where(d == -1)[0]):
            if r0 == 0 or r1 >= len(raw) or (r1 - r0) / SR < 0.12 or len(idx) < 2:
                continue
            tc = s + (r0 + r1) / 2 / SR
            j = min(range(len(idx) - 1), key=lambda n: abs((self.times[idx[n]][1] + self.times[idx[n + 1]][0]) / 2 - tc))
            if not re.search(r"[,.…?!:;»]$", self.tok[idx[j]][2]):
                cost += 0.8 * (1.5 if j == 0 or j == len(idx) - 2 else 1.0)
        return cost

    def f0_median(self, a, b):
        v = self.f0[(self.f0_t >= a) & (self.f0_t <= b)]
        v = v[~np.isnan(v)]
        return float(np.median(v)) if len(v) >= 3 else float("nan")


def score(readings, f0_ref, takes):
    """Cost of every reading of one phrase (list of cut dicts)."""
    sec = PHRASES[readings[0]["k"]][0]
    target = PHRASES[readings[0]["k"]][4]
    durs = np.array([c["nat"] for c in readings])
    pace_target = float(np.median(durs)) * PACE.get(sec, 1.0)
    feats = np.array([[F.semitones(c["f0"], f0_ref, np.nan), c["f0_range"], c["level"], c["effort"]] for c in readings], float)
    mu, sd = np.nanmean(feats, axis=0), np.nanstd(feats, axis=0) + 1e-6
    for c, f in zip(readings, feats):
        tk = takes[c["take"]]
        z = np.nan_to_num((f - mu) / sd)
        st = F.semitones(c["f0"], f0_ref, 0.0)
        c["z"] = z
        c["parts"] = {
            "read": 3.0 * (1 - c["match"]) + (1 - c["prob"]) + 1.5 * c["inserted"] + max(0.0, VOICED_OK - c["voiced"]) / VOICED_UNIT
            + 20.0 * c["clipped"],
            "voice": (max(0.0, SIM_OK - tk.sim) / SIM_UNIT) ** 2 + 0.25 * (st / 5.0) ** 2,
            "pace": PACE_W * math.log(c["nat"] / pace_target) ** 2,
            "prosody": EMOTION_W * float(np.mean((np.clip(z, -2, 2) - np.array(target)) ** 2)) if len(readings) > 2 else 0.0,
            "cuts": c["join"],
        }
        c["cost"] = sum(c["parts"].values())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--takes", default=str(ESK / "voice/takes"))
    ap.add_argument("--pick", default="", help="force readings, e.g. 9=s4_b (1-based phrase = take name)")
    ap.add_argument("--report", default=str(ESK / "qa/voice_report.txt"))
    a = ap.parse_args()

    from resemblyzer import VoiceEncoder, preprocess_wav
    enc = VoiceEncoder("cpu", verbose=False)
    ref_voice = F.load(REF_VOICE)
    e_ref = enc.embed_utterance(preprocess_wav(ref_voice.astype(np.float32), source_sr=SR))
    _, rf0 = F.f0_track(ref_voice)
    f0_ref = float(np.nanmedian(rf0))

    paths = sorted(p for p in Path(a.takes).glob("s*_*.flac") if not p.stem.endswith("_words"))
    takes = {p.stem: Take(p, enc, e_ref) for p in paths}
    level = float(np.median([tk.lufs for tk in takes.values()]))
    for tk in takes.values():
        tk.gain = 10 ** ((level - tk.lufs) / 20)

    forced = {}
    for item in filter(None, a.pick.split(",")):
        k, name = item.split("=")
        forced[int(k) - 1] = name

    cand = []
    for k in range(len(PHRASES)):
        rows = [tk.cut(k) for tk in takes.values() if k in tk.ks]
        score(rows, f0_ref, takes)
        if k in forced:
            rows = [c for c in rows if c["take"] == forced[k]]
        cand.append(rows)

    def sw(k, a_, b_):
        """Cost of changing take between phrase k-1 (cut a_) and phrase k (cut b_)."""
        if a_["take"] == b_["take"]:
            return 0.0
        if k not in takes[a_["take"]].ks and k - 1 not in takes[b_["take"]].ks:
            return 0.0  # a forced change (no take holds both phrases): section boundary
        base = SWITCH_IN_SENTENCE if PHRASES[k - 1][1].endswith(",") else SWITCH_AT_PAUSE
        s1, s2 = a_["f0_end"], b_["f0_start"]
        jump = 12 * math.log2(s2 / s1) if math.isfinite(s1 + s2) else 0.0
        return base + JOIN_PITCH * max(0.0, abs(jump) - 3.0) ** 2

    # Viterbi over phrases
    D = [np.array([c["cost"] for c in cand[0]])]
    B = [None]
    for k in range(1, len(cand)):
        prev, cur = cand[k - 1], cand[k]
        Dk, Bk = np.zeros(len(cur)), np.zeros(len(cur), int)
        for j, c in enumerate(cur):
            opts = [D[-1][i] + sw(k, p, c) for i, p in enumerate(prev)]
            Bk[j] = int(np.argmin(opts))
            Dk[j] = opts[Bk[j]] + c["cost"]
        D.append(Dk)
        B.append(Bk)
    path = [int(np.argmin(D[-1]))]
    for k in range(len(cand) - 1, 0, -1):
        path.append(int(B[k][path[-1]]))
    path = path[::-1]
    chosen = [cand[k][path[k]] for k in range(len(cand))]

    # assemble
    segs = []
    for c in chosen:
        seg = c["seg"].copy()
        f = int(0.004 * SR)
        seg[:f] *= np.linspace(0, 1, f)
        seg[-f:] *= np.linspace(1, 0, f)
        segs.append(seg)
    levels = np.array([F.active_db(s) for s in segs])
    mid = float(np.median(levels))
    segs = [s * 10 ** (-(lv - mid) * (1 - LEVEL_KEEP) / 20) for s, lv in zip(segs, levels)]

    out, phrases, words, t = [np.zeros(int(LEAD_IN * SR))], [], [], LEAD_IN
    for k, (c, seg) in enumerate(zip(chosen, segs)):
        dur = len(seg) / SR
        tk = takes[c["take"]]
        spans = []
        for i in c["idx"]:
            ws, we = tk.times[i]
            ns = min(F.time_map(c["bp"], max(0.0, ws - c["s"])), dur)
            ne = min(max(F.time_map(c["bp"], max(0.0, we - c["s"])), ns + 0.02), dur)
            spans.append((ns, ne))
        disp = tokens(PHRASES[k][1])
        for wd, (ns, ne) in zip(disp, F.snap_words(seg, spans)):
            words.append({"w": wd, "phrase": k + 1, "start": round(t + ns, 3), "end": round(t + ne, 3)})
        phrases.append({"id": k + 1, "section": PHRASES[k][0], "text": PHRASES[k][1], "start": round(t, 3),
                        "end": round(t + dur, 3), "take": c["take"]})
        out.append(seg)
        gap = PHRASES[k][3] if k < len(PHRASES) - 1 else TAIL
        out.append(np.zeros(int(round(gap * SR))))
        t = round(t + dur + gap, 3)
    y = np.concatenate(out)
    y, eq = F.match_eq(y, ref_voice)
    if not np.all(np.isfinite(y)) or np.max(np.abs(y)) >= 1.0:
        raise SystemExit("voice-over is not finite / clips")
    wav = ESK / "voice/vo_final.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "pcm_s24le", str(wav)],
                   input=y.astype(np.float32).tobytes(), check=True)
    (ESK / "config/vo.json").write_text(json.dumps({
        "voice": "The user's own voice, cloned with their consent (Higgsfield Seed Audio 1.0, same reference as « Un seul lien » v5)",
        "file": "voice/vo_final.wav", "duration": round(len(y) / SR, 3), "phrases": phrases, "words": words,
    }, ensure_ascii=False, indent=1))

    # report
    lines = [f"VOICE COMP — ESKAYLI DZ ({len(takes)} takes, {len(PHRASES)} phrases); reference F0 {f0_ref:.1f} Hz", "",
             "takes: " + ", ".join(f"{n} sim {tk.sim:.3f}" for n, tk in takes.items()), "",
             "phrase  chosen  cost   read voice  pace prosody cuts | z(pitch,range,loud,effort) | others"]
    for k, c in enumerate(chosen):
        p = c["parts"]
        others = "  ".join(f"{o['take']}:{o['cost']:.2f}" for o in cand[k] if o is not c)
        lines.append(f"P{k + 1:<3} {c['take']:6s} {c['cost']:5.2f}  {p['read']:4.2f} {p['voice']:5.2f} {p['pace']:5.2f} {p['prosody']:6.2f} "
                     f"{p['cuts']:4.1f} | {' '.join(f'{v:+.1f}' for v in c['z'])} | {others}   {PHRASES[k][1][:40]}")
    lines += ["", f"match EQ: " + ", ".join(f"{fc}:{g:+.1f}" for fc, g in eq.items() if abs(g) >= 0.3),
              f"duration {len(y) / SR:.2f} s (lead-in {LEAD_IN} s, tail {TAIL} s)"]
    Path(a.report).parent.mkdir(parents=True, exist_ok=True)
    Path(a.report).write_text("\n".join(lines) + "\n")
    print("\n".join(lines))


if __name__ == "__main__":
    main()

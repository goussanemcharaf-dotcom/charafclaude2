"""Objective checks for voice takes against a reference voice.

Usage: python3 utils/voice/voice_qa.py <reference.wav> <take1> [take2 ...] [--words-out DIR]

For each take:
- speaker similarity to the reference (Resemblyzer d-vector cosine; same person ≈ 0.80+)
- pitch profile (median F0 / spread, pYIN) vs the reference
- speaking rate (syllable-ish: words per second)
- French ASR (faster-whisper large-v3-turbo): language probability and WER against the script
Optionally writes each take's word timestamps (JSON) for utils/voice/fit_vo.py.
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

import jiwer
import librosa
import numpy as np
from resemblyzer import VoiceEncoder, preprocess_wav

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from build_timeline import PHRASES  # noqa: E402

SCRIPT = " ".join(PHRASES)


def norm(t):
    t = unicodedata.normalize("NFC", t.lower()).replace("’", "'")
    t = re.sub(r"[.,…?!:;«»\"() ]", " ", t)
    t = re.sub(r"[-']", " ", t)
    return re.sub(r"\s+", " ", t).strip()


def f0_profile(path):
    y, sr = librosa.load(path, sr=16000, mono=True)
    f0, vflag, _ = librosa.pyin(y, fmin=60, fmax=400, sr=sr, frame_length=1024)
    f0 = f0[vflag & ~np.isnan(f0)]
    return float(np.median(f0)), float(np.percentile(f0, 90) - np.percentile(f0, 10))


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    words_out = None
    if "--words-out" in sys.argv:
        words_out = Path(sys.argv[sys.argv.index("--words-out") + 1])
        args = [a for a in args if a != str(words_out)]
        words_out.mkdir(parents=True, exist_ok=True)
    ref, takes = args[0], args[1:]
    enc = VoiceEncoder("cpu")
    e_ref = enc.embed_utterance(preprocess_wav(ref))
    ref_f0, ref_spread = f0_profile(ref)
    print(f"reference   F0 median {ref_f0:6.1f} Hz, spread {ref_spread:5.1f} Hz")
    from faster_whisper import WhisperModel
    asr = WhisperModel("large-v3-turbo", device="cpu", compute_type="int8", cpu_threads=4)
    for tk in takes:
        e = enc.embed_utterance(preprocess_wav(tk))
        sim = float(np.dot(e_ref, e) / (np.linalg.norm(e_ref) * np.linalg.norm(e)))
        f0, spread = f0_profile(tk)
        segs, info = asr.transcribe(tk, language=None, word_timestamps=True, beam_size=5, vad_filter=False)
        words, text = [], []
        for s in segs:
            text.append(s.text)
            for w in s.words:
                words.append([w.word.strip(), round(w.start, 3), round(w.end, 3), round(w.probability, 3)])
        hyp = " ".join(text)
        wer = jiwer.wer(norm(SCRIPT), norm(hyp))
        dur = librosa.get_duration(path=tk)
        print(f"\n{Path(tk).name}: {dur:.2f}s | speaker sim {sim:.3f} | F0 {f0:6.1f} Hz (spread {spread:5.1f}) | "
              f"lang {info.language} p={info.language_probability:.2f} | WER {wer:.1%} | {len(words) / dur:.2f} words/s")
        print("  ASR:", hyp.strip())
        if words_out:
            (words_out / (Path(tk).stem + "_words.json")).write_text(json.dumps({"words": words}, ensure_ascii=False))


if __name__ == "__main__":
    main()

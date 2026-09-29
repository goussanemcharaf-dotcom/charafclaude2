"""QA of the assembled Eskayli voice-over: French ASR (WER against the script), speaker similarity
to the real voice, pitch, and a click check at every phrase edge.

Usage: python3 utils/voice/voice_qa.py [voice/vo_final.wav]
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

import jiwer
import numpy as np

HERE = Path(__file__).resolve()
ESK = HERE.parents[2]
sys.path.insert(0, str(HERE.parent))
import comp_vo as C  # noqa: E402


def norm(t):
    t = unicodedata.normalize("NFC", t.lower()).replace("’", "'").replace("&", " et ")
    t = re.sub(r"[.,…?!:;«»\"()  ]", " ", t)
    t = re.sub(r"[-']", " ", t)
    t = re.sub(r"\b(\w{4,})[sx]\b", r"\1", t)  # French plural -s is silent
    return re.sub(r"\s+", " ", t).strip()


def main():
    wav = Path(sys.argv[1]) if len(sys.argv) > 1 else ESK / "voice/vo_final.wav"
    script = " ".join(p[2] for p in C.PHRASES)
    from faster_whisper import WhisperModel
    m = WhisperModel("large-v3-turbo", device="cpu", compute_type="int8", cpu_threads=4)
    segs, _ = m.transcribe(str(wav), language="fr", initial_prompt=C.ASR_PROMPT, beam_size=5, vad_filter=True)
    hyp = " ".join(s.text.strip() for s in segs)
    wer = jiwer.wer(norm(script), norm(hyp))
    from resemblyzer import VoiceEncoder, preprocess_wav
    enc = VoiceEncoder("cpu", verbose=False)
    x = C.F.load(wav)
    er = enc.embed_utterance(preprocess_wav(C.F.load(C.REF_VOICE).astype(np.float32), source_sr=C.SR))
    ex = enc.embed_utterance(preprocess_wav(x.astype(np.float32), source_sr=C.SR))
    sim = float(np.dot(er, ex) / np.linalg.norm(er) / np.linalg.norm(ex))
    _, f0 = C.F.f0_track(x)
    v = f0[np.isfinite(f0)]
    # clicks: sample-to-sample jumps at phrase edges, vs the typical jump inside speech
    vo = json.loads((ESK / "config/vo.json").read_text())
    d = np.abs(np.diff(x))
    ref_jump = np.percentile(d[d > 1e-5], 99.9)
    worst = max(float(np.max(d[max(0, int(t * C.SR) - 240):int(t * C.SR) + 240]))
                for p in vo["phrases"] for t in (p["start"], p["end"]))
    lines = [f"voice QA — {wav.name}",
             f"speaker similarity to the real voice: {sim:.3f}",
             f"median F0 {np.median(v):.1f} Hz, 10-90 % spread {np.percentile(v, 90) - np.percentile(v, 10):.1f} Hz",
             f"French WER vs the script: {wer * 100:.1f} %",
             f"largest sample jump at a phrase edge: {worst:.4f} (99.9th pct inside speech {ref_jump:.4f})",
             f"ASR: {hyp}"]
    print("\n".join(lines))
    rep = ESK / "qa/voice_report.txt"
    rep.write_text(rep.read_text() + "\n" + "\n".join(lines) + "\n")


if __name__ == "__main__":
    main()

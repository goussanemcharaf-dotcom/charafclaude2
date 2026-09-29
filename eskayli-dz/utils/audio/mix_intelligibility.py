"""Intelligibility check of the final mix: the same French ASR, the same script, run on the voice alone
and on the master (voice + music + SFX). If the music hid words, the WER of the mix would rise.

Usage: python3 utils/audio/mix_intelligibility.py   → appends to qa/audio_report.txt
"""
import json
import subprocess
import sys
import tempfile
from pathlib import Path

import jiwer

HERE = Path(__file__).resolve()
ESK = HERE.parents[2]
sys.path.insert(0, str(ESK / "utils/voice"))
import comp_vo as C  # noqa: E402
from voice_qa import norm  # noqa: E402


def main():
    from faster_whisper import WhisperModel
    m = WhisperModel("large-v3-turbo", device="cpu", compute_type="int8", cpu_threads=4)
    ref = norm(" ".join(p[2] for p in C.PHRASES))
    end = json.loads((ESK / "config/timeline.json").read_text())["phrases"][-1]["end"] + 0.4
    out = ["", "mix intelligibility — French ASR (large-v3-turbo, VAD) against the script, both files cut 0.4 s after the last word",
           "(Whisper loops on long silent tails, which is not what is being measured)"]
    tmp = Path(tempfile.mkdtemp())
    for label, src in (("voice alone", ESK / "voice/vo_final.wav"), ("final master", ESK / "renders/_work/master_mix.wav")):
        wav = tmp / f"{src.stem}.wav"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-t", f"{end:.3f}", "-ac", "1", "-ar", "16000", str(wav)], check=True)
        segs, _ = m.transcribe(str(wav), language="fr", initial_prompt=C.ASR_PROMPT, beam_size=5, vad_filter=True,
                               condition_on_previous_text=False)
        hyp = " ".join(s.text.strip() for s in segs)
        out.append(f"  {label:<13} WER {jiwer.wer(ref, norm(hyp)) * 100:5.1f} %   {hyp}")
    print("\n".join(out))
    rep = ESK / "qa/audio_report.txt"
    rep.write_text(rep.read_text() + "\n".join(out) + "\n")


if __name__ == "__main__":
    main()

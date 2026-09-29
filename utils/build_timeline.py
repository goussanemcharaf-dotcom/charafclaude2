"""Build the master timeline from the edited voiceover.

Reads audio/voiceover/vo_packed_timing.json and the packed take it points to
("packed_file"; phrases packed with 0.12 s gaps), re-spaces the phrases with the
designed pauses below, and writes:
  - audio/voiceover/vo_final.wav   (48 kHz mono, VO on the final timeline)
  - config/timeline.json           (phrases, words, scenes: the single source of
                                    truth for animation, subtitles and SFX sync)
"""
import json
import subprocess
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SR = 48000
FPS = 30

# Canonical French text per phrase (subtitles + on-screen use this, never ASR text).
# U+202F (narrow no-break space) keeps French punctuation attached: "fais ?".
PHRASES = [
    "Si tu es UGC Creator,",
    "Content Creator,",
    "Voice Over Artist ou Influenceur…",
    "et que tu envoies encore ton travail entre Google Drive, WhatsApp et plusieurs liens…",
    "Une vidéo ici.",
    "Un fichier là.",
    "Un autre lien ailleurs.",
    "Et ton client doit chercher partout pour comprendre qui tu es et ce que tu fais ?",
    "Non.",
    "Ton travail mérite une meilleure présentation.",
    "Je crée pour toi un Premium Website Portfolio, pensé autour de ton univers.",
    "Tes projets, tes services, ton style… réunis dans une seule expérience.",
    "Au lieu d'envoyer dix liens…",
    "tu envoies un seul lien.",
    "Ton client clique.",
    "Et découvre un portfolio professionnel, clair et différent.",
    "Écris-moi et on commence.",
]

# Pause after each phrase (seconds). Fast, accelerating first half; a hard
# silence after "Non."; calmer, breathing second half.
GAPS = [0.06, 0.06, 0.06, 0.10, 0.06, 0.06, 0.06, 0.22, 0.72, 0.28, 0.22, 0.30, 0.32, 0.36, 0.12, 0.38]
LEAD_IN = 0.08
TAIL = 1.15


def load_audio(path):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
        capture_output=True, check=True,
    ).stdout
    return np.frombuffer(raw, np.float32).copy()


def merge_tokens(words):
    """Merge ASR fragments like '-over' / "d'" so tokens match the canonical text."""
    out = []
    i = 0
    while i < len(words):
        w, s, e = words[i]
        if w.endswith("'") and i + 1 < len(words):
            out.append([w + words[i + 1][0], s, words[i + 1][2]])
            i += 2
            continue
        if w.startswith("-") and out and not out[-1][0].lower().startswith("voice"):
            out[-1] = [out[-1][0] + w, out[-1][1], e]
        else:
            out.append([w, s, e])
        i += 1
    return out


def main():
    timing = json.loads((ROOT / "audio/voiceover/vo_packed_timing.json").read_text())
    vo = load_audio(ROOT / timing.get("packed_file", "audio/voiceover/vo_packed.opus"))
    phrases, words = timing["phrases"], timing["words"]
    assert len(phrases) == len(PHRASES) == len(GAPS) + 1

    by_phrase = [[] for _ in phrases]
    if timing.get("tokens_mapped"):
        # words already map 1:1 onto the script tokens, in order (utils/voice/fit_vo.py)
        i = 0
        for k, text in enumerate(PHRASES):
            n = len(text.split(" "))
            by_phrase[k] = words[i:i + n]
            i += n
    else:
        # Assign every ASR word to the phrase nearest its midpoint (robust to the
        # few tens of ms of boundary slop in word timestamps).
        def nearest(mid):
            return min(range(len(phrases)), key=lambda k: max(phrases[k][1] - mid, 0, mid - phrases[k][2]))
        for w in words:
            by_phrase[nearest((w[1] + w[2]) / 2)].append(w)

    t = LEAD_IN
    placed, all_words = [], []
    for k, (pid, s, e) in enumerate(phrases):
        dur = e - s
        pw = by_phrase[k] if timing.get("tokens_mapped") else merge_tokens(by_phrase[k])
        tokens = PHRASES[k].split(" ")
        if len(tokens) != len(pw):
            raise SystemExit(f"phrase {pid}: {len(tokens)} tokens vs {len(pw)} ASR words: {tokens} / {pw}")
        for tok, (_, ws, we) in zip(tokens, pw):
            all_words.append({
                "w": tok, "phrase": pid,
                "start": round(t + max(0.0, ws - s), 3),
                "end": round(t + min(dur, we - s), 3),
            })
        placed.append({"id": pid, "text": PHRASES[k], "src": [s, e], "start": round(t, 3), "end": round(t + dur, 3)})
        t += dur + (GAPS[k] if k < len(GAPS) else 0)
    duration = round(placed[-1]["end"] + TAIL, 3)
    frames = int(np.ceil(duration * FPS))
    duration = frames / FPS

    # Assemble the VO on the final timeline (sample-accurate, tiny fades at cuts).
    out = np.zeros(int(duration * SR) + SR, np.float32)
    for p in placed:
        a, b = int(p["src"][0] * SR), int(p["src"][1] * SR)
        seg = vo[a:b].copy()
        f = int(0.004 * SR)
        seg[:f] *= np.linspace(0, 1, f)
        seg[-f:] *= np.linspace(1, 0, f)
        o = int(p["start"] * SR)
        out[o:o + len(seg)] += seg
    out = out[: int(duration * SR)]
    wav = ROOT / "audio/voiceover/vo_final.wav"
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
         "-c:a", "pcm_s24le", str(wav)],
        input=out.tobytes(), check=True,
    )

    P = {p["id"]: p for p in placed}
    W = lambda text, phrase: next(w for w in all_words if w["phrase"] == phrase and w["w"].lower().startswith(text.lower()))

    # Scene map (seconds). Every scene boundary is derived from the VO.
    scenes = {
        "s01_identification": [0.0, round(P[4]["start"] + 0.95, 3)],
        "s02_workflow": [round(P[4]["start"] + 0.95, 3), P[5]["start"] - 0.1],
        "s03_chaos": [P[5]["start"] - 0.1, P[8]["start"] - 0.05],
        "s04_confusion": [P[8]["start"] - 0.05, P[9]["start"]],
        "s05_non": [P[9]["start"], P[11]["start"] - 0.25],
        "s06_reveal": [P[11]["start"] - 0.25, P[12]["start"] - 0.1],
        "s07_organized": [P[12]["start"] - 0.1, P[13]["start"] - 0.1],
        "s08_ten_links": [P[13]["start"] - 0.1, P[14]["start"] - 0.05],
        "s09_one_link": [P[14]["start"] - 0.05, P[15]["start"] - 0.1],
        "s10_client": [P[15]["start"] - 0.1, round(W("professionnel", 16)["start"] - 0.1, 3)],
        "s11_statement": [round(W("professionnel", 16)["start"] - 0.1, 3), P[17]["start"] - 0.3],
        "s12_cta": [P[17]["start"] - 0.3, duration],
    }
    scenes = {k: [round(a, 3), round(b, 3)] for k, (a, b) in scenes.items()}

    cues = {
        "ugc": W("UGC", 1)["start"], "content": W("Content", 2)["start"], "voice": W("Voice", 3)["start"],
        "influenceur": W("Influenceur", 3)["start"], "drive": W("Google", 4)["start"], "whatsapp": W("WhatsApp", 4)["start"],
        "liens": W("liens", 4)["start"], "video": P[5]["start"], "fichier": P[6]["start"], "autre_lien": P[7]["start"],
        "qui": W("qui", 8)["start"], "que_tu_fais": W("ce", 8)["start"], "non": P[9]["start"], "non_end": P[9]["end"],
        "merite": P[10]["start"], "premium": W("Premium", 11)["start"], "univers": W("univers", 11)["start"],
        "projets": W("projets", 12)["start"], "services": W("services", 12)["start"], "style": W("style", 12)["start"],
        "experience": W("seule", 12)["start"], "dix_liens": W("dix", 13)["start"], "un_seul": W("seul", 14)["start"],
        "clique": W("clique", 15)["start"], "decouvre": W("découvre", 16)["start"], "professionnel": W("professionnel", 16)["start"],
        "clair": W("clair", 16)["start"], "different": W("différent", 16)["start"], "ecris": P[17]["start"],
        "commence": W("commence", 17)["start"],
    }
    cues = {k: round(v, 3) for k, v in cues.items()}

    timeline = {
        "fps": FPS, "width": 1080, "height": 1920, "duration": duration, "frames": frames,
        "vo": {"file": "audio/voiceover/vo_final.wav", "voice": timing.get("source", "")},
        "phrases": placed, "words": all_words, "scenes": scenes, "cues": cues,
    }
    (ROOT / "config/timeline.json").write_text(json.dumps(timeline, ensure_ascii=False, indent=1))
    print(f"duration {duration:.3f}s ({frames} frames)")
    for k, v in scenes.items():
        print(f"  {k:20s} {v[0]:6.2f} -> {v[1]:6.2f}")


if __name__ == "__main__":
    main()

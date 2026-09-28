"""Build designed-caption cues (config/captions.json) and the SRT sidecar.

Captions follow the voiceover word timings in config/timeline.json. Phrases
whose words are already on screen as supers (identity bubbles, the three
"ici / là / ailleurs" chips, "Non.", "Ton travail mérite…", the star promise,
the question bubbles, the three statement pills and the CTA) are not
captioned, so text never appears twice.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# (phrase id, first word index, end word index, optional text override)
CHUNKS = [
    (4, 0, 7, None),     # et que tu envoies encore ton travail
    (4, 7, 11, None),    # entre Google Drive, WhatsApp
    (4, 11, 14, None),   # et plusieurs liens…
    (8, 0, 6, None),     # Et ton client doit chercher partout
    (8, 6, 8, "pour comprendre…"),  # "qui tu es / ce que tu fais ?" = on-screen bubbles (cap below)
    (12, 0, 6, None),    # Tes projets, tes services, ton style…
    (12, 6, 11, None),   # réunis dans une seule expérience.
    (13, 0, 5, None),    # Au lieu d'envoyer dix liens…
    (14, 0, 5, None),    # tu envoies un seul lien.
    (15, 0, 3, None),    # Ton client clique.
    (16, 0, 4, "Et découvre un portfolio…"),  # the three adjectives = on-screen pills
]
LEAD, TAIL, MIN_DUR = 0.05, 0.32, 0.75
# hand over to the on-screen super the moment it lands (chunk index -> end time source)
CAPS = {4: ("qui", 8), 10: ("professionnel", 16)}


def main():
    tl = json.loads((ROOT / "config/timeline.json").read_text())
    words = tl["words"]
    cues = []
    for pid, a, b, override in CHUNKS:
        pw = [w for w in words if w["phrase"] == pid][a:b]
        text = override or " ".join(w["w"] for w in pw)
        toks = text.split(" ")
        # per-word highlight times (override keeps the original word times)
        wt = [{"w": tok, "start": pw[min(i, len(pw) - 1)]["start"]} for i, tok in enumerate(toks)]
        cues.append({"text": text, "start": round(pw[0]["start"] - LEAD, 3), "end": round(pw[-1]["end"] + TAIL, 3), "words": wt})
    # contiguous chunks of one phrase hand over directly; enforce a minimum duration
    for i, c in enumerate(cues):
        c["end"] = max(c["end"], c["start"] + MIN_DUR)
        if i + 1 < len(cues) and c["end"] > cues[i + 1]["start"] - 0.02:
            c["end"] = round(cues[i + 1]["start"] - 0.02, 3)
        if i in CAPS:
            prefix, pid = CAPS[i]
            w = next(w for w in words if w["phrase"] == pid and w["w"].lower().startswith(prefix))
            c["end"] = round(min(c["end"], w["start"] - 0.04), 3)
    (ROOT / "config/captions.json").write_text(json.dumps(cues, ensure_ascii=False, indent=1))

    def ts(x):
        ms = int(round(x * 1000))
        h, ms = divmod(ms, 3600000)
        m, ms = divmod(ms, 60000)
        s, ms = divmod(ms, 1000)
        return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

    srt = "\n".join(f"{i + 1}\n{ts(c['start'])} --> {ts(c['end'])}\n{c['text']}\n" for i, c in enumerate(cues))
    out = ROOT / "renders"
    out.mkdir(exist_ok=True)
    (out / "SUBTITLES_FR.srt").write_text(srt, encoding="utf-8")
    for c in cues:
        print(f"{c['start']:6.2f}-{c['end']:6.2f}  {c['text']}")


if __name__ == "__main__":
    main()

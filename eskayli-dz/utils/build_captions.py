"""Build the burned-in caption cues (config/captions.json) and the SRT sidecar (renders/ESKAYLI_SOUS-TITRES_FR.srt).

Both follow the voice-over word timings in config/timeline.json.

Burned-in captions: the film's kinetic typography already sets the narration word by word
(hook, question, problem, business, the four modules, the outcome, the big idea, the brand and
the CTA), so the caption layer only speaks where the words are NOT on screen — no sentence ever
appears twice in the picture. Each cue marks its key words (white, heavier) and at most one accent
word (orange), in the film's own type language.

SRT sidecar: the complete transcript (accessibility / platform captions), max two lines of 42.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# (phrase id, first word index, end word index (exclusive), key word indices, accent word index)
BURNED = [
    (9, 3, 5, {4}, None),           # nous construisons
    (9, 5, 9, {6, 7, 8}, 6),        # votre stratégie Meta Ads
    (9, 9, 13, {12}, None),         # autour de votre business.
    (14, 0, 3, {2}, 2),             # Puis nous lançons,
    (14, 3, 6, {3, 5}, 5),          # testons et optimisons
]
LEAD, TAIL, MIN_DUR = 0.06, 0.30, 0.8

# SRT: phrases split at these word indices (phrase id -> list of split points)
SRT_SPLITS = {3: [5, 12], 4: [6], 9: [3, 9], 14: [6], 28: [7]}


def wrap(text, width=42):
    """At most two lines; break at punctuation or before a conjunction, balance the lengths."""
    if len(text) <= width:
        return text
    words = text.split(" ")
    glue = {"de", "la", "le", "un", "une", "votre", "vos", "des", "ce", "sur", "en", "et", "ou", "qu’une", "à", "ne"}
    best, cut = None, 1
    for i in range(1, len(words)):
        a, b = " ".join(words[:i]), " ".join(words[i:])
        score = max(len(a), len(b))
        if a[-1] in ",…:":
            score -= 8
        if words[i].lower() in {"et", "ou", "pour", "autour", "ce", "choisir", "ne"}:
            score -= 5
        if words[i - 1].lower() in glue:
            score += 10
        if best is None or score < best:
            best, cut = score, i
    return " ".join(words[:cut]) + "\n" + " ".join(words[cut:])


def ts(x):
    ms = int(round(max(0.0, x) * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def main():
    tl = json.loads((ROOT / "config/timeline.json").read_text())
    words = tl["words"]
    phrase_words = lambda pid: [w for w in words if w["phrase"] == pid]

    cues = []
    for pid, a, b, keys, accent in BURNED:
        pw = phrase_words(pid)
        sel = pw[a:b]
        cue_words = [{"w": w["w"], "start": round(w["start"], 3),
                      "kind": "accent" if (a + i) == accent else "key" if (a + i) in keys else "dim"} for i, w in enumerate(sel)]
        cues.append({"start": round(sel[0]["start"] - LEAD, 3), "end": round(sel[-1]["end"] + TAIL, 3), "words": cue_words})
    for i, c in enumerate(cues):
        c["end"] = max(c["end"], c["start"] + MIN_DUR)
        if i + 1 < len(cues) and c["end"] > cues[i + 1]["start"] - 0.03:
            c["end"] = round(cues[i + 1]["start"] - 0.03, 3)
    (ROOT / "config/captions.json").write_text(json.dumps(cues, ensure_ascii=False, indent=1))

    # complete transcript
    full = []
    for p in tl["phrases"]:
        pw = phrase_words(p["id"])
        cuts = [0] + SRT_SPLITS.get(p["id"], []) + [len(pw)]
        for a, b in zip(cuts, cuts[1:]):
            seg = pw[a:b]
            full.append({"text": " ".join(w["w"] for w in seg), "start": seg[0]["start"] - LEAD, "end": seg[-1]["end"] + 0.35})
    for i, c in enumerate(full):
        if i + 1 < len(full):
            c["end"] = min(c["end"], full[i + 1]["start"] - 0.03)
        c["end"] = max(c["end"], c["start"] + 0.7)
    srt = "\n".join(f"{i + 1}\n{ts(c['start'])} --> {ts(c['end'])}\n{wrap(c['text'])}\n" for i, c in enumerate(full))
    out = ROOT / "renders"
    out.mkdir(exist_ok=True)
    (out / "ESKAYLI_SOUS-TITRES_FR.srt").write_text(srt, encoding="utf-8")
    print(f"{len(cues)} burned-in cues, {len(full)} SRT cues")
    for c in cues:
        print(f"  {c['start']:6.2f}-{c['end']:6.2f}  " + " ".join(w["w"] for w in c["words"]))


if __name__ == "__main__":
    main()

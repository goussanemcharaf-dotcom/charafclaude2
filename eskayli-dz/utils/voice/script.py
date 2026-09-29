"""The ESKAYLI DZ narration, phrase by phrase (single source for voice, timeline and subtitles).

Each phrase: (section, display text, spoken text, pause after in s, wanted prosody).
- display text: what subtitles / on-screen show (French typography: ’, « », narrow no-break spaces).
- spoken text: what the TTS was asked to say (same number of words as the display text).
- prosody: z-score targets against the other readings of the same phrase
  (pitch, pitch range, loudness, vocal effort) — calm authority by default.
"""

NNBSP = " "

CALM = (0.0, 0.0, 0.0, 0.0)
AUTHORITY = (-0.4, 0.0, 0.3, 0.2)       # grounded, a little lower, present
QUESTION = (0.3, 0.6, 0.2, 0.2)         # a real question, not a drama
CONFIDENT = (-0.3, 0.3, 0.6, 0.5)       # "Chez Eskayli DZ…": more confident
LIST = (0.0, 0.2, 0.3, 0.2)             # beats of an enumeration
WARM = (-0.2, 0.2, 0.0, 0.0)            # the CTA: calm and certain

PHRASES = [
    # 01 hook
    ("hook", "Vous investissez dans la publicité sur Facebook ou Instagram…",
     "Vous investissez dans la publicité sur Facebook ou Instagram…", 0.34, AUTHORITY),
    # 02 question (a real pause after it)
    ("question", f"Mais est-ce que votre budget vous apporte vraiment des clients{NNBSP}?",
     "Mais est-ce que votre budget vous apporte vraiment des clients ?", 0.95, QUESTION),
    # 03 problem
    ("problem", "Lancer une campagne Meta Ads, ce n’est pas simplement créer une vidéo, choisir un bouton et appuyer sur « Publier ».",
     "Lancer une campagne Meta Ads, ce n'est pas simplement créer une vidéo, choisir un bouton et appuyer sur « Publier ».", 0.55, CALM),
    # 04 business intelligence
    ("business", "Avant de dépenser votre budget publicitaire, il faut comprendre votre business.",
     "Avant de dépenser votre budget publicitaire, il faut comprendre votre business.", 0.40, AUTHORITY),
    ("business", "Votre offre.", "Votre offre.", 0.22, LIST),
    ("business", "Votre marché.", "Votre marché.", 0.22, LIST),
    ("business", "Votre client idéal.", "Votre client idéal.", 0.30, LIST),
    ("business", "Ses besoins, ses frustrations et ses motivations.",
     "Ses besoins, ses frustrations et ses motivations.", 0.55, CALM),
    # 05 Eskayli enters
    ("eskayli", "Chez Eskayli DZ, nous construisons votre stratégie Meta Ads autour de votre business.",
     "Chez Eskayli DZ, nous construisons votre stratégie Meta Ads autour de votre business.", 0.45, CONFIDENT),
    # 06 the Meta Ads system
    ("system", "Nous travaillons le bon angle.", "Nous travaillons le bon angle.", 0.22, LIST),
    ("system", "Le bon message.", "Le bon message.", 0.22, LIST),
    ("system", "La bonne créative.", "La bonne créative.", 0.22, LIST),
    ("system", "Le bon ciblage.", "Le bon ciblage.", 0.50, LIST),
    # 07 testing & optimisation
    ("testing", "Puis nous lançons, testons et optimisons vos campagnes Facebook & Instagram Ads.",
     "Puis nous lançons, testons et optimisons vos campagnes Facebook et Instagram Ads.", 0.60, CONFIDENT),
    # 08 outcome
    ("outcome", f"L’objectif{NNBSP}?", "L'objectif ?", 0.95, QUESTION),
    # no pause after « en : » — every reading links « en_attention » (liaison); the list beats come after
    ("outcome", f"Transformer votre budget publicitaire en{NNBSP}:", "Transformer votre budget publicitaire en :", 0.0, CALM),
    ("outcome", "Attention.", "attention.", 0.55, LIST),
    ("outcome", "Prospects.", "Prospects.", 0.55, LIST),
    ("outcome", "Conversations.", "Conversations.", 0.60, LIST),
    ("outcome", "Clients.", "Clients.", 0.80, CONFIDENT),
    # 09 the big idea
    ("idea", "Parce qu’une bonne publicité ne doit pas seulement générer des vues.",
     "Parce qu'une bonne publicité ne doit pas seulement générer des vues.", 0.32, CALM),
    ("idea", "Elle doit créer de véritables opportunités commerciales.",
     "Elle doit créer de véritables opportunités commerciales.", 0.75, AUTHORITY),
    # 10 brand + CTA
    ("brand", "Eskayli DZ.", "Eskayli DZ.", 0.40, CONFIDENT),
    ("brand", "Meta Ads.", "Meta Ads.", 0.14, LIST),
    ("brand", "Stratégie.", "Stratégie.", 0.14, LIST),
    ("brand", "Création.", "Création.", 0.14, LIST),
    ("brand", "Performance.", "Performance.", 0.55, LIST),
    ("cta", f"Vous voulez faire de Facebook et Instagram un véritable canal d’acquisition pour votre business{NNBSP}?",
     "Vous voulez faire de Facebook et Instagram un véritable canal d'acquisition pour votre business ?", 0.50, QUESTION),
    ("cta", "Parlons de votre projet.", "Parlons de votre projet.", 0.0, WARM),
]

LEAD_IN = 0.12   # s of silence before the first word (the picture starts on frame 0)
TAIL = 2.4       # s after the last word (end card hold)

# The directed section takes: file stem -> the phrases (0-based) it contains.
SECTIONS = {
    "s1": [0, 1], "s2": [2], "s3": [3, 4, 5, 6, 7], "s4": [8, 9, 10, 11, 12], "s5": [13],
    "s6": [14, 15, 16, 17, 18, 19], "s7": [20, 21], "s8": [22, 23, 24, 25, 26, 27, 28],
    "s1q": [1],  # pickup of the question, followed by a throwaway sentence (the s1 takes are clipped at the end)
}

for _sec, disp, say, _gap, _pros in PHRASES:
    assert len(disp.replace(NNBSP + "?", "?").replace(NNBSP + ":", ":").replace("« ", "«").replace(" »", "»").split(" ")) \
        == len(say.replace(" ?", "?").replace(" :", ":").replace("« ", "«").replace(" »", "»").split(" ")), disp

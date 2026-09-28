# Storyboard — « Un seul lien » (36.93 s · 1108 frames @ 30 fps)

All times come from `config/timeline.json` (voiceover word timestamps). Contact sheets of every scene: `qa/sheets/`.
Captions (subtitled versions only) are listed where they apply; phrases already shown as supers are not captioned.

---

### S01 — IDENTIFICATION · 0.00 → 5.61
- **VOICEOVER**: « Si tu es UGC Creator, Content Creator, Voice Over Artist ou Influenceur… et que tu envoies encore ton travail… »
- **ON-SCREEN TEXT**: « Tu es… » → bubbles « UGC Creator », « Content Creator », « Voice Over Artist », « Influenceur » → « Comment présentes-tu / *ton travail ?* »
- **VISUAL**: Violet world. Frame 0 = huge « Tu es… » centred; it settles as a headline while four white identity bubbles (original flat avatars) pop on each spoken role and cluster into a diamond.
- **MOTION**: springs with overshoot from the cluster centre; idle float + blinks; at 4.58 s the cluster spins out with a rotational motion-blur trail; the question lands word-by-word with directional smear.
- **CAMERA**: locked; the title does the move (scale 1.9 → 1, rise).
- **TRANSITION**: 5.40 s violet bars split from the centre (top half up, bottom half down, soft contact shadows) — the white question continues underneath in ink.
- **SOUND**: hook hit + crash on frame 0; pumping sub + plucked arp (120 BPM); pitched pops D5-F5-A5-D6 on each bubble; whoosh on spin-out and split.
- **ASSETS**: `AvatarBubble`, `Avatar` (SVG), `KineticLine`, `QuestionHeadline`.
- **PURPOSE**: the target recognises themself in < 4 s; direct question to the viewer.
- **CAPTION**: from 4.61 s « et que tu envoies encore ton travail ».

### S02 — CURRENT WORKFLOW · 5.61 → 8.30
- **VOICEOVER**: « …entre Google Drive, WhatsApp et plusieurs liens… »
- **ON-SCREEN TEXT**: headline « Comment présentes-tu *ton travail ?* » (moves to the top); tags « Google Drive », « WhatsApp », « + plusieurs liens ».
- **VISUAL**: Light studio, 2.5D layers: a generic file browser « Mes fichiers » (final_V3, final_V3 (1)…) in perspective; a phone with an original chat UI (client asks « Tu peux m'envoyer ton travail ? », creator answers with a video, a voice note, a link); three loose link cards.
- **MOTION**: browser slides in with rotateY; phone rises; messages spring in; links slam from the left with blur; tags pop on the spoken brand names.
- **CAMERA**: static (pressure starts in S03).
- **SOUND**: four-on-the-floor kick enters, hats; soft original notification, message blips, thuds.
- **ASSETS**: `DriveWindow`, `MobileFrame`, `ChatScreen`, `MessageBubble`, `VoiceMessage`, `VideoAttachment`, `LinkCard`, `Chip`.
- **PURPOSE**: "that's exactly what I do" recognition.
- **CAPTION**: « entre Google Drive, WhatsApp » · « et plusieurs liens… »

### S03 — CHAOS · 8.30 → 11.17
- **VOICEOVER**: « Une vidéo ici. Un fichier là. Un autre lien ailleurs. »
- **ON-SCREEN TEXT**: chips « Une vidéo ici. » (top-left) « Un fichier là. » (right) « Un autre lien ailleurs. » (bottom) — each where the word says.
- **VISUAL**: the same workspace buries itself: video card, duplicate file, link, folders « Nouveau dossier (4) », screenshots, voice note, « portfolio_v2.pdf », notifications « C'est lequel, le bon fichier ? » and « Lien expiré ».
- **MOTION**: slams with velocity-matched motion blur; density accelerates; every item jitters more as clutter grows.
- **CAMERA**: handheld shake 0 → 4 px, slow push 1.00 → 1.045.
- **SOUND**: 16th hats, clap on 2 & 4, second arp, slams, glitches, notification.
- **ASSETS**: `Slam`, `VideoCard`, `FileCard`, `FolderCard`, `LinkCard`, `ScreenshotCard`, `Notification` (the chaos layer = `ChaosLayer`).
- **PURPOSE**: make the cost of scattered work visible and a little funny.

### S04 — CLIENT CONFUSION · 11.17 → 14.49
- **VOICEOVER**: « Et ton client doit chercher partout pour comprendre qui tu es et ce que tu fais ? »
- **ON-SCREEN TEXT**: « Accès refusé », tabs multiplying, bubbles « Qui tu es ? » / « Ce que tu fais ? »
- **VISUAL**: the puzzled client avatar leans in from the left edge; a cursor clicks a file (access denied), then zigzags between items leaving a dotted trail; tabs multiply; a spinner on the video.
- **MOTION**: cursor on keyframes synced to « chercher » / « partout » / « comprendre »; impatient idle circles; speech bubbles spring from the avatar.
- **CAMERA**: shake 4 → 9 px and push to 1.13 + slight darkening into the cut.
- **SOUND**: heartbeat double-kick, open hats, click + error buzz, tab ticks, riser + accelerating snare roll to the wall.
- **ASSETS**: `Avatar` (client, puzzled), `Cursor`, `DrawLine`, tab strip, modal.
- **PURPOSE**: switch to the client's point of view; peak tension.
- **CAPTION**: « Et ton client doit chercher partout » · « pour comprendre… »

### S05 — « NON. » · 14.49 → 17.68
- **VOICEOVER**: « Non. » (silence) « Ton travail mérite une meilleure présentation. »
- **ON-SCREEN TEXT**: « Non » + violet point; then « Ton travail mérite » / *« une meilleure » / « présentation. »*
- **VISUAL**: hard cut to pure white. Nothing moves for ~0.9 s. Then the promise rises calmly (Inter Tight ink + Instrument Serif italic violet).
- **MOTION**: none → calm rise-and-unblur (0.85 s), words on the voice.
- **CAMERA**: locked.
- **SOUND**: absolute silence (music + SFX = 0) from 14.49 to 15.35 s; then a warm Fmaj9 pad swell and a reverse cymbal into the reveal.
- **PURPOSE**: pattern break; the emotional hinge of the film.

### S06 — THE REVEAL · 17.68 → 21.65
- **VOICEOVER**: « Je crée pour toi un Premium Website Portfolio, pensé autour de ton univers. »
- **ON-SCREEN TEXT**: « Je crée pour toi » → *« Premium »* « Website Portfolio » → « pensé autour de » *« ton univers. »*
- **VISUAL**: a soft 4-point star draws itself around the promise (light studio), fills violet and swallows the frame; in the violet world a browser rises and the portfolio builds itself: 12-column grid → navigation → Instrument Serif name → portrait unmasks → copy, with Figma-like selection boxes (« Navigation », « Typo — Instrument Serif », « Image »).
- **MOTION**: stroke draw 0.6 s, slow star rotation/breathing; fill + ×6.5 scale (expo-in); layered build with expo-out.
- **CAMERA**: static; the star scale is the camera.
- **SOUND**: 96 BPM grid starts (pad, arp sparkle, soft kick), bell on « Premium », whoosh on the fill, **groove drop at 20.12 s**, UI ticks on each build step.
- **ASSETS**: `Star`, `PortfolioReveal`, `BrowserFrame`, `URLBar`, `PortfolioPage` (+ `Guide`).
- **PURPOSE**: introduce the product as craft, not as a template.

### S07 — EVERYTHING ORGANIZED · 21.65 → 26.19
- **VOICEOVER**: « Tes projets, tes services, ton style… réunis dans une seule expérience. »
- **ON-SCREEN TEXT**: tabs « Projets » « Services » « Style » (checked as they pass) → « une seule » *« expérience. »*; sitemap chips « Projets · Services · Style · À propos · Contact ».
- **VISUAL**: the browser grows to reading size; the page scrolls and **lands on each section exactly on its word**; then zooms out until the whole site is one artboard, framed by viewfinder brackets with a sitemap.
- **MOTION**: in-out cubic scroll steps; continuous zoom-out (screen height held constant while the page extends); whip-out at the end.
- **SOUND**: tab pops, scroll swishes, long whoosh on the zoom-out, bell on « expérience ».
- **ASSETS**: `PortfolioPage` (Nav, Hero, WorkGrid/Project, Voice demo, Services, Style, About, Contact), `Brackets`.
- **PURPOSE**: show everything in one place.
- **CAPTION**: « Tes projets, tes services, ton style… » · « réunis dans une seule expérience. »

### S08 — TEN LINKS · 26.19 → 27.89
- **VOICEOVER**: « Au lieu d'envoyer dix liens… »
- **ON-SCREEN TEXT**: counter « 1 lien … 10 liens » (hits 10 exactly on « dix »).
- **VISUAL**: hard cut to the light studio; ten link cards (Portfolio_v3.pdf, Google Drive — dossier, Vidéo UGC, Démo voix, Projets 2025, Travaux récents, Réseaux sociaux, Media kit, Exemples de Reels, Contact) land one by one into a nervous pile.
- **MOTION**: slams every 70 ms with blur; counter bumps per card.
- **SOUND**: impact on the cut, music **filtered down** to ~400 Hz, thuds + ascending counter ticks.
- **ASSETS**: `LinkStack`, `LinkCard`.
- **CAPTION**: « Au lieu d'envoyer dix liens… »

### S09 — ONE LINK · 27.89 → 29.44
- **VOICEOVER**: « …tu envoies un seul lien. »
- **ON-SCREEN TEXT**: counter flips « 10 » → « 1 seul lien »; pill « tonnom.com ».
- **VISUAL**: the ten cards align into a neat deck (on « tu »), collapse (on « un »), and merge into one violet link pill (on « seul ») with a ring; a send button appears and the link is sent upward.
- **MOTION**: in-out expo align, expo-in collapse, spring merge, expo-in send.
- **SOUND**: swoosh / reverse swoosh, **impact + bell on « seul »**, filter opens, send click + whoosh.
- **ASSETS**: `LinkCollapse`.
- **CAPTION**: « tu envoies un seul lien. »

### S10 — THE CLIENT OPENS IT · 29.44 → 31.46
- **VOICEOVER**: « Ton client clique. Et découvre un portfolio… »
- **VISUAL**: a white circle blooms with concentric rings; the phone rises; in an original DM: « Tu as un portfolio ? » — « Oui, tout est ici : » + link preview (Inès Morel — UGC Creator & Voice Over · tonnom.com). Tap on « clique »: the preview expands into the mobile portfolio, which scrolls to the projects on « découvre ».
- **MOTION**: rise with vertical motion blur; shared-element expand (clip-path) 0.46 s; smooth scroll.
- **SOUND**: whoosh, message blips, tap click, open swoosh.
- **ASSETS**: `MobileFrame`, `ChatScreen` (dm theme), `Tap`, `Rings`, `PortfolioMobile`.
- **CAPTION**: « Ton client clique. » · « Et découvre un portfolio… »

### S11 — THE STATEMENT · 31.46 → 33.80
- **VOICEOVER**: « …professionnel, clair et différent. »
- **ON-SCREEN TEXT**: pills « Professionnel. » « Clair. » « Différent. » (each on its word); « Inès *Morel* », « tonnom.com · UGC · VOICE OVER ».
- **VISUAL**: zoom-through from the phone into the portfolio's strongest section, full frame and editorial: portrait card on paper, oversized serif name overlapping the photo.
- **MOTION**: slow push-in (1.00 → 1.07); pills slide + spring with blur.
- **SOUND**: zoom whoosh, pitched pops + soft thuds on the three words.
- **PURPOSE**: let the design breathe — the product is the statement.

### S12 — CTA · 33.80 → 36.93
- **VOICEOVER**: « Écris-moi et on commence. »
- **ON-SCREEN TEXT**: « TON TRAVAIL. / TON STYLE. / TON PORTFOLIO. / [UN SEUL LIEN.] » + composer « Écris-moi et on commence. »
- **VISUAL**: a violet star wipes in from the centre; four lines slam in; a message composer rises and types the CTA as it is spoken; the send button pulses. Held static ≥ 1.8 s. Everything inside the safe zones.
- **MOTION**: kinetic lines from the left with smear; per-word typing; send tap + ring + soft glow.
- **SOUND**: whoosh, four hits, typing clicks, final Fmaj9 + kick/crash on « commence », CTA bell on the send tap, ring-out.
- **ASSETS**: `CTA`, `Star`, `KineticLine`.
- **PURPOSE**: one clear action.

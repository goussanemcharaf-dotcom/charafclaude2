# Creative Brief — « Un seul lien »

**Premium Website Portfolio · Meta Ad (Instagram Reels / Facebook Reels) · 9:16 · French**

| | |
|---|---|
| Format | 1080 × 1920, 30 fps, H.264 + AAC, 36.9 s |
| Language | 100 % French (voice, captions, supers, CTA). Creator-industry terms (UGC Creator, Voice Over, Reels) only where they are the real names of the jobs/formats. |
| Voice | The client's own voice — cloned (with their consent) from their own promo narration: the person who makes the portfolios is the one speaking. Direct, confident, conversational "tu", European French. Performed, not read: each beat has its colour — a bright call-out, an exasperated question, a low and firm « Non. », a closer, calmer « Ton travail mérite une meilleure présentation. », pride building into the drop, the affirmation on « un seul lien », a settled invitation. |
| Production | 2D / 2.5D only — React + SVG + CSS rendered with Remotion, audio synthesized in Python, assembled with FFmpeg. No Blender, no 3D pipeline, no WebGL. |
| Style reference | The supplied Reel (violet/white kinetic-typography ad). Used for **motion language only** — no footage, face, name, copy or assets from it. |

---

## TARGET
French-speaking creators who sell their work to brands and clients: UGC creators, content creators, voice-over artists, influencers — and by extension video creators, freelancers, coaches, personal brands, real-estate creators and other creative professionals.
They are good at the work itself, and weak at *presenting* it.

## PROBLEM
Their work lives in ten places: a cloud drive, a chat thread, file-transfer links, an old PDF, a reel somewhere. When a client asks "tu peux m'envoyer ton travail ?", the answer is a pile of links. The client has to dig, gets blocked by permissions, opens tab after tab — and still can't tell **who they are and what they do**.

## INSIGHT
Clients don't judge the work in isolation — they judge it through the way it's presented. Ten scattered links make excellent work look amateur; one clear, well-designed place makes it look professional before a single video is played.

## PROMISE
« Au lieu d'envoyer dix liens… tu envoies un seul lien. » A premium portfolio website built around the creator's own universe: projects, services, style — one experience, one link.

## POSITIONING
Not a template, not a link-in-bio tool, not "a website": a **premium, made-for-you presentation layer** for creative work. Crafted, editorial, personal — the design serves the creator's identity, not the other way round.

## CORE IDEA
> **Votre travail mérite mieux que dix liens envoyés au hasard.**
> (in the ad's voice: « Ton travail mérite une meilleure présentation. »)

The whole film is one transformation: **10 → 1**. Chaos that the viewer recognises from their own phone, a hard stop (« Non. »), then calm, precise, premium.

## VISUAL DNA
Two alternating worlds, as in the reference:
- **Light studio** — soft white/grey radial "infinity cove". Where UI lives (the messy "before", the ten links, the phone).
- **Violet world** — saturated radial violet. Where identity and promise live (who you are, the portfolio build, the CTA).
- **Pure white** — used once, for « Non. ».

Recurring devices (all redrawn from scratch): kinetic word-by-word type with directional motion blur · white identity bubbles that pop, cluster and spin out · the soft 4-point star (draws itself, fills, swallows the frame) · violet bars splitting open · viewfinder brackets · concentric rings behind the phone · a dotted zigzag trail.

The **portfolio is the hero**: warm paper, ink, Instrument Serif, lots of air. It's deliberately calmer and more "designed" than the ad around it.

## COLOR SYSTEM
| Token | Hex | Use |
|---|---|---|
| Violet | `#7B3FF2` | brand accent, pills, dot of « Non. », star |
| Violet bright / deep / night | `#9466FF` / `#5B21D6` / `#3E13A6` | radial violet world, depth |
| Lavender | `#D9CCFF` | serif emphasis on violet, caption highlight |
| Ink | `#0B0B12` | type on light |
| Studio | `#FFFFFF → #C4C4CE` radial | light world |
| Portfolio paper / ink / clay / sage | `#F4F1EC` / `#16140F` / `#B86B4B` / `#A3B19B` | the fictional creator's own palette (her "univers") |

## TYPOGRAPHY
- **Inter Tight 800** — kinetic ad type, tight tracking (−0.045 em), word-by-word.
- **Instrument Serif (italic)** — emotional emphasis: « ton travail ? », « une meilleure présentation. », « ton univers. », « expérience. »
- **Geist / Geist Mono** — the portfolio's body and metadata (editorial web).
- **Inter** — generic app UI (file browser, chat, notifications).
All fonts are local (OFL), loaded before render.

## MOTION SYSTEM
- **Before = snappy & nervous**: slams with velocity-matched motion blur, overshoot springs, jitter that grows with the clutter, handheld camera shake.
- **« Non. » = stillness**: hard cut, no motion, no music.
- **After = long, precise, calm**: expo-out settles, slow push-ins, a page that builds itself on a 12-column grid, a scroll that lands exactly on each spoken word.
- Transitions are motivated by the story: bars split (identity → workspace), hard cut (chaos → « Non. »), star draw/fill/swallow (promise → product), whip (overview → ten links), merge (10 → 1), zoom-through (phone → statement), star wipe (statement → CTA).
- **Energy layer, locked to the music** (`config/music.json`): a camera punch on every kick, a slow zoom creep through each build, and on the four big moments only (the two drops, the CTA, the send tap) a short shake, a flash, thin shockwave rings and a burst of brand stars. RGB-split glitches are reserved for the chaos (the "digital mess"). A glint crosses the link pill and the send button. Used sparingly, so the drops feel like events.

## SOUND SYSTEM
Original, fully synthesized (no library music, no OS notification sounds):
- **Before** (120 BPM, D minor): a hook hit on frame 0 and the beat from the first second; pumping sub, plucked arpeggio, four-on-the-floor, claps, shaker, accelerating snare roll and a riser that build pressure with the chaos.
- **« Non. »**: absolute digital silence under the voice (0.86 s).
- **After** (117 BPM, F major): warm pad swell under « Ton travail mérite… », a two-bar build under the promise, half a beat of silence, then **drop 1 on « pensé »**: a premium house groove (Fmaj9 – C6/9 – Dm9 – B♭maj9, four-on-the-floor, offbeat bass, chord stabs, sidechain pump). The tempo is computed from the voice so that **drop 2**, the ten links becoming one on « seul », lands exactly 16 beats later: the groove stops dead on the ten links, a count-up build, then the drop. The send tap ends on F major.
- SFX on every visual event: pops, slams, whooshes, clicks, a soft original two-note notification, typing, a bell on the merge and on the CTA.
- Voice first: the voice is compressed (3:1) and the music is ducked by frequency band (9 dB in the voice's mids, 3.5–4.5 dB in the lows and highs), so the groove keeps its weight while every word stays clear (ASR word error rate on the final mix = on the dry voice); master −14 LUFS integrated, true peak ≤ −1.3 dBTP.

## PORTFOLIO STRATEGY
Show the product doing the job, not a mock-up of "a website":
1. It **builds itself** (grid → navigation → typography → portrait → copy) — the viewer sees craft.
2. It **answers the client's two questions** — hero = *qui tu es*, projects/services = *ce que tu fais*.
3. It is **specific to one person's universe** (palette, type, tone in a "Mon univers" section).
4. It exists as **desktop + mobile**, and opens from a DM in one tap.
Persona « Inès Morel — UGC Creator & Voice Over » is fictional; domain `tonnom.com` ("ton nom .com") is an intentional placeholder for the buyer's own name.

## CTA
One action only: **« Écris-moi et on commence. »** — typed in a message composer while it's spoken, send button pulses. Above it: « TON TRAVAIL. TON STYLE. TON PORTFOLIO. UN SEUL LIEN. » No second button, no urgency, no price, no fake scarcity.

## RETENTION STRATEGY
- **0.0 s** — first frame is a full-bleed question « Tu es… » on violet (no logo, no intro). Roles pop in on the exact spoken word: the viewer self-selects in < 4 s.
- **4.7 s** — a direct question to the viewer (« Comment présentes-tu ton travail ? »), then instant recognition of their own mess (drive, chat, links).
- **8–14 s** — escalating chaos with humour ("final_V3 (1).mp4", « Accès refusé », tabs multiplying): tension that begs for release.
- **14.5 s** — pattern break: hard cut to white, silence, « Non. » The strongest stop-scroll moment sits mid-ad on purpose.
- **17.5–26 s** — payoff with continuous novelty (star, self-building site, synced scroll, sitemap) — something new every ~1 s.
- **26–29 s** — the idea made visible: counter 10 → 1.
- **29–34 s** — proof through the client's eyes (DM → tap → site) and a statement frame.
- **34–37 s** — a calm, readable end card with a single CTA, held ≥ 2 s.
- Designed captions for sound-off viewing; key content kept inside Meta's safe zones (top 250 px / bottom 420 px).

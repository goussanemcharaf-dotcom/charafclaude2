# ESKAYLI DZ — Production notes

## What was made
A 79.6 s vertical Meta ad (1080 × 1920, 30 fps, H.264) for ESKAYLI DZ, an Algerian agency that runs strategic Meta Ads
(Facebook & Instagram) acquisition for businesses. 100 % French on screen and in the audio; narrated in the user's own
cloned voice; every frame, sound and caption is keyed to that voice's word timestamps.

Story in one line — **a signal becomes a system becomes a conversion**: one orange signal (the ad budget) enters a
campaign with no clear destination (01–02), the naive « créer · publier · attendre » chain breaks (03), the business is
understood (04), Eskayli structures it (05), angle / message / creative / targeting are worked (06), campaigns are launched,
tested, optimised on Facebook & Instagram (07), the budget becomes attention → prospects → conversations → clients (08),
beyond views into real opportunities (09), and the brand closes on one quiet action: « Parlons de votre projet. » (10).

## Stack (reproducible, no extra frameworks)
- **Picture**: React + SVG + CSS rendered with Remotion 4 (the repository root's `node_modules`), deterministic
  time-based animation (`src/lib/anim.ts`), headless Chromium. Rendered in 240-frame chunks joined with FFmpeg so a late
  fix re-renders only the chunks it touches.
- **Voice**: Higgsfield Seed Audio with the user's voice reference; comp / QA in Python (faster-whisper, Resemblyzer, numpy).
- **Sound**: synthesized in Python (numpy/scipy) — no samples.
- **Delivery**: FFmpeg (x264 High, BT.709, AAC 48 kHz), ITU-R BS.1770 loudness + 4× oversampled true-peak limiter.

```bash
cd eskayli-dz
python3 utils/voice/comp_vo.py --pick 9=s4_c,10=s4_a,15=s6_a,16=s6_c,17=s6_c,18=s6_c,19=s6_c,20=s6_c   # voice comp (takes → vo_final.wav)
python3 utils/build_timeline.py        # voice → config/timeline.json (single source of truth)
python3 utils/build_captions.py        # burned-in cues + SRT
python3 utils/make_grain.py            # grain tile + grid
npm run render:video                   # program (chunks) + subtitle layer (ProRes 4444 alpha)
npm run audio                          # score, SFX, mix, master
python3 utils/audio/mix_intelligibility.py
npm run export                         # all deliverables + qa/export_report.txt
```

## References — used as editing intelligence only
Two references were analysed frame by frame and by ear (`storyboard/01_REFERENCE_GRAMMAR.md`): a French VSL showreel and a
vertical kinetic Reel. Kept as *grammar*: word-per-beat type, the two-beat ghost → solid reveal, small connector + big
keyword, UI cards as narrative devices, an orbit diagram, a full-silence pattern break, depth / rack focus. **Nothing is
reproduced** — no shot, composition, character, asset, colour identity or copy; their neon, heavy italics and talking heads
were refused. The previous ad's 02_META_AD.mp4 was used only to identify the voice.

## Voice — consent, source, method
- **Whose voice**: the user's own voice, cloned earlier in this project from their own narration; the user confirmed it is
  their voice and that they hold the rights. At the user's explicit request it is used here for ESKAYLI DZ. If the ad is run
  for a third-party brand, the user remains responsible for that use of their likeness.
- **Generation**: 26 directed takes (8 script sections × 3 readings + 2 pickups of the question), Higgsfield Seed Audio,
  48 kHz. Script sent without « … » and line breaks (they caused babble); the question was re-recorded as a pickup because
  the section takes were truncated at the end.
- **Comp** (`utils/voice/comp_vo.py`): for every phrase, each reading is scored on text accuracy (French ASR), voice identity
  (similarity to the real voice), pace, the phrase's target prosody (calm authority by default, a real question, more
  confidence from « Chez Eskayli DZ »), and cut quality; a Viterbi pass then minimises take switches inside sentences.
  The enumeration « Attention. Prospects. Conversations. Clients. » is forced from the one take with real pauses, joined to
  « …en : » without a gap to keep the liaison. Match EQ to the reference voice, tails rung out so final consonants are never clipped.
- **Result**: similarity to the real voice **0.978**, median F0 141 Hz, no click at any edit (largest edge jump 0.04 vs 0.37
  inside speech). ASR of the final voice reproduces the script word for word except the brand name, which the recogniser
  spells « sklidz » — the spoken « Eskayli DZ » is clear.
- **Brand pronunciation**: « Es-kay-li Dé-Zèd » (French reading of DZ).

## Picture — the system
- Palette: near-black `#0B0B0C`, paper `#F4F2EE`, greys, **one accent `#FF5A1F`** reserved for the signal, active states,
  conversion and the CTA. Type: Geist + Geist Mono only.
- Two worlds: **noise** (grain, scattered, dim — 01–03) → **system** (hairline grid, precise, accent flows — 03–09) → one
  **paper** frame for the brand (10).
- Camera: macro push and pull (01), lateral track (02), dive into a chip (03→04), slow orbit (04), a column the camera
  travels down with holds and velocity-blurred whips (06), a docking panel (07), a page scrolled then pulled back (08),
  a flight *through* the word « VUES. » into the funnel (09), hard cut to paper (10).
- Continuity devices: the signal, the chips that become a system, the satellites that snap into Eskayli's grid, the eyes
  that converge into « VUES. », the CLIENT plane that lands in the opportunity grid.
- Safe zones: critical content in **y 440–1480**, so the 4:5 (y 285–1635) and 1:1 (y 420–1500) versions are plain centre
  crops that keep every word; the Reels top/bottom UI zones hold only atmosphere.

## Subtitles
The film's kinetic typography already sets almost the whole narration word by word (the brief's own example — « Votre
**BUDGET** … des **CLIENTS** ? » — is chapter 02). Burned-in captions therefore appear only where the words are not on
screen (« nous construisons / votre stratégie Meta Ads / autour de votre business. », « Puis nous lançons, / testons et
optimisons »), in the same type language (grey connectors, white key words, one orange concept), word-synced, no box, no
bounce. The complete transcript is delivered as `ESKAYLI_SOUS-TITRES_FR.srt` for the platform's captions.

## Sound
100 BPM, E minor → E major. Pulse (a low pulse, data ticks, a filtered pad) → a half-time kick and muted bass under the
naive workflow, which **tape-stops** when it breaks → five locks and the groove is born on the new system → riser and impact
into « Chez Eskayli DZ » → the full system groove with a 16th arpeggio, whips, picks, typing, the launch, tests, the loop and
stabs on FACEBOOK / INSTAGRAM / ADS → **absolute silence** on « L'objectif ? » → the conversion section (strongest rhythm, one
refined impact per stage) → a filtered dip for « vues », a snare roll and four whooshes through the funnel, « opportunités
commerciales » at full height → hard cut → the brand in E major (the sonic logo — a rising fifth E5 → B5 — pre-laps the cut so
its second tone lands with the *i*-dot, just before the voice says the name), an arpeggio on the four words, the organised
system on a soft groove, one chord under the CTA.
Voice first: music 5 LU under the voice then ducked by band (3 / 9 / 4 dB), SFX 8.5 LU under; sounds that fell on key words
(the logo on « Eskayli DZ », the notification on « Prospects », the chime on « Clients ») were moved just before them.

## Compliance with the brief
- French only on screen and in the audio (the platform names Meta Ads, Facebook, Instagram are the service itself).
- **No fabricated proof**: no ROAS, revenue, percentages, client counts, testimonials, client logos, success stories or
  campaign screenshots. Bars are test progress, the opportunity cards are categories, the conversation is illustrative.
- Fictional French UI throughout; nothing imitates Meta's interface or is presented as a screenshot; no Meta logos.
- No people's faces or hands (interface-driven storytelling; images are objects and places).
- Final screen: brand, the four words, the question, « PARLONS DE VOTRE PROJET. » — no phone number, badge, countdown or urgency.

## Placeholders and decisions to confirm
- **Wordmark**: « eskaylı DZ » is a typographic treatment made for this film (the *i*-dot is the signal). Replace
  `src/components/Wordmark.tsx` with the official logo if there is one.
- **No contact on screen** (the brief forbids phone numbers on the final screen): use Meta's CTA button (« Envoyer un
  message » / « En savoir plus ») in Ads Manager to carry the action.
- The illustrative city names (Alger, Oran, Constantine) and « 25 – 44 ans » are generic examples, not targeting claims.

## Credits and cost
Higgsfield credits for ESKAYLI: about **27** (≈ 49.3 → 22.45): 26 voice takes + pickups and rejected tests ≈ 25, seven
images 1.75. Rendering, music, SFX, mix and QA ran locally at no cost.

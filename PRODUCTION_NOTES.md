# Production Notes

## Pipeline (2D / 2.5D only — no Blender, no 3D pipeline)

```
voice (clone) ─► comp + fit ─► timeline.json ─► Remotion scenes (React/SVG/CSS) ─► program_clean.mp4
                                         │                    └─► Subtitles layer (ProRes 4444 α)
                                         └─► synthesized music + SFX (numpy/scipy) ─► mix + master (−14 LUFS)
                                                    └─► config/music.json (beat grid, drops) ─► energy layer in the picture
                                                                       FFmpeg ─► 01–04 MP4 + 05 PNG + SRT
```

`config/timeline.json` is the single source of truth: every scene boundary, animation cue, caption and sound effect is derived from the voiceover's word timestamps, so picture, captions and sound can't drift apart.

### Build it yourself
```bash
npm install                      # Remotion 4.0.529, React 19, fonts (OFL)
# (voice already comped: audio/voiceover/vo_packed_timing.json; to redo it, see Voiceover below)
python3 utils/build_timeline.py  # VO -> audio/voiceover/vo_final.wav + config/timeline.json
python3 utils/build_captions.py  # config/captions.json + renders/SUBTITLES_FR.srt
npm run audio                    # music + SFX + mix + master  -> audio/master_mix.wav + config/music.json (render after this)
npm run render:video             # renders/_work/program_clean.mp4 + subtitles_alpha.mov
npm run export                   # renders/01…05 + qa/export_report.txt
npm run studio                   # live preview (Remotion Studio)
node utils/still.mjs MetaAd previews/x 14.6 20.7   # single frames for review
```
Requirements: Node ≥ 18, Python 3 with numpy/scipy (matplotlib for QA plots), FFmpeg with libx264, a Chromium/Chrome (set `REMOTION_CHROME` if not at the default path).
Everything is deterministic (seeded randomness, time-based animation), so a re-render is frame-identical.

## Tools & versions
Remotion 4.0.529 · React 19.1 · TypeScript 5.8 · Chromium headless shell (software GL) · FFmpeg 6.1.1 (libx264, AAC) · Python 3.11 + numpy/scipy · onnxruntime + UVR MDX-Net models (voice isolation) · Higgsfield Seed Audio 1.0 (voice cloning) · faster-whisper large-v3-turbo, Resemblyzer, librosa pYIN (voice QA) · Rubber Band R3 via pylibrb (tempo) · Higgsfield Soul 2 (images).

## Voiceover — the client's own voice
- **Why**: v1 used the ElevenLabs preset « Julian »; to the client it sounded Québécois and not "marketing". They supplied their own promo (Twin MCP narration, voice over music, no one on screen) and asked for *their* voice. It is their voice and they confirmed they hold the rights; it is cloned for this ad only. The Julian edit is archived in `audio/voiceover/julian/` and still rebuilds (`--ref` / `packed_file`).
- **Isolation** (`utils/audio/isolate_voice.py`): the narration was separated from its music bed with an ensemble of two UVR MDX-Net vocal models (Kim_Vocal_2 + UVR-MDX-NET-Voc_FT, ONNX on CPU, numpy STFT matching the models' training). The bed ends ~35 dB under the voice; 30.7 s of clean speech → `audio/voiceover/clone/voice_sample_clean.mp3`.
- **Cloning**: Higgsfield **Seed Audio 1.0** (ByteDance) with that sample as `audio_references`, 48 kHz WAV. Seven full-script takes, six kept, at speech rates 0 / −8 / −12 / −18 / −20 / −26 (the model's rate control is loose, so the spread gives the comp material), and four pickups (the opening sentence and the ending, at −8 / −12). All kept in `audio/voiceover/clone/takes/` with their word timestamps.
- **Scoring** (`utils/voice/voice_qa.py`): speaker similarity to the real voice (Resemblyzer d-vectors: 0.955–0.973 per take; Julian 0.815), median F0 (real voice 152 Hz), French ASR and WER (faster-whisper large-v3-turbo).
- **Comp** (`utils/voice/fit_vo.py`), the way a dialogue editor would do it: every phrase is cut from every take at the pause (or at the quietest 10 ms between two words), vocal-fry lead-ins are trimmed, inner pauses are tightened; then one take per phrase is chosen jointly (dynamic programming) on the time-stretch it needs, a clean read (ASR match, no inserted word — one pickup said « professionnel et diffère »), pitch against the real voice and the other takes, cuts through continuous speech, pauses where the script has none (« et… découvre »), and take switches — costlier inside a sentence, plus the melodic jump heard at the join. Result: **4 switches, all at sentence ends**: the opening list (take −18, "Creator" said the English way) → « et que tu envoies… ailleurs. » (−8) → « Et ton client… » to « …une seule expérience. » (−12, with a falling, final « Non. ») → « Au lieu d'envoyer dix liens… » to « …clair et différent. » (−18, the only take that reads « Ton client clique. Et découvre… » as two sentences) → « Écris-moi et on commence. » (−20).
- **Fit to the picture**: tempo with **Rubber Band R3** (finer engine, short window; pitch and formants kept) — picked over the R2 engine and Praat PSOLA by a round-trip PESQ test on these phrases (3.1–3.6 vs 1.3–1.9 and 1.8–2.8). Tempo ×0.87–1.18. Every phrase start the picture is cut on is where it was to the millisecond; three spans the picture follows only by word cues (the opening list, « Au lieu… un seul lien. », « Ton client clique. Et découvre… ») are fitted as a whole so they keep the voice's own rhythm. Word onsets are snapped to the sound (Whisper starts a word at the end of the pause before it: « pensé » moved from 20.11 to 20.32 s).
- **Tone**: takes loudness-matched, phrase clip-gain that keeps 40 % of the natural level variation, then a linear-phase **match EQ** 60 % of the way to the long-term spectrum of the real narration (+3 to +5 dB at 6–10 kHz, −1.6 dB around 1 kHz): the clone sounds like the voice as recorded, not like the model's own colour.
- **Result (v3)**: speaker similarity **0.981** to the real voice (better than any single take), median F0 **150 Hz** (real 152 Hz), French WER 1.8 % (spelling variants only: « dix » → « 10 », « pensé » → « pensez »).

### The performance (v5): a directed, emotional read
The client asked for a read "with emotion, following the rhythm and context of the video, that doesn't sound AI-made". The v3 comp was clean but even: its pitch varied less than the real person's (10–90 % F0 spread 92.6 Hz vs 106.9 Hz on their own narration), the classic tell of synthetic speech.
- **Directing the takes**: Seed Audio has no emotion control, so the read was directed the way a VO director runs a session, section by section, through the text and the render settings: 18 section takes (`audio/voiceover/clone/takes/emo_*`) — the call-out and the mess ending on « ?! »; the staccato and the question again at faster rates; « Non. » three ways (full stop, exclamation, run-on); the promise and « …un seul lien » with « ! »; the invitation as « Écris-moi, et on commence ! » / « Écris-moi… et on commence ! » / plain. Each at 2–3 speech rates and pitch offsets (rate −16…+3, pitch −2…+2). 17.7 credits.
- **What each beat should sound like** (`EMOTION` in `fit_vo.py`): energy for the call-out and the staccato, incredulity for the question, low and firm for « Non. », calm conviction for « Ton travail mérite… », pride building through the promise, affirmation on « un seul lien », assurance for the client's side, a warm invitation to end.
- **Scoring the readings** (`fit_vo.py --emotion`): every reading of a phrase (8–14 per phrase over the 28 takes) is placed against the others on four acoustic correlates of arousal and assurance — median pitch, pitch range, loudness, vocal effort (1–4 kHz vs 80 Hz–1 kHz energy) — and its distance to the wanted profile is a comp cost; the pull towards the consensus pitch is halved so an expressive reading can win. No emotion-recognition model: the one good open model is licensed for non-commercial use only.
- **Guards**: voice identity — a take whose speaker similarity falls below 0.935 costs quadratically (the three takes rendered at +2 semitones, 0.85–0.89, are out); voice quality — a reading whose loud frames are mostly aperiodic (creak, whisper) costs, measured by window-corrected autocorrelation as in Praat (pYIN drops some plainly voiced nasal vowels, « Non. » among them); junk — two directed takes leaked words from the reference audio (« clat clat », « tu cliques ») between sentences: the cut boundaries and the inserted-word cost keep them out (ASR of the final read: 0.9 % WER). Pace — a reading shorter than its slot is slowed only as far as that beats leaving a longer pause after it: « Non. » is no longer stretched to fill its slot.
- **The arc** (`ARC`, the Melodyne pass a VO editor would do): per sentence a register (semitones vs the real voice) and a level — call-out +1, staccato +1, question +1.5 (+0.5 dB), « Non. » −4 (+1.5 dB), « Ton travail… » −1 (−1 dB, closer), promise +0.5 / +1 (+0.5 dB), « …un seul lien » +0.5 (+1 dB), the client's side and the invitation 0. A sentence moves half-way to its register, at most 1.5 semitones, all of it by the same amount (its melody is the take's), formants preserved (Rubber Band R3), and never back from a reading that already goes further. Applied: call-out +0.9, staccato +0.3, question +0.6, « Non. » 0 (the reading is already at −5.6), « Ton travail… » −0.4, promise 0, « …un seul lien » +0.7, the client's side +0.3, invitation +1.0.
- **The read**: the opening list (pickup −12) → « et que tu envoies encore ton travail… » (directed call-out take, −9) → « Une vidéo ici. Un fichier là. » (−8) → « Un autre lien ailleurs. » (pickup −12) → the question, « Non. » and « Ton travail mérite… » (−12, one breath of performance) → « Je crée pour toi… » (−8) → « Tes projets, tes services, ton style… réunis dans une seule expérience. » (directed promise take, with a real suspension after « ton style… ») → « Au lieu d'envoyer dix liens… tu envoies un seul lien. » (pickup −8) → « Ton client clique. Et découvre… » (−18) → « Écris-moi et on commence. » (pickup −8). 9 switches, one inside a sentence (after the « … » of the opening list, as in v3).
- **Breaths — checked, not added**: a real read breathes; this source doesn't. The Seed Audio takes have digital silence between sentences and the client's own narration (the cloning source) is itself breath-edited: no in-breath in any of its pauses. A synthetic breath would be the one thing in the read that sounds fake, so none was added — ad voice-overs are normally de-breathed anyway.
- **Result (v5)**: pitch spread **104.9 Hz** (real voice 106.9, v3 92.6): the read is now as melodically alive as the person. Median F0 **152.1 Hz** (real 152.1). Speaker similarity **0.970** (v3 0.982: expressive readings and the register moves cost a little identity, still far inside same-speaker range; the preset voice of v1 was 0.815). French WER **0.9 %**. Timeline unchanged (every phrase start the picture is cut on is where it was); word cues move with the new readings and the picture and sound follow them.
- **Placement**: `utils/build_timeline.py` re-spaces the 17 phrases with the designed pauses (tight at first, 0.72 s of silence after « Non. », breathing after) with 4 ms fades.
- **In the mix**: HPF 75 Hz and +2 dB at 3.2 kHz for phone speakers. Seed Audio's band stops at ~12 kHz with no tones, so the codec clean-up of the Julian source (notch + 11 kHz low-pass) now only runs for that source (`codec_cleanup` in its timing file).
- **Redo the comp**: `python3 utils/voice/fit_vo.py --take T1.flac --words T1_words.json [--take … --words …] --label "…" [--emotion]` (words from `voice_qa.py --words-out`; v5 = all 28 takes in `audio/voiceover/clone/takes/` with `--emotion`), then the build steps above.

## Script — final (French, 100 %)
> Si tu es UGC Creator, Content Creator, Voice Over Artist ou Influenceur… et que tu envoies encore ton travail entre Google Drive, WhatsApp et plusieurs liens… Une vidéo ici. Un fichier là. Un autre lien ailleurs. Et ton client doit chercher partout pour comprendre qui tu es et ce que tu fais ? **Non.** **Ton travail mérite une meilleure présentation.** Je crée pour toi un Premium Website Portfolio, pensé autour de ton univers. Tes projets, tes services, ton style… réunis dans une seule expérience. **Au lieu d’envoyer dix liens… tu envoies un seul lien.** Ton client clique. Et découvre un portfolio professionnel, clair et différent. Écris-moi et on commence.

### Compression applied (brief §06 allows it; priority Hook › Problem › Non › Solution › Portfolio › 10→1 › CTA)
| Removed / trimmed | Why |
|---|---|
| « …à tes clients » (question) | kept on screen instead (« Comment présentes-tu ton travail ? ») |
| « il est temps de changer ça. » | « Non. » already does this job, harder |
| « voir ton meilleur travail » → « qui tu es et ce que tu fais » | shorter, and maps to the portfolio's two jobs (hero / projects) |
| « et de ton activité », « meilleurs », « et toutes les informations importantes » | density |
| « immédiatement » | pace |
| « Fais enfin présenter ton travail à la hauteur de ce qu'il mérite. » | S11 becomes a voice-less-in-spirit "let the design breathe" moment over « professionnel, clair et différent » |

The three mandatory lines are intact: **« Non. »**, **« Ton travail mérite une meilleure présentation. »**, **« Au lieu d’envoyer dix liens… tu envoies un seul lien. »**

## Sound & energy (v4)
- **Arc**: hook hit on frame 0 with the beat already running → chaos build (120 BPM, D minor) → dead stop on « Non. » (0.86 s of digital silence) → swell → two-bar build under the promise → half a beat of silence → **drop 1 on « pensé »** as the frame turns violet → 117 BPM house groove in F → the groove stops dead on the ten links → count-up build → half a beat of silence → **drop 2 on « seul »** → groove → the send tap ends on F major.
- **Tempo from the voice**: `utils/audio/build_audio.py` sets part B's beat to (drop 2 − drop 1) / 16, both drops being voice cues, so the two biggest picture events are downbeats (117.03 BPM with this voice). Change the voice and the music re-fits itself.
- **Groove**: four-on-the-floor kick, claps on 2 and 4, 16th hats with an open hat on the offbeat, shaker; offbeat house bass (octave on the last offbeat); Fmaj9 – C6/9 – Dm9 – B♭maj9 pads and chord stabs, sidechain-pumped by the kick (7 dB); sparse sparkle arp. Drum bus: parallel compression + light saturation.
- **New sound effects**: sub drops, noise risers (gated), downlifter, shimmer (seeded bell clusters), chord stabs, toms, shaker, glitch stutters; all 194 sound effects (and the 943 musical events) are placed from a voice cue, a scene constant or the beat grid — including S06/S07, which were still on v1 times in v3.
- **Voice over the music**: VO EQ + 3:1 compression; the music is ducked by band (9 dB in 220 Hz–5.2 kHz, 3.5 dB below, 4.5 dB above) and sits ~4.5 LU under the voice before ducking (v3: 6.5). Intelligibility check: faster-whisper word error rate on the final mix = on the dry voice (1.8 %).
- **Picture sync**: the audio build writes `config/music.json` (beat grid, 68 kicks, 6 hits, 2 builds, 3 glitches); `src/music.ts` + `src/components/motion/FX.tsx` turn it into camera punches (every kick), zoom creep (builds), shake + flash + shockwave rings + brand-star bursts (drops, CTA, send tap), RGB-split glitches (chaos only) and glints (link pill, send button). The captions layer is not affected.

## Spelling & French typography (v4)
Every on-screen string (scenes, portfolio, UI, captions, SRT) was re-read: typographic apostrophe (’), narrow no-break space before « ? », no-break space before « : » and inside « », and the portfolio copy is now French only (« marques de beauté, de cuisine et de mode », « Reel · Cuisine », « Photos d’ambiance », « Français natif · voix posée »). English stays only for the job titles and formats the brief allows (UGC Creator, Voice Over, Reels, TikTok, Media kit, unboxing) and the product name.

## Duration
36.9 s against a "≈ 30–35 s" target. The mandatory lines + the hook + the CTA at a natural French delivery don't fit in 35 s without sounding rushed (the first half is already read at a brisk ad pace). The extra ~2 s is spent where it pays: 0.86 s of silence after « Non. » and a ≥ 1.8 s readable end card. A 30 s cut-down is possible by dropping S07's zoom-out/sitemap (≈ 2 s) and tightening the end card.

## Placeholders & compliance
- **`tonnom.com`** (= "ton nom .com", "your name .com") is deliberately a placeholder for the buyer's own domain, used in the link pill, browser bar, link preview and `bonjour@tonnom.com`. All other links are masked (`lien-partage/…/x8k2`). No real or private URL appears.
- **Voice**: the client's own voice, cloned at their request from their own promo narration, with their confirmation that it is their voice and that they hold the rights. Used for this ad only; no one else's voice is imitated.
- **Persona**: « Inès Morel — UGC Creator & Voice Over, Paris » is fictional (AI-generated photos, invented copy). No real person, client, brand, testimonial, follower count, metric, award or logo appears anywhere. The one image where the generator painted a fake social-media bar (handle + view count) was cropped.
- **Google Drive / WhatsApp** are *spoken* (as in the brief) and appear only as plain-text tags. Their interfaces are **not reproduced**: the file browser and the chat are original designs following familiar patterns (list + search; bubbles + composer), with their own colours, layouts and icons. No logos, no trademarked glyphs, no original notification sounds.
- **Language**: all copy, captions, supers and CTA are French; English appears only as job titles / formats that are used as-is in the French creator market (UGC Creator, Voice Over, Reels, TikTok, Media kit) and as the product name « Premium Website Portfolio » (spoken in the script). No Arabic, no Darija.
- **Reference Reel**: used for motion language only (two alternating worlds, kinetic type with blur, bubbles, star, bars, brackets, rings, phone). No frame, face, name, copy, sound or asset from it is in the film; its contact sheets are kept in `assets/reference/` for traceability.
- **Fonts**: SIL Open Font License 1.1 (commercial use OK). **Remotion**: free for individuals and companies of up to 3 people; larger companies need a Remotion company license to render with it (remotion.dev/license).

## Deliverables matrix
| File | Captions | Encode | Use |
|---|---|---|---|
| `01_FINAL_MASTER.mp4` | no | H.264 High, CRF 14 | archive / re-edit / other platforms |
| `02_META_AD.mp4` | **yes** | H.264 High, CRF 17, ≤ 14 Mb/s | **upload this to Meta Ads** (Reels, Stories, Feed 9:16) |
| `03_CLEAN_VERSION.mp4` | no | H.264 High, CRF 17, ≤ 14 Mb/s | when Meta's own captions are used, or for organic posts |
| `04_SUBTITLED_VERSION.mp4` | yes | H.264 High, CRF 14 | high-quality captioned master |
| `05_THUMBNAIL.png` | — | 1080×1920 PNG | cover image |
| `SUBTITLES_FR.srt` | — | UTF-8 SRT | sidecar for platforms that burn their own captions |
All: 1080×1920, 30 fps, yuv420p BT.709, AAC 256 kb/s 48 kHz stereo, −14 LUFS integrated, true peak ≤ −1 dBTP, `+faststart`.

## Safe zones
Key text and UI sit between y = 250 and y = 1500 (Meta Reels UI overlays: top ~14 %, bottom ~22 %), with ≥ 60 px side margins. Captions' bottom edge is at y = 1486.

## Generative credits (Higgsfield) used by this production
Session of 2026-09-28: **9.3 credits** — 10 French voice test lines (0.45 each = 4.5), 2 full-script voiceover takes (2.1 each = 4.2), 5 Soul 2 images (0.12 each = 0.6). Remaining balance after production: 103.2. (The account history also shows 7.95 voiceover credits on 2026-09-27, before this session started.)

Re-voicing, 2026-09-29: **≈ 36 credits** — 7 full-script Seed Audio takes with the voice reference (4.4 each; one, at rate −26 with paragraph breaks, was read too slowly and dropped) and 4 short pickups (≈ 1.3 each). Creating a stored voice profile was refused by the plan's voice limit (nothing charged); cloning per generation with the audio reference does the same job. Balance after: 67.

Emotional re-direction (v5), 2026-09-29: **17.7 credits** — 18 directed Seed Audio section takes with the voice reference (≈ 1 each). Balance after: 49.3.

## Known trade-offs
- Photos were transferred downscaled (600×800 hero, 450×800 tiles) because the generation CDN isn't reachable from the render machine; they're never shown above ~1.3× so they stay sharp, but a production site would use the full 2k originals.
- The chaos section is intentionally dense; individual file names there are texture, not meant to be read.
- Captions skip phrases that are already on screen as supers (identity bubbles, « ici / là / ailleurs », « Non. », the promise, « Qui tu es ? / Ce que tu fais ? », the three adjectives, the CTA), so text never appears twice.

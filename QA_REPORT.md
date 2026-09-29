# QA Report

**Version reviewed**: v3 — re-voiced with the client's own voice (v2 passed two QA passes) · 36.93 s · 1108 frames · 1080 × 1920 @ 30 fps
**Verdict**: ✅ ready to upload (`renders/02_META_AD.mp4`), with the trade-offs listed at the end.

## 1. Method
1. **Design stills** while building (`node utils/still.mjs`), reviewed as labelled contact sheets per scene.
2. **Frame-by-frame review of the rendered file**: every frame extracted from the H.264 program, contact sheets every 6 frames (0.2 s) → `qa/sheets/` (7 sheets, 185 thumbnails; redone on the v3 export). Every transition and every VO-synced cue checked against `config/timeline.json`; the exported audio is aligned with the master to the sample (cross-correlation offset 0 ms).
3. **Audio**: BS.1770-4 integrated loudness (own implementation, cross-checked with FFmpeg `ebur128`), 4× oversampled true peak, momentary-loudness curves per stem + master spectrogram → `qa/audio_loudness_spectrogram.png`, `qa/audio_report.txt`.
4. **Delivery**: `ffprobe` + `ebur128` on every exported file → `qa/export_report.txt`.
5. **Voice (v3)**: speaker similarity to the real voice, pitch and French ASR on every take and on the final comp → `qa/voice_report.txt`; spectrogram and phrase-edge plots of the comp (cuts, clicks, breaths, level jumps); pitch continuity measured at every take switch; key frames re-checked against the new word times.

## 2. Self-critique (against the brief and the reference)
**What works**
- **Hook**: frame 0 is a full-screen question on violet (« Tu es… »), no logo; each role pops *on* its spoken word; the target self-identifies in < 4 s.
- **One idea, visible**: 10 → 1 is literally counted on screen (10 exactly on « dix », 1 exactly on « seul »).
- **The portfolio is the hero**: it builds itself, scrolls on the spoken words, appears as desktop + mobile, and gets the calmest, most "designed" frames of the film (S06/S07/S10/S11). It is visibly more refined than the ad graphics around it.
- **Reference motion language, original execution**: violet/studio alternation, word-by-word type with directional blur, pop-and-cluster bubbles with spin-out, star draw → fill → swallow, bars split, viewfinder brackets, rings behind a rising phone, DM thread — all redrawn in code; nothing copied.
- **« Non. »** is a true pattern break: hard cut, pure white, one violet point, 0.86 s of digital silence.
- **Sound** follows the story arc (pressure build → silence → premium groove → filter-down on the ten links → open on « seul » → resolve on « commence »).
- **The client's own voice** (v3): speaker similarity 0.981 to their real narration (v1's preset voice: 0.815), same median pitch (150 vs 152 Hz), European French, 1.8 % WER. The person who sells the portfolios is the one talking.

**What's weaker (and what was done about it)**
- The "before" UI (file names, chat, tabs) is small on a phone — it's texture; every beat is carried by large chips/bubbles that are readable at thumb size.
- 36.9 s is ~2 s over the 30–35 s target (see PRODUCTION_NOTES → Duration; a 30 s cut-down path is documented).
- The voice is a clone of the client's voice (generated, then dialogue-edited from 4 takes), not a studio session: very close, but a real session would give the most natural breaths and emphasis. `utils/voice/fit_vo.py` takes a human recording as-is (one take) and the picture follows. Music is synthesized in code (clean, original, fully synced, but less "produced" than a top library track); the stems are separate.
- Photos are 600–800 px sources, never shown above ~1.3× (the S11 portrait is the largest use).

## 3. Brief compliance
| Requirement | Status |
|---|---|
| 100 % French VO, captions, supers, CTA; no Arabic / Darija | ✅ (English only for job titles/formats + the spoken product name) |
| Voice = the client's own (their request), consent confirmed | ✅ cloned from their own narration; documented in PRODUCTION_NOTES |
| No Blender, no 3D pipeline, no GLB/GLTF/OBJ/FBX/Three.js/WebGL, no `/assets/3d` `/blender` `/3d` | ✅ React + SVG + CSS + Remotion + FFmpeg only |
| Google / WhatsApp not reproduced pixel-for-pixel | ✅ original file browser + chat designs, text-only name tags, no logos |
| No real private URLs | ✅ `tonnom.com` placeholder + masked `lien-partage/…` links |
| No fake testimonials / reviews / followers / revenue / awards / clients / stats / logos | ✅ (a generated image carrying a fake handle + view count was cropped) |
| No stock footage, no generic AI website, no cheap transitions | ✅ every transition is story-motivated |
| First 3 s identify the target; question « Comment présentes-tu ton travail… ? » | ✅ roles at 0.4–3.9 s; question lands at 4.8 s (right after « Influenceur », on the voice's own question) |
| « Non. » = hard cut to pure white + violet point + silence | ✅ frame 435 (14.50 s); music + SFX = 0.00 from 14.49 to 15.35 s |
| Mandatory lines kept (« Non. », « Au lieu d'envoyer dix liens… tu envoies un seul lien. », « Ton travail mérite une meilleure présentation. ») | ✅ |
| CTA screen « TON TRAVAIL. TON STYLE. TON PORTFOLIO. UN SEUL LIEN. » + single CTA « Écris-moi et on commence. », no urgency | ✅ |
| 9:16, 1080 × 1920, ~30–35 s, H.264 high quality | ✅ (36.9 s, see above) |
| Folder architecture + required components + docs | ✅ |
| Three creative directions | ✅ `previews/directions_board.png` (A retained) |
| Exports 01–05 | ✅ `renders/` |

## 4. Frame-by-frame findings → fixes
| # | Where | Finding | Fix |
|---|---|---|---|
| 1 | S01 · 0.00 s | First frame too empty (small headline) | Opens on a huge centred « Tu es… » that settles into the headline slot |
| 2 | S01 · 3–4 s | Bubble labels clipped by neighbouring bubbles | Diamond re-layout (392 px), z-order top → bottom, avatar at 84 % with a white fade under the label |
| 3 | S01 · 5.0 s | Shrinking cluster collapsed onto the incoming question | Cluster now flies outward (scale ↑) and clears 0.1 s earlier; question +0.08 s |
| 4 | S02 · 7.5 s | « Google Drive » and « WhatsApp » tags overlapped | Tags repositioned on their own objects |
| 5 | S02 · 6.2–6.8 s | Chat phone too small / lower half empty | Phone 330 → 380 px, file browser +14 % |
| 6 | S04 · 12–13 s | Tab strip rose above the 250 px top safe line with the camera push | Moved to y = 296 |
| 7 | S06 · 20.2–20.33 s | Lavender wash / empty beat at the violet hand-off | Star covers the frame faster; hand-off overlay only once fully covered; « pensé » visible from 20.30 s |
| 8 | S08 · 26.20 s | Counter showed « 0 lien » for one frame | Counter appears with the first card |
| 9 | S10 · 29.8–31.4 s | Portfolio in the phone read small | Phone 440 → 500 px |
| 10 | S12 · 34.0 s | First CTA lines animated under the star wipe | Lines start after the wipe (33.99 s +) |
| 11 | S12 · end card | Composition top-heavy, CTA text small | Block lowered to y = 404, composer 960 × 172 px, 60 px type |
| 12 | Image | `work_voice` had a painted "story" bar (handle + view count) | Top 84 px cropped |
| 13 | Captions | Captions duplicated on-screen supers | Burned-in captions skip them; SRT sidecar keeps the full transcript |
| 14 | Audio | VO carried codec fill > 11 kHz + a 13.1 kHz tone (−58 dBFS) | Notch + 11 kHz low-pass (tone ≈ −80 dBFS), +2 dB presence |
| 15 | Audio | Music bed ~14 LU under the voice; heavy sub; pad aliasing | Rebalanced (≈ 7–10 LU under VO), HPF 34 Hz + low trim, band-limited saw |
| 16 | Voice (v3) | Client feedback: the v1 voice sounded Québécois and not "marketing" | Re-voiced with the client's own voice: isolated from their promo, cloned (Seed Audio), comped and fitted |
| 17 | Voice · P1 | The best opening take started with 0.4 s of vocal fry before « Si » | Fry / glitch lead-ins detected (F0 < 85 Hz, no fricative) and trimmed |
| 18 | Voice · P15–16 | Most takes read « Ton client clique et… découvre » (pause after « et ») | Pauses where the script has none are penalised; P15–16 come from the take that reads two sentences |
| 19 | Voice · P16 | A pickup said « professionnel et diffère, clair et différent » | Words the script doesn't have are detected from the ASR and rejected |
| 20 | Voice · joins | Melodic jumps across take switches (up to 4.4 semitones) | The comp scores the pitch step at every join; final comp: 4 switches, all at sentence ends |
| 21 | Sync · S06/S07/S10 | New read: « projets / services / style » 0.26–0.48 s earlier than v1 | Star fill, page build, scroll, sitemap and phone zoom are now keyed to the spoken words instead of fixed times |
| 22 | Sync · words | Whisper started « pensé » 0.2 s early (at the start of the pause) | Word onsets snapped to the audio; « pensé » at 20.32 s = measured onset |
| 23 | Audio | The v1 codec clean-up (11 kHz low-pass) would dull the new voice | Only applied to the v1 source now; the clone gets a match EQ to the real voice instead |

## 5. Technical checks
See `qa/export_report.txt` for the raw probe of each file.

| Check | Result |
|---|---|
| Resolution / frame rate / frames | 1080 × 1920 · 30/1 · 1108 frames · 36.933 s |
| Video | H.264 High, yuv420p, BT.709 tagged, GOP 60, `+faststart` · 01 = 21.2 MB, 02 = 15.3 MB, 03 = 15.0 MB, 04 = 21.6 MB |
| Audio | AAC-LC 256 kb/s, 48 kHz stereo |
| Loudness (all MP4s) | **−14.0 LUFS** integrated (target −14), LRA 1.9 LU |
| True peak (all MP4s) | **−1.4 dBTP** after AAC encoding (target ≤ −1 dBTP) |
| Silence under « Non. » | music + SFX max = 0.0 (digital silence) 14.49 → 15.35 s |
| A/V sync | VO placed sample-accurately from the same `timeline.json` the picture uses; spot checks (v3): « UGC » pop 0.38 s, « pensé » + page build 20.32 s, « projets / services / style » tabs 21.84 / 22.48 / 23.14 s, « dix » = 10 at 27.03 s, « seul » merge at 28.54 s, tap on « clique » 29.95 s, « Professionnel. » 31.60 s, typing on « Écris-moi » 34.10 s |
| Safe zones | key text/UI between y = 250 and y = 1500, ≥ 60 px sides; captions bottom at y = 1486 |
| Fonts | all local, rendered (no fallback glyphs in any sheet; French diacritics, « », …, narrow no-break space OK) |
| Determinism | verified: two independent renders of frames 627 and 870 are byte-identical (MD5) — seeded randomness, time-based animation |

## 6. Remaining trade-offs / next steps
- Replace `tonnom.com`, the persona and the four photos with a real client's portfolio for case-study versions (the data lives in `src/components/portfolio/data.ts`).
- Optional: a real recording session by the client — run `utils/voice/fit_vo.py` on the take and rebuild; the picture follows the words.
- Optional 30 s cut: drop the sitemap zoom-out in S07 and trim the end card by 0.8 s.

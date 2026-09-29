# ESKAYLI DZ — QA report

## 1. Technical checks (final deliverables — `qa/export_report.txt`)
| Check | Target | Result |
|---|---|---|
| Format | 1080 × 1920, 30 fps, H.264 High, yuv420p BT.709, fast-start | ✅ all 9:16 files; 4:5 = 1080 × 1350, 1:1 = 1080 × 1080 |
| Duration | = voice + 2.4 s end-card hold | ✅ 79.633 s (2389 frames) in every file |
| Loudness | −14 LUFS integrated | ✅ −14.0 LUFS (LRA 2.1 LU) in every file |
| True peak | ≤ −1 dBTP | ✅ −1.3 dBFS peak (4× oversampled limiter at −1.3) |
| Audio | AAC 48 kHz stereo | ✅ 256 kb/s (320 kb/s in the master) |
| « L'objectif ? » silence | digital silence in music + SFX | ✅ max \|x\| = 0 from 47.45 to 48.78 s |
| Subtitle file | complete transcript, ≤ 2 lines × 42 chars | ✅ 36 cues |
| Encode robustness | nothing that Meta's re-encode turns into noise | ✅ after the delivery pass the grain is a flat lift + light coarse grain (high-frequency noise 1.73 → 0.66 levels) |
| File sizes | light enough to upload and to version | ✅ Meta 9:16 32.7 MB (3.0 Mb/s video, CRF 17), master 90 MB (CRF 13), 4:5 26.7 MB, 1:1 23.6 MB |
| Chunk joins | no flash or jump where the 240-frame chunks meet | ✅ frame-to-frame difference at each of the 9 joins equals the difference inside the chunk |

## 2. Self-critique loop (brief § 29) — asked after the first full render
| Question | Verdict | What was reworked because of it |
|---|---|---|
| **Brand clarity** — does a business owner understand Eskayli offers Meta Ads? | Yes. « Meta Ads » is said 3× and shown 7× (3 at headline size); Facebook / Instagram said 3× each and shown 6× each, including « FACEBOOK & INSTAGRAM ADS » at 104 px; the brand is said twice and shown on three screens | 07 got a dedicated placements moment (big type) instead of two small chips |
| **Hook** — would the first 2 s stop the scroll? | Mostly. Frame 0 is already the problem (a live campaign manager, the budget flowing, a low impact); « PUBLICITÉ / FACEBOOK & INSTAGRAM » lands by 2.6 s and the real hook, the question about clients, arrives at 3.7 s. It is a thinking hook more than a shock hook — right for decision-makers, weaker for cold impulse scrolling | the headline was re-sized so it lands whole on one frame; the impact was put on frame 0 |
| **Strategy** — does it show thinking before spending? | Yes: the naive chain breaks (03), the business is understood before any ad exists (04), angle / message / creative / targeting are chosen, not generated (06) | 06's camera used to leave each module before its choice landed; it now holds through the key word, then whips |
| **Meta** — are Facebook / Instagram / Meta Ads clearly present? | Yes (see brand clarity) | — |
| **Business** — is the link to acquiring customers clear? | Yes: 08 turns the budget into four real business events; 09 goes past views to qualified inquiries, appointments, orders, relationships | 08's stages overlapped (the ad preview was taller than a stage): rebuilt as one scrolling page with compact event cards and a pulse that joins the four; 09's opening was empty for 2.6 s: a good ad now gathers views that converge into « VUES. » |
| **Premium** — does it look expensive? | Yes in picture: one accent, one type family, precise grid, restrained motion, a paper frame for the brand. The score is original and structured, but synthesized — it is clean rather than lush | inherited default styles (black text, a serif fallback on four chips) were removed at the root; transitions that double-exposed two busy chapters (05→06, 06→07) became sequential hand-offs |
| **Authenticity** — does anything look AI-generated? | The seven images passed the artefact checklist; all UI is drawn in code with real French copy; no faces or hands. The voice is an AI clone of the user's real voice (similarity 0.978, natural pacing, real pauses); its top octave is band-limited (~11 kHz) — heard as « slightly dry », not as robotic | — |
| **Motion** — does every animation have a purpose? | Yes: every move is keyed to a spoken word and carries the signal / system / conversion story | 09's flight showed passing planes too opaque (clutter): they now clear faster with depth blur |
| **Conversion** — does the CTA feel natural? | Yes: a question, then one calm action, « PARLONS DE VOTRE PROJET. », with the signal as its full stop; no fake urgency | the index dot, the rule and the sonic logo after « projet » make it the resolved end of the film |

## 3. Frame-by-frame visual QA
Method: stills at every key word during the build, then the full render at 2 fps (160 frames), then the final
deliverables — `qa/sheets/eskayli_9x16_p1.jpg`, `_p2.jpg` (1 frame / s, captions burned in), `eskayli_4x5.jpg` and
`eskayli_1x1.jpg` (1 frame / 2 s): nothing critical is cut in either crop (the 1:1 keeps ≥ 20 px above the highest headline).

Issues found and fixed (in order):
1. C03 naive chain too small to read on a phone → rebuilt as four large rows with props and a cursor.
2. The wordmark's dotless *ı* wrapped to a new line → `nowrap` + `max-content`.
3. Text inherited black and a serif fallback (test lanes, opportunity cards, four filter chips) → colour and font set on the film root.
4. C06 camera left each module before the choice landed; typing still running when the camera moved → holds + 0.35 s whips; typing 64 cps.
5. C07 lived in the top half, placements tiny → launch panel large and centred, docks at the top; big « FACEBOOK & INSTAGRAM ADS ».
6. C08 stages overlapped (ADS preview under PROSPECTS), the scroll pushed titles into the top UI zone → compact cards, one page scrolled then pulled back.
7. C09 passing planes too visible; CLIENT overlapped the opportunity grid → faster clear, CLIENT shrinks into the grid.
8. C10 index dot collided with PERFORMANCE; the headline missed « pour votre business ? » → per-word dot; the line added.
9. Double exposures at 05→06 and 06→07 → sequential hand-offs with a continuous downward move.
10. C09 opening empty for 2.6 s → a good ad gathering views that converge into « VUES. ».
11. Delivery: fine grain would have become compression noise on Meta → flat lift + light coarse grain.

Language audit: every visible string is French (UI, labels, subtitles, CTA); the only non-French words are the platform names
Meta Ads, Facebook, Instagram — the service itself. Typography: French quotes « », apostrophes ’, no-break spaces before « ? » and « : ».

## 4. Audio QA
| Check | Result |
|---|---|
| Voice vs music + SFX in the speech band (300 Hz – 4 kHz), per phrase | median **+14 dB**; the weakest was « Eskayli DZ » at −3.9 dB (the sonic logo sat on the name) → the logo now pre-laps the cut and its tail steps down 9 dB under the voice: +6 dB. The notification on « Prospects » and the chime on « Clients » were moved just before the words |
| Intelligibility (French ASR on the voice alone vs the final master, same script) | voice alone 3.8 % WER, final master 4.4 % — the only differences on both are the brand name, which the recogniser spells « sklidz »; every other word is transcribed identically, so the music masks nothing |
| Clicks | the only sharp transients are the designed UI clicks; risers that do not end on a hit fade out |
| Structure | pulse → structure → system → silence → conversion → resolve, as briefed (`qa/audio_report.txt`, `qa/audio_overview.png`) |

## 5. Mobile readability QA (a 390-pt-wide phone shows the frame at ≈ 0.36×)
| Element | Size in frame | On a phone |
|---|---|---|
| Key words (BUDGET, CLIENTS ?, META ADS, BUSINESS, VUES., FACEBOOK & INSTAGRAM ADS, PARLONS DE VOTRE PROJET.) | 92 – 220 px, weight 800 | 33 – 79 pt |
| Narration lines / connectors | 44 – 62 px | 16 – 22 pt |
| Burned-in subtitles | 50 px, 600 / 800 | 18 pt |
| UI card text (labels, messages, orders) | 24 – 46 px | 9 – 17 pt — supporting detail |
| Mono metadata | 16 – 24 px | 6 – 9 pt — decorative only, never needed to understand |
Every idea that carries the message is ≥ 44 px, high-contrast (off-white or orange on near-black, ink on paper), and inside
y 440–1480 (the 1:1 crop), clear of the Reels top UI and the bottom caption / CTA zone.

## 6. Conversion-message QA
Watched as a business owner, sound off (subtitles version) and sound on:
- **0–4 s** — Facebook / Instagram advertising + a budget whose destination is unclear → *is my budget bringing clients?*
- **7–16 s** — ads are not « créer, publier, attendre ».
- **16–35 s** — Eskayli understands the business first and builds the Meta Ads strategy around it.
- **35–47 s** — angle, message, creative, targeting; launch, test, optimise on Facebook & Instagram Ads.
- **47–64 s** — the goal is clients, not views.
- **65–79 s** — ESKAYLI DZ = Meta Ads · Stratégie · Création · Performance → « Parlons de votre projet. »
The answer to *« what does Eskayli do? »* is on screen in words at 0:09 (META ADS), 0:32 (STRATÉGIE META ADS), 0:45
(FACEBOOK & INSTAGRAM ADS) and 1:06 (the four brand words).

## 7. Anti-AI quality control (brief § 30)
| Risk | Check |
|---|---|
| Malformed text, gibberish, random symbols | images generated with « no readable text / signage / logo » and inspected: none contains text; all on-screen text is typeset in code |
| Fake or impossible UI | the UI is designed, French, consistent (one type system, one radius scale, one accent); no official Meta UI is imitated |
| Distorted hands / faces | none exist in the film by design |
| Perspective, shadows, reflections | checked on all seven images (sneakers, clinic, couscous, apartment, serum, desk, bakery) — coherent, no warped objects |
| Duplicated elements | the ad images are reused deliberately inside the story (the same sneakers ad travels from the hook to the attention stage) |
| Over-processed CGI | none — 2.5D interface design |

## 8. Known limits and recommendations
- The wordmark is a typographic placeholder; drop in the official logo in `src/components/Wordmark.tsx` and re-render
  (chapters 05 and 10 only).
- No contact is shown on screen, by the brief's rule: put the action in Meta's CTA button (« Envoyer un message »).
- For cold audiences, test a 15 s cut (01 → 02 → 08 → 10) and a variant opening directly on the question; the chaptered
  build makes both a matter of re-sequencing.
- The voice is an AI clone of the user's own voice; a studio re-record by the user on the same timing would lift the
  top-octave « air » (the timeline would follow automatically via `utils/build_timeline.py`).

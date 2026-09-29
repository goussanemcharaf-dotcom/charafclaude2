# ESKAYLI DZ — Asset inventory

Every element in the film, where it comes from and how it was made. Nothing is downloaded stock; no real
client, logo, testimonial, result or statistic appears anywhere.

## Voice — `voice/`
| Asset | Source / method | Used |
|---|---|---|
| `vo_final.wav` (79.63 s, 48 kHz / 24-bit) | The user's **own cloned French voice** (the last French voice generated for them, see `PRODUCTION_NOTES.md`). 26 directed takes generated with Higgsfield Seed Audio (voice reference media `42232378-…`), comped phrase by phrase by `utils/voice/comp_vo.py`, match-EQ'd and joined on breaths/pauses | the whole narration |
| `takes/*.flac` + `*_words.json` | the 26 raw takes (8 sections + 2 pickups of the question) and their French word timestamps (faster-whisper large-v3-turbo) | comp source, reproducibility |

## Images — `assets/images/` (900 × 900 JPG)
Generated for this film with **gpt_image_2_5** (Higgsfield), prompts written to avoid people, hands, faces, readable text and logos,
then inspected one by one for AI artefacts (malformed objects, gibberish text, impossible perspective, broken shadows). All seven
passed; none is retouched or hidden behind blur. They are **fictional sector examples** shown inside fictional ad previews
(« Votre marque · Restaurant », « Sponsorisé ») — they never imply a real client.

| File | Sector | Prompt (abridged) | Appears in |
|---|---|---|---|
| `ad_shop.jpg` | E-commerce | white leather sneakers on a travertine block, charcoal background | 01 hook ad preview, 07 test A, 08 attention feed |
| `ad_clinic.jpg` | Clinic | empty modern clinic reception, oak desk, daylight | 07 test B |
| `ad_food.jpg` | Restaurant | couscous with slow-cooked vegetables in a glazed ceramic dish | 06 creative variant, 08 feed |
| `ad_estate.jpg` | Real estate | bright apartment over a Mediterranean coastal city at golden hour | 06 creative variant (chosen), 08 feed |
| `ad_beauty.jpg` | Beauty | amber serum bottle and cream jar on limestone, olive-leaf shadows | 06 creative variant |
| `ad_service.jpg` | Professional services | tidy office desk, closed laptop, notebook, coffee | 09 « a good ad » |
| `ad_local.jpg` | Local business | bakery-café storefront at dusk | 07 test C |

## Procedural textures — `assets/grain/` (`utils/make_grain.py`)
| File | Method | Used |
|---|---|---|
| `grain_512.png` | seeded Gaussian noise tile, lightly softened; offset 24×/s | film grain of the "noise world" (0–17 s), trace amounts after |
| `grid_1080x1920.png` | 12-column × 20-row hairline grid, radially faded | the "system world" background grid |

## Type — `fonts/`
| File | Licence | Used |
|---|---|---|
| `Geist-Variable.woff2` | SIL Open Font License 1.1 (Vercel) | all display and text |
| `GeistMono-Variable.woff2` | SIL Open Font License 1.1 (Vercel) | metadata labels, the « DZ » tag |

## Interface & graphics — `src/components/`, `src/scenes/` (React + SVG + CSS, drawn in code)
All interfaces are **fictional and in French**; none reproduces Meta's real UI, and nothing is presented as a screenshot.

| Component | What it is |
|---|---|
| `Campaign.tsx` → `AdPost`, `CampaignBoard`, `Phone` | fictional sponsored post (« Votre marque · <secteur> », « Sponsorisé », French headline + CTA); a fictional campaign manager (budget, campaign › ad set › ad tree, objective, audience, placements) |
| `Signal.tsx` | the orange **signal** (the ad budget) and its routes — the film's through-line |
| `Kinetic.tsx` | kinetic typography (mask-rise, ghost → solid two-beat reveal, typing) |
| `Wordmark.tsx` | a **typographic** « eskaylı DZ » wordmark whose *i*-dot is the signal — a treatment made for this film; swap for the official logo if the brand has one |
| `Icons.tsx` | ~35 original line icons (eye, user, chat, calendar, bag, flask, refresh…) |
| `base.tsx` | grid, grain, vignette, panels, pills, mono labels |
| scene-level UI | the business core and its six satellites + audience profile (04); strategy map (05); angle / message / creative / targeting modules (06); launch switch, test lanes, optimisation loop (07); feed, qualified inquiry, conversation, confirmed order (08); opportunity grid (09); system map and final screen (10) |

Illustrative details are generic and unnumbered: « Alger · Oran · Constantine », « 25 – 44 ans », « Oran · via Instagram »,
« Demande d'informations et de prix », « Commande confirmée · Un nouveau client ». **No figure anywhere** — no ROAS, revenue,
percentage, client count or result; progress bars are test progress, not performance.

## Music & sound design — `music/`, `sfx/` (`utils/audio/build_audio.py`)
| Asset | Method |
|---|---|
| `music/music_stem.flac` | original score synthesized in Python (numpy/scipy oscillators, FM, filtered noise — the repository's `utils/audio/synth.py`): 100 BPM, E minor → E major, pulse → structure → system → conversion → resolve |
| `sfx/sfx_stem.flac` | original SFX, same toolkit: UI ticks, locks, picks, typing, whooshes, refined impacts, data streams, a notification, the **sonic logo** (E5 → B5, a rising fifth) |
| master (`renders/_work/master_mix.wav`, regenerated) | voice + ducked music + SFX, −14 LUFS, −1.3 dBTP |
No samples, loops or third-party sounds are used.

## Subtitles
| Asset | Method |
|---|---|
| `config/captions.json` → `src/Subtitles.tsx` | 5 burned-in cues where the narration is not already typeset on screen, word-synced to the voice |
| `renders/ESKAYLI_SOUS-TITRES_FR.srt` | the complete French transcript, 36 cues, ≤ 2 lines of 42 characters |

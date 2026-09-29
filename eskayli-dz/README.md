# ESKAYLI DZ — « Parlons de votre projet. » · Meta Ads acquisition film (FR)

A 79.6 s vertical ad (1080 × 1920, 30 fps) for **ESKAYLI DZ**, an Algerian agency that builds strategic Meta Ads acquisition
on Facebook & Instagram for businesses. 100 % French, narrated in the user's own cloned voice, built entirely in code —
React + SVG + CSS rendered with Remotion, original synthesized score and sound design in Python, FFmpeg delivery.

> *Eskayli doesn't just make ads. They understand the business behind the ads.* — the film shows the method, never fake results.

**Story** — a signal (the ad budget) becomes a system becomes a conversion:
01 hook · 02 the question · 03 the real problem · 04 business intelligence · 05 Eskayli enters · 06 the Meta Ads system ·
07 testing & optimisation · 08 attention → prospects → conversations → clients · 09 beyond views · 10 brand & CTA.

## Deliverables — `renders/`
| File | What |
|---|---|
| `01_ESKAYLI_META_9x16.mp4` | **Upload this one** (Reels, Stories, Feed 9:16) — burned-in captions, Meta delivery encode |
| `02_ESKAYLI_MASTER_9x16.mp4` | master quality, captions burned in (archive / re-encode source) |
| `03_ESKAYLI_CLEAN_9x16.mp4` | no burned captions — pair with the SRT or the platform's captions |
| `04_ESKAYLI_4x5.mp4` | Feed 4:5 (1080 × 1350), centre crop |
| `05_ESKAYLI_1x1.mp4` | Feed 1:1 (1080 × 1080), centre crop |
| `06_ESKAYLI_COVER.png` (+ `_4x5`, `_1x1`) | cover frame |
| `ESKAYLI_SOUS-TITRES_FR.srt` | complete French transcript |

All files: H.264 High, yuv420p BT.709, AAC 48 kHz stereo, −14 LUFS integrated, true peak −1.3 dBFS, fast-start
(`qa/export_report.txt`).

## Docs
- [`storyboard/01_REFERENCE_GRAMMAR.md`](storyboard/01_REFERENCE_GRAMMAR.md) — what the references teach, and what Eskayli takes, transforms, refuses
- [`storyboard/02_CREATIVE_BREAKDOWN.md`](storyboard/02_CREATIVE_BREAKDOWN.md) — strategy, metaphor, palette, type, motion, transitions, sound identity, safe zones
- [`storyboard/03_STORYBOARD_SHOTLIST.md`](storyboard/03_STORYBOARD_SHOTLIST.md) — every shot: time, narration, visual, camera, type, transition, sound, assets
- [`storyboard/04_VO_SCRIPT.md`](storyboard/04_VO_SCRIPT.md) — the narration, direction and phrase timings
- [`ASSET_INVENTORY.md`](ASSET_INVENTORY.md) — every asset, its source and method
- [`PRODUCTION_NOTES.md`](PRODUCTION_NOTES.md) — pipeline, voice consent and method, picture and sound systems, compliance, placeholders, credits
- [`qa/QA_REPORT.md`](qa/QA_REPORT.md) — technical checks, self-critique loop, frame-by-frame, audio, mobile readability, message, anti-AI QC

## Build
Uses the repository root's `node_modules` (`npm install` at the root) and Python 3 with numpy / scipy / pillow
(+ faster-whisper, resemblyzer, jiwer for the voice tools).
```bash
cd eskayli-dz
python3 utils/build_timeline.py            # voice → config/timeline.json (single source of truth)
python3 utils/build_captions.py            # burned-in cues + SRT
python3 utils/make_grain.py                # grain tile + grid
npm run studio                             # preview in Remotion Studio
npm run render:video                       # program (240-frame chunks, joined) + subtitle layer
npm run audio                              # score + SFX + mix + master
npm run export                             # every deliverable + qa/export_report.txt
```
Re-render only what changed: `node utils/render.mjs program 3,7` (chunk = 240 frames = 8 s).

## Layout
```
assets/      images (7 generated sector visuals), grain/ (procedural textures)
voice/       vo_final.wav + takes/ (26 directed takes and their word timings)
music/       music_stem.flac          sfx/   sfx_stem.flac
src/         Film.tsx (the program), Subtitles.tsx, Thumbnail.tsx, scenes/ (C01–C10), components/, lib/
fonts/       Geist, Geist Mono (OFL)
config/      timeline.json (voice timings), captions.json, vo.json
renders/     deliverables (renders/_work = intermediates, git-ignored)
storyboard/  grammar, breakdown, shot list, VO script
qa/          QA report, voice / audio / export reports, contact sheets
utils/       voice/ (comp, QA), audio/ (score, mix, intelligibility), build_*.py, render.mjs, export.sh
```

## To confirm before running
- The « eskaylı DZ » wordmark is a typographic placeholder — swap in the official logo (`src/components/Wordmark.tsx`).
- No contact details on screen (per the brief): carry the action with Meta's CTA button.

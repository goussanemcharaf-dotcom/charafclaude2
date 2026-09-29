# Asset Manifest

Every asset in the film, where it comes from and how it was made. **No stock footage, no stock music, no third-party logos, no 3D.** Everything visual except four photographs is drawn in code (React + SVG + CSS, rendered by Remotion); everything audible except the voice is synthesized in code. The voice is the client's own, cloned with their consent.

Status legend: **FINAL** = in the delivered film · **REVIEW** = creative-review material only · **REJECTED** = generated but not used.

## 1. Photography (AI-generated, fictional)

All four were generated with **Higgsfield — Soul 2** (text-to-image, quality 2k) into the project folder "Portfolio Meta Ad FR". The person is fictional and does not depict anyone real. Downscaled for transfer and render (they are shown at ≤ 1.3× in the film).

| NAME | PURPOSE | TYPE | SOURCE | GENERATION METHOD | RESOLUTION | TRANSPARENCY | SCENE | STATUS |
|---|---|---|---|---|---|---|---|---|
| `assets/images/hero.avif` | Portrait of the fictional creator "Inès Morel" — portfolio hero, about, link preview, statement | Photo (AVIF) | Higgsfield Soul 2, job `46ad8ead…` | Prompt: *"Editorial portrait of a 26-year-old French woman content creator… cream knit sweater, standing by a large window in a bright minimalist Paris apartment… soft natural daylight… 50mm… no text, no logos"*. Centre-crop 3:4, Lanczos resize, AVIF q51 | 600 × 800 | No | S06, S07, S10, S11, thumbnail, directions | FINAL |
| `assets/images/work_skincare.avif` | Project tile "Routine sérum" (UGC · Beauté); chaos screenshot | Photo (AVIF) | Soul 2, job `5bf4bb0c…` | *"Vertical UGC-style photo, close-up of a woman's hands holding an unbranded amber glass serum dropper bottle near her chin… no text, no logos, no labels on the bottle"*. 9:16 → 450×800, AVIF q43. The model still painted a small illegible pseudo-label on the bottle; it is unreadable at display size (≤ 340 px wide) and carries no brand | 450 × 800 | No | S03, S06/S07, S10 | FINAL |
| `assets/images/work_coffee.avif` | Project tile "Pause café" (Reel · Food); chat video attachment; chaos video card | Photo (AVIF) | Soul 2, job `d3fb0474…` | *"…over-the-shoulder view of a woman filming a latte… using a smartphone, her face not visible… no brand names on the phone or cup"*. 9:16 → 450×800, AVIF q39 | 450 × 800 | No | S02, S03, S06/S07, S10 | FINAL |
| `assets/images/work_voice.avif` | Project tile "Spot radio" (Voix off · Pub); chaos screenshot | Photo (AVIF) | Soul 2, job `30f1be70…` | *"…cozy home voice-over studio corner at golden hour: black condenser microphone… no people, no text, no logos"*. 9:16 → 450×800 AVIF; **top 84 px cropped** because the model painted a fake "story" bar with a handle and a view count (fake social proof) → re-encoded AVIF q80 | 450 × 716 | No | S03, S06/S07, S10 | FINAL |
| hero_b (Soul 2 job `c7f4def7…`) | Alternative portrait | Photo | Soul 2 | *"Natural editorial portrait… sitting on a windowsill…"* | — | — | — | REJECTED (too casual for the premium hero) |

## 2. Illustration & UI (drawn in code, original)

Vector, resolution-independent, transparent unless noted. Inspired by familiar interaction patterns (file list, chat, DM, browser) but **not copies** of any product's UI: own colours, radii, layouts, icons; no logos.

| NAME | PURPOSE | TYPE | SOURCE | GENERATION METHOD | TRANSPARENCY | SCENE | STATUS |
|---|---|---|---|---|---|---|---|
| Avatars ×5 (`src/components/ui/Avatar.tsx`: ugc, content, voice, influence, client) | Target identities; the puzzled client | SVG illustration | Original | Hand-built SVG paths with gradient shading, blink + 3 expressions | Yes | S01, S02, S04, S10 | FINAL |
| `AvatarBubble` | White identity bubble with label (reference-style) | SVG + CSS | Original | Avatar at 84 % with a white fade under the label | Circle | S01 | FINAL |
| Icon set ×27 (`src/components/ui/Icons.tsx`) | Play, folder, file, link, lock, send, mic, … | SVG (24 px grid) | Original | Stroke icons, round caps | Yes | all | FINAL |
| `BrowserFrame`, `URLBar` | Desktop window for the portfolio | React/CSS | Original | Neutral chrome (grey dots, no OS branding), typed URL | Rounded rect | S06, S07, thumbnail | FINAL |
| `MobileFrame` | Phone | React/CSS | Original | Generic bezel + camera island + status bar | Yes | S02, S10 | FINAL |
| `DriveWindow` | Generic cloud file browser « Mes fichiers » | React/CSS | Original | File rows with coloured extension badges | Rounded rect | S02–S04 | FINAL |
| `ChatScreen`, `MessageBubble`, `VoiceMessage`, `VideoAttachment`, `LinkLine` | "Chat" (messy before) and "DM" (after) threads | React/CSS | Original | Own palette (deep green header, dotted texture; lavender DM) | — | S02, S10 | FINAL |
| `FileCard`, `FolderCard`, `VideoCard`, `LinkCard`, `ScreenshotCard` | Scattered work | React/CSS | Original | White cards, soft shadows | Rounded rect | S02–S04, S08 | FINAL |
| `Notification` | « Nouveau message », « Lien expiré » | React/CSS | Original | Generic banner (not any OS design) | Rounded rect | S03 | FINAL |
| `Cursor`, `Tap` | Pointer + touch feedback | SVG | Original | Rounded arrow, click ripple | Yes | S04, S10 | FINAL |
| `Chip` | Kinetic tags | React/CSS | Original | Pill labels | Pill | S02, S03 | FINAL |
| Portfolio — `PortfolioPage` (Nav, Hero, WorkGrid, Project, Voice demo, Services, Style, About, Contact) + `PortfolioMobile` | **The hero product**: a premium site for the fictional persona | React/CSS | Original | Editorial layout, warm paper `#F4F1EC`, Instrument Serif + Geist; build-state props for the self-building reveal | Opaque | S06, S07, S10, S11, thumbnail | FINAL |
| `Guide` | Figma-like selection boxes during the build | React/CSS | Original | Violet boxes, handles, labels | Yes | S06 | FINAL |
| `LinkStack`, `LinkCollapse` | 10 links → 1 link (pill `tonnom.com`) | React/CSS | Original | Scatter → deck → collapse → merge | Yes | S08, S09 | FINAL |
| `Star`, `Brackets`, `Rings`, `DrawLine` | Reference-inspired graphic devices, redrawn | SVG | Original | Superellipse star (n = 0.62), viewfinder corners, flowing rings, dotted zigzag | Yes | S04, S06, S07, S10, S12 | FINAL |
| `KineticLine`, `MotionBlur`, `Slam` | Kinetic type, directional blur, slams | React + SVG filter | Original | `feGaussianBlur` with separate x/y deviation, velocity-matched | Yes | all | FINAL |
| Energy layer (`src/components/motion/FX.tsx`: `Camera`, `Flash`, `Shockwaves`, `Burst`, `GlitchFilter`, `LightSweep`) | Beat punches, zoom creep, shake, flashes, shockwave rings, brand-star particles, RGB-split glitch, glints — all driven by `config/music.json` | React + SVG (+ SVG filter) | Original | Seeded, time-based (deterministic); brand star path; `feDisplacementMap` + channel offsets for the glitch | Yes | all (drops, CTA, chaos) | FINAL |
| `CTA` | Message composer typing the CTA | React/CSS | Original | Per-word typing synced to the VO | Pill | S12 | FINAL |
| `Thumbnail` → `renders/05_THUMBNAIL.png` | Cover frame | Composition | Original | Remotion still | Opaque | — | FINAL |
| Direction boards A/B/C → `previews/directions_board.png` | Creative review | Composition | Original | Remotion still (3240×1920) | Opaque | — | REVIEW |
| Asset sheets → `assets/generated/avatars_sheet.png`, `assets/icons/icons_sheet.png`, `assets/ui/ui_kit_sheet.png` | Quick visual index of the code-drawn assets | PNG | Original | Remotion stills | Opaque | — | REVIEW |

## 3. Typography (local files, SIL Open Font License 1.1)

| NAME | PURPOSE | SOURCE | FILE |
|---|---|---|---|
| Inter Tight (variable, + italic) | Kinetic ad type | @fontsource-variable/inter-tight 5.3.0 | `fonts/InterTight-Variable*.woff2` |
| Instrument Serif (regular + italic) | Emphasis; portfolio display | @fontsource/instrument-serif 5.3.0 | `fonts/InstrumentSerif-*.woff2` |
| Geist / Geist Mono (variable) | Portfolio body / metadata | @fontsource-variable/geist(-mono) 5.3.0 | `fonts/Geist*.woff2` |
| Inter (variable) | Generic app UI | @fontsource-variable/inter 5.3.0 | `fonts/Inter-Variable.woff2` |

Latin subsets include every French glyph used (àâçéèêëîïôûœ « » … U+202F).

## 4. Audio

| NAME | PURPOSE | TYPE | SOURCE | GENERATION METHOD | FORMAT | SCENE | STATUS |
|---|---|---|---|---|---|---|---|
| `audio/voiceover/clone/voice_sample_clean.mp3` | The client's narration, isolated from their Twin MCP promo: the cloning reference | Voice | Client upload (their own voice; rights confirmed) | Music removed with a UVR MDX-Net ensemble (Kim_Vocal_2 + UVR-MDX-NET-Voc_FT, ONNX) — `utils/audio/isolate_voice.py` | MP3 256 kb/s mono, 32.5 s | — | SOURCE |
| `audio/voiceover/clone/takes/*.flac` (+ `*_words.json`) | 6 full-script takes + 4 pickups in the cloned voice, with ASR word timestamps | Voice | Higgsfield **Seed Audio 1.0** with the sample above as audio reference | Speech rates 0 to −26; scored by `utils/voice/voice_qa.py` (speaker similarity 0.955–0.973, WER) | FLAC 48 kHz stereo, as delivered (the comp uses the mono sum) | — | SOURCE |
| `audio/voiceover/clone/vo_packed_clone.flac` | The comp: 17 phrases from 4 takes, fitted to the picture | Voice | derived | `utils/voice/fit_vo.py`: phrase cuts at pauses, DP take choice, Rubber Band R3 tempo ×0.87–1.18, clip gain, match EQ to the real voice | FLAC 48 kHz mono | all | FINAL (source) |
| `audio/voiceover/vo_packed_timing.json` | Phrase + word timings of the comp, and which take each phrase comes from | Data | faster-whisper word timestamps, snapped to the audio | `fit_vo.py` | JSON | — | FINAL |
| `audio/voiceover/vo_final.wav` | Voice placed on the film timeline | Voice | derived | `utils/build_timeline.py` (designed pauses, 4 ms fades) | WAV 24-bit 48 kHz mono | all | FINAL |
| `audio/voiceover/julian/` | v1 voice: ElevenLabs preset « Julian » (edited take + timings) | Voice | Higgsfield `text2speech_v2` | Kept so v1 still rebuilds | Opus 48 kHz mono | — | REPLACED (the client wanted their own voice) |
| `audio/music/music_stem.wav` | Original score (after ducking, at mix level) | Music | Original | `utils/audio/synth.py` + `build_audio.py`: additive/FM/subtractive synthesis, 120 BPM D-minor build → silence → build → drop → 117 BPM F-major house groove (tempo computed from the voice) → breakdown → drop → F major | WAV 24-bit 48 kHz stereo | all but « Non. » | FINAL |
| `audio/sfx/sfx_stem.wav` | Every sound effect (pops, slams, whooshes, clicks, notification, typing, bells) | SFX | Original | Synthesized from oscillators, noise and filters; placed on picture events | WAV 24-bit 48 kHz stereo | all but « Non. » | FINAL |
| `audio/master_mix.wav` | Final master | Mix | Original | VO EQ + 3:1 compression, band-split ducking of the music, drum-bus parallel compression, BS.1770-4 normalisation to −14 LUFS, 4× oversampled true-peak limiter (−1.3 dBTP) | WAV 24-bit 48 kHz stereo | — | FINAL |

## 5. Reference (analysis only — not used in the film)

| NAME | PURPOSE | SOURCE | STATUS |
|---|---|---|---|
| `assets/reference/s_01.jpg … s_07.jpg` | 2 fps contact sheets of the supplied reference Reel | User upload | REFERENCE |
| `assets/reference/reference_bubbles_screenshot.png` | The supplied "bubbles" screenshot | User upload | REFERENCE |
| `assets/reference/reference_audio_spectrogram.png` | Reference sound-design analysis | Derived from the upload | REFERENCE |
| Twin MCP promo (client upload, not in the repo) | Source of the client's voice; only the isolated narration above is kept | User upload | REFERENCE |

## 6. Data

| NAME | PURPOSE |
|---|---|
| `config/timeline.json` | Single source of truth: phrases, words, scene windows, cues (all animation + SFX sync) |
| `config/music.json` | Written by the audio build: beat grid, kicks, drops, builds, glitches — what the picture's energy layer reacts to |
| `config/captions.json`, `renders/SUBTITLES_FR.srt` | Caption cues (designed captions + sidecar) |

# Production Notes

## Pipeline (2D / 2.5D only — no Blender, no 3D pipeline)

```
voice (TTS) ─► edit (rubberband) ─► timeline.json ─► Remotion scenes (React/SVG/CSS) ─► program_clean.mp4
                                         │                    └─► Subtitles layer (ProRes 4444 α)
                                         └─► synthesized music + SFX (numpy/scipy) ─► mix + master (−14 LUFS)
                                                                       FFmpeg ─► 01–04 MP4 + 05 PNG + SRT
```

`config/timeline.json` is the single source of truth: every scene boundary, animation cue, caption and sound effect is derived from the voiceover's word timestamps, so picture, captions and sound can't drift apart.

### Build it yourself
```bash
npm install                      # Remotion 4.0.529, React 19, fonts (OFL)
python3 utils/build_timeline.py  # VO -> audio/voiceover/vo_final.wav + config/timeline.json
python3 utils/build_captions.py  # config/captions.json + renders/SUBTITLES_FR.srt
npm run audio                    # music + SFX + mix + master  -> audio/master_mix.wav
npm run render:video             # renders/_work/program_clean.mp4 + subtitles_alpha.mov
npm run export                   # renders/01…05 + qa/export_report.txt
npm run studio                   # live preview (Remotion Studio)
node utils/still.mjs MetaAd previews/x 14.6 20.7   # single frames for review
```
Requirements: Node ≥ 18, Python 3 with numpy/scipy (matplotlib for QA plots), FFmpeg with libx264, a Chromium/Chrome (set `REMOTION_CHROME` if not at the default path).
Everything is deterministic (seeded randomness, time-based animation), so a re-render is frame-identical.

## Tools & versions
Remotion 4.0.529 · React 19.1 · TypeScript 5.8 · Chromium headless shell (software GL) · FFmpeg 6.1.1 (libx264, AAC) · Python 3.11 + numpy/scipy · faster-whisper (voice QA) · rubberband (tempo) · Higgsfield (TTS + image generation).

## Voiceover
- **Voice**: ElevenLabs preset « Julian » (male, French) via Higgsfield `text2speech_v2`. Chosen after scoring French test lines from several ElevenLabs and MiniMax voices with faster-whisper: French language probability, French-vs-English log-probability contrast, and word error rate. Julian had the most natural French (lp_fr −0.257, contrast 0.27) and the best pace. MiniMax voices scored as English-accented (contrast ≈ 0.02) and were dropped; Qwen TTS refused the presets.
- **Take**: B of two full-script takes (1.8 % WER), edited: phrase trims at −40 dB, internal pauses squeezed to ≤ 0.16 s, per-phrase tempo with pitch/formant preservation (×1.14–1.20 in the fast "chaos" half, ×1.0 on « Non. », ×1.04–1.10 in the calm half). After editing: 0.9 % WER.
- **Placement**: `utils/build_timeline.py` re-spaces the 17 phrases with designed pauses (tight at first, 0.72 s of silence after « Non. », breathing after) with 4 ms fades.
- **Clean-up in the mix**: the low-bitrate source carried codec "fill" above 11 kHz and a faint 13.1 kHz tone (−58 dBFS). Fixed with a notch + 11 kHz low-pass (tone now ≈ −80 dBFS), plus HPF 75 Hz and +2 dB at 3.2 kHz for phone-speaker clarity.
- **Alternative**: a female voice (ElevenLabs « Remy », scored 0 % WER on the test line) can replace Julian: regenerate the take, re-run `build_timeline.py`, then rebuild the audio and captions. The picture follows automatically.

## Script — final (French, 100 %)
> Si tu es UGC Creator, Content Creator, Voice Over Artist ou Influenceur… et que tu envoies encore ton travail entre Google Drive, WhatsApp et plusieurs liens… Une vidéo ici. Un fichier là. Un autre lien ailleurs. Et ton client doit chercher partout pour comprendre qui tu es et ce que tu fais ? **Non.** **Ton travail mérite une meilleure présentation.** Je crée pour toi un Premium Website Portfolio, pensé autour de ton univers. Tes projets, tes services, ton style… réunis dans une seule expérience. **Au lieu d'envoyer dix liens… tu envoies un seul lien.** Ton client clique. Et découvre un portfolio professionnel, clair et différent. Écris-moi et on commence.

### Compression applied (brief §06 allows it; priority Hook › Problem › Non › Solution › Portfolio › 10→1 › CTA)
| Removed / trimmed | Why |
|---|---|
| « …à tes clients » (question) | kept on screen instead (« Comment présentes-tu ton travail ? ») |
| « il est temps de changer ça. » | « Non. » already does this job, harder |
| « voir ton meilleur travail » → « qui tu es et ce que tu fais » | shorter, and maps to the portfolio's two jobs (hero / projects) |
| « et de ton activité », « meilleurs », « et toutes les informations importantes » | density |
| « immédiatement » | pace |
| « Fais enfin présenter ton travail à la hauteur de ce qu'il mérite. » | S11 becomes a voice-less-in-spirit "let the design breathe" moment over « professionnel, clair et différent » |

The three mandatory lines are intact: **« Non. »**, **« Ton travail mérite une meilleure présentation. »**, **« Au lieu d'envoyer dix liens… tu envoies un seul lien. »**

## Duration
36.9 s against a "≈ 30–35 s" target. The mandatory lines + the hook + the CTA at a natural French delivery don't fit in 35 s without sounding rushed (the first half is already sped up to ×1.2). The extra ~2 s is spent where it pays: 0.86 s of silence after « Non. » and a ≥ 1.8 s readable end card. A 30 s cut-down is possible by dropping S07's zoom-out/sitemap (≈ 2 s) and tightening the end card.

## Placeholders & compliance
- **`tonnom.com`** (= "ton nom .com", "your name .com") is deliberately a placeholder for the buyer's own domain, used in the link pill, browser bar, link preview and `bonjour@tonnom.com`. All other links are masked (`lien-partage/…/x8k2`). No real or private URL appears.
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

## Known trade-offs
- Photos were transferred downscaled (600×800 hero, 450×800 tiles) because the generation CDN isn't reachable from the render machine; they're never shown above ~1.3× so they stay sharp, but a production site would use the full 2k originals.
- The chaos section is intentionally dense; individual file names there are texture, not meant to be read.
- Captions skip phrases that are already on screen as supers (identity bubbles, « ici / là / ailleurs », « Non. », the promise, « Qui tu es ? / Ce que tu fais ? », the three adjectives, the CTA), so text never appears twice.

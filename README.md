# « Un seul lien » — Premium Creator Portfolio · French Meta Ad

A 36.9 s vertical ad (1080 × 1920, 30 fps) for a premium website-portfolio service aimed at French-speaking UGC creators, content creators, voice-over artists and influencers. 100 % French, voiced by the client in their own voice (cloned with their consent from their own promo narration, directed beat by beat for emotion, then dialogue-edited to the picture). Built entirely in 2D/2.5D code — React + SVG + CSS rendered with [Remotion](https://www.remotion.dev), original synthesized audio in Python, FFmpeg for delivery. No Blender, no 3D pipeline.

> **Ton travail mérite une meilleure présentation.** Au lieu d'envoyer dix liens… tu envoies un seul lien.

## Deliverables — `renders/`
| File | What |
|---|---|
| `02_META_AD.mp4` | **Upload this one.** Designed French captions burned in, Meta delivery encode |
| `01_FINAL_MASTER.mp4` | Clean picture (no captions), master quality |
| `03_CLEAN_VERSION.mp4` | Clean picture, Meta delivery encode |
| `04_SUBTITLED_VERSION.mp4` | Captions, master quality |
| `05_THUMBNAIL.png` | Cover frame |
| `SUBTITLES_FR.srt` | Caption sidecar |

All MP4s: H.264 High, yuv420p BT.709, AAC 256 kb/s 48 kHz stereo, −14 LUFS integrated, true peak ≤ −1 dBTP, fast-start. Technical report: `qa/export_report.txt`.

## Docs
- [`CREATIVE_BRIEF.md`](CREATIVE_BRIEF.md) — target, insight, idea, visual/motion/sound systems, retention strategy
- [`STORYBOARD.md`](STORYBOARD.md) — 12 scenes: time, voice, text, visual, motion, camera, sound, assets, purpose
- [`ASSET_MANIFEST.md`](ASSET_MANIFEST.md) — every asset, its source and generation method
- [`PRODUCTION_NOTES.md`](PRODUCTION_NOTES.md) — pipeline, voice (isolation, cloning, comp, fit), script cuts, placeholders, compliance, credits
- [`QA_REPORT.md`](QA_REPORT.md) — self-critique, frame-by-frame QA, fixes, technical checks

## Build
```bash
npm install
python3 utils/build_timeline.py   # voiceover -> timeline (single source of truth)
python3 utils/build_captions.py   # captions + SRT
npm run audio                     # original music + SFX, mix, master
npm run render:video              # picture + transparent caption layer
npm run export                    # the five deliverables + report
npm run studio                    # interactive preview
```

## Structure
```
src/
  MetaAd.tsx            master timeline (scene slots + transitions)
  Subtitles.tsx         designed captions (separate alpha layer)
  Thumbnail.tsx         cover frame
  timeline.ts           typed access to config/timeline.json
  scenes/               S01…S12 (S02–S04 share Workspace, S08–S09 share LinksScene)
  components/ui/        Avatar, AvatarBubble, BrowserFrame, URLBar, MobileFrame, Cursor, Notification, MessageBubble, VoiceMessage, Icons…
  components/workflow/  FileCard, FolderCard, VideoCard, LinkCard, DriveWindow, ChatScreen, LinkStack, LinkCollapse
  components/portfolio/ PortfolioPage (Nav, Hero, WorkGrid, Project, Services, About, Contact…), PortfolioMobile
  components/motion/    anim (easing/springs), KineticLine, MotionBlur, Slam, Star, Brackets, Rings, DrawLine
  directions/           creative directions A/B/C (style frames)
  dev/                  preview & asset-sheet compositions
styles/tokens.ts        colours, fonts, shadows, safe zones
config/                 timeline.json, captions.json
utils/                  render/still/export scripts, timeline + captions builders, audio/ (voice isolation, synth, mix, loudness, QA), voice/ (take QA, comp + fit)
assets/ audio/ fonts/   sources (images, reference, voice, music, SFX, OFL fonts)
renders/ previews/ qa/  outputs, review frames, QA material
```

The persona « Inès Morel » is fictional; `tonnom.com` ("ton nom .com") is a deliberate placeholder for the buyer's own domain.

#!/usr/bin/env bash
# ESKAYLI DZ — final exports. Inputs (from `npm run render:video` and `npm run audio`):
#   renders/_work/program_clean.mp4    picture, no captions (CRF 10 intermediate, joined chunks)
#   renders/_work/subtitles_alpha.mov  caption layer, ProRes 4444 + alpha
#   renders/_work/master_mix.wav       stereo master, -14 LUFS / <= -1 dBTP
# Outputs (renders/):
#   01_ESKAYLI_META_9x16.mp4      captions burned in, Meta delivery settings   <- upload this (Reels / Stories / Feed 9:16)
#   02_ESKAYLI_MASTER_9x16.mp4    captions burned in, master quality (archive / re-encode source)
#   03_ESKAYLI_CLEAN_9x16.mp4     no burned captions (use with the SRT or the platform's captions)
#   04_ESKAYLI_4x5.mp4            1080 × 1350 centre crop, captions burned in (Feed 4:5)
#   05_ESKAYLI_1x1.mp4            1080 × 1080 centre crop, captions burned in (Feed 1:1)
#   06_ESKAYLI_COVER.png          cover frame 1080 × 1920 (+ 4:5 and 1:1 crops)
#   ESKAYLI_SOUS-TITRES_FR.srt    full French transcript (utils/build_captions.py)
set -euo pipefail
cd "$(dirname "$0")/.."
W=renders/_work
PROG=$W/program_clean.mp4
SUBS=$W/subtitles_alpha.mov
MIX=$W/master_mix.wav
OUT=renders
mkdir -p "$OUT" qa

COMMON_V=(-c:v libx264 -profile:v high -pix_fmt yuv420p -r 30 -g 60 -bf 2
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -movflags +faststart)
MASTER_Q=(-preset slow -crf 13 -level:v 4.2)   # visually lossless; stays under 100 MB for git
META_Q=(-preset slow -crf 17 -maxrate 14M -bufsize 28M -level:v 4.2)
AUDIO=(-c:a aac -b:a 256k -ar 48000 -ac 2)
SUBBED='[0:v][1:v]overlay=0:0:format=auto:shortest=1,format=yuv420p'

echo "01 meta 9:16";   ffmpeg -v error -y -i "$PROG" -i "$SUBS" -i "$MIX" -filter_complex "$SUBBED[v]" -map "[v]" -map 2:a "${COMMON_V[@]}" "${META_Q[@]}" "${AUDIO[@]}" -shortest "$OUT/01_ESKAYLI_META_9x16.mp4"
echo "02 master 9:16"; ffmpeg -v error -y -i "$PROG" -i "$SUBS" -i "$MIX" -filter_complex "$SUBBED[v]" -map "[v]" -map 2:a "${COMMON_V[@]}" "${MASTER_Q[@]}" -c:a aac -b:a 320k -ar 48000 -ac 2 -shortest "$OUT/02_ESKAYLI_MASTER_9x16.mp4"
echo "03 clean 9:16";  ffmpeg -v error -y -i "$PROG" -i "$MIX" -map 0:v -map 1:a "${COMMON_V[@]}" "${META_Q[@]}" "${AUDIO[@]}" -shortest "$OUT/03_ESKAYLI_CLEAN_9x16.mp4"
# the critical content lives in y 440–1480, so both feed ratios are plain centre crops of the captioned frame
echo "04 feed 4:5";    ffmpeg -v error -y -i "$PROG" -i "$SUBS" -i "$MIX" -filter_complex "$SUBBED,crop=1080:1350:0:285[v]" -map "[v]" -map 2:a "${COMMON_V[@]}" "${META_Q[@]}" "${AUDIO[@]}" -shortest "$OUT/04_ESKAYLI_4x5.mp4"
echo "05 feed 1:1";    ffmpeg -v error -y -i "$PROG" -i "$SUBS" -i "$MIX" -filter_complex "$SUBBED,crop=1080:1080:0:420[v]" -map "[v]" -map 2:a "${COMMON_V[@]}" "${META_Q[@]}" "${AUDIO[@]}" -shortest "$OUT/05_ESKAYLI_1x1.mp4"
echo "06 cover";       node utils/still.mjs Thumbnail "$W" 0 >/dev/null && cp "$W/Thumbnail_0000.png" "$OUT/06_ESKAYLI_COVER.png"
ffmpeg -v error -y -i "$OUT/06_ESKAYLI_COVER.png" -vf crop=1080:1350:0:285 "$OUT/06_ESKAYLI_COVER_4x5.png"
ffmpeg -v error -y -i "$OUT/06_ESKAYLI_COVER.png" -vf crop=1080:1080:0:420 "$OUT/06_ESKAYLI_COVER_1x1.png"
python3 utils/build_captions.py >/dev/null   # (re)writes renders/ESKAYLI_SOUS-TITRES_FR.srt

# technical report: stream specs + loudness of every deliverable
{
  echo "ESKAYLI DZ — EXPORT REPORT — $(date -u +%Y-%m-%dT%H:%MZ)"
  for f in "$OUT"/0[1-5]_*.mp4; do
    echo; echo "== $(basename "$f")  ($(du -h "$f" | cut -f1))"
    ffprobe -v error -show_entries stream=codec_name,profile,width,height,r_frame_rate,pix_fmt,bit_rate,sample_rate,channels:format=duration,bit_rate -of default=nw=1 "$f" | sed 's/^/   /'
    ffmpeg -hide_banner -nostats -i "$f" -map 0:a -af ebur128=peak=true -f null - 2>&1 | awk '/Summary/{s=1} s&&/I:|LRA:|Peak:/{print "   " $0}'
  done
  for f in "$OUT"/06_*.png; do echo; echo "== $(basename "$f")  $(ffprobe -v error -show_entries stream=width,height -of csv=p=0 "$f")"; done
  echo; echo "== ESKAYLI_SOUS-TITRES_FR.srt  $(grep -c -- '-->' "$OUT/ESKAYLI_SOUS-TITRES_FR.srt") cues"
} > qa/export_report.txt
cat qa/export_report.txt

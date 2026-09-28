#!/usr/bin/env bash
# Final exports. Inputs (from `npm run render:video` and `npm run audio`):
#   renders/_work/program_clean.mp4    picture, no captions (CRF 10 intermediate)
#   renders/_work/subtitles_alpha.mov  captions layer, ProRes 4444 + alpha
#   audio/master_mix.wav               stereo master, -14 LUFS / <= -1 dBTP
# Outputs (renders/):
#   01_FINAL_MASTER.mp4        clean picture, master quality (archive / reuse)
#   02_META_AD.mp4             captions burned in, Meta delivery settings  <- upload this
#   03_CLEAN_VERSION.mp4       clean picture, Meta delivery settings
#   04_SUBTITLED_VERSION.mp4   captions burned in, master quality
#   05_THUMBNAIL.png           cover frame
#   SUBTITLES_FR.srt           caption sidecar (from utils/build_captions.py)
set -euo pipefail
cd "$(dirname "$0")/.."
W=renders/_work
PROG=$W/program_clean.mp4
SUBS=$W/subtitles_alpha.mov
MIX=audio/master_mix.wav
OUT=renders
mkdir -p "$OUT" qa

COMMON_V=(-c:v libx264 -profile:v high -pix_fmt yuv420p -r 30 -g 60 -bf 2
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -movflags +faststart)
MASTER_Q=(-preset slow -crf 14 -level:v 4.2)
META_Q=(-preset slow -crf 17 -maxrate 14M -bufsize 28M -level:v 4.2)
AUDIO=(-c:a aac -b:a 256k -ar 48000 -ac 2)
SUBBED='[0:v][1:v]overlay=0:0:format=auto:shortest=1,format=yuv420p[v]'

echo "01 master";  ffmpeg -v error -y -i "$PROG" -i "$MIX" -map 0:v -map 1:a "${COMMON_V[@]}" "${MASTER_Q[@]}" "${AUDIO[@]}" -shortest "$OUT/01_FINAL_MASTER.mp4"
echo "02 meta";    ffmpeg -v error -y -i "$PROG" -i "$SUBS" -i "$MIX" -filter_complex "$SUBBED" -map "[v]" -map 2:a "${COMMON_V[@]}" "${META_Q[@]}" "${AUDIO[@]}" -shortest "$OUT/02_META_AD.mp4"
echo "03 clean";   ffmpeg -v error -y -i "$PROG" -i "$MIX" -map 0:v -map 1:a "${COMMON_V[@]}" "${META_Q[@]}" "${AUDIO[@]}" -shortest "$OUT/03_CLEAN_VERSION.mp4"
echo "04 subbed";  ffmpeg -v error -y -i "$PROG" -i "$SUBS" -i "$MIX" -filter_complex "$SUBBED" -map "[v]" -map 2:a "${COMMON_V[@]}" "${MASTER_Q[@]}" "${AUDIO[@]}" -shortest "$OUT/04_SUBTITLED_VERSION.mp4"
echo "05 thumb";   node utils/still.mjs Thumbnail "$W" 0 >/dev/null && cp "$W/Thumbnail_0000.png" "$OUT/05_THUMBNAIL.png"

# technical report: stream specs + loudness of every deliverable
{
  echo "EXPORT REPORT — $(date -u +%Y-%m-%dT%H:%MZ)"
  for f in "$OUT"/0[1-4]_*.mp4; do
    echo; echo "== $(basename "$f")  ($(du -h "$f" | cut -f1))"
    ffprobe -v error -show_entries stream=codec_name,profile,width,height,r_frame_rate,pix_fmt,bit_rate,sample_rate,channels:format=duration,bit_rate -of default=nw=1 "$f" | sed 's/^/   /'
    ffmpeg -hide_banner -nostats -i "$f" -map 0:a -af ebur128=peak=true -f null - 2>&1 | awk '/Summary/{s=1} s&&/I:|LRA:|Peak:/{print "   " $0}'
  done
  echo; echo "== 05_THUMBNAIL.png"; ffprobe -v error -show_entries stream=width,height -of csv=p=0 "$OUT/05_THUMBNAIL.png" | sed 's/^/   /'
} > qa/export_report.txt
cat qa/export_report.txt

#!/usr/bin/env bash
# Turns a ReelForge render (final.mp4, 1080x1920 with audio) into the small,
# silent web loops the homepage plays, plus posters:
#   <slug>.<hash>.mp4   H.264 High, 720x1280, CRF 27, no audio, faststart
#   <slug>.<hash>.webm  AV1 (SVT-AV1, CRF 46) if ffmpeg has it, else VP9
#   <slug>.<hash>.avif / .webp / .jpg  poster frame at POSTER_AT seconds
#     (default 1.5), 720 px wide, plus -360 and -540 AVIF/WebP for srcset
# <hash> is the first 8 hex chars of the master's SHA-256, so the files can be
# cached as immutable. Usage:
#   scripts/reels/transcode.sh <final.mp4> <slug> [out-dir=public/reels]
# Needs ffmpeg 6+ (libx264; libsvtav1 or libvpx-vp9; libaom-av1 for AVIF;
# libwebp for WebP).
set -euo pipefail
src=${1:?final.mp4}
slug=${2:?slug}
out=${3:-public/reels}
at=${POSTER_AT:-1.5}
mkdir -p "$out"
hash=$(sha256sum "$src" | cut -c1-8)
base="$out/$slug.$hash"
vf="scale=720:1280:flags=lanczos"

ffmpeg -v error -y -i "$src" -vf "$vf" -c:v libx264 -profile:v high -preset slow \
  -crf 27 -pix_fmt yuv420p -movflags +faststart -an "$base.mp4"

encoders=$(ffmpeg -hide_banner -encoders 2>/dev/null)
if [[ $encoders == *libsvtav1* ]]; then
  ffmpeg -v error -y -i "$src" -vf "$vf" -c:v libsvtav1 -crf 46 -preset 6 -g 300 \
    -svtav1-params tune=0 -pix_fmt yuv420p -an "$base.webm"
else
  ffmpeg -v error -y -i "$src" -vf "$vf" -c:v libvpx-vp9 -crf 36 -b:v 0 \
    -row-mt 1 -an "$base.webm"
fi

ffmpeg -v error -y -ss "$at" -i "$src" -frames:v 1 -vf "$vf" -q:v 4 "$base.jpg"
ffmpeg -v error -y -ss "$at" -i "$src" -frames:v 1 -vf "$vf" -c:v libaom-av1 \
  -still-picture 1 -crf 38 -cpu-used 4 -pix_fmt yuv420p "$base.avif"
ffmpeg -v error -y -ss "$at" -i "$src" -frames:v 1 -vf "$vf" -c:v libwebp \
  -quality 78 "$base.webp"
for w in 360 540; do
  h=$((w * 16 / 9))
  ffmpeg -v error -y -ss "$at" -i "$src" -frames:v 1 -vf "scale=$w:$h:flags=lanczos" \
    -c:v libaom-av1 -still-picture 1 -crf 38 -cpu-used 4 -pix_fmt yuv420p "$base-$w.avif"
  ffmpeg -v error -y -ss "$at" -i "$src" -frames:v 1 -vf "scale=$w:$h:flags=lanczos" \
    -c:v libwebp -quality 78 "$base-$w.webp"
done

ls -l "$base".* "$base"-*
echo "$slug $hash"

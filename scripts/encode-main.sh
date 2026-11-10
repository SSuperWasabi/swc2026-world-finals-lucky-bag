#!/usr/bin/env bash
# AE 렌더(무손실 mov, 0~18초)를 앱용 H.264 두 개로 자른다: 인트로 0~8초, 루프 8~18초(10초, 끝과 시작이 이어짐)
# 사용: scripts/encode-main.sh <ffmpeg 경로> <렌더 mov>
set -euo pipefail
FF="$1"; SRC="$2"; OUT="$(dirname "$0")/../app/assets/main"
mkdir -p "$OUT"
COMMON=(-an -c:v libx264 -profile:v high -level:v 5.1 -pix_fmt yuv420p -crf 18 -preset slow -g 30 -movflags +faststart)
"$FF" -y -loglevel error -i "$SRC" -t 8 "${COMMON[@]}" "$OUT/main-intro.mp4"
"$FF" -y -loglevel error -ss 8 -i "$SRC" -t 10 "${COMMON[@]}" "$OUT/main-loop.mp4"
ls -la "$OUT"

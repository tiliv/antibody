#!/bin/bash

OUT="$1"
GLOB="$2"

chmod +x bin/stat-page.js
mkdir -p "$OUT"
for f in $(git ls-files "$GLOB"); do
  node bin/stat-page.js "$f" > "$OUT/$(basename $(dirname "$f")).json"
done

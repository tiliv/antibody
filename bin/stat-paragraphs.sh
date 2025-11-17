#!/usr/bin/env bash
# NOTICE: Vibe code:

set -euo pipefail
repo_root="$(git rev-parse --show-toplevel)"; cd "$repo_root"

f="${1:-}"; [ -n "$f" ] || { echo "usage: $0 <path>"; exit 2; }
f="${1#*/}"

out_dir="docs/_data/git/paragraphs/"; mkdir -p "$out_dir"
out="$out_dir/${f//\//,}.json"

bash bin/stat-paragraph-log.sh "$f" | node bin/stat-paragraph.js > "$out"
echo "$out"

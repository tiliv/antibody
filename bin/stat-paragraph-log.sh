#!/usr/bin/env bash
# NOTICE: Vibe code: streams git logs on a range of lines that markdown uses as
# one paragraph.

set -euo pipefail
file="docs/$1"
head_sha="$(git rev-parse HEAD)"
printf '{"file":"%s","head":"%s"}\n' "$file" "$head_sha"

while read -r para start end; do
  printf '{"para":%d,"range":[%d,%d]}\n' "$para" "$start" "$end"
  git -c core.quotepath=off log --no-color --no-decorate \
  --format='%H%x00%aN <%aE>%x00%aI%x00%s' -p -L "$start,$end:$file" \
  | perl -0777 -ne 'print'  # pass through as one blob
  printf '\n---ENDPARA---\n'
done < <(bin/stat-paragraphs-ranges.sh "$file")

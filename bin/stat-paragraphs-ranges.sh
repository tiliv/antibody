#!/usr/bin/env bash
# NOTICE: Vibe code: Emit paragraphs. This is built to acknowledge linebreaks
# (without blanks) and maintain paragraphs for those lines. If you use
# linebreaks, you increase the resolution of your built-in blame history.

set -euo pipefail
file="$1"
awk '
  BEGIN{para=0; blank=1; start=0}
  function flush(){ if(start){ printf("%d %d %d\n", para, start, NR-1); start=0 } }
  {
    if ($0 ~ /^[[:space:]]*$/) { blank=1; next }
    if (blank) { flush(); para++; start=NR; blank=0 }
  }
  END{ if(start){ printf("%d %d %d\n", para, start, NR) } }
' "$file"

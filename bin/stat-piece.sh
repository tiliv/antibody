#!/usr/bin/env bash
# NOTICE: Vibe code: Blame linkable blocks (array + refdex)

# set -euo pipefail  # Uncomment when stable

PIECE_PATH=$1
DOC_ROOT="docs"

# Derive repo-internal path key: strip leading docroot, drop .md, commas for dirs
f="${PIECE_PATH#*/}"
f="${f%.md}"
out_dir="$DOC_ROOT/_data/git/blame"
out="$out_dir/${f//\//,}.json"
mkdir -p "$out_dir"

head_sha="$(git rev-parse HEAD)"
now_utc="$(date -u +%FT%TZ)"

pmap="$(mktemp)"; bmap="$(mktemp)"; psmap="$(mktemp)"
trap 'rm -f "$pmap" "$bmap" "$psmap"' EXIT

# Map file line → paragraph index (1..N), based on blank-line delimited paragraphs.
awk '
  BEGIN{para=0; blank=1}
  { if ($0 ~ /^[[:space:]]*$/) { blank=1; next }
    if (blank) { para++; blank=0 }
    printf("%d\t%d\n", NR, para)
  }' "$DOC_ROOT/$f.md" > "$pmap"

# Map file line → commit sha (from blame)
git -c core.quotepath=off \
  blame --line-porcelain --root -w -M -C -C -- "$PIECE_PATH" \
| awk '
    /^[0-9a-f]{7,40} [0-9]+ [0-9]+ [0-9]+$/ { sha=$1; ln=$3; next }
    /^\t/ { commit[ln]=sha; ln++; next }
    END { for (i in commit) printf("%d %s\n", i, commit[i]) }
  ' \
| LC_ALL=C sort -n > "$bmap"

# Join by line number → get first (topmost) sha per paragraph
# Emit "para sha" sorted by para
join -1 1 -2 1 <(LC_ALL=C sort -n "$pmap") <(LC_ALL=C sort -n "$bmap") \
| awk '!seen[$2]++ { printf "%d %s\n", $2, $3 }' \
| LC_ALL=C sort -n -k1,1 > "$psmap"

# Build JSON:
# {
#   "piece": "path/without/docs/.md",
#   "head":  "<sha>",
#   "generated_at": "<ISO-8601Z>",
#   "git": { "blame_for": "docs/<path>.md" },
#   "refdex": ["shaA","shaB",...],                # unique shas in appearance order
#   "paragraphs": [ {"p":"001","ref":0}, ... ]    # ordered; ref indexes into refdex
# }
awk -v head="$head_sha" -v piece="$f" -v now="$now_utc" -v full="$DOC_ROOT/$f.md" '
  BEGIN{ n=0; r=0 }
  {
    p[++n]=$1; s[$1]=$2
    if (!(seen[$2]++)) { ref[++r]=$2; refi[$2]=r-1 }
  }
  END{
    print "{"
    printf("  \"piece\": \"%s\",\n", piece)
    printf("  \"head\": \"%s\",\n", head)
    printf("  \"generated_at\": \"%s\",\n", now)
    printf("  \"git\": {\n    \"blame_for\": \"%s\"\n  },\n", full)

    # refdex
    printf("  \"refdex\": [\n")
    for (i=1;i<=r;i++){
      printf("    \"%s\"%s\n", ref[i], (i<r?",":""))
    }
    printf("  ],\n")

    # paragraphs
    printf("  \"paragraphs\": [\n")
    for (i=1;i<=n;i++){
      printf("    {\"p\": \"%03d\", \"ref\": %d}%s\n", p[i], refi[s[p[i]]], (i<n?",":""))
    }
    printf("  ]\n")

    print "}"
  }
' "$psmap" > "$out"

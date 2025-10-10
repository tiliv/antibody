#!/usr/bin/env bash
# NOTICE: Vibe code: Get the latest commit ref for each paragraph, 1-indexed.
# These go to docs/_data/git/blame/

set -euo pipefail

PIECE_PATH=$1
f="${PIECE_PATH#*/}"  # Remove built-in docroot for an internal reference
f="${f%.md}"
DOC_ROOT="docs"
out_dir="$DOC_ROOT/_data/git/blame"
# translate for key as a long filename
out="$out_dir/${f//\//,}.json"
mkdir -p "$out_dir"
echo $out

head_sha="$(git rev-parse HEAD)"

pmap="$(mktemp)"; bmap="$(mktemp)"; trap 'rm -f "$pmap" "$bmap"' EXIT

# lineno -> paragraph index
awk '
  BEGIN{para=0; blank=1}
  /^[[:space:]]*$/ {blank=1; next}
  { if (blank) { para++; blank=0 } printf("%d\t%d\n", NR, para) }
' "$DOC_ROOT/$f.md" > "$pmap"

# lineno -> commit sha
git -c core.quotepath=off blame --line-porcelain -- "$PIECE_PATH" |
awk '
  /^[0-9a-f]{7,40} [0-9]+ [0-9]+ [0-9]+$/ { sha=$1; ln=$3; next }
  /^\t/ { commit[ln]=sha; ln++; next }
  END { for (i in commit) printf("%d\t%s\n", i, commit[i]) }
' > "$bmap"

# Hash-join: first sha per paragraph; then numeric sort; then JSON with zero-padded keys
LC_ALL=C awk -F'\t' '
  FNR==NR { p[$1]=$2; next }                    # pmap: line -> para
  {
    para = p[$1]
    if (para && !seen[para]++) print para "\t" $2
  }
' "$pmap" "$bmap" \
| LC_ALL=C sort -n -k1,1 \
| awk -F'\t' -v head="$head_sha" '
  BEGIN { first=1 }
  NR==0 { print "{\"*\":\"" head "\"}"; exit }
  NR==1 { printf("{"); }
  {
    printf("%s\"%03d\":\"%s\"", (first?"":","), $1, $2);
    first=0
  }
  END { if (first) printf("{\"*\":\"%s\"}", head); printf("}\n"); }
' > "$out"

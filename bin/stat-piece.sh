#!/usr/bin/env bash
# NOTICE: Vibe code: Blame linkable blocks

# set -euo pipefail  # Turn this off if you need to see what's going on

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

awk '
  BEGIN{para=0; blank=1}
  { if ($0 ~ /^[[:space:]]*$/) { blank=1; next }
    if (blank) { para++; blank=0 }
    printf("%d\t%d\n", NR, para)
  }' "$DOC_ROOT/$f.md" > "$pmap"

git -c core.quotepath=off blame --line-porcelain -- "$PIECE_PATH" |
awk '
  /^[0-9a-f]{7,40} [0-9]+ [0-9]+ [0-9]+$/ { sha=$1; ln=$3; next }
  /^\t/ { commit[ln]=sha; ln++; next }
  END { for (i in commit) printf("%d %s\n", i, commit[i]) }
' | LC_ALL=C sort -n > "$bmap"

# 1) join by lineno (already sorted numerically above), pick first line per paragraph
# 2) sort by paragraph index numerically
# 3) emit zero-padded keys in JSON, with HEAD fallback if empty
join -1 1 -2 1 <(LC_ALL=C sort -n "$pmap") <(LC_ALL=C sort -n "$bmap") \
| awk '!seen[$2]++ { printf "%d %s\n", $2, $3 }' \
| LC_ALL=C sort -n -k1,1 \
| awk -v head="$head_sha" '
    { a[++n]=$1; b[n]=$2 }
    END{
      if (!n) { printf("{\"*\":\"%s\"}\n", head); exit }
      printf("{");
      for (i=1;i<=n;i++){
        if (i>1) printf(",");
        printf("\"%03d\":\"%s\"", a[i], b[i]);
      }
      printf("}\n");
    }
  ' > "$out"

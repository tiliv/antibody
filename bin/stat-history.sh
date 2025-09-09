#!/bin/sh
set -eu

# --- args ---
out_root="${1:-_data/git/history}"
shift || true
[ "$#" -gt 0 ] || { echo "usage: $0 [out_root] <pattern...>" >&2; exit 2; }

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
mkdir -p "$out_root"

# Python program (reads git log from stdin, args: path repo_root)
read_only_py='
import sys, json, datetime, re
path, repo_root, sentinel = sys.argv[1], sys.argv[2], sys.argv[3]

ADD = re.compile(r"\{\+(.*?)\+\}", re.S)   # {+ … +}
DEL = re.compile(r"\[\-(.*?)\-\]", re.S)   # [- … -]
blen = lambda s: len(s.encode("utf-8"))

weeks = {}
first = {"sha": None, "date": None, "week": None}
last  = {"sha": None, "date": None, "week": None}

raw = sys.stdin.read()
for chunk in raw.split(sentinel):
    if not chunk.strip(): continue
    header, _, body = chunk.partition("\n")
    try: sha, iso, week = header.strip().split(" ", 3)
    except ValueError: continue

    adds = sum(blen(m.group(1)) for m in ADD.finditer(body))
    dels = sum(blen(m.group(1)) for m in DEL.finditer(body))

    if last["sha"] is None:
        last = {"sha": sha, "date": iso, "week": week}
    first = {"sha": sha, "date": iso, "week": week}

    b = weeks.setdefault(week, {"bytes_changes":0, "bytes_touches":0})
    b["bytes_changes"] += (adds + dels)
    b["bytes_touches"] += max(adds, dels)

hist = [{"week": w, "bytes_changes": v["bytes_changes"], "bytes_touches": v["bytes_touches"]}
        for w, v in sorted(weeks.items())]

print(json.dumps({
  "meta": {
    "path": path,
    "repo": repo_root.rsplit("/",1)[-1],
    "generated_at": datetime.datetime.utcnow().isoformat(timespec="seconds")+"Z",
    "total_bytes_changes": sum(v["bytes_changes"] for v in weeks.values()),
    "total_bytes_touches": sum(v["bytes_touches"] for v in weeks.values()),
    "unique_weeks": len(hist),
    "first_commit": first,
    "last_commit":  last
  },
  "histogram": hist,
  "stats": {}
}, indent=2))
'

emit_json() {
  path="$1"
  wd_regex=${WORD_DIFF_REGEX:-'\w+|[^\s\w]'}
  diff_alg=${DIFF_ALG:-histogram}
  sentinel=$'\036'  # ASCII RS

    git -C "$repo_root" \
    -c diff.wordRegex="$wd_regex" \
    -c diff.algorithm="$diff_alg" \
    log --follow -M --no-merges \
    --format="${sentinel}%H %cI %cd" --date=format:%G-W%V \
    -p -U0 --word-diff=plain --no-color --no-ext-diff --no-textconv -- "$path" \
  | python3 -c "$read_only_py" "$path" "$repo_root" "$sentinel"
}

# Use Git pathspecs with glob magic so ** works regardless of the shell npm uses.
# We iterate NUL-delimited to be space-safe.
for pattern in "$@"; do
  ps=":(glob)$pattern"
  git ls-files -z -- "$ps" \
  | while IFS= read -r -d '' f; do
      rel="${f#./}"
      short="${rel#*/}"
      short="${short//\//,}"
      out="$out_root/${short%.md}.json"
      dir=$(dirname "$out")
      [ -d "$dir" ] || mkdir -p "$dir"
      emit_json "$rel" >"$out"
      echo "wrote $out"
    done
done

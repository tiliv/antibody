#!/usr/bin/env bash
# NOTICE: Vibe code: Try parallelizing

set -euo pipefail

script="${1:-}"
if [ -z "$script" ]; then
  echo "usage: $(basename "$0") path/to/worker-script.sh" >&2
  exit 2
fi

CPU="${CPU:-}"
if [ -z "$CPU" ]; then
  CPU=$(command -v nproc >/dev/null 2>&1 && nproc) || true
  CPU="${CPU:-$(sysctl -n hw.ncpu 2>/dev/null || true)}"
  CPU="${CPU:-$(getconf _NPROCESSORS_ONLN 2>/dev/null || echo 1)}"
fi
[ -z "$CPU" ] && CPU=1

echo "CPU: $CPU"
echo "script: $script"

# 1) GNU parallel if present
if command -v parallel >/dev/null 2>&1; then
  echo "parallel -j $CPU --will-cite $script"
  cat - | parallel -j "$CPU" --will-cite "$script"
  exit
fi

# 2) Homebrew GNU xargs if present
if command -v gxargs >/dev/null 2>&1; then
  echo "gxargs -P $CPU -n 1 $script"
  cat - | gxargs -P "$CPU" -n 1 "$script"
  exit
fi

# 3) System xargs with -P support
if xargs -P 1 echo </dev/null >/dev/null 2>&1; then
  echo "xargs -P $CPU -n 1 $script"
  cat - | xargs -P "$CPU" -n 1 "$script"
  exit
fi

# 4) Sequential fallback
echo "sequential fallback"
while IFS= read -r f; do
  echo "$script \"$f\""
  "$script" "$f"
done

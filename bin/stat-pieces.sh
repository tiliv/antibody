#!/usr/bin/env bash
# NOTICE: Vibe code: Try to read a lot of files' git stats for serialization

# set -euo pipefail  # Turn this off if you need to see what's going on

script=bin/stat-piece.sh

# Resolve concurrency (Darwin, Linux, POSIX)
CPU="${CPU:-}"
if [ -z "${CPU}" ]; then
  CPU="$(command -v nproc >/dev/null 2>&1 && nproc) || true"
  CPU="${CPU:-$(sysctl -n hw.ncpu 2>/dev/null || true)}"
  CPU="${CPU:-$(getconf _NPROCESSORS_ONLN 2>/dev/null || echo 1)}"
fi
[ -z "${CPU}" ] && CPU=1

# Prefer GNU parallel if present
if command -v parallel >/dev/null 2>&1; then
  parallel -j "${CPU}" --will-cite bash "$script"
  exit
fi

# GNU xargs (Linux) or Homebrew gxargs (Darwin)
if xargs --version 2>/dev/null | grep -qi 'gnu'; then
  xargs -P "${CPU}" -n 1 bash "$script"
  exit
fi
if command -v gxargs >/dev/null 2>&1; then
  gxargs -P "${CPU}" -n 1 bash "$script"
  exit
fi

# Last resort: sequential (portable)
while IFS= read -r f; do
  bash "$script" "$f"
done

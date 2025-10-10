#!/usr/bin/env bash
set -euo pipefail

PATTERN="docs/journal/**/index.md"

# Discover baseline
if [[ -n "${GITHUB_SHA:-}" ]]; then
  # CI
  git fetch --no-tags --depth=200 origin +refs/heads/*:refs/remotes/origin/* >/dev/null 2>&1 || true
  if [[ -n "${GITHUB_BASE_REF:-}" ]]; then
    BASE="origin/${GITHUB_BASE_REF}"
  else
    BASE="${BASE_REF:-origin/main}"
  fi
  RANGE="$(git merge-base "$BASE" "$GITHUB_SHA")...$GITHUB_SHA"
else
  # Local
  UPSTREAM="${UPSTREAM_REF:-@{upstream}}"
  if git rev-parse --symbolic-full-name "$UPSTREAM" >/dev/null 2>&1; then
    RANGE="$(git merge-base "$UPSTREAM" HEAD)...HEAD"
  else
    # No upstream; compare to previous commit
    RANGE="HEAD~1...HEAD"
  fi
fi

# Collect tracked A/M/R files
git diff --name-only --diff-filter=ACMR --find-renames "$RANGE" -- $PATTERN

# Also include new/untracked that match pattern (useful locally before first commit)
git ls-files -o --exclude-standard -- $PATTERN

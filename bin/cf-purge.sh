#!/usr/bin/env bash
# Purge Cloudflare's cache for what a deploy actually changed.
#
# Precise by default: when a push touched ONLY journal/ content, purge just those
# permalinks plus the index/sitemap pages that list them. Anything else — a
# template/engine/_config/_data/widget change, or a run with no diff to inspect
# (schedule / workflow_dispatch / first push) — purges the whole zone, because
# those can change every page.
#
# Disk path == url path (the engine dropped the publish→journal remap), so a
# changed file maps to its URL by just dropping index.md / .md and prepending the
# site origin. Citation/content lives in a submodule, so a content change shows in
# our diff only as a gitlink bump; we diff INSIDE the submodule (old pin → new pin)
# to recover the changed pages.
#
# Env (set by the workflow):
#   CLOUDFLARE_API_TOKEN  token scoped to Zone > Cache Purge   (empty => no-op)
#   CLOUDFLARE_ZONE_ID    the zone id                          (empty => no-op)
#   EVENT                 github.event_name
#   BEFORE_SHA            github.event.before (push only)
#   AFTER_SHA             github.sha
set -uo pipefail

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ] || [ -z "${CLOUDFLARE_ZONE_ID:-}" ]; then
  echo "::notice::CLOUDFLARE_API_TOKEN / CLOUDFLARE_ZONE_ID not set — skipping cache purge"
  exit 0
fi

api="https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache"
auth=(-H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" -H "Content-Type: application/json")

# Site origin, e.g. https://antibody.fort-collins.colorado.anecdote.channel
site_url="$(sed -n 's/^url:[[:space:]]*"\{0,1\}\([^"#]*\)"\{0,1\}.*/\1/p' _config.yml | head -n1)"
site_url="${site_url%% }"; site_url="${site_url%/}"

purge_everything() {
  echo "purge: everything ($1)"
  curl -fsS "${auth[@]}" "$api" --data '{"purge_everything":true}' \
    | (jq -r 'if .success then "purge: ok" else "purge FAILED: \(.errors)" end' 2>/dev/null || cat)
}

purge_files() { # args: absolute urls
  # Cloudflare accepts up to 30 files per request; batch.
  local all=("$@") i
  for ((i = 0; i < ${#all[@]}; i += 30)); do
    local batch=("${all[@]:i:30}") body
    body="$(printf '%s\n' "${batch[@]}" | jq -R . | jq -s '{files: .}')"
    echo "purge: ${#batch[@]} url(s)"; printf '  %s\n' "${batch[@]}"
    curl -fsS "${auth[@]}" "$api" --data "$body" \
      | (jq -r 'if .success then "purge: ok" else "purge FAILED: \(.errors)" end' 2>/dev/null || cat)
  done
}

# --- decide precise vs everything -------------------------------------------
zero="0000000000000000000000000000000000000000"
if [ "${EVENT:-}" != "push" ] || [ -z "${BEFORE_SHA:-}" ] || [ "${BEFORE_SHA}" = "$zero" ]; then
  purge_everything "no diff range: ${EVENT:-unknown}"; exit 0
fi

changed="$(git diff --name-only "$BEFORE_SHA" "$AFTER_SHA" 2>/dev/null)" || { purge_everything "diff failed"; exit 0; }
[ -z "$changed" ] && { purge_everything "empty diff"; exit 0; }

# Any path outside journal/ can affect every page -> everything.
if printf '%s\n' "$changed" | grep -qvE '^journal/'; then
  purge_everything "non-content change present"; exit 0
fi

# --- precise: all changes are under journal/ --------------------------------
# Base pages that list/aggregate pieces always get purged alongside the pieces.
urls=("${site_url}/" "${site_url}/journal/" "${site_url}/sitemap.xml" "${site_url}/sitemap_root.xml")

emit_url() { # repo-relative path -> page/asset url(s)
  local p="$1"
  case "$p" in
    */index.md|index.md) urls+=("${site_url}/${p%index.md}") ;;   # piece dir
    *.md)                urls+=("${site_url}/${p%.md}/") ;;        # slug page
    *)                   urls+=("${site_url}/${p}"          \
                                "${site_url}/${p%/*}/") ;;         # asset + its page
  esac
}

precise_ok=1
while IFS= read -r path; do
  [ -z "$path" ] && continue
  mode="$(git ls-tree "$AFTER_SHA" "$path" | awk '{print $1}')"
  if [ "$mode" = "160000" ]; then
    # Content submodule bump: diff inside it to find changed pages.
    old="$(git rev-parse "${BEFORE_SHA}:${path}" 2>/dev/null)"
    new="$(git rev-parse "${AFTER_SHA}:${path}" 2>/dev/null)"
    if [ -z "$old" ] || [ -z "$new" ] || [ "$old" = "$new" ]; then continue; fi
    git submodule update --init --depth=1 "$path" >/dev/null 2>&1
    git -C "$path" fetch -q --depth=200 origin "$new" "$old" >/dev/null 2>&1 \
      || git -C "$path" fetch -q origin >/dev/null 2>&1
    inner="$(git -C "$path" diff --name-only "$old" "$new" 2>/dev/null)" || { precise_ok=0; break; }
    while IFS= read -r f; do [ -z "$f" ] && continue; emit_url "${path}/${f}"; done <<< "$inner"
  else
    emit_url "$path"
  fi
done <<< "$changed"

if [ "$precise_ok" != 1 ]; then
  purge_everything "could not resolve a submodule diff"; exit 0
fi

# Dedupe and purge.
mapfile -t urls < <(printf '%s\n' "${urls[@]}" | awk 'NF && !seen[$0]++')
purge_files "${urls[@]}"

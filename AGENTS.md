# Orientation

This repository is one **Civic Node**: a single installation in a network meant
to be copied. The README and the wiki cover *what* this is and *how* to run it;
[`VISION.md`](VISION.md) is the whole picture — the constellation and this node's
place in it; [`OPEN-QUESTIONS.md`](OPEN-QUESTIONS.md) holds what's deferred. This
file is the why-shaped map, the ideas underneath the surface that a README won't
lead with.

## The thrust

- **Information quality is ranked, on purpose.** First-party claims carrying their
  own metadata beat hearsay, and hearsay beats fraud. The whole apparatus exists
  to keep first-party local journalism legible and attributable rather than
  laundered through someone else's attention economy.
- **A node is meant to be replicated.** The point isn't this one site; it's that
  any city can stand one up. Treat decisions through that lens: would the next
  operator be able to copy this and understand it?
- **The license is a posture, not boilerplate.** You may copy the code, text, and
  license only if you attribute yourself as the author. See CONSTITUTION.md.

## The shape of the code

- **Two repos.** This is the *site* (configuration, content, identity). The shared
  *engine* lives in the `journal/` submodule (layouts, includes, plugins, the
  git-history tooling). Site-specific assets are synced in from the engine at build
  time; don't hand-edit the synced copies — change the engine.
- **Real path is not URL path.** Content mounts on disk under `publish/` but serves
  under `/journal/`. That decoupling is config-driven (`publish` / `journal` keys in
  `_config.yml`); a small engine plugin does the remap. Don't reintroduce hardcoded
  paths.
- **History is the data model.** Per-paragraph git blame/history is generated into
  `_data/` and bound into pages at build time. The build runs flattened from the
  repo root.

## Working here

- **Follow the patterns already here.** This codebase was built deliberately, by
  hand, validated piece by piece, with **zero third-party vendors**. Prefer the
  idioms already present over reaching for a dependency; keep changes small and
  legible enough that the next operator can read them.
- **We're in the assisted phase now.** The earlier "await instructions" prohibition
  is retired — agent help is welcome. Earn the trust that prohibition was
  protecting: don't duplicate what the README, the wiki, VISION.md, or CONSTITUTION.md
  already say, and don't add weight the project didn't ask for. When something is
  deferred, record it in OPEN-QUESTIONS.md rather than threading a caveat through the
  vision — a solved item should drop away from that one file alone.

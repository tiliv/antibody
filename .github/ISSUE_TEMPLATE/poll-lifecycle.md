---
name: Poll lifecycle
about: Track one poll end-to-end through the pipeline. The checklist IS docs/PIPELINE.md.
title: "[poll] <pile>/<poll> (round <n>)"
labels: ["poll-lifecycle"]
---

<!--
This issue tracks a single poll through the pipeline documented in docs/PIPELINE.md.
Fill the identity block, then check each step as it completes. A step left unchecked with
a ┄ note is a known gap (cited to OPEN-QUESTIONS.md), not a forgotten task. ⚑ marks
owner-gated acts (secret / manual merge / IRL check) — see "Owner-gated acts" in PIPELINE.md.
-->

## Identity

- **pile:** `<id>`            <!-- e.g. cd04-q1 -->
- **poll:** `<slug>`          <!-- e.g. budget -->
- **scope:** `<scope>`        <!-- e.g. colorado -->
- **round:** `<n>`            <!-- e.g. 1 -->
- **type:** `open` | `multichoice`
- **pile repo:** `<owner>/<repo>`
- **canonical Issue:** #___   <!-- once opened in the Tell repo -->

## Checklist — the pipeline ([docs/PIPELINE.md](../../docs/PIPELINE.md))

- [ ] **0. Compose** the question in fewest-verbs form (Anecdote). _pre-pipeline_
- [ ] **1. Copy the data-pile template** ⚑ — used template; ran `setup` (`age` keypair, `PILE_AGE_IDENTITY` set, `pile.yml` filled). _needs `SETUP_TOKEN`_
- [ ] **2. Configure the question** — wrote `tell …/_data/constitutions/<pile>/<poll>.json`; pile entry in `pile.yml` `sources:`. _┄ §J one-gesture authoring is unbuilt_
- [ ] **3. Register the pile with the Tell** ⚑ — ran `handshake`; **merged** the PR on `tell …/_data/piles.yml`; pinned signer fingerprint by hand. _needs `TELL_PR_TOKEN` + IRL check; ┄ §B/§A validation_
- [ ] **4. Register the question + mint the QR** ⚑ — `open-poll` opened the canonical Issue; `qr` produced URL + PNG (token bound to pile/poll/round). _needs `TELL_QR_SECRET`; ┄ §J, §L (signed-QR trust roots/tiling)_
- [ ] **5. Answer-intake page** — confirmed `tell …/index.md` builds the prefilled link from QR params. _┄ §F QR expiry / pre-public pickup_
- [ ] **6. Answer submitted** — a `tell.submission/v1` reply posted (Issue or comment).
- [ ] **7. Tell seals into encrypted chunks** — ingress ran (`collect → authz → govern → deliver → finalize`); blocks on `feed/<scope>/<id>`. _┄ §K producer cron is off by default_
- [ ] **8. Pile pulls + verifies** — `ingest` + `verify` folded blocks into `feed/<source>` + `state/`. _┄ §K per-poll registry / delivery marker_
- [ ] **9. Tell retains/rotates** — govern reports kept; feed append-only; `prune-pile-history` cadence set. _┄ §F exposure window_
- [ ] **10. Owner decodes** ⚑ — `bin/decrypt` read the records; (if multi-source) each `feed/<source>` stream intact, no clobber. _needs `PILE_AGE_IDENTITY`_
- [ ] **11. Report / aggregate** _beyond the arc_ — _┄ §C Atlas pool aggregation/reporting-law_

## Proof of lifecycle (where this poll is right now)

<!-- Per docs/PIPELINE.md "Proof of lifecycle". State the current state and the file that proves it. -->

- **Current state:** Configured | Registered | Answerable | Live | Sealed | Disclosed
- **Proven by:** `<path to the artifact that proves the state>`

## Owner-gated acts still pending

<!-- List the ⚑ acts above that need the operator. These are the "ejected to the user's side" items. -->

-

# The poll pipeline, walked

This is the one place that follows a poll **literally** — from "someone stands up a workspace" to "the
owner decodes the answers" — naming the exact workflow, script, or file that performs each step. It is
**doc-only**: it composes pieces that already exist, it does not add behavior.

[`VISION.md`](../VISION.md) says *why* the constellation is shaped this way; the per-repo
`CONSTITUTION.md`/`CONTRACT.md` files say *what each part attests and how it talks*;
[`OPEN-QUESTIONS.md`](../OPEN-QUESTIONS.md) tracks *what is not yet wired*. This file is the
**connective tissue** between them: the operational order, with the gaps drawn as dotted lines that cite
the open question they belong to.

## How to read it

- **─ solid line** — wired and testable today. The named artifact does the step.
- **┄ dotted line** — a gap: either an **operator chore** (a hand-done act nothing composes yet) or
  **unbuilt** (referenced but not present). Every dotted line cites a section of
  [`OPEN-QUESTIONS.md`](../OPEN-QUESTIONS.md) and names the **bridge** that would close it.
- **⚑ owner-gated** — needs a secret, a manual merge, or an out-of-band (IRL) check. These are the acts
  that *must* sit on the operator's side; they are summarized in one place under
  [Owner-gated acts](#owner-gated-acts-the-operators-side).

The running example is the reference poll **`cd04-q1` / `budget`** in scope `colorado`, the same one the
repos already seed (`tell.anecdote.channel/_data/constitutions/cd04-q1/budget.json`). Substitute your own
`<pile>` / `<poll>` / `<scope>` / `<round>` throughout.

A note on roles: in a **civic-node** the one operator wears every hat — Atlas, Tell, *and* pile owner.
So where this doc says "the pile owner decodes," in a self-hosted node that is the **same person** who
runs the Tell. The boundary still matters (decryption is a pile-owner capability, never a Tell one — the
Tell holds no key that reads a digest), so the steps keep the hats distinct even when one human wears
both.

---

## The lifecycle at a glance

```
 0  compose ─┐
             ▼
 1  copy data-pile template ⚑ ─────────────────────────────┐  (pile exists, can be written to)
 2  configure the question(s) ┄J ──────────────┐           │
 3  register the pile with the Tell ⚑ ┄B ──────┤           │
 4  register the question + mint QR ⚑ ┄J ┄L ───┤           │
             ▼                                  │           │
 5  scan QR → answer-intake page ┄F ────────────┘           │
 6  answer posted to the GitHub API ────────────────────────┤
             ▼                                              │
 7  Tell seals respondent data into encrypted chunks ┄K ────┤  feed/<scope>/<id>
 8  pile pulls + verifies (knows which Tell carries it) ┄K ─┤  feed/<source> + state/
 9  Tell retains/rotates the group's data ┄F ───────────────┤
             ▼                                              │
10  owner decodes; second stream never clobbers ─────────────┘
             ▼
11  (beyond the arc) report / aggregate ┄C
```

For the wire-level diagrams this elaborates, see
[`tell …/CONTRACT.md`](https://github.com/FCCN-ANTIBODY/tell.anecdote.channel/blob/main/CONTRACT.md),
[`data-pile/README.md`](https://github.com/FCCN-ANTIBODY/data-pile/blob/main/README.md), and the four
states in
[`data-pile …/docs/lifecycle.md`](https://github.com/FCCN-ANTIBODY/data-pile/blob/main/docs/lifecycle.md).
This doc does not redraw them; it threads them in order.

---

## Step 0 — Compose the question  · ─

**What.** Before any repo is touched, the question is shaped into its fewest-verbs, simplest-noun form —
the atomic label every Atlas already stands ready to answer in.

**Artifact.** The **Anecdote** first-contact appliance —
[`anecdote.channel`](https://github.com/FCCN-ANTIBODY/anecdote.channel) `reducer/` + `composer/`. It is
the constitutionless on-ramp; it helps say the thing once and gets out of the way.

This step is *pre-pipeline* — it produces the text you will configure in step 2. Anecdote's own supply
model (how the model is served and cold-verified) is open, **┄ §O**.

---

## Step 1 — Copy the data-pile template  · ─ ⚑

**What.** The technical goal of the whole exercise: get a **durable, encrypted tank** of your own. Today
"your account" means a GitHub repo, but the pile is platform-agnostic by design — the tank is the point,
not the host.

**Artifact.**
[`data-pile`](https://github.com/FCCN-ANTIBODY/data-pile) is a **template repo**. *Use this template* to
create your own, then run the **`setup`** workflow
([`data-pile …/.github/workflows/setup.yml`](https://github.com/FCCN-ANTIBODY/data-pile/blob/main/.github/workflows/setup.yml)):
it generates an `age` keypair, commits the **recipient** to `keys/pile.age.pub`, stores the private half
as the repo secret `PILE_AGE_IDENTITY` (never committed), and fills `pile.yml` (`id`, `scope`,
`age_recipient`, `repo_url`).

**⚑ Owner-gated.** `setup.yml` needs a `SETUP_TOKEN` (a PAT that can write secrets + contents — the
default `GITHUB_TOKEN` cannot write secrets). The `age` private identity is created on the operator's
side and never leaves it.

> The seed values an operator must replace to go live — the `age1PLACEHOLDER…` recipient, the
> `SHA256:PLACEHOLDER…` signer — are **not** wired defaults; they are listed as such in
> **┄ §I (operator placeholders)**.

---

## Step 2 — Configure the question(s) the pile will accept  · ─ (multi-source) · ┄ §J (authoring)

**What.** A pile is a **bottle of possibly-mixed items**: more than one unrelated question can flow into
the same pile, each decodable and traceable as its own record. So configuring a question has two parts —
defining the question, and naming the pile it may flow into.

**Artifacts.**

- **The question lives on the Tell**, not in the pile, as a per-poll **constitution**:
  `tell.anecdote.channel/_data/constitutions/<pile>/<poll>.json` (the reference is
  [`…/cd04-q1/budget.json`](https://github.com/FCCN-ANTIBODY/tell.anecdote.channel/blob/main/_data/constitutions/cd04-q1/budget.json)).
  It carries the text, options, guidance, type (`open` | `multichoice`), and a `lifecycle`
  (`round`, `opens_at`, `closes_at`, `one_per`). This is what `bin/govern` later judges against, and what
  `/polls.json` publishes as transparency. See
  [`tell …/docs/per-poll-registry.md`](https://github.com/FCCN-ANTIBODY/tell.anecdote.channel/blob/main/docs/per-poll-registry.md).
- **The pile declares which producers it pulls from**: `data-pile/pile.yml` `sources:` is a **list**. The
  default `tell` source is one entry; multiple producers are multiple entries, each with its own
  `branch` and `signer`. This is the mechanism that keeps a mixed bottle decodable — see step 10.

**┄ Gap — no one-gesture authoring (§J).** Going live today is *three hand-done acts in three places*:
write the constitution JSON, register the pile (step 3), mint the QR (step 4). Nothing composes them, so
"make a question" is an operator chore rather than a single gesture.
**Bridge:** a `bin/poll` (or guided action) that takes question + options + guidance and emits all three
artifacts — one input, three outputs. Tracked in **§J**.

---

## Step 3 — Register the pile with its (self-hosted) Tell  · ─ ⚑ · ┄ §B / §A (validation)

**What.** The pile asks a Tell to front it. Registration is **PR-as-consent**: the pile proposes itself,
the Tell merges by hand. (Tell→Atlas and Atlas→Atlas registration are their own flows and out of scope
here — see [`tell …/README.md`](https://github.com/FCCN-ANTIBODY/tell.anecdote.channel/blob/main/README.md)
"The constellation place" and the Atlas
[`README.md`](https://github.com/FCCN-ANTIBODY/atlas.anecdote.channel/blob/main/README.md) "Register a
Tell".)

**Artifact.** The **`handshake`** workflow
([`data-pile …/.github/workflows/handshake.yml`](https://github.com/FCCN-ANTIBODY/data-pile/blob/main/.github/workflows/handshake.yml))
reads `pile.yml` and opens a PR on the Tell's `_data/piles.yml` adding an entry (`id`, `scope`,
`feed: feed/<scope>/<id>`, `age_recipient`). After the merge, the operator pins the Tell's delivery-signer
fingerprint into `pile.yml` `sources[].signer` and `keys/tell.signers` **by hand**, confirming it
out-of-band (`data-pile/keys/README.md`). The Tell then knows its registrants from `_data/piles.yml`,
which `bin/authz` and `bin/rollup` read.

**⚑ Owner-gated.** Opening the PR needs a `TELL_PR_TOKEN` (or the workflow prints the entry to paste by
hand); **merging it is a human act** — that merge *is* the consent. Pinning the signer fingerprint is an
IRL trust step, never automated.

**┄ Gap — registration is not validated (§B), and there is no automated judge (§A).** Nothing yet checks
that the PR's branch/identity matches the entry or that a signature matches the signer; the merge is pure
human judgment. **Bridge:** the *summonable judge* (§A) plus branch/signature validation and a unified
`register` idiom (§B).

---

## Step 4 — Register the question to the Tell + generate a QR  · ─ ⚑ · ┄ §J / §L

**What.** A question becomes *answerable* when the Tell can mint an authorized entry point for it. On
`tell.anecdote.channel` this is implicit in how a poll is configured (step 2) plus minting its QR.

**Artifacts.**

- **Open the canonical Issue (comment-mode):**
  [`open-poll.yml`](https://github.com/FCCN-ANTIBODY/tell.anecdote.channel/blob/main/.github/workflows/open-poll.yml)
  → `bin/open-poll` opens one standing GitHub Issue per poll, labeled `tell-canonical,poll:…,round:…`,
  carrying a recognized-and-ignored anchor block. Answers arrive as **comments** on it (the scalable
  shape, **§F**). Returns the issue number for the QR.
- **Mint the QR:**
  [`qr.yml`](https://github.com/FCCN-ANTIBODY/tell.anecdote.channel/blob/main/.github/workflows/qr.yml)
  → `bin/qr` emits a landing URL + PNG. The QR carries the poll display fields (`q`, `opts`, `guidance`)
  and a token `tok = HMAC(k_pile, "tok:<pile>:<poll>:<round>")`, where `k_pile` derives from
  `TELL_QR_SECRET`. Same poll on a different pile → different `k_pile` → **different token**, which is how
  two questions headed to the same pile (or the same question on two piles) stay unique. Bumping `round`
  expires outstanding QRs.

**⚑ Owner-gated.** `bin/qr` needs `TELL_QR_SECRET`. An optional **signed** QR (`bin/qr --signkey`) also
needs the Tell's delivery signer.

**┄ Gaps.**
- **§J — authoring.** Same chore as step 2: minting is a separate manual act, uncomposed.
- **§L — signed self-contained QR provenance.** The `tok` is *symmetric* — only the minting Tell can
  verify it, so it authorizes a reply into *this* Tell's mailbox but proves nothing about origin to a
  registry-less recipient. Signing the payload (slices 1–2 are **built**: `bin/qr --signkey`,
  verified by `bin/authz` under namespace `tell-poll`) gives anyone-verifiable origin; the **trust-roots
  generalization and matrix tiling are unbuilt** (slices 3–4). See **§L** and
  [`tell …/docs/qr-provenance.md`](https://github.com/FCCN-ANTIBODY/tell.anecdote.channel/blob/main/docs/qr-provenance.md).

---

## Step 5 — Scan the QR → the answer-intake page  · ─ · ┄ §F (expiry / pickup)

**What.** Anyone scans the QR and lands back on `tell.anecdote.channel` ready to answer. Nothing phones
home: the page just builds a prefilled GitHub action from the QR's own params.

**Artifact.**
[`tell …/index.md`](https://github.com/FCCN-ANTIBODY/tell.anecdote.channel/blob/main/index.md) reads
`pile`, `poll`, `round`, `tok`, `type`, `q`, `opts`, `guidance`, `mode`, `canonical`, (`sig`, `kid` if
signed) and constructs a prefilled **`issues/new`** link (or a comment link on the canonical Issue when
`mode=comment`).

**┄ Gap — QR expiry / pre-public pickup (§F).** The HMAC token has no intrinsic expiry (it relies on a
`round` bump), and Phase-0 intake sits in *public* Issues for an exposure window. Narrowing that window
(pre-public judging, direct-transfer collector, a per-poll open/close) is **§F**.

---

## Step 6 — The answer is submitted to the GitHub API  · ─

**What.** The respondent posts. The Issue (or comment) body carries a fenced `tell` block
(`tell.submission/v1`) with `pile`, `poll`, `round`, `type`, `tok`, `answer`, `ts`, and optional
`nonce` / `run` / `anecdote` / `qr`.

**Artifact.** Plain GitHub Issues/comments — the public mailbox. The optional `anecdote` payload is the
egress side of [`anecdote.channel`](https://github.com/FCCN-ANTIBODY/anecdote.channel)
(`composer/egress-github`). Submission shape:
[`tell …/docs/issue-ingress.md`](https://github.com/FCCN-ANTIBODY/tell.anecdote.channel/blob/main/docs/issue-ingress.md).

---

## Step 7 — The Tell seals respondent data into encrypted chunks  · ─ (spine) · ┄ §K (cadence)

**What.** The Tell's tooling turns the public answers into **encrypted chunks** that only the pile can
read, and publishes them on the Tell's own domain for the pile to pull. This is the "workflow tooling
provided through Tell actions" the pile accumulates from.

**Artifact.** The **ingress** loop
([`ingest-submissions.yml`](https://github.com/FCCN-ANTIBODY/tell.anecdote.channel/blob/main/.github/workflows/ingest-submissions.yml)
→ the `ingress` composite action):

1. `bin/collect-submissions` reads Issues/comments, extracts the `tell` block, stages each.
2. `bin/authz` re-derives `k_pile` and constant-time-compares `tok`; confirms the pile is in
   `_data/piles.yml`; verifies the QR signature if present (`TELL_REQUIRE_SIG` to require it).
3. `bin/govern` looks up the per-poll constitution and attaches a verdict
   (`accept` / `reject` / `needs-judgment` / `held`) + `constitution_sha`; publishes a transparency log
   (`reports/govern-<stamp>.json`).
4. `bin/deliver` (via `bin/rollup`) builds the plaintext digest, then **age-encrypts each block under a
   one-way ratchet key `K_seq`**, hash-links it, and **signs the manifest head** (`ssh-keygen -Y sign`,
   namespace `data-pile`). It commits to the Tell's **`feed/<scope>/<id>`** branch.
5. `bin/finalize-submissions` labels/closes the Issue (or reacts on the comment).

The chunks are encrypted to the pile's `age_recipient`, so publishing them on a public branch leaks
nothing. The wire spec is
[`tell …/CONTRACT.md`](https://github.com/FCCN-ANTIBODY/tell.anecdote.channel/blob/main/CONTRACT.md).

**┄ Gap — the producer cron is OFF (§K).** The pile's `ingest` runs hourly, but the Tell's ingress is
`workflow_dispatch`-only (its `schedule:`/`issues:` triggers are commented for template safety), so
unattended, "nothing is ever produced for the pile to find." **Bridge:** turn on a coordinated
deliver schedule and emit a cheap **delivery marker** (feed-head timestamp / round counter) the pile can
poll. Tracked in **§K**.

---

## Step 8 — The pile pulls, verifies, and knows which Tell carries its poll  · ─ · ┄ §K (which-poll)

**What.** The pile checks each of its registered Tells and folds in any new chunks. A pile "may not
remember for certain which Tell has its poll" without consulting what the Tell *posts* about the polls it
knows.

**Artifacts.**

- **Pull + verify:**
  [`data-pile …/.github/workflows/ingest.yml`](https://github.com/FCCN-ANTIBODY/data-pile/blob/main/.github/workflows/ingest.yml)
  (`cron: "23 * * * *"`) runs `bin/ingest` per source — fetches `manifest.json` + blocks + seed from the
  Tell gateway `url`, runs `bin/verify` (signature against the pinned signer, hash chain, ratchet
  commitments), and persists to the pile's own `feed/<source>` branch + `state/<source>/`.
- **What the Tell posts about its polls:** `/polls.json` (governed-poll transparency) and `/piles.json`
  (fronted piles), rendered from the Tell's `_data`. These are how the pile (and anyone) enumerates which
  poll a Tell carries — even when two distinct polls are headed to the same pile.

**┄ Gap — no per-poll state registry / delivery-driven ingest (§K, ties to §F).** The two crons are
independent offsets with no shared window, no "this round is sealed, go look," no per-poll open/close. The
pile polls on a blind timer rather than *because* a delivery happened. **Bridge:** the per-poll registry
**§F** keeps deferring is the shared home for an `exp`/round/window both sides read.

---

## Step 9 — The Tell retains/rotates the group's data  · ─ · ┄ §F (exposure window)

**What.** The Tell disposes of data by *electing to keep it all* for the whole Tell group — trusting the
pile that fetches it to be the durable system of record, while the Tell keeps a rotated copy.

**Artifacts.**

- **Staged submissions** (`.submissions/…`) are intermediate — cleared at the next collect.
- **Govern reports** (`reports/govern-*.json`) are kept, tied to issue numbers as an evidence locker.
- **Feed branches** are append-only;
  [`prune-pile-history.yml`](https://github.com/FCCN-ANTIBODY/tell.anecdote.channel/blob/main/.github/workflows/prune-pile-history.yml)
  archives intact history to `archive/<branch>@<date>` monthly and resets the live ref to a fresh
  snapshot (via `commit-tree`, preserving signatures) — nothing is thrown away, only rotated.

**┄ Gap — narrowing the exposure window (§F).** The guiding direction (ROADMAP Phase 0→1) is to shrink the
time plaintext answers sit public in Issues — pre-public judging, seal-at-pickup. Tracked in **§F**.

---

## Step 10 — The owner decodes; a second stream never clobbers  · ─

**What.** The owner reads what the tank holds — and if a *second* Tell had been registered all along,
both streams ingest side-by-side without either clobbering the other.

**Artifacts.**

- **Decode:** `data-pile/bin/decrypt` (`age`-decrypt a block/range; needs `PILE_AGE_IDENTITY`). Each
  record arrives carrying its `governed` verdict + `constitution_sha`; the owner may re-judge at the
  boundary (`data-pile/README.md` "Judging happens at your Tell, not here").
- **No clobber:** `pile.yml` `sources:` is a list, and `bin/ingest` / `bin/verify` process **each source
  on its own `feed/<source>` branch**. The pile is the *union of the raw*, each segment carrying its own
  Tell's signature — being on more than one Tell is a sharing posture, not a different pile. This is
  exactly the multi-Tell model in
  [`data-pile …/docs/lifecycle.md`](https://github.com/FCCN-ANTIBODY/data-pile/blob/main/docs/lifecycle.md)
  "Multiple Tells, one pile."

Decode is a **pile-owner** capability; the Tell never holds a key that reads a digest. In a civic-node the
operator is both, but the boundary is real — which is why "civic-node decodes" means "the operator, acting
as pile owner, runs `bin/decrypt`."

---

## Step 11 — (Beyond the arc) report / aggregate  · ┄ §C

The poll's arc ends at a decoded, verifiable tank. Turning many piles' figures into a public
constituency report is a **separate** layer: the **Atlas pool** aggregates de-identified, membership-tagged
Tell summaries and applies small-N suppression; the pile is the *second-order raw proof* that backs those
figures (`bin/prove` discloses a forward-only checkpoint). The aggregation/reporting-law/standing
mechanism is **┄ §C**; the locus rationale is
[`data-pile …/docs/lifecycle.md`](https://github.com/FCCN-ANTIBODY/data-pile/blob/main/docs/lifecycle.md)
"The pile's role in reporting."

---

## Owner-gated acts (the operator's side)

The acts that cannot be automated away — ejected to the operator deliberately. A poll is not "live" until
these are done:

| Step | Act | Why it's owner-gated |
| --- | --- | --- |
| 1 | Run `setup` with `SETUP_TOKEN`; hold `PILE_AGE_IDENTITY` | Writing secrets needs a PAT; the private key must never leave the owner. |
| 3 | Provide `TELL_PR_TOKEN`; **merge** the handshake PR; pin the signer fingerprint | The merge *is* consent (§A/§B); fingerprint trust is IRL. |
| 4 | Provide `TELL_QR_SECRET` (and signer for a signed QR) | Token minting is the Tell's own secret capability. |
| 7 | Decide + enable the deliver cadence (§K) | The producer cron ships off for template safety. |
| 10 | Provide `PILE_AGE_IDENTITY` to decode | Only the owner can read the tank. |

---

## Proof of lifecycle — read a poll's state at any moment

Because each step leaves a durable artifact, a poll's current state is **checkable**, not asserted. Map
the four pile states (`data-pile …/docs/lifecycle.md`) to the file that proves them:

| State | What proves it | Where |
| --- | --- | --- |
| **Configured** | the constitution exists | `tell …/_data/constitutions/<pile>/<poll>.json`; `/polls.json` |
| **Registered** | the pile is listed | `tell …/_data/piles.yml`; pile's `pile.yml` `sources[].signer` pinned |
| **Answerable** | a canonical Issue + minted QR | the `tell-canonical` Issue; the QR PNG artifact |
| **Live (mailbox)** | verified blocks are accumulating | pile `feed/<source>` branch + `state/<source>/manifest.json` |
| **Sealed (bottle)** | the round closed; blocks self-verify | `lifecycle.closes_at` reached; Tell-signed manifest |
| **Disclosed (proven)** | a checkpoint is published | pile `reports/` (`bin/prove` output) |

This table is the seed for the deferred **data-pile dashboard** — a Jekyll page on the pile reading
`pile.yml` + `state/*/manifest.json` + `reports/` to render exactly these states. data-pile is not a
Jekyll site today, so that is its own round; this section is written to make it a small step rather than a
design problem.

---

## Following it

The companion to this doc is the **poll-lifecycle issue template**
([`.github/ISSUE_TEMPLATE/poll-lifecycle.md`](../.github/ISSUE_TEMPLATE/poll-lifecycle.md)): open one
issue per poll and its checklist *is* this pipeline, one checkbox per step, so a poll's progress lives in
the open. That is how we "follow it ourselves" — and the filled issue, alongside the proof-of-lifecycle
table above, is the end-to-end record that any observer can re-check.

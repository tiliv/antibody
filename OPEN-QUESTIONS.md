# Open questions (the constellation)

Deliberately-deferred design problems for the whole `*.anecdote.channel` constellation —
Atlas, Tell, and the data-pile — gathered here, on the workspace that operates them. Set
aside, not forgotten. Each notes what it **blocks** so we don't mistake "not yet decided" for
"covered," and carries a **Tier** tag (atlas / tell / pile / node) so you can see where it
lands even though the per-repo lists are gone.

This is the *only* open-questions list. `VISION.md` and each repo's `CONSTITUTION` / `CONTRACT`
state the design as intent; the deferred half lives here, so a solved item drops away from this
file alone without an agent rewriting vision prose around it. Items are grouped by the
dependency they share, not by repo — several are one question seen from different tiers, and
they are collapsed accordingly. The judge (**A**) is load-bearing; much of the rest waits on it.

Sections **A–I** are protocol-level deferrals from shaking each service out in isolation; **J–K** were
surfaced by running the **end-to-end poll use case** across all three at once, where the *product
surface* (authoring, answering, the batch rhythm) lags the cryptographic spine that is otherwise built
and tested. Some of the latter were left open on purpose; with the whole flow in view they are now
worth closing rather than deferring.

---

## A. The summonable judge

**Tier: atlas (gating) · tell (pile junction) · pile (elective).** The single largest deferral;
**B**, **C**, **D**, and **F** all touch it.

A signed registration proves **ownership** (*who* is registering) but never **fitness** (*what* the
registrant's constitution commits to, and whether it coheres with what the parent attests). An
ownership signature vouches for identity; it cannot vouch for content. That gap is invisible while
`register` is narrow — it can only append a node's own self-description — but a **registry-agnostic
`register`** (**B**) would let a node make a parent commit arbitrary buckets backed by arbitrary
logic on the strength of an ownership signature alone. The widening is safe **only when a judgement
is rendered**; unattended, it steals base on consent.

So a registration has **three consent intakes**, and an operator chooses among them *per action*:

- **PR** — a human attests by merging. Registration already leans on this: the human in the merge
  loop *is* a judgement, by design.
- **judge** — an agent reads the registrant's live constitution and renders a fitness verdict. The
  pattern already exists as `bin/match`'s `ATLAS_MATCH_CMD` seam — the first summonable judge, today
  only in the matchmaker, not the registration path. (The workspace exposes it as
  `vars.ATLAS_MATCH_CMD`; unset, the honest default accepts nothing.)
- **unattended** — a parent auto-signs all buckets with no per-item judgement. Cheapest to operate,
  and the **largest runtime judgement burden to make safe**.

**The judge is a junction, not a hard gate.** It has an *available* state and a *not-available* state
(too busy, rate-limited, budget spent, a manual switch, or the judge's own uncertainty). The
not-available state is exactly where a human steps in — the PR's human-merge intake. So the
registration judge is naturally **a PR hook that can stop _async_, awaiting a human**:
judge-when-it-can, human-when-it-can't — the two intakes unified rather than competing. The same
judge, used in `composite`, is reusable for any constitution-comparison work elsewhere.

- **Blocks:** safely generalizing `register` (**B** needs this gate); a listing that isn't purely
  "a human merged it"; reusing one judge idiom everywhere constitutions are compared; weighing each
  bill line's constitutional fit (**D**).
- **Constraint (load-bearing):** binding a registration *parent* to a **scaling** judgement workload
  is risky even batched — a large backlog grinds the parent to a halt, and *to users that is
  indistinguishable from being down entirely*. Actions must keep operating on **fixed buckets with
  narrow workload assurances**: run the judge always on some workloads, route others to human mode,
  but never hand the judge an unbounded queue.
- **Open (the judge action's I/O + authorization):**
  - how a judge action *receives* {the registrant's live constitution, the registry/parent context}
    and *emits* a verdict that gates a merge — including the async "awaiting a human" verdict — and
    how that verdict is recorded (a committed verdict, a transparency report, a PR label?);
  - if a parent calls a shared `FCCN-ANTIBODY/judge` action, how the calling node **identifies
    itself** and **proves the request is authorized**. Atlas's handle for "this is a legitimate
    request" is its `needs/` board — but that is Atlas-specific and does not generalize down a tier:
    a **Tell has no `needs/` board**, so the pile→Tell junction's authorization is its own unsettled
    question. The authorization model for a shared judge is unsettled.
- **The same junction, one tier down (Tier: tell).** A pile registers with a Tell by a signed-PR
  handshake (`handshake.yml` → `_data/piles.yml`), accepted by a human merge; the Tell — the parent
  at this tier — renders no *fitness* judgement on a registering pile's constitution before fronting
  it. The live trigger one tier down is gating `bin/govern`'s delegated judging behind the same
  available/not-available junction rather than assuming the judge is always there.
- **Elective (opt-in) judgement, and who pays for it (Tier: pile).** Beyond *gating* registration,
  the same judge can be **summoned electively** by a node that wants its own boundary governed —
  judgement as a service it opts into, not a checkpoint imposed on it. The pile is the spender most
  likely to opt in: it may want to **re-judge by hand** after `bin/decrypt` (every record already
  arrives carrying its `governed` verdict and `constitution_sha`, but there is no pile-side tool for
  systematic override). The pile-side governor in **closed
  [data-pile #6](https://github.com/FCCN-ANTIBODY/data-pile/pull/6)** — `bin/accept` + `questions/`
  guidance + a signed acceptance ledger — is the historical record of wanting exactly this; it was set
  aside as unsafe **by default** (it re-relocates judging to the pile and re-severs the pile↔Atlas
  path), so it can only ever return as an *optional* action. Open: whether cost/authority is sourced
  from the requester's **own** judge credentials (bring your own budget) or a **timeshare** on the
  Tell's/Atlas's capacity (the parent lends cycles under its own quota, against the fixed-bucket
  constraint above). Same authorization gap, seen from the spender's side.
- **The judge's likely form is a Cloudflare worker, and its debut job is the constituency solve.** The
  judge is the one piece that genuinely wants to be a live **moving part** (most of the constellation
  deliberately is not) — a request-time gate, not a static artifact. The first thing it most needs to
  decide is **constituency membership at the moment of a request**: is this requester inside the bounds
  right now? — proof-of-access in the spirit of "go to your email to prove you hold it." That is the
  natural **debut workload of a future `FCCN-ANTIBODY/judge` repo** (the constituency solve, now grouped
  where it belongs rather than smeared across Tell/Atlas). **Open (scaling):** what a judge **worker**'s
  capacity/cost envelope is under real poll traffic — it inherits the fixed-bucket / available-vs-not
  junction above, but as a hot path (gating token *use*), not a PR hook. It is explicitly **not** an edge
  (a Cloudflare cache rule) *deciding* anything — the worker is a summoned judgement, the edge stays dumb.

---

## B. Registration validation and idiom unification

**Tier: atlas (validation) · tell (canonical idiom) · pile (descendent forms).** Coupled to **A** —
do not ship the generalized seam without the judge.

The constellation registers by **PR-as-consent** at three tiers: a pile registers with a Tell
(`handshake.yml` → `_data/piles.yml`); a need registers with an Atlas (`bin/need` + `need.yml` →
`_data/needs.yml`); and **a Tell registers with an Atlas** (`bin/register` + `register-atlas.yml` →
`_data/tells.yml`). The last is the **cleanest** version and the canonical home of the paradigm — it
also **signs the registrant's ownership** (`tell/<scope>/<id>` branch, signed commit, `signer`
anchor) and ships as the `register` composite action.

Two things are still open:

- **Validation of the consent PR (Tier: atlas).** Acceptance is **entirely manual** — a human merges.
  Nothing checks that the branch name matches the entry's `id`/`scope`, or that the commit's signature
  matches the `signer` fingerprint the entry claims.
  - **Blocks:** trustless listing; catching a registration whose branch/signature doesn't back its
    ownership claim before merge.
  - **Sketch (unbuilt):** a PR check that (a) parses the appended entry, (b) confirms the head branch
    is `tell/<scope>/<id>` for that entry, and (c) verifies the head commit is signed by the key whose
    fingerprint equals `signer`. Deferred with the Phase-B tooling; needs `bin/register` landed first
    to produce PRs in the exact shape the check enforces. This validates *ownership* (who registered),
    **not** *fitness* (whether the registrant coheres with the parent's attestations) — fitness is the
    judge, **A**. The same check must later also cover `atlas/<scope>/<id>` peer PRs and
    `request/<scope>/<id>` bill branches (**D**).
- **Idiom unification (Tier: tell / pile).** The data-pile's two descendent forms (`handshake.yml`;
  `bin/need` + `need.yml`) still re-implement the PR-append gesture inline instead of calling a shared
  `register`.
  - **Blocks:** nothing functional — all three flows work; this is idiom debt.
  - **Deferred because:** the descendents register *differently-shaped* entries into *different*
    registries (`piles.yml`: `id`/`scope`/`feed`/`age_recipient`; `needs.yml`:
    `id`/`asker_repo`/`scope`/`topic`/`terms`). Folding them onto `register` needs a
    **registry-agnostic entry seam** (caller supplies target registry + branch + a pre-built entry;
    `register` owns only the signed-PR mechanics) — a real refactor of working PR-opening code that
    needs `gh` + live repos to exercise. `bin/register`'s `{entry|branch|pr}` split is the shape they
    would adopt. **Coupled to the judge (A) — do not ship the seam without it:** a registry-agnostic
    `register` widens what one signed PR can carry from "list *me*" (identity) to "commit *this bucket,
    backed by this logic*" (content). The generalization and the judge are one decision, not two.

---

## C. Aggregation, reporting-law, and standing

**Tier: atlas (aggregator + standing) · tell (the report surface) · node (where rollups publish).**
Circular by nature: each tier defers to the other until a real second Tell publishes reports.

- **The aggregator itself is not built (Tier: atlas).** Atlas's `CONSTITUTION` attests **affirmative
  escalation** — every report a listed Tell publishes is rolled into **all** the constituency
  aggregations it belongs to — and `CONTRACT` pins the contract (a Tell describes its `reports/govern-…`;
  Atlas requires the shape and aggregates it). The code that pulls each listed Tell's reports and rolls
  them up on a schedule does not exist.
  - **Blocks:** constituency/jurisdiction reports; the standing tally below; the whole point of being a
    directory that *aggregates*, not just lists.
  - **Sketch (unbuilt):** a scheduled job (cf. `bin/match` + `match.yml`) that reads `_data/tells.yml`,
    fetches each Tell's described `reports` path, validates the shape its CONSTITUTION promised, and
    emits a coarse constituency rollup. Lands when a real listed Tell publishes reports to aggregate.
- **The field-level report contract is open (Tier: tell).** The **registration** half is written: a
  Tell lists itself by signed PR, its entry carries a `reports` pointer, and Atlas attests it requires
  that description. Still open is the **field-level** report contract — the exact `reports/govern-…`
  fields and cadence an Atlas validates — and the aggregator that consumes it (same item, atlas side).
  The Tell-side declaration (`CONSTITUTION` → "I describe the transparency reports I publish") is the
  surface that contract validates.
  - **Specified direction:** [`tell.anecdote.channel/docs/reporting.md`](https://github.com/FCCN-ANTIBODY/tell.anecdote.channel/blob/main/docs/reporting.md)
    (after the reporting-locus rethink, `tell.anecdote.channel#27`). The aggregate belongs **here, at the
    Atlas pool** — not at each Tell. A standalone Tell publishes nothing; *only on joining an Atlas* does
    it deliver de-identified, membership-tagged summaries (`tell.poll.summary/v1`: per-poll `count`,
    coarse option tallies, verdict counts, topic; never answer text or `asker`) **promoted into the
    signed manifest head** like the existing `tell.voucher.summary/v1`. **Small-N suppression must happen
    at this pool**, where N is large across many Tells — at a 2-person Tell it either blanks or
    re-identifies. Consequences for this §: "compulsory" means *compulsory-on-joining*, so this tier's
    deadlock eases (the Tell-side input is concrete the moment a Tell lists); the field-level contract is
    that delivery; the figures are **manifest-committed + provable** (recomputable from public manifests,
    backed by the pile's `bin/prove`). The per-answer govern log is **re-homed** (sealed evidence locker,
    single-record justified-query disclosure, Issue-author identity), not a public surface. **Forward
    seeds** (not specified here): the device-side vouch (signed district membership computed against
    Atlas-published boundary polygons, geography never leaving the device); Atlas as a **registry of
    bounded concepts** (label + boundary polygon + authority attestation); and the suspicion that
    **label-authority and report-credibility are one attestation mechanism** — the same "open line, weight
    accumulates" problem the standing item below raises.
- **The standing mechanism is unwritten (Tier: atlas).** Atlas attests it keeps an **open line** —
  a report gains weight and credibility as it accumulates — but the *concrete mechanism* that
  materializes "weight" is unwritten.
  - **Blocks:** any UI or signal showing a constituency's standing rising over time; a machine-readable
    "credibility" signal a downstream aggregator could rank on.
  - **Sketch (unbuilt):** a per-constituency tally derived from the reports Atlas aggregates (how long a
    line has stood, how much it has gathered), surfaced in `/tells.json` or a new `/standing.json` —
    carried *without* raw per-respondent counts ("coarse standing"). Input is the Tell transparency
    stream, which isn't aggregated yet (first bullet).
- **Where this node publishes its rollups (Tier: node).** This workspace's `atlas.yml` names a
  `reports: reports/aggregate-*` pointer — the surface a peer would consume — but the aggregator that
  fills it is the same deferred rollup above. The pointer is ready; the producer waits.

---

## D. Cross-Atlas peering: the bill

**Tier: atlas (the protocol) · node (the cadence).** The handshake is built; the live half is
deferred. Coupled to **A** (the judge weighs each bill line) and **B** (validation must cover peer +
bill branches).

`CONTRACT` → "Peering with another Atlas" carries the full design, and the **scaffold** is landed: the
need shape gains a `constitution:` pointer; `_data/requests.yml` is the empty-on-`main` inbound queue;
`bin/bill` assembles a bounded, needs-shaped bill (offline, pure); and `request-search` / `answer-bills`
are composite actions whose **offline halves run** (assemble the bill; run `bin/match` with
`ATLAS_NEEDS=<bill>` + `ATLAS_MATCH_CMD` over this Atlas's own candidates — internal search and a peer's
bill are one matcher, two triggers, honest default accepts nothing). The workspace drives both as
**dispatch-only** workflows (`bill.yml`, `answer-bills.yml`) on a cadence it sets.

- **The live cross-Atlas half is unbuilt:** (a) `request-search` actually pushing the
  `request/<scope>/<id>` bill branch to the peer and opening the examine-not-merge PR (mirroring
  `bin/register-atlas`), **signed** and **gated** to a peer whose `signer` is already in
  `_data/atlases.yml`; (b) `answer-bills` reading those inbound `request/**` branches (not just an
  explicit `bill` input) and (c) delivering the accepted matches as **one bulk signed PR back** to the
  asking peer, modifying the line for the address it knows (invitation not delivery — one hop, never
  routing into the ultimate asker).
- **Blocks:** cross-Atlas discovery in practice — a friend's bill actually reaching a peer and an
  answer coming back; the half of the peering deal that makes a peer entry worth more than a link.
- **Deferred because:** there is **no second live Atlas** to handshake with yet, so the path can't be
  exercised end to end; and it is coupled to the registration-validation check (**B**, which must also
  cover `atlas/<scope>/<id>` peer PRs and `request/<scope>/<id>` bill branches) and the summonable
  judge (**A**, the `ATLAS_MATCH_CMD` seam that weighs each bill line's constitutional fit — nearly
  necessary once a bill drags in a constitution per line). Wire it when a real peer exists and A/B land.
- **No eviction, by construction:** the bill lives only on a replace-each-cycle branch over an
  empty-on-`main` queue, so the receiver never tracks or evicts a peer's asks — an ask persists only by
  the asker **re-including** it (eviction-by-re-inclusion), spending part of its bounded block size.
- **Bounded to the first hop:** no transitive federation — a peer's peers are not yours.
- **Asker-side bill governance (Tier: atlas).** Eviction-by-re-inclusion makes the **asker side** the
  real point of inspection: *which* needs go into a bill, in what priority, and how the block is sized
  against a peer's capacity to weigh it. `bin/bill` today does the floor — first `--max` needs in file
  order.
  - **Blocks:** a bill that reflects intent rather than file order; fairness across an asker's own needs
    over successive cycles; sizing the block to the friend's judge budget rather than a fixed cap.
  - **Sketch (unbuilt):** a selection/priority seam in `bin/bill` (recency, an explicit `priority:`/
    `offer:` field, round-robin across cycles) and a negotiated block size per peer. Deferred until the
    live emit/answer gives real signal about what a good bill looks like — curation is premature before
    a bill is actually carried and weighed.

---

## E. Matcher addressing

**Tier: atlas.**

`_data/piles.yml` records the `tell:` each pile groups behind. `bin/match` still resolves a candidate's
`tell_url` **scope-first** (`_data/tells.yml` first entry in the need's scope), not by the pile's own
`tell:`. With one Tell per scope these agree; with several they could diverge.

- **Blocks:** correct addressing when a scope holds more than one Tell.
- **Sketch (unbuilt):** in `bin/match`, look up `tells[piles[i].tell].url` instead of scope-first. Small
  change; deferred to the Phase-B code pass that builds the Tell↔Atlas registration tooling, so the
  registry shape and the matcher move together and are exercised against a real second Tell.

---

## F. Tell: public mailbox to pre-public pickup

**Tier: tell.** The Phase-0 → Phase-1 transition (`tell/ROADMAP.md`). The exposure-window principle
ties these together; the geo-gate (below) is the lever that unlocks the rest.

- **Geolocation adherence in the judge, before public exposure.** `bin/govern` runs today *after* a
  reply is already a public Issue. Phase 1 requires authorization/judging to enforce **geolocation
  adherence** — a reply counts only within its constituency's bounds — **before** anything is public.
  This is the gate that lets a non-operator run a Tell without spilling unvetted plaintext.
  - **Blocks:** distributed collection (others running their own Tell); pre-public sealing; retiring the
    public-Issue mailbox.
  - **Sketch (unbuilt):** the `bin/authz` "type/asker-aware rules (rate, dedup, geo, …)" seam is the
    home; needs a source of constituency bounds and a trusted-enough location signal that does not drag
    respondent identity into the core.
- **Direct-transfer collector (phone tool + daily-cron agent).** The Phase-1 ingress: a tool on the
  operator's phone browser **buffers collected responses locally** until the known window opens, and a
  **daily-cron agent** submits the legitimate batch directly — instead of one GitHub Action per Issue.
  - **Blocks:** ingestion that scales with *legitimate* answers rather than traffic/spam; windowed
    pickup; the move off public Issues.
  - **Sketch (unbuilt):** local storage in the browser tool; a batch-submission format the ingress can
    authorize as a unit; the agent's cron *is* the legitimate-only pickup. Ties to QR expiry and
    pre-public judging below.
- **One-Issue-many-comments ingress.** Today each reply opens its *own* Issue (`index.md`'s prefilled
  `issues/new` link; `bin/collect-submissions` sweeps open Issues), so at poll scale the mailbox grows
  one Issue per respondent — with traffic, not with *legitimate* answers. The alternative shape the use
  case floats: a single standing Issue per poll, replies arriving as **comments**, collected and
  finalized as a thread.
  - **Blocks:** ingestion that scales with poll size without a per-reply Issue; a single lock/close
    gesture to retire a round; lower API and notification load than Issue-per-reply.
  - **Built (tell #31/#32).** `bin/open-poll` opens the canonical issue (anchor block, labelled
    `tell-canonical`); `bin/qr --mode comment --canonical <n>` points replies at it;
    `bin/collect-submissions` sweeps that issue's **comments** (beside whole Issues) and reads the new
    `nonce`/`run`/`anecdote` fields; `bin/rollup` seals them; `bin/finalize-submissions` signals a comment
    by a 👍/👎 **reaction** (comments can't be labelled). The comment's ordinal in the one thread is free,
    verifiable, contemporaneous cohort metadata. Still a per-deployment choice vs. the direct-transfer
    collector above — not both.
- **QR token expiry vs. round-bumping.** A QR token is
  `HMAC(k_pile, "tok:"||pile||":"||poll||":"||round)` — a bearer capability with **no intrinsic
  expiry**. The only way to retire an outstanding QR is to bump `round` (or pin `TELL_ALLOWED_ROUND`),
  which is coarse and global.
  - **Blocks:** posters/printed QR with a defined lifetime; per-poll close dates; "this poll closed on
    DATE" UX.
  - **Sketch (unbuilt):** carry an `exp` inside the signed token preimage and check it in `bin/authz`;
    needs a per-poll registry to hold the schedule. Left out while we settle how much state Tell should
    keep about polls at all.
- **One reply per respondent — dedup, not just expiry.** The token is a *bearer* capability bound to
  `pile+poll+round` and nothing about *who* presents it, so the same QR replays without limit: one
  screenshot answers a poll a thousand times, and nothing distinguishes the first respondent from the
  second. `bin/authz` names the seam — its comment lists "richer, type/asker-aware rules (rate, dedup,
  geo, …)" behind `TELL_AUTHZ_CMD` — but the default enforces none. Expiry (above) retires a token
  *globally*; this is the orthogonal axis, retiring it *per respondent*.
  - **Blocks:** any poll whose result counts *people* rather than *clicks*; ballot-box integrity;
    telling Person from Person B (the use case leans on exactly that distinction).
  - **Sketch (unbuilt):** a dedup key in `bin/authz` — but the bearer token carries no stable
    respondent handle, so this couples to the identity question below (whoever authenticates the POST is
    also whoever you dedup on). Honest interim: accept the replay, dedup *downstream* in `govern` on a
    respondent-supplied nonce, knowing it is advisory until identity lands.
- **Identity model when the page POSTs to the GitHub API directly.** Today the landing page only
  **builds a prefilled `issues/new` link**; the respondent's own account posts the Issue (the spam/cost
  shield). A future direction is the page **POSTing to the GitHub API** using the QR's contents — which
  reopens *who authenticates the POST* (the respondent's token, a service token on a static page — no,
  or a short-lived capability minted into the QR, tying back to expiry above).
  - **Blocks:** any move away from the click-through model; one-tap replies; kiosk / no-account flows.
  - **Status (homebrew interim, anecdote #18 + tell #32).** Chosen for the first live attempt: a
    **semi-public POST credential** minted Tell-side — a repo-scoped, Issues:write, short-expiry
    fine-grained PAT carried in the QR (`TELL_POST_TOKEN`) — so the runtime (`anecdote.channel`) POSTs
    the comment with **no respondent account**, kiosk-style. The credential rides outside the provenance
    signature and is never bound under the user's signature; `tok` still gates *acceptance*. The graduation
    is a **GitHub App + scan-time worker-minted short-lived token** (no durable credential in the QR).
- **The public-issue side-channel's two abuse problems (homebrew running cost).** We open this access
  model on purpose — it's a side-channel `anecdote.channel` sites expect, and it must NOT be the operator's
  Cloudflare edge *deciding* anything. Two distinct risks while we sit on the public GitHub issue layer:
  - **(1) Spammable, and it draws GitHub's abuse scrutiny.** A semi-public write token (and even the
    click-through model) lets anyone post; nothing yet gates *use of the token* by whether the requester is
    **inside the constituency at the moment of request** (the email-style proof-of-access). That gate is
    the **judge's** job (geo/constituency awareness) — see **A** (judge as a request-time worker, debut =
    the constituency solve). Until it exists, abuse is bounded only by short token expiry + round-bumping +
    downstream dedup, and excessive traffic risks the host flagging us.
  - **(2) Everything on GitHub is public, skimmable, subscribable, and under no purported license at the
    moment of encounter.** The plaintext window (and the whole issue/comment surface) is world-readable
    before sealing, and a third party can harvest it off GitHub outside any terms we attach downstream.
    This is **infrastructural**, not a bug of one deployment: it is the price of using the public layer as
    the expected side-channel. Mitigations are the Phase-1 pre-public pickup (above) and moving the
    judgement to a summoned worker (**A**), not the edge. **Open:** how much of this is acceptable for the
    pilot, and exactly which parts the judge-worker must gate before distributed/at-scale operation.
- **Ingress loop cross-repo adoption.** The ingress (collect → govern → deliver → finalize) is a
  composite action, but referenced cross-repo its bundled scripts resolve `_data/piles.yml` relative to
  their own checkout — so a third repo would read *this* Tell's registry, not its own.
  - **Blocks:** adopting ingress cross-repo while keeping your own piles/constitutions.
  - **Sketch (unbuilt):** thread the consumer data paths (registry, constitutions, stage, reports)
    through env so the bundled scripts read the *workspace* — the same code-vs-data split the `deliver`
    and `register` actions already make. For now, adopt the whole tree (fork/submodule).

---

## G. Tell-less pile ingest

**Tier: pile.**

`keys/pile.age.pub` is public and encrypt-only, so anyone *could* `age`-encrypt a payload to a pile
without any Tell in the loop. What is missing is a path to **ingest** such a drop: the live feed is a
one-way ratchet whose seed only Tell holds, so an out-of-band contribution cannot extend that chain.

- **Blocks:** accepting data when no Tell fronts the pile; archival imports; a contributor handing the
  owner sealed data directly; **relocating a whole pile between origins** and **clearing a space** to
  receive one.
- **Specified (unbuilt):** [`data-pile/docs/transfer.md`](https://github.com/FCCN-ANTIBODY/data-pile/blob/main/docs/transfer.md).
  A separate `feed/drop` channel — `age`-to-recipient blocks (each under a random per-block key, itself
  `age`-wrapped) under their own signed, hash-linked manifest (no ratchet, since there is no shared
  seed), verified by a `bin/verify` variant in a distinct `data-pile-drop` signing namespace against a
  local `keys/drop.signers` accepted-signers set. On top of it: the **sendable whole-pile bundle**
  (`manifest.json` + blocks travel as one self-verifying artifact — a pile is portable because its
  signed manifest is the sole, transport-agnostic anchor) and the **clear-space ingress**
  (archive `feed/<source>` → `archive/feed/<source>@<stamp>`, reset the live ref, re-import — never
  rewriting a signature, per § N's legacy-vs-pointer split). Storage *and* encryption solved out of
  band, **not** by borrowing Tell's key. The build surface (`bin/send`, the drop verifier, the
  `file://` ingest path, a clear-space workflow) is named in that doc.

---

## H. Hub geo-fill, widget mounting, portability

**Tier: atlas (the scanner) · node (the mount).**

The **baked-QR identity** layer is landed: `bin/widget` (+ the `widget` action) bakes a node's
**geo-less locator stem** into a QR that opens the hub as
`atlas.anecdote.channel/?node=<atlas>&home=<scope>`, and `assets/scan.js` is the scanner side, which
fills the scanner's US state and redirects, or shows the **missing-in-state** page (never a geo-block).
The routing logic is built and tested; the seams below remain.

- **The geo source — proof-grade, not deployed (Tier: atlas).** `workers/scan-router/` is a Cloudflare
  Worker that reads `request.cf.regionCode`, maps it to a slug, and 302s **before the request reaches
  Pages** — no SDK, no third party, the scanner's IP never leaves the edge. Proof-grade fallback: an
  unresolved region falls back to `colorado` so a scan always lands somewhere live.
  - **Still needs (not repo code):** the Atlas record flipped to **Proxied** (orange-cloud) so the route
    can intercept (see `atlas/DNS.md`), and `wrangler deploy`. Until deployed, `scan.js` + the marketing
    page stand.
- **Portability beyond the home state (Tier: atlas).** A scan resolves only when the scanner's state
  matches the node's home `scope`. A directory that genuinely stands in more than one state needs a way
  for `scan.js` (or the Worker) to know **which** states a node resolves in — a small per-node
  portability manifest, or letting the target's own 404 be the missing-in-state page. Deferred until a
  node registers in a second state.
- **Mounting the Atlas widget in this workspace (Tier: node).** The build (`antibody.yml`) already
  renders the **tell** and **journal** widgets with a best-effort probe. The Atlas widget is the same
  shape — add a *"Render this node's Atlas widget"* step `uses: ./atlas/.github/actions/widget` with
  `out: widget/atlas.html`, then bump the `atlas/` submodule pin. **Deliberately not mounted yet:** the
  fragment may change as these nodes blossom into full static site branches under `publish/`, so the
  producer (atlas) lands first and the consumer (this workspace) waits. The probe pattern means a node
  whose `atlas/` pin predates the action still builds.

---

## I. Operator placeholders

**Tier: node.** Not design gaps — the seed values an operator must replace to go live. Listed here so
they're not mistaken for "wired."

- **`keys/atlas.fpr`** ships as a **placeholder** — the peer handshake won't verify until an operator
  provisions a real signer (see `keys/README.md`).
- **`_data/tells.yml` → `signer`** carries a `SHA256:PLACEHOLDER-…` fingerprint for the reference Tell;
  replace with the real Tell's delivery-signer fingerprint.
- **`_data/piles.yml` → `age_recipient`** carries an `age1PLACEHOLDER…` recipient; each fronted pile
  must supply its real `age` recipient for encrypted delivery.
- **`vars.ATLAS_MATCH_CMD`** is unset by default, so `match.yml` keeps `matches.json` empty (the honest
  default accepts nothing). Set it to a judge — an agent or a human seam — to accept matches (**A**).

---

## J. The poll product surface: authoring and answering

**Tier: tell.** Surfaced by the end-to-end use case. The product surface — *authoring* a poll and
*answering* it — runs behind the cryptographic spine that feeds it. The poll itself is deliberately
**unbacked**: a respondent answers from the QR alone, never a registry, so a QR can travel peer-to-peer
and air-gapped with no Tell on the far side (see the Tell's `docs/per-poll-registry.md`).

- **No authoring path from "make a question" to a live poll.** Going live today is three hand-done acts
  in three places: write `_data/constitutions/<pile>/<poll>.json`, register the pile in `_data/piles.yml`,
  and mint+bake the QR (`bin/qr` + `bin/widget`). Nothing composes them, so "User makes a question"
  (step 1) is an operator chore, not a gesture.
  - **Blocks:** an operator — or the next operator — standing up a poll without assembling it by hand;
    the use case's step 1 as a single action.
  - **Sketch (unbuilt):** a `bin/poll` (or a guided action) that takes a question + options + guidance,
    writes the constitution, appends the pile entry, and emits the *signed* QR — one input, three artifacts.
- **The poll is unbacked by design — provenance is the open question.** The QR carries the poll
  (`q`, `opts`, `guidance`) plus a *symmetric HMAC* token that only the minting Tell can verify
  (`bin/authz`). Keeping the poll self-contained is deliberate — these QRs are meant to travel
  peer-to-peer, air-gapped, with custom payloads and no registry on the far side; a registry-backed poll
  cannot survive that trip. What is missing is a way to prove *where a QR came from* to a registry-less
  recipient: the HMAC authorizes a reply into the minter's own mailbox but is meaningless off-node, so a
  shared or foreign QR's origin can't be checked. (Binding the shown fields to a Tell-side constitution —
  the earlier idea here — is the wrong fix and is retired.)
  - **Blocks:** trusting a shared/foreign QR's origin; the matrix-of-QRs / air-gapped future where the QR
    is the floppy disk; reading heavier signed payloads off a grid of them.
  - **Sketch (unbuilt):** sign the QR payload with the Tell's delivery signer (the asymmetric model
    `bin/deliver` already uses, verified against `keys/tell.signers`). Authorization (HMAC,
    mailbox-scoped) and provenance (signature, anyone-verifiable) are **separable roles** a QR may carry
    one or both of. Tracked as its own thread, **L** — the open design questions (size budget vs. QR
    capacity and the matrix, trust roots without a registry) live there and in the Tell's
    `docs/qr-provenance.md`.

---

## K. The batch rhythm: mutual cron windows

**Tier: tell (deliver cadence) · pile (ingest cadence) · node (the shared window).** The use case turns
on "cron jobs waking up to see the other left something" — deliberate batching scaled by size and
frequency. The two crons exist, but neither the coordination nor, on the producing side, the live
schedule does.

- **The producing cron is off; the consuming cron runs into a void.** The pile's ingest schedule is live
  (`data-pile/.github/workflows/ingest.yml`, `cron: "23 * * * *"`), so it wakes hourly and looks — but
  the Tell's crunch is `workflow_dispatch`-only, its `schedule:`/`issues:` triggers commented out
  (`tell.anecdote.channel/.github/workflows/ingest-submissions.yml`), so nothing is ever produced for
  the pile to find. The consumer's frequency lever works; the producer's is disabled.
  - **Blocks:** the unattended loop (steps 4–6) running without a human dispatching the Tell each cycle.
  - **Note:** the disable is intentional template safety (see the workflow header); the unspecified
    thing is the *coordinated, on* state, not merely the unset switch.
- **There is no shared notion of a window.** The two crons are independent offsets (`:23` ingest, `:31`
  deliver-if-enabled) with no handshake: no signal that "this round is sealed, go look," no per-poll
  open/close, no agreement on size. A fresh batch can wait most of an hour for the next poll, and the
  cadence is two unrelated numbers rather than one window both sides honor.
  - **Blocks:** tuning batch size/frequency as one knob; "this poll closed on DATE" semantics (ties to
    QR expiry, **F**); a pile that polls *because* a delivery happened rather than on a blind timer.
  - **Sketch (unbuilt):** a cheap delivery marker the pile can check (a feed-head timestamp / round
    counter) so ingest is delivery-driven, and a per-poll schedule that both the Tell's deliver and the
    QR's `exp` read from — the per-poll registry **F** keeps deferring is the shared home for it.

---

## L. Signed self-contained QR provenance

**Tier: tell.** Promoted from **J**. The QR carries **two separable credentials**; the signing and
verifying halves are built (slices 1–2), the trust and tiling halves are not.

The **token** — `tok = HMAC(k_pile, …)` — is *symmetric*, verifiable only by the minting Tell, and
authorizes a reply into the mailbox this Tell tracks: a GitHub Issue, or a comment on the poll's
**canonical Issue** (the scalable shape, **F**), ingested by `bin/collect-submissions`. It keeps its
job. What it cannot do is prove *where a QR came from* to anyone else — and that is the whole premise of
the share/air-gap future: a QR travels peer-to-peer with custom payloads and no registry on the far
side, so a recipient must decide whether it is **worth processing at all** before spending anything.
That gate is a **signature over the exact payload** — *this version of the question, this share link* —
giving origin (who) and integrity (this exact content). The asymmetric model `bin/deliver` already uses
(`ssh-keygen -Y sign`, verified against `keys/tell.signers`) is the reuse seam.

The two ride together at different points: the **token** gates *acceptance of a submission* into the
tracked mailbox; the **signature** gates *whether a poll/share is processed at all*. A submission also
carries the poll's signature, so the Tell confirms the reply is to a version of the question a trusted
signer actually issued — which is how **J**'s old "what the respondent was shown is unverifiable" gap is
closed: by signature, not by binding to a registry.

- **Blocks:** trusting a shared or foreign QR's origin; the matrix-of-QRs / air-gapped future (QR as the
  floppy disk); a cheap pre-filter before processing heavier signed payloads off a grid of them; closing
  **J**'s shown-vs-authentic gap.
- **Open (the design):**
  - **What is signed** — a canonical preimage over the payload fields (not the raw URL: param order and
    re-encoding are not stable), covering `tok` too, under a distinct namespace (e.g. `tell-poll`) so a
    delivery signature can never be replayed as a QR one.
  - **Signature format vs. size** — the armored SSH blob is large for a QR; a raw Ed25519 signature
    (64 bytes) over the *same* key is compact. Same key, choosable encoding.
  - **Trust roots, and who is authoritative** *(slice 3).* The signature proves *who*; a recipient
    still needs a **local friend list** to decide *whether to act* — there is no global registry, only a
    per-node accepted set built out of band by signed handshake (the `keys/tell.signers` idiom; the peer
    tier's `_data/atlases.yml` is the same shape one level up — a listed peer "may truthfully trigger
    this node's matcher"). The load-bearing rule, now stated in `VISION.md`: **a verified friend's
    payload is a _trigger_, never imported truth** — the node runs *its own* search over *its own* data
    and answers from what it authoritatively holds, exactly the "one matcher, two triggers" shape **D**
    specs for a peer's bill. Cross-node **discovery** (how friend lists get seeded / advertised — the
    `/polls.json` seam) is the genuinely open part, but it only ever *proposes* friends; the local merge
    disposes, and authority never leaves the node. The friend set is **one list** (a neighbor is a single
    node-to-node relationship, not separate QR-signer and peer-Atlas lists) — see **M**, where the
    discovery model now lives.
  - **Size budget / the matrix** — one signed poll fits a single QR; heavier payloads tile into many, so
    the packet format must be chunk-aware (payload id, index/total, a *whole-payload* signature over the
    reassembled bytes). The full tiling format is a later thread.
- **Status:** slices 1–2 **built** — `bin/qr --signkey` signs a canonical preimage and carries
  `sig`+`kid` beside `tok` (namespace `tell-poll`); `bin/authz` verifies it against the accepted-signers
  set and binds it to the submission by token, as the worth-processing gate (`TELL_REQUIRE_SIG` to
  require it). **Unbuilt:** the friend-list/authority generalization (slice 3, above) and the matrix
  tiling (slice 4). See the Tell's `docs/qr-provenance.md`.

---

## M. Cross-node discovery: neighbors, not a graph

**Tier: atlas (the membrane) · node (the connection).** The open mechanism behind **L**'s trust roots
and **D**'s peering: *how* a node finds and accepts the neighbors whose payloads it will act on. The
**model** is settled (and stated in `VISION.md`); the wire-level mechanism is not.

- **One list.** A neighbor is a single node-to-node relationship — it grants both "may trigger my
  matcher" (**D**) and "I will process your signed polls" (**L**). This closes **L**'s parked
  one-list-or-two question: one list.
- **Connection is privileged because connection means searching.** Accepting a neighbor grants a
  *standing capability* to trigger your matcher, so every edge is deliberate and consented (the
  signed-PR handshake, merged by hand). There is no "friend everyone" gesture — auto-connect-all would
  hand out search wholesale.
- **No transitive, no compulsion.** A neighbor's neighbors are not yours (reaffirms **D**'s first-hop
  bound). A node does not accumulate everyone; it **joins another Atlas** instead. An Atlas is a
  purposeful, overlapping slice — a jurisdiction with a logical membership, or an opinion — so a node
  belongs to many at once and geography stops limiting how many communities it can join.
- **Rivals can be neighbors — safely.** Because authority is local (the slice-3 rule in `VISION.md`), a
  neighbor only ever triggers *your* search over *your* data; connecting is the right to ask, never to
  take. So a node may connect to a rival as a public news-drop — see what's public — which can shift the
  tone of public discourse. That is culture applied by humans, captured as the neighbor list.
- **Recommendations are advisory, never connective.** An Atlas may publish *who it rates* ("cream of the
  crop", or simply who its neighbors are) as a **go-look-yourself** pointer: reading it forms no
  relationship and grants no search. Adjacent to **C**'s standing (a constituency's own accumulated
  weight) but distinct — this points at *others*. It only ever *proposes*; the local merge disposes.
- **Recommendations may point at opposition, not only praise.** The same advisory pointer can surface
  *adjacent or opposing* communities — "others in your universe who differ" — so positions don't hide
  from each other. But the vector that makes someone "like you" is **human-named** ("our rivals",
  "adjacent groups"), never a computed similarity score (that would rebuild the bubble-maker), and
  *when* such exposure appears is a human publishing decision — an **explicit non-goal for the machine**:
  the system never judges that you would "be healthier" for seeing your rivals and pushes them at you.
- **Membership is opt-in; visibility within it is mandatory — and that is the offer.** You choose
  whether to join an Atlas; not wanting a public presence means simply not joining. Once in, being found
  *is* the value (the platform's free advertising), and there are **no secret members and no private
  lists** — an operator cannot quietly carry a movement off the public listing. The listing mechanism is
  neutral infrastructure; culture rides on top (who you call a neighbor, what your tags mean), never
  inside how the listing works.
- **You author your presentation, not your visibility.** A node controls its *framing* — its name and
  tags ("so-and-so presents"), indie-bookstore style where the listing entity owns its own tag
  vocabulary — not whether it appears. The Atlas is then a thin navigation over its rendered files
  (browse by tag, or read the files raw). Agency is in how you show up, not in hiding.
- **No one-way mirrors — disclosure travels with the data via the license.** Reading what is public is
  free (that is the point of socializing it); to *operate* on it — relist, aggregate at scale, connect
  as a node — you must take on the license, which makes you an Atlas bound by these same consent-ful
  rules. So a private actor cannot harvest-and-hide: anyone *acting* on the network is visible on it too.
  Provenance (the signatures) proves origin; the license governs reuse; they bite together. (Legal /
  normative enforcement beside the technical one — honestly a posture, not DRM.)
- **Evolution is speciation, not amendment.** Governance, unlike data, is never aggregated — it is
  *authored*. An Atlas effectively *is* its constitution, so the constellation changes by proliferation:
  rather than fight to mutate a shared instrument or drift it toward a median, you copy it and stand up
  the variant you want next door. It is an **exit system, not a voice system** — exit is cheap here
  (constitutions copy; you belong to many Atlases), so the internal-reform machinery that would only be a
  capture surface is deliberately absent. An operator still edits their own constitution in the open,
  sha-stamped (a live patch, per `_data/constitutions/README.md`), but that is authorship maintaining a
  house, binding on no one who can leave. So a poll that *passed but offends you* has a boring answer —
  tighten your own rule forward, or don't; the offended member talks, leaves, or forks. **No reform
  institution and no complaint pipeline, by design.**
- **The directory tier is itself an Atlas.** "What exists" is catalogued by a *directory of Atlases* —
  the same "directory" Atlas always was (it began as a directory of Tells), one tier up: holds no keys,
  reached through, privileged by nothing. Directories speciate too, so there is no canonical master list;
  the same super-opinion spawns several, each a curation. Hence **even the state is just an Atlas** — no
  node, however official, monopolises "what exists", conscripts the unwilling, or quietly drops the
  inconvenient, and any directory can be rivalled by another of the same scope. Discovery thus has
  exactly two modes: the **neighbor** (a consented, mutual, search-granting *relationship*) and the
  **directory** (an advisory *pointer* at Atlases that already chose to be public) — a handshake and a
  map, with self-authored tags as the map's ink.
- **Open (the mechanism):**
  - the **carrier**: a recommendation / bill is a *self-signed YAML doc* (the **D** bill shape,
    block-size bounded), transport-agnostic — it can arrive on a per-neighbor branch, as a file, or via
    QR — with trust in the doc's own signature (never in Git itself), and the kept list a rendered
    `_data` registry partitioned by source. Block size is a per-neighbor setting, possibly reputation- /
    constitution-informed (cf. **D**'s asker-side bill governance). *(Discussed; leading candidate.)*
  - the structure of a published recommendation / self-advertisement — a made-public list (the
    `/polls.json` transparency seam generalized) a recipient can read and pin out of band;
  - how a discovered candidate becomes a *consented* neighbor (the existing signed-PR + out-of-band
    fingerprint handshake is the likely shape);
  - whether an Atlas's published "cream of the crop" is the same artifact as **C**'s standing signal, or
    a separate one.
- **Blocks:** discovery in practice (finding neighbors beyond manual introduction); belonging to many
  Atlases without a central directory; a recommendation surface that lets culture travel *without*
  auto-forming relationships.

---

## N. Liveness, decay, and a derelict node's legacy

**Tier: node · atlas.** What it looks like when a node goes derelict — powered down, nobody merging its
PRs — and how the nodes that registered it elsewhere experience the loss. The position: **dereliction is
decay, not detachment.** Nothing in the constellation is live-coupled, so a node that goes quiet breaks
nothing; it stops contributing freshness, and the system was already built to let that fade gracefully.

- **Legacy is permanent; pointers are disposable — different layers.** A node's own signed, public record
  (its rendered files, its signed artifacts) is a **forever-trustworthy legacy**: permanent because it is
  signed and public, so anyone may mirror it and it still verifies against the node's key — it outlives
  the original host. The **pointers** to it (others' `_data/atlases.yml` entries, directory listings) are
  each holder's own data, freely pruned. Dropping a pointer never destroys the legacy; it only stops
  *you* vouching for it. (This permanence is for the **public-actor layer** — Atlases, Tells, listings,
  things that chose daylight — never the private replies, which stay sealed to the pile.)
- **Powered down is a monument, not a 404.** Static hosting serves the last build for free, so "powered
  down" means *no new merges / no Actions*, not *dark*. The record keeps serving and keeps verifying
  offline. You lose a node's future, never its past.
- **Liveness is an observed claim, never a self-report** (the dead cannot announce death). Two flavors of
  "inactive": a **graceful self-retirement** — a signed final claim while still alive ("retired as of …"),
  optionally **forwarding to a successor** (the speciation variant next door), a tombstone that is also a
  signpost; and **observed staleness** — holders annotating their own entry ("inactive, last seen …"),
  soft and per-holder, with **no central death-flag**. The self-made kind is cleaner when you can get it;
  the observed kind exists because usually you can't.
- **De-registration is local, guided, and transparent.** The active layer self-de-registers via
  eviction-by-re-inclusion (**D**) — a derelict node's asks age out when it stops re-including, no action
  needed. A persistent entry is *guided, not automated*: a signed retirement is the clean trigger,
  accumulated observed-staleness the soft one, your own space/relevance a fair reason. It is a local
  editorial call (local authority), and because lists are public (no private lists, **M**), the drop is
  itself visible — rendered list plus git history — never a silent memory-hole. De-registering a pointer
  never touches the legacy.
- **No single source of truth on "dead".** Liveness is a claim — self-made or observed — weighed by who
  says it, exactly like everything else.
- **Claims-about-a-subject need no new primitive.** Liveness, reputation, recommendations, even a tag are
  one thing: a first-party, signed, attributed claim that *points at a subject* (a node, a topic), read by
  provenance and trust. A subject is whatever the trust-weighted cloud of claims about it says — never a
  canonical record. This is the project's first-party-claims thesis turned on subjects, and it is the
  foundation the rest of this (liveness marks, tombstones, directories, recommendations) is built from.
- **Open (the mechanism):** the concrete shape of a signed retirement / forward notice; an optional
  `last-seen` / freshness convention holders may render (vs. letting absence-of-refresh speak for
  itself); how a tombstone's forward pointer is expressed and followed.

---

## O. Anecdote: the first-contact appliance

**Tier: anecdote (above the node).** The on-ramp to everything — how any utterance becomes something the
network can carry. Stated as intent in `VISION.md`; the *supply mechanism* is the open part. This is the
load-bearing linchpin: it is what offers *anything at all* into these networks, under one promise — that
it will not bother you with it.

- **Job: first contact, reduced to atoms.** A small on-device model meets any input — a poll, or
  unsolicited testimony no one could pre-structure (*there is shade at this park*; *these are the Dewey
  numbers on this shelf this week*) — and helps the speaker say it in fewest-verbs, simplest-noun-phrase
  form. That atomic form is **a vector without the compute**: constrain the surface language until its
  shape approximates the meaning — the primitive label (**C**/**N**) every Atlas stands ready to answer
  in.
- **Constitutionless by necessity.** Unsolicited input has no governing constitution, and you cannot stop
  the speaker to demand one; nor will the system enshrine the social-media correction loop (edits,
  follow-ups, clarifying threads). So the way to "take it seriously" without a constitution is
  **blind-justice reduction**: moderate away to the sayable atomic core and get it as close to the shared
  labels as possible. With a constitution (posting on an Atlas/Tell you have chosen) you can do far
  better; unsolicited, the labels are all you have — and they suffice because they are the lingua franca.
- **The singular neutral instrument (the trust model).** You cannot trust an LLM unless you know it
  loaded **cold** and was **never tampered with**. Per-workspace anecdotes reintroduce exactly the
  ambiguity that destroys that trust ("what can *this* workspace's anecdote do?"). So unlike the engines
  (vendored, forked) and the constitutions (copied, speciated — plural so governance cannot be captured),
  anecdote must **not** fork: one uniform, verifiable instrument everyone runs identically. The rules are
  many so no one seizes them; the tool is one so everyone trusts it. This is the complement of speciation,
  not a contradiction of it — culture is plural, the instrument is singular.
- **Privacy by incapability.** It is chosen *because* it is too small and slow to spy or carry a second
  agenda — the near-zero exposure is obvious from the appliance itself — and it runs **locally, before
  submission**, so only the speaker's approved result ever leaves. Approval is **nudge, not write-in**:
  you redirect its interpretation among paths it can validate, never free-text an answer (which would
  break the atomic form and is the self-reported resolve the system distrusts).
- **Strong lean (supply):** supplied **authoritatively from `anecdote.channel`** — the top-level concept
  that initiates the domain — **not** a civic-node submodule each workspace tweaks. The cold-load /
  no-ambiguity trust argument points hard this way; the wire-level supply is the open piece below.
- **Open (the mechanism):** who serves the model, and how a client verifies it loaded **cold and
  untampered** (pinned hash / signed weights?); how the reducer converges reliably on small hardware —
  the **merge-only ratchet** / noisy-proposer-plus-simple-acceptor design that makes monotone progress
  and forecloses reversal traps; **label versioning** (a label is tied to a reducer version, like a
  `constitution_sha`); and whether a workspace may ever supply a *fallback* without reintroducing the
  ambiguity that voids trust.
- **Blocks:** ingress of anything at all (it is first contact); trustworthy local reduction without
  surveillance; and the whole label/collision economy (**C**) and claims-about-subjects (**N**), which
  all assume utterances arrive already atomised.

# The vision

This file is the whole picture: what the `*.anecdote.channel` constellation is now that its
parts are all in place, and what a Civic Node like this one is *for*. `AGENTS.md` is the
why-shaped map for someone working in the code; the per-repo `CONSTITUTION.md` files are each
node's binding law; this is the intent they all serve, stated once, in one place.

## The thesis

Information quality is ranked, on purpose. **First-party claims carrying their own metadata** beat
**hearsay**, and hearsay beats **fraud**. The whole apparatus exists to keep first-party local
journalism legible and attributable rather than laundered through someone else's attention economy.
News media are paid in our attention and our data; they have had it all and still cannot hear us.
The answer is not a better outlet — it is the means of **direct information exchange within a city**,
owned by the people who live there, that no outlet sits between.

A Civic Node is one such means, made concrete. It is meant to be **replicated**: the point isn't this
one site, it's that any city can stand one up, copy the code and the license, and understand what they
copied. Every design decision passes through that lens — *would the next operator be able to run this?*

## The constellation, as one operable whole

Three roles, in shrinking hierarchical order, plus an engine:

- **Atlas** — a **directory of Tells**, and the reporting-law layer. It lists the hubs that front
  data-piles so the public can find them, reflects the coarse public maps the piles consent to show,
  and aggregates each listed Tell's transparency reports upward into constituency reports. It holds no
  key that decrypts anyone's data; a pile is reached *through* its Tell.
- **Tell** — a **jurisdiction's hub**: the addressable node. It collects replies for the piles it
  fronts, judges each against the constitution the pile delegates to it, seals the result encrypted to
  the pile alone, and publishes it for the pile to pull. A pile on its own has no address and nothing to
  answer for it; the Tell is what a directory can list.
- **data-pile** — the **durable, encrypted tank**: the system of record. It pulls its sealed digests
  from its Tell, verifies the signed chain, and persists them. Only its owner can read what it holds —
  until the owner chooses to prove it, publicly and verifiably, to everyone.

The relationship is a chain of delegated authority: **the pile is the principal, the Tell is its agent,
and Atlas is the reporting-law layer above them.** A pile delegates its per-poll constitution to a Tell
and revokes it by leaving; a Tell describes the reports it publishes and an Atlas requires and
aggregates them. Constitutions bind each layer in the open and constrain the next — copyable
constitutions are the point, because a few sound ones let one careful operator serve many.

That authority never leaks sideways. **A node is the sole authority over its own data, and a verified
peer can only _trigger_ it, never reach into it.** A friend's request — or a signed poll shared
peer-to-peer — is a prompt, not a transfer: it makes the node run *its own* search over *its own* data
and answer from what it authoritatively holds, importing nothing foreign as truth. Trust is local and
earned out of band — a signed handshake the node merges by hand — so a signature proves *who* while the
node's own friend list decides *whether to act*. Discovery may propose new friends; the local merge
always disposes.

Federation is therefore **neighbors, not a graph**. A node connects only to peers it has accepted by
hand, one hop, and the connection is privileged precisely because *connection means searching* — to
accept a neighbor is to let them trigger your matcher. So no node wires itself to everyone; it **joins
another Atlas** instead. An Atlas is a purposeful, overlapping slice — a jurisdiction, or an opinion —
which is how a person belongs to many at once and geography stops being the limit on how many
communities you can join. Because authority stays local, even a *rival* can be a neighbor: connecting is
a public news-drop, the right to ask, never to take, and it can change the temperature of what happens
in the open. What an Atlas says about *others* is only a **go-look-yourself recommendation** — a pointer
that forms no relationship and grants no search. Culture lives in who a node calls a neighbor; the
system leans on that human judgment instead of an algorithm that connects everyone.

Discovery is the deal you opt into by joining an Atlas, and it runs one way: **membership is a choice;
visibility inside it is not.** Don't want a public presence? Don't join — and if you do, being found
*is* the point, the platform's free advertising. There are no secret members and no private lists, so an
operator can't quietly carry a movement off the listing; what you author is your *presentation* — your
name, your tags, "so-and-so presents" — never your visibility. The listing mechanism stays neutral
infrastructure, with culture riding on top of it rather than inside how it works. And disclosure travels
with the data through the license: reading what is public is free, but to *operate* on it — relist,
aggregate, connect as a node — you must take on the license and so become an Atlas bound by these same
consent-ful rules. So there are **no one-way mirrors**: anyone acting on the network is visible on it
too. Provenance proves origin; the license governs reuse; together they leave nowhere to hide.

Governance, unlike data, is never aggregated — it is authored. An Atlas effectively *is* its
constitution, so the constellation evolves by **speciation, not amendment**: rather than fight to mutate
a shared instrument, or average it toward a median, you copy it and stand up the variant you want next
door. It is an **exit system, not a voice system** — because exit is cheap here, the machinery of
internal reform that would only become a capture surface is deliberately absent. An operator still edits
their own constitution in the open; that is authorship maintaining a house, binding on no one who can
simply leave.

Even the catalogue of what exists is just an Atlas — a directory of Atlases, the same "directory" Atlas
always was, one tier up: holding no keys, reached through, privileged by nothing. Directories
proliferate like everything else, so **even the state is just an Atlas**: no node, however official, gets
a monopoly on what exists, can conscript the unwilling, or can quietly drop the inconvenient. Discovery
therefore has two modes and nothing in between — the **neighbor**, a consented relationship that grants
search, and the **directory**, an advisory pointer at Atlases that already chose to be public: a
handshake and a map.

When a node falls silent it **fades rather than detaches**: its signed record stays a permanent,
mirrorable legacy — you lose its future, never its past — while the pointers others held to it are theirs
to retire, in the open. Liveness itself is only ever an *observed* claim, never a node's own
announcement; nothing is a single source of truth, least of all whether something is still alive.

The fourth part is the **Journal** engine: the shared Jekyll machinery that renders a node's
first-party record from the prose under `journal/`. It carries no role in the federation lifecycle — it
is how a node *publishes*, not how it federates — and it is vendored as the `.journal-engine` submodule so
every node renders the same way.

And there is a part that comes *before* all of these: **Anecdote, the first-contact appliance** — the
on-ramp to everything. It is a small, on-device model, loaded cold and tamper-evident, whose only job is
to meet any utterance — a poll, or unsolicited testimony like *there is shade at this park* — and help
the speaker say it in the fewest verbs and simplest noun phrases. That atomic form is a vector without
the compute: constrain the language until its shape *is* the meaning — the primitive label every Atlas
already stands ready to answer in. It is deliberately the **constitutionless** on-ramp: it demands no
perfect constitution and refuses the social-media loop of endless edits and clarifications; it helps you
say a thing once, privately, and then gets out of the way. And where the engines are vendored and the
constitutions copied — plural on purpose, so governance cannot be captured — Anecdote is the one part
that must *not* fork: a tool can only be trusted if it is uniform, loaded cold, and unambiguous about
what it can do. The rules are many so no one can seize them; the instrument is one so everyone can trust
it — supplied authoritatively from the channel itself rather than vendored per node (see
[`OPEN-QUESTIONS.md`](OPEN-QUESTIONS.md) §O).

## What this workspace is

This repository is a Civic Node that **self-hosts all three roles and fronts piles** — one workspace
ostensibly able to operate the whole constellation:

- It **is its own Atlas**: it runs the matchmaker over its own needs, piles, and Tells, keeps a registry
  of peer Atlases, and publishes its identity for others to peer with.
- It **is its own Tell**: piles register with it by signed-PR handshake, and it collects, judges, seals,
  and delivers their digests.
- It **publishes through Journal**: the engine builds the site from the prose at `journal/` (served at
  `/journal/`), and the node's identity widgets (Tell, Atlas, Journal) are baked at build time.
- It **fronts data-piles** as the Tell they register behind, and can peer with other nodes to ask and
  answer searches across the network — one hop, by mutual consent, never a reach into anyone's repo.

It coordinates the three engines as hidden **submodules** (`.atlas-engine/`, `.tell-engine/`,
`.journal-engine/`), rolling their pins forward on a cadence it sets, and binds its own identity, signing keys, and constitutional posture on
top. The license is part of that posture, not boilerplate: you may copy the code, the text, and the
license **only if you attribute yourself as the author**.

## Where the rest lives

- The deferred half of every design — the open promises and functionality gaps, with what each one
  blocks — is gathered in [`OPEN-QUESTIONS.md`](OPEN-QUESTIONS.md). It is the only such list; this
  document and the constitutions state the design as intent, and the open questions track what is not
  yet wired, so a solved item drops away there without disturbing the vision here.
- The operational order — the **poll lifecycle walked literally**, naming the exact workflow or file
  behind each step and drawing the gaps as dotted lines that cite the open questions above — is
  [`docs/PIPELINE.md`](docs/PIPELINE.md). It is the connective tissue between this vision and the wire.
- Each node's binding law is its own `CONSTITUTION.md`, served live; each channel's wire-level
  interfaces are its `CONTRACT.md`; where a node is going is its `ROADMAP.md`. This file is the why they
  share.

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

The fourth part is the **Journal** engine: the shared Jekyll machinery that renders a node's
first-party record from the prose under `journal/`. It carries no role in the federation lifecycle — it
is how a node *publishes*, not how it federates — and it is vendored as the `.journal-engine` submodule so
every node renders the same way.

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
- Each node's binding law is its own `CONSTITUTION.md`, served live; each channel's wire-level
  interfaces are its `CONTRACT.md`; where a node is going is its `ROADMAP.md`. This file is the why they
  share.

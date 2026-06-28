# Anecdote reducer — spike

A runnable proof of the **first-contact reducer**'s core (see `OPEN-QUESTIONS.md` §O and
`VISION.md`). This is a *prototype*: the authoritative home of Anecdote is `anecdote.channel`,
supplied as one pinned, cold-loadable instrument — **not** a workspace submodule. It lives here
only to validate the algorithm.

## What it does

Turns arbitrary utterances into a small set of atomic **labels**, and lets independent gatherers'
labels **collide** by meaning. The design choices it embodies:

- **Labels are anchored to their fewest-verbs name's embedding**, not a drifting centroid — a
  growing curated dictionary. The name is durable; the vector is derived and keyed by the
  embedder version (a label's `constitution_sha`).
- **assign() = proposer + acceptor** — nearest label by cosine proposes; a threshold accepts;
  mint a new label only when nothing clears the bar. Multi-label.
- **ratchet() = merge-only convergence** — fold any two labels whose names embed within `mergeT`
  into one, *one way*, to a fixpoint. Label count only ever drops and there is no split, so it
  terminates and **cannot flicker** (no reversal trap). This is where cross-gatherer duplicates
  collapse and the trust-weighted **gatherer count** falls out.

## Run

```sh
node prototype/reducer/test.mjs   # deterministic, dependency-free
node prototype/reducer/demo.mjs   # two gatherers -> union -> ratchet -> fixpoint
```

Both use a **toy embedder** (bag-of-content-words → cosine). It proves the assign/collide/merge
*logic* offline; it does **not** understand synonymy — the demo ends on an honest miss to make
that explicit. "Does the algorithm converge" and "does the model load" are deliberately separate
problems.

## Dropping in the real instrument

The embedder is pluggable and may be async, so the on-device model swaps in with no change to the
core:

```sh
npm i @xenova/transformers
```
```js
import { Reducer } from "./reducer.mjs";
import { makeMiniLmEmbed, fewestVerbs } from "./embedders.mjs";

const embed = await makeMiniLmEmbed();              // Xenova/all-MiniLM-L6-v2, on-device
const r = new Reducer({ embed, name: fewestVerbs, reducerVersion: "Xenova/all-MiniLM-L6-v2" });
await r.assign("Is there shade at this park?");
```

`all-MiniLM-L6-v2` is ~23 MB ONNX, runs in Node and the browser, ships over NPM — the literal
shape of "one pinned package everyone runs identically." With real embeddings, synonymous
utterances ("library catalog codes" / "Dewey numbers") collide where the toy can't.

## Not yet (the layers above this core)

- **fewest-verbs naming** is a heuristic (`fewestVerbs`); v1 is the small *generative* model
  rewriting to atomic form — but the embedding carries the meaning regardless, so the core stands
  without it.
- **nudge-not-write-in approval**, **cold-load / untampered verification** of the model, and a
  trust-weighted (distinct trusted signers) gatherer count are all §O open mechanism — the spike
  shows the spine they attach to.

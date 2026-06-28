// Anecdote reducer — the merge-only label core (OPEN-QUESTIONS §O).
//
// Turns arbitrary utterances into a small set of atomic LABELS, where a label is
// anchored to its own fewest-verbs NAME's embedding (a growing curated dictionary),
// NOT a drifting centroid — so labels are reproducible anchors keyed by the embedder
// version, and the embedding is only there for fuzzy matching INTO the dictionary.
//
// Two moves, exactly as designed:
//   assign() — proposer (nearest label by cosine) + acceptor (a threshold). Mint a new
//              label only when nothing clears the bar.
//   ratchet() — merge-only convergence: fold any two labels whose names embed within
//              mergeT into one, ONE WAY, to a fixpoint. Label count only ever drops and
//              there is no split, so it terminates and cannot flicker (no reversal trap).
//
// The embedder is pluggable and may be async (so transformers.js + MiniLM drops straight
// in; see embedders.mjs). Collision = two utterances sharing a label.

export function cos(a, b) {            // a, b are unit vectors
  let d = 0;
  for (let i = 0; i < a.length; i++) d += a[i] * b[i];
  return d;
}

export class Reducer {
  // embed:  (text) => (unit vector | Promise<unit vector>)   — the pinned instrument
  // name:   (text) => fewest-verbs label name                — heuristic v0 / generative v1
  // assignT: assign threshold; mergeT: merge threshold (mergeT >= assignT, merging is stricter)
  constructor({ embed, name, assignT = 0.5, mergeT = 0.62, reducerVersion = "toy/v0" }) {
    this.embed = embed;
    this.name = name;
    this.assignT = assignT;
    this.mergeT = mergeT;
    this.reducerVersion = reducerVersion;   // a label's vec is derived; this is its constitution_sha
    this.labels = [];                       // { id, name, vec, members:[text], aliases:[name] }
    this._n = 0;
  }

  async _mint(text) {
    const name = this.name(text);
    const l = { id: ++this._n, name, vec: await this.embed(name), members: [], aliases: [] };
    this.labels.push(l);
    return l;
  }

  // Assign an utterance to every label it clears assignT for (multi-label); mint if none.
  async assign(text) {
    const v = await this.embed(text);
    let hits = this.labels
      .map((l) => [l, cos(v, l.vec)])
      .filter(([, s]) => s >= this.assignT)
      .sort((a, b) => b[1] - a[1])
      .map(([l]) => l);
    if (!hits.length) hits = [await this._mint(text)];
    for (const l of hits) l.members.push(text);
    return hits;
  }

  // Merge-only ratchet to a fixpoint. Compares label NAMES (their stored vecs), never
  // re-embeds members, so it is cheap and deterministic. Returns the number of merges.
  ratchet() {
    let merges = 0;
    for (;;) {
      let did = false;
      outer:
      for (let i = 0; i < this.labels.length; i++) {
        for (let j = i + 1; j < this.labels.length; j++) {
          if (cos(this.labels[i].vec, this.labels[j].vec) >= this.mergeT) {
            const A = this.labels[i], B = this.labels[j];   // keep the earlier as canonical
            A.members.push(...B.members);                    // one way: B folds into A
            A.aliases.push(B.name, ...B.aliases);
            this.labels.splice(j, 1);
            merges++; did = true;
            break outer;
          }
        }
      }
      if (!did) break;        // fixpoint: no pair within mergeT remains
    }
    return merges;
  }

  // Coarse, publishable view: each label, how many utterances collided on it, its aliases.
  // (Real gatherer-count is DISTINCT TRUSTED SIGNERS per label — see §C/§M — not raw count.)
  summary() {
    return this.labels
      .map((l) => ({ name: l.name, count: l.members.length, aliases: l.aliases }))
      .sort((a, b) => b.count - a.count);
  }
}

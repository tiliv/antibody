// Embedders for the Anecdote reducer. The reducer treats `embed` as a pluggable, possibly
// async instrument. Two are provided:
//
//   toyEmbed     — a deterministic, dependency-free bag-of-content-words embedder. It makes
//                  token-overlap into cosine similarity, which is enough to PROVE the
//                  assign/collide/merge LOGIC offline. It does NOT understand synonymy — that
//                  is the real model's job. "Does the algorithm converge" and "does the model
//                  load" are deliberately two separate problems.
//   makeMiniLmEmbed — the real seam: transformers.js + all-MiniLM, on-device, NPM-shipped.
//                  The singular instrument, supplied as one pinned package (§O).

const STOP = new Set(
  ("a an the is are was were be been being am of at in on to into onto from this that these those" +
   " there here it its your you i we they he she for and or but with as by have has had do does did" +
   " not no yes can could would should will just very really my our their his her").split(/\s+/)
);

// Content tokens: lowercased, punctuation-stripped, stopwords removed.
export function content(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w && !STOP.has(w));
}

// fewest-verbs naming, v0 heuristic: content words, de-duplicated, in order — the simplest
// noun-ish phrase we can get without a generative model. v1 swaps in the small LLM here.
export function fewestVerbs(text) {
  const seen = new Set(), out = [];
  for (const w of content(text)) if (!seen.has(w)) { seen.add(w); out.push(w); }
  return out.join(" ") || text.trim().toLowerCase();
}

const D = 256;
function fnv(s) {                          // tiny deterministic hash -> dimension index
  let x = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); }
  return x >>> 0;
}

// Deterministic toy embedding: L2-normalized bag of hashed content words.
export function toyEmbed(text) {
  const v = new Float64Array(D);
  for (const w of content(text)) v[fnv(w) % D] += 1;
  let n = 0; for (let i = 0; i < D; i++) n += v[i] * v[i];
  n = Math.sqrt(n) || 1;
  for (let i = 0; i < D; i++) v[i] /= n;
  return v;
}

// Real on-device embedder. Requires `npm i @xenova/transformers`; downloads the model once.
//   const embed = await makeMiniLmEmbed();
//   new Reducer({ embed, name: fewestVerbs, reducerVersion: "Xenova/all-MiniLM-L6-v2" })
export async function makeMiniLmEmbed(model = "Xenova/all-MiniLM-L6-v2") {
  const { pipeline } = await import("@xenova/transformers");
  const extract = await pipeline("feature-extraction", model);
  return async (text) => {
    const out = await extract(text, { pooling: "mean", normalize: true });
    return Float64Array.from(out.data);   // already unit length
  };
}

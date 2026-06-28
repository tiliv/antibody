// Demo: two independent gatherers reduce locally, then their label sets are unioned and
// the merge-only ratchet collapses the duplicates — which is the aggregate-by-question
// collision from §C/§N, with a trust-weighted gatherer count falling out for free.
//
//   node prototype/reducer/demo.mjs
//
// Uses the dependency-free toy embedder (token overlap -> cosine). It proves the
// assign/collide/merge LOGIC; it cannot see synonymy — that's MiniLM's job. Watch for the
// honest miss at the end.

import { Reducer } from "./reducer.mjs";
import { toyEmbed, fewestVerbs } from "./embedders.mjs";

async function gather(tag, utterances) {
  const r = new Reducer({ embed: toyEmbed, name: fewestVerbs });
  for (const u of utterances) await r.assign(u);
  for (const l of r.labels) l.members = l.members.map((text) => ({ g: tag, text })); // attribute
  return r;
}

const A = await gather("atlas-A", [
  "Is there shade at this park?",
  "The park has good shade today",
  "Dewey decimal numbers on this shelf",
]);
const B = await gather("atlas-B", [
  "park shade?",
  "dewey numbers on this shelf",
  "the library catalog codes here",
]);

const show = (r, h) => {
  console.log(`\n${h}`);
  for (const l of r.labels) {
    const gs = [...new Set(l.members.map((m) => m.g))].sort();
    console.log(`  • ${l.name.padEnd(28)} count=${l.members.length} gatherers=${gs.length} [${gs}]` +
      (l.aliases.length ? `  aliases: ${l.aliases.join(", ")}` : ""));
  }
};

show(A, "atlas-A reduced locally:");
show(B, "atlas-B reduced locally:");

// Union the two label sets into one reducer and ratchet to a fixpoint.
const U = new Reducer({ embed: toyEmbed, name: fewestVerbs });
U.labels = [...A.labels.map((l) => ({ ...l })), ...B.labels.map((l) => ({ ...l }))];
console.log(`\nunion before ratchet: ${U.labels.length} labels`);
const merges = U.ratchet();
console.log(`ratchet merged ${merges} time(s) -> ${U.labels.length} labels`);
const again = U.ratchet();
console.log(`re-ratchet (should be 0, i.e. fixpoint): ${again}`);
show(U, "collided aggregate (label, collisions, INDEPENDENT gatherers):");

console.log(
  "\nhonest miss: 'library catalog codes' did NOT merge with the Dewey label — same meaning,\n" +
  "no shared tokens, so the toy can't see it. That synonymy is exactly what MiniLM resolves."
);

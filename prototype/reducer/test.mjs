// Tests for the merge-only reducer core. Dependency-free (toy embedder), deterministic.
//   node prototype/reducer/test.mjs
import { Reducer, cos } from "./reducer.mjs";
import { toyEmbed, fewestVerbs } from "./embedders.mjs";

let fails = 0;
const ok = (c, m) => { if (!c) { console.error("FAIL: " + m); fails++; } else console.log("  ok: " + m); };

const mk = () => new Reducer({ embed: toyEmbed, name: fewestVerbs });
async function reduce(r, us) { for (const u of us) await r.assign(u); return r; }

// 1. Collision: same-meaning utterances land on one label (not three).
{
  const r = await reduce(mk(), ["shade at this park", "the park has shade", "lots of shade in the park"]);
  ok(r.labels.length === 1, "three shade/park utterances collide onto one label");
  ok(r.labels[0].members.length === 3, "all three are recorded on it");
}

// 2. Distinct meanings stay distinct.
{
  const r = await reduce(mk(), ["shade at the park", "dewey decimal numbers on the shelf"]);
  ok(r.labels.length === 2, "unrelated utterances mint separate labels");
}

// 3. Merge-only ratchet: a union of independently-minted, overlapping labels collapses,
//    reaches a fixpoint, loses no members, and is monotone in label count.
{
  const a = await reduce(mk(), ["shade at this park", "dewey decimal numbers on this shelf"]);
  const b = await reduce(mk(), ["park shade", "dewey numbers on this shelf", "library catalog codes"]);
  const u = mk();
  u.labels = [...a.labels.map((l) => ({ ...l })), ...b.labels.map((l) => ({ ...l }))];
  const before = u.labels.length;
  const beforeMembers = u.labels.reduce((n, l) => n + l.members.length, 0);
  const merges = u.ratchet();
  const afterMembers = u.labels.reduce((n, l) => n + l.members.length, 0);
  ok(before === 5, "union starts with 5 independently-minted labels");
  ok(merges >= 2, "ratchet performs at least two merges");
  ok(u.labels.length < before, "label count is monotone-down after the ratchet");
  ok(u.ratchet() === 0, "re-running the ratchet is a no-op (fixpoint reached, no reversal)");
  ok(afterMembers === beforeMembers, "no members lost in merging (one-way fold)");
  ok(u.labels.some((l) => l.aliases.length > 0), "merged labels carry their folded aliases");
}

// 4. Determinism: same inputs, same label set, every run (pinned toy embedder).
{
  const us = ["shade at the park", "park shade", "dewey numbers on the shelf"];
  const s1 = (await reduce(mk(), us)).summary();
  const s2 = (await reduce(mk(), us)).summary();
  ok(JSON.stringify(s1) === JSON.stringify(s2), "reduction is deterministic for a pinned embedder");
}

// 5. Sanity: cos of a unit vector with itself is ~1.
ok(Math.abs(cos(toyEmbed("park shade"), toyEmbed("shade park")) - 1) < 1e-9,
  "bag-of-words is order-independent: 'park shade' == 'shade park'");

console.log(fails ? `\n${fails} FAILED` : "\nreducer: all tests passed");
process.exit(fails ? 1 : 0);

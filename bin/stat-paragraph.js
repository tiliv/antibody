#!/usr/bin/env node
// NOTICE: Vibe code: collating deep diff details without platform tooling

const fs = require('fs');

const chunks = fs.readFileSync(0, 'utf8').split('\n');
let fileMeta = null;
const paras = {};

let cur = null, buf = [];
function flushPara() {
  if (!cur) return;
  const text = buf.join('\n');
  const commits = [];
  // Split by commits: we emitted headers as \0-separated fields before each patch
  // Scan lines; when we hit a 3-field header line, start a new commit.
  const lines = text.split('\n');
  let c = null;
  for (let i=0;i<lines.length;i++) {
    const L = lines[i];
    if (/^[0-9a-f]{7,40}\0/.test(L)) {
      if (c) commits.push(c);
      const [sha, author, date, subj, rest] = L.split('\0');
      c = {sha, author, date, subject: subj, hunks: []};
      continue;
    }
    const m = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(L);
    if (m) {
      c.hunks.push({ a:[+m[1], +(m[2]||1)], b:[+m[3], +(m[4]||1)], ops: [] });
      continue;
    }
    if (c && (L.startsWith(' ') || L.startsWith('+') || L.startsWith('-'))) {
      const op = L[0];
      // Skip file headers like '--- a/...' '+++ b/...'
      if ((op==='-' && L.startsWith('--- ')) || (op==='+' && L.startsWith('+++ '))) continue;
      c.hunks[c.hunks.length-1]?.ops.push([op, L.slice(1)]);
    }
  }
  if (c) commits.push(c);
  const origin = commits.length ? commits[commits.length-1].sha : null;
  paras[String(cur.para).padStart(3,'0')] = { range: cur.range, origin, history: commits };
  cur = null; buf = [];
}

for (const line of chunks) {
  if (!fileMeta) {
    const m = line && JSON.parse(line);
    if (m && m.file) { fileMeta = m; continue; }
  }
  if (line === '---ENDPARA---') { flushPara(); continue; }
  if (!cur) {
    if (!line.trim()) continue;
    cur = JSON.parse(line); // {"para":..,"range":[s,e]}
    continue;
  }
  buf.push(line);
}

const out = {
  path: fileMeta.file,
  generated_at: new Date().toISOString(),
  build_head: fileMeta.head,
  paras
};
process.stdout.write(JSON.stringify(out));

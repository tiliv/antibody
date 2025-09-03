#!/usr/bin/env node
/* usage: node scripts/git_page_stats.js journal/foo/index.md */
const { execSync } = require("node:child_process");
const { readFileSync } = require("node:fs");

const path = process.argv[2];
if (!path) { console.error("path required"); process.exit(1); }

function sh(cmd) { return execSync(cmd, { encoding: "utf8" }).trim(); }

// Collect commits touching the path (follow renames), with numstat.
const raw = sh(`git log --follow --date=iso-strict --pretty=format:"--%n%H|%ad|%an|%s" --numstat -- "${path}"`);

const lines = raw.split("\n");
let commits = [];
let cur = null;
for (const line of lines) {
  if (line.startsWith("--")) {
    if (cur) commits.push(cur);
    cur = { add:0, del:0 };
    continue;
  }
  if (!cur) continue;
  if (line.includes("|") && !/^\d/.test(line)) {
    const [hash, ts, author, msg] = line.split("|");
    cur.hash = hash; cur.ts = ts; cur.author = author; cur.msg = msg;
  } else if (/^\d+|\-/.test(line)) {
    const [a, d, f] = line.split("\t");
    const add = a === "-" ? 0 : parseInt(a,10);
    const del = d === "-" ? 0 : parseInt(d,10);
    cur.add += (isNaN(add)?0:add);
    cur.del += (isNaN(del)?0:del);
  }
}
if (cur) commits.push(cur);

// Compute delta & ISO week.
function isoWeek(ts) {
  const d = new Date(ts);
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(),0,4));
  const week = 1 + Math.round(((date - firstThursday) / 86400000 - 3 + ((firstThursday.getUTCDay()+6)%7)) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2,"0")}`;
}

commits = commits
  .filter(c => c.hash && c.ts)
  .map(c => ({...c, delta: c.add + c.del, week: isoWeek(c.ts)}))
  .sort((a,b)=> new Date(a.ts)-new Date(b.ts));

const deltas = commits.map(c=>c.delta).sort((a,b)=>a-b);
const p = q => {
  if (deltas.length===0) return 1;
  const idx = Math.floor((deltas.length-1)*q);
  return Math.max(1, deltas[idx]);
};
const p95 = p(0.95);

// gaps & streaks
const GAP_WEEKS = parseInt(process.env.GAP_WEEKS||"4",10);
const gaps = [];
const streaks = [];
let streakStart = 0;
for (let i=1;i<commits.length;i++){
  const t0 = new Date(commits[i-1].ts), t1 = new Date(commits[i].ts);
  const days = (t1 - t0)/86400000;
  if (days > GAP_WEEKS*7) {
    gaps.push({start_ts: commits[i-1].ts, end_ts: commits[i].ts, days: Math.round(days)});
    // close streak
    const seg = commits.slice(streakStart, i);
    streaks.push({
      start_ts: seg[0].ts, end_ts: seg[seg.length-1].ts,
      commits: seg.length, sum_delta: seg.reduce((s,c)=>s+c.delta,0)
    });
    streakStart = i;
  }
}
if (commits.length) {
  const seg = commits.slice(streakStart);
  streaks.push({
    start_ts: seg[0].ts, end_ts: seg[seg.length-1].ts,
    commits: seg.length, sum_delta: seg.reduce((s,c)=>s+c.delta,0)
  });
}

// weekly histogram
const bins = new Map();
for (const c of commits) {
  const b = bins.get(c.week) || { week: c.week, commits:0, delta:0 };
  b.commits++; b.delta += c.delta; bins.set(c.week, b);
}
const weeks = Array.from(bins.values()).sort((a,b)=>a.week.localeCompare(b.week));
const mostRecentIdx = weeks.length-1;
const HALF_LIFE = parseInt(process.env.HALF_LIFE_WEEKS||"8",10);
const LN2 = Math.log(2);
weeks.forEach((w,i)=>{
  const age = (mostRecentIdx - i);
  const weight = Math.exp(-LN2 * age / HALF_LIFE);
  w.density = +(weight * w.commits).toFixed(4);
});

// dot normalization
const dot = x => {
  const v = x / p95;
  const clamped = Math.max(0.08, Math.min(1, v));
  return +clamped.toFixed(3);
};
const commitsOut = commits.map(c=>({
  hash: c.hash.slice(0,7),
  ts: c.ts,
  author: c.author,
  msg: c.msg,
  add: c.add, del: c.del, delta: c.delta,
  week: c.week,
  dot: dot(c.delta)
}));

// meaningful last-updated
const MIN_MEANINGFUL = parseInt(process.env.MIN_MEANINGFUL_DELTA||"8",10);
const IGNORE_RE = /\b(chore|typo|format|whitespace|prettier|toc|lint|link fix)\b/i;
const meaningful = [...commits].reverse().find(c =>
  c.delta >= MIN_MEANINGFUL && !IGNORE_RE.test(c.msg||"") && !/\[bot\]/i.test(c.author||"")
);

const out = {
  page: "/" + path.replace(/index\.(md|html)$/,""),
  source_path: path,
  generated_at: new Date().toISOString(),
  params: {
    min_meaningful_delta: MIN_MEANINGFUL,
    gap_threshold_weeks: GAP_WEEKS,
    half_life_weeks: HALF_LIFE
  },
  summary: {
    total_commits: commits.length,
    total_delta: commits.reduce((s,c)=>s+c.delta,0),
    first_commit: commits[0]?.ts || null,
    last_commit: commits[commits.length-1]?.ts || null,
    last_meaningful: meaningful?.ts || null,
    median_gap_days: (()=> {
      const ds=[]; for (let i=1;i<commits.length;i++) ds.push((new Date(commits[i].ts)-new Date(commits[i-1].ts))/86400000);
      ds.sort((a,b)=>a-b); const m=Math.floor(ds.length/2);
      return ds.length? +(ds.length%2? ds[m] : (ds[m-1]+ds[m])/2).toFixed(1) : 0;
    })()
  },
  commits: commitsOut,
  gaps,
  streaks,
  histogram_weekly: weeks,
  scales: { dot_delta_min: deltas[0]||1, dot_delta_p95: p95, clamp_hi_count: 6 }
};

process.stdout.write(JSON.stringify(out, null, 2));

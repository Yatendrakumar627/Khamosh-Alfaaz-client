/**
 * dead-code-summary.mjs — produces the final, verified dead-code report.
 * Conservative: an export is only reported when it is BOTH
 *   (a) never imported by another module, and
 *   (b) never referenced inside its own module (beyond its declaration).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CLIENT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(CLIENT, 'src');

const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(js|jsx)$/.test(e.name)) files.push(p);
  }
})(SRC);

const rel = (p) => path.relative(CLIENT, p).replace(/\\/g, '/');
const src = new Map(files.map((f) => [f, fs.readFileSync(f, 'utf8')]));

const resolve = (from, spec) => {
  if (!spec.startsWith('.')) return null;
  const base = path.resolve(path.dirname(from), spec);
  for (const c of [base, base + '.js', base + '.jsx', path.join(base, 'index.js'), path.join(base, 'index.jsx')]) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
};

/* edges + imported names */
const edges = new Map();
const imported = new Map(); // "file::name" -> true
const addEdge = (a, b) => { if (!edges.has(a)) edges.set(a, new Set()); edges.get(a).add(b); };
const mark = (f, n) => imported.set(`${f}::${n}`, true);

for (const f of files) {
  const s = src.get(f);
  let m;
  const reFrom = /(?:import|export)\s+([\s\S]*?)\s+from\s*['"]([^'"]+)['"]/g;
  while ((m = reFrom.exec(s))) {
    const to = resolve(f, m[2]);
    if (!to) continue;
    addEdge(f, to);
    const clause = m[1];
    if (/\*\s+as\s+\w+/.test(clause)) { mark(to, '*'); continue; }
    const named = clause.match(/\{([\s\S]*)\}/);
    if (named) for (const p of named[1].split(',')) { const n = p.trim().split(/\s+as\s+/)[0].trim(); if (n) mark(to, n); }
    const def = clause.replace(/\{[\s\S]*\}/, '').trim().replace(/,$/, '');
    if (def && !def.startsWith('*')) mark(to, 'default');
  }
  const reDyn = /import\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((m = reDyn.exec(s))) { const to = resolve(f, m[1]); if (to) addEdge(f, to); }
  const reLazy = /import\(\s*['"]([^'"]+)['"]\s*\)\s*\.then\(\s*(?:m|mod)\s*=>\s*\(\?\s*\{\s*default:\s*(?:m|mod)\.(\w+)/g;
  while ((m = reLazy.exec(s))) { const to = resolve(f, m[1]); if (to) mark(to, m[2]); }
}

/* reachability from main.jsx */
const reach = new Set();
const st = [path.join(SRC, 'main.jsx')];
while (st.length) { const f = st.pop(); if (reach.has(f)) continue; reach.add(f); for (const d of edges.get(f) || []) st.push(d); }

/* per-file export names */
function exportNames(f) {
  const s = src.get(f);
  const out = new Set();
  let m;
  const re1 = /export\s+(?:async\s+)?(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g;
  while ((m = re1.exec(s))) out.add(m[1]);
  const re2 = /export\s*\{([^}]*)\}/g;
  while ((m = re2.exec(s))) for (const p of m[1].split(',')) { const n = p.trim().split(/\s+as\s+/).pop().trim(); if (n && n !== 'default') out.add(n); }
  return out;
}

function countInOwnFile(f, name) {
  const s = src.get(f);
  // count word occurrences, excluding each export/declaration line
  const lines = s.split('\n');
  let n = 0;
  for (const line of lines) {
    if (/\bexport\b/.test(line) && new RegExp(`\\b${name}\\b`).test(line)) continue; // declaration line
    if (new RegExp(`\\b${name}\\b`).test(line)) n++;
  }
  return n;
}

console.log('\n########## DEAD FILES (unreachable from main.jsx) ##########');
for (const f of files) {
  if (reach.has(f)) continue;
  const usedByTest = files.filter((t) => /\.test\.js$/.test(t) && (edges.get(t) || new Set()).has(f));
  console.log(`${usedByTest.length ? '[test-only] ' : '[DEAD]      '} ${rel(f)}`);
}

console.log('\n########## TRULY UNUSED EXPORTS ##########');
for (const f of files) {
  if (!reach.has(f)) continue;
  const names = exportNames(f);
  const isBarrel = /index\.(js|jsx)$/.test(f);
  for (const n of names) {
    if (imported.get(`${f}::${n}`)) continue;          // imported elsewhere
    if (countInOwnFile(f, n) > 0) continue;             // used inside own module
    if (isBarrel) continue;                             // barrel: checked via its consumers
    console.log(`  ${rel(f).padEnd(52)} -> ${n}`);
  }
}

console.log('\n########## UNUSED DEFAULT EXPORTS (declared but never imported) ##########');
for (const f of files) {
  if (!reach.has(f)) continue;
  if (!/export\s+default/.test(src.get(f))) continue;
  if (imported.get(`${f}::default`)) continue;
  console.log(`  ${rel(f)}`);
}

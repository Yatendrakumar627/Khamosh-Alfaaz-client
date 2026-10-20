/**
 * dead-code-audit.mjs — static dead file/export/dependency audit for the client.
 * Run: node scripts/dead-code-audit.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CLIENT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(CLIENT, 'src');

const allJs = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(js|jsx)$/.test(e.name)) allJs.push(p);
  }
})(SRC);

const rel = (p) => path.relative(CLIENT, p).replace(/\\/g, '/');
const code = allJs.filter((p) => !/\.test\.js$/.test(p));
const tests = allJs.filter((p) => /\.test\.js$/.test(p));
const contents = new Map(allJs.map((p) => [p, fs.readFileSync(p, 'utf8')]));

/* ---------- module resolution ---------- */
function resolveSpec(fromFile, spec) {
  if (!spec.startsWith('.')) return null; // package
  let base = path.resolve(path.dirname(fromFile), spec);
  for (const cand of [base, base + '.js', base + '.jsx', path.join(base, 'index.js'), path.join(base, 'index.jsx')]) {
    if (fs.existsSync(cand) && fs.statSync(cand).isFile()) return cand;
  }
  return null;
}

/* ---------- extract edges + import-name usage ---------- */
// edges: from -> Set(to). nameUsage: "to::name" -> Set(from)
const edges = new Map();
const nameUsage = new Map();
const addEdge = (from, to) => {
  if (!edges.has(from)) edges.set(from, new Set());
  edges.get(from).add(to);
};
const addUse = (mod, name, from) => {
  const k = `${mod}::${name}`;
  if (!nameUsage.has(k)) nameUsage.set(k, new Set());
  nameUsage.get(k).add(from);
};

const IMPORT_RE = /(?:^|\n)\s*(?:import\s+([\s\S]*?)\s+from\s*|export\s+([\s\S]*?)\s+from\s*)['"]([^'"]+)['"]/g;
const DYN_RE = /import\(\s*['"]([^'"]+)['"]\s*\)/g;

for (const file of [...code, ...tests]) {
  const src = contents.get(file);
  let m;
  IMPORT_RE.lastIndex = 0;
  while ((m = IMPORT_RE.exec(src))) {
    const clause = (m[1] || m[2] || '').trim();
    const to = resolveSpec(file, m[3]);
    if (!to) continue;
    addEdge(file, to);
    // namespace import -> everything used (conservative)
    if (/^\*\s+as\s+\w+/.test(clause)) { addUse(to, '*', file); continue; }
    // named imports
    const named = clause.match(/\{([\s\S]*)\}/);
    if (named) {
      for (const part of named[1].split(',')) {
        const name = part.trim().split(/\s+as\s+/)[0].trim();
        if (name) addUse(to, name, file);
      }
    }
    // default import
    const def = clause.replace(/\{[\s\S]*\}/, '').replace(/^\*\s+as\s+\w+/, '').trim().replace(/,$/, '');
    if (def && !def.startsWith('{')) addUse(to, 'default', file);
  }
  DYN_RE.lastIndex = 0;
  while ((m = DYN_RE.exec(src))) {
    const to = resolveSpec(file, m[1]);
    if (to) addEdge(file, to);
  }
}

// handle lazy() name access properly: import('./x').then(m => ({ default: m.NAME }))
for (const file of [...code, ...tests]) {
  const src = contents.get(file);
  const re = /import\(\s*['"]([^'"]+)['"]\s*\)\s*\.then\(\s*(?:m|mod)\s*=>\s*\(\?\s*\{\s*default:\s*(?:m|mod)\.(\w+)/g;
  let m;
  while ((m = re.exec(src))) {
    const to = resolveSpec(file, m[1]);
    if (to) addUse(to, m[2], file);
  }
}

/* ---------- reachability from main.jsx ---------- */
const entry = path.join(SRC, 'main.jsx');
const reachable = new Set();
const stack = [entry];
while (stack.length) {
  const f = stack.pop();
  if (reachable.has(f)) continue;
  reachable.add(f);
  for (const dep of edges.get(f) || []) if (!reachable.has(dep)) stack.push(dep);
}

/* ---------- exported names per module ---------- */
const moduleExports = new Map(allJs.map((f) => [f, exportsOf(f)]));
function exportsOf(file) {
  const src = contents.get(file);
  const names = new Set();
  let m;
  const re1 = /export\s+(?:async\s+)?(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g;
  while ((m = re1.exec(src))) names.add(m[1]);
  const re2 = /export\s*\{([^}]*)\}/g;
  while ((m = re2.exec(src))) {
    for (const part of m[1].split(',')) {
      const nm = part.trim().split(/\s+as\s+/).pop().trim();
      if (nm && nm !== 'default') names.add(nm);
    }
  }
  if (/export\s+default/.test(src)) names.add('default');
  return names;
}

/* ---------- fixpoint: which (module, name) are truly used ---------- */
const used = new Set([...nameUsage.keys()]);
let changed = true;
while (changed) {
  changed = false;
  for (const [file, names] of moduleExports) {
    for (const name of names) {
      const k = `${file}::${name}`;
      if (used.has(k)) continue;
      if (nameUsage.has(k)) { used.add(k); changed = true; continue; }
      // barrel re-export: file re-exports name from dep -> used if dep::name used
      const src = contents.get(file);
      const re = new RegExp(`export\\s*(?:\\{[^}]*\\b${name}\\b[^}]*\\}|\\b${name}\\b)\\s*from\\s*['"]([^'"]+)['"]`);
      const m = src.match(re);
      if (m) {
        const dep = resolveSpec(file, m[1]);
        if (dep && used.has(`${dep}::${name}`)) { used.add(k); changed = true; }
      }
    }
  }
}

/* ---------- report ---------- */
console.log('\n================ 1. UNREACHABLE FILES (dead files) ================');
const deadFiles = code.filter((f) => !reachable.has(f));
const testOnly = [];
for (const f of deadFiles) {
  const usedByTests = tests.some((t) => (edges.get(t) || new Set()).has(f));
  console.log((usedByTests ? 'TEST-ONLY  ' : 'DEAD       ') + rel(f));
  if (usedByTests) testOnly.push(f);
}

console.log('\n================ 2. UNUSED EXPORTS ================');
for (const file of code) {
  if (!reachable.has(file)) continue;
  const names = moduleExports.get(file);
  if (!names || !names.size) continue;
  const unused = [...names].filter((n) => !used.has(`${file}::${n}`));
  if (unused.length) console.log(`${rel(file)}:\n    ${unused.join(', ')}`);
}

console.log('\n================ 3. UNUSED PACKAGE DEPENDENCIES ================');
const pkg = JSON.parse(fs.readFileSync(path.join(CLIENT, 'package.json'), 'utf8'));
const scanFiles = [...allJs, path.join(CLIENT, 'vite.config.js')].filter((f) => fs.existsSync(f));
const allSrcText = scanFiles.map((f) => contents.get(f) || fs.readFileSync(f, 'utf8')).join('\n');
for (const [depName, ver] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) {
  const re = new RegExp(`['"]${depName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(/[^'"]*)?['"]`);
  if (!re.test(allSrcText)) console.log(`DEAD DEP   ${depName} (${ver})`);
}

console.log('\n================ 4. COMMENTED-OUT CODE BLOCKS ================');
for (const file of code) {
  const lines = contents.get(file).split('\n');
  let runStart = -1;
  let runLen = 0;
  const flush = (end) => {
    if (runLen >= 4) console.log(`${rel(file)}:${runStart + 1}-${end}  (${runLen} commented lines)`);
    runStart = -1; runLen = 0;
  };
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    const isCodeComment = /^\/\/\s*\S/.test(t) && /[=<>{}();]|import |const |return |function |className/.test(t);
    if (isCodeComment) { if (runStart === -1) runStart = i; runLen++; }
    else if (t === '' || /^\/\*/.test(t) || /^\*/.test(t)) { /* allow blanks/doc comments inside run */ }
    else flush(i);
  }
  flush(lines.length);
}

console.log('\n================ 5. UNUSED REACT DEFAULT IMPORTS ================');
for (const file of code) {
  const src = contents.get(file);
  const m = src.match(/import\s+React\s*(?:,\s*\{[^}]*\})?\s*from\s*['"]react['"]/);
  if (m && !/\bReact\s*\./.test(src.replace(m[0], '')) && !/\bReact\b(?!\s*[,.])/.test(src.slice(src.indexOf(m[0]) + m[0].length))) {
    console.log(rel(file));
  }
}

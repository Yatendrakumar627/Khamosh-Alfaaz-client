/**
 * split-styles.mjs
 * ------------------------------------------------------------------
 * One-shot refactor tool: splits the monolithic src/assets/global.css
 * into name-wise CSS files under src/styles/, mirroring the source
 * structure (pages / components/<area> / layouts).
 *
 * How ownership is decided:
 *   1. Every className token used in a .jsx file (pages, components,
 *      layouts) is recorded per file.
 *   2. For every CSS rule, the class tokens in its selectors are
 *      looked up. If all "specific" tokens belong to one single file,
 *      the rule moves to that file's stylesheet. Shared/unknown tokens
 *      (used by many files or nowhere) are neutral -> the rule stays
 *      in global.css.
 *   3. @media blocks are unpacked rule-by-rule with the same logic and
 *      re-wrapped in the target file (only consecutive same-query runs
 *      are merged, so original ordering is preserved exactly).
 *
 * The script validates that every original selector is emitted
 * somewhere before writing anything.
 * ------------------------------------------------------------------
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CLIENT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(CLIENT, 'src');
const GLOBAL_CSS = path.join(SRC, 'assets', 'global.css');
const STYLES_DIR = path.join(SRC, 'styles');
const DRY_RUN = process.argv.includes('--dry');

/* ------------------------------------------------------------------ */
/* 1. Collect class tokens per source file                             */
/* ------------------------------------------------------------------ */

const TARGET_DIRS = [
  path.join(SRC, 'pages'),
  path.join(SRC, 'components'),
  path.join(SRC, 'layouts'),
];

const IDENT = /^-?[A-Za-z_][A-Za-z0-9_-]*$/;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.jsx')) out.push(full);
  }
  return out;
}

function addWords(set, str) {
  for (const w of str.split(/[\s,{}]+/)) {
    const t = w.trim();
    if (t && IDENT.test(t)) set.add(t);
  }
}

/** Extract className tokens from a JSX source string. */
function extractTokens(code) {
  const tokens = new Set();
  const recordExpr = (expr, depth = 0) => {
    if (depth > 3) return;
    const strRe = /`[^`]*`|"[^"]*"|'[^']*'/g;
    let m;
    while ((m = strRe.exec(expr))) {
      const raw = m[0];
      const quote = raw[0];
      const content = raw.slice(1, -1);
      if (quote === '`' && content.includes('${')) {
        const parts = content.split(/\$\{/);
        addWords(tokens, parts[0]);
        for (let i = 1; i < parts.length; i++) {
          const close = parts[i].indexOf('}');
          if (close === -1) {
            addWords(tokens, parts[i]);
          } else {
            recordExpr(parts[i].slice(0, close), depth + 1);
            addWords(tokens, parts[i].slice(close + 1));
          }
        }
      } else {
        addWords(tokens, content);
      }
    }
  };

  // className="..." / className='...'
  const plainRe = /className\s*=\s*(?!\{)\s*(["'])((?:\\.|(?!\1)[^\\])*)\1/g;
  let m;
  while ((m = plainRe.exec(code))) addWords(tokens, m[2]);

  // className={ ... }  (balanced braces, strings respected)
  const exprRe = /className\s*=\s*\{/g;
  while ((m = exprRe.exec(code))) {
    let i = m.index + m[0].length;
    let depth = 1;
    while (i < code.length && depth > 0) {
      const ch = code[i];
      if (ch === '/' && code[i + 1] === '*') {
        const e = code.indexOf('*/', i + 2);
        i = e === -1 ? code.length : e + 2;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') {
        const q = ch;
        i++;
        while (i < code.length) {
          if (code[i] === '\\') { i += 2; continue; }
          if (code[i] === q) { i++; break; }
          i++;
        }
        continue;
      }
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
      i++;
    }
    recordExpr(code.slice(m.index + m[0].length, i - 1));
  }
  return tokens;
}

const targets = []; // { rel, cssRel, cssPath, tokens:Set, minOrder:Infinity, rules:0 }
const tokenOwner = new Map(); // token -> Set(rel)

for (const dir of TARGET_DIRS) {
  if (!fs.existsSync(dir)) continue;
  for (const file of walk(dir)) {
    if (path.basename(file) === 'index.js') continue;
    const rel = path.relative(SRC, file).replace(/\\/g, '/').replace(/\.jsx$/, '');
    const tokens = extractTokens(fs.readFileSync(file, 'utf8'));
    // styles mirror the src layout: pages/Dashboard -> styles/pages/Dashboard.css
    const cssRel = `styles/${rel}.css`;
    targets.push({ rel, cssRel, cssPath: path.join(SRC, cssRel), tokens, minOrder: Infinity, rules: 0 });
    for (const t of tokens) {
      if (!tokenOwner.has(t)) tokenOwner.set(t, new Set());
      tokenOwner.get(t).add(rel);
    }
  }
}

const targetByRel = new Map(targets.map((t) => [t.rel, t]));

/* ------------------------------------------------------------------ */
/* 2. CSS tokenizer                                                    */
/* ------------------------------------------------------------------ */

function skipString(css, i) {
  const q = css[i];
  i++;
  while (i < css.length) {
    if (css[i] === '\\') { i += 2; continue; }
    if (css[i] === q) return i + 1;
    i++;
  }
  return i;
}
function skipComment(css, i) {
  const e = css.indexOf('*/', i + 2);
  return e === -1 ? css.length : e + 2;
}
function matchBrace(css, open) {
  let depth = 0;
  let i = open;
  while (i < css.length) {
    const ch = css[i];
    if (ch === '/' && css[i + 1] === '*') { i = skipComment(css, i); continue; }
    if (ch === '"' || ch === "'") { i = skipString(css, i); continue; }
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) return i; }
    i++;
  }
  return -1;
}
function firstContentIndex(raw) {
  let i = 0;
  while (i < raw.length) {
    const ch = raw[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (ch === '/' && raw[i + 1] === '*') { i = skipComment(raw, i); continue; }
    break;
  }
  return i;
}

/** Split CSS text into top-level units: {type:'comment'|'block', ...} */
function splitTopLevel(css) {
  const units = [];
  let unitStart = 0;
  let i = 0;
  while (i < css.length) {
    const ch = css[i];
    if (ch === '/' && css[i + 1] === '*') { i = skipComment(css, i); continue; }
    if (ch === '"' || ch === "'") { i = skipString(css, i); continue; }
    if (ch === '}') throw new Error(`Unbalanced } at ${i}`);
    if (ch === ';' ) {
      units.push({ type: 'block', prelude: css.slice(unitStart, i + 1), body: null });
      unitStart = i = i + 1;
      continue;
    }
    if (ch === '{') {
      const close = matchBrace(css, i);
      if (close === -1) throw new Error(`Unbalanced { at ${i}`);
      const preludeRaw = css.slice(unitStart, i);
      const preStart = firstContentIndex(preludeRaw);
      if (preStart > 0) units.push({ type: 'comment', text: preludeRaw.slice(0, preStart) });
      units.push({
        type: 'block',
        prelude: preludeRaw.slice(preStart),
        body: css.slice(i + 1, close),
      });
      unitStart = i = close + 1;
      continue;
    }
    i++;
  }
  const tail = css.slice(unitStart);
  if (tail.trim()) units.push({ type: 'comment', text: tail });
  return units;
}

/* ------------------------------------------------------------------ */
/* 3. Selector helpers                                                 */
/* ------------------------------------------------------------------ */

function stripComments(s) {
  return s.replace(/\/\*[\s\S]*?\*\//g, ' ');
}

function stripStrings(sel) {
  return sel.replace(/"[^"]*"|'[^']*'/g, '""');
}
function extractClassTokens(sel) {
  const out = [];
  const re = /\.(-?[A-Za-z_][A-Za-z0-9_-]*)/g;
  let m;
  const clean = stripStrings(sel);
  while ((m = re.exec(clean))) out.push(m[1]);
  return out;
}
function splitSelectors(prelude) {
  const parts = [];
  let depth = 0;
  let cur = '';
  for (let i = 0; i < prelude.length; i++) {
    const ch = prelude[i];
    if (ch === '/' && prelude[i + 1] === '*') { const e = skipComment(prelude, i); cur += prelude.slice(i, e); i = e - 1; continue; }
    if (ch === '"' || ch === "'") { const e = skipString(prelude, i); cur += prelude.slice(i, e); i = e - 1; continue; }
    if (ch === '(' || ch === '[') depth++;
    if (ch === ')' || ch === ']') depth--;
    if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur);
  return parts.map((s) => s.trim()).filter(Boolean);
}

/** Target rel for one selector, or null for global.css */
function targetForSelector(sel) {
  const specifics = new Set();
  for (const t of extractClassTokens(sel)) {
    const owners = tokenOwner.get(t);
    if (owners && owners.size === 1) specifics.add([...owners][0]);
  }
  if (specifics.size === 1) return [...specifics][0];
  return null;
}

/* ------------------------------------------------------------------ */
/* 4. Distribution                                                     */
/* ------------------------------------------------------------------ */

const GLOBAL = null;
const entries = new Map(); // target rel | '__global__' -> entry[]
const globalEntries = [];
const pushEntry = (target, entry) => {
  const key = target ?? '__global__';
  if (!entries.has(key)) entries.set(key, target === GLOBAL ? globalEntries : []);
  entries.get(key).push(entry);
  const t = targetByRel.get(target);
  if (t) {
    t.rules += entry.kind === 'rule' ? 1 : 0;
    if (entry.order < t.minOrder) t.minOrder = entry.order;
  }
};

let order = 0;
let originalRuleCount = 0;
let splitRuleCount = 0;
const originalSelectors = new Set();

function processBlock(block, media, ord) {
  const prelude = block.prelude.trim();
  if (prelude.startsWith('@')) {
    const isConditional = /^@(media|supports)\b/.test(prelude);
    if (!isConditional) {
      // @keyframes, @font-face, @property ... -> keep global as-is
      pushEntry(GLOBAL, { kind: 'rule', media, order: ord, text: block.prelude + '{' + block.body + '}' });
      originalRuleCount++;
      return;
    }
    const inner = splitTopLevel(block.body);
    let pendingComments = [];
    for (const unit of inner) {
      if (unit.type === 'comment') { pendingComments.push(unit.text); continue; }
      const before = countEmitted();
      processBlock(unit, prelude, ord);
      // attach buffered comments to every entry emitted for this unit
      if (pendingComments.length) {
        for (const [key, list] of entries) {
          for (let k = before[key] ?? 0; k < list.length; k++) {
            list[k] = { ...list[k], text: pendingComments.join('') + list[k].text };
          }
        }
        pendingComments = [];
      }
    }
    if (pendingComments.length) {
      // trailing comment inside media -> keep it in global
      pushEntry(GLOBAL, { kind: 'comment', media: prelude, order: ord, text: pendingComments.join('') });
    }
    return;
  }

  originalRuleCount++;
  const selectors = splitSelectors(stripComments(block.prelude));
  for (const s of selectors) originalSelectors.add(s.replace(/\s+/g, ' ').trim());

  // group selectors by target
  const groups = new Map(); // target -> selectors[]
  for (const sel of selectors) {
    const t = targetForSelector(sel);
    if (!groups.has(t)) groups.set(t, []);
    groups.get(t).push(sel);
  }
  if (groups.size > 1) splitRuleCount++;

  for (const [target, sels] of groups) {
    let text;
    if (sels.length === selectors.length) {
      text = block.prelude + '{' + block.body + '}'; // exact original text
    } else {
      const body = block.body.endsWith('\n') ? block.body : block.body + '\n';
      text = sels.join(', ') + '{' + body + '}';
    }
    pushEntry(target, { kind: 'rule', media, order: ord, text });
  }
}

function countEmitted() {
  const counts = {};
  for (const [key, list] of entries) counts[key] = list.length;
  counts.__global__ = globalEntries.length;
  return counts;
}

for (const unit of splitTopLevel(fs.readFileSync(GLOBAL_CSS, 'utf8'))) {
  const ord = order++;
  if (unit.type === 'comment') {
    globalEntries.push({ kind: 'comment', media: null, order: ord, text: unit.text });
    continue;
  }
  processBlock(unit, null, ord);
}

/* ------------------------------------------------------------------ */
/* 5. Validation                                                       */
/* ------------------------------------------------------------------ */

const emittedSelectors = new Set();
for (const list of [...entries.values(), globalEntries]) {
  for (const e of list) {
    if (e.kind !== 'rule') continue;
    const open = e.text.indexOf('{');
    if (open === -1) continue;
    const prelude = stripComments(e.text.slice(0, open));
    for (const s of splitSelectors(prelude)) emittedSelectors.add(s.replace(/\s+/g, ' ').trim());
  }
}
const missing = [...originalSelectors].filter((s) => !emittedSelectors.has(s));
if (missing.length) {
  console.error('FATAL: selectors lost during split:');
  for (const s of missing.slice(0, 20)) console.error('  -', s);
  process.exit(1);
}

/* ------------------------------------------------------------------ */
/* 6. Rendering                                                        */
/* ------------------------------------------------------------------ */

function renderEntries(list) {
  const out = [];
  let i = 0;
  while (i < list.length) {
    const e = list[i];
    if (!e.media) {
      out.push(e.text.trim());
      i++;
      continue;
    }
    // group only CONSECUTIVE entries sharing the same media query
    const inner = [];
    let j = i;
    while (j < list.length && list[j].media === e.media) { inner.push(list[j]); j++; }
    const body = inner.map((x) => '  ' + x.text.trim()).join('\n');
    out.push(`${e.media} {\n${body}\n}`);
    i = j;
  }
  return out.join('\n\n') + '\n';
}

/* ------------------------------------------------------------------ */
/* 7. Write files                                                      */
/* ------------------------------------------------------------------ */

const header = (title) =>
  `/* ──────────────────────────────────────────────────────────\n` +
  `   ${title}\n` +
  `   Split from src/assets/global.css (see scripts/split-styles.mjs)\n` +
  `   ────────────────────────────────────────────────────────── */\n\n`;

const summary = [];
const written = [];

if (!DRY_RUN) fs.rmSync(STYLES_DIR, { recursive: true, force: true });

const usedTargets = targets
  .filter((t) => (entries.get(t.rel) ?? []).some((e) => e.kind === 'rule'))
  .sort((a, b) => a.minOrder - b.minOrder);

for (const t of usedTargets) {
  const list = entries.get(t.rel);
  const css = header(path.basename(t.rel).replace(/\.jsx$/, '')) + renderEntries(list);
  if (!DRY_RUN) {
    fs.mkdirSync(path.dirname(t.cssPath), { recursive: true });
    fs.writeFileSync(t.cssPath, css, 'utf8');
  }
  written.push(t);
  summary.push([t.cssRel, list.filter((e) => e.kind === 'rule').length]);
}

if (!DRY_RUN) {
  const globalCss =
    `/* ──────────────────────────────────────────────────────────\n` +
    `   Global foundation stylesheet\n` +
    `   Design tokens (:root / [data-theme]), font schemes, base\n` +
    `   elements, textures, keyframes, shared utility classes and\n` +
    `   cross-cutting layout rules. Component- and page-specific\n` +
    `   rules live in src/styles/ (imported from main.jsx).\n` +
    `   ────────────────────────────────────────────────────────── */\n\n` +
    renderEntries(globalEntries);
  fs.writeFileSync(GLOBAL_CSS, globalCss, 'utf8');
}

/* ------------------------------------------------------------------ */
/* 8. Report                                                           */
/* ------------------------------------------------------------------ */

console.log(`Original style rules : ${originalRuleCount}`);
console.log(`Emitted rule copies  : ${globalEntries.filter((e) => e.kind === 'rule').length + written.reduce((n, t) => n + entries.get(t.rel).filter((e) => e.kind === 'rule').length, 0)}`);
console.log(`Selector splits      : ${splitRuleCount}`);
console.log(`Files created        : ${written.length}`);
console.log('');
console.log('Import block for src/main.jsx (after `import "./assets/global.css";`):');
console.log('');
for (const t of written) {
  console.log(`import './${t.cssRel.replace(/\\/g, '/')}';`);
}
console.log('');
console.log('Rules per file:');
for (const [rel, n] of summary) console.log(`  ${String(n).padStart(4)}  ${rel}`);
const globalRules = globalEntries.filter((e) => e.kind === 'rule').length;
console.log(`  ${String(globalRules).padStart(4)}  assets/global.css (foundation + shared)`);

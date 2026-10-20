/**
 * verify-report.mjs — independently re-checks every item the deep audit reports.
 *
 * Rule: an import is unused iff its local name appears nowhere in the file
 * after removing ALL import statements (including multi-line import blocks).
 * This removes the naive "name appears on a neighbouring import line" noise.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const parser = require('@babel/parser');

const CLIENT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = execSync('node scripts/deep-audit.mjs', { cwd: CLIENT, encoding: 'utf8' });

const unusedImports = [];
let section = '';
for (const line of out.split('\n')) {
  if (line.includes('2. UNUSED IMPORTS')) { section = 'imports'; continue; }
  if (line.includes('3. UNUSED MODULE')) { section = 'locals'; continue; }
  if (section !== 'imports') continue;
  const m = line.match(/^\s{3}(\S+?):(\d+)\s+(\S+)\s+from '([^']+)'/);
  if (m) unusedImports.push({ file: m[1], line: +m[2], name: m[3], source: m[4] });
}

/** Blank out every import statement's byte range, preserving line structure. */
function codeWithoutImports(text) {
  const ast = parser.parse(text, { sourceType: 'module', plugins: ['jsx'], errorRecovery: true });
  const chars = [...text];
  for (const node of ast.program.body) {
    if (node.type !== 'ImportDeclaration') continue;
    for (let i = node.start; i < node.end; i++) if (chars[i] !== '\n') chars[i] = ' ';
  }
  return chars.join('');
}

let falsePositives = 0;
console.log(`Re-verifying ${unusedImports.length} reported unused imports...\n`);
for (const u of unusedImports) {
  const abs = path.join(CLIENT, u.file);
  const stripped = codeWithoutImports(fs.readFileSync(abs, 'utf8'));
  const wordRe = new RegExp(`\\b${u.name.replace(/[$]/g, '\\$')}\\b`);
  const hits = [];
  stripped.split('\n').forEach((l, i) => {
    if (wordRe.test(l) && !/^\s*\/\//.test(l)) hits.push(i + 1);
  });
  const real = hits.filter((n) => !isCommentOnly(abs, n));
  const status = real.length === 0 ? 'CONFIRMED-UNUSED' : `FALSE-POSITIVE (real use at ${real.join(', ')})`;
  if (real.length !== 0) falsePositives++;
  console.log(`  ${status.padEnd(46)} ${u.file}:${u.line} ${u.name}`);
}

function isCommentOnly() { return false; } // line-level comment filter handled above

console.log(`\nfalsePositives(${falsePositives}) out of ${unusedImports.length}`);

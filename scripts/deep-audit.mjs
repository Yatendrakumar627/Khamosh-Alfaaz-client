/**
 * deep-audit.mjs — scope-aware correctness + dead-code audit (Babel AST).
 *
 * Instead of blunt regex/identifier counting, this builds an actual lexical
 * scope chain per file and reports:
 *   1. UNBOUND REFERENCES  — identifiers read but resolvable nowhere (real bugs)
 *   2. UNUSED IMPORTS      — imported binding never read
 *   3. UNUSED LOCALS       — module-level const/let/function never read
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const parser = require('@babel/parser');

const CLIENT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(CLIENT, 'src');

const GLOBALS = new Set(`
  React Fragment console window document process globalThis setTimeout clearTimeout
  setInterval clearInterval fetch URL URLSearchParams FormData Blob File FileReader
  Audio Image Math JSON Date Object Array String Number Boolean Promise Map Set WeakMap
  WeakSet Symbol Error RegExp parseInt parseFloat isNaN isFinite decodeURI decodeURIComponent
  encodeURI encodeURIComponent localStorage sessionStorage navigator alert confirm requestAnimationFrame
  cancelAnimationFrame IntersectionObserver ResizeObserver MutationObserver AbortController
  TextEncoder structuredClone atob btoa performance queueMicrotask undefined NaN Infinity
  arguments crypto Crypto Response Request Headers Intl CustomEvent Event MediaRecorder
  Uint8Array Uint8ClampedArray Uint16Array Int8Array Int16Array Int32Array Uint32Array Float32Array
  Float64Array ArrayBuffer DataView SharedArrayBuffer BigInt BigInt64Array BigUint64Array WebAssembly
  SpeechRecognition webkitSpeechRecognition ImageData CanvasRenderingContext2D HTMLInputElement
  HTMLTextAreaElement KeyboardEvent MouseEvent DOMRect CSS undefined global
`.trim().split(/\s+/));

const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(js|jsx)$/.test(e.name)) files.push(p);
  }
})(SRC);

const rel = (p) => path.relative(CLIENT, p).replace(/\\/g, '/');

/* ---------------- scope-aware traversal ---------------- */

function analyze(file) {
  const code = fs.readFileSync(file, 'utf8');
  const ast = parser.parse(code, { sourceType: 'module', plugins: ['jsx'], errorRecovery: true });

  const unbound = new Map();     // name -> Set(lines)
  const moduleScope = new Map(); // name -> { kind, line, reads }
  const importReads = new Map(); // imported local name -> read count
  const imports = [];            // { local, source, line }

  // Pre-scan module-level declarations so that *forward references* to a
  // declaration later in the file are not flagged (these are legal & TDZ-safe
  // at runtime because the read happens inside a function called after init).
  const moduleNames = new Set();
  const moduleReadCounts = new Map(); // module-level name -> total reads (incl. nested scopes)
  const collectIdents = (pat, out) => {
    if (!pat) return;
    if (pat.type === 'Identifier') out.add(pat.name);
    else if (pat.type === 'ObjectPattern') pat.properties.forEach((p) => collectIdents(p.type === 'RestElement' ? p.argument : p.value, out));
    else if (pat.type === 'ArrayPattern') pat.elements.forEach((el) => collectIdents(el, out));
    else if (pat.type === 'AssignmentPattern') collectIdents(pat.left, out);
    else if (pat.type === 'RestElement') collectIdents(pat.argument, out);
  };
  (function scanDecls(nodes) {
    for (const stmt of nodes) {
      if (!stmt) continue;
      if (stmt.type === 'VariableDeclaration') stmt.declarations.forEach((d) => collectIdents(d.id, moduleNames));
      else if ((stmt.type === 'FunctionDeclaration' || stmt.type === 'ClassDeclaration') && stmt.id) moduleNames.add(stmt.id.name);
      else if (stmt.type === 'ExportNamedDeclaration' && stmt.declaration) scanDecls([stmt.declaration]);
      else if (stmt.type === 'ExportDefaultDeclaration' && stmt.declaration) scanDecls([stmt.declaration]);
    }
  })(ast.program.body);
  moduleNames.forEach((n) => moduleReadCounts.set(n, 0));

  // scope stack: array of Set(names)
  const scopes = [new Set()];
  const exportedNames = new Set(); // module-level names that are exported (not dead even if unread locally)
  const markExportedDeclaration = (decl) => {
    if (!decl) return;
    if (decl.type === 'FunctionDeclaration' || decl.type === 'ClassDeclaration') {
      if (decl.id) exportedNames.add(decl.id.name);
    } else if (decl.type === 'VariableDeclaration') {
      decl.declarations.forEach((d) => {
        if (d.id.type === 'Identifier') exportedNames.add(d.id.name);
      });
    }
  };
  const declare = (name, info) => {
    scopes[scopes.length - 1].add(name);
    if (info && scopes.length === 1) moduleScope.set(name, info);
  };
  const isBound = (name) => moduleNames.has(name) || scopes.some((s) => s.has(name));
  const addPattern = (node) => {
    if (!node) return;
    switch (node.type) {
      case 'Identifier': declare(node.name); break;
      case 'ObjectPattern': node.properties.forEach((p) => addPattern(p.type === 'RestElement' ? p.argument : p.value || p.key)); break;
      case 'ArrayPattern': node.elements.forEach(addPattern); break;
      case 'AssignmentPattern': addPattern(node.left); break;
      case 'RestElement': addPattern(node.argument); break;
      default: break;
    }
  };

  const push = () => scopes.push(new Set());
  const pop = () => scopes.pop();

  const markRead = (name, line, owner) => {
    if (owner) owner.reads++;
    if (moduleReadCounts.has(name)) moduleReadCounts.set(name, moduleReadCounts.get(name) + 1);
    if (importReads.has(name)) {
      importReads.set(name, importReads.get(name) + 1);
      if (process.env.DBG && process.env.DBG === name) console.log('  [read]', name, 'line', line, 'owner?', !!owner);
    }
    if (isBound(name) || GLOBALS.has(name)) return;
    if (!unbound.has(name)) unbound.set(name, new Set());
    unbound.get(name).add(line);
  };

  const visit = (node, parent) => {
    if (!node || typeof node.type !== 'string') return;

    // hoist declarations in a block/function body first
    switch (node.type) {
      case 'Program': {
        for (const stmt of node.body) hoist(stmt);
        node.body.forEach((s) => visit(s, node));
        return;
      }      case 'FunctionDeclaration':
      case 'FunctionExpression':
      case 'ArrowFunctionExpression': {
        if (node.id) declare(node.id.name, parent ? null : { kind: 'fn', line: node.loc.start.line, reads: 0 });
        push();
        node.params.forEach((p) => { addPattern(p); visitParamDefaults(p, node); });
        if (node.body.type === 'BlockStatement') {
          hoistAll(node.body.body);
          node.body.body.forEach((s) => visit(s, node.body));
        } else visit(node.body, node);
        pop();
        return;
      }
      case 'BlockStatement': {
        push();
        hoistAll(node.body);
        node.body.forEach((s) => visit(s, node));
        pop();
        return;
      }
      case 'ForStatement':
      case 'ForOfStatement':
      case 'ForInStatement': {
        push();
        if (node.init) visit(node.init, node);
        if (node.left) visit(node.left, node);
        if (node.right) visit(node.right, node);
        if (node.test) visit(node.test, node);
        if (node.update) visit(node.update, node);
        if (node.body) visit(node.body, node);
        pop();
        return;
      }
      case 'SwitchStatement': {
        visit(node.discriminant, node);
        push();
        node.cases.forEach((c) => { if (c.test) visit(c.test, c); c.consequent.forEach((s) => visit(s, node)); });
        pop();
        return;
      }
      case 'ImportDeclaration': {
        node.specifiers.forEach((s) => {
          scopes[0].add(s.local.name);
          imports.push({ local: s.local.name, source: node.source.value, line: node.loc.start.line, reads: 0 });
        });
        // record import bindings so reads resolve to them
        node.specifiers.forEach((s) => { importReads.set(s.local.name, 0); });
        return;
      }
      case 'ExportNamedDeclaration': {
        if (node.source) return; // re-export: names are not local bindings
        markExportedDeclaration(node.declaration);
        node.specifiers.forEach((s) => exportedNames.add((s.local || s.exported).name));
        if (node.declaration) { hoist(node.declaration); visit(node.declaration, node); }
        return;
      }
      case 'ExportDefaultDeclaration':
        if (node.declaration) {
          if (node.declaration.type === 'Identifier') exportedNames.add(node.declaration.name);
          else markExportedDeclaration(node.declaration);
          visit(node.declaration, node);
        }
        return;
      case 'ExportAllDeclaration':
        return;
      case 'VariableDeclaration': {
        node.declarations.forEach((d) => {
          if (d.id.type === 'Identifier') declare(d.id.name, scopes.length === 1 ? { kind: 'var', line: d.loc.start.line, reads: 0 } : null);
          else addPattern(d.id);
          if (d.init) visit(d.init, node);
        });
        return;
      }
      case 'ClassDeclaration': {
        if (node.id) declare(node.id.name, scopes.length === 1 ? { kind: 'class', line: node.loc.start.line, reads: 0 } : null);
        if (node.superClass) visit(node.superClass, node);
        node.body.body.forEach((m) => visit(m, node));
        return;
      }
      case 'CatchClause': {
        push();
        addPattern(node.param);
        hoistAll(node.body.body || []);
        visit(node.body, node);
        pop();
        return;
      }
      case 'Identifier': {
        if (parent && isDeclarationPosition(node, parent)) return;
        const owner = moduleScope.get(node.name);
        markRead(node.name, node.loc.start.line, owner && owner.kind !== 'fn' ? owner : null);
        return;
      }
      case 'JSXIdentifier': {
        // element/attribute names are not variable refs, except component tags & expr containers
        if (parent && (parent.type === 'JSXOpeningElement' || parent.type === 'JSXClosingElement' || parent.type === 'JSXAttribute' || parent.type === 'JSXMemberExpression')) {
          if (parent.type === 'JSXOpeningElement' || parent.type === 'JSXClosingElement') {
            if (parent.name === node && /^[A-Z]/.test(node.name)) {
              const owner = moduleScope.get(node.name);
              markRead(node.name, node.loc.start.line, owner && owner.kind !== 'fn' ? owner : null);
            }
          }
          return;
        }
        const owner = moduleScope.get(node.name);
        markRead(node.name, node.loc.start.line, owner && owner.kind !== 'fn' ? owner : null);
        return;
      }
      case 'MemberExpression':
      case 'OptionalMemberExpression': {
        visit(node.object, node);
        if (node.computed) visit(node.property, node);
        return;
      }
      case 'ObjectProperty': {
        if (node.computed) visit(node.key, node);
        visit(node.value, node);
        return;
      }
      case 'ObjectMethod': {
        if (node.computed && node.key) visit(node.key, node);
        push();
        node.params.forEach(addPattern);
        if (node.body && node.body.type === 'BlockStatement') { hoistAll(node.body.body); node.body.body.forEach((s) => visit(s, node.body)); }
        pop();
        return;
      }
      case 'LabeledStatement': { visit(node.body, node); return; }
      case 'BreakStatement': case 'ContinueStatement': return; // labels
      case 'MetaProperty': return;
      default: break;
    }

    for (const k of Object.keys(node)) {
      if (k === 'loc' || k === 'start' || k === 'end' || k.endsWith('Comments')) continue;
      const c = node[k];
      if (Array.isArray(c)) c.forEach((x) => visit(x, node));
      else if (c && typeof c.type === 'string') visit(c, node);
    }
  };

  // hoist function/var/class declarations in a statement list
  const hoist = (stmt) => {
    if (!stmt) return;
    if (stmt.type === 'FunctionDeclaration' && stmt.id) declare(stmt.id.name, { kind: 'fn', line: stmt.loc.start.line, reads: 0 });
    else if (stmt.type === 'ClassDeclaration' && stmt.id) declare(stmt.id.name, scopes.length === 1 ? { kind: 'class', line: stmt.loc.start.line, reads: 0 } : null);
    else if (stmt.type === 'VariableDeclaration' && stmt.kind === 'var') stmt.declarations.forEach((d) => addPattern(d.id));
    else if (stmt.type === 'ExportNamedDeclaration' || stmt.type === 'ExportDefaultDeclaration') {
      if (stmt.declaration) hoist(stmt.declaration);
    }
  };

  // hoist ALL declarations (incl. block-scoped const/let) — needed so
  // forward references inside a function to a later const are not flagged.
  const hoistAll = (stmts) => {
    for (const stmt of stmts) {
      if (!stmt) continue;
      if (stmt.type === 'VariableDeclaration') stmt.declarations.forEach((d) => addPattern(d.id));
      else if (stmt.type === 'FunctionDeclaration' && stmt.id) declare(stmt.id.name, { kind: 'fn', line: stmt.loc.start.line, reads: 0 });
      else if (stmt.type === 'ClassDeclaration' && stmt.id) declare(stmt.id.name, null);
      else if (stmt.type === 'ExportNamedDeclaration' || stmt.type === 'ExportDefaultDeclaration') {
        if (stmt.declaration) hoistAll([stmt.declaration]);
      }
    }
  };

  // Visit the *default value* expressions of a parameter pattern, e.g.
  //   ({ submitIcon = <Plus /> }) => ...
  // Babel does not treat a default value as a declaration, so without this the
  // JSX/identifiers inside defaults would be silently skipped (real blind spot).
  const visitParamDefaults = (pattern, parent) => {
    if (!pattern) return;
    switch (pattern.type) {
      case 'AssignmentPattern':
        addPattern(pattern.left);
        visit(pattern.right, parent);
        return;
      case 'ObjectPattern':
        pattern.properties.forEach((p) => {
          if (p.type === 'RestElement') return;
          if (p.computed) visit(p.key, parent);
          visitParamDefaults(p.value, parent);
        });
        return;
      case 'ArrayPattern':
        pattern.elements.forEach((el) => visitParamDefaults(el, parent));
        return;
      case 'RestElement':
        visitParamDefaults(pattern.argument, parent);
        return;
      default:
        return;
    }
  };

  return { ast, unbound, moduleScope, moduleReadCounts, imports, importReads, exportedNames, visit };
}

function isDeclarationPosition(node, parent) {
  if (!parent) return false;
  if (parent.type === 'VariableDeclarator' && parent.id === node) return true;
  if ((parent.type === 'FunctionDeclaration' || parent.type === 'FunctionExpression' || parent.type === 'ArrowFunctionExpression') && (parent.id === node || parent.params.includes(node))) return true;
  if (parent.type === 'ClassDeclaration' && parent.id === node) return true;
  if (parent.type === 'ObjectProperty' && parent.key === node && !parent.computed) return true;
  if (parent.type === 'ImportSpecifier' || parent.type === 'ImportDefaultSpecifier' || parent.type === 'ImportNamespaceSpecifier') return true;
  if (parent.type === 'AssignmentPattern' && parent.left === node) return true;
  if (parent.type === 'RestElement' && parent.argument === node) return true;
  if (parent.type === 'ObjectPattern' || parent.type === 'ArrayPattern') return true;
  if (parent.type === 'CatchClause' && parent.param === node) return true;
  return false;
}

/* ---------------- run ---------------- */

const unboundAll = [];
const unusedImports = [];
const unusedLocals = [];

for (const f of files) {
  if (/\.test\.(js|jsx)$/.test(f)) continue;
  const { ast, unbound, moduleScope, moduleReadCounts, imports, importReads, exportedNames, visit } = analyze(f);
  // run the real traversal to populate read-counts
  visit(ast, null);

  if (process.env.DBG_FILE && rel(f).endsWith(process.env.DBG_FILE)) {
    console.log('DEBUG file:', rel(f));
    console.log('  imports:', imports.map((i) => `${i.local}@${i.line}`).join(', '));
    console.log('  importReads:', [...importReads.entries()].map(([k, v]) => `${k}=${v}`).join(', '));
  }

  for (const [name, lines] of unbound) {
    unboundAll.push({ file: rel(f), name, lines: [...lines].sort((a, b) => a - b) });
  }
  for (const imp of imports) if ((importReads.get(imp.local) || 0) === 0) unusedImports.push({ file: rel(f), ...imp });
  for (const [name, info] of moduleScope) {
    const reads = moduleReadCounts.get(name) || 0;
    if (reads === 0 && !exportedNames.has(name)) unusedLocals.push({ file: rel(f), name, line: info.line, kind: info.kind });
  }
}

console.log('\n#################### 1. UNBOUND REFERENCES (real runtime bugs) ####################');
if (!unboundAll.length) console.log('   (none)');
for (const u of unboundAll) console.log(`   ${u.file}:${u.lines.join(',')}  ->  ${u.name}`);

console.log('#################### 2. UNUSED IMPORTS ####################');
if (!unusedImports.length) console.log('   (none)');
for (const u of unusedImports) console.log(`   ${u.file}:${u.line}  ${u.local}  from '${u.source}'`);

console.log('\n#################### 3. UNUSED MODULE-LEVEL DECLARATIONS ####################');
if (!unusedLocals.length) console.log('   (none)');
for (const u of unusedLocals) console.log(`   ${u.file}:${u.line}  ${u.kind} ${u.name}`);

console.log(`\nTotals: unbound=${unboundAll.length}  unusedImports=${unusedImports.length}  unusedLocals=${unusedLocals.length}`);

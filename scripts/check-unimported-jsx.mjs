/**
 * check-unimported-jsx.mjs
 * Detects PascalCase JSX components referenced in a file that are NOT
 * available in scope -> runtime "X is not defined" crashes.
 *
 * Uses Babel (already a transitive dep of @vitejs/plugin-react) to parse
 * each file into an AST, then compares JSXIdentifier tags against the
 * file's actual bindings (imports + local declarations + function params).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let parser;
try {
  parser = require('@babel/parser');
} catch {
  parser = require(path.join(process.cwd(), 'node_modules/@babel/parser'));
}

const CLIENT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(CLIENT, 'src');

const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.jsx')) files.push(p);
  }
})(SRC);

const rel = (p) => path.relative(CLIENT, p).replace(/\\/g, '/');

// JSX intrinsics / globals that never need importing
const BUILTINS = new Set(['React', 'Fragment']);

function collectBindings(ast) {
  const names = new Set(BUILTINS);
  const addFromPattern = (node) => {
    if (!node) return;
    switch (node.type) {
      case 'Identifier': names.add(node.name); break;
      case 'ObjectPattern': node.properties.forEach((p) => {
        if (p.type === 'RestElement') addFromPattern(p.argument);
        else addFromPattern(p.value || p.key);
      }); break;
      case 'ArrayPattern': node.elements.forEach(addFromPattern); break;
      case 'AssignmentPattern': addFromPattern(node.left); break;
      case 'RestElement': addFromPattern(node.argument); break;
      default: break;
    }
  };
  const visit = (node) => {
    if (!node || typeof node.type !== 'string') return;
    switch (node.type) {
      case 'ImportDeclaration':
        node.specifiers.forEach((s) => names.add(s.local.name));
        break;
      case 'VariableDeclarator':
        addFromPattern(node.id);
        break;
      case 'FunctionDeclaration':
      case 'FunctionExpression':
      case 'ArrowFunctionExpression':
        if (node.id) names.add(node.id.name);
        node.params.forEach(addFromPattern);
        break;
      case 'ClassDeclaration':
      case 'ClassExpression':
        if (node.id) names.add(node.id.name);
        break;
      case 'TSEnumDeclaration':
      case 'TSInterfaceDeclaration':
        names.add(node.id?.name);
        break;
      default: break;
    }
    for (const key of Object.keys(node)) {
      if (key === 'loc' || key === 'start' || key === 'end' || key === 'leadingComments' || key === 'trailingComments') continue;
      const child = node[key];
      if (Array.isArray(child)) child.forEach(visit);
      else if (child && typeof child.type === 'string') visit(child);
    }
  };
  visit(ast);
  return names;
}

function collectJsxTags(ast) {
  const used = new Map();
  const visit = (node) => {
    if (!node || typeof node.type !== 'string') return;
    if (node.type === 'JSXOpeningElement' || node.type === 'JSXClosingElement') {
      const n = node.name;
      if (n && n.type === 'JSXIdentifier' && /^[A-Z]/.test(n.name) && !used.has(n.name)) {
        used.set(n.name, n.loc?.start.line ?? 0);
      }
    }
    for (const key of Object.keys(node)) {
      if (key === 'loc' || key === 'start' || key === 'end') continue;
      const child = node[key];
      if (Array.isArray(child)) child.forEach(visit);
      else if (child && typeof child.type === 'string') visit(child);
    }
  };
  visit(ast);
  return used;
}

let total = 0;
for (const f of files) {
  const code = fs.readFileSync(f, 'utf8');
  let ast;
  try {
    ast = parser.parse(code, { sourceType: 'module', plugins: ['jsx'], errorRecovery: true });
  } catch (e) {
    console.log(`PARSE ERROR ${rel(f)}: ${e.message}`);
    continue;
  }
  const bindings = collectBindings(ast);
  const used = collectJsxTags(ast);
  const missing = [...used.entries()].filter(([n]) => !bindings.has(n));
  if (missing.length) {
    total += missing.length;
    console.log(rel(f));
    for (const [n, line] of missing) console.log(`   line ${line}: <${n}>`);
  }
}
console.log(`\nTotal unimported JSX components: ${total}`);

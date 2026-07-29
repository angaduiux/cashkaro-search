#!/usr/bin/env node
/**
 * gen-map.mjs — regenerates docs/MAP.md, the index every chat reads first
 * instead of grepping src/.
 *
 * Everything is DERIVED from source — file paths, each module's doc comment,
 * the import graph (both directions), Figma node ids named in doc comments,
 * asset folders required, and the SERP cases exported by data/realData.ts.
 * Nothing is invented and nothing is hand-written, so the map cannot drift from
 * the code. Run after adding/renaming/removing a screen, component or data
 * module (a PostToolUse hook also runs it after every Write/Edit):
 *
 *     node scripts/gen-map.mjs
 *
 * No dependencies; plain Node ESM + fs.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { join, relative, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const OUT = join(ROOT, 'docs', 'MAP.md');

/** Recursively list source files under a directory. */
function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.tsx?$/.test(name)) out.push(full);
  }
  return out;
}

const clean = (body) =>
  body
    .split('\n')
    .map((l) => l.replace(/^\s*\*?\s?/, '').trimEnd())
    .join('\n')
    .trim();

/**
 * The module's OWN doc comment — not a helper's. In order:
 *  1. a block comment the file opens with (most data/theme modules), or
 *  2. the block comment immediately preceding the export named after the file
 *     (e.g. `export function ExploreHome` in screens/ExploreHome.tsx).
 * Multi-export modules with neither (e.g. components/ResultCards.tsx, a barrel
 * of card archetypes) report `—` on purpose: the map then tells you to add a
 * module header rather than quoting a random helper's comment as the purpose.
 */
function docComment(src, file) {
  const lead = src.match(/^\s*\/\*\*([\s\S]*?)\*\//);
  if (lead) return clean(lead[1]);
  const name = basename(file).replace(/\.tsx?$/, '');
  const own = src.match(
    new RegExp(`\\/\\*\\*([\\s\\S]*?)\\*\\/\\s*(?:export\\s+)?(?:function|const|class)\\s+${name}\\b`),
  );
  return own ? clean(own[1]) : '';
}

/** First sentence of the doc comment, collapsed to one line and truncated. */
function purposeFrom(comment) {
  if (!comment) return '';
  const oneLine = comment.replace(/\s*\n\s*/g, ' ').trim();
  const m = oneLine.match(/^(.*?[.!?])(\s|$)/);
  let s = (m ? m[1] : oneLine).trim();
  if (s.length > 160) s = s.slice(0, 157).trimEnd() + '…';
  return s;
}

/**
 * Distinct Figma node ids (####:####) named in the doc comment. Gated on the
 * comment mentioning "Figma" so a listed id is always a real design node, never
 * a stray ratio or duration literal — a chat can paste it into the Figma MCP.
 */
function figmaNodes(comment) {
  if (!/figma/i.test(comment)) return [];
  const ids = new Set();
  for (const m of comment.matchAll(/\b(\d{2,}:\d{2,})\b/g)) ids.add(m[1]);
  return [...ids];
}

/** Distinct assets/<folder> directories required by the file. */
function assetFolders(src) {
  const set = new Set();
  for (const m of src.matchAll(/require\('[^']*?assets\/([\w./-]+?)\/[\w.-]+\.\w+'\)/g)) {
    set.add('assets/' + m[1]);
  }
  return [...set];
}

/** Relative local imports, resolved to repo-relative source paths. */
function localImports(file, src) {
  const out = new Set();
  for (const m of src.matchAll(/from '(\.[^']+)'/g)) {
    const guess = join(dirname(file), m[1]);
    for (const ext of ['.tsx', '.ts', '/index.tsx', '/index.ts']) {
      try {
        statSync(guess + ext);
        out.add(relative(ROOT, guess + ext));
        break;
      } catch {}
    }
  }
  return [...out];
}

/** Exported symbols (components, functions, consts, types). */
function exportedNames(src) {
  const set = new Set();
  for (const m of src.matchAll(/export\s+(?:async\s+)?(?:function|const|let|class)\s+(\w+)/g)) set.add(m[1]);
  for (const m of src.matchAll(/export\s+(?:type|interface)\s+(\w+)/g)) set.add(m[1]);
  return [...set];
}

const files = walk(SRC).sort();
const mods = new Map();
for (const file of files) {
  const src = readFileSync(file, 'utf8');
  const comment = docComment(src, file);
  mods.set(relative(ROOT, file), {
    path: relative(ROOT, file),
    area: relative(SRC, dirname(file)) || '.',
    name: basename(file),
    purpose: purposeFrom(comment),
    nodes: figmaNodes(comment).slice(0, 5),
    assets: assetFolders(src),
    imports: localImports(file, src),
    exports: exportedNames(src),
    loc: src.split('\n').length,
  });
}

// Reverse import graph — "used by" answers "what breaks if I change this?".
for (const m of mods.values()) m.usedBy = [];
for (const m of mods.values()) {
  for (const dep of m.imports) mods.get(dep)?.usedBy.push(m.path);
}

/** SERP cases exported by data/realData.ts — query → archetype → export name. */
function serpCases() {
  const p = join(SRC, 'data', 'realData.ts');
  let src;
  try {
    src = readFileSync(p, 'utf8');
  } catch {
    return [];
  }
  const out = [];
  const re = /export const (case\w+): SerpModel = \{\s*\n\s*query: '([^']*)',\s*\n\s*archetype: '([^']*)'/g;
  for (const m of src.matchAll(re)) out.push({ name: m[1], query: m[2], archetype: m[3] });
  // REAL_CASES keys are the queries the app actually resolves.
  const reg = src.match(/export const REAL_CASES[^=]*=\s*\{([\s\S]*?)\n\};/);
  const keys = reg ? [...reg[1].matchAll(/^\s*'?([\w\s-]+?)'?:/gm)].map((k) => k[1].trim()) : [];
  return out.map((c) => ({ ...c, routed: keys.includes(c.query) }));
}

const esc = (s) => (s || '—').replace(/\|/g, '\\|');
const short = (p) => p.replace(/^src\//, '');
const L = [];

L.push('# Code map');
L.push('');
L.push('> **Generated file — do not hand-edit.** Regenerate with `node scripts/gen-map.mjs`');
L.push('> (a PostToolUse hook also runs it after every Write/Edit). Every row is derived');
L.push("> from the module's doc comment + import graph, so it never drifts from the code.");
L.push('');
L.push('Read this first to find where something lives — module → purpose → Figma node →');
L.push('assets → who uses it. It replaces grepping the tree. If a row reads `—` under');
L.push('Purpose, that module has no doc comment: add one, then regenerate.');
L.push('');

const AREAS = [
  ['screens', 'Screens', 'Full-page surfaces. Mounted by `src/Root.tsx`, which owns the single search controller and the overlay stack.'],
  ['components', 'Components', 'Shared UI. `ResultCards.tsx` holds every result-card archetype; `SerpShell.tsx` lays out a `SerpModel`.'],
  ['data', 'Data', 'The contract, the catalog/search engine, the real cases, and the Storepage tile set. No component invents data.'],
  ['theme', 'Theme', 'The only source of colour, type, spacing, radius, elevation and motion.'],
  ['motion', 'Motion', 'Shared animation primitives + tuning.'],
  ['icons', 'Icons', 'Icon component + name map.'],
  ['os', 'OS chrome', 'Web device-frame chrome (status bar, nav chrome, mock keyboard, device presets).'],
  ['.', 'Root', 'App entry.'],
];

for (const [area, title, blurb] of AREAS) {
  const list = [...mods.values()].filter((m) => m.area === area).sort((a, b) => a.name.localeCompare(b.name));
  if (!list.length) continue;
  L.push(`## ${title}`);
  L.push('');
  L.push(blurb);
  L.push('');
  L.push('| Module | LOC | Exports | Figma node(s) | Assets | Used by | Purpose |');
  L.push('| --- | --- | --- | --- | --- | --- | --- |');
  for (const m of list) {
    const exp = m.exports.slice(0, 6).join(', ') + (m.exports.length > 6 ? ` +${m.exports.length - 6}` : '');
    L.push(
      `| \`${short(m.path)}\` | ${m.loc} | ${esc(exp)} | ${esc(m.nodes.join(', '))} | ${esc(m.assets.join('<br>'))} | ${esc(
        m.usedBy.map((u) => short(u)).slice(0, 4).join('<br>'),
      )} | ${esc(m.purpose)} |`,
    );
  }
  L.push('');
}

const cases = serpCases();
if (cases.length) {
  L.push('## Hand-written SERP cases');
  L.push('');
  L.push('Transcribed design cases in `src/data/realData.ts`. A query hits one of these when');
  L.push('`REAL_CASES` has its key, then when `financeSerp()` reads finance-vertical intent');
  L.push('from it (D052); anything else is generated from the catalog by `buildSerp()`.');
  L.push('');
  L.push('| Export | Query | Archetype | Routed via REAL_CASES |');
  L.push('| --- | --- | --- | --- |');
  for (const c of cases.sort((a, b) => a.query.localeCompare(b.query))) {
    L.push(`| \`${c.name}\` | \`${c.query}\` | ${c.archetype} | ${c.routed ? 'yes' : 'no'} |`);
  }
  L.push('');
}

const totalLoc = [...mods.values()].reduce((n, m) => n + m.loc, 0);
L.push('---');
L.push('');
L.push(`Modules: ${mods.size} · Lines: ${totalLoc} · SERP cases: ${cases.length}`);
L.push('');

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, L.join('\n'));
console.log(`Wrote ${relative(ROOT, OUT)} — ${mods.size} modules, ${cases.length} cases.`);

#!/usr/bin/env node
/**
 * check-context.mjs — the self-improving half of the context system.
 *
 * gen-map.mjs keeps docs/MAP.md true to the code. This script audits everything
 * that a generator can't: whether the shared context was updated alongside the
 * code, whether every module is documented, and whether the hard rules in
 * AGENTS.md still hold. It prints a short report of exactly what to fix, so each
 * session leaves the context in better shape than it found it.
 *
 *     node scripts/check-context.mjs           # advisory report, always exit 0
 *     node scripts/check-context.mjs --strict  # exit 1 if anything is stale/violated
 *     node scripts/check-context.mjs --quiet   # print only when something needs doing
 *
 * A Stop hook runs it at the end of every turn, so a chat that changed code
 * without logging a decision or documenting a new module hears about it.
 *
 * No dependencies; plain Node ESM.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const DOCS = join(ROOT, 'docs');
const STRICT = process.argv.includes('--strict');
const QUIET = process.argv.includes('--quiet');

const rel = (p) => relative(ROOT, p);
const findings = []; // { level: 'stale' | 'gap' | 'rule', text }
const add = (level, text) => findings.push({ level, text });

function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.tsx?$/.test(name)) out.push(full);
  }
  return out;
}

function git(...args) {
  try {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

const files = walk(SRC);

// ── 1. Is the generated map stale? ───────────────────────────────────────────
const MAP = join(DOCS, 'MAP.md');
if (!existsSync(MAP)) {
  add('stale', 'docs/MAP.md is missing — run `node scripts/gen-map.mjs`.');
} else {
  const mapTime = statSync(MAP).mtimeMs;
  const newer = files.filter((f) => statSync(f).mtimeMs > mapTime).map(rel);
  if (newer.length) {
    add(
      'stale',
      `docs/MAP.md is older than ${newer.length} source file(s) — run \`node scripts/gen-map.mjs\` (${newer
        .slice(0, 3)
        .join(', ')}${newer.length > 3 ? ', …' : ''}).`,
    );
  }
}

// ── 2. Code changed but no decision logged? ──────────────────────────────────
// Uncommitted src/ changes with an untouched DECISIONS.md means this session's
// reasoning is about to be lost. Not every edit deserves an entry — but a
// session that changed shape and logged nothing is the default failure mode.
const dirty = git('status', '--porcelain')
  .split('\n')
  .filter(Boolean)
  .map((l) => l.slice(3).trim());
const srcDirty = dirty.filter((p) => p.startsWith('src/'));
// git collapses an untracked directory to `docs/`, so match prefixes too.
const decisionsTouched = dirty.some(
  (p) => 'docs/DECISIONS.md'.startsWith(p) || p.includes('docs/DECISIONS.md'),
);
const DECISIONS = join(DOCS, 'DECISIONS.md');
if (!existsSync(DECISIONS)) {
  add('stale', 'docs/DECISIONS.md is missing — the decision log is the point of this system.');
} else if (srcDirty.length >= 2 && !decisionsTouched) {
  add(
    'stale',
    `${srcDirty.length} uncommitted src/ file(s) but docs/DECISIONS.md untouched — append a Dnn entry if any of YOUR change was a durable choice (some of these may belong to a parallel chat).`,
  );
}

// ── 3. Documentation coverage — modules with no header ───────────────────────
const undocumented = [];
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const name = basename(f).replace(/\.tsx?$/, '');
  const hasLead = /^\s*\/\*\*/.test(src);
  const hasOwn = new RegExp(
    `\\/\\*\\*([\\s\\S]*?)\\*\\/\\s*(?:export\\s+)?(?:function|const|class)\\s+${name}\\b`,
  ).test(src);
  if (!hasLead && !hasOwn) undocumented.push(rel(f));
}
if (undocumented.length) {
  add(
    'gap',
    `${undocumented.length} module(s) have no doc header, so MAP.md shows "—" for them: ${undocumented.join(', ')}.`,
  );
}

// ── 4. Hard rule: tokens only (AGENTS.md §Design-system rules) ───────────────
// Colour literals belong in theme/tokens.ts. Exempt: the theme itself; src/data/*
// (brand tints are brand DATA, per the BRAND/STORE_TILES convention); and the
// web-only preview harness below, which draws the device frame/OS chrome around
// the app and never ships inside it. Comments are stripped first so documented
// Figma values in prose don't trip the check.
const HARNESS = ['src/Root.tsx', 'src/components/ScreenNav.tsx'];
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const hexOffenders = [];
for (const f of files) {
  const p = rel(f);
  if (p.startsWith('src/theme/') || p.startsWith('src/data/') || p.startsWith('src/os/')) continue;
  if (HARNESS.includes(p)) continue;
  const body = stripComments(readFileSync(f, 'utf8'));
  const hits = [...body.matchAll(/'#[0-9a-fA-F]{3,8}'/g)].map((m) => m[0]);
  if (hits.length) hexOffenders.push(`${p} (${[...new Set(hits)].slice(0, 4).join(', ')})`);
}
if (hexOffenders.length) {
  add('rule', `hard-coded colour literal outside theme/ + data/: ${hexOffenders.join('; ')} — move it into theme/tokens.ts.`);
}

// ── 5. Hard rule: horizontal rails are full-bleed (AGENTS.md §Layout) ────────
// A rail whose content container pads one side only clips its last card at an
// arbitrary inset instead of the screen edge. Flags the exact shape of that bug.
const railOffenders = [];
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  if (!/horizontal\b/.test(src)) continue;
  // Only styles actually handed to a scroller as its content container count —
  // a plain pill with paddingRight is not a rail.
  const railStyles = new Set(
    [...src.matchAll(/contentContainerStyle=\{styles\.(\w+)\}/g)].map((m) => m[1]),
  );
  if (!railStyles.size) continue;
  for (const m of src.matchAll(/(\w+):\s*\{([^{}]*paddingRight:[^{}]*)\}/g)) {
    if (!railStyles.has(m[1]) || /paddingHorizontal:/.test(m[2])) continue;
    railOffenders.push(`${rel(f)} → \`${m[1]}\``);
  }
}
if (railOffenders.length) {
  add(
    'rule',
    `rail content container pads one side only (clips at an inset, not the screen edge): ${railOffenders.join(
      ', ',
    )} — use marginHorizontal: -space.m20 + paddingHorizontal: space.m20.`,
  );
}

// ── Report ───────────────────────────────────────────────────────────────────
const ICON = { stale: '⟳ context', gap: '○ coverage', rule: '✕ hard rule' };
if (!findings.length) {
  if (!QUIET) console.log('context OK — map fresh, every module documented, hard rules hold.');
  process.exit(0);
}
console.log('Context check — ' + findings.length + ' item(s) to fix before ending the turn:\n');
for (const f of findings) console.log(`  ${ICON[f.level]}  ${f.text}\n`);
console.log('Details: docs/DECISIONS.md (why) · docs/MAP.md (where) · AGENTS.md (rules).');
process.exit(STRICT ? 1 : 0);

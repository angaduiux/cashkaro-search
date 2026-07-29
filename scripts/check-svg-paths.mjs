/**
 * check-svg-paths.mjs — validates every SVG path string in src/ against each
 * command's required coordinate count.
 *
 * Why this exists: `react-native-svg` parses path data natively, and a malformed
 * `d` throws `RNSVGPathParser: InvalidNumber` **inside the mounting transaction**,
 * which takes the whole app down with a native red box — no component stack, no
 * hint at which icon. A truncated `Q` command (missing its final coordinate pair)
 * did exactly that twice on 2026-07-28. This finds it in a second.
 *
 * Usage: node scripts/check-svg-paths.mjs          # exits 1 if anything is broken
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

/** Coordinates each SVG path command consumes per repetition. */
const ARITY = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|jsx?)$/.test(name)) out.push(p);
  }
  return out;
}

/**
 * Every string literal in the file that LOOKS like SVG path data — not just
 * `d="…"`. Icon sets keep paths in consts and spread them into <Path>, so
 * matching only the prop would miss exactly the ones that crash.
 *
 * Template literals count, with every `${…}` replaced by a placeholder number.
 * A path assembled at runtime has the same command arity as its source text, so
 * the substitution catches a truncated segment (`Q${a} ${b} Z` — three numbers
 * where a quad needs four) without evaluating anything. That is precisely the
 * bug that crashed the app on 2026-07-28, and it is invisible to a scan that
 * only reads plain strings.
 */
const PLACEHOLDER = '0';

/** A command letter followed by numbers (or a bare close). */
const FRAGMENT = /^(?:[Zz]\s*$|[MmLlHhVvCcSsQqTtAa][\s\d.,+-])/;
const PATH_CHARS = /^[\sMmLlHhVvCcSsQqTtAaZz\d.,+-]+$/;

/**
 * Every string literal that looks like SVG path data OR one fragment of it.
 * Template literals count, with each `${…}` replaced by a placeholder number: a
 * path assembled at runtime has the same command arity as its source text, so the
 * substitution exposes a truncated segment (`Q${a} ${b} Z` — three numbers where
 * a quad needs four) without evaluating anything.
 */
function pathLiterals(src) {
  const out = [];
  const re = /`([^`]*)`|(["'])([^"']*)\2/g;
  let m;
  while ((m = re.exec(src))) {
    const raw = m[1] ?? m[3];
    if (!raw || raw.length < 2) continue;
    const d = raw.replace(/\$\{[^{}]*\}/g, PLACEHOLDER).trim();
    if (!FRAGMENT.test(d) || !PATH_CHARS.test(d)) continue;
    if (!/\d/.test(d) && !/^[Zz]$/.test(d)) continue;
    out.push({ d, line: src.slice(0, m.index).split('\n').length });
  }
  return out;
}

/**
 * Fragments are usually assembled from an array of template strings and joined,
 * so no single literal is the whole path. Group consecutive fragments (within two
 * lines of each other) and validate the concatenation as well — that is how a
 * missing end point in the LAST fragment gets caught.
 */
function joinedRuns(literals) {
  const runs = [];
  let run = null;
  const flush = () => { if (run && run.parts.length > 1) runs.push(run); };
  for (const lit of literals) {
    if (run && lit.line <= run.lastLine + 2) {
      run.parts.push(lit.d);
      run.lastLine = lit.line;
    } else {
      flush();
      run = { parts: [lit.d], line: lit.line, lastLine: lit.line };
    }
  }
  flush();
  return runs
    .filter((r) => /^[Mm]/.test(r.parts[0]))
    .map((r) => ({ d: r.parts.join(' '), line: r.line }));
}

/** Returns a problem string, or null when the path parses cleanly. */
function validate(d) {
  const tokens = d.match(/[MmLlHhVvCcSsQqTtAaZz]|[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g) ?? [];
  let i = 0;
  let cmd = null;
  while (i < tokens.length) {
    const tk = tokens[i];
    if (/[A-Za-z]/.test(tk)) {
      cmd = tk;
      i++;
      if (ARITY[cmd.toUpperCase()] === 0) continue; // Z takes nothing
    } else if (cmd == null) {
      return `starts with a number ("${tk}") before any command`;
    }
    const need = ARITY[cmd.toUpperCase()];
    if (need == null) return `unknown command "${cmd}"`;
    let got = 0;
    while (i < tokens.length && !/[A-Za-z]/.test(tokens[i])) { i++; got++; }
    if (got === 0) return `"${cmd}" has no coordinates`;
    if (got % need !== 0) {
      return `"${cmd}" needs ${need} coordinate(s) per point but got ${got} — ${got % need} left over`;
    }
  }
  return null;
}

let bad = 0;
let checked = 0;
for (const file of walk(SRC)) {
  const src = readFileSync(file, 'utf8');
  const literals = pathLiterals(src);
  // A fragment on its own can be legal while the assembled path is not, so check
  // whole paths individually and every multi-fragment run as one joined path.
  const whole = literals.filter((l) => /^[Mm]/.test(l.d) && /[LlHhVvCcSsQqTtAa]/.test(l.d));
  for (const { d, line } of [...whole, ...joinedRuns(literals)]) {
    checked++;
    const problem = validate(d);
    if (problem) {
      bad++;
      console.log(`✕ ${relative(ROOT, file)}:${line}  ${problem}`);
      console.log(`   d="${d.length > 120 ? d.slice(0, 117) + '…' : d}"`);
    }
  }
}
console.log(`\n${checked} SVG path(s) checked — ${bad ? `${bad} INVALID` : 'all valid'}.`);
process.exit(bad ? 1 : 0);

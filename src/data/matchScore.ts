/**
 * Query → candidate relevance scoring — the ONE match function the type-ahead ranks
 * with (D115). Pure string math over weighted fields: no data, no imports, so the
 * catalog, realData and any screen can share it without touching the
 * catalog↔realData import cycle.
 *
 * Every result type is scored on the SAME 0–100 scale, which is what lets one flat
 * suggestion list mix stores, product completions, categories, cards, loans, savings,
 * offers and campaigns and still put the thing the query actually names on top:
 * "credit" scores 84 against the credit-card intent and 0 against every store in the
 * catalog, so the cards float to the first row instead of sitting six rows down.
 */

/** One thing a query can be matched against, and how much matching it counts for. */
export type MatchField = { text: string; weight?: number };

/**
 * The rule ladder — HOW the query touched the field, strongest first. Word-boundary
 * prefix is the rung that matters most in practice: it is why "card" reaches
 * "Credit Cards" and "whey" reaches "Whey Protein" without either being a prefix of
 * the whole string.
 */
export const MATCH = {
  exact: 100,
  prefix: 88,
  wordPrefix: 76,
  contains: 55,
  acronym: 50,
  typo: 44, // less 6 per edit — "myntar" → Myntra still ranks, "xyz" never does
  subsequence: 26,
} as const;

/** Punctuation → space ("h&m" → "h m"), so word rules see real words. */
const soft = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

/** Punctuation and spaces removed ("h&m" → "hm"), so joined spellings still match. */
const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');

/**
 * Optimal string alignment (Damerau-Levenshtein) distance, abandoned as soon as it
 * passes `max` (returns max + 1). Transposition costs ONE edit, not two: the typo this
 * has to catch is a swapped pair — "myntar", "flipkrat" — and plain Levenshtein prices
 * that at two, so at the one-edit budget below it matched nothing at all
 * (screenshotted).
 */
function distance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev2: number[] | null = null;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + cost);
      if (prev2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        row[j] = Math.min(row[j], prev2[j - 2] + 1); // swapped pair — one edit
      }
      best = Math.min(best, row[j]);
    }
    if (best > max) return max + 1; // no cell on this row can still finish under max
    prev2 = prev;
    prev = row;
  }
  return prev[b.length];
}

/** Do `q`'s characters appear in order inside `text`? ("mbz" → "muscleblaze") */
function isSubsequence(q: string, text: string): boolean {
  let i = 0;
  for (const ch of text) if (ch === q[i] && ++i === q.length) return true;
  return false;
}

/** One query term against one field. `q` must already be `soft`-normalised. */
function fieldScore(q: string, text: string): number {
  const s = soft(text);
  if (!s || !q) return 0;
  const qs = squash(q);
  const ss = squash(s);
  if (s === q || ss === qs) return MATCH.exact;
  if (s.startsWith(q) || ss.startsWith(qs)) return MATCH.prefix;

  const words = s.split(' ');
  if (words.some((w) => w.startsWith(q))) return MATCH.wordPrefix;
  // Short queries stop here: at 1–2 characters `contains` matches half the catalog,
  // which is noise dressed as relevance.
  if (q.length >= 3 && (s.includes(q) || ss.includes(qs))) return MATCH.contains;
  if (qs.length >= 2 && words.length > 1 && words.map((w) => w[0]).join('').startsWith(qs)) return MATCH.acronym;
  // Typo tolerance is length-proportional, and DELIBERATELY tight: at two edits on a
  // four-letter query "loan" reached "boAt" and "whey" reached "The Body Shop" (both
  // screenshotted), which is a wrong answer wearing a right answer's clothes. One edit
  // is what catches the real failure — a transposed or doubled letter, "myntar",
  // "flipkrat" — and a second edit only pays for itself once the query is long enough
  // to still be unambiguous.
  if (q.length >= 4) {
    const max = q.length >= 7 ? 2 : 1;
    let d = distance(q, s, max);
    for (const w of words) if (w.length >= 3) d = Math.min(d, distance(q, w, max));
    if (d >= 1 && d <= max) return MATCH.typo - 6 * d;
  }
  if (qs.length >= 3 && isSubsequence(qs, ss)) return MATCH.subsequence;
  return 0;
}

/**
 * The score for a whole query against one candidate's fields — 0 when nothing
 * matched, up to 100 for an exact hit on a full-weight field.
 *
 * A multi-word query is scored as an AND over its words ("sbi card" must find both
 * somewhere), averaged and discounted slightly so a single clean phrase hit still
 * outranks two scattered word hits. If any word matches nothing, the phrase score
 * stands alone — that keeps "iphone 15" scoring on the phrase rather than being
 * zeroed by the "15".
 */
export function score(query: string, fields: MatchField[]): number {
  const q = soft(query);
  if (!q) return 0;
  const best = (term: string) => fields.reduce((m, f) => Math.max(m, fieldScore(term, f.text) * (f.weight ?? 1)), 0);

  const phrase = best(q);
  const words = q.split(' ');
  if (words.length < 2) return phrase;

  let sum = 0;
  for (const w of words) {
    const s = best(w);
    if (!s) return phrase;
    sum += s;
  }
  return Math.max(phrase, (sum / words.length) * 0.92);
}

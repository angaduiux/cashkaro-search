/**
 * Web-results feed for the Expand Search band — an endless, deterministic pager
 * over the REAL product catalog (`./catalog.ts` PRODUCTS; photos, titles, prices
 * and rates all transcribed — nothing invented). Query-matched products lead the
 * feed, then the rest of the catalog rotated by a query-seeded offset, so every
 * query reads as its own result stream; the stream wraps around the pool, so for
 * showcase purposes it is NEVER empty and never ends. Merchant mapping is
 * deterministic per product (hash of the catalog id): mapped merchants keep the
 * catalog cashback, unmapped ones carry `{ type: 'none' }` and a null
 * `mappedPartnerId` — the Q-010 gate on Google-Shopping cashback — so the grid
 * naturally mixes cards with and without a cashback pill.
 */
import { ResultItem } from './dataContract';
import { PRODUCTS, Product } from './catalog';
import { BRAND, PRODUCT_IMG } from './realData';

/** Small stable string hash — the feed must be deterministic across renders
 *  (and `Math.random` is unavailable in workflow-style tooling anyway). */
const hash = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

/**
 * Order the catalog for a query: scored matches first (same scoring shape as
 * `searchProducts`), then the remainder rotated by a query-seeded offset.
 * Seed results (the curated `webResultsForWhey` case) are excluded — by TITLE
 * and by PHOTO, because a curated SKU and its catalog row can word the same
 * product differently while sharing the same normalised photo asset, and two
 * identical photos in one grid read as a duplicate.
 */
function orderedPool(query: string, seed: ResultItem[]): Product[] {
  const q = query.trim().toLowerCase();
  const excludedTitles = new Set(seed.map((r) => r.title.toLowerCase()));
  const excludedPhotos = new Set(seed.map((r) => r.productImage).filter((x) => x != null));
  const scored = PRODUCTS.filter(
    (p) => !excludedTitles.has(p.title.toLowerCase()) && !excludedPhotos.has(PRODUCT_IMG[p.imgKey]),
  ).map((p) => {
    const hay = [p.title, p.brand, p.category, ...p.keywords].map((x) => x.toLowerCase());
    let score = 0;
    for (const h of hay) {
      if (h === q) score = Math.max(score, 100);
      else if (q && h.startsWith(q)) score = Math.max(score, 70);
      else if (q && (h.includes(q) || q.includes(h))) score = Math.max(score, 40);
    }
    return { p, score };
  });
  const matches = scored.filter((x) => x.score > 0).sort((a, b) => b.score - a.score).map((x) => x.p);
  const rest = scored.filter((x) => x.score === 0).map((x) => x.p);
  const off = rest.length ? hash(q || 'web') % rest.length : 0;
  const pool = [...matches, ...rest.slice(off), ...rest.slice(0, off)];
  return pool.length ? pool : PRODUCTS; // exclusions can never empty a 40-SKU pool, but never return []
}

/** Mapped-merchant gate: stable per product, ~2/3 mapped — a cashback app's web
 *  results should still mostly earn, with unmapped merchants mixed through. */
const isMapped = (p: Product): boolean => hash(p.id) % 3 > 0;

function webItem(p: Product, i: number): ResultItem {
  const mapped = isMapped(p);
  return {
    id: `web-${i}-${p.id}`,
    archetype: '10_beyond_catalogue',
    source: 'google_shopping',
    title: p.title,
    subtitle: p.brand,
    logo: p.brandKey ? BRAND[p.brandKey].logo : null,
    logoBg: p.brandKey ? BRAND[p.brandKey].bg : undefined,
    productImage: PRODUCT_IMG[p.imgKey], // real product photo — never a logo fallback (D003)
    cashback: !mapped
      ? { type: 'none' }
      : p.cbFlat
      ? { type: 'flat_inr', value: p.cbFlat, prefix: 'flat' }
      : p.cbPct
      ? { type: 'pct_single', value: p.cbPct }
      : { type: 'none' },
    mappedPartnerId: mapped ? p.brandKey ?? p.brand.toLowerCase() : null,
    ctaLabel: `₹${p.price.toLocaleString('en-IN')}`,
    originalPrice: p.mrp > p.price ? `₹${p.mrp.toLocaleString('en-IN')}` : undefined,
  };
}

/**
 * The feed: `feed(i)` is the i-th generated web result for this query, for any
 * i ≥ 0 — indices wrap around the ordered pool (ids stay unique per slot), which
 * is what lets the Expand Search grid grow for as long as the user scrolls.
 */
export function webFeed(query: string, seed: ResultItem[] = []): (i: number) => ResultItem {
  const pool = orderedPool(query, seed);
  return (i: number) => webItem(pool[i % pool.length], i);
}

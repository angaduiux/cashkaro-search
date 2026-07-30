/**
 * Trending pill content — the Explore "Trending" queries plus the image reel each
 * pill's circular thumb rolls through (D081). Content lives here, not in the
 * screen, so no component invents imagery (D004).
 *
 * A reel is resolved from the app's OWN resolvers, in this order, so the circle
 * always shows what the query actually leads to:
 *
 *  0. `VERTICAL_REELS` — a finance/travel query is answered by its vertical and
 *     stops there, so a long phrase can't pick up a stray product keyword.
 *  1. `searchProducts(query)` — real catalog SKUs, then narrowed to the top hit's
 *     brand, so "iphone 16" rolls Apple and never a Galaxy that merely matched
 *     the shared "phone" keyword. A thin result is topped up from the rest of that
 *     brand's catalog, so the reel has something to roll to.
 *  2. The matched store's category (`searchStores` → `productsInCategory`) for a
 *     brand query with no SKU of its own ("myntra" → what Myntra sells).
 *  3. `categoryIcon(query)` — the destination category's illustration, so no pill
 *     can fall back to the search glyph the disc replaced.
 *
 * `VERTICAL_REELS` holds what the catalog has no SKUs for: the destination brands
 * for travel, the real card renders for cards, the ranked lenders read off the loans
 * page itself, and savings — whose banks all carry favicon-CDN logos, so it resolves
 * to its category illustration and the disc stays still.
 *
 * Lazy memo, never a module-scope const (D024) — resolving touches PRODUCT_IMG
 * across the catalog↔realData import cycle, which at module-eval is a TDZ crash.
 */
import { PRODUCTS, searchProducts, searchStores, productsInCategory, type Product } from './catalog';
import { PRODUCT_IMG, cardSbiCashback, cardAxisFlipkart, cardFederalScapia, caseLoans, caseSavings } from './realData';
import { categoryIcon } from './categoryIcons';
import type { SerpModel } from './dataContract';
import { storeTileByKey } from './storeTiles';

export type TrendingPill = {
  /** What a tap commits — the string the resolvers actually match on. */
  query: string;
  /** What the pill reads. Same `goto`-vs-`title` split the type-ahead rows use. */
  label: string;
  /** Bundled require() ids the thumb rolls through. Never empty. */
  images: number[];
};

/**
 * The trending set (Figma W4 home), in reading order. The last two carry the
 * finance verticals a shopping query can't reach: "personal loan" is matched on the
 * word by `financeSerp` → the loans page (D052), and the savings string is a
 * `REAL_CASES` key, so both land on a real result page rather than recovery.
 */
const QUERIES: { query: string; label?: string }[] = [
  { query: 'iphone 16' },
  { query: 'myntra' },
  { query: 'nike' },
  { query: 'flight tickets' },
  { query: 'best cashback card' },
  { query: 'personal loan' },
  // The savings page is keyed on its full string, but that label alone fills a row
  // — so the pill reads short and the tap still commits the key.
  { query: 'zero balance savings account', label: 'savings account' },
];

/** Longest reel we keep — five images is already ~35s of dwell per pill. */
const MAX_REEL = 5;
/** Below this a reel reads as a static image, so it gets topped up. */
const MIN_REEL = 3;

/**
 * Queries whose destination has no catalog SKU. Travel shows the OTAs and
 * airlines the query resolves to (design-system tile logos); cards show the card
 * renders themselves — a card's artwork IS its product shot.
 */
const VERTICAL_REELS: Record<string, () => (number | null | undefined)[]> = {
  'flight tickets': () =>
    ['cleartrip', 'goibibo', 'skyscanner', 'etihad', 'airIndiaExpress', 'booking'].map((k) => storeTileByKey(k)?.logo),
  // `artwork` is typed `string | number | null` for feed URLs; a bundled require()
  // is only a *number* on native (RN-Web hands back a module object), so this
  // rejects string URLs rather than testing for `number` — that test dropped every
  // card on web and the pill fell back to the search glyph.
  'best cashback card': () =>
    [cardSbiCashback, cardAxisFlipkart, cardFederalScapia].map((c) => (typeof c.artwork === 'string' ? null : c.artwork)),
  // The lenders actually ranked on the loans page (Axis, HDFC, Bajaj Finserv), read
  // off that page rather than restated — their badges are bundled design-system art.
  'personal loan': () => bundledLogos(caseLoans),
  // Savings falls through to the category illustration on purpose: every bank on
  // that page carries a favicon-CDN logo, and the app never puts one on a tile
  // (AGENTS). So this disc shows the vertical's own artwork and stays still.
  'zero balance savings account': () => bundledLogos(caseSavings),
};

/** A destination page's own row logos, keeping only bundled art (never a CDN URL). */
function bundledLogos(model: SerpModel): (number | null)[] {
  return model.sections.flatMap((s) => s.items.map((i) => (typeof i.logo === 'string' ? null : i.logo)));
}

let memo: TrendingPill[] | null = null;

/** The trending pills with their reels resolved. Memoised on first call. */
export function trendingPills(): TrendingPill[] {
  if (!memo) memo = QUERIES.map(({ query, label }) => ({ query, label: label ?? query, images: reel(query) }));
  return memo;
}

function reel(query: string): number[] {
  const out: number[] = [];
  const push = (img?: number | null) => {
    if (img != null && !out.includes(img) && out.length < MAX_REEL) out.push(img);
  };

  // 0 — a VERTICAL query is answered by its vertical, full stop. It never falls
  //     through to the product paths below: `searchProducts` scores on "either
  //     string contains the other", so a long finance phrase picks up a stray
  //     keyword and "zero balance savings account" rolled headphones.
  const vertical = VERTICAL_REELS[query];
  if (vertical) {
    vertical().forEach(push);
    if (!out.length) push(categoryIcon(query));
    return out;
  }

  // 1 — real SKUs for the query, narrowed to the best hit's brand. Two iPhone
  //     photos read as one static image, so a thin reel is topped up with the rest
  //     of that brand's catalog — "iphone 16" rolls Apple, still never a Galaxy.
  const hits = searchProducts(query);
  if (hits.length) {
    const brand = hits[0].subtitle;
    hits.filter((h) => h.subtitle === brand).forEach((h) => push(h.productImage));
    if (out.length < MIN_REEL) {
      spreadBySub(PRODUCTS.filter((p) => p.brand === brand)).forEach((p) => push(PRODUCT_IMG[p.imgKey]));
    }
  }

  // 2 — a brand query with no SKU: what that store sells, one sub-category at a
  //     time so the reel doesn't open with four near-identical shoes.
  if (!out.length) {
    const store = searchStores(query)[0];
    if (store) spreadBySub(productsInCategory(store.category)).forEach((p) => push(PRODUCT_IMG[p.imgKey]));
  }

  // 3 — last resort: the destination category's own illustration, so a pill can
  //     never fall back to the search glyph it was meant to replace.
  if (!out.length) push(categoryIcon(query));

  return out;
}

/** Round-robin over `sub` so consecutive reel frames look different. */
function spreadBySub(products: Product[]): Product[] {
  const bySub = new Map<string, Product[]>();
  for (const p of products) bySub.set(p.sub, [...(bySub.get(p.sub) ?? []), p]);
  const lanes = [...bySub.values()];
  const out: Product[] = [];
  for (let i = 0; out.length < products.length; i++) {
    for (const lane of lanes) if (lane[i]) out.push(lane[i]);
    if (i > products.length) break; // guard: never spin on an empty lane set
  }
  return out;
}

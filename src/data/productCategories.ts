/**
 * Product category pages — taxonomy + browse engine.
 *
 * A product category page answers one question: "what should I buy in <category>,
 * and what do I earn back on it?" Everything on the page is DERIVED from the real
 * product rows in ./catalog.ts (`PRODUCTS`) — no counts, rates or facet labels are
 * hand-written, so a page can never claim "20+ results" it doesn't have (§7
 * Placeholder Protocol).
 *
 * Layers:
 *  - taxonomy   productCategories() (page-level) + SUB_LABELS (in-page facet)
 *  - derivation cashbackPct/Amt, discountPct, finalPrice — one place, so the card,
 *               the sort and the filter all agree on the same number
 *  - browse     browseProducts(cat, filters, sort) + facets(cat, filters) with
 *               proper faceted counts (each dimension counted with the OTHER
 *               dimensions applied, the way a real search backend does it)
 */
import { Cat, Product, productsInCategory, storesInCategory, PRODUCTS } from './catalog';
import { categoryIconKey } from './categoryIcons';

// ── Taxonomy ─────────────────────────────────────────────────────────────────
export type ProductCategory = {
  key: string; // route key
  cat: Cat; // catalog category it draws products + stores from
  title: string; // page title
  tagline: string; // one line describing what's inside
};

/**
 * A category page is only offered when the catalog has enough real products to
 * fill a browsable grid. Home (1 product) and Grocery (1) are therefore not
 * category pages yet — they surface through search instead. Raising the catalog
 * adds the page automatically; nothing here needs editing.
 */
const MIN_PRODUCTS = 3;

const CANDIDATES: ProductCategory[] = [
  { key: 'electronics', cat: 'Electronics', title: 'Electronics & Gadgets', tagline: 'Phones, audio, wearables & accessories' },
  { key: 'fashion', cat: 'Fashion', title: 'Fashion & Footwear', tagline: 'Shoes, clothing & everyday accessories' },
  { key: 'beauty', cat: 'Beauty', title: 'Beauty & Grooming', tagline: 'Skincare, makeup, haircare & fragrance' },
  { key: 'nutrition', cat: 'Nutrition', title: 'Nutrition & Fitness', tagline: 'Whey, supplements & healthy foods' },
  { key: 'home', cat: 'Home', title: 'Home & Furniture', tagline: 'Mattresses, furniture & decor' },
  { key: 'grocery', cat: 'Grocery', title: 'Grocery & Fresh', tagline: 'Fresh meat, staples & daily needs' },
];

/**
 * The category pages this build offers. Computed LAZILY and memoised: `catalog` and
 * `realData` form an import cycle, so reading `PRODUCTS` at module-eval time would
 * hit the partially-initialised catalog (TDZ) depending on which module the entry
 * point pulls first. Call it from render/handlers, never at module scope.
 */
let memo: ProductCategory[] | null = null;
export function productCategories(): ProductCategory[] {
  if (!memo) memo = CANDIDATES.filter((c) => productsInCategory(c.cat).length >= MIN_PRODUCTS);
  return memo;
}

/** Sub-category labels, in the order they should appear as browse chips. */
export const SUB_LABELS: Record<string, string> = {
  mobiles: 'Mobiles',
  audio: 'Audio',
  wearables: 'Wearables',
  gaming: 'Gaming',
  readers: 'Tablets & Readers',
  shoes: 'Shoes',
  clothing: 'Clothing',
  makeup: 'Makeup',
  skincare: 'Skincare',
  haircare: 'Haircare',
  fragrance: 'Fragrance',
  whey: 'Whey Protein',
  supplements: 'Supplements',
  foods: 'Healthy Foods',
  furniture: 'Furniture',
  fresh: 'Fresh Meat',
  accessories: 'Accessories',
};

const SUB_ORDER = Object.keys(SUB_LABELS);

export const categoryByKey = (key: string): ProductCategory | undefined =>
  productCategories().find((c) => c.key === key);

/**
 * Store tiles shown on each category page, curated by key from the Figma
 * "Storepage Tiles" set (AGENTS.md: a store card may ONLY render those brands).
 * The generic `storeTileSlots` hash-mapping is fine for a search rail but not
 * here — a page headed "Electronics stores" cannot show Duolingo. Marketplaces
 * (Amazon) legitimately appear in several retail categories.
 */
const CATEGORY_STORE_TILES: Record<string, string[]> = {
  electronics: ['croma', 'amazon'],
  fashion: ['ajio', 'amazon'],
  beauty: ['nykaa', 'mamaearth', 'dotKey', 'dermaCo', 'foxtale', 'perfora', 'nua'],
  nutrition: ['healthkart', 'muscleblaze', 'nutrabay', 'hkVitals', 'truebasics', 'neuro', 'hyugalife'],
  home: ['amazon'],
  grocery: ['amazon'],
};

/** Tile keys for a category page's stores rail (empty ⇒ hide the rail). */
export const categoryStoreTileKeys = (key: string): string[] => CATEGORY_STORE_TILES[key] ?? [];

/**
 * Which of the real deal creatives (`realData.ALL_DEALS`, by id) belong on each
 * category page. Same reasoning as the store tiles: an AJIO fashion banner under
 * "Nutrition & Fitness" is noise, and a category with no matching creative shows
 * no offers band at all rather than a borrowed one. Amazon is a marketplace, so
 * its creative is valid across retail categories.
 */
const CATEGORY_DEAL_IDS: Record<string, string[]> = {
  electronics: ['deal-croma', 'deal-amazon'],
  fashion: ['deal-ajio', 'deal-amazon'],
  beauty: ['deal-s3beauty', 'deal-amazon'],
  nutrition: [],
  home: ['deal-amazon'],
  grocery: ['deal-amazon'],
};

/** Deal-creative ids for a category page's offers band (empty ⇒ hide the band). */
export const categoryDealIds = (key: string): string[] => CATEGORY_DEAL_IDS[key] ?? [];

// ── Derived product numbers (single source of truth) ─────────────────────────
/** Effective CashKaro rate, whether the row carries a % or a flat ₹ amount. */
export const cashbackPct = (p: Product): number =>
  p.cbPct ?? (p.cbFlat && p.price > 0 ? (p.cbFlat / p.price) * 100 : 0);
/** Rupees back on this product at its current price. */
export const cashbackAmt = (p: Product): number =>
  p.cbFlat ?? (p.cbPct ? Math.round((p.price * p.cbPct) / 100) : 0);
export const discountPct = (p: Product): number =>
  p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;
/** Price after CashKaro cashback — the number the page is really selling. */
export const finalPrice = (p: Product): number => p.price - cashbackAmt(p);

export const inr = (n: number): string => `₹${Math.round(n).toLocaleString('en-IN')}`;

// ── Sort ─────────────────────────────────────────────────────────────────────
export type SortKey = 'popular' | 'cashback' | 'discount' | 'price_asc' | 'price_desc';

export const SORTS: { key: SortKey; label: string; hint: string }[] = [
  { key: 'popular', label: 'Popular', hint: 'What members buy most in this category' },
  { key: 'cashback', label: 'Highest cashback', hint: 'Best CashKaro rate first' },
  { key: 'discount', label: 'Biggest discount', hint: 'Largest drop off MRP first' },
  { key: 'price_asc', label: 'Price: low to high', hint: 'Cheapest first' },
  { key: 'price_desc', label: 'Price: high to low', hint: 'Premium first' },
];

export const sortLabel = (k: SortKey): string => SORTS.find((s) => s.key === k)?.label ?? '';

// ── Filters ──────────────────────────────────────────────────────────────────
/** Canonical price bands. Only bands with stock in the category are offered. */
const BANDS: { key: string; label: string; min: number; max: number }[] = [
  { key: 'u500', label: 'Under ₹500', min: 0, max: 500 },
  { key: '500_1k', label: '₹500 – ₹1,000', min: 500, max: 1000 },
  { key: '1k_5k', label: '₹1,000 – ₹5,000', min: 1000, max: 5000 },
  { key: '5k_20k', label: '₹5,000 – ₹20,000', min: 5000, max: 20000 },
  { key: 'o20k', label: 'Over ₹20,000', min: 20000, max: Number.POSITIVE_INFINITY },
];

/** Cashback thresholds offered as a filter; only ones with stock are shown. */
const CB_STEPS = [3, 5, 8, 10];

export type Filters = {
  /** In-page navigation, not a filter chip — kept here so one object drives the grid. */
  sub: string | null;
  brands: string[];
  bands: string[];
  minCb: number | null;
};

export const NO_FILTERS: Filters = { sub: null, brands: [], bands: [], minCb: null };

/** Filters the user set explicitly (the count on the Filter pill). Sub excluded. */
export const activeFilterCount = (f: Filters): number =>
  f.brands.length + f.bands.length + (f.minCb != null ? 1 : 0);

export const toggle = (list: string[], key: string): string[] =>
  list.includes(key) ? list.filter((k) => k !== key) : [...list, key];

const inBand = (p: Product, key: string): boolean => {
  const b = BANDS.find((x) => x.key === key);
  return !!b && p.price >= b.min && p.price < b.max;
};

type Dim = 'sub' | 'brands' | 'bands' | 'minCb';

/** Does the product pass every filter dimension except `skip`? */
function passes(p: Product, f: Filters, skip?: Dim): boolean {
  if (skip !== 'sub' && f.sub && p.sub !== f.sub) return false;
  if (skip !== 'brands' && f.brands.length && !f.brands.includes(p.brand)) return false;
  if (skip !== 'bands' && f.bands.length && !f.bands.some((b) => inBand(p, b))) return false;
  if (skip !== 'minCb' && f.minCb != null && cashbackPct(p) < f.minCb) return false;
  return true;
}

const SORTERS: Record<SortKey, (a: Product, b: Product) => number> = {
  popular: () => 0, // catalog order
  cashback: (a, b) => cashbackPct(b) - cashbackPct(a),
  discount: (a, b) => discountPct(b) - discountPct(a),
  price_asc: (a, b) => a.price - b.price,
  price_desc: (a, b) => b.price - a.price,
};

/** The grid's product list for the current category, filters and sort. */
export function browseProducts(cat: Cat, f: Filters, sort: SortKey): Product[] {
  const out = productsInCategory(cat).filter((p) => passes(p, f));
  return sort === 'popular' ? out : [...out].sort(SORTERS[sort]);
}

export type Facet = { key: string; label: string; count: number };
export type Facets = { brands: Facet[]; bands: Facet[]; cashback: Facet[] };

/**
 * Facet options with live counts. Each option is counted with every OTHER
 * dimension applied but its own dimension released — so ticking a second brand
 * shows how many products it would ADD, and an option that can never match is
 * dropped rather than shown as a dead end.
 */
export function facets(cat: Cat, f: Filters): Facets {
  const all = productsInCategory(cat);
  const countIf = (skip: Dim, pred: (p: Product) => boolean) =>
    all.filter((p) => passes(p, f, skip) && pred(p)).length;

  const brandNames = Array.from(new Set(all.map((p) => p.brand))).sort((a, b) => a.localeCompare(b));

  return {
    brands: brandNames
      .map((b) => ({ key: b, label: b, count: countIf('brands', (p) => p.brand === b) }))
      .filter((x) => x.count > 0 || f.brands.includes(x.key)),
    bands: BANDS.map((b) => ({ key: b.key, label: b.label, count: countIf('bands', (p) => inBand(p, b.key)) })).filter(
      (x) => x.count > 0 || f.bands.includes(x.key),
    ),
    cashback: CB_STEPS.map((v) => ({
      key: String(v),
      label: `${v}% & above`,
      count: countIf('minCb', (p) => cashbackPct(p) >= v),
    })).filter((x) => x.count > 0),
  };
}

/** Sub-category chips for a category, with counts, ignoring the sub filter itself. */
export function subChips(cat: Cat, f: Filters): Facet[] {
  const all = productsInCategory(cat);
  const present = Array.from(new Set(all.map((p) => p.sub))).sort(
    (a, b) => SUB_ORDER.indexOf(a) - SUB_ORDER.indexOf(b),
  );
  return present
    .map((s) => ({
      key: s,
      label: SUB_LABELS[s] ?? s,
      count: all.filter((p) => p.sub === s && passes(p, f, 'sub')).length,
    }))
    .filter((x) => x.count > 0 || f.sub === x.key);
}

// ── Page stats ───────────────────────────────────────────────────────────────
export type CategoryStats = {
  products: number;
  brands: number;
  stores: number;
  maxCbPct: number; // headline "up to X%" — highest real product rate in the set
  maxDiscount: number;
  bestSaving: number; // largest ₹ back on a single product
};

export function categoryStats(cat: Cat): CategoryStats {
  const items = productsInCategory(cat);
  return {
    products: items.length,
    brands: new Set(items.map((p) => p.brand)).size,
    stores: storesInCategory(cat).length,
    maxCbPct: items.reduce((m, p) => Math.max(m, cashbackPct(p)), 0),
    maxDiscount: items.reduce((m, p) => Math.max(m, discountPct(p)), 0),
    bestSaving: items.reduce((m, p) => Math.max(m, cashbackAmt(p)), 0),
  };
}

// ── Free-text → category page ────────────────────────────────────────────────
export type CategoryTarget = { key: string; sub?: string };

/**
 * Resolve any category-ish label ("Mobile Phones", "Whey Protein", "Beauty &
 * Cosmetics", "shoes") to the page — and the sub-chip — it should open. Used by
 * the SERP category rows, the suggestions Categories group, and deep links, so
 * every "category" surface in the app lands on the same real page.
 */
export function resolveCategoryTarget(text: string): CategoryTarget | undefined {
  const q = (text || '').trim().toLowerCase();
  if (!q) return undefined;

  const byKey = productCategories().find((c) => c.key === q);
  if (byKey) return { key: byKey.key };

  // Sub-category label/key ("mobiles", "whey protein", "skincare").
  for (const c of productCategories()) {
    for (const s of subChips(c.cat, NO_FILTERS)) {
      const label = s.label.toLowerCase();
      if (q === s.key || q === label || label.includes(q) || q.includes(label)) return { key: c.key, sub: s.key };
    }
  }

  // Category name / page title word ("electronics", "fashion & lifestyle").
  for (const c of productCategories()) {
    const cat = c.cat.toLowerCase();
    if (q.includes(cat) || cat.includes(q) || c.title.toLowerCase().includes(q)) return { key: c.key };
  }

  // Product keyword, prefix-anchored so "Mobile Phones" → Electronics/Mobiles but
  // "Lotions & Massage Oil" doesn't land on a hair-oil sub-category.
  const hit = PRODUCTS.find((p) => p.keywords.some((k) => k === q || q.startsWith(k) || k.startsWith(q)));
  if (hit) {
    const page = productCategories().find((c) => c.cat === hit.category);
    if (page) return { key: page.key, sub: hit.sub };
  }

  // Last resort: the icon alias table is the app's broadest label classifier, so
  // "Deodorants" / "Bath & Body" still land on Beauty rather than a dead end.
  const iconKey = categoryIconKey(q);
  const viaIcon = iconKey ? ICON_KEY_TO_PAGE[iconKey] : undefined;
  if (viaIcon) {
    const page = productCategories().find((c) => c.key === viaIcon);
    if (page) return { key: page.key };
  }
  return undefined;
}

/** Icon-alias bucket → category page. Buckets with no page (loans, travel, …) are
 *  deliberately absent: the caller then falls back to searching the label. */
const ICON_KEY_TO_PAGE: Record<string, string> = {
  beauty: 'beauty',
  mobiles: 'electronics',
  electronics: 'electronics',
  fashion: 'fashion',
  'health-wellness': 'nutrition',
  'home-kitchen': 'home',
  'food-grocery': 'grocery',
};

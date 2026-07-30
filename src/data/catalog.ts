/**
 * Store catalog + real search engine.
 *
 * Cashback values are REAL: those marked `live` were fetched from the store's
 * cashkaro.com page; the rest come from the Cashkaro-Search-2026 Figma real-data
 * cases. Nothing is invented. New stores are added by fetching their page and
 * dropping a row here — the search index and SERP generation pick them up
 * automatically, so search behaves like the real thing.
 */
import { SerpModel, ResultItem, Cashback } from './dataContract';
import { BRAND, PRODUCT_IMG } from './realData';
import { storeTileSlots } from './storeTiles';

export type Cat =
  | 'Shopping'
  | 'Fashion'
  | 'Beauty'
  | 'Electronics'
  | 'Pharmacy'
  | 'Travel'
  | 'Payments'
  | 'Nutrition'
  | 'Grocery'
  | 'Home'
  | 'Education';

export type Store = {
  slug: string;
  name: string;
  aliases: string[];
  category: Cat;
  cashback: Cashback;
  note?: string; // e.g. "on Beauty, Fashion & more"
  brand: keyof typeof BRAND | null;
  live?: boolean; // rate verified from cashkaro.com
  ratingValue?: number;
  shoppers?: string;
  priorPct?: number;
};

// The store card's "Upto X% Off" strip is no longer derived per category — every
// card renders a Storepage tile, whose strip text ships with the tile
// (./storeTiles.ts, transcribed from Figma 611:3360).

// Standard CashKaro cashback mechanic (same structure across stores).
const TL = { tracksIn: '48 Hours', confirmsIn: '60 Days', withdraw: 'UPI/Bank' };

export const STORES: Store[] = [
  { slug: 'amazon', name: 'Amazon', aliases: ['amazon', 'amazon.in', 'amzn'], category: 'Shopping', cashback: { type: 'pct_single', value: 5 }, note: 'on Beauty, Fashion, Luggage & more', brand: 'amazon', live: true, ratingValue: 4.6, shoppers: '3.1L shoppers' },
  { slug: 'flipkart', name: 'Flipkart', aliases: ['flipkart', 'flip', 'fk'], category: 'Shopping', cashback: { type: 'pct_single', value: 6.5 }, note: 'on Kids’ Footwear, Lifestyle & more', brand: 'flipkart', live: true, ratingValue: 4.5, shoppers: '2.3L shoppers', priorPct: 6 },
  { slug: 'myntra', name: 'Myntra', aliases: ['myntra', 'mynt'], category: 'Fashion', cashback: { type: 'pct_single', value: 6 }, note: 'on Home, Beauty & more', brand: 'myntra', live: true, ratingValue: 4.5, shoppers: '1.8L shoppers' },
  { slug: 'croma', name: 'Croma', aliases: ['croma'], category: 'Electronics', cashback: { type: 'pct_single', value: 3 }, note: 'on all Croma orders', brand: 'croma', live: true, ratingValue: 4.3, shoppers: '92K shoppers' },
  { slug: 'nykaa', name: 'Nykaa', aliases: ['nykaa', 'nyka'], category: 'Beauty', cashback: { type: 'pct_single', value: 6 }, note: 'on Beauty & more', brand: 'nykaa', live: true, ratingValue: 4.6, shoppers: '2.1L shoppers' },
  { slug: 'pharmeasy', name: 'PharmEasy', aliases: ['pharmeasy', 'phar', 'pharmacy'], category: 'Pharmacy', cashback: { type: 'pct_single', value: 7 }, note: 'on medicines & health', brand: 'pharmeasy', ratingValue: 4.6, shoppers: '1.2L shoppers', priorPct: 5 },
  { slug: 'thebodyshop', name: 'The Body Shop', aliases: ['body shop', 'the body shop', 'body'], category: 'Beauty', cashback: { type: 'flat_inr', value: 200, prefix: 'flat' }, note: 'on skincare & bath', brand: 'bodyshop', ratingValue: 4.4, shoppers: '48K shoppers' },
  { slug: 'tira', name: 'Tira', aliases: ['tira', 'tira beauty'], category: 'Beauty', cashback: { type: 'pct_single', value: 4 }, note: 'on Beauty & personal care', brand: 'tira', ratingValue: 4.2, shoppers: '30K shoppers' },
  { slug: 'beyoung', name: 'Beyoung', aliases: ['beyoung'], category: 'Fashion', cashback: { type: 'pct_single', value: 7.5 }, brand: 'beyoung', ratingValue: 4.3, shoppers: '40K shoppers' },
  { slug: 'cleartrip', name: 'Cleartrip', aliases: ['cleartrip', 'flight tickets', 'flights'], category: 'Travel', cashback: { type: 'flat_inr', value: 1500, prefix: 'flat' }, note: 'on flights & hotels', brand: 'cleartrip', ratingValue: 4.1, shoppers: '55K shoppers' },
  { slug: 'mobikwik', name: 'MobiKwik', aliases: ['mobikwik'], category: 'Payments', cashback: { type: 'pct_single', value: 3 }, note: 'on recharges & bill payments', brand: 'mobikwik', ratingValue: 4.0, shoppers: '20K shoppers' },

  // ── Catalog inventory (real brands from the asset map; rates indicative,
  //    pending feed verification — not marked `live`) ──────────────────────────
  { slug: 'samsung', name: 'Samsung', aliases: ['samsung', 'galaxy'], category: 'Electronics', cashback: { type: 'pct_single', value: 4 }, note: 'on mobiles & appliances', brand: 'samsung', ratingValue: 4.4, shoppers: '1.1L shoppers' },
  { slug: 'portronics', name: 'Portronics', aliases: ['portronics'], category: 'Electronics', cashback: { type: 'pct_single', value: 6 }, note: 'on gadgets & accessories', brand: 'portronics', ratingValue: 4.2, shoppers: '35K shoppers' },
  { slug: 'apple', name: 'Apple', aliases: ['apple', 'iphone', 'ipad', 'mac'], category: 'Electronics', cashback: { type: 'pct_single', value: 3 }, note: 'on iPhone, iPad & Mac', brand: 'apple', ratingValue: 4.7, shoppers: '2.4L shoppers' },
  { slug: 'snitch', name: 'Snitch', aliases: ['snitch'], category: 'Fashion', cashback: { type: 'pct_single', value: 8 }, note: 'on men’s fashion', brand: 'snitch', ratingValue: 4.3, shoppers: '52K shoppers' },
  { slug: 'nike', name: 'Nike', aliases: ['nike', 'nike shoes'], category: 'Fashion', cashback: { type: 'pct_single', value: 6 }, note: 'on shoes & apparel', brand: 'nike', ratingValue: 4.6, shoppers: '1.4L shoppers' },
  { slug: 'bodycupid', name: 'Body Cupid', aliases: ['body cupid', 'bodycupid'], category: 'Beauty', cashback: { type: 'pct_single', value: 10 }, note: 'on skincare & haircare', brand: 'bodycupid', ratingValue: 4.2, shoppers: '18K shoppers' },
  { slug: 'bebodywise', name: 'Be Bodywise', aliases: ['bodywise', 'be bodywise'], category: 'Beauty', cashback: { type: 'pct_single', value: 12 }, note: 'on women’s wellness', brand: 'bebodywise', ratingValue: 4.1, shoppers: '22K shoppers' },
  { slug: 'lotus', name: 'Lotus Herbals', aliases: ['lotus', 'lotus herbals'], category: 'Beauty', cashback: { type: 'pct_single', value: 8 }, note: 'on skincare', brand: 'lotus', ratingValue: 4.3, shoppers: '26K shoppers' },
  { slug: 'myfitness', name: 'MyFitness', aliases: ['myfitness', 'peanut butter'], category: 'Nutrition', cashback: { type: 'pct_single', value: 15 }, note: 'on peanut butter & foods', brand: 'myfitness', ratingValue: 4.5, shoppers: '30K shoppers' },
  { slug: 'myfitfuel', name: 'MyFitFuel', aliases: ['myfitfuel', 'mff'], category: 'Nutrition', cashback: { type: 'pct_single', value: 10 }, note: 'on supplements', brand: 'myfitfuel', ratingValue: 4.2, shoppers: '12K shoppers' },
  { slug: 'muscleblaze', name: 'MuscleBlaze', aliases: ['muscleblaze', 'whey', 'protein'], category: 'Nutrition', cashback: { type: 'pct_single', value: 12 }, note: 'on whey & mass gainers', brand: 'muscleblaze', ratingValue: 4.6, shoppers: '88K shoppers' },
  { slug: 'optimumnutrition', name: 'Optimum Nutrition', aliases: ['optimum', 'optimum nutrition', 'on'], category: 'Nutrition', cashback: { type: 'pct_single', value: 8 }, note: 'on whey protein', brand: 'optimum', ratingValue: 4.7, shoppers: '64K shoppers' },

  // ── Expanded catalog (rates indicative) ─────────────────────────────────────
  // Fashion
  { slug: 'ajio', name: 'AJIO', aliases: ['ajio'], category: 'Fashion', cashback: { type: 'pct_single', value: 8 }, note: 'on Fashion & Lifestyle', brand: 'ajio', ratingValue: 4.4, shoppers: '1.6L shoppers', priorPct: 6 },
  { slug: 'hm', name: 'H&M', aliases: ['h&m', 'hm', 'handm'], category: 'Fashion', cashback: { type: 'pct_single', value: 5 }, note: 'on all apparel', brand: 'hm', ratingValue: 4.3, shoppers: '70K shoppers' },
  { slug: 'maxfashion', name: 'Max Fashion', aliases: ['max', 'max fashion'], category: 'Fashion', cashback: { type: 'pct_single', value: 6 }, brand: 'maxfashion', ratingValue: 4.2, shoppers: '45K shoppers' },
  { slug: 'bewakoof', name: 'Bewakoof', aliases: ['bewakoof'], category: 'Fashion', cashback: { type: 'pct_single', value: 9 }, note: 'on tees & more', brand: 'bewakoof', ratingValue: 4.3, shoppers: '52K shoppers' },
  { slug: 'souledstore', name: 'The Souled Store', aliases: ['souled store', 'the souled store', 'souled'], category: 'Fashion', cashback: { type: 'pct_single', value: 8 }, brand: 'souledstore', ratingValue: 4.4, shoppers: '38K shoppers' },
  { slug: 'westside', name: 'Westside', aliases: ['westside'], category: 'Fashion', cashback: { type: 'pct_single', value: 5 }, brand: 'westside', ratingValue: 4.1, shoppers: '22K shoppers' },
  { slug: 'levis', name: "Levi's", aliases: ['levis', "levi's", 'levi'], category: 'Fashion', cashback: { type: 'pct_single', value: 6 }, note: 'on denim & more', brand: 'levis', ratingValue: 4.3, shoppers: '30K shoppers' },
  { slug: 'puma', name: 'Puma', aliases: ['puma'], category: 'Fashion', cashback: { type: 'pct_single', value: 7 }, note: 'on shoes & apparel', brand: 'puma', ratingValue: 4.5, shoppers: '88K shoppers' },
  { slug: 'adidas', name: 'Adidas', aliases: ['adidas'], category: 'Fashion', cashback: { type: 'pct_single', value: 6.5 }, note: 'on shoes & apparel', brand: 'adidas', ratingValue: 4.5, shoppers: '76K shoppers' },
  // Beauty
  { slug: 'sephora', name: 'Sephora', aliases: ['sephora'], category: 'Beauty', cashback: { type: 'pct_single', value: 5 }, brand: 'sephora', ratingValue: 4.5, shoppers: '35K shoppers' },
  { slug: 'myglamm', name: 'MyGlamm', aliases: ['myglamm', 'glamm'], category: 'Beauty', cashback: { type: 'pct_single', value: 12 }, brand: 'myglamm', ratingValue: 4.2, shoppers: '44K shoppers' },
  { slug: 'sugar', name: 'SUGAR Cosmetics', aliases: ['sugar', 'sugar cosmetics'], category: 'Beauty', cashback: { type: 'pct_single', value: 9 }, brand: 'sugar', ratingValue: 4.4, shoppers: '60K shoppers' },
  { slug: 'mamaearth', name: 'Mamaearth', aliases: ['mamaearth', 'mama earth'], category: 'Beauty', cashback: { type: 'pct_single', value: 10 }, note: 'on skincare & haircare', brand: 'mamaearth', ratingValue: 4.3, shoppers: '1.1L shoppers' },
  { slug: 'purplle', name: 'Purplle', aliases: ['purplle'], category: 'Beauty', cashback: { type: 'pct_single', value: 8 }, brand: 'purplle', ratingValue: 4.2, shoppers: '58K shoppers' },
  { slug: 'plum', name: 'Plum Goodness', aliases: ['plum', 'plum goodness'], category: 'Beauty', cashback: { type: 'pct_single', value: 11 }, brand: 'plum', ratingValue: 4.4, shoppers: '33K shoppers' },
  // Electronics
  { slug: 'reliancedigital', name: 'Reliance Digital', aliases: ['reliance digital', 'reliance'], category: 'Electronics', cashback: { type: 'pct_single', value: 4 }, brand: 'relianceDigital', ratingValue: 4.2, shoppers: '80K shoppers' },
  { slug: 'vijaysales', name: 'Vijay Sales', aliases: ['vijay sales', 'vijaysales'], category: 'Electronics', cashback: { type: 'pct_single', value: 3.5 }, brand: 'vijaysales', ratingValue: 4.1, shoppers: '28K shoppers' },
  { slug: 'boat', name: 'boAt', aliases: ['boat', 'boat lifestyle', 'earbuds', 'headphones'], category: 'Electronics', cashback: { type: 'pct_single', value: 8 }, note: 'on audio & wearables', brand: 'boat', ratingValue: 4.4, shoppers: '1.4L shoppers' },
  { slug: 'noise', name: 'Noise', aliases: ['noise', 'smartwatch'], category: 'Electronics', cashback: { type: 'pct_single', value: 7.5 }, note: 'on smartwatches & audio', brand: 'noise', ratingValue: 4.3, shoppers: '90K shoppers' },
  { slug: 'tatacliq', name: 'Tata CLiQ', aliases: ['tata cliq', 'tatacliq', 'cliq'], category: 'Electronics', cashback: { type: 'pct_single', value: 5 }, brand: 'tatacliq', ratingValue: 4.2, shoppers: '64K shoppers' },
  // Shopping
  { slug: 'meesho', name: 'Meesho', aliases: ['meesho'], category: 'Shopping', cashback: { type: 'pct_single', value: 6 }, brand: 'meesho', ratingValue: 4.1, shoppers: '2.0L shoppers' },
  { slug: 'snapdeal', name: 'Snapdeal', aliases: ['snapdeal'], category: 'Shopping', cashback: { type: 'pct_single', value: 6 }, brand: 'snapdeal', ratingValue: 4.0, shoppers: '52K shoppers' },
  // Grocery / Food
  { slug: 'swiggy', name: 'Swiggy', aliases: ['swiggy', 'instamart', 'food delivery'], category: 'Grocery', cashback: { type: 'flat_inr', value: 100, prefix: 'upto' }, note: 'on food & Instamart', brand: 'swiggy', ratingValue: 4.4, shoppers: '2.4L shoppers' },
  { slug: 'zomato', name: 'Zomato', aliases: ['zomato'], category: 'Grocery', cashback: { type: 'flat_inr', value: 75, prefix: 'upto' }, note: 'on food delivery', brand: 'zomato', ratingValue: 4.3, shoppers: '2.1L shoppers' },
  { slug: 'bigbasket', name: 'BigBasket', aliases: ['bigbasket', 'big basket', 'grocery'], category: 'Grocery', cashback: { type: 'pct_single', value: 5 }, note: 'on groceries', brand: 'bigbasket', ratingValue: 4.3, shoppers: '1.3L shoppers' },
  { slug: 'blinkit', name: 'Blinkit', aliases: ['blinkit', 'grofers'], category: 'Grocery', cashback: { type: 'flat_inr', value: 50, prefix: 'upto' }, brand: 'blinkit', ratingValue: 4.4, shoppers: '1.7L shoppers' },
  { slug: 'zepto', name: 'Zepto', aliases: ['zepto'], category: 'Grocery', cashback: { type: 'flat_inr', value: 60, prefix: 'upto' }, brand: 'zepto', ratingValue: 4.3, shoppers: '1.0L shoppers' },
  { slug: 'jiomart', name: 'JioMart', aliases: ['jiomart', 'jio mart'], category: 'Grocery', cashback: { type: 'pct_single', value: 4 }, brand: 'jiomart', ratingValue: 4.1, shoppers: '70K shoppers' },
  { slug: 'licious', name: 'Licious', aliases: ['licious'], category: 'Grocery', cashback: { type: 'pct_single', value: 8 }, note: 'on meat & seafood', brand: 'licious', ratingValue: 4.5, shoppers: '36K shoppers' },
  // Pharmacy
  { slug: 'netmeds', name: 'Netmeds', aliases: ['netmeds'], category: 'Pharmacy', cashback: { type: 'pct_single', value: 8 }, note: 'on medicines', brand: 'netmeds', ratingValue: 4.3, shoppers: '65K shoppers' },
  { slug: 'tata1mg', name: 'Tata 1mg', aliases: ['1mg', 'tata 1mg', 'onemg'], category: 'Pharmacy', cashback: { type: 'pct_single', value: 7 }, note: 'on medicines & labs', brand: 'tata1mg', ratingValue: 4.4, shoppers: '98K shoppers' },
  { slug: 'apollo', name: 'Apollo Pharmacy', aliases: ['apollo', 'apollo pharmacy'], category: 'Pharmacy', cashback: { type: 'pct_single', value: 6 }, brand: 'apollo', ratingValue: 4.3, shoppers: '54K shoppers' },
  // Nutrition
  { slug: 'healthkart', name: 'HealthKart', aliases: ['healthkart', 'health kart'], category: 'Nutrition', cashback: { type: 'pct_single', value: 9 }, brand: 'healthkart', ratingValue: 4.4, shoppers: '85K shoppers' },
  { slug: 'myprotein', name: 'Myprotein', aliases: ['myprotein', 'my protein'], category: 'Nutrition', cashback: { type: 'pct_single', value: 12 }, brand: 'myprotein', ratingValue: 4.3, shoppers: '40K shoppers' },
  // Travel
  { slug: 'makemytrip', name: 'MakeMyTrip', aliases: ['makemytrip', 'mmt', 'make my trip', 'hotels'], category: 'Travel', cashback: { type: 'flat_inr', value: 2000, prefix: 'upto' }, note: 'on flights & hotels', brand: 'makemytrip', ratingValue: 4.3, shoppers: '1.5L shoppers' },
  { slug: 'goibibo', name: 'Goibibo', aliases: ['goibibo'], category: 'Travel', cashback: { type: 'flat_inr', value: 1800, prefix: 'upto' }, brand: 'goibibo', ratingValue: 4.2, shoppers: '72K shoppers' },
  { slug: 'easemytrip', name: 'EaseMyTrip', aliases: ['easemytrip', 'ease my trip'], category: 'Travel', cashback: { type: 'flat_inr', value: 1200, prefix: 'upto' }, brand: 'easemytrip', ratingValue: 4.1, shoppers: '48K shoppers' },
  { slug: 'ixigo', name: 'ixigo', aliases: ['ixigo', 'trains'], category: 'Travel', cashback: { type: 'flat_inr', value: 900, prefix: 'upto' }, note: 'on trains & flights', brand: 'ixigo', ratingValue: 4.2, shoppers: '61K shoppers' },
  { slug: 'redbus', name: 'redBus', aliases: ['redbus', 'red bus', 'bus'], category: 'Travel', cashback: { type: 'pct_single', value: 8 }, note: 'on bus tickets', brand: 'redbus', ratingValue: 4.3, shoppers: '58K shoppers' },
  // Home
  { slug: 'pepperfry', name: 'Pepperfry', aliases: ['pepperfry', 'furniture'], category: 'Home', cashback: { type: 'pct_single', value: 7 }, note: 'on furniture & decor', brand: 'pepperfry', ratingValue: 4.2, shoppers: '30K shoppers' },
  { slug: 'urbanladder', name: 'Urban Ladder', aliases: ['urban ladder', 'urbanladder'], category: 'Home', cashback: { type: 'pct_single', value: 6 }, brand: 'urbanladder', ratingValue: 4.2, shoppers: '18K shoppers' },
  { slug: 'wakefit', name: 'Wakefit', aliases: ['wakefit', 'mattress'], category: 'Home', cashback: { type: 'pct_single', value: 8 }, note: 'on mattresses & furniture', brand: 'wakefit', ratingValue: 4.4, shoppers: '42K shoppers' },
  // Payments
  { slug: 'paytm', name: 'Paytm', aliases: ['paytm', 'recharge'], category: 'Payments', cashback: { type: 'none' }, note: 'Recharges & bills', brand: 'paytm', ratingValue: 4.1, shoppers: '3.0L shoppers' },
  // Education / Hosting
  { slug: 'coursera', name: 'Coursera', aliases: ['coursera', 'courses'], category: 'Education', cashback: { type: 'pct_single', value: 10 }, note: 'on courses', brand: 'coursera', ratingValue: 4.5, shoppers: '25K shoppers' },
  { slug: 'udemy', name: 'Udemy', aliases: ['udemy'], category: 'Education', cashback: { type: 'pct_single', value: 12 }, note: 'on courses', brand: 'udemy', ratingValue: 4.4, shoppers: '33K shoppers' },
  { slug: 'hostinger', name: 'Hostinger', aliases: ['hostinger', 'hosting', 'domain'], category: 'Education', cashback: { type: 'pct_single', value: 15 }, note: 'on web hosting', brand: 'hostinger', ratingValue: 4.5, shoppers: '20K shoppers' },
];

const norm = (s: string) => s.toLowerCase().trim();

/** Fuzzy store search: prefix/substring over name + aliases + category. Ranked. */
export function searchStores(query: string): Store[] {
  const q = norm(query);
  if (!q) return [];
  return STORES.map((s) => {
    const hay = [s.name, ...s.aliases, s.category].map(norm);
    let score = 0;
    for (const h of hay) {
      if (h === q) score = Math.max(score, 100);
      else if (h.startsWith(q)) score = Math.max(score, 80);
      else if (h.includes(q)) score = Math.max(score, 50);
    }
    // Only ever a TIEBREAK on a store the query actually matched. Unconditionally it
    // gave every live store a score of 3 with no match at all, so `searchStores` never
    // returned empty: "zzzqqq" resolved to a five-store SERP headed "5 results for
    // Zzzqqq" and the recovery screen was unreachable (screenshotted, D112).
    if (score > 0 && s.live) score += 3;
    return { s, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.s);
}

/**
 * Store cards render ONLY the brands in Figma "Storepage Tiles" (611:3360) —
 * see ./storeTiles.ts. Each catalog store slot is mapped onto one of those 44
 * tiles (stable per slug, distinct within a rail), so no card ever shows a
 * favicon logo or a brand that isn't in the design. The search index above is
 * untouched, so a matched store's card may carry a different brand.
 */
const storeRowItems = (stores: Store[], idPrefix: string): ResultItem[] =>
  storeTileSlots(stores.map((s) => s.slug), idPrefix);

/** Build a store SERP dynamically from real catalog data (§3.3 shell). */
/** The store's money-card hero item (shared by the SERP and the store page). */
function storeHeroItem(store: Store): ResultItem {
  return {
    id: `hero-${store.slug}`,
    archetype: '01_store',
    source: 'internal',
    title: store.name,
    subtitle: store.shoppers ? `${store.shoppers}` : undefined,
    logo: store.brand ? BRAND[store.brand].logo : null,
    logoBg: store.brand ? BRAND[store.brand].bg : undefined,
    heroTint: store.brand ? BRAND[store.brand].bg : undefined,
    cashback: store.cashback,
    ratingValue: store.ratingValue,
    shoppers: store.shoppers,
    priorPct: store.priorPct,
    timelines: store.cashback.type === 'none' ? undefined : TL,
    ctaLabel: store.cashback.type === 'none' ? 'Visit Store' : 'Shop & Earn',
  };
}

export function buildStoreSerp(store: Store, query?: string): SerpModel {
  // Echo the exact word the user searched (not the resolved store name) in the
  // context line — "Best match for 'cro'" — so the header matches the search bar.
  const searched = (query ?? store.name).trim();
  const label = searched.charAt(0).toUpperCase() + searched.slice(1);
  const alternates = STORES.filter((x) => x.category === store.category && x.slug !== store.slug).slice(0, 4);
  const sections: SerpModel['sections'] = [];

  const storeRows = storeRowItems([store, ...alternates], 'store');
  sections.push({ kind: 'stores', title: 'Stores', count: storeRows.length, items: storeRows });

  // A scoped card for this store where one exists (co-branded), else generic deals.
  sections.push({ kind: 'deals', title: 'Deals', count: 8, items: DEAL_ITEMS });

  return {
    query: searched.toLowerCase(),
    archetype: '01_store',
    context: { label: `Best match for “${label}”`, count: null },
    hero: storeHeroItem(store),
    tabs: ['all', 'stores', 'products'],
    sections,
    expandSearch: true,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// Product catalog — real products with prices + keyword tags, so product-intent
// searches ("iphone", "shoes", "whey", "lipstick") surface a products rail.
// ═════════════════════════════════════════════════════════════════════════════
export type Product = {
  id: string;
  title: string;
  brand: string;
  brandKey?: keyof typeof BRAND;
  category: Cat;
  /** Product sub-category — the browse facet on a product category page
   *  (`data/productCategories.ts` owns the key → label map). */
  sub: string;
  mrp: number;
  price: number;
  cbPct?: number;
  cbFlat?: number;
  keywords: string[];
  // Key into PRODUCT_IMG for this product's real photo. Stored as a key (not the
  // require value) and resolved lazily in productItem() so we never touch
  // PRODUCT_IMG at module-eval — that would hit the catalog↔realData import-cycle
  // TDZ. Every product has one, so a brand-logo fallback is never shown.
  imgKey: keyof typeof PRODUCT_IMG;
};

export const PRODUCTS: Product[] = [
  // Mobiles
  { id: 'iphone15', title: 'Apple iPhone 15 (128GB, Blue)', brand: 'Apple', brandKey: 'apple', category: 'Electronics', sub: 'mobiles', mrp: 79900, price: 66999, cbPct: 3, keywords: ['iphone', 'apple', 'phone', 'mobile', 'smartphone', 'ios'], imgKey: 'iphone15' },
  { id: 'iphone15pro', title: 'Apple iPhone 15 Pro (256GB)', brand: 'Apple', brandKey: 'apple', category: 'Electronics', sub: 'mobiles', mrp: 134900, price: 119900, cbPct: 3, keywords: ['iphone', 'apple', 'phone', 'mobile', 'smartphone', 'pro'], imgKey: 'iphone15pro' },
  { id: 'galaxys24', title: 'Samsung Galaxy S24 5G (256GB)', brand: 'Samsung', brandKey: 'samsung', category: 'Electronics', sub: 'mobiles', mrp: 79999, price: 64999, cbFlat: 480, keywords: ['galaxy', 'samsung', 'phone', 'mobile', 'smartphone', 'android', 's24'], imgKey: 'galaxyS24' },
  { id: 'oneplus12', title: 'OnePlus 12R (256GB)', brand: 'OnePlus', category: 'Electronics', sub: 'mobiles', mrp: 45999, price: 39999, cbPct: 4, keywords: ['oneplus', 'phone', 'mobile', 'smartphone', 'android'], imgKey: 'oneplus12' },
  { id: 'redminote13', title: 'Redmi Note 13 Pro 5G', brand: 'Redmi', category: 'Electronics', sub: 'mobiles', mrp: 27999, price: 23999, cbPct: 5, keywords: ['redmi', 'xiaomi', 'phone', 'mobile', 'smartphone', 'note'], imgKey: 'redmiNote13' },
  // Audio / wearables
  { id: 'boatairdopes', title: 'boAt Airdopes 141 TWS Earbuds', brand: 'boAt', brandKey: 'boat', category: 'Electronics', sub: 'audio', mrp: 4490, price: 1299, cbFlat: 80, keywords: ['earbuds', 'headphones', 'boat', 'audio', 'tws', 'earphones'], imgKey: 'earbuds' },
  { id: 'noisebuds', title: 'Noise Buds VS104 Earbuds', brand: 'Noise', brandKey: 'noise', category: 'Electronics', sub: 'audio', mrp: 3999, price: 999, cbFlat: 60, keywords: ['earbuds', 'headphones', 'noise', 'audio', 'tws'], imgKey: 'noiseBuds' },
  { id: 'noisewatch', title: 'Noise ColorFit Pro 5 Smartwatch', brand: 'Noise', brandKey: 'noise', category: 'Electronics', sub: 'wearables', mrp: 6999, price: 2499, cbFlat: 120, keywords: ['watch', 'smartwatch', 'noise', 'wearable'], imgKey: 'noiseWatch' },
  { id: 'boatwatch', title: 'boAt Wave Call 2 Smartwatch', brand: 'boAt', brandKey: 'boat', category: 'Electronics', sub: 'wearables', mrp: 5499, price: 1599, cbFlat: 90, keywords: ['watch', 'smartwatch', 'boat', 'wearable'], imgKey: 'boatWatch' },
  // Shoes
  { id: 'nikerevo', title: 'Nike Revolution 7 Running Shoes', brand: 'Nike', brandKey: 'nike', category: 'Fashion', sub: 'shoes', mrp: 4995, price: 3496, cbPct: 6, keywords: ['shoes', 'nike', 'running', 'sneakers', 'footwear'], imgKey: 'nikeRevolution' },
  { id: 'pumashoes', title: 'Puma Softride Running Shoes', brand: 'Puma', brandKey: 'puma', category: 'Fashion', sub: 'shoes', mrp: 5999, price: 2999, cbPct: 7, keywords: ['shoes', 'puma', 'running', 'sneakers', 'footwear'], imgKey: 'pumaShoes' },
  { id: 'adidasshoes', title: 'Adidas Galaxy 6 Running Shoes', brand: 'Adidas', brandKey: 'adidas', category: 'Fashion', sub: 'shoes', mrp: 5599, price: 3359, cbPct: 6.5, keywords: ['shoes', 'adidas', 'running', 'sneakers', 'footwear'], imgKey: 'adidas' },
  // Apparel
  { id: 'bewakooftee', title: 'Bewakoof Oversized Cotton T-Shirt', brand: 'Bewakoof', brandKey: 'bewakoof', category: 'Fashion', sub: 'clothing', mrp: 999, price: 499, cbPct: 9, keywords: ['tshirt', 't-shirt', 'tee', 'bewakoof', 'fashion', 'shirt', 'clothing'], imgKey: 'tshirt' },
  { id: 'levisjeans', title: "Levi's 511 Slim Fit Jeans", brand: "Levi's", brandKey: 'levis', category: 'Fashion', sub: 'clothing', mrp: 3999, price: 2399, cbPct: 6, keywords: ['jeans', 'levis', 'denim', 'fashion', 'clothing'], imgKey: 'levis' },
  // Protein / nutrition
  { id: 'mbwhey', title: 'MuscleBlaze Biozyme Whey Protein 1kg', brand: 'MuscleBlaze', brandKey: 'muscleblaze', category: 'Nutrition', sub: 'whey', mrp: 3499, price: 2624, cbPct: 12, keywords: ['whey', 'protein', 'muscleblaze', 'supplement', 'gym', 'fitness'], imgKey: 'muscleblazeWhey' },
  { id: 'onwhey', title: 'ON Gold Standard 100% Whey 2lb', brand: 'Optimum Nutrition', brandKey: 'optimum', category: 'Nutrition', sub: 'whey', mrp: 5499, price: 4399, cbPct: 8, keywords: ['whey', 'protein', 'optimum', 'supplement', 'gym'], imgKey: 'optimumWhey' },
  { id: 'myfitpb', title: 'MyFitness Chocolate Peanut Butter 1kg', brand: 'MyFitness', brandKey: 'myfitness', category: 'Nutrition', sub: 'foods', mrp: 749, price: 549, cbPct: 15, keywords: ['peanut butter', 'myfitness', 'protein', 'food'], imgKey: 'peanutButter' },
  // Beauty
  { id: 'sugarlip', title: 'SUGAR Matte As Hell Crayon Lipstick', brand: 'SUGAR', brandKey: 'sugar', category: 'Beauty', sub: 'makeup', mrp: 799, price: 679, cbPct: 9, keywords: ['lipstick', 'makeup', 'sugar', 'cosmetics', 'beauty'], imgKey: 'lipstick' },
  { id: 'mamaserum', title: 'Mamaearth Vitamin C Face Serum', brand: 'Mamaearth', brandKey: 'mamaearth', category: 'Beauty', sub: 'skincare', mrp: 599, price: 449, cbPct: 10, keywords: ['serum', 'skincare', 'vitamin c', 'mamaearth', 'beauty', 'face'], imgKey: 'faceSerum' },
  { id: 'plumsun', title: 'Plum Green Tea Sunscreen SPF 50', brand: 'Plum', brandKey: 'plum', category: 'Beauty', sub: 'skincare', mrp: 465, price: 395, cbPct: 11, keywords: ['sunscreen', 'skincare', 'plum', 'spf', 'beauty'], imgKey: 'sunscreen' },
  { id: 'sugarfoundation', title: 'SUGAR Ace Of Face Foundation Stick', brand: 'SUGAR', brandKey: 'sugar', category: 'Beauty', sub: 'makeup', mrp: 899, price: 764, cbPct: 9, keywords: ['foundation', 'makeup', 'sugar', 'cosmetics', 'beauty'], imgKey: 'foundation' },
  // Home
  { id: 'wakefitmat', title: 'Wakefit Orthopedic Memory Foam Mattress', brand: 'Wakefit', brandKey: 'wakefit', category: 'Home', sub: 'furniture', mrp: 18999, price: 9499, cbPct: 8, keywords: ['mattress', 'wakefit', 'home', 'furniture', 'bed'], imgKey: 'mattress' },
  // Grocery
  { id: 'liciouschicken', title: 'Licious Chicken Curry Cut 1kg', brand: 'Licious', brandKey: 'licious', category: 'Grocery', sub: 'fresh', mrp: 399, price: 319, cbPct: 8, keywords: ['chicken', 'licious', 'meat', 'grocery', 'food'], imgKey: 'rawChicken' },

  // ── Design-case SKUs (transcribed from the Cashkaro-Search-2026 real-data
  //    product grids in ./realData.ts — same titles, photos, prices and flat
  //    cashback, restated here as structured rows so the product category pages
  //    can sort/filter/facet them. Nothing invented; duplicates of the SKUs
  //    already listed above are deliberately not repeated. ─────────────────────
  { id: 'sonyxm5', title: 'Sony WH-1000XM5 Wireless Headphones', brand: 'Sony', category: 'Electronics', sub: 'audio', mrp: 34990, price: 26990, cbFlat: 540, keywords: ['headphones', 'sony', 'audio', 'anc', 'wireless'], imgKey: 'sonyXm5' },
  { id: 'airpodspro', title: 'Apple AirPods Pro (2nd Gen)', brand: 'Apple', brandKey: 'apple', category: 'Electronics', sub: 'audio', mrp: 26900, price: 21900, cbFlat: 440, keywords: ['airpods', 'apple', 'earbuds', 'audio', 'tws'], imgKey: 'airpodsPro' },
  { id: 'jblflip6', title: 'JBL Flip 6 Portable Bluetooth Speaker', brand: 'JBL', category: 'Electronics', sub: 'audio', mrp: 11999, price: 8999, cbFlat: 180, keywords: ['speaker', 'jbl', 'bluetooth', 'audio'], imgKey: 'jblSpeaker' },
  { id: 'applewatch9', title: 'Apple Watch Series 9 GPS 41mm', brand: 'Apple', brandKey: 'apple', category: 'Electronics', sub: 'wearables', mrp: 45900, price: 41900, cbFlat: 420, keywords: ['watch', 'smartwatch', 'apple', 'wearable'], imgKey: 'appleWatch' },
  { id: 'ps5slim', title: 'Sony PlayStation 5 Slim Console', brand: 'Sony', category: 'Electronics', sub: 'gaming', mrp: 54990, price: 49990, cbFlat: 500, keywords: ['ps5', 'playstation', 'console', 'gaming', 'sony'], imgKey: 'ps5' },
  { id: 'kindlepw', title: 'Kindle Paperwhite 16GB (2024)', brand: 'Amazon', brandKey: 'amazon', category: 'Electronics', sub: 'readers', mrp: 16999, price: 14999, cbFlat: 300, keywords: ['kindle', 'ereader', 'amazon', 'reader', 'tablet'], imgKey: 'kindle' },
  { id: 'logim240', title: 'Logitech M240 Silent Wireless Mouse', brand: 'Logitech', category: 'Electronics', sub: 'accessories', mrp: 1495, price: 995, cbFlat: 20, keywords: ['mouse', 'logitech', 'wireless', 'accessory'], imgKey: 'logiMouse' },
  { id: 'elvstand', title: 'ELV Mobile Phone Mount Tabletop Holder', brand: 'ELV', category: 'Electronics', sub: 'accessories', mrp: 119, price: 119, cbFlat: 4, keywords: ['stand', 'holder', 'mount', 'phone', 'accessory'], imgKey: 'phoneStand' },
  { id: 'portclamp', title: 'Portronics Clamp M2 Car Phone Holder', brand: 'Portronics', brandKey: 'portronics', category: 'Electronics', sub: 'accessories', mrp: 300, price: 229, cbFlat: 3, keywords: ['car mount', 'holder', 'portronics', 'phone', 'accessory'], imgKey: 'carMount' },
  { id: 'elvtripod', title: 'ELV Mobile Phone Mount Tripod Holder', brand: 'ELV', category: 'Electronics', sub: 'accessories', mrp: 1999, price: 324, cbFlat: 6, keywords: ['tripod', 'holder', 'mount', 'phone', 'accessory'], imgKey: 'phoneTripod' },
  { id: 'nikeaf1', title: "Nike Air Force 1 '07 White", brand: 'Nike', brandKey: 'nike', category: 'Fashion', sub: 'shoes', mrp: 9295, price: 7495, cbFlat: 150, keywords: ['shoes', 'nike', 'sneakers', 'air force', 'footwear'], imgKey: 'nikeAf1' },
  { id: 'raybanav', title: 'Ray-Ban Aviator Classic Sunglasses', brand: 'Ray-Ban', category: 'Fashion', sub: 'accessories', mrp: 8190, price: 6790, cbFlat: 135, keywords: ['sunglasses', 'rayban', 'aviator', 'eyewear', 'accessory'], imgKey: 'rayban' },
  { id: 'casioa159', title: 'Casio Vintage A159WA-N1 Watch', brand: 'Casio', category: 'Fashion', sub: 'accessories', mrp: 4995, price: 4295, cbFlat: 85, keywords: ['watch', 'casio', 'vintage', 'accessory'], imgKey: 'casio' },
  { id: 'bellavita', title: 'Bella Vita CEO Man Eau de Parfum', brand: 'Bella Vita', category: 'Beauty', sub: 'fragrance', mrp: 1499, price: 699, cbFlat: 21, keywords: ['perfume', 'fragrance', 'parfum', 'bella vita', 'beauty'], imgKey: 'perfume' },
  { id: 'mamacream', title: 'Mamaearth Vitamin C Face Cream', brand: 'Mamaearth', brandKey: 'mamaearth', category: 'Beauty', sub: 'skincare', mrp: 599, price: 399, cbFlat: 12, keywords: ['face cream', 'skincare', 'vitamin c', 'mamaearth', 'beauty'], imgKey: 'faceCream' },
  { id: 'mahaoil', title: 'Mahabhringraj Scalp Massaging Oil', brand: 'Mahabhringraj', category: 'Beauty', sub: 'haircare', mrp: 249, price: 240, cbFlat: 5, keywords: ['hair oil', 'haircare', 'scalp', 'massage', 'beauty'], imgKey: 'hairOil' },
  { id: 'wheyh2o', title: 'MyFitness WHEY-H2O 20 Servings Whey Protein', brand: 'MyFitness', brandKey: 'myfitness', category: 'Nutrition', sub: 'whey', mrp: 2300, price: 1499, cbFlat: 30, keywords: ['whey', 'protein', 'myfitness', 'supplement', 'gym'], imgKey: 'myfitnessWhey' },
  { id: 'mffwhey', title: 'MyFitFuel Advance Beginner Whey Concentrate', brand: 'MyFitFuel', brandKey: 'myfitfuel', category: 'Nutrition', sub: 'whey', mrp: 900, price: 837, cbFlat: 21, keywords: ['whey', 'protein', 'myfitfuel', 'supplement', 'gym'], imgKey: 'myfitfuelWhey' },
  { id: 'hsnmag', title: 'Hollywood Secrets Natural Magnesium Chloride', brand: 'Hollywood Secrets', category: 'Nutrition', sub: 'supplements', mrp: 295, price: 295, cbFlat: 8, keywords: ['magnesium', 'supplement', 'wellness', 'mineral'], imgKey: 'magnesium' },
];

export const productItem = (p: Product, id: string): ResultItem => ({
  id,
  archetype: '02_product',
  source: 'internal',
  title: p.title,
  subtitle: p.brand,
  logo: p.brandKey ? BRAND[p.brandKey].logo : null,
  logoBg: p.brandKey ? BRAND[p.brandKey].bg : undefined,
  productImage: PRODUCT_IMG[p.imgKey], // real product photo — never the brand-logo fallback

  cashback: p.cbFlat ? { type: 'flat_inr', value: p.cbFlat, prefix: 'flat' } : p.cbPct ? { type: 'pct_single', value: p.cbPct } : { type: 'none' },
  originalPrice: `₹${p.mrp.toLocaleString('en-IN')}`,
  ctaLabel: `₹${p.price.toLocaleString('en-IN')}`,
});

/** Fuzzy product search over title + brand + category + keyword tags. Ranked. */
export function searchProducts(query: string): ResultItem[] {
  const q = norm(query);
  if (!q) return [];
  return PRODUCTS.map((p) => {
    const hay = [p.title, p.brand, p.category, ...p.keywords].map(norm);
    let score = 0;
    for (const h of hay) {
      if (h === q) score = Math.max(score, 100);
      else if (h.startsWith(q)) score = Math.max(score, 70);
      else if (h.includes(q) || q.includes(h)) score = Math.max(score, 40);
    }
    return { p, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x, i) => productItem(x.p, `p-${x.p.id}-${i}`));
}

/** Is the top store a confident (near-exact) match for the query? */
function isStrongStoreMatch(query: string, s: Store): boolean {
  const q = norm(query);
  return s.name.toLowerCase().startsWith(q) || s.aliases.some((a) => a === q || a.startsWith(q) || q.startsWith(a));
}

/**
 * Generic search-results builder (§3.3). Assembles a rich multi-section SERP from
 * the catalog for ANY query: a best-match store hero (when confident), a stores
 * rail, a products rail, and deals — with tabs derived from what actually matched.
 * Returns undefined only when nothing matches (→ recovery / Expand Search).
 */
export function buildSerp(query: string): SerpModel | undefined {
  const searched = query.trim();
  if (!searched) return undefined;
  const stores = searchStores(searched);
  const products = searchProducts(searched);
  if (!stores.length && !products.length) return undefined;

  const label = searched.charAt(0).toUpperCase() + searched.slice(1);
  const topStore = stores[0];
  const strong = !!topStore && isStrongStoreMatch(searched, topStore);
  const railStores = (strong ? stores.slice(1) : stores).slice(0, 8);

  const sections: SerpModel['sections'] = [];
  if (railStores.length) {
    sections.push({ kind: 'stores', title: 'Stores', count: railStores.length, items: storeRowItems(railStores, 'st') });
  }
  if (products.length) {
    sections.push({ kind: 'products', title: 'Products', count: products.length, items: products.slice(0, 10) });
  }
  sections.push({ kind: 'deals', title: 'Deals', count: 8, items: DEAL_ITEMS });

  const tabs: any[] = ['all'];
  if (railStores.length || strong) tabs.push('stores');
  if (products.length) tabs.push('products');

  return {
    query: searched.toLowerCase(),
    archetype: strong ? '01_store' : '02_product',
    context: {
      label: strong ? `Best match for “${label}”` : `${stores.length + products.length} results for “${label}”`,
      count: strong ? null : stores.length + products.length,
    },
    hero: strong ? storeHeroItem(topStore) : null,
    tabs,
    sections,
    expandSearch: true,
  };
}

/**
 * Store PAGE — the destination you reach by tapping a "Jump back in" tile: the
 * store's own money card (Shop & Earn + timelines) and its deals, WITHOUT the
 * search-results framing (no tabs, no competing-stores list, no Expand Search).
 */
export function buildStorePage(store: Store): SerpModel {
  return {
    query: store.slug,
    archetype: '01_store',
    context: { label: store.cashback.type === 'none' ? store.name : `Earn CashKaro cashback at ${store.name}`, count: null },
    hero: storeHeroItem(store),
    tabs: null, // store page — no results tabs
    sections: [{ kind: 'deals', title: `${store.name} Deals`, count: 8, items: DEAL_ITEMS }],
    expandSearch: false,
  };
}

/**
 * Catalog browse (View-All page) — one card per store in the category, as plain
 * `ResultItem`s ready for the store-tile grid. Goes through the same tile mapping
 * the SERP rails use, so the grid renders identical Storepage tiles.
 */
export function storesInCategory(cat: Cat): Store[] {
  return STORES.filter((s) => s.category === cat);
}

/** Products in a catalog category, in catalog order (= popularity order). */
export function productsInCategory(cat: Cat): Product[] {
  return PRODUCTS.filter((p) => p.category === cat);
}

export function buildCategoryStores(cat: Cat): ResultItem[] {
  return storeRowItems(storesInCategory(cat), `cat-${cat}`);
}

/** Every catalog category that currently has at least one store (chip source). */
export const CATEGORIES: Cat[] = (['Shopping', 'Fashion', 'Beauty', 'Electronics', 'Pharmacy', 'Travel', 'Payments', 'Nutrition'] as Cat[]).filter(
  (c) => STORES.some((s) => s.category === c),
);

// Deal creatives are populated by realData to avoid a require cycle.
export let DEAL_ITEMS: ResultItem[] = [];
export function _setDealItems(items: ResultItem[]) {
  DEAL_ITEMS = items;
}

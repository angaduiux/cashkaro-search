/**
 * Storepage brand tiles — the ONLY brands that may appear on a store card.
 *
 * Transcribed 1:1 from Figma "Storepage Tiles"
 * (qDyQsqusZTtdGdBPdua6QT, node 611:3360 — 15 rows × 3 tiles = 45 tiles, 44
 * unique brands; Croma appears twice). Nothing here is invented:
 *
 *  - `logo`   the tile's own source PNG, pulled per tile with the Figma MCP
 *             (`download_assets` on the logo node inside "Frame 1991635403").
 *             Saved under assets/brands/figma/. NEVER a favicon/CDN URL — those
 *             render as the blurry logos this set replaces.
 *  - `tint`   the tile wash's top gradient stop, sampled from the frame render.
 *             Rows 1–12 all use the neutral wash (`color.ckds.tileWash`); the
 *             retail/beauty rows carry a real brand tint.
 *  - `offer`  the green strip text, verbatim per tile ("Upto 80% Off",
 *             "Rates from 9.99%", "Zero Foreclosure", "100% Digital").
 *  - `cashback` / `caption` the cobalt figure and its footer label, verbatim
 *             ("Upto 10%" + CASHBACK, "Flat 1%" + REWARDS, …).
 *
 * Store cards are sourced from here for every surface (SERP stores rail, Home
 * Top Stores, category grids, View-all). The search index in ./catalog.ts is
 * deliberately untouched, so a query can resolve to a store whose card shows a
 * different brand — that is the accepted trade-off for tile fidelity.
 */
import { Cashback, ResultItem } from './dataContract';
import { color } from '../theme/tokens';

/** The neutral wash shared by every non-brand-tinted tile in the frame. */
const WASH = color.ckds.tileWash;

const pct = (value: number): Cashback => ({ type: 'pct_single', value });
const flatPct = (value: number): Cashback => ({ type: 'pct_single', value, prefix: 'flat' });

export type StoreTileBrand = {
  key: string;
  name: string;
  logo: number; // bundled require() id — the frame's own source PNG
  tint: string; // tile wash, top gradient stop
  offer: string; // green strip
  cashback: Cashback;
  caption: 'CASHBACK' | 'REWARDS';
};

/** All 44 brands, in frame order (top-left → bottom-right). */
export const STORE_TILES: StoreTileBrand[] = [
  // ── Rows 1–3 · Health & wellness ───────────────────────────────────────────
  { key: 'hyugalife', name: 'Hyugalife', logo: require('../../assets/brands/figma/hyugalife.png'), tint: WASH, offer: 'Upto 80% Off', cashback: pct(10), caption: 'CASHBACK' },
  { key: 'neuro', name: 'Neuro', logo: require('../../assets/brands/figma/neuro.png'), tint: WASH, offer: 'Upto 80% Off', cashback: pct(12), caption: 'CASHBACK' },
  { key: 'hkVitals', name: 'HK Vitals', logo: require('../../assets/brands/figma/hk-vitals.png'), tint: WASH, offer: 'Upto 80% Off', cashback: pct(8), caption: 'CASHBACK' },
  { key: 'healthkart', name: 'HealthKart', logo: require('../../assets/brands/figma/healthkart.png'), tint: WASH, offer: 'Upto 80% Off', cashback: pct(6), caption: 'CASHBACK' },
  { key: 'muscleblaze', name: 'MuscleBlaze', logo: require('../../assets/brands/figma/muscleblaze.png'), tint: WASH, offer: 'Upto 80% Off', cashback: pct(6), caption: 'CASHBACK' },
  { key: 'nua', name: 'Nua', logo: require('../../assets/brands/figma/nua.png'), tint: WASH, offer: 'Upto 80% Off', cashback: pct(6), caption: 'CASHBACK' },
  { key: 'truebasics', name: 'TrueBasics', logo: require('../../assets/brands/figma/truebasics.png'), tint: WASH, offer: 'Upto 80% Off', cashback: pct(10), caption: 'CASHBACK' },
  { key: 'perfora', name: 'Perfora', logo: require('../../assets/brands/figma/perfora.png'), tint: WASH, offer: 'Upto 80% Off', cashback: pct(12), caption: 'CASHBACK' },
  { key: 'nutrabay', name: 'Nutrabay', logo: require('../../assets/brands/figma/nutrabay.png'), tint: WASH, offer: 'Upto 80% Off', cashback: pct(8), caption: 'CASHBACK' },

  // ── Rows 4–6 · Travel ──────────────────────────────────────────────────────
  { key: 'ihg', name: 'IHG Hotels & Resorts', logo: require('../../assets/brands/figma/ihg.png'), tint: WASH, offer: 'Rates from 9.99%', cashback: flatPct(1), caption: 'CASHBACK' },
  { key: 'booking', name: 'Booking.com', logo: require('../../assets/brands/figma/booking.png'), tint: WASH, offer: 'Zero Foreclosure', cashback: flatPct(1), caption: 'CASHBACK' },
  { key: 'skyscanner', name: 'Skyscanner', logo: require('../../assets/brands/figma/skyscanner.png'), tint: WASH, offer: '100% Digital', cashback: flatPct(1), caption: 'CASHBACK' },
  { key: 'etihad', name: 'Etihad Airways', logo: require('../../assets/brands/figma/etihad.png'), tint: WASH, offer: 'Rates from 9.99%', cashback: flatPct(1), caption: 'CASHBACK' },
  { key: 'hotels', name: 'Hotels.com', logo: require('../../assets/brands/figma/hotels.png'), tint: WASH, offer: 'Rates from 9.99%', cashback: flatPct(1), caption: 'CASHBACK' },
  { key: 'goibibo', name: 'Goibibo', logo: require('../../assets/brands/figma/goibibo.png'), tint: WASH, offer: '100% Digital', cashback: flatPct(1), caption: 'CASHBACK' },
  { key: 'tripadvisor', name: 'Tripadvisor', logo: require('../../assets/brands/figma/tripadvisor.png'), tint: WASH, offer: 'Rates from 9.99%', cashback: flatPct(1), caption: 'CASHBACK' },
  { key: 'airIndiaExpress', name: 'Air India Express', logo: require('../../assets/brands/figma/air-india-express.png'), tint: WASH, offer: 'Rates from 9.99%', cashback: flatPct(1), caption: 'CASHBACK' },
  { key: 'cleartrip', name: 'Cleartrip', logo: require('../../assets/brands/figma/cleartrip.png'), tint: WASH, offer: '100% Digital', cashback: flatPct(1), caption: 'CASHBACK' },

  // ── Rows 7–9 · Education ───────────────────────────────────────────────────
  { key: 'adobe', name: 'Adobe', logo: require('../../assets/brands/figma/adobe.png'), tint: WASH, offer: 'Rates from 9.99%', cashback: flatPct(1), caption: 'REWARDS' },
  { key: 'udemy', name: 'Udemy', logo: require('../../assets/brands/figma/udemy.png'), tint: WASH, offer: 'Zero Foreclosure', cashback: flatPct(1), caption: 'REWARDS' },
  { key: 'guvi', name: 'GUVI', logo: require('../../assets/brands/figma/guvi.png'), tint: WASH, offer: '100% Digital', cashback: flatPct(1), caption: 'REWARDS' },
  { key: 'duolingo', name: 'Duolingo', logo: require('../../assets/brands/figma/duolingo.png'), tint: WASH, offer: 'Rates from 9.99%', cashback: flatPct(1), caption: 'REWARDS' },
  { key: 'bookchor', name: 'Bookchor', logo: require('../../assets/brands/figma/bookchor.png'), tint: WASH, offer: 'Rates from 9.99%', cashback: flatPct(1), caption: 'REWARDS' },
  { key: 'britishCouncil', name: 'British Council', logo: require('../../assets/brands/figma/british-council.png'), tint: WASH, offer: '100% Digital', cashback: flatPct(1), caption: 'REWARDS' },
  { key: 'pearsonPte', name: 'Pearson PTE', logo: require('../../assets/brands/figma/pearson-pte.png'), tint: WASH, offer: 'Rates from 9.99%', cashback: flatPct(1), caption: 'REWARDS' },
  { key: 'gre', name: 'GRE', logo: require('../../assets/brands/figma/gre.png'), tint: WASH, offer: 'Rates from 9.99%', cashback: flatPct(1), caption: 'REWARDS' },
  { key: 'toefl', name: 'TOEFL', logo: require('../../assets/brands/figma/toefl.png'), tint: WASH, offer: '100% Digital', cashback: flatPct(1), caption: 'REWARDS' },

  // ── Rows 10–12 · Loans ─────────────────────────────────────────────────────
  { key: 'axisBank', name: 'Axis Bank', logo: require('../../assets/brands/figma/axis-bank.png'), tint: WASH, offer: 'Rates from 9.99%', cashback: flatPct(1), caption: 'REWARDS' },
  { key: 'fibe', name: 'Fibe', logo: require('../../assets/brands/figma/fibe.png'), tint: WASH, offer: 'Zero Foreclosure', cashback: flatPct(1), caption: 'REWARDS' },
  { key: 'prefr', name: 'Prefr', logo: require('../../assets/brands/figma/prefr.png'), tint: WASH, offer: '100% Digital', cashback: flatPct(1), caption: 'REWARDS' },
  { key: 'hdfcBank', name: 'HDFC Bank', logo: require('../../assets/brands/figma/hdfc-bank.png'), tint: WASH, offer: 'Rates from 9.99%', cashback: flatPct(1), caption: 'REWARDS' },
  { key: 'protium', name: 'Protium', logo: require('../../assets/brands/figma/protium.png'), tint: WASH, offer: 'Rates from 9.99%', cashback: flatPct(1), caption: 'REWARDS' },
  { key: 'zype', name: 'Zype', logo: require('../../assets/brands/figma/zype.png'), tint: WASH, offer: '100% Digital', cashback: flatPct(1), caption: 'REWARDS' },
  { key: 'olyv', name: 'Olyv', logo: require('../../assets/brands/figma/olyv.png'), tint: WASH, offer: 'Rates from 9.99%', cashback: flatPct(1), caption: 'REWARDS' },
  { key: 'moneyview', name: 'Moneyview', logo: require('../../assets/brands/figma/moneyview.png'), tint: WASH, offer: 'Rates from 9.99%', cashback: flatPct(1), caption: 'REWARDS' },
  { key: 'mpokket', name: 'mPokket', logo: require('../../assets/brands/figma/mpokket.png'), tint: WASH, offer: '100% Digital', cashback: flatPct(1), caption: 'REWARDS' },

  // ── Rows 13–15 · Retail & beauty (brand-tinted washes) ─────────────────────
  { key: 'croma', name: 'Croma', logo: require('../../assets/brands/figma/croma.png'), tint: '#e2f2f2', offer: 'Upto 80% Off', cashback: pct(10), caption: 'CASHBACK' },
  { key: 'nykaa', name: 'Nykaa', logo: require('../../assets/brands/figma/nykaa.png'), tint: '#ffe3ec', offer: 'Upto 80% Off', cashback: pct(12), caption: 'CASHBACK' },
  { key: 'ajio', name: 'AJIO', logo: require('../../assets/brands/figma/ajio.png'), tint: '#e5ebfb', offer: 'Upto 80% Off', cashback: pct(8), caption: 'CASHBACK' },
  { key: 'foxtale', name: 'Foxtale', logo: require('../../assets/brands/figma/foxtale.png'), tint: '#f3d5a7', offer: 'Upto 80% Off', cashback: pct(8), caption: 'CASHBACK' },
  { key: 'mamaearth', name: 'Mamaearth', logo: require('../../assets/brands/figma/mamaearth.png'), tint: '#daefd3', offer: 'Upto 80% Off', cashback: pct(8), caption: 'CASHBACK' },
  { key: 'dermaCo', name: 'The Derma Co', logo: require('../../assets/brands/figma/derma-co.png'), tint: '#d2faf8', offer: 'Upto 80% Off', cashback: pct(8), caption: 'CASHBACK' },
  { key: 'amazon', name: 'Amazon', logo: require('../../assets/brands/figma/amazon.png'), tint: '#fcefb7', offer: 'Upto 80% Off', cashback: pct(12), caption: 'CASHBACK' },
  { key: 'dotKey', name: 'Dot & Key', logo: require('../../assets/brands/figma/dot-key.png'), tint: '#eaf2df', offer: 'Upto 80% Off', cashback: pct(8), caption: 'CASHBACK' },
];

const BY_KEY: Record<string, StoreTileBrand> = Object.fromEntries(STORE_TILES.map((b) => [b.key, b]));

/** One tile as a `ResultItem`, ready for `StoreTile`. */
export function storeTileItem(brand: StoreTileBrand, id: string): ResultItem {
  return {
    id,
    archetype: '01_store',
    source: 'internal',
    title: brand.name,
    logo: brand.logo,
    logoBg: brand.tint,
    heroTint: brand.tint, // exact wash from the frame — StoreTile uses it as-is
    cashback: brand.cashback,
    cashbackCaption: brand.caption,
    discount: brand.offer,
  };
}

/** Tile by key (e.g. a curated rail). Unknown keys are skipped by the caller. */
export function storeTileByKey(key: string): StoreTileBrand | undefined {
  return BY_KEY[key];
}

// Stable string hash — the same slug always lands on the same tile, so a store's
// card doesn't change brand between the rail, the grid and the store page.
const hash = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

/**
 * Fill n card slots (one per catalog store) with distinct tiles. Each slot is
 * seeded from its store slug and probes forward on collision, so a rail never
 * shows the same brand twice and the mapping is stable across renders.
 */
export function storeTileSlots(slugs: string[], idPrefix: string): ResultItem[] {
  const used = new Set<number>();
  return slugs.map((slug, i) => {
    let idx = hash(slug) % STORE_TILES.length;
    while (used.has(idx) && used.size < STORE_TILES.length) idx = (idx + 1) % STORE_TILES.length;
    used.add(idx);
    return storeTileItem(STORE_TILES[idx], `${idPrefix}-${slug}-${i}`);
  });
}

/** Curated rail from explicit tile keys, in the given order. */
export function storeTilesByKeys(keys: string[], idPrefix: string): ResultItem[] {
  return keys
    .map((k) => BY_KEY[k])
    .filter((b): b is StoreTileBrand => !!b)
    .map((b) => storeTileItem(b, `${idPrefix}-${b.key}`));
}

/** Every brand in the frame, once each (View-all "Stores"). */
export function allStoreTileItems(idPrefix = 'tile'): ResultItem[] {
  return STORE_TILES.map((b) => storeTileItem(b, `${idPrefix}-${b.key}`));
}

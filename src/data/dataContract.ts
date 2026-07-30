/**
 * Data Contract (§7). Every component renders FROM these shapes; no component
 * hardcodes a name, rate, price, or fee string. The real CashKaro feed populates
 * these objects. Values transcribed from the Cashkaro-Search-2026 "Real Data
 * Cases" are in ./realData.ts — nothing here invents a figure.
 */

// 13 product archetypes (§3.1).
export type Archetype =
  | '01_store'
  | '02_product'
  | '03_compound'
  | '04_category'
  | '05_credit_card'
  | '06_cobranded_card'
  | '07_loan'
  | '08_non_partner'
  | '09_paused_store'
  | '10_beyond_catalogue'
  | '11_recovery'
  | '12_bank_savings'
  | '13_campaign';

export type ResultSource = 'internal' | 'google_shopping';

/**
 * Cashback element (§3.4). `none` renders NOTHING (never "0%") — used for
 * unmapped Google-Shopping merchants. `flat_inr` is CashKaro's flat-rupee card
 * cashback, kept separate from a card's own reward rate (benefit bullets).
 */
export type Cashback =
  | { type: 'none' }
  | { type: 'pct_single'; value: number; prefix?: 'upto' | 'flat' } // "Upto {value}%" / "Flat {value}%"
  | { type: 'pct_range'; min: number; max: number } // D2C new-vs-existing
  | { type: 'flat_inr'; value: number; prefix?: 'upto' | 'flat' }; // card flat ₹

/**
 * Rate row. `reward` (savings interest) ranks descending and uses reward colour;
 * `cost` (loan APR, fee) ranks ascending and uses neutral colour (§3.4, §6.5).
 * `display` is a preformatted, feed-supplied string; components never compute it.
 */
export type Rate =
  | null
  | {
      kind: 'reward' | 'cost';
      value: number;
      display: string; // e.g. "10.49% p.a." — comes from the feed
      note?: string; // e.g. "on balance transfers"
    };

export type FeeState = 'fee' | 'free' | 'discontinued';
export type Fees = {
  state: FeeState;
  joining: string | null; // preformatted, e.g. "₹500" | "Lifetime Free"
  annual: string | null;
  waiver?: string; // e.g. "Waived on ₹2L annual spend" — feed-supplied
};

/** Star rating (feed-supplied, e.g. from the cards API). */
export type Rating = { stars: number; count: number };

export type Benefit = { icon?: string; text: string };

export type Badge = {
  label: string;
  tone: 'cashback' | 'reward' | 'neutral' | 'campaign';
};

/** "Top pick · <reason>" (§6.6). Reason is MANDATORY and must be a disclosed
 * ranking metric (RBI Digital Lending Directions 2025 — ranking permitted only
 * on a publicly pre-disclosed basis). No reason ⇒ no tag. */
export type TopPick = { reason: string } | null;

/** A single SERP result item (store, product, card, loan, savings, campaign). */
export interface ResultItem {
  id: string;
  archetype: Archetype;
  source: ResultSource;
  title: string;
  subtitle?: string; // e.g. "23K Shopping"
  logo: string | number | null; // URL, bundled require() (number), or null ⇒ placeholder
  logoBg?: string; // brand tint behind the logo (brand data, not a UI token)
  productImage?: number; // real product photo (bundled require id) — full-bleed on product cards
  artwork?: string | number | null; // card artwork (URL or bundled require id)
  /** Issuer wordmark for the credit-card TILE's white chip (Figma 1696:5271) — the
   *  frame's own export, not the favicon `logo` (D105). Cards only. */
  issuerLogo?: number | null;
  bannerImage?: number; // bundled deal creative (require(...)); renders full-bleed
  bannerAspect?: number; // natural width/height of the banner image
  /** Dominant colour of the banner artwork, measured by
   *  `scripts/sample-banner-tint.mjs` — drives the glow behind the deals rail. */
  bannerTint?: string;
  cashback: Cashback;
  /** Store-tile footer caption under the cashback figure. Storepage tiles say
   *  "CASHBACK" for retail/travel merchants and "REWARDS" for education & loan
   *  merchants (Storepage Tiles 611:3360). Defaults to "CASHBACK". */
  cashbackCaption?: 'CASHBACK' | 'REWARDS';
  rate?: Rate;
  /** Loan EMI for the searched amount — preformatted by the feed, e.g.
   *  "₹10,744/mo". A structured field because the loan card states it as its own
   *  labelled figure (D089); nothing computes it from amount × rate × tenure. */
  emi?: string | null;
  fees?: Fees;
  rating?: Rating;
  ratingValue?: number; // e.g. 4.6 (hero)
  shoppers?: string; // e.g. "2.1L shoppers" (hero)
  priorPct?: number; // "Up from 6%" chip (hero)
  heroTint?: string; // brand-derived hero wash colour (top of the gradient)
  timelines?: { tracksIn: string; confirmsIn: string; withdraw: string }; // cashback timelines (hero)
  finalPrice?: string; // product final price after cashback (e.g. "₹591")
  originalPrice?: string; // strike-through price, preformatted (e.g. "₹2,300")
  discount?: string; // e.g. "36% OFF"
  code?: string; // coupon code (e.g. "NYKAA10")
  expiry?: string; // coupon expiry (e.g. "Ends in 2 days")
  live?: boolean; // campaign LIVE flag
  benefitTags?: Badge[]; // up to 3 (card benefit tags)
  benefitBullets?: Benefit[]; // 2 (the card's OWN reward structure)
  badge?: Badge | null;
  topPick?: TopPick;
  ctaLabel?: string;
  mappedPartnerId?: string | null; // gates Google-Shopping cashback (Q-010)
  /** The merchant this result can be bought from — rendered as the muted
   *  "Available on <name>" footer on a web-search card (D076). Only the web feed
   *  sets it, so catalog product rails are unaffected. */
  retailer?: { name: string; logo: string | number | null };
  isPlaceholder?: boolean; // loud dev-only styling when true (§7)
}

// ── SERP shell (§3.3) ─────────────────────────────────────────────────────────
export type SectionKind =
  | 'stores'
  | 'products'
  | 'categories'
  | 'cards'
  | 'coupons'
  | 'deals'
  | 'loans'
  | 'savings'
  | 'campaign'
  | 'similar_cards';

export interface SerpSection {
  kind: SectionKind;
  title: string;
  count?: number; // shown as "(n)" where meaningful
  items: ResultItem[];
  disclaimer?: string; // §6.7 generic BFSI line, above end divider
}

export type TabKey =
  | 'all'
  | 'stores'
  | 'products'
  | 'categories'
  | 'cards'
  | 'coupons'
  | 'credit_cards'
  | 'cobranded'
  | 'loans'
  | 'savings';

export interface SerpModel {
  query: string;
  archetype: Archetype;
  /** Context line (§3.3): broad match shows a count; resolved single entity
   *  shows "Best match for …" with no count. */
  context: { label: string; count: number | null };
  hero: ResultItem | null; // present only when the query resolves to ONE entity
  tabs: TabKey[] | null; // present only when adjacent categories are plausible
  sections: SerpSection[];
  /** Expand Search (§3.2): products-only; never on finance-only result sets. */
  expandSearch: boolean;
}

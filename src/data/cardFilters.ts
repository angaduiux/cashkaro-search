/**
 * Credit-card filters — the facet lists, live counts and eligibility model behind
 * [CardFilterBar](../components/CardFilterBar.tsx), which the credit-cards result
 * page (`SerpShell`) and the Credit Cards "View all" page both mount.
 *
 * NOTHING here is invented (D004): every facet is DERIVED from the card rows the
 * feed already ships in [realData.ts](./realData.ts) —
 *
 *   bank · network   ← the row's own `subtitle` ("SBI Card · Visa")
 *   annual fee       ← `fees.state` / `fees.annual`, parsed to a number once
 *   gift-card rate   ← `cashback` (CashKaro's own flat-₹ reward for the card)
 *   spend categories ← keyword match over the card's OWN copy (title, benefit
 *                      tags, benefit bullets) against `SPEND_CATEGORIES`
 *
 * Option lists come in two kinds (D091). **Canonical** — Category, Annual Fee,
 * Gift Card Rates: the whole ladder is always offered, so the panel never changes
 * shape as you filter, and an option with no stock is dimmed rather than removed.
 * **Derived** — Card Network, Banks: read off the set in view, because offering a
 * bank the product has no card from would be inventing a facet.
 *
 * Only credit-card rows may be passed in: `fees.annual` carries a tenure string on
 * a loan row and an interest-credit frequency on a savings row (realData
 * `loanItem` / `savingsItem`), so the fee parse means nothing for those.
 */
import { ResultItem } from './dataContract';

// ── Filter state ─────────────────────────────────────────────────────────────
/**
 * One object drives the whole surface: the two bar chips, the five sheet groups
 * and the Eligible toggle. `eligibleOnly` needs a profile to mean anything, so it
 * is applied only alongside a valid one (see `filterCards`).
 */
export type CardFilterState = {
  category: string | null; // single-select spend category (bar chip + sheet)
  feeBand: string | null; // single-select annual-fee band
  networks: string[]; // multi-select
  banks: string[]; // multi-select
  minGiftCard: number | null; // single-select "₹n & above"
  eligibleOnly: boolean;
};

export const NO_CARD_FILTERS: CardFilterState = {
  category: null,
  feeBand: null,
  networks: [],
  banks: [],
  minGiftCard: null,
  eligibleOnly: false,
};

/** Every selection the user has made, which is what the sheet's Apply counts. */
export const activeCardFilterCount = (f: CardFilterState): number =>
  (f.category ? 1 : 0) +
  (f.feeBand ? 1 : 0) +
  f.networks.length +
  f.banks.length +
  (f.minGiftCard != null ? 1 : 0) +
  (f.eligibleOnly ? 1 : 0);

/** Filters set inside the sheet only — the Filters chip's own active state. */
export const sheetFilterCount = (f: CardFilterState): number =>
  (f.feeBand ? 1 : 0) + f.networks.length + f.banks.length + (f.minGiftCard != null ? 1 : 0);

export const toggleKey = (list: string[], key: string): string[] =>
  list.includes(key) ? list.filter((k) => k !== key) : [...list, key];

// ── Sheet groups (the left nav rail, in the sheet's own order) ────────────────
export type CardFilterGroup = 'category' | 'feeBand' | 'network' | 'bank' | 'giftCard';

export const CARD_FILTER_GROUPS: {
  key: CardFilterGroup;
  label: string;
  hint: string;
  mode: 'single' | 'multi';
}[] = [
  { key: 'category', label: 'Category', hint: 'Select ‘One’ Category You Wish To Apply', mode: 'single' },
  { key: 'feeBand', label: 'Annual Fee', hint: 'Pick the annual fee you are willing to pay', mode: 'single' },
  { key: 'network', label: 'Card Network', hint: 'Select one or more card networks', mode: 'multi' },
  { key: 'bank', label: 'Banks', hint: 'Select one or more issuing banks', mode: 'multi' },
  { key: 'giftCard', label: 'Gift Card Rates', hint: 'Minimum CashKaro gift card you earn', mode: 'single' },
];

/** Which groups the user has a selection in — the rail's active dots. */
export function groupHasSelection(g: CardFilterGroup, f: CardFilterState): boolean {
  switch (g) {
    case 'category':
      return f.category != null;
    case 'feeBand':
      return f.feeBand != null;
    case 'network':
      return f.networks.length > 0;
    case 'bank':
      return f.banks.length > 0;
    case 'giftCard':
      return f.minGiftCard != null;
  }
}

// ── Canonical option ladders ─────────────────────────────────────────────────
/**
 * Spend categories, each matched against the card's own copy rather than a field
 * the feed doesn't have. The patterns read the merchants and perks a card
 * actually states ("Amazon, Flipkart, Myntra" ⇒ Shopping; "forex", "lounge",
 * "Cleartrip" ⇒ Travel), so a card is only tagged with a category it earns on.
 */
const SPEND_CATEGORIES: { key: string; label: string; match: RegExp }[] = [
  { key: 'fuel', label: 'Fuel', match: /\bfuel\b|petrol|diesel|fuel surcharge/i },
  {
    key: 'shopping',
    label: 'Shopping',
    match: /shopping|online spend|\bretail\b|amazon|flipkart|myntra|ajio|nykaa|tata cliq|reliance digital/i,
  },
  { key: 'food', label: 'Online Food Ordering', match: /swiggy|zomato|food deliver|food order/i },
  { key: 'dining', label: 'Dining', match: /dining|restaurant|eazydiner|\bcafé?\b/i },
  { key: 'grocery', label: 'Grocery Shopping', match: /grocer|bigbasket|blinkit|zepto|instamart|supermarket|dmart/i },
  {
    key: 'travel',
    label: 'Travel',
    match: /travel|flight|hotel|lounge|forex|international spend|cleartrip|makemytrip|ixigo|goibibo|irctc|\buber\b|\bola\b/i,
  },
  { key: 'utility', label: 'Utility Bills', match: /utility|bill ?pay|electricity|broadband|postpaid|recharge/i },
  { key: 'upi', label: 'UPI', match: /\bupi\b|scan (?:&|and) pay|rupay credit card on upi/i },
];

export const CATEGORY_OPTIONS = SPEND_CATEGORIES.map(({ key, label }) => ({ key, label }));

export const categoryLabel = (key: string): string =>
  SPEND_CATEGORIES.find((c) => c.key === key)?.label ?? key;

/**
 * Annual-fee bands, in the ladder the mini-app filter uses. "Lifetime Free" is
 * its own band rather than the bottom of `0 – 1000`, because a free card is a
 * different product decision from a cheap one — and the card itself closes with
 * the LIFETIME FREE strip instead of two fee columns (see `CreditCard`).
 */
const FEE_BANDS: { key: string; label: string; min: number; max: number }[] = [
  { key: 'ltf', label: 'Lifetime Free (₹0)', min: 0, max: 0 },
  { key: 'f0_1000', label: '0 – 1000', min: 1, max: 1000 },
  { key: 'f1001_2000', label: '1001 – 2000', min: 1001, max: 2000 },
  { key: 'f2001_5000', label: '2001 – 5000', min: 2001, max: 5000 },
  { key: 'f5000p', label: '5000+', min: 5001, max: Number.POSITIVE_INFINITY },
];

export const FEE_BAND_OPTIONS = FEE_BANDS.map(({ key, label }) => ({ key, label }));

export const feeBandLabel = (key: string): string => FEE_BANDS.find((b) => b.key === key)?.label ?? key;

/** Gift-card thresholds offered as a filter — the CashKaro reward, in rupees. */
const GIFT_CARD_STEPS = [200, 400, 800, 1000, 1200, 1400, 1600, 1800];

export const GIFT_CARD_OPTIONS = GIFT_CARD_STEPS.map((v) => ({ key: String(v), label: giftCardLabel(v) }));

export function giftCardLabel(v: number): string {
  return `₹${v.toLocaleString('en-IN')} & above`;
}

/** Networks we can recognise in a row's subtitle, with the aliases banks print. */
const NETWORKS: { label: string; match: RegExp }[] = [
  { label: 'Visa', match: /\bvisa\b/i },
  { label: 'Mastercard', match: /\bmaster ?card\b/i },
  { label: 'RuPay', match: /\brupay\b/i },
  { label: 'American Express', match: /\bamerican express\b|\bamex\b/i },
  { label: 'Diners Club', match: /\bdiners\b/i },
];

// ── Derivations off a card row ───────────────────────────────────────────────
/** The issuing bank, exactly as the row prints it ("SBI Card", "Axis Bank"). */
export function cardBank(item: ResultItem): string | null {
  const lead = (item.subtitle ?? '').split('·')[0]?.trim();
  return lead ? lead : null;
}

export function cardNetwork(item: ResultItem): string | null {
  const s = item.subtitle ?? '';
  return NETWORKS.find((n) => n.match.test(s))?.label ?? null;
}

/**
 * The annual fee as a number. A row the feed marks `state: 'free'` — or whose fee
 * string reads free/nil — is 0, which is what puts it in the Lifetime Free band.
 * `null` means the row states no fee at all, so no band can claim it.
 */
export function annualFee(item: ResultItem): number | null {
  const fees = item.fees;
  if (!fees) return null;
  if (fees.state === 'free') return 0;
  const v = fees.annual;
  if (v == null || /free|nil/i.test(v)) return 0;
  const m = v.match(/\d[\d,]*/);
  return m ? Number(m[0].replace(/,/g, '')) : null;
}

/** CashKaro's own gift-card reward for applying, in rupees (0 when it pays a %). */
export const giftCardValue = (item: ResultItem): number =>
  item.cashback.type === 'flat_inr' ? item.cashback.value : 0;

/** The card's spend categories, read off its own tags and benefit copy. */
export function cardCategories(item: ResultItem): string[] {
  const copy = [
    item.title,
    item.subtitle ?? '',
    ...(item.benefitTags ?? []).map((t) => t.label),
    ...(item.benefitBullets ?? []).map((b) => b.text),
  ].join(' · ');
  return SPEND_CATEGORIES.filter((c) => c.match.test(copy)).map((c) => c.key);
}

// ── Eligibility ──────────────────────────────────────────────────────────────
export type IncomeType = 'salaried' | 'self_employed';

export type EligibilityProfile = {
  pin: string; // 6 digits
  monthlyIncome: number; // in-hand, per month
  incomeType: IncomeType;
};

export const PIN_LENGTH = 6;

export const INCOME_TYPES: { key: IncomeType; label: string }[] = [
  { key: 'salaried', label: 'Salaried' },
  { key: 'self_employed', label: 'Self Employed' },
];

export const isCompleteProfile = (p: Partial<EligibilityProfile> | null): p is EligibilityProfile =>
  !!p && typeof p.pin === 'string' && new RegExp(`^\\d{${PIN_LENGTH}}$`).test(p.pin) && (p.monthlyIncome ?? 0) > 0 && !!p.incomeType;

/**
 * PLACEHOLDER (§7 Placeholder Protocol, D005) — the cards feed carries no income
 * criteria, so eligibility is decided by a DISCLOSED proxy rather than a number
 * we don't have: the card's own annual-fee tier, which is the axis banks
 * themselves price income against. Self-employed thresholds sit 25% higher, as
 * issuers ask ITR-backed income there. The figures are never printed as fact —
 * the sheet states outright that the bank confirms eligibility on application —
 * and the moment the feed ships real criteria this function reads them instead.
 */
const INCOME_LADDER: { maxFee: number; salaried: number }[] = [
  { maxFee: 0, salaried: 15000 },
  { maxFee: 1000, salaried: 25000 },
  { maxFee: 2000, salaried: 30000 },
  { maxFee: 5000, salaried: 50000 },
  { maxFee: Number.POSITIVE_INFINITY, salaried: 100000 },
];

/** Indicative minimum monthly in-hand income for a card (see INCOME_LADDER). */
export function minMonthlyIncome(item: ResultItem, incomeType: IncomeType): number {
  const fee = annualFee(item) ?? 0;
  const step = INCOME_LADDER.find((s) => fee <= s.maxFee) ?? INCOME_LADDER[INCOME_LADDER.length - 1];
  return incomeType === 'self_employed' ? Math.round(step.salaried * 1.25) : step.salaried;
}

export const isEligible = (item: ResultItem, p: EligibilityProfile): boolean =>
  p.monthlyIncome >= minMonthlyIncome(item, p.incomeType);

// ── Filtering ────────────────────────────────────────────────────────────────
type Dim = CardFilterGroup | 'eligible';

const inFeeBand = (item: ResultItem, key: string): boolean => {
  const band = FEE_BANDS.find((b) => b.key === key);
  const fee = annualFee(item);
  return !!band && fee != null && fee >= band.min && fee <= band.max;
};

/** Does the card pass every dimension except `skip`? */
function passes(item: ResultItem, f: CardFilterState, profile: EligibilityProfile | null, skip?: Dim): boolean {
  if (skip !== 'category' && f.category && !cardCategories(item).includes(f.category)) return false;
  if (skip !== 'feeBand' && f.feeBand && !inFeeBand(item, f.feeBand)) return false;
  if (skip !== 'network' && f.networks.length) {
    const n = cardNetwork(item);
    if (!n || !f.networks.includes(n)) return false;
  }
  if (skip !== 'bank' && f.banks.length) {
    const b = cardBank(item);
    if (!b || !f.banks.includes(b)) return false;
  }
  if (skip !== 'giftCard' && f.minGiftCard != null && giftCardValue(item) < f.minGiftCard) return false;
  // The toggle can only be on with a complete profile, but a stale profile must
  // never silently widen the set either — no profile ⇒ no eligibility filter.
  if (skip !== 'eligible' && f.eligibleOnly && (!profile || !isEligible(item, profile))) return false;
  return true;
}

/** The cards the page shows, in the feed's own ranking order. */
export const filterCards = (
  items: ResultItem[],
  f: CardFilterState,
  profile: EligibilityProfile | null,
): ResultItem[] => items.filter((item) => passes(item, f, profile));

export type CardFacet = { key: string; label: string; count: number };
export type CardFacets = Record<CardFilterGroup, CardFacet[]>;

/**
 * Facet options with live counts. Each option is counted with every OTHER
 * dimension applied and its own released — so ticking a second bank shows how
 * many cards it would ADD, not how many are left. Canonical ladders keep their
 * zero-count options (the bar dims them); derived groups list only what the set
 * actually contains.
 */
export function cardFacets(
  items: ResultItem[],
  f: CardFilterState,
  profile: EligibilityProfile | null,
): CardFacets {
  const countIf = (skip: Dim, pred: (item: ResultItem) => boolean) =>
    items.filter((item) => passes(item, f, profile, skip) && pred(item)).length;

  const uniq = (vals: (string | null)[]) =>
    Array.from(new Set(vals.filter((v): v is string => !!v))).sort((a, b) => a.localeCompare(b));

  return {
    category: CATEGORY_OPTIONS.map((o) => ({
      ...o,
      count: countIf('category', (item) => cardCategories(item).includes(o.key)),
    })),
    feeBand: FEE_BAND_OPTIONS.map((o) => ({
      ...o,
      count: countIf('feeBand', (item) => inFeeBand(item, o.key)),
    })),
    network: uniq(items.map(cardNetwork)).map((label) => ({
      key: label,
      label,
      count: countIf('network', (item) => cardNetwork(item) === label),
    })),
    bank: uniq(items.map(cardBank)).map((label) => ({
      key: label,
      label,
      count: countIf('bank', (item) => cardBank(item) === label),
    })),
    giftCard: GIFT_CARD_OPTIONS.map((o) => ({
      ...o,
      count: countIf('giftCard', (item) => giftCardValue(item) >= Number(o.key)),
    })),
  };
}

/**
 * The sheet's availability strip. It names the chosen category when there is one
 * ("Fuel Cards Available : 3"), because that is the choice the rest of the sheet
 * narrows — and stays a plain count when there isn't.
 */
export const availabilityLabel = (f: CardFilterState, n: number): string =>
  f.category
    ? `${categoryLabel(f.category)} Cards Available : ${n}`
    : `${n} ${n === 1 ? 'Card' : 'Cards'} Available`;

/** The applied-filter pills, each with the state that removes just that one. */
export function appliedCardFilters(f: CardFilterState): { key: string; label: string; without: CardFilterState }[] {
  const out: { key: string; label: string; without: CardFilterState }[] = [];
  if (f.category) out.push({ key: 'category', label: categoryLabel(f.category), without: { ...f, category: null } });
  if (f.feeBand) out.push({ key: 'feeBand', label: feeBandLabel(f.feeBand), without: { ...f, feeBand: null } });
  for (const n of f.networks) {
    out.push({ key: `network-${n}`, label: n, without: { ...f, networks: toggleKey(f.networks, n) } });
  }
  for (const b of f.banks) {
    out.push({ key: `bank-${b}`, label: b, without: { ...f, banks: toggleKey(f.banks, b) } });
  }
  if (f.minGiftCard != null) {
    out.push({ key: 'giftCard', label: giftCardLabel(f.minGiftCard), without: { ...f, minGiftCard: null } });
  }
  if (f.eligibleOnly) out.push({ key: 'eligible', label: 'Eligible for me', without: { ...f, eligibleOnly: false } });
  return out;
}

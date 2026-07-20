/**
 * Icon Map — single source of truth for UI-concept → Font Awesome 6 Pro glyph.
 * (Build Protocol §Phase 1 / §7.) A concept not in this map is a QUESTION, not a
 * guess.
 *
 * We render the licensed FA6 Pro fonts (bundled from the desktop install as
 * .otf, loaded in App.tsx) as text glyphs by Unicode code point. Each entry is a
 * { style, glyph } pair; `style` selects which loaded font family to use.
 *
 * Code points are the stable, public FA6 values. If a concept below is later
 * found to need a Pro-only glyph that differs, fix it HERE, not at the call site.
 */

export type FaStyle = 'solid' | 'regular' | 'light' | 'brands' | 'duotone';

// Font family names must match the keys registered with expo-font in App.tsx.
export const FA_FONT_FAMILY: Record<FaStyle, string> = {
  solid: 'FA6Pro-Solid',
  regular: 'FA6Pro-Regular',
  light: 'FA6Pro-Light',
  brands: 'FA6Brands',
  duotone: 'FA6Duotone-Solid',
};

type IconDef = { style: FaStyle; glyph: string };

const u = (hex: string) => String.fromCodePoint(parseInt(hex, 16));

export const ICON = {
  // navigation / search chrome
  search: { style: 'regular', glyph: u('f002') }, // magnifying-glass
  back: { style: 'regular', glyph: u('f060') }, // arrow-left
  clear: { style: 'regular', glyph: u('f00d') }, // xmark
  chevron: { style: 'regular', glyph: u('f054') }, // chevron-right
  mic: { style: 'regular', glyph: u('f130') }, // microphone (voice input, §11 parity)
  filter: { style: 'regular', glyph: u('f0b0') }, // filter
  sort: { style: 'regular', glyph: u('f161') }, // arrow-down-wide-short (sort)

  // content / meta
  star: { style: 'solid', glyph: u('f005') }, // star (ratings)
  clock: { style: 'regular', glyph: u('f017') }, // clock (recents / timelines)
  tag: { style: 'regular', glyph: u('f02b') }, // tag (coupons/offers)
  check: { style: 'regular', glyph: u('f00c') }, // check
  fire: { style: 'regular', glyph: u('f06d') }, // fire (top pick / popular accent)
  bolt: { style: 'regular', glyph: u('e0b7') }, // bolt-lightning (instant/high value)
  globe: { style: 'regular', glyph: u('f0ac') }, // globe (web results scope)

  // finance
  card: { style: 'regular', glyph: u('f09d') }, // credit-card
  bank: { style: 'regular', glyph: u('f19c') }, // building-columns (bank / savings)
  coins: { style: 'regular', glyph: u('f51e') }, // coins (loan / amount)
  percent: { style: 'regular', glyph: u('25') }, // literal % sign
  rupee: { style: 'regular', glyph: u('e1bc') }, // indian-rupee-sign

  // AI / expand search (§9 centrepiece)
  ai: { style: 'regular', glyph: u('e2ca') }, // wand-magic-sparkles
  sparkle: { style: 'regular', glyph: u('e5d1') }, // sparkles

  // OS chrome (status bar, keyboard)
  signal: { style: 'solid', glyph: u('f012') }, // signal bars
  wifi: { style: 'solid', glyph: u('f1eb') }, // wifi
  battery: { style: 'solid', glyph: u('f240') }, // battery-full
  shift: { style: 'regular', glyph: u('f062') }, // arrow-up (shift)
  backspace: { style: 'regular', glyph: u('f55a') }, // delete-left
  home: { style: 'regular', glyph: u('f015') }, // house (nav)
  user: { style: 'regular', glyph: u('f007') }, // user (nav / profile)
  gift: { style: 'regular', glyph: u('f06b') }, // gift (referrals nav)

  // suggestion category tiles
  aiSearch: { style: 'regular', glyph: u('e65e') }, // magnifying-glass-arrows-rotate
  history: { style: 'regular', glyph: u('f1da') }, // clock-rotate-left (recents)
  grid: { style: 'regular', glyph: u('f00a') }, // th-large (product / category)
  loan: { style: 'regular', glyph: u('f0d6') }, // money-bill (loans)
  campaign: { style: 'regular', glyph: u('f0e7') }, // bolt (campaigns)
} satisfies Record<string, IconDef>;

export type IconName = keyof typeof ICON;

/**
 * Concepts with no confirmed FA glyph — surface as an explicit question rather
 * than guessing (§7). "cashback timeline" (the store money-page earn/confirm/
 * payment schedule) has no obvious single glyph; currently composed from
 * `clock` + text pending confirmation with the person.
 */
export const UNRESOLVED_ICON_CONCEPTS = ['cashback-timeline'] as const;

/**
 * CashKaro design tokens — the ONLY source of color, type, spacing, radius,
 * elevation and motion in this app. Extracted verbatim from the live
 * "CashKaro Mini App Design System" (Figma key P7UcoZYBnfyefmJIA8wcM7),
 * Foundations page.
 *
 * HARD RULE (Build Protocol §Phase 1): no literal hex, px, or font-family name
 * may appear anywhere else in the codebase. A value not present here cannot be
 * used. This eliminates colour/spacing drift and hallucinated values.
 */

// ── Raw colour ramps (from Figma variable collections) ───────────────────────
const palette = {
  cobalt50: '#ebf0ff',
  cobalt500: '#0741ef',
  cobalt700: '#0036da',
  fern600: '#1e8c44',
  fern700: '#1a7a39',
  ruby600: '#b80e00',
  ruby700: '#a00c00',
  orange: '#ff6d1d', // action/primary/default
  orangeTint: '#fff1e9', // light warm surface derived from the brand orange
  slate100: '#f3f3f6', // neutral field fill

  // ── "Aura" search-page palette (from the Cashkaro-Search-2026 W4 design;
  //    exact values pulled via Figma design context) ──────────────────────────
  auraInk: '#0e1116', // near-black heading
  auraSlate: '#5b6470', // secondary text
  auraSlateMuted: '#8592a7', // tertiary / labels
  auraBg: '#f6f7f9', // page / tile surface
  auraHeroFrom: '#f6e5ff', // hero gradient top (lavender)
  auraHeroTo: '#f6f7f9', // hero gradient bottom
  auraOrange: '#e55a0e', // cashback figure
  auraBlue: '#0036da', // primary CTA (Shop & Earn)
  auraGold: '#fabf2e', // rating star
  auraGreen: '#047857', // "up from" reward text
  auraGreenSurface: '#e7f7f1', // "up from" chip bg
  auraBorder: '#e6e8ee', // hairline on tiles
  auraOffGreen: '#01ab4b', // storepage store-card "Upto X% Off" (Figma 1646:7182)
  auraCashbackCaption: 'rgba(99,99,99,0.44)', // store-card "CASHBACK" label
  auraTileWash: '#eef2fb', // neutral store-tile wash (Storepage Tiles 611:3360)
  ink900: '#262626', // text/primary
  ink600: '#5c5c5c', // text/secondary
  ink400: '#878787', // text/tertiary
  slate400: '#9aa3b2', // muted price / field-icon grey (aura)
  peach50: '#fff0e8', // product cashback-pill gradient start (Figma 1646:7877)
  white: '#ffffff',
  borderSubtle: '#dddce7',
  successSubtle: '#edfbf8',
  errorSubtle: '#fef1f1',
} as const;

// ── Semantic colour roles ────────────────────────────────────────────────────
// Reward-vs-cost rule (§6.5, confirmed): cashback = Cobalt; reward ("bigger is
// better": savings interest, cashback) = Fern green; cost ("smaller is better":
// loan APR, fees) = neutral tertiary. CTA = orange.
export const color = {
  // surfaces
  surface: palette.white,
  surfaceAlt: palette.cobalt50,
  border: palette.borderSubtle,

  // text
  textPrimary: palette.ink900,
  textSecondary: palette.ink600,
  textTertiary: palette.ink400,
  textInverse: palette.white,
  textLink: palette.cobalt700,

  // action
  actionPrimary: palette.orange,
  actionPrimaryText: palette.white,
  saffron: '#ffe6d6', // saffron/200 — cashback-pill gradient start (DS)
  trendingSurface: '#fff4e9', // trending chip bg (W4 home)
  recentSurface: '#f6f7f9', // recent chip / slot bg (W4 home)
  actionSurface: palette.orangeTint, // light warm tint (trending chips, deal strips)

  // neutral field fill (search bar, inputs)
  fieldFill: palette.slate100,

  // cashback (CashKaro's own cashback figure — flat ₹ or %)
  cashback: palette.cobalt500,
  cashbackStrong: palette.cobalt700,
  cashbackSurface: palette.cobalt50,

  // reward vs cost (finance)
  reward: palette.fern600, // higher = better for the user
  rewardStrong: palette.fern700,
  cost: palette.ink600, // higher = worse; deliberately neutral, never green
  costMuted: palette.ink400,

  // feedback
  success: palette.fern600,
  successSurface: palette.successSubtle,
  error: palette.ruby600,
  errorSurface: palette.errorSubtle,

  // dev-only: loud style for un-sourced placeholder values (§7 Placeholder Protocol)
  placeholder: palette.ruby600,
  placeholderSurface: '#ffe600', // intentionally garish; never ships with real data

  // "Aura" search-page semantic roles (W4 design)
  aura: {
    ink: palette.auraInk,
    slate: palette.auraSlate,
    slateMuted: palette.auraSlateMuted,
    bg: palette.auraBg,
    heroFrom: palette.auraHeroFrom,
    heroTo: palette.auraHeroTo,
    cashback: palette.auraOrange,
    cta: palette.auraBlue,
    star: palette.auraGold,
    green: palette.auraGreen,
    greenSurface: palette.auraGreenSurface,
    border: palette.auraBorder,
    offGreen: palette.auraOffGreen, // store-card "Upto X% Off"
    cashbackCaption: palette.auraCashbackCaption, // store-card "CASHBACK" label
    tileWash: palette.auraTileWash, // store-tile wash when the brand has no tint
    fieldIcon: palette.slate400, // search-field icons (search / clear)
    priceMuted: palette.slate400, // product current/strike price grey (Figma 1646:7869)
    cashbackPillFrom: palette.peach50, // product cashback-pill gradient start
    searchField: '#eef1f6', // search-bar fill (Figma searchBar 1668:10754, flat, no shadow)
    indicator: '#325065', // carousel page indicator (Swiggy-style pill + dots)
    // AI Expand gradient set (Figma 1646:7445)
    aiFrom: '#0036da',
    aiTo: '#7c3aed',
    aiWash1: '#a163ff',
    aiWash2: '#7d63ff',
    aiCardTo: '#f5f7ff',
  },
  // Credit-card card component (Figma DS 1785:28364)
  card: {
    name: '#262626', // card name (text/primary)
    border: '#eeeeee', // border/subtle-3
    pillFrom: '#ffe6d6', // saffron/200 cashback pill gradient start
    tagBg: '#edfbff', // sky tone/bg-subtle
    tagBorder: '#a6e2f4', // sky tone/border
    tagText: 'rgba(0,0,0,0.8)', // transparent-black/80
    benefit: '#5c5c5c', // text/secondary
    feeLabel: '#808387', // fee caption
    feeValue: '#0d0d0e', // fee value (text/default)
    apply: '#0741ef', // Apply Now button (accent-bg cobalt)
    divider: '#e5e7eb',
  },
} as const;

// ── Type ─────────────────────────────────────────────────────────────────────
export const fontFamily = {
  // maps to the bundled Outfit weights loaded in App.tsx
  regular: 'Outfit-Regular',
  medium: 'Outfit-Medium',
  semiBold: 'Outfit-SemiBold',
  bold: 'Outfit-Bold',
  extraBold: 'Outfit-ExtraBold',
} as const;

export const letterSpacing = {
  tight: -0.4,
  snug: -0.28, // store-card cashback value (Figma 1646:7182)
  normal: 0,
  wide: 0.4,
  caps: 0.96, // store-card "CASHBACK" label tracking
} as const;

type TypeStyle = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
};

// Named type ramp — mirrors the Figma "Display / Heading / Body / Caption" scale.
export const type = {
  display40Bold: { fontFamily: fontFamily.bold, fontSize: 40, lineHeight: 48, letterSpacing: letterSpacing.tight },
  display32Bold: { fontFamily: fontFamily.bold, fontSize: 32, lineHeight: 40, letterSpacing: letterSpacing.tight },
  heading30SemiBold: { fontFamily: fontFamily.semiBold, fontSize: 30, lineHeight: 38, letterSpacing: letterSpacing.tight },
  heading24SemiBold: { fontFamily: fontFamily.semiBold, fontSize: 24, lineHeight: 32, letterSpacing: letterSpacing.tight },
  heading22SemiBold: { fontFamily: fontFamily.semiBold, fontSize: 22, lineHeight: 30, letterSpacing: letterSpacing.normal },
  heading20Bold: { fontFamily: fontFamily.bold, fontSize: 20, lineHeight: 28, letterSpacing: letterSpacing.normal },
  heading18SemiBold: { fontFamily: fontFamily.semiBold, fontSize: 18, lineHeight: 26, letterSpacing: letterSpacing.normal },
  body17Regular: { fontFamily: fontFamily.regular, fontSize: 17, lineHeight: 25, letterSpacing: letterSpacing.normal },
  body16Regular: { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 24, letterSpacing: letterSpacing.normal },
  body16SemiBold: { fontFamily: fontFamily.semiBold, fontSize: 16, lineHeight: 24, letterSpacing: letterSpacing.normal },
  body16Medium: { fontFamily: fontFamily.medium, fontSize: 16, lineHeight: 24, letterSpacing: letterSpacing.normal },
  body15SemiBold: { fontFamily: fontFamily.semiBold, fontSize: 15, lineHeight: 20, letterSpacing: letterSpacing.normal },
  body15Medium: { fontFamily: fontFamily.medium, fontSize: 15, lineHeight: 21, letterSpacing: letterSpacing.normal },
  body14SemiBoldFlat: { fontFamily: fontFamily.semiBold, fontSize: 14, lineHeight: 16, letterSpacing: letterSpacing.normal },
  body13Medium: { fontFamily: fontFamily.medium, fontSize: 13, lineHeight: 18, letterSpacing: letterSpacing.normal },
  body14Regular: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 20, letterSpacing: letterSpacing.normal },
  body14SemiBold: { fontFamily: fontFamily.semiBold, fontSize: 14, lineHeight: 20, letterSpacing: letterSpacing.wide },
  body12Regular: { fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 16, letterSpacing: letterSpacing.normal },
  body12Medium: { fontFamily: fontFamily.medium, fontSize: 12, lineHeight: 16, letterSpacing: letterSpacing.normal },
  body12SemiBold: { fontFamily: fontFamily.semiBold, fontSize: 12, lineHeight: 16, letterSpacing: letterSpacing.wide },
  body14BoldSnug: { fontFamily: fontFamily.bold, fontSize: 14, lineHeight: 18, letterSpacing: letterSpacing.snug },
  caption10SemiBold: { fontFamily: fontFamily.semiBold, fontSize: 10, lineHeight: 14, letterSpacing: letterSpacing.wide },
  caption10Bold: { fontFamily: fontFamily.bold, fontSize: 10, lineHeight: 12, letterSpacing: letterSpacing.normal },
  caption10Medium: { fontFamily: fontFamily.medium, fontSize: 10, lineHeight: 10, letterSpacing: letterSpacing.normal },
  caption8SemiBold: { fontFamily: fontFamily.semiBold, fontSize: 8, lineHeight: 10, letterSpacing: letterSpacing.normal },
  caption8SemiBoldCaps: { fontFamily: fontFamily.semiBold, fontSize: 8, lineHeight: 10, letterSpacing: letterSpacing.caps },
} satisfies Record<string, TypeStyle>;

// ── Spacing ────────────────────────────────────────────────────────────────── (Figma spacing scale)
export const space = {
  none: 0,
  xxs: 2,
  xs: 4,
  s6: 6,
  s: 8,
  s12: 12,
  s14: 14,
  m: 16,
  m20: 20,
  l: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
  huge: 64,
  huge80: 80,
  huge96: 96,
  huge128: 128,
} as const;

// ── Radius ─────────────────────────────────────────────────────────────────── (Figma radius scale)
export const radius = {
  xs: 4,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  xxl: 32, // search field (Figma searchBar 1668:10754)
  full: 10000,
} as const;

// ── Elevation ────────────────────────────────────────────────────────────────
// RN shadow objects derived from the Figma "Shadow/Light" + "Shadow/Brand" sets.
// (RN uses shadowColor/Opacity/Radius/Offset + Android elevation.)
type Shadow = {
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffset: { width: number; height: number };
  elevation: number;
};
export const elevation = {
  xs: { shadowColor: '#000000', shadowOpacity: 0.06, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  sm: { shadowColor: '#000000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  md: { shadowColor: '#000000', shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  lg: { shadowColor: '#000000', shadowOpacity: 0.12, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 10 },
  brandSm: { shadowColor: palette.orange, shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  brandMd: { shadowColor: palette.orange, shadowOpacity: 0.16, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  // Brand-logo tile shadow — exact W4 spec (Figma 1646:7263): 0 4.8 6.4 rgba(18,23,38,.1)
  logo: { shadowColor: '#121726', shadowOpacity: 0.1, shadowRadius: 6.4, shadowOffset: { width: 0, height: 4.8 }, elevation: 3 },
  // Soft card shadow — W4 store-row spec (0 3 6 rgba(216,221,233,.6))
  soft: { shadowColor: '#d8dde9', shadowOpacity: 0.6, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
} satisfies Record<string, Shadow>;

// ── Motion (§9.2) ──────────────────────────────────────────────────────────────
// Durations (ms), spring configs, stagger. Easing curves are applied in the
// motion layer via Easing.bezier(...).
export const duration = {
  instant: 80,
  fast: 140,
  base: 200,
  moderate: 280,
  slow: 400,
  hero: 600,
} as const;

export const easing = {
  standard: [0.2, 0, 0, 1],
  emphasized: [0.05, 0.7, 0.1, 1],
  accelerate: [0.3, 0, 1, 1],
  inout: [0.4, 0, 0.2, 1],
} as const;

export const spring = {
  snappy: { stiffness: 320, damping: 30 },
  smooth: { stiffness: 240, damping: 28 },
  bouncy: { stiffness: 380, damping: 26 },
} as const;

export const stagger = { step: 35, cap: 210 } as const;

// Minimum tap target (§6.2, §11; NN/g ≥ ~1cm ≈ 44px).
export const MIN_TAP_TARGET = 44;

// Canonical pill/chip height — every rounded selector pill (tabs, filter chips,
// recent/trending, category, view-all switchers) is exactly this tall so the app
// reads as one system. space.xxl = 40. Pair with hitSlop to keep the ≥44px tap
// target (see TabBar). Does NOT apply to inline status badges/tags (% OFF,
// cashback pills, LIVE, carousel indicators) — those are labels, not pills.
export const PILL_HEIGHT = space.xxl;

// Deal banner strip height (design spec).
export const BANNER_HEIGHT = 118;

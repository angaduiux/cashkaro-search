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
  auraOrange: '#e55a0e', // legacy cashback-figure hue — superseded by auraBlue (D056)
  auraBlue: '#0036da', // primary CTA (Shop & Earn) + every cashback figure (D056)
  auraGold: '#fabf2e', // rating star
  auraGreen: '#047857', // "up from" reward text
  auraGreenSurface: '#e7f7f1', // "up from" chip bg
  auraBorder: '#e6e8ee', // hairline on tiles
  auraOffGreen: '#01ab4b', // storepage store-card "Upto X% Off" (Figma 1646:7182)
  auraCashbackCaption: 'rgba(99,99,99,0.44)', // store-card "CASHBACK" label
  auraTileWash: '#eef2fb', // neutral store-tile wash (Storepage Tiles 611:3360)
  // ── AI "aura" flowing-gradient set (Expand-Search card, Figma 1646:7445) ────
  // The four hues below are ONE cyclic ramp: cobalt → indigo → violet → orchid →
  // (back to) cobalt. Because the last hue reads back into the first, a strip
  // painted with the ramp repeated twice can translate forever with no seam.
  auraAiCobalt: '#0036da',
  auraAiIndigo: '#4f46e5',
  auraAiViolet: '#7c3aed',
  auraAiOrchid: '#a163ff',
  auraAiPeriwinkle: '#7d63ff',
  auraAiMagenta: '#e879f9', // the "magic" end of the ramp
  auraAiAqua: '#38bdf8', // cools the cycle back toward cobalt
  // Fallback for brand tints that have no colour of their own (Nike, AJIO, Puma …
  // are all near-black at low alpha). A grey aura reads as dirt, so those get sky.
  auraAiSkyWash: '#e6f4fd', // pale sky — the hero's base wash
  auraAiCardTo: '#f5f7ff', // card wash bottom (near-white lavender)
  // Glass/specular layers on the AI CTA + mark.
  whiteClear: 'rgba(255,255,255,0)', // zero-alpha white — fade-to-page stops
  // Glow platter behind the 3D mark.
  auraAiGlowCore: 'rgba(124,58,237,0.26)',
  auraAiGlowMid: 'rgba(161,99,255,0.14)',
  auraAiGlow0: 'rgba(161,99,255,0)',
  auraAiSheen: 'rgba(255,255,255,0.40)',
  auraAiSheen0: 'rgba(255,255,255,0)',
  auraAiGloss: 'rgba(255,255,255,0.24)',
  auraAiGlossMid: 'rgba(255,255,255,0.05)',
  auraAiHairline: 'rgba(255,255,255,0.45)', // 1px top highlight (iOS control gloss)
  auraAiPress: 'rgba(255,255,255,0.14)', // UIKit-style highlight veil on touch
  auraAiInnerShade: 'rgba(16,10,64,0.14)', // bottom inner shade for depth
  auraAiEdge: 'rgba(84,40,190,0.10)', // card hairline on white
  auraAiChip: 'rgba(255,255,255,0.74)', // "found on the web" pill fill
  auraAiShadow: '#261a99', // brand-violet ambient shadow (mark + CTA)
  auraAiCardShadow: '#000f66', // card elevation colour
  // Glass AI mark (icons/AiMark.tsx) — an all-BLUE body under white specular
  // layers: ice → azure → cobalt → navy along the light's diagonal. The earlier
  // cyan→mint→violet ramp put its two lightest stops (#22d3ee, #34e0b0) against
  // the band's pale lavender field, so at 1× the mark washed out to near-white.
  // Blue keeps a dark end at every stop, which is what makes it read as a solid
  // 3D object on a light ground rather than a watermark.
  auraAiIce: '#bae6fd', // lit near edge (top-left)
  auraAiAzure: '#38bdf8', // bright blue, the light's turn
  auraAiCobalt3d: '#0741ef', // brand cobalt — the body's true colour
  auraAiNavy: '#0b1e78', // shaded far edge (bottom-right)
  auraAiGlassRimBlue: 'rgba(186,230,253,0.9)', // ice-tinted lit rim
  // Blue glow platter behind the mark (was violet, to match the old body ramp).
  auraAiGlowBlueCore: 'rgba(7,65,239,0.20)',
  auraAiGlowBlueMid: 'rgba(56,189,248,0.15)',
  auraAiGlowBlue0: 'rgba(56,189,248,0)',
  auraAiGlassRim: 'rgba(255,255,255,0.72)', // glass edge highlight
  auraAiGlassRim0: 'rgba(255,255,255,0.12)', // rim fading round to the unlit side
  auraAiGlassCore: 'rgba(255,255,255,0.85)', // specular hot spot
  auraAiGlassSpecMid: 'rgba(255,255,255,0.30)', // specular falloff
  auraAiGlassCore0: 'rgba(255,255,255,0)',
  auraAiGlassShade: 'rgba(38,26,153,0.34)', // contact shade under the mark
  auraAiGlassDepth: 'rgba(38,26,153,0.42)', // inner shade on the glass's far face

  ink900: '#262626', // text/primary
  ink600: '#5c5c5c', // text/secondary
  ink400: '#878787', // text/tertiary
  slate400: '#9aa3b2', // muted price / field-icon grey (aura)
  peach50: '#fff0e8', // legacy warm cashback-pill gradient start (Figma 1646:7877) — see D056
  white: '#ffffff',
  // Modal scrim — auraInk at 45%; the only dimming layer in the app (bottom sheets).
  scrim: 'rgba(14,17,22,0.45)',
  borderSubtle: '#dddce7',
  // The warm twin of `borderSubtle`: the same step down from its surface that
  // #dddce7 is from cobalt50, taken from #fff4e9 instead. A cool hairline around
  // a warm pill is the one thing that reads as a mistake rather than as a system.
  borderSubtleWarm: '#f1e0d1',
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
  scrim: palette.scrim, // behind a bottom sheet

  // text
  textPrimary: palette.ink900,
  textSecondary: palette.ink600,
  textTertiary: palette.ink400,
  textInverse: palette.white,
  textLink: palette.cobalt700,

  // action
  actionPrimary: palette.orange,
  actionPrimaryText: palette.white,
  saffron: '#ffe6d6', // saffron/200 — legacy warm cashback-pill gradient start (DS); see D056
  trendingSurface: '#fff4e9', // trending chip bg (W4 home) — the gradient's warm end
  trendingBorder: palette.borderSubtleWarm, // trending chip hairline (category-pill treatment, warm)
  recentSurface: '#f6f7f9', // recent chip / slot bg (W4 home)
  // SKU thumb well (trending pill, D081). A recessed disc, lit from above: a soft
  // dark cast off the TOP inner edge, a faint light return off the BOTTOM one, and a
  // hairline ring so the well still reads if inset shadows are dropped. Ink-blue
  // rather than black, matching the logo-tile shadow (#121726) the app already casts.
  thumbWellShade: 'rgba(18,23,38,0.16)',
  thumbWellSheen: 'rgba(255,255,255,0.65)',
  thumbWellRing: 'rgba(18,23,38,0.08)',
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
    // Cashback figures are BLUE app-wide (D056) — the same cobalt the store card's
    // "Upto X%" footer and the Shop & Earn CTA already use, so one number can never
    // appear in two colours depending on which surface renders it.
    cashback: palette.auraBlue,
    cta: palette.auraBlue,
    // The store hero's own filled CTA (Sign Up & Earn / Shop & Earn) is the brand
    // ACTION orange, not the cobalt every other aura control uses (D058). It has
    // its own role because `cta` above also paints the mic, the tab pills, the
    // facet chips and every inline "Shop & Earn ›" link — repointing that would
    // recolour half the app to make one button warm.
    ctaHero: palette.orange,
    star: palette.auraGold,
    green: palette.auraGreen,
    greenSurface: palette.auraGreenSurface,
    border: palette.auraBorder,
    offGreen: palette.auraOffGreen, // store-card "Upto X% Off"
    cashbackCaption: palette.auraCashbackCaption, // store-card "CASHBACK" label
    tileWash: palette.auraTileWash, // store-tile wash when the brand has no tint
    fieldIcon: palette.slate400, // search-field icons (search / clear)
    priceMuted: palette.slate400, // product current/strike price grey (Figma 1646:7869)
    cashbackPillFrom: palette.cobalt50, // cashback-pill gradient start — cool tint of the blue figure (D056)
    searchField: '#eef1f6', // search-bar fill (Figma searchBar 1668:10754, flat, no shadow)
    indicator: '#325065', // carousel page indicator (Swiggy-style pill + dots)
    // AI Expand gradient set (Figma 1646:7445). aiFrom→aiVia→aiTo→aiWash1 is a
    // CYCLIC ramp (orchid reads back into cobalt) — see AI_FLOW_HUES below.
    aiFrom: palette.auraAiCobalt,
    aiVia: palette.auraAiIndigo,
    aiTo: palette.auraAiViolet,
    aiWash1: palette.auraAiOrchid,
    aiWash2: palette.auraAiPeriwinkle,
    aiMagenta: palette.auraAiMagenta,
    aiAqua: palette.auraAiAqua,
    aiSky: palette.auraAiAqua, // same hue, named for its role as the grey fallback
    aiSkyWash: palette.auraAiSkyWash,
    aiCardTo: palette.auraAiCardTo,
    // glass layers
    fade0: palette.whiteClear, // start stop for any fade-into-the-page gradient
    aiGlowCore: palette.auraAiGlowCore,
    aiGlowMid: palette.auraAiGlowMid,
    aiGlow0: palette.auraAiGlow0,
    aiSheen: palette.auraAiSheen,
    aiSheen0: palette.auraAiSheen0,
    aiGloss: palette.auraAiGloss,
    aiGlossMid: palette.auraAiGlossMid,
    aiHairline: palette.auraAiHairline,
    aiPress: palette.auraAiPress,
    aiInnerShade: palette.auraAiInnerShade,
    aiEdge: palette.auraAiEdge,
    aiChip: palette.auraAiChip,
    aiShadow: palette.auraAiShadow,
    aiCardShadow: palette.auraAiCardShadow,
    // glass AI mark — blue body ramp (ice → azure → cobalt → navy)
    aiIce: palette.auraAiIce,
    aiAzure: palette.auraAiAzure,
    aiCobalt3d: palette.auraAiCobalt3d,
    aiNavy: palette.auraAiNavy,
    aiGlassRimBlue: palette.auraAiGlassRimBlue,
    aiGlowBlueCore: palette.auraAiGlowBlueCore,
    aiGlowBlueMid: palette.auraAiGlowBlueMid,
    aiGlowBlue0: palette.auraAiGlowBlue0,
    aiGlassRim: palette.auraAiGlassRim,
    aiGlassRim0: palette.auraAiGlassRim0,
    aiGlassCore: palette.auraAiGlassCore,
    aiGlassSpecMid: palette.auraAiGlassSpecMid,
    aiGlassCore0: palette.auraAiGlassCore0,
    aiGlassShade: palette.auraAiGlassShade,
    aiGlassDepth: palette.auraAiGlassDepth,
  },
  // Credit-card card component (Figma DS 1785:28364)
  card: {
    name: '#262626', // card name (text/primary)
    border: '#eeeeee', // border/subtle-3
    pillFrom: '#ebf0ff', // cobalt/50 cashback-pill gradient start (was saffron/200 #ffe6d6 — D056)
    tagBg: '#edfbff', // sky tone/bg-subtle
    tagBorder: '#a6e2f4', // sky tone/border
    tagText: 'rgba(0,0,0,0.8)', // transparent-black/80
    benefit: '#5c5c5c', // text/secondary
    feeLabel: '#808387', // fee caption (colors/text/text-secondary)
    feeValue: '#0d0d0e', // fee value (colors/text/text-default)
    apply: '#0741ef', // Apply Now button (accent-bg cobalt)
    divider: '#e5e7eb',
    // ── Mini App Main spec, Figma `9RfW1gNewOnFDsNqaHsRoF` node 4007:57107 ─────
    // The five card instances there are ONE component (731:33245). Everything
    // below is read off it verbatim (D061), which is why the cashback pill is
    // orange here while every other cashback figure in the app is cobalt (D056):
    // this pill is the spec's, and the spec calls the CK Orange variable.
    frameBorder: '#e7e7e7', // card stroke
    title: 'rgba(10,10,10,0.9)', // card name
    /** Cashback pill — a 100° three-stop wash of CK Orange, and its text. */
    pillOrange1: 'rgba(255,109,29,0.2)',
    pillOrange2: 'rgba(255,109,29,0.08)',
    pillOrange3: 'rgba(255,109,29,0.02)',
    pillText: '#ff6d1d', // CK Orange
    /** Benefit tag — 0.86px cool stroke over a near-invisible blue→white wash. */
    tagStroke: 'rgba(103,157,194,0.12)',
    tagFillFrom: 'rgba(26,76,226,0.04)',
    tagFillTo: 'rgba(255,255,255,0.04)',
    tagLabel: '#262626', // Text Black
    /** Benefit rows: 18px stroked glyph + Text Inactive copy. */
    bulletIcon: '#222222',
    bulletIconOpacity: 0.5,
    /** Apply Now CTA — 98° cobalt ramp (CK Mini CTA). */
    applyFrom: '#0036da',
    applyTo: '#3b67ed',
    applyChevron: '#ffffff',
    applyChevronEdge: '#0064e0',
    /** The fee columns' divider is a 45px hairline that fades out at both ends. */
    hairline0: '#ffffff',
    hairlineMid: '#dcdcdc',
    /** LIFETIME FREE strip — cream→mint→cream, on its own cream stroke. */
    lftFrom: '#f0f3dc',
    lftVia: '#dcf3df',
    lftTo: '#f0f3dc',
    lftBorder: '#f0f3dc',
    lftLabel: '#3f8c03',
    lftSub: '#5c5c5c',
  },
  /**
   * Coupon ticket (Store Page V2.0, Figma `XgdQOrfPsC6HNv24uS9jgN` node 1835:16064
   * — variants Default / Variant3 "copying" / Variant4 "copied"). Pulled with
   * `get_design_context` + `get_variable_defs`, not sampled off a screenshot.
   */
  coupon: {
    // Left stub gradient — purple at rest, green once the code is copied.
    stubFrom: '#d457ef',
    stubVia: '#b548e7', // 49.5192%
    stubTo: '#a040e1',
    stubCopiedFrom: '#1d985c',
    stubCopiedTo: '#5cbc71',
    stubLabel: '#ffffff',
    // Body
    title: '#393540',
    seeDetails: 'rgba(11,11,11,0.51)',
    // Code field
    codeBg: 'rgba(0,54,218,0.05)',
    codeBorder: 'rgba(0,54,218,0.24)',
    codeText: '#0036da',
    codeTextDim: 'rgba(0,54,218,0.4)', // while copying
    copiedBorder: '#26a651',
    copiedText: '#26a651',
    // Expiry ribbon
    ribbonFrom: '#fc6197',
    ribbonTo: '#d90952',
    ribbonFold: '#580202',
    ribbonText: '#fff9f9',
    // Ticket hairline along the top and bottom edges
    outline: '#c1c1c1',
    /** Hairline along each cut-out's curve. The cuts are the page colour, so on a
     *  white page they are invisible without one — the spec frame only shows them
     *  because Figma's canvas is dark. Same hue as the ticket's shadow. */
    notchEdge: 'rgba(7,42,78,0.14)',
    /** drop-shadow(0px 6px 5px rgba(7,42,78,0.17)) — the whole ticket's lift. */
    shadow: '0px 6px 5px rgba(7,42,78,0.17)',
  },
  /**
   * Voice-input sheet (components/VoiceSheet.tsx). Deliberately built from the AI
   * aura ramp already in this file — voice search is the same "intelligence" surface
   * as Expand Search, so it speaks the same colour language rather than inventing a
   * second one. Only the sheet's own chrome is new.
   */
  voice: {
    sheet: palette.white,
    sheetEdge: palette.auraAiEdge,
    label: palette.auraSlate,
    labelMuted: palette.auraSlateMuted,
    transcript: palette.auraInk,
    /** The live meter's ramp, cool → hot as the band gets louder. */
    meterCalm: palette.auraAiAqua,
    meterMid: palette.auraAiCobalt,
    meterHot: palette.auraAiViolet,
    meterPeak: palette.auraAiMagenta,
    /** Bar at rest — a voice UI must read as "listening" even in silence. */
    meterIdle: '#d7dcf0',
    /** Halo behind the mic, scaled by level. Same-hue zero-alpha stop (see §Aura). */
    halo: 'rgba(124,58,237,0.22)',
    halo0: 'rgba(124,58,237,0)',
    /** The flat accent disc these three describe was replaced by the blob orb
     *  (motion/VoiceBlobs.tsx, D050) — the sheet is an intelligence surface, so it
     *  speaks the AI ramp. Kept for the brand-accent variant of the control. */
    micBg: palette.orange,
    micGlyph: palette.white,
    pulse: 'rgba(255,109,29,0.20)',
    pulseFaint: 'rgba(255,109,29,0.10)',
    /** The core sphere's own ramp, lit from the top-left like a physical object:
     *  cool where the light lands, hot where it falls away. The drifting blobs
     *  ride ON this, so the sphere still reads as one body when they cross. */
    orbFrom: palette.auraAiAqua,
    orbVia: palette.auraAiIndigo,
    orbTo: palette.auraAiViolet,
    /** Lit rim + inner shade — the glass edge that keeps the sphere from reading flat. */
    orbRim: palette.auraAiGlassRim,
    orbShade: palette.auraAiGlassDepth,
    /** Specular hot spot near the top-left, and its zero-alpha falloff. */
    orbSpec: palette.auraAiGlassCore,
    orbSpec0: palette.auraAiGlassCore0,
    /** Ambient shadow the orb casts on the sheet. */
    orbShadow: palette.auraAiShadow,
    /** Scrim over the page while the sheet is up. */
    scrim: 'rgba(14,17,22,0.32)',
    /** Suggestion chips in the no-match state. */
    chipBorder: palette.borderSubtle,
    chipText: palette.auraInk,
    /** "Tap to speak again" / cancel row. */
    action: palette.orange,
    danger: palette.ruby600,
  },
  /**
   * Cashback-timeline strip icons (Store Page V2.0, Figma `XgdQOrfPsC6HNv24uS9jgN`
   * node 1716:76773). Each of the three cells carries a 26px glyph filled with its
   * own vertical two-stop ramp (light top → saturated bottom), read off the exported
   * SVGs kept at `assets/timeline/`. The hues are the step's own semantics —
   * amber = waiting, sky = confirmed, mint = money out — and are NOT the aura ramp,
   * so they stay separate from `color.aura`.
   */
  timeline: {
    tracksFrom: '#ffc485',
    tracksTo: '#ff9d33',
    confirmsFrom: '#4cc6ff',
    confirmsTo: '#00a4f0',
    withdrawFrom: '#6de9c2',
    withdrawTo: '#00c788',
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
  xl20: 20, // AI Expand card (Figma 1646:7445)
  hero: 24, // hero panel + bottom-sheet top corners (Figma 1646:7197)
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
  // Credit-card card — exact Mini App Main spec (0 8 16 rgba(0,0,0,0.05), D061).
  // Wider and softer than `sm`: at 16px of blur the card lifts off the page
  // without the 2px-offset edge that reads as a border.
  card: { shadowColor: '#000000', shadowOpacity: 0.05, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
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
  /**
   * Long on-screen TRAVEL — a full-width carousel page, a card crossing the
   * viewport. Leaves immediately, spends most of its time arriving: the last
   * third of the distance takes half the duration, so a 390px move reads as
   * weight settling rather than as a slide that stops. `emphasized` eases IN
   * first, which over a whole page width looks like the content hesitated.
   */
  spatial: [0.32, 0.72, 0, 1],
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
// reads as one system. 36px (design call, D054 — was space.xxl/40). It is a
// component metric, not a spacing step, so it stands on its own like
// BANNER_HEIGHT / AI_CTA_HEIGHT rather than aliasing a `space` token. Pair with
// hitSlop to keep the ≥44px tap target (see TabBar). Does NOT apply to inline
// status badges/tags (% OFF, cashback pills, LIVE, carousel indicators) — those
// are labels, not pills.
export const PILL_HEIGHT = 36;

// Circular SKU thumb that leads a pill in place of a glyph (trending chips, D081),
// and the pill height that carries it. The disc is the section's whole point, so it
// takes the size and the pill follows: 40 with the same 6px ring of air puts the
// trending pill at 52. Well clear of MIN_TAP_TARGET on its own. Every OTHER pill
// stays PILL_HEIGHT (D054); these are component metrics, not spacing steps.
export const PILL_THUMB = 40;
export const TRENDING_PILL_HEIGHT = 52;

// Deal banner strip height (design spec).
export const BANNER_HEIGHT = 118;

/**
 * Credit-card card metrics — Figma "Mini App Main" `9RfW1gNewOnFDsNqaHsRoF`,
 * frame 4007:57107, component 731:33245 (D061).
 *
 * Transcribed, not derived: every number below is the spec's own, including the
 * ones that look arbitrary (the CTA's 10.68 corner, its 7.12 gap, the 6.14×9.94
 * chevron). Two things are deliberately NOT from the mock — the card is fluid
 * instead of 328 wide, and the content/strip insets are symmetric (16 / 8), where
 * the mock's absolute frames drift a few px off-centre.
 */
export const CARD_SPEC = {
  artW: 132,
  artH: 84,
  artRadius: 6,
  /** art → info column */
  gapArtInfo: 11,
  /** title → cashback pill */
  infoGap: 5,
  /** the title's own inset inside the info column */
  titleInsetX: 8,
  pillH: 33,
  pillPadX: 13,
  /** [art + info] block → [tags + benefits] block */
  topGap: 19,
  /** tags → benefits */
  groupGap: 7,
  tagGap: 4,
  benefitGap: 6,
  /** glyph frame; the vector inside it is ~13.5px (see icons/cardIcons.tsx) */
  benefitIcon: 18,
  /** [tags + benefits] → the strip that closes the card */
  stripGap: 10,
  stripRadius: 8,
  stripPadY: 2,
  feeStripH: 60,
  feeColPad: 8,
  feeGap: 4,
  dividerH: 45,
  applyW: 108,
  applyH: 40,
  applyRadius: 10.68,
  applyGap: 7.12,
  chevW: 6.14,
  chevH: 9.94,
  /** page-edge insets: content 16, closing strip 8 */
  padX: 16,
  stripPadX: 8,
  padTop: 16,
  padBottom: 8,
} as const;

// ── AI Expand card metrics (Figma 1646:7445) ─────────────────────────────────
/** Gradient sparkle mark — same 44 as the minimum tap target, by coincidence. */
// The AI mark reads as the band's object, not a bullet — at 44 it sat smaller
// than the two-line pitch beside it and disappeared into the aura.
export const AI_MARK_SIZE = 64;
/** CTA height — matches the DS primary button so the app reads as one system. */
export const AI_CTA_HEIGHT = 52;
/** Diameter of each drifting glow orb in the card's aura field. */
export const AI_ORB_SIZE = 320;
/**
 * The cyclic hue ramp painted into every AI gradient. Ordered so the last hue
 * reads back into the first: a strip carrying this ramp twice over 2× its
 * container width can translate by exactly one container width, forever, with
 * no visible seam (see motion/Aura.tsx → FlowStrip).
 */
export const AI_FLOW_HUES = [
  color.aura.aiFrom,
  color.aura.aiVia,
  color.aura.aiTo,
  color.aura.aiWash1,
  color.aura.aiMagenta,
  color.aura.aiAqua,
] as const;

/**
 * Hues for the drifting orbs — one per orb, ordered so neighbours in space are
 * neighbours in hue. Alphas are NOT baked in: the orb builds its own multi-stop
 * falloff (motion/Aura.tsx), which is what makes the edge disappear.
 */
export const AI_ORB_HUES = [
  color.aura.aiTo,
  color.aura.aiWash1,
  color.aura.aiMagenta,
  color.aura.aiAqua,
  color.aura.aiFrom,
] as const;

// ── Voice orb (motion/VoiceBlobs.tsx) ────────────────────────────────────────
/**
 * The blob orb that replaces the voice sheet's flat accent disc: a saturated
 * core sphere with drifting gradient blobs inside it, standing in a wider field
 * of soft aura blobs that bloom outward with loudness (the Siri / Gemini read).
 *
 * Three sizes, one field. The core is the tappable control, so it clears
 * MIN_TAP_TARGET on its own; the field is the box the aura is allowed to travel
 * in, sized so the outermost blob's ramp reaches zero inside it and can never be
 * clipped by the sheet edge.
 */
export const VOICE_ORB_CORE = 112;
export const VOICE_ORB_FIELD = 236;
/** Aura blob diameter — deliberately ~2× the core, so its falloff is gentle. */
export const VOICE_AURA_BLOB = 204;
/** Blob diameter inside the core. Under 1× the core so each one reads separately. */
export const VOICE_CORE_BLOB = 96;

/**
 * Hues inside the core sphere, ordered so neighbours in space are neighbours in
 * hue — the same cyclic ramp as every other AI surface, so voice search reads as
 * the same intelligence, not a second colour language.
 */
export const VOICE_CORE_HUES = [
  color.aura.aiAqua,
  color.aura.aiFrom,
  color.aura.aiWash1,
  color.aura.aiMagenta,
] as const;

/** Hues of the aura blobs around the core — the cool/hot ends of the same ramp. */
export const VOICE_AURA_HUES = [color.aura.aiAqua, color.aura.aiTo, color.aura.aiMagenta] as const;

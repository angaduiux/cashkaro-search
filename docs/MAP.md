# Code map

> **Generated file — do not hand-edit.** Regenerate with `node scripts/gen-map.mjs`
> (a PostToolUse hook also runs it after every Write/Edit). Every row is derived
> from the module's doc comment + import graph, so it never drifts from the code.

Read this first to find where something lives — module → purpose → Figma node →
assets → who uses it. It replaces grepping the tree. If a row reads `—` under
Purpose, that module has no doc comment: add one, then regenerate.

## Screens

Full-page surfaces. Mounted by `src/Root.tsx`, which owns the single search controller and the overlay stack.

| Module | LOC | Exports | Figma node(s) | Assets | Used by | Purpose |
| --- | --- | --- | --- | --- | --- | --- |
| `screens/CatalogViewAll.tsx` | 151 | CatalogViewAll | 1691:6220 | — | Root.tsx | Catalog "View all" page (Figma 1691:6220) — the full set of stores in a catalog category, laid out as a full-page 3-up grid of the SAME store-logo tiles used… |
| `screens/ExploreHome.tsx` | 418 | ExploreHome | 611:3360, 1696:5271 | assets/anim | screens/SearchBody.tsx | Vertical slop that lifts the 40px pill's tap target back to ≥44px (§6.2). |
| `screens/Gallery.tsx` | 117 | Gallery | — | — | Root.tsx | "All layouts on one page" — every result-page shape (Cases A–G) laid out together as device-framed previews, so the whole system reads at a glance. |
| `screens/HomeScreen.tsx` | 644 | APP_TAB_BAR_H, AppTabBar, HomeScreen | — | assets/ck-app<br>assets/banners<br>assets/categories | Root.tsx | HomeScreen — a clone of the PRODUCTION CashKaro app home, two scrolls deep. |
| `screens/ProductCategory.tsx` | 827 | ProductCategory | — | — | Root.tsx | Product category page — the browse destination behind every "category" surface in the app (SERP category rows, the suggestions Categories group, the screen n… |
| `screens/Recovery.tsx` | 81 | RecoveryScreen | — | — | screens/SearchBody.tsx | Recovery / zero-or-degraded results (§4F, archetype 11). |
| `screens/SearchBody.tsx` | 101 | SearchBody | — | — | Root.tsx | Search screen body — everything BELOW the shared search bar (which is hoisted to the app root and glides in). |
| `screens/ViewAll.tsx` | 306 | ViewAll | — | — | Root.tsx | Generic "View all" page — the full set of items for one result vertical (Stores · Products · Credit Cards · Loans · Savings · Coupons · Deals), laid out full… |

## Components

Shared UI. `ResultCards.tsx` holds every result-card archetype; `SerpShell.tsx` lays out a `SerpModel`.

| Module | LOC | Exports | Figma node(s) | Assets | Used by | Purpose |
| --- | --- | --- | --- | --- | --- | --- |
| `components/atoms.tsx` | 165 | Divider, FadingRule, HeadingLine, SectionHeader, Disclaimer, PlaceholderPill +1 | — | — | components/CardFilterBar.tsx<br>components/FinanceCard.tsx<br>components/LoanCard.tsx<br>components/SerpShell.tsx | Shared page atoms — the small pieces every screen composes with, kept here so one change lands everywhere: `Divider` (hairline), `FadingRule` (a heading's ru… |
| `components/Badge.tsx` | 69 | Badge, TopPickTag | — | — | components/FinanceCard.tsx<br>components/ResultCards.tsx | Badge + TopPickTag — the two inline status pills the result cards use. |
| `components/Button.tsx` | 67 | Button | — | — | components/FinanceCard.tsx<br>components/ResultCards.tsx<br>screens/Recovery.tsx | Primary/secondary button. |
| `components/CardFilterBar.tsx` | 894 | useCardFilters, CardFilterBar, CardFilterSheets, CardFilterController | — | — | components/SerpShell.tsx<br>screens/ViewAll.tsx | Credit-card filter bar — the whole filter UX for a page of cards: the `Category ⌄` / `Filters` chips and the `Eligibility` switch, the anchored category drop… |
| `components/CardTile.tsx` | 274 | CardTile | 1696:5271 | — | components/ResultCards.tsx<br>screens/ExploreHome.tsx | Credit-card tile — a card's form wherever it appears as a TILE rather than as the full comparison card: the similar-cards rail, a View-all card rail, and Exp… |
| `components/CashbackElement.tsx` | 66 | CashbackElement, CashbackPill | — | — | components/FinanceCard.tsx<br>components/ResultCards.tsx | Renders CashKaro's cashback figure (§3.4). |
| `components/CouponTicket.tsx` | 379 | CouponTicket, CouponState | 1835:16064 | assets/coupon | components/ResultCards.tsx | CouponTicket — the Store Page V2.0 coupon ticket, all three states. |
| `components/CreditCard.tsx` | 550 | CreditCard, CashbackPill, Tag, ApplyCta | 4007:57107, 731:33245 | — | components/LoanCard.tsx<br>components/SerpShell.tsx<br>screens/ViewAll.tsx | Credit-card card — built to the "Mini App Main" spec (Figma `9RfW1gNewOnFDsNqaHsRoF`, frame 4007:57107, component 731:33245), transcribed rather than approxi… |
| `components/ExpandSearch.tsx` | 491 | ExpandSearchCard | 1646:7445 | — | components/SerpShell.tsx | End-of-catalogue AI Expand band — W4 style (Figma 1646:7445), rebuilt on the Aura engine (`motion/Aura.tsx`): a full-bleed lavender band lit from behind by f… |
| `components/FinanceCard.tsx` | 222 | FinanceCard | — | — | components/SerpShell.tsx<br>screens/ViewAll.tsx | The one finance-card component (§6.3). |
| `components/HeroBleed.tsx` | 131 | HeroBleed, heroBleedTint | 1646:7197 | — | Root.tsx<br>components/ResultCards.tsx | HeroBleed — the full-bleed living backdrop behind a resolved best-match SERP: a store (the store hero's wash from Figma 1646:7197, unboxed — D069) or a credi… |
| `components/ImageSlot.tsx` | 127 | BrandThumb, ImageSlot | 1646:7258 | — | components/FinanceCard.tsx<br>components/ResultCards.tsx<br>components/Suggestions.tsx | Brand thumbnail — the one store-card logo treatment used EVERYWHERE (W4 spec Figma 1646:7258): white tile, radius 8, logo object-contain, soft shadow (0 4.8… |
| `components/LoanCard.tsx` | 310 | LoanCard | — | — | components/SerpShell.tsx<br>screens/ViewAll.tsx | Loan card — a personal-loan result drawn in the credit-card card's visual system (D089). |
| `components/RateRow.tsx` | 36 | RateRow | — | — | components/FinanceCard.tsx | Rate display with the reward-vs-cost colour rule (§6.5) baked in so the direction is unmistakable: reward ("bigger is better": savings interest) → reward/gre… |
| `components/ResultCards.tsx` | 1401 | StoreRow, ProductCard, StoreTile, DealsCarousel, DealCard, SimilarCardsRail +4 | — | — | components/ExpandSearch.tsx<br>components/SerpShell.tsx<br>screens/CatalogViewAll.tsx<br>screens/ExploreHome.tsx | The card set every result page is built from — one component per archetype's row or tile, all reading the same `ResultItem` shape: `StoreRow`, `ProductCard`,… |
| `components/ScreenNav.tsx` | 76 | ScreenNav, NavItem, NavSection | — | — | Root.tsx | Preview-chrome side panel (web wide layout only) listing every screen type the app can render, so any state is one tap away. |
| `components/SearchBar.tsx` | 290 | SearchBar | 1646:7739, 1646:7468 | — | Root.tsx | Width the clear slot opens to: the 26px button plus its 13px divider gutter. |
| `components/SerpShell.tsx` | 480 | SerpShell, isStoreHeroItem, isBleedHeroItem | — | — | Root.tsx<br>screens/Gallery.tsx<br>screens/SearchBody.tsx | SERP shell (§3.3) — the one shape every screen composes: context line → [hero, optional] → content sections → [Expand Search, if any] Hero present only for s… |
| `components/Sheet.tsx` | 264 | Sheet, SheetOption, FacetChip, SheetGroup | — | — | components/CardFilterBar.tsx<br>screens/ProductCategory.tsx | Bottom sheet — the app's one modal surface (sort, filters). |
| `components/Suggestions.tsx` | 338 | Suggestions, SuggestGroupKind, SuggestRow, SuggestGroup | 1646:7631, 1646:7462 | — | data/realData.ts<br>screens/SearchBody.tsx | Row kinds. |
| `components/TabBar.tsx` | 152 | TabBar | — | — | components/SerpShell.tsx | Vertical slop that lifts the 36px pill's tap target back to ≥44px. |
| `components/UserTypeToggle.tsx` | 120 | UserTypeToggle, UserTypeSwitch, UserType | — | — | Root.tsx<br>screens/ExploreHome.tsx | New-user / existing-user segmented toggle. |
| `components/VoiceSheet.tsx` | 445 | VoiceSheet, VoicePhase | — | — | Root.tsx | VoiceSheet — voice-to-text input as a bottom sheet over a dimmed page. |

## Data

The contract, the catalog/search engine, the real cases, and the Storepage tile set. No component invents data.

| Module | LOC | Exports | Figma node(s) | Assets | Used by | Purpose |
| --- | --- | --- | --- | --- | --- | --- |
| `data/cardFilters.ts` | 363 | NO_CARD_FILTERS, activeCardFilterCount, sheetFilterCount, toggleKey, CARD_FILTER_GROUPS, groupHasSelection +26 | — | — | components/CardFilterBar.tsx | Credit-card filters — the facet lists, live counts and eligibility model behind [CardFilterBar](../components/CardFilterBar.tsx), which the credit-cards resu… |
| `data/catalog.ts` | 432 | STORES, searchStores, buildStoreSerp, PRODUCTS, productItem, searchProducts +11 | — | — | Root.tsx<br>data/productCategories.ts<br>data/realData.ts<br>data/trendingPills.ts | Store catalog + real search engine. |
| `data/categoryIcons.ts` | 67 | CATEGORY_ICONS, categoryIconKey, categoryIcon, CategoryIconKey | 1674:13000 | assets/categories | components/ResultCards.tsx<br>data/productCategories.ts<br>data/realData.ts<br>data/trendingPills.ts | Category icons — retina PNGs (3×, 159–168px) exported from Figma 1674:13000, each an illustrated glyph on the brand lavender circle. |
| `data/dataContract.ts` | 174 | Archetype, ResultSource, Cashback, Rate, FeeState, Fees +9 | — | — | components/Badge.tsx<br>components/CardFilterBar.tsx<br>components/CardTile.tsx<br>components/CashbackElement.tsx | Data Contract (§7). |
| `data/matchScore.ts` | 138 | MATCH, score, MatchField | — | — | data/realData.ts | Query → candidate relevance scoring — the ONE match function the type-ahead ranks with (D115). |
| `data/productCategories.ts` | 337 | productCategories, SUB_LABELS, categoryByKey, categoryStoreTileKeys, categoryDealIds, cashbackPct +21 | — | — | Root.tsx<br>data/realData.ts<br>screens/ProductCategory.tsx | Product category pages — taxonomy + browse engine. |
| `data/realData.ts` | 1701 | BRAND, PRODUCT_IMG, LENDER, ALL_DEALS, cardSbiCashback, cardAxisFlipkart +27 | — | assets/brands<br>assets/products<br>assets/lenders<br>assets/cards<br>assets/cards/figma<br>assets/banners<br>assets/campaigns | Root.tsx<br>data/catalog.ts<br>data/trendingPills.ts<br>data/webResults.ts | Real CashKaro data — NOTHING here is invented. |
| `data/storeTiles.ts` | 159 | STORE_TILES, storeTileItem, storeTileByKey, storeTileSlots, storeTilesByKeys, allStoreTileItems +1 | 611:3360 | assets/brands/figma | data/catalog.ts<br>data/realData.ts<br>data/trendingPills.ts<br>data/webResults.ts | Storepage brand tiles — the ONLY brands that may appear on a store card. |
| `data/trendingPills.ts` | 157 | trendingPills, TrendingPill | — | — | screens/ExploreHome.tsx | Trending pill content — the Explore "Trending" queries plus the image reel each pill's circular thumb rolls through (D081). |
| `data/webResults.ts` | 119 | webFeed | — | — | components/ExpandSearch.tsx | Web-results feed for the Expand Search band — an endless, deterministic pager over the REAL product catalog (`./catalog.ts` PRODUCTS; photos, titles, prices… |

## Theme

The only source of colour, type, spacing, radius, elevation and motion.

| Module | LOC | Exports | Figma node(s) | Assets | Used by | Purpose |
| --- | --- | --- | --- | --- | --- | --- |
| `theme/ckApp.ts` | 343 | colors, metropolis, text, metrics, base | — | — | icons/ckAppIcons.tsx<br>screens/HomeScreen.tsx | ckApp — the CashKaro production app's own design system, copied verbatim out of the shipped iOS binary (`/Applications/CashKaro.app`, Hermes bytecode v96, `m… |
| `theme/tokens.ts` | 923 | color, fontFamily, letterSpacing, type, space, radius +28 | — | — | Root.tsx<br>components/Badge.tsx<br>components/Button.tsx<br>components/CardFilterBar.tsx | CashKaro design tokens — the ONLY source of color, type, spacing, radius, elevation and motion in this app. |

## Motion

Shared animation primitives + tuning.

| Module | LOC | Exports | Figma node(s) | Assets | Used by | Purpose |
| --- | --- | --- | --- | --- | --- | --- |
| `motion/Aura.tsx` | 689 | AURA_LOOP, useAuraClock, radialFill, softOrbFill, tintRgba, isColourlessTint +12 | — | — | components/CardTile.tsx<br>components/ExpandSearch.tsx<br>components/HeroBleed.tsx<br>components/ResultCards.tsx | "Aura" — the flowing-gradient engine behind the AI surfaces (Expand Search). |
| `motion/CountUp.tsx` | 144 | CountUp, CountUpText | — | — | components/ResultCards.tsx<br>screens/ProductCategory.tsx | Indian digit grouping (1,50,000) — hand-rolled so the formatter has zero platform dependencies (Intl is missing on some RN runtimes). |
| `motion/LoopRail.tsx` | 195 | useRailPause, LoopRail | — | — | screens/ExploreHome.tsx | LoopRail — a horizontal rail that drifts very slowly and forever, and that the user can still drag in either direction without ever reaching an end (D086). |
| `motion/motion.ts` | 28 | EASE, timingBase, timingFast, timingHero, timingTravel, staggerDelay | — | — | Root.tsx<br>components/ExpandSearch.tsx<br>components/ResultCards.tsx<br>components/SearchBar.tsx | Motion helpers (§9). |
| `motion/RollingThumb.tsx` | 194 | RollingThumb | — | — | components/Suggestions.tsx<br>screens/ExploreHome.tsx | RollingThumb — a circular SKU thumb whose image rolls upward to the next one on a slow, per-instance random cadence (D081). |
| `motion/Shine.tsx` | 116 | Shine | — | — | components/CreditCard.tsx<br>components/ResultCards.tsx | Shine sweep across card artwork / CTAs (§9.5 signature moment). |
| `motion/Skeleton.tsx` | 84 | SkeletonBlock, SkeletonCard | — | — | components/ExpandSearch.tsx<br>components/SerpShell.tsx | Shimmer skeleton (§9.4 "results reveal / loading"). |
| `motion/useInView.ts` | 45 | useInView | — | — | motion/CountUp.tsx | Returns a ref + an incrementing `tick` that bumps every time the ref'd element (re)enters the viewport — so an animation can replay on scroll-in, not just on… |
| `motion/useVoiceLevel.ts` | 193 | BAND_COUNT, useVoiceLevel, VoiceLevel | — | — | components/VoiceSheet.tsx | useVoiceLevel — the voice sheet's amplitude source, as Reanimated shared values. |
| `motion/VoiceBlobs.tsx` | 333 | VoiceBlobs | — | — | components/VoiceSheet.tsx | VoiceBlobs — the voice sheet's gradient-blob orb, in the Siri / Gemini idiom. |

## Icons

Icon component + name map.

| Module | LOC | Exports | Figma node(s) | Assets | Used by | Purpose |
| --- | --- | --- | --- | --- | --- | --- |
| `icons/AiMark.tsx` | 180 | AiMark | — | — | components/ExpandSearch.tsx | AiMark — the glass sparkle that heads the AI Expand band. |
| `icons/cardIcons.tsx` | 198 | CardBenefitIcon, benefitIconFor, ApplyChevron, FeeDivider, CardIconName | 714:32723, 673:27223, 673:27216, 4007:57107 | — | components/CreditCard.tsx<br>components/LoanCard.tsx | cardIcons — the credit-card card's exported Figma vectors, as react-native-svg. |
| `icons/ckAppIcons.tsx` | 89 | CkMenuIcon, CkLogo, CkBellIcon, CkSearchIcon, CkArrowAltRight | — | — | screens/HomeScreen.tsx | ckAppIcons — the CashKaro app's own icons, copied out of the shipped bundle. |
| `icons/couponAssets.tsx` | 258 | BITE_W, StubBite, StubNotch, EdgeNotch, Perforation, RIBBON_W +6 | 1835:16064 | — | components/CouponTicket.tsx | couponAssets — the Coupon ticket's exported Figma artwork, as react-native-svg. |
| `icons/Icon.tsx` | 40 | Icon | — | — | components/Badge.tsx<br>components/Button.tsx<br>components/CardFilterBar.tsx<br>components/CreditCard.tsx | Override the mapped FA style (e.g. |
| `icons/iconMap.ts` | 91 | FA_FONT_FAMILY, ICON, UNRESOLVED_ICON_CONCEPTS, FaStyle, IconName | — | — | components/Button.tsx<br>components/ImageSlot.tsx<br>components/Suggestions.tsx<br>icons/Icon.tsx | Icon Map — single source of truth for UI-concept → Font Awesome 6 Pro glyph. |
| `icons/MicGlyph.tsx` | 223 | MicGlyph | — | — | components/SearchBar.tsx | MicGlyph — the search field's voice affordance, drawn as `react-native-svg` so it can carry a LIVE GRADIENT: purple → blue → light blue travelling along the… |
| `icons/timelineIcons.tsx` | 132 | TIMELINE_ICON_SIZE, TracksInIcon, ConfirmsInIcon, WithdrawIcon, TIMELINE_ICON, TimelineIconKey | 1716:76773, 1716:76777, 1716:76786, 1716:76795 | — | components/ResultCards.tsx | timelineIcons — the three gradient glyphs on the hero's Cashback Timelines strip, as react-native-svg. |

## OS chrome

Web device-frame chrome (status bar, nav chrome, mock keyboard, device presets).

| Module | LOC | Exports | Figma node(s) | Assets | Used by | Purpose |
| --- | --- | --- | --- | --- | --- | --- |
| `os/devices.ts` | 27 | DEVICES, DEFAULT_DEVICE, DeviceOS, Device | — | — | Root.tsx<br>os/Keyboard.tsx<br>os/NavChrome.tsx<br>os/StatusBar.tsx | Device presets for the prototype harness — min → max. |
| `os/Keyboard.tsx` | 125 | Keyboard | — | — | Root.tsx | On-screen keyboard (prototype chrome, web only). |
| `os/NavChrome.tsx` | 47 | NAV_CHROME_H, NavChrome | — | — | Root.tsx | Height of the bottom affordance, per OS. |
| `os/StatusBar.tsx` | 60 | StatusBar, STATUS_BAR_H | — | — | Root.tsx | OS status bar (prototype chrome). |

## Root

App entry.

| Module | LOC | Exports | Figma node(s) | Assets | Used by | Purpose |
| --- | --- | --- | --- | --- | --- | --- |
| `Root.tsx` | 647 | Root | — | — | — | Root — the app's single controller. |

## Hand-written SERP cases

Transcribed design cases in `src/data/realData.ts`. A query hits one of these when
`REAL_CASES` has its key, then when `financeSerp()` reads finance-vertical intent
from it (D052); anything else is generated from the catalog by `buildSerp()`.

| Export | Query | Archetype | Routed via REAL_CASES |
| --- | --- | --- | --- |
| `caseAmountLoan` | `₹5,00,000 personal loan` | 07_loan | no |
| `caseBody` | `body` | 01_store | yes |
| `caseCards` | `cards` | 05_credit_card | no |
| `caseCredit` | `credit` | 05_credit_card | yes |
| `caseFlip` | `flip` | 01_store | yes |
| `caseLoans` | `loans` | 07_loan | no |
| `caseMobile` | `mobile` | 02_product | yes |
| `casePhar` | `phar` | 01_store | yes |
| `caseB` | `sbi cashback card` | 05_credit_card | yes |
| `caseTira` | `tira` | 01_store | yes |
| `caseWhey` | `whey` | 02_product | yes |
| `caseSavings` | `zero balance savings account` | 12_bank_savings | yes |

---

Modules: 66 · Lines: 19043 · SERP cases: 12

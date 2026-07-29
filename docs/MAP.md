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
| `screens/ExploreHome.tsx` | 314 | ExploreHome | — | assets/anim | screens/SearchBody.tsx | — |
| `screens/Gallery.tsx` | 116 | Gallery | — | — | Root.tsx | — |
| `screens/HomeScreen.tsx` | 640 | AppTabBar, HomeScreen | — | assets/ck-app<br>assets/banners<br>assets/categories | Root.tsx | HomeScreen — a clone of the PRODUCTION CashKaro app home, two scrolls deep. |
| `screens/ProductCategory.tsx` | 823 | ProductCategory | — | — | Root.tsx | Product category page — the browse destination behind every "category" surface in the app (SERP category rows, the suggestions Categories group, the screen n… |
| `screens/Recovery.tsx` | 63 | RecoveryScreen | — | — | screens/SearchBody.tsx | — |
| `screens/SearchBody.tsx` | 86 | SearchBody | — | — | Root.tsx | Search screen body — everything BELOW the shared search bar (which is hoisted to the app root and glides in). |
| `screens/ViewAll.tsx` | 278 | ViewAll | — | — | Root.tsx | — |

## Components

Shared UI. `ResultCards.tsx` holds every result-card archetype; `SerpShell.tsx` lays out a `SerpModel`.

| Module | LOC | Exports | Figma node(s) | Assets | Used by | Purpose |
| --- | --- | --- | --- | --- | --- | --- |
| `components/atoms.tsx` | 100 | Divider, SectionHeader, Disclaimer, PlaceholderPill, isPlaceholderValue | — | — | components/FinanceCard.tsx<br>components/SerpShell.tsx<br>screens/ProductCategory.tsx<br>screens/Recovery.tsx | — |
| `components/Badge.tsx` | 62 | Badge, TopPickTag | — | — | components/FinanceCard.tsx<br>components/ResultCards.tsx | — |
| `components/Button.tsx` | 67 | Button | — | — | components/FinanceCard.tsx<br>components/ResultCards.tsx<br>screens/Recovery.tsx | Primary/secondary button. |
| `components/CashbackElement.tsx` | 66 | CashbackElement, CashbackPill | — | — | components/FinanceCard.tsx<br>components/ResultCards.tsx | Renders CashKaro's cashback figure (§3.4). |
| `components/CouponTicket.tsx` | 379 | CouponTicket, CouponState | 1835:16064 | assets/coupon | components/ResultCards.tsx | CouponTicket — the Store Page V2.0 coupon ticket, all three states. |
| `components/CreditCard.tsx` | 178 | CreditCard | 1785:28364 | — | components/SerpShell.tsx<br>screens/ViewAll.tsx | Credit-card card — faithful build of the design-system component (Figma 1785:28364). |
| `components/ExpandSearch.tsx` | 401 | ExpandSearchCard | 1646:7445 | — | components/SerpShell.tsx | End-of-catalogue AI Expand band — W4 style (Figma 1646:7445), rebuilt on the Aura engine (`motion/Aura.tsx`): a full-bleed lavender band lit from behind by f… |
| `components/FinanceCard.tsx` | 222 | FinanceCard | — | — | components/SerpShell.tsx<br>screens/ViewAll.tsx | The one finance-card component (§6.3). |
| `components/ImageSlot.tsx` | 122 | BrandThumb, ImageSlot | 1646:7258 | — | components/FinanceCard.tsx<br>components/ResultCards.tsx<br>components/Suggestions.tsx<br>screens/ExploreHome.tsx | Brand thumbnail — the one store-card logo treatment used EVERYWHERE (W4 spec Figma 1646:7258): white tile, radius 8, logo object-contain, soft shadow (0 4.8… |
| `components/RateRow.tsx` | 36 | RateRow | — | — | components/FinanceCard.tsx | Rate display with the reward-vs-cost colour rule (§6.5) baked in so the direction is unmistakable: reward ("bigger is better": savings interest) → reward/gre… |
| `components/ResultCards.tsx` | 1017 | StoreRow, ProductCard, StoreTile, DealsCarousel, DealCard, SimilarCardsRail +4 | — | — | components/ExpandSearch.tsx<br>components/SerpShell.tsx<br>screens/CatalogViewAll.tsx<br>screens/ExploreHome.tsx | — |
| `components/ScreenNav.tsx` | 75 | ScreenNav, NavItem, NavSection | — | — | Root.tsx | — |
| `components/SearchBar.tsx` | 239 | SearchBar | 1646:7739, 1646:7468 | — | Root.tsx | Catalog words the empty-field placeholder cycles through, one by one — the whole thing CashKaro is searchable across (stores, products, and the finance catal… |
| `components/SerpShell.tsx` | 273 | SerpShell | — | — | screens/Gallery.tsx<br>screens/SearchBody.tsx | SERP shell (§3.3) — the one shape every screen composes: context line → [hero, optional] → content sections → [Expand Search, if any] Hero present only for s… |
| `components/Sheet.tsx` | 206 | Sheet, SheetOption, FacetChip, SheetGroup | — | — | screens/ProductCategory.tsx | Bottom sheet — the app's one modal surface (sort, filters). |
| `components/Suggestions.tsx` | 245 | Suggestions, SuggestGroupKind, SuggestRow, SuggestGroup | — | — | data/realData.ts<br>screens/SearchBody.tsx | — |
| `components/TabBar.tsx` | 145 | TabBar | — | — | components/SerpShell.tsx | Vertical slop that lifts the 40px pill's tap target back to ≥44px. |
| `components/UserTypeToggle.tsx` | 68 | UserTypeToggle, UserType | — | — | screens/ExploreHome.tsx | New-user / existing-user segmented toggle. |
| `components/VoiceSheet.tsx` | 498 | VoiceSheet, VoicePhase | — | — | Root.tsx | VoiceSheet — voice-to-text input as a bottom sheet over a dimmed page. |

## Data

The contract, the catalog/search engine, the real cases, and the Storepage tile set. No component invents data.

| Module | LOC | Exports | Figma node(s) | Assets | Used by | Purpose |
| --- | --- | --- | --- | --- | --- | --- |
| `data/catalog.ts` | 428 | STORES, searchStores, buildStoreSerp, PRODUCTS, productItem, searchProducts +11 | — | — | Root.tsx<br>data/productCategories.ts<br>data/realData.ts<br>screens/CatalogViewAll.tsx | Store catalog + real search engine. |
| `data/categoryIcons.ts` | 67 | CATEGORY_ICONS, categoryIconKey, categoryIcon, CategoryIconKey | 1674:13000 | assets/categories | components/ResultCards.tsx<br>data/productCategories.ts<br>data/realData.ts<br>screens/ProductCategory.tsx | Category icons — retina PNGs (3×, 159–168px) exported from Figma 1674:13000, each an illustrated glyph on the brand lavender circle. |
| `data/dataContract.ts` | 163 | Archetype, ResultSource, Cashback, Rate, FeeState, Fees +9 | — | — | components/Badge.tsx<br>components/CashbackElement.tsx<br>components/CreditCard.tsx<br>components/ExpandSearch.tsx | Data Contract (§7). |
| `data/productCategories.ts` | 337 | productCategories, SUB_LABELS, categoryByKey, categoryStoreTileKeys, categoryDealIds, cashbackPct +21 | — | — | Root.tsx<br>data/realData.ts<br>screens/ProductCategory.tsx | Product category pages — taxonomy + browse engine. |
| `data/realData.ts` | 1101 | BRAND, PRODUCT_IMG, LENDER, ALL_DEALS, cardSbiCashback, cardAxisFlipkart +16 | — | assets/brands<br>assets/products<br>assets/lenders<br>assets/cards<br>assets/banners<br>assets/campaigns | Root.tsx<br>data/catalog.ts<br>screens/ExploreHome.tsx<br>screens/Gallery.tsx | Real CashKaro data — NOTHING here is invented. |
| `data/storeTiles.ts` | 159 | STORE_TILES, storeTileItem, storeTileByKey, storeTileSlots, storeTilesByKeys, allStoreTileItems +1 | 611:3360 | assets/brands/figma | data/catalog.ts<br>data/realData.ts<br>screens/ExploreHome.tsx<br>screens/HomeScreen.tsx | Storepage brand tiles — the ONLY brands that may appear on a store card. |

## Theme

The only source of colour, type, spacing, radius, elevation and motion.

| Module | LOC | Exports | Figma node(s) | Assets | Used by | Purpose |
| --- | --- | --- | --- | --- | --- | --- |
| `theme/ckApp.ts` | 343 | colors, metropolis, text, metrics, base | — | — | icons/ckAppIcons.tsx<br>screens/HomeScreen.tsx | ckApp — the CashKaro production app's own design system, copied verbatim out of the shipped iOS binary (`/Applications/CashKaro.app`, Hermes bytecode v96, `m… |
| `theme/tokens.ts` | 522 | color, fontFamily, letterSpacing, type, space, radius +13 | — | — | Root.tsx<br>components/Badge.tsx<br>components/Button.tsx<br>components/CashbackElement.tsx | CashKaro design tokens — the ONLY source of color, type, spacing, radius, elevation and motion in this app. |

## Motion

Shared animation primitives + tuning.

| Module | LOC | Exports | Figma node(s) | Assets | Used by | Purpose |
| --- | --- | --- | --- | --- | --- | --- |
| `motion/Aura.tsx` | 485 | AURA_LOOP, useAuraClock, radialFill, tintRgba, isColourlessTint, auraWashTint +7 | — | — | components/ExpandSearch.tsx<br>components/ResultCards.tsx | "Aura" — the flowing-gradient engine behind the AI surfaces (Expand Search). |
| `motion/CountUp.tsx` | 151 | CountUp, CountUpText | — | — | components/ResultCards.tsx<br>screens/ExploreHome.tsx<br>screens/ProductCategory.tsx | Indian digit grouping (1,50,000) — hand-rolled because this runs inside a worklet, where `toLocaleString('en-IN')` is unavailable (no Intl on the UI runtime). |
| `motion/motion.ts` | 25 | EASE, timingBase, timingFast, timingHero, staggerDelay | — | — | Root.tsx<br>components/ExpandSearch.tsx<br>components/ResultCards.tsx<br>components/SearchBar.tsx | Motion helpers (§9). |
| `motion/Shine.tsx` | 58 | Shine | — | — | — | One-shot shine sweep across card artwork (§9.5 signature moment). |
| `motion/Skeleton.tsx` | 83 | SkeletonBlock, SkeletonCard | — | — | components/SerpShell.tsx | — |
| `motion/useInView.ts` | 45 | useInView | — | — | motion/CountUp.tsx | Returns a ref + an incrementing `tick` that bumps every time the ref'd element (re)enters the viewport — so an animation can replay on scroll-in, not just on… |
| `motion/useVoiceLevel.ts` | 193 | BAND_COUNT, useVoiceLevel, VoiceLevel | — | — | components/VoiceSheet.tsx | useVoiceLevel — the voice sheet's amplitude source, as Reanimated shared values. |

## Icons

Icon component + name map.

| Module | LOC | Exports | Figma node(s) | Assets | Used by | Purpose |
| --- | --- | --- | --- | --- | --- | --- |
| `icons/AiMark.tsx` | 180 | AiMark | — | — | components/ExpandSearch.tsx | AiMark — the glass sparkle that heads the AI Expand band. |
| `icons/ckAppIcons.tsx` | 89 | CkMenuIcon, CkLogo, CkBellIcon, CkSearchIcon, CkArrowAltRight | — | — | screens/HomeScreen.tsx | ckAppIcons — the CashKaro app's own icons, copied out of the shipped bundle. |
| `icons/couponAssets.tsx` | 258 | BITE_W, StubBite, StubNotch, EdgeNotch, Perforation, RIBBON_W +6 | 1835:16064 | — | components/CouponTicket.tsx | couponAssets — the Coupon ticket's exported Figma artwork, as react-native-svg. |
| `icons/Icon.tsx` | 40 | Icon | — | — | components/Badge.tsx<br>components/Button.tsx<br>components/CreditCard.tsx<br>components/ExpandSearch.tsx | Override the mapped FA style (e.g. |
| `icons/iconMap.ts` | 86 | FA_FONT_FAMILY, ICON, UNRESOLVED_ICON_CONCEPTS, FaStyle, IconName | — | — | components/Button.tsx<br>components/ImageSlot.tsx<br>components/Suggestions.tsx<br>icons/Icon.tsx | Icon Map — single source of truth for UI-concept → Font Awesome 6 Pro glyph. |
| `icons/timelineIcons.tsx` | 132 | TIMELINE_ICON_SIZE, TracksInIcon, ConfirmsInIcon, WithdrawIcon, TIMELINE_ICON, TimelineIconKey | 1716:76773, 1716:76777, 1716:76786, 1716:76795 | — | components/ResultCards.tsx | timelineIcons — the three gradient glyphs on the hero's Cashback Timelines strip, as react-native-svg. |

## OS chrome

Web device-frame chrome (status bar, nav chrome, mock keyboard, device presets).

| Module | LOC | Exports | Figma node(s) | Assets | Used by | Purpose |
| --- | --- | --- | --- | --- | --- | --- |
| `os/devices.ts` | 27 | DEVICES, DEFAULT_DEVICE, DeviceOS, Device | — | — | Root.tsx<br>os/Keyboard.tsx<br>os/NavChrome.tsx<br>os/StatusBar.tsx | Device presets for the prototype harness — min → max. |
| `os/Keyboard.tsx` | 124 | Keyboard | — | — | Root.tsx | — |
| `os/NavChrome.tsx` | 47 | NAV_CHROME_H, NavChrome | — | — | Root.tsx | Height of the bottom affordance, per OS. |
| `os/StatusBar.tsx` | 53 | StatusBar | — | — | Root.tsx | OS status bar (prototype chrome). |

## Root

App entry.

| Module | LOC | Exports | Figma node(s) | Assets | Used by | Purpose |
| --- | --- | --- | --- | --- | --- | --- |
| `Root.tsx` | 560 | Root | — | — | — | — |

## Hand-written SERP cases

Transcribed design cases in `src/data/realData.ts`. A query hits one of these when
`REAL_CASES` has its key; anything else is generated from the catalog by `buildSerp()`.

| Export | Query | Archetype | Routed via REAL_CASES |
| --- | --- | --- | --- |
| `caseAmountLoan` | `₹5,00,000 personal loan` | 07_loan | no |
| `caseBody` | `body` | 01_store | yes |
| `caseCredit` | `credit` | 05_credit_card | yes |
| `caseFlip` | `flip` | 01_store | yes |
| `caseMobile` | `mobile` | 02_product | yes |
| `casePhar` | `phar` | 01_store | yes |
| `caseB` | `sbi cashback card` | 05_credit_card | yes |
| `caseTira` | `tira` | 01_store | yes |
| `caseWhey` | `whey` | 02_product | yes |
| `caseSavings` | `zero balance savings account` | 12_bank_savings | yes |

---

Modules: 53 · Lines: 12626 · SERP cases: 10

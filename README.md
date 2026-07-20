# CashKaro Search 2026 — prototype

Native app (Expo + React Native + React Native Web). What you preview in the
browser *is* the native app — there is no separate port step. Built per the
Search 2026 handover; "search like Google, cashback like CashKaro".

## Run

```bash
cd cashkaro-search
npm install
npx expo start --web     # browser preview
# or: npx expo start      → press i / a for iOS / Android
```

On a wide screen the web build wraps the app in a phone frame with a **query-shape
picker** (left) so every case (A–G) is reachable directly.

## What's real vs. placeholder

- **Design tokens** (`src/theme/tokens.ts`): extracted verbatim from the CashKaro
  Mini App Design System (Figma). Colour, Outfit type ramp, spacing, radius,
  elevation, motion. **No literal hex/px/font may appear anywhere else** — enforced.
- **Real data** (`src/data/realData.ts`): store names, cashback %/₹, product
  prices transcribed from the `Cashkaro-Search-2026` real-data cases
  (flip/phar/body/whey/mobile/tira/credit). Nothing invented.
- **Placeholders** (18, greppable via `PLACEHOLDER`): card joining/annual fees,
  cards' own reward bullets, and all loan/savings APR/interest — these have **no
  real figure** in the design cases, so they render in a loud red dev-only style
  (§7 Placeholder Protocol). They are the exact gaps to fill from the real feed.
- **Icons**: Font Awesome 6 **Pro** (licensed), bundled from the desktop install
  as `.otf` and rendered by Unicode glyph. Swap-in of the npm Pro kit later is a
  one-file change (`src/icons/iconMap.ts` + `App.tsx` font registration).
- **Imagery**: store logos / card art not yet supplied → neutral image slots
  (initial + concept icon). Never a fabricated URL. Drop real URLs into the data.

## Structure

- `src/theme/tokens.ts` — the single source of truth for all visual values.
- `src/icons/` — `iconMap.ts` (concept → FA glyph) + `Icon.tsx`.
- `src/data/` — `dataContract.ts` (shapes) + `realData.ts` (transcribed cases).
- `src/components/` — primitives (cashback, rate, badge, tab bar, button, image
  slot, atoms) + `FinanceCard` (Full/Compact) + result cards + `SerpShell` +
  `ExpandSearch`.
- `src/motion/` — `CountUp`, `Skeleton` (shimmer), `Shine`, reduced-motion aware.
- `src/screens/` — `SearchFlow` (idle → typing → SERP), `ExploreHome`, `Recovery`.
- `src/Root.tsx` — prototype harness (phone frame + case picker).

## Case → screen map (handover §4)

| Case | Query shape | Reachable via |
|---|---|---|
| A | Resolved retail store | `flip`, `body`, `phar` |
| B | Resolved single card (golden screen) | `sbi cashback card` |
| C | Broad banking category | `credit` |
| D | Amount-specific loan (rank ↑ by rate) | `₹5,00,000 personal loan` |
| E | Feature-specific savings (rank ↓ by interest) | `zero balance savings account` |
| F | Recovery / zero results | any unmatched query |
| G | Beyond-catalogue web (products only) | `whey` → Expand Search |

## Rules enforced in code

- Cashback: flat-₹ for cards, %/range for stores, **absence (never "0%")** for
  unmapped merchants; kept visually separate from a card's own reward bullets.
- Reward vs. cost colour: reward = Fern green, cost (APR/fees) = neutral, never
  green (§6.5).
- Hero only for single-entity queries; tab bar only when adjacent categories
  exist; Expand Search only on product pages, never finance-only (§3.3).
- "Top pick · <reason>" always carries a disclosed reason (RBI 2025 ranking rule).
- Generic BFSI disclaimer above the end divider on any rates/fees screen.
- ≥44px tap targets; 200 ms suggest debounce; reduced-motion variants.

## Open items (need input)

- Real fees, card reward bullets, and loan/savings rates (replace `PLACEHOLDER`s).
- Store logos / card artwork (URLs or exports).
- §13 product questions: Q-010, Q-013, Q-014, Q-016, loan/savings completion
  cashback.

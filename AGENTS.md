# CashKaro Search — Agent Context

Shared context for every chat working on this project. Read before writing UI code.

This file holds the **hard rules**. The rest of the shared context lives in
`docs/`, and keeping it current is part of "done" — see
[CLAUDE.md](CLAUDE.md) for the session protocol:

| File | Answers | Maintained by |
| --- | --- | --- |
| [docs/MAP.md](docs/MAP.md) | *where* code lives | generated — `node scripts/gen-map.mjs` |
| [docs/DECISIONS.md](docs/DECISIONS.md) | *why* we do X not Y | append a `Dnn` entry per decision |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | *when* / how we got here | a dated paragraph per landing |

`node scripts/check-context.mjs` audits all three plus the rules below.

## Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## Layout conventions (READ — repeated source of bugs)

**Page padding is `space.m20` (20px) on both sides.** Screen content columns apply
`paddingHorizontal: space.m20` (e.g. `SerpShell` `content`, `ExploreHome` `blockPad`).
Anything placed inside inherits that 20px inset.

### Horizontal scrollers / tab rows / rails must be FULL-BLEED

A horizontal `ScrollView` placed inside the 20px-padded column will clip its last
item at that arbitrary inset instead of scrolling cleanly off the screen edge
(the "Products chip clipped on the right" / "chips clipped from sides" bug).

Correct pattern — break out of the page padding, then re-add it *inside* the scroll
content so items align with the page on the left and scroll to the true edge:

```ts
wrap:      { marginHorizontal: -space.m20 },              // cancel page padding → full-bleed
container: { paddingHorizontal: space.m20 },              // re-inset content on BOTH sides
```

Do NOT pad only one side (`paddingRight` only) — that leaves the left relying on
parent padding and still clips the right at an inset. See `components/TabBar.tsx`.

### Paged carousels — pin every width to ONE rounded integer

Sub-pixel mismatch between card width, snap step, and the native paging frame
lets the adjacent slide peek at the edge ("banners clipped from side while
animating"). Fix, all three must be the SAME integer:

- Round the measured layout width: `setW(Math.round(layout.width))`.
- Set an explicit `style={{ width: cardW }}` on the `ScrollView` (fixes the paging frame).
- `snapToInterval={step}` + `disableIntervalMomentum` alongside `pagingEnabled`.
- Programmatic `scrollTo` offsets must be integer multiples of that width.

The carousel's scroll frame must span the physical screen width. `DealsCarousel`
takes a `bleed` prop: pass `space.m20` when it sits inside a 20px-padded column
(SERP sections, Explore blocks) and omit it at page level (Home). The measured
width still drives card/step/frame, so paging stays exact either way.

The banner artwork itself is inset `space.m` (16px) *inside* each full-width page
— never narrow the page to create that gap, or the snap step stops matching the
frame width. Result: 16px off both screen edges at rest, 32px between banners
mid-swipe, on every screen size.

See `components/ResultCards.tsx` → `DealsCarousel`.

## Design-system rules

- **Store cards render ONLY the brands in `data/storeTiles.ts`** — the exact 44-brand
  set from Figma "Storepage Tiles" (`qDyQsqusZTtdGdBPdua6QT`, node 611:3360), with
  that frame's own logo PNGs (`assets/brands/figma/`), washes, offer strips and
  cashback labels. Never put a favicon/CDN logo or an off-design brand on a tile.
  The search index (`catalog.ts` `STORES`) is deliberately unfiltered, so a query can
  resolve to a store whose card shows a different brand — accepted trade-off.
- Section titles use the `Head` component (`ExploreHome.tsx`). Pass `icon` only when
  a section semantically warrants one (e.g. Trending = `fire`); plain titles omit it.
- Use tokens from `theme/tokens.ts` (`space`, `color`, `radius`, `type`) — no hard-coded
  px, colors, or font sizes.
- Every tappable element must clear `MIN_TAP_TARGET` (≥44px).

## Matching Figma (design → code)

- Pull the real spec with the Figma MCP (`get_design_context` + `get_variable_defs`)
  for the node — never eyeball a screenshot.
- Every hex/px/font in the spec must resolve to a token in `theme/tokens.ts`. If a
  needed value is missing, ADD it to tokens.ts (palette + semantic role, or a named
  `type` entry) and reference it — do NOT inline literals in components.
- Convert the returned React/Tailwind to this project's RN + StyleSheet + tokens.
  Gradients → `expo-linear-gradient` `LinearGradient` (already imported in
  `ResultCards.tsx`); inset shadows → `boxShadow: 'inset ...'` on an absolute overlay
  View layered above the content (mirrors Figma's overlay div).
- Category chip (Figma 1646:7349) and product card (Figma 1646:7850) are already
  matched — reuse their token choices for similar pills/cards.

## Before finishing

Run `npx tsc --noEmit` and confirm it passes.

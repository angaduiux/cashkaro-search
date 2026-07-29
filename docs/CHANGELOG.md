# Change log & architecture history

A chronological record of what was built in the CashKaro Search prototype, and
the architecture those changes produced.

- **Source of truth for _where code lives_:** [MAP.md](MAP.md) (generated).
- **Source of truth for _why we do X not Y_:** [DECISIONS.md](DECISIONS.md) (D001–).
- **Source of truth for _how we work / hard rules_:** [../AGENTS.md](../AGENTS.md),
  bootstrapped by [../CLAUDE.md](../CLAUDE.md).

This file narrates; the three above stay canonical. Nothing here is invented —
every entry traces to a commit, a decision entry, or the code.

---

## What this is

An Expo (managed) React Native prototype of CashKaro's search experience, run
both on device and as a web preview inside a device frame. One hoisted search bar
glides between Home → Explore → Typing → results; results are composed from a
single `SerpModel` shape covering 13 result archetypes (store, product, credit
card, co-branded card, loan, savings, campaign, recovery …).

**Stack:** TypeScript · Expo SDK 57 (`expo ~57.0.6`, `react-native 0.86.0`,
`react 19.2.3`) · `react-native-reanimated` for motion · `expo-linear-gradient` ·
web export served from Cloudflare.

**Architecture:** `src/Root.tsx` owns one search controller (state → mode) and the
overlay stack; screens are plain components, not routes. `src/data/` holds the
contract, the catalog/search engine, transcribed real cases and the Storepage tile
set. `src/theme/tokens.ts` is the only source of colour/type/space/radius/motion.

---

## 2026-07-28 · The cashback-timeline strip gets its Figma icons

**Three gradient glyphs, inlined as SVG (D051).** The strip's newer spec (Figma
`XgdQOrfPsC6HNv24uS9jgN` node 1716:76773) puts a 26px icon ahead of each cell's
label/value — a clock for *Tracks In*, a circle-check for *Confirms in*, a bank
with a ₹ for *Withdraw* — each filled with its own top-to-bottom ramp (amber, sky,
mint). They could not go through [../src/icons/Icon.tsx](../src/icons/Icon.tsx),
which paints FA6 text glyphs in one flat colour, so they follow the coupon
ticket's pattern instead: `react-native-svg` paths copied byte-for-byte from
`download_assets` into [../src/icons/timelineIcons.tsx](../src/icons/timelineIcons.tsx),
exports kept at `assets/timeline/` as provenance, gradient ids per-instance via
`useId`. Ramps are new `color.timeline.*` tokens; `TimelineCell` is now
`icon`-keyed, its body a row with the frame's own 6px left inset. Verified per D014
in a headless render of `StoreHero`.

## 2026-07-28 · Product photos: fit the box, and make every subject the same size

**`contain` instead of `cover`, plus a normaliser for the sources (D050).** The card
box is 132 × 96 (1.375) and the photos were square 1000 × 1000, so `cover` cut ~30% of
the height off every one — visible worst on the tight studio crops, where the iPhone 15
Pro (subject 0.80 × 0.99 of its frame) lost its top and bottom. Switching to `contain`
stops the crop but exposes the real problem: the sources framed their subjects anywhere
from **0.34 × 0.42** (Galaxy S24) to **0.80 × 0.99** (iPhone 15 Pro), so contained side
by side they read as randomly scaled.

[scripts/normalize-product-photos.py](../scripts/normalize-product-photos.py) re-frames
each file so the *subject* is the constant: flatten alpha onto white → crop to the
subject's bbox → scale to 85% of the canvas height (or 94% of the width for wide
products) → centre on a white canvas at the box's own 1.375 ratio. Because the canvas
ratio then matches the box, `contain` fills it exactly. Verified: 43 of 44 files at
1100 × 800 with subject height 0.85 (the wide ones 0.53–0.70 by design), and the five
phones now render identically sized with nothing cut. `raw-chicken.jpg` is skipped and
letterboxes — 0% white ground, so there is no subject to isolate; it was already on
D038's unresolved list. Originals are in git history; re-run the script after adding a
photo.

---

## 2026-07-28 · Home banners: the padding was inside the artwork, not the code

**Trimmed the three banner PNGs; no code changed (D048).** The box had been right since
D035 — page = full screen width, image = `W − 32`, so 16px each side — but the sources
carried their own margins on top of it: banner2 had **39px of white on the left and 19
on the right**, banner3 19/19 plus a **30px white strip along the bottom**, and banner1
none but a 15px pale-blue rim on its right edge (the "faint light edge" D042 noted and
left). So banner2 rendered ~49px of padding on the left against banner1's 16.

Two edge-anchored passes, so interior whitespace is untouched:

```py
1. pure-white margins — contiguous rows/cols where ≥98% of pixels are ≥248
2. pale rim           — contiguous rows/cols brighter (>10) than the reference line
                        just inside them, capped at 4% per side
```

Re-measured after (D014): pages at x 543 / 921 / 1299, each image **346 × 208 with
padL 16, padR 16** — identical across all three. Trimming also pulled their ratios
together (1.51 / 1.49 / 1.51, from 1.51 / 1.62 / 1.46), so the `resizeMode="stretch"`
into the app's 1.665 box now distorts each one by the same ~10% instead of 3–14%
apiece. The originals are in git history.

---

## 2026-07-28 · The AI band's head: pitch beside the title, glass mark instead of the 3D emoji

**Two lines under the title, not one line under everything (D046).** The pitch moved
into the title's column, so the head is now `[mark][title / pitch]` and the copy no
longer runs the band's full width. It carries an explicit break — "We can search the
whole web / and find matching products." — because relying on the column to run out of
width gives two lines on a 390px device and one on a 500px preview.

**The mark is drawn, not shipped (D046).** `sparkles-3d.png` (Fluent Emoji, warm
orange) is replaced by [icons/AiMark.tsx](../src/icons/AiMark.tsx): two parametric
four-point stars, six layers each — contact shade, sky→mint→violet→deep body, far-face
depth, top-left gloss, a tilted elliptical specular, gradient rim — all clipped to the
star silhouette, all colours new `aura.aiSky/aiMint/aiDeep/aiGlass*` tokens. Tuned
against a standalone SVG harness (a full `expo export` per iteration would have been
~90s each) and then verified in the real band. The one non-obvious fix: the body ramp
had to run along the star's **own axis**, not its bounding-box diagonal — a four-point
star doesn't reach the box corners, so the first attempts put the purple stop in empty
space and the mark read cyan-to-green with no purple at all.

**The wordmark is now the app's vector (D039).** The toolbar was drawing
`assets/ck-app/ck-logo.png` — a different asset (416 × 192, ratio 2.17) from the app's
wordmark (ratio 4.9). Inside the toolbar's 88 × 18 box `resizeMode="contain"` fitted it
by height and painted it ~39px wide, a third of its size. Replaced with Metro fn
**#20009 `CKLogo`** verbatim: five paths, "CASH" in `colors.primary`, "KARO" in
`colors.secondary`, natural box 86 × 17.28 from its own clip rect, drawn at 88 × 18.

**The banner was clipping because `aspectRatio` silently doesn't work (D040).** On an
RN-web `<Image>` with `width: '100%'`, `aspectRatio` is ignored and the asset's
intrinsic height wins. Measured: the three pages were **352 / 354 / 392** tall instead
of the box's 293, so every page was a different height and the taller two were cut
against the 293px paging frame. Both dimensions are now set explicitly from a measured
stage width — after the fix all three measure 488 × 293 with `contentH` 293. The footer
image had the identical fault (it was losing a third of its left edge; the earlier
`resizeMode="contain"` patch hid the symptom, not the cause) and is fixed the same way.

**And the artwork itself was being cropped (D041).** The app's box is a fixed 1.665 and
its own banners are that ratio; ours are 1.46–1.62, so `cover` ate their tops and
bottoms — the "Sale Live Now" ribbon was sliced off. Rather than change the designed
box or accept white side bands from `contain`, the three PNGs were widened to the exact
ratio by extending each one's own edge column outward:

```py
target_w = round(h * 1.6649746192893402)          # pad = 27+28, 8+9, 40+41
out.paste(im.crop((0,0,1,h)).resize((left,h)), (0,0))        # extend left edge
out.paste(im.crop((w-1,0,w,h)).resize((right,h)), (left+w,0))# extend right edge
```

Home reads `assets/banners/ck/`, so `cover` is now a no-op and the whole banner shows.
Drop in true 1.665 art later and no code changes.

---

## 2026-07-28 · Coupons became the Store Page V2.0 ticket, all three states

**The coupon card is now the real design (D037, D038).** Pulled node **1835:16064**
out of Figma "Store Page V2.0 — Deliverable" (`XgdQOrfPsC6HNv24uS9jgN`) with
`get_design_context` + `get_variable_defs` — spec first, screenshot only to
cross-check, per the ask. Its three component variants are one `state` prop on the
new [CouponTicket.tsx](../src/components/CouponTicket.tsx): `Default` → cobalt code
+ tabler:copy; `Variant3` → code dimmed to 40% with a 36px spinner and `pr` 16→4;
`Variant4` → stub, border and label all flip green with a 21px tick and `pr` 10.
Geometry is verbatim — 328 × 152, radius 12, `drop-shadow(0 6px 5px rgba(7,42,78,.17))`,
columns 44 · 9 · 252 · 23, body `pt12/pb20/pl10`, code field h35 `py 8.21`.

The exported artwork (both notches, the perforation, the expiry ribbon and its folds,
clock, copy, tick, chevron) is inlined as `react-native-svg` in
[couponAssets.tsx](../src/icons/couponAssets.tsx) with the .svg files kept at
`assets/coupon/` for provenance — inlined because there is no metro SVG transformer
here, so `require('*.svg')` wouldn't resolve. New `color.coupon.*` tokens; the spec's
**Metropolis** rather than the search system's Outfit, since this is a store-page
deliverable. `ResultCards.CouponCard` is a 6-line adapter now and its old
hand-rolled coupon styles are gone.

**Three fixes the 2.4× render caught.** The stroke-only glyphs were painting solid
black — react-native-svg defaults `fill` on a `Path`, where the exported `<svg>`
carried `fill="none"` at the root. The notch bands were laid *over* a full-height
fill, so each bite exposed the very gradient it was meant to cut away; they are
stacked between two fill halves now, the way the frame builds them. And the whole
cut-out language assumed Figma's black canvas: on the SERP's white page the bites
reveal white and the ticket silhouette vanished, so the perforation strip is pulled
2px left to bite into the stub instead (D038). The expiry ribbon also stretches to
its label — the art is drawn for a 7-character timer ("23h:25m") and real copy
("Ends in 2 days") overran it.

**Two requested changes on top of the spec.** Title and subtitle are joined into the
one offer line with "See Details" tight beneath it, and that chevron is 22px in a
cobalt → purple ramp lifted from the ticket's own stub gradient (green once copied)
instead of 18px flat grey.

---

## 2026-07-28 · The SERP tab bar stopped double-spacing the first section

**Removed `TabBar`'s bottom margin (D036).** Below the tab row three margins were
stacking — the bar's `marginBottom` 16, the first section's `marginTop` 16 and its
header's `paddingVertical` 8 — so the tabs sat 40px clear of "Stores (3)" while every
section-to-section gap on the same page is 24px. React Native has no margin
collapsing, so a component that owns trailing space above one that owns leading space
always double-spaces; the bar's hairline is what separates it from the content, so it
now owns no space. Measured before/after with one DOM probe against the same two
elements (D014): hairline-bottom → title-top 50px → 34px, i.e. exactly the 16px
removed. `SerpShell` is TabBar's only consumer, so nothing else moved.

---

## 2026-07-28 · Home became a clone of the production app, decompiled from its binary

**`HomeScreen.tsx` is no longer a prototype home — it is the shipped CashKaro app's
home, two scrolls deep (D027–D030).** The person installed the real app on this Mac
and asked for its homepage design, explicitly: *"only copy the exact code from the
app, don't build anything from screenshots."* macOS Screen Recording was not granted
to the host process, so screenshots were unavailable regardless — which turned out
to be the better path. `/Applications/CashKaro.app` is an iOS-on-Mac wrapper whose
`main.jsbundle` is Hermes bytecode v96; [hermes-dec](https://github.com/P1sec/hermes-dec)
decompiled all 27,253 functions of it, and the home surface was read out of the
result function by function.

**What came out verbatim.** The app's whole colour module (Metro **897**, 40 roles —
`primary #FF6D1D`, `secondary #0036DA`, `section_blue_two #F2F7FC` …), its 204-entry
utility StyleSheet (Metro **896** — `ph16`, `rowHCenter`, `rounded8`, `btmShadow` …),
its Metropolis weight map, and its `<Text>` size scale (fn **#12439**: `xs`→10/14 …
`xl`→18/24, default `colors.text` + Metropolis-Medium). All of it now lives in
[src/theme/ckApp.ts](../src/theme/ckApp.ts) — deliberately *beside* `tokens.ts`, not
merged into it (D028), because tokens.ts is the Figma search system and the two
disagree on type family and greys. Five Metropolis weights plus the app's own
`footer.png`, `prepostfloat.png`, `help_ic.png` and logo were vendored out of the
bundle; the toolbar/search/view-all icons are the app's real SVG path data in
[src/icons/ckAppIcons.tsx](../src/icons/ckAppIcons.tsx) (which is why
`react-native-svg` is now a dependency — the app draws them as paths, and this
repo's FA6 fonts are subset to ~34 glyphs that don't include them).

**The layout is the app's layer stack.** From fn **#19765**: toolbar absolute at
`top 0`, `height 40` (`CONTAINER_HEIGHT_DEFAULT`), `zIndex 3`; search block absolute
at `top 40`, `paddingTop 12`, `zIndex 2`; the list's content starting at
`SEARCH_HEIGHT_DEFAULT (64) + 8` behind a collapsing spacer of the toolbar's height.
Then the app's sections in the order `renderHomePageSections` (#19876) receives them:
BANNERS (aspect ratio `1.6649746192893402`, 3s autoplay, dots at `bottom 20`),
HOME_CATEGORIES (73×113 tiles, 73px circles, `columnGap 24`, "Top categories"),
then card sections behind `HomeTitleSection` (#20115 — 16/24 ExtraBold + a 12/16
"View All" and the app's own 16×8 arrow). Store cards are fn **#20200** exactly:
`(W − 2 − 24 − 16) / 3` wide, 158 tall, `rgba(21,33,73,0.08)` hairline, 98×46 logo,
a `bk_ruby_red`-at-12% ribbon — which also fixed the grid's side padding to **12**,
since that formula is what reserves it. Bottom tabs are fn **#5882**'s own
screenOptions (Home · Refer & Earn · My Earnings · Missing? · Profile).

**Then two corrections from review (D034, D035).** The banner was clipping on the
right: fn #19974 calls `Dimensions.get('window')` twice, once raw and once minus 32,
and the first pass read that as "a full-width frame inside a `W − 32` centred
wrapper". Wrong way round — the **page** is full width and the 16px is the
*artwork's* inset, which is why the height divides `W − 32`. Putting the inset on the
frame started it 16px in and ran it 16px off the right edge, the exact bug
AGENTS.md §Paged carousels warns about. Fixed and then measured (D014): frame left 0,
width 520, `scrollWidth` 1560 = 3 × 520, every page 520 with its image at left 16 and
width 488 — 16px off both screen edges at rest, 32px between banners mid-swipe.

And the search field is now **this prototype's bar, not the app's** — asked for
directly ("we will use the new search bar in this home"). Home keeps the app's 64px
band under the 40px toolbar and renders nothing in it; `Root.tsx` rests its one
hoisted `SearchBar` there instead (`REST_Y` 64 → 40, and D030's opacity fade
removed). It fits the band exactly, since the bar is also 64 tall (8 + a 48 field +
8) and opaque enough to back it. Home's category tiles and store cards now drive
`onPick`, so the surface stays navigable without a field of its own.

Verified with `npx tsc --noEmit` clean, a DOM measurement of every rail, and
headless-Chrome screenshots at the top, scroll 2 and the footer.

---

## 2026-07-28 · Coupon ticket matched to spec

**Six fixes, all visible on device (D040).** Re-read Figma `10062:16020` and the
badge variant: the card is **134** tall (+18 with a badge), not a fixed 152; the
expiry badge is now an overlay pinned at `top -2 / left 4` and drawn last, so it
hangs on the ticket instead of sitting inside it like a stripe under the hairline;
`borderRadius: 12` moved onto the card so `boxShadow` follows the corners (the hard
rectangular shadow was what read as "radius not working"); the coupon rail got its
own 12px vertical padding so the overhang and shadow aren't clipped; SVG gradient
ids are per-instance via `useId` (a literal `id="stub"` made a copied green stub
paint a purple band from the first ticket's gradient); and the stub is one gradient
plus a white lens instead of gradient·svg·gradient, which had two rasterisers
meeting mid-column. The spec's 9px offer→See-Details gap is restored, the ribbon's
fold slivers are gone, and the top/bottom hairlines are removed.

## 2026-07-28 · No more grey auras

**Colourless tints fall back to sky blue (D039).** About a dozen brand tints are
`#262626` at low alpha, and amplifying chroma that isn't there produced a grey
cloud behind the store hero — "grey blobs". `deepenTint` now returns sky for any
tint under 0.06 relative saturation or 96 brightness, and `auraWashTint()` swaps the
hero's base wash to pale sky for those same brands so the glow isn't sitting on a
grey field. Pastels keep their own hue (the test is relative saturation, so Nykaa's
`#fce7f0` still reads pink), as do all chromatic brands. Verified on the Nike hero:
pale sky wash, sky-blue orbs, no grey anywhere.

## 2026-07-28 · Product photos move to studio-on-white

**Three amateur shots replaced (D038).** The original product set came from
Wikimedia Commons, so several images were phones photographed on a grey desk —
visibly a different class from the studio renders beside them. `iphone-15-pro` now
uses the supplied AVIF (converted to a 1000px JPEG like the rest of the folder),
and `iphone-15` + `apple-watch` use studio renders from the merchant listing.
New [scripts/check-product-photos.mjs](../scripts/check-product-photos.mjs) ranks
the folder by near-white share; a contact sheet rendered through headless Chrome
is how the list gets confirmed, because the metric flags a tight studio crop as
readily as a desk photo. `mattress`, `raw-chicken` and the two ELV phone mounts
are still amateur — no fetchable clean source (403s) or no equivalent product shot.

## 2026-07-28 · The deals rail glows in its banner's own colour

**Sampled, not guessed (D036).** `DealsCarousel` now renders an `AuraField` behind
the pager, tinted from the visible creative's dominant colour, crossfading as the
carousel advances. The colour comes from a new
[scripts/sample-banner-tint.mjs](../scripts/sample-banner-tint.mjs) — a coarse RGB
histogram scored by `count × sqrt(saturation)` with a 2%-of-image floor — whose
output is stored as `bannerTint` on each deal. The brand palette was the wrong
source (Amazon's creative is pale blue, not orange) and RN can't read image pixels
at runtime, so this follows the store-tile precedent of measuring the asset (D008).
The glow is static and centred, and its ramp is compressed into the inner 78% of
its box so it is already transparent before the section's top and bottom edges —
the first pass drifted (distracting behind artwork) and met those edges in a
straight cut. Verified on device: grey-blue behind the AJIO creative, sky blue
behind the next one, zero pixel change between banner changes, clean white above
and below the rail.

## 2026-07-28 · The aura became visible, soft, and six-hued

**The field was drifting, but nobody could see it (D034, D035).** Three causes, all
fixed: a 24s loop with 34px amplitudes (now 16s and 58–82px), orbs painted in the
same hue as the wash they sat on (the hero's brand tint is now pushed to a usable
chroma first, D033), and a *linear* alpha falloff, which leaves an edge the eye
finds — so the orbs read as distracting discs. `SOFT_RAMP` replaces it with an
eight-stop gaussian-shaped falloff reaching zero at 92% of the box; there are now
five orbs at lower peak alpha and `AI_ORB_SIZE` 320, so the field is a mist rather
than a set of blobs. `AI_FLOW_HUES` gained magenta and aqua (six-hue cyclic ramp),
and each orb takes its own hue from it. The Expand-Search mark is now a real **3D
asset** — Fluent Emoji sparkles (MIT) in `assets/icons3d/` — on a radial glow
platter instead of a glyph on a gradient tile, because Icons8's 3D collections
return nothing on the anonymous MCP tier. The band also drops its bottom hairline,
gains 40px of bottom padding, and `SerpShell` omits its trailing spacer when the
band is present, so the field runs off the bottom of the screen.

**And a measurement lesson (D035).** Motion had been "verified" from headless-Chrome
screenshots, which cannot show it: `--virtual-time-budget` doesn't advance
Reanimated's clock, so both `useFrameCallback` and `withRepeat` measure as exactly
zero on web while both animate on device. Motion claims now come from two real-time
Simulator frames diffed with `scratchpad/pngdiff.mjs` — the band measures 16.1
mean-abs-diff (82% of pixels changed) over 2.2s, the store hero 1.7 (26%).

## 2026-07-28 · The store hero gets the same living field, in its own colour

**One aura engine, two surfaces (D033).** `AuraField` grew a `fills` prop and a
`base` flag, so `StoreHero` now layers the same three Lissajous orbs over its
existing brand wash — re-tinted from the store's own `heroTint` via new
`tintRgba()` / `brandOrbFills()` helpers, so Flipkart glows yellow and Myntra pink
with no new tokens. The panel also stops ending in a hard line: a
`fade0 → surface` gradient under the content dissolves wash and orbs into the page
before the bottom edge (which `overflow: hidden` was previously cutting straight
across), with `paddingBottom: space.xl` giving it room. Verified on the Flipkart
hero in the Simulator.

## 2026-07-28 · Expand Search goes full-bleed, with real web-result photos

**The card became a band, and the results became a rail (D031, D032).** The result
set is unbounded, so the container was the wrong shape: web results now stream into
a full-bleed horizontal rail (last card scrolling off the true screen edge per
D013), the copy and CTA stay on the 20px page column, and the aura runs edge to
edge behind both with hairlines top and bottom instead of a card border. The four
`webResultsForWhey` SKUs now render real white-background product photos —
`optimum-whey` and `muscleblaze-whey` were already in `assets/products/` but the
items only carried a brand logo, so D003 correctly refused to draw them and the
rail showed letter tiles; `isopure-whey` and `myprotein-whey` were added from the
merchant listing CDN with prices transcribed from the live page. Verified in the
iOS Simulator (iPhone 17 Pro, Expo Go): band edge to edge, "4 matches", third card
cut by the screen edge rather than a 20px gutter.

## 2026-07-28 · The Aura motion engine behind Expand Search

**AI surfaces got a real gradient engine (D017, D018).** The Expand-Search card's
"living wash" only existed on web — it was `filter: blur(34px)` gated on
`Platform.OS === 'web'`, so on device it rendered as two hard-edged circles, and
its CTA shine was a white slab toggled on an opacity comparison. New
[src/motion/Aura.tsx](../src/motion/Aura.tsx) replaces that with one
display-linked clock (`useAuraClock`) driving `AuraField` (three Lissajous glow
orbs built from `radialFill` radial gradients), `FlowStrip` (a seam-free flowing
hue ramp), `Sweep` (a soft specular pass) and `Orbit` (the mark's rotating
highlight) — all on the UI thread, all seamless across the loop, all with a
composed still frame under reduced motion.
[components/ExpandSearch.tsx](../src/components/ExpandSearch.tsx) was rebuilt on
it: shadow-parent/mask-child so iOS actually casts the card and CTA shadows,
`borderCurve: 'continuous'` corners, a press spring + highlight veil, a CTA that
crossfades to a "thinking" label in place (the whole surface's motion accelerates
to ~2× instead of the card swapping content), streamed results behind one
provenance chip, an empty state, and VoiceOver announcements per phase. The
dead 32px bottom padding is gone. New `color.aura.ai*` +
`AI_MARK_SIZE`/`AI_CTA_HEIGHT`/`AI_ORB_SIZE`/`AI_FLOW_HUES`/`radius.xl20` tokens;
verified at 2–3× in the web export across idle, searching and results.

## 2026-07-28 · Storepage brand tiles, full-bleed rails, context system

**Store cards pinned to the Figma tile set (D010, D007, D008, D006).** Extracted
all 45 tiles from Figma "Storepage Tiles" (`qDyQsqusZTtdGdBPdua6QT` 611:3360) —
44 unique brands — pulling each tile's own logo PNG per logo node, stripping the
baked background by border flood-fill, and transcribing each tile's wash, offer
strip, cashback figure and CASHBACK/REWARDS caption. New
[src/data/storeTiles.ts](../src/data/storeTiles.ts) became the single source for
every store card; `catalog.ts` maps store slots onto tiles (stable per slug,
distinct within a rail); Home/Explore rails, category grids, View-all and the four
hand-written SERP store sections all render from it. The contract gained
`Cashback.pct_single.prefix` and `ResultItem.cashbackCaption`; `StoreTile` now
paints `heroTint` verbatim. The per-category `CATEGORY_OFFER` fallback was deleted.
The search index was deliberately left unfiltered (D009).

**Every rail and carousel made full-bleed (D013, D014).** DOM measurement showed
the SERP stores/products/coupons rails and the deals carousel ending 20px short of
the frame edge, so a mid-scroll card was cut with a dead gutter beside it. Rails
now cancel the page column's padding and re-inset their content on both sides;
`DealsCarousel` gained a `bleed` prop (SERP + Explore pass `space.m20`, Home omits
it). Verified by measuring every scroller before/after, not by eyeballing.

**Context system added (D016, D015).** `docs/MAP.md` (generated),
`docs/DECISIONS.md`, this file, a `CLAUDE.md` bootstrap, plus
`scripts/gen-map.mjs`, `scripts/check-context.mjs` and the two hooks that run
them. Two chats were editing this repo simultaneously today — one commit swept a
temporary preview build and a seeded `Root.tsx` into git (D012, D011) — which is
the concrete reason the shared context now has to be checked, not remembered.

**Also today (commits):** `ea30c44` 16px search-field side padding + blue filled
mic icon · `edd15c2` all product photos replaced with white-background images ·
`271b3cd` a real photo for every catalog product, no logo fallback (D003) ·
`0ea28b6` the image-forward store card (Figma 1646:7182) that the tile set now
feeds.

**Product category pages (D020–D026).** Category surfaces used to be decorative —
`CategoryChip` had no `onPress` and the suggestions Categories rows pointed at an
unrelated store SERP — so the app had no browse destination at all. Added
[src/screens/ProductCategory.tsx](../src/screens/ProductCategory.tsx): a fixed
identity header whose title is the category switcher, a fixed sub-category chip row
with live counts, a hero band whose counted-up "earn up to X%" is the highest real
rate in the set, the category's own offers band and store rail, a results bar with
removable filter pills, a 2-up product grid, and a floating Sort/Filter bar feeding
four bottom sheets (sort · faceted filters with live counts · category switcher ·
per-product MRP → price → cashback → effective-price breakdown).

The engine behind it is [src/data/productCategories.ts](../src/data/productCategories.ts):
taxonomy, one set of shared derivations (`cashbackPct`/`cashbackAmt`/`discountPct`/
`finalPrice`), faceted browse with counts that release their own dimension, and
`resolveCategoryTarget()` — the one resolver every category surface routes through.
To give it something to sort, the 19 design-case SKUs that only existed as
`ResultItem`s in `realData` were restated as structured `catalog.PRODUCTS` rows and
`Product` gained a `sub` facet (D020). New shared primitive
[src/components/Sheet.tsx](../src/components/Sheet.tsx) (D026) with two new tokens
(`color.scrim`, `radius.hero`).

Verified per D014 in an isolated copy of the repo (a parallel chat had `App.tsx`
seeded to its own harness at the time): the headless render caught the hero figure
frozen at `0.0%` because `useInView` never fired above the fold (D025), an
"Electronics stores" rail showing Duolingo and Air India Express, and an AJIO
fashion banner on the Nutrition page (both D023).

## 2026-07-20 · Web delivery + lender polish

`fix(loans)` baked-in dark corners removed from lender logos · `fix(web)` Outfit
fonts self-hosted so Cloudflare serves them · `perf(web)` Cloudflare
infinite-spinner load fixed.

## 2026-07-16 → 07-20 · The prototype

Initial commit, then the Search-2026 prototype: expanded store catalog + product
search, design-system credit cards with real card art, category icons, chevron
cashback timelines, the new/existing user-type flow, and real brand logos.

---

## How to add to this file

Append under a dated heading when a session lands something a future reader would
otherwise have to reconstruct from diffs. Reference the `Dnn` entries rather than
re-explaining the reasoning — [DECISIONS.md](DECISIONS.md) owns the *why*.

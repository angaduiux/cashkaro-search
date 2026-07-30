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

## 2026-07-30 · The Flipkart page shows the whole catalog's categories

`caseFlip` had no categories section at all, which left the page used to demo the SERP
without the one row that shows what browsing looks like. It now carries every
product-category page the build offers, with `categories` added to its tab row — all of
them rather than the ones a "flip" query implies, since this is the showcase surface and
Flipkart is the one store that genuinely spans every category. The chips are mapped from
`productCategories()`, the same source Explore and the screen nav read, so a chip exists
exactly when its page does and each one opens; the two candidate categories still under
the three-product floor (D022) will appear by themselves when the catalog carries them.
Read through a getter on the section, because `realData` and `catalog` are a cycle and a
module-scope read would hit a half-built catalog (D116).

## 2026-07-30 · The card filter bar's switch was sized to its label

The Eligibility switch went from 52×28 with a 22 knob to **34×20 with a 14 knob**, its gap
to the label from 8 to 6, and its label from "Eligible" to "Eligibility". The old track was
a stock-sized control dropped into a 36px pill next to 13px copy, so it out-weighed the word
that actually states the filter; the new one is sized to that word's line box and the two
read as one phrase. Travel is derived from the spec (`W − knob − 2·pad`), so the animation
followed the numbers. Pill height and the ≥44 tap target are untouched, as is the
applied-filter pill's "Eligible for me" wording (D111).

## 2026-07-30 · The type-ahead became a search engine

Suggestions were a fixture: the typed string stapled onto fixed nouns ("credit facewash
· in Beauty · 10+ results"), every result type emitted on every keystroke, and a fixed
type order that put the actual credit cards sixth for the query "credit". They are now
relevance-ranked against real candidates. One scorer — [matchScore.ts](../src/data/matchScore.ts),
pure string math, no imports — scores every type on the same 0–100 scale (exact ·
prefix · word-prefix · contains · acronym · 1-edit Damerau typo · subsequence), and
`buildSuggestions` scores the whole catalog against it: all 70 stores, product
completions built from the catalog's own keyword vocabulary with counts from
`searchProducts`, category pages and their sub-chips, the six real card tiles, the three
lenders, the three banks, and the coupon sets and campaigns read off the cases that carry
them — plus a per-type INTENT vocabulary, so "credit", "cc" or "lifetime free" reaches
cards and "emi" reaches loans. `rank()` then orders types by their best row, so the type
the query names leads and every other matching type is demoted rather than dropped
(D115). Mid-string matches bold the matched run instead of greying everything before it,
because a relevance-led rank can now match in the middle of a title.

The same day, committed queries got the other half: a zero-result results page now offers
**Did you mean <Correction>?**, resolved from the same scorer, while the suggestions
screen is deliberately left alone (D112). Two pre-existing bugs had to go first —
`searchStores` gave every live store a score of 3 with no match at all, so "zzzqqq"
resolved to a phantom "5 results" SERP and recovery was unreachable; and the edit
distance was plain Levenshtein, which prices a swapped pair at two edits, so the one
typo a correction exists for ("myntar") matched nothing.

## 2026-07-30 · The unboxed card stops relying on white being there

Four things the card's Figma spec could assume on a white ground and can't on the blue
HeroBleed scene (D104). Each USP tag now fills ITSELF white — the pills' own fill is a
4%-alpha ramp drawn to sit on white, so on the scene it had nothing under it. A wash
behind the whole row was tried first and thrown out: it reads as a band with its own
edge, and a wrapped third tag makes that band's shape arbitrary. Filled pills are plates
rather than outlines, so the row also takes 14 down to the USP copy instead of the
spec's 7 (D108). The cashback pill went the same way and further: a white plate on an
orange hairline, the figure up to 15 while "Flat" stays at 13, and the hero CTA's shine
sweep repeated over it on a slower period — `Shine` grew a `tint` prop, since a white
band on a white pill is nothing to see (D110). The fee divider's end stops fade to the hairline's own colour at zero alpha
instead of the spec's opaque white, which was invisible on white and two white ticks on
blue — the `ckBorder0` rule, one component over (D108). And the hero's CTA is now the
store hero's CTA: full width, 48, r12, CK Orange, 45° arrow, same shine sweep, so a
resolved card and a resolved brand close their pages identically — which also lets the
two fee columns centre under the copy instead of crowding left of a 108px button (D109).
Every boxed card keeps the in-strip cobalt CTA; ten full-width orange buttons down a
comparison stack would be a column of buttons, not a comparison.

## 2026-07-30 · A resolved card now sits on its issuer's shelf

The resolved-card page ("sbi cashback card") went hero → "Similar cards" rail, so the
only thing between the best match and a cross-issuer suggestion carousel was nothing.
It now carries **"More SBI cards"** in between: a `kind: 'cards'` section, the same
vertical `CreditCard` stack the cards category page uses, holding every SBI card in the
catalog bar the hero (D107). Two of them are new — `SBI SimplyCLICK` and
`SBI SimplySAVE`, on SBI Card's published terms under the page's BFSI disclaimer, taking
the tile frame's own SBI CashKaro figure rather than an invented per-card one (D105).
SBI Card ELITE, which D105 transcribed off the tile with no fees at all, grew a fee
strip for the same reason — a full card with no closing strip reads as a broken row.
The rail below now subtracts whatever the stack states in full, so ELITE no longer
appears twice. Both new cards carry their real plastic, exported at 3× from the
great.cards design system's `CreditCards/SBI` frame (`Q7235KVU3sU3HOTiibOXhv`,
1189:167083) — sixteen SBI renders, which is where any further card art now comes from,
and only reachable with that file key since the library isn't subscribed by the search
file. `CreditCard` also grew `ArtPending` for the gap between adding a card and having
its render: the issuer wordmark on a plain plate at the artwork's exact 132×84, which
replaced the old `artwork ?? logo` fallback that stretched a favicon across the slot
(D107).

## 2026-07-30 · The field's mic gets bigger, and its gradient starts moving

The search field's voice affordance was a 17px SVG mic carrying a static violet →
cobalt → azure ramp (D090's persistent mic). It is now 22px inside the same 26×36 tap
slot, and the ramp travels: [MicGlyph](../src/icons/MicGlyph.tsx) bakes six drawings
of the glyph at six offsets round a cyclic hue ramp and cross-fades their opacities on
one 5.6s linear clock, with the first drawing held opaque underneath so the ink never
thins mid-hand-over (D106). Opacity rather than animated `<Stop>`s, because gradient
stops don't animate through `react-native-svg` on web. Two shapes were tried and
measured out first — rotating the hue triple between three drawings, and spanning the
whole cycle in each drawing — both of which looked static at this size; the ramp now
spans half the cycle, so each phase is a two-hue gradient and the colour visibly
moves. Reduced motion parks it on the first phase. The voice sheet's orb is untouched.

## 2026-07-30 · The card best match becomes a scene, like the brand best match

A resolved store has read as a scene since D069 — its wash and orbs run from the
device's physical top edge, the chrome goes transparent over them, and the hero itself
is unboxed. A resolved *card* was still a bordered white card on a white page, which
made the answer look like the first row of the list below it. Both now share one
treatment (D104): `Root`'s bleed test is a new `isBleedHeroItem` (store **or** card),
so [HeroBleed](../src/components/HeroBleed.tsx) mounts behind a card hero and tints the
status bar and search bar; [CreditCard](../src/components/CreditCard.tsx) takes a
`bleed` prop that removes the frame — fill, border, both halves of the shadow spec
(native `elevation.card` and the web `boxShadow`), all padding, and the fee strip's -8
pull-out — leaving the page column's 20px as its only inset, exactly as D071 unboxed
the store hero. Nothing inside the card moves: it is still the transcribed Figma spec
(D061).

The scene's hue is the card's `logoBg` read as a HUE, not as a colour: `WASH_ALPHA`
sets the strength, so SBI's cyan lands where Croma's mint does. Compositing the tile
tint's 10% alpha onto white first was built, screenshot-compared and reverted — it made
the card scene indistinguishable from page white while brand scenes stayed tinted.
Loans and savings keep their boxed cards.

## 2026-07-30 · A finance category page has one heading, and it is the credit-card one

The loans and savings pages carried two headings that said the same two things:
a context line ("3 personal loans · ranked by rate (low → high)") and, 40px below,
the section title "Personal loans (3)". The credit-cards page had already lost its
duplicate when the filter bar took over the count (D096), so the fix was to finish
that thought rather than invent a third wording: those pages now render
**headerless** — `financeCategoryPage` in
[SerpShell](../src/components/SerpShell.tsx) (no hero, one `cards`/`loans`/`savings`
section) passes `headerless` to `SectionView`, which drops the `SectionHeader` and
sits the card stack `space.s` under the results line — and their labels in
[realData](../src/data/realData.ts) are re-copied to the filter bar's own wording:
`Showing 3 Personal Loans`, `Showing 3 Savings Accounts`. The ranking clauses and the
amount-loan page's "Lowest EMI for ₹5,00,000" go with them; the amount is still on
every card's subtitle. Multi-section pages keep their headers — there the titles
separate kinds of content (D103).

## 2026-07-29 · Credit-card filters, and the theme takes its real name

**The cards result page and Credit Cards "View all" now filter.** One controller,
three mounts — `useCardFilters(items)` on the screen, `<CardFilterBar>` in the
column, `<CardFilterSheets>` beside the scroller (D091) — over an engine in
[cardFilters.ts](../src/data/cardFilters.ts) that derives every facet from the card
rows themselves: bank and network off the subtitle, the annual fee parsed once off
`fees`, the gift-card rate off `cashback`, and spend categories keyword-matched
against each card's own benefit copy. The bar is the `Category ⌄` dropdown (applies
on tap), the `Filters` sheet (a five-group nav rail over an independently scrolling
panel, a live availability strip, Clear All / Apply (n) — D092's Sheet variant), the
`Eligible` switch, the "Showing n Credit Cards" line, removable applied-filter pills
and an empty state. Eligibility is the one figure the feed cannot supply, so it is a
disclosed fee-tier proxy that says so on the sheet (D005).

Two bugs the headless build caught before anyone saw them: the sheets, mounted inside
the scroll column, pinned to the bottom of the *content* instead of the screen; and
the reset-on-new-items effect fired on mount, so anything the caller opened with was
immediately closed. Both fixed, both written down in D091.

**The card CTA** lost a weight and gained a centre: SemiBold on a 16px line box (at
`lineHeight: 12` Outfit's deep ascent parked the label below the middle of the 40px
button), with the chevron redrawn as a stroke so its weight is one number tied to the
label's stem rather than a fixed ~1.9px silhouette (D093).

**Every results heading** — the SERP context line, "All matched results for …", and
the new count line — now trails off into a fading rule instead of ending flat
(`HeadingLine` + `FadingRule`, D094).

**Home got a showcase user-type switch** (D102): a small dark pill above the tab bar
flips new/existing from inside the phone, which is the only way to reach the new-user
flow on a device.

**The drifting rail stopped fighting the finger** (D099): its drift wrote the scroll
offset every frame, so a drag could never accumulate (the offset reset before iOS
decided a pan had begun, so the pause never fired — the rail froze on touch and
refused to drag) and a press was cancelled as the pill slid away underneath. The
drift is now a `translateX` on the content, advanced on the UI thread; the scroll
offset belongs to the user.

**The prototype boots as an existing user** (D100): the user-type toggle only exists
in the web preview toolbar, so on a device the flag was stuck at 'new' and Recent
searches were unreachable.

**The trending discs stopped tearing** (D098): the reel travelled a full disc
diameter, so at the crossover both images sat half outside the circle it clips to —
two fragments on the top and bottom edges with nothing in the middle. Travel is now
0.45 of the disc, so the images overlap across its centre.

**Trending pills tap again** (D097): the pill now pauses the drifting rail from its
own press lifecycle. The rail's `onTouchStart` guard never fired once a child
Pressable took the responder, so the rail kept moving under the finger and RN
cancelled the press. The handler chain itself was never broken.

**One results line per page** (D096): with the filter bar stating a live count, the
SERP context line on the cards page and the View-all header's "n Results" were both
saying the same number — and neither followed the filter. Both dropped where the bar
is mounted; "Best match for …" is untouched.

**`color.aura` is now `color.ckds`** (D095): 297 call sites across 22 modules, plus
the palette's own `auraX` → `ckX` keys. "Aura" was the W4 design's working title, not
the name of CashKaro's design system. The motion engine keeps the codename — it is a
gradient primitive, not a theme — so `motion/Aura.tsx`, `AuraField`, `useAuraClock`
and `color.ckds.ai*` are unchanged. Decision entries D001–D090 still write
`color.aura.*`; they are left as written and read as `ckds`.

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

## 2026-07-29 · The search field's mic stopped disappearing, and picked up a gradient

Typing one character used to take the mic away: the trailing slot cross-faded mic →
clear, so the voice affordance vanished at precisely the point in a query where
restating it out loud beats fixing it on a keyboard. The slot now holds both, in the
order every top-tier search field uses — `[clear ✕ │] mic` — with the mic mounted
permanently at the right edge and clear widening in beside it behind a hairline, on
the same animated-width pattern the back arrow already uses. The mic's x position is
identical in both states, so there is no target that moves under a thumb, and the two
actions now carry their own accessibility labels instead of one button that quietly
changed meaning.

The mic itself is no longer a Font Awesome glyph. Text takes one flat colour, so a
gradient would have needed a mask layer that isn't a dependency here; it is drawn
instead as parametric `react-native-svg` ([MicGlyph](../src/icons/MicGlyph.tsx)),
the route [AiMark](../src/icons/AiMark.tsx) took, filled with purple → blue → light
blue along its own head-to-base diagonal. The first attempt ramped across the 24-unit
box and rendered flat cobalt — the glyph doesn't reach those corners, so both ends of
the ramp fell outside the ink. See D090.

## 2026-07-30 · A credit card became a tile, and Jump back in wears brand cards

A card had three looks — the full comparison card, a skewed rail item, and a logo with a
number under it in Explore's "Jump back in" — so the same object read as three things
depending on the surface. [CardTile](../src/components/CardTile.tsx) is now its compact
form everywhere, transcribed from Figma Cashkaro-Search-2026 node 1696:5271: the
Storepage store tile's own frame and foot, with a `#f2f4f8` bed under a blue glow
carrying the issuer wordmark and the card artwork. The similar-cards rail and Jump back
in both render it; the comparison card (D061) is untouched, because that is what a
results *stack* is for.

Three findings from the mock, all optical: the white plate Figma draws behind each
wordmark is set to `mix-blend-multiply` and therefore never renders — painting it read
as a chip stuck on the bed; its blurred ellipses are radial fills here (D017), with the
disc under the artwork dialled from 95% to 62% because at Figma's own value the bed's
grey vanished; and the green line takes Regular rather than the spec's Medium, since
Outfit at 10px carries more weight than Metropolis. That line also now holds only copy
that FITS its one line — "Lifetime free", else "Zero joining fee", else a short
top-pick reason, else nothing, because ellipsising a feed sentence mid-word read as a
bug.

The frame's six cards all exist in the catalog now (`ALL_CARD_TILES`), which added SBI
Card ELITE, HSBC Live+ — both named off the plastic itself — and the unnamed
black-and-magenta Axis card, each with that frame's own artwork and wordmark exports.
Jump back in shows a Storepage tile where the brand is in that set and the same tile
built from the brand's DS logo where it isn't, because history can't substitute one
brand for another; Flipkart's asset lost its baked white ground and near-black tints now
fall back to the sky wash instead of washing a tile grey. All of it is D105.

---

## 2026-07-29 · Personal loans joined the credit card's design system

The loans page was the last finance surface still drawn by the generic `FinanceCard`
— DS badges, a star row, a check list and a full-width flat CTA — so scrolling from
cards to loans crossed two design languages. `07_loan` now renders
[LoanCard](../src/components/LoanCard.tsx), built on the transcribed card's own
`CARD_SPEC` and `color.card` (D061), with `CashbackPill`, `Tag` and `ApplyCta`
exported from [CreditCard](../src/components/CreditCard.tsx) so the shared parts have
one source and can't drift. A loan's facts fill the card's slots: top-pick reason,
tenure and processing fee as USP tags; the lender's bullets as USP rows; **Est. EMI │
Interest** in the closing strip beside the CTA — reading `ResultItem.emi`, a new
preformatted feed field, rather than parsing the EMI back out of `subtitle`. Savings
still use `FinanceCard`.

The pill finally has something to show: loans carried `cashback: none`, and the figure
now comes from the Storepage Tiles frame's own loan rows (611:3360) — all nine loan
merchants print "Flat 1%" with the REWARDS caption, read off `STORE_TILES` by key — so
a loan card says "Flat 1% Rewards" where a card says "Cashback".

The differences from the card are all forced by what a loan is, and each was measured
in a headless harness (D041) rather than eyeballed: the lender mark is 64 square with
**no** frame, on the Storepage tile set's neutral wash, clipped at the 22% squircle those
icons are drawn to over a 1.07 overscan (the PNGs are app icons with their own rounded
edge — a border of ours read as a double stroke, the inset only shrank the logo, 84 of
app icon beside a one-line name was too heavy, and Bajaj's export has a dashed 1px
stroke baked onto its edge that read as a dotted ring until the clip trimmed it); USP
rows take
a neutral tick, because the card's glyph set is card perks and every loan line fell
through to its trophy; the CTA is fluid and drops to its own row below 300px of strip,
since at 320pt "₹10,744/mo" had truncated to "₹10,7…". Empty states tighten instead of
leaving holes — no cashback centres the top block, no logo drops the tile, no tags and
no bullets drops the middle block and its 19px gap. All of it is D089.

---

## 2026-07-29 · The deals rail became one continuous object, and its light moved under the card

**Scroll offset drives everything (D084).** `DealsCarousel` no longer animates off
its `page` state — one shared value, the live scroll offset, feeds the artwork's
depth (each banner trails its own page by 9% of a page width, scaling and dimming on
the way out, clipped to its page so the next creative can't peek past the screen
edge), the indicator, and the glow's colour. The indicator stopped being a pill
swapped between children: every page renders one capsule that grows from the spec's
dot into the "n/total" pill as it takes the middle of the screen, its distance
wrapping now that the rail wraps. Auto-advance is a timed scroll on a new
`easing.spatial` curve (`timingTravel`) rather than the platform's fixed ease, one
page per move, held off for six seconds after a touch — and the pages are rendered
twice, so advancing off the last banner is a one-page move onto an identical banner
instead of a rewind across the whole strip. Two web findings shaped the result:
`pagingEnabled` becomes CSS scroll-snap, which re-quantises every frame of a
programmatic scroll (the travel collapsed into an instant jump), so on web the rail
scrolls freely and settles to the nearest page on the same curve; and a travel that
gets replaced must not release the rail, or the driver drops 200ms into a 600ms
move. Measured frame by frame on the built page: 52–53 frames per 525–534ms travel.

**The bloom sits under the artwork now (D084).** `bottomBloomFill` replaces the
centred glow for this rail — wide, low and light (peak 0.36 against 0.95), centred
near the bottom of its bed so the colour rises out of the whitespace under the
banner instead of hiding behind an opaque PNG, with a short fade dissolving its
bottom into the page so D077's no-spill-downward rule still holds. `radialFill` grew
explicit ellipse radii to make an off-centre light possible at all.

**Trending pills joined the pill system (D085).** The warm chips took the category
pill's own treatment — white → tint gradient under a hairline — in warm rather than
cobalt, with `trendingBorder` derived from `borderSubtle`'s own step down from its
surface. The Trending head's flame gif went to 30×30 with a tighter gap, since the
art carries its own margin.

## 2026-07-30 · The context audit went green, and two animation bugs came out of it

**`check-context` reports OK for the first time (D113).** Clearing it turned up two
real defects behind Reanimated's strict-mode warnings: `HeroBleed` drove `opacity` from
both an `entering={FadeIn}` and its scroll-fade style on one view, so the bloom-in and
the fade fought over the property; and `LoopRail` published its measured copy width by
writing a shared value in the render body, which let the UI thread read a stale width.
The audit's own two items went with them — the last colour literals moved into tokens
(`palette.shadowInk`, `SUGGEST_TILE_TONES`, `LIVE_BADGE`), and the twelve modules with
no doc header went to zero: six already had prose sitting where `gen-map` cannot see it
(a type export or a const between the comment and the function, or an export named
`RecoveryScreen` in `Recovery.tsx`), so those were hoisted to the top of their file
rather than rewritten; `Badge`, `atoms`, `ResultCards` and `Root` had none and got one.

**Also recorded (D114):** reloading Expo Go over a live runtime invents
`Cannot find native module 'ExpoAsset'` and `"main" has not been registered`. Terminate
the app first — a clean relaunch of the same commit is silent.

## 2026-07-29 · The type-ahead became one ranked list

**No headings, every match shown (D088).** Nine labelled groups cost ~28px a heading
and put the ninth result type three screens down. The list is now ranked by likely
intent — stores, product completions, offers, campaigns, categories, cards, loans,
savings — with a faint `aura.bg` hairline where the type changes and nothing else
between rows. Product rows lead with a single rolling disc of the SKUs that completion
returns, because three 24px discs in a cluster were too small to read as products.
Per-type caps and a "See all 4 stores →" row were tried and dropped the same day: on a
four-store catalog that spent a row to hide two.

## 2026-07-29 · The type-ahead got one text baseline and a shape system

**One 48px lead per row (D087).** Store tiles, card renders, category circles and
query glyphs each had their own width, so four result types started their titles at
four different x. Every lead now centres in a shared `SUGGEST_LEAD` box — measured at
`textX=60` on all eighteen rows — which frees the artwork's silhouette to carry the
type instead: a products completion leads with an overlapping cluster of the three
SKUs that query actually returns, discs and brand tiles share one hairline, and the
one-row "Co-branded Cards" group folded into Credit Cards.

## 2026-07-29 · Trending became two drifting rails

**Two lines at any pill count (D086).** Adding the loans and savings verticals took
Trending to seven pills, which — at 44px tall with a 12px gutter — wrapped to four
rows. `motion/LoopRail.tsx` replaces the wrapping row: children laid out three
times, parked in the middle copy, offset normalised into `[W, 2W)` each tick, so the
drift never reaches an end and neither does a drag, in either direction. Two rails
carry the pills at one speed in opposite directions (±10 px/s), over a copy count
derived from the viewport (`ceil(vw / W) + 3`) — with a fixed three, a set narrower
than the screen put the wrap target past the scroller's clamp and the reversed rail
sat frozen at the end. The disc also went to 40px in a 52px pill, rolling over 600ms
on a 6–11s beat. The savings pill reads "savings account" but
commits the full `REAL_CASES` key, and reel resolution now answers a vertical query
from its vertical alone — the long savings phrase had been matching a product
keyword and rolling headphones.

## 2026-07-29 · Trending pills lead with a rolling SKU disc

**The search glyph became merchandising (D081, D082).** Each Trending chip now
opens with a 32px circular product disc that rolls up to the next SKU on its own
slow random beat, and every chip answers a press with the same scale spring the
primary button uses. The reel runs on one monotonic step clock with the slot
positions derived by modular arithmetic (`d = (i - p) mod 2`), so a dropped
animation callback can't walk a layer out of frame — the bug that emptied all five
circles before the arithmetic replaced the callback-driven "recycle" step. Content
comes from the app's own resolvers in a new `data/trendingPills.ts`, narrowed to
the top hit's brand so "iphone 16" rolls Apple and never a Galaxy that merely
matched the shared `phone` keyword; travel and cards, which have no catalog SKUs,
roll their destination brands and their real card renders. The disc carries a real
inset well (`thumbWellShade` / `thumbWellSheen` / `thumbWellRing`) and stands in a
44px pill — the one pill in the app that is not `PILL_HEIGHT`, since 32 + 6px of
air does not fit in 36.

## 2026-07-29 · The AI band's air moved under the curve

**16 above, 44 below (D075).** The web-search band sat 40px below the deals
carousel and its copy sat 12px under the sheet's curved edge, which stacked ~92px
of unbroken white above the curve and left the AI pitch reading as the sheet's
last line instead of the AI surface's first. The band's `marginTop` is back to 16
(superseding the +24 in 8bfa427) and a new `SHEET_CLEAR` constant (12 + 32 = 44)
separates the curve from the first line of text in **both** the pitch and the
results heading, so the heading holds its position against that edge when the
band changes state. Measured per D073 rather than D014's simpler recipe, because
the band carries a `FadeInDown`: the load event was held open with a slow
subresource while a real-time probe polled `getBoundingClientRect` until the value
repeated 8 times, then painted it into a fixed overlay for a plain screenshot —
`deals→band=16`, `sheetEdge→text=44`, agreeing with the virtual-time reading.

## 2026-07-29 · The welcome-bonus gift got filled in

**Solid at the call site, regular in the map (D074).** At 10px the outline gift on the
new-user chip was a few hairlines over pale green and read as a smudge, so
`StoreHero`'s chip now passes `weight="solid"` — the override `Icon` already has for
exactly this. `ICON.gift` stays `regular`, because its other consumer is the Home
clone's bottom tab bar, where the glyph sits at 18px beside four other outline tabs
and a filled one would break a row matched to the production app. Checked the bundled
FA6 Pro Solid face actually carries U+F06B with fontTools before trusting it (a
missing code point renders tofu, not a fallback), then confirmed on the built page
that the chip's glyph computes `FA6Pro-Solid`.

## 2026-07-29 · A wider catalog grid was attempted and reverted

**The container is ~426px wide inside a 390pt frame (D083).** Widening the store
tiles to sit on a 16px gutter failed four ways — measuring the grid, measuring the
scroller, clipping the screen root and measuring that, and a measurement-free
percentage basis — each overflowing the third column off-screen, because every one of
them derives from a box whose width already includes the page padding twice.
`CatalogViewAll` is back to fixed 96px tiles with `space-between`. The finding worth
keeping: the ~26-31px gutters in that grid are the phantom width spread across two
gaps, not a chosen value, and the fixed-width tiles are what have been hiding it.

## 2026-07-29 · The hero's light pooled where nothing needed lighting

**Its own orb layout (D080).** `AuraField` gained an optional `specs`, and the
full-bleed hero passes `HERO_ORBS` — five centres between y 120 and 300, on the brand
logo and the cashback figure, with tighter amplitudes so they drift within the cluster.
The shared `ORBS` set anchors its centres to the box's CORNERS, which suits a
control-sized card but in a 620px scene left two orbs below the fold and the rest up
behind the search bar. With `scale` 1.25 and peaks to 0.85 each pool reaches ~184px and
covers the logo → figure band, still fading before the dissolve. The AI band and voice
sheet keep the corner layout.

## 2026-07-29 · The hero's blobs became white light instead of brand colour

**Colour-on-colour was the wrong premise (D079).** Two rounds went into making
brand-hued orbs visible on a wash of their own hue — a wider hue fan (D075), then a
lightness band (D078) — when the orbs only ever had one axis to separate on, because
they inherit the wash's hue by construction. `brandOrbFan` now returns five bright
near-white pools (brand saturation 0–0.16 at lightness 0.95–1.0, peaks 0.62 → 0.36).
White separates from any tinted wash on any brand, and it lifts the field rather than
adding more of the colour the page already has. Composited over the real washes that
is 14–31/255 of lightening on both Myntra and Flipkart, against the 0.32 mean the
coloured fan achieved. The dead hue-fan helpers went with it.

## 2026-07-29 · Why Myntra had no blobs but Flipkart did

**A lightness collision, not a broken animation (D078).** `deepenTint` amplifies a
brand tint's chroma and leaves its lightness untouched, so a bright tint deepens to
something very pale — Myntra's `#ff3f6c` lands at L 0.765, the same lightness as the
wash painted under it. Same hue by construction, same lightness by accident: the orbs
were invisible at any alpha, which is why tripling their peak moved the page by a mean
of 0.32/255. `fanHue` now clamps every orb into L 0.44–0.62, so they sit at 0.56–0.68
against a 0.76+ wash on every brand. Also learned the hard way: **radial gradients do
not render in the web export at all** (a solid-colour probe painted, an identical
`radialFill` probe did not), so no headless screenshot can ever verify orb work — which
is what disguised this as a stalled clock for several rounds.

## 2026-07-29 · The hero's blobs were three copies of one colour; the deals glow stopped being cut

**The fan was collapsing (D075).** With the wash halved and the orbs strengthened
the hero still read as flat pink, and the reason was in `fanHue`, not the tuning:
a brand hue sitting at the edge of its family arc — Myntra's `#ff3f6c` is 344°, 4°
from the top of the warm arc — had every negative offset clamp to zero rotation, so
three of the five orbs came out the SAME hue as each other and as the wash. Nothing
that is the colour of its background can read as a blob. `fanHue` now flips
direction when a side is boxed in, and a `FAN_LIFTS` lightness fan separates the
orbs without adding chroma. Wash alpha 0.5 → 0.3 and peaks back down to
`[0.34 … 0.20]` per the "less pink" note: measured background chroma 43.8 → 26.3,
spatial sd 21.6 → 13.0, against 8.8 / 4.9 for the original field. The clock stall
is still open — `prefers-reduced-motion` and a disabled sibling clock have both been
ruled out by measurement.

**The deals glow stopped being cut, and the band moved up (D077).** The Expand
Search band paints an opaque sheet right under the deals rail, so the glow's
downward spill was covered instead of seen and ended in a hard line; its bottom
reach is now 8px instead of 64, and the band's own top margin 8 instead of 16,
which also closes the ~60px of dead white under the pagination dots.

## 2026-07-29 · The hero field got colour and contrast; web cards name their shop

**Half the wash, five hues, smaller-but-faster orbs (D075).** `HeroBleed` paints
its flat tint at 0.5 alpha and drives a new five-hue `brandOrbFan` — each hue
clamped inside the brand's own family, so D060's one-temperature rule survives —
through `AuraField`'s new `amp`/`scale` knobs (2.2 / 0.8) at rate 1.6. The first
attempt (2× alpha, 1.3× size) was wrong and measured so: five 320px orbs already
blanket a 500px scene, so it just doubled the field's mean chroma (31 → 62) into a
stronger FLAT wash. Shrinking the orbs to leave gaps and swinging them further is
what buys legible structure — final background chroma 43.8 at spatial sd 21.6,
versus 8.8 / 4.9 before. **Open:** in the headless harness the Aura clock stalls at
~480ms (orbs byte-identical at t=4/8/12s, reduced-motion false, rAF at 118fps), so
the drift may not be running at all; `useFrameCallback` is shared with ExpandSearch
and VoiceBlobs, so it was left alone pending a check on a real device.

**The status-bar strip whitens with the search bar (D069, amended).** The white
veil was inside the `Platform.OS === 'web'` branch, so on a device the wash kept
tinting the real status bar while the bar beneath it had already gone white. It is
now a plain layer sized to `STATUS_BAR_H` on web and `insets.top` on native,
declared between the backdrop and the status bar so the clock and icons still
paint over it, and sharing one opacity with the search bar's underlay.

**Web-search cards say where to buy (D076).** `ResultItem.retailer` — set only by
the web feed, from a category → `storeTiles` merchant map on the feed's existing
stable hash — renders as `ProductCard`'s last row: hairline, 14px mark, "on Nykaa"
in muted 10px. Catalog rails and category pages share `ProductCard` and are
deliberately untouched, because the shop is only news on a Google-Shopping result.

## 2026-07-29 · The store hero became a full-bleed scene, and its CTA took the sticky-button spec

**The wash left the card (D069).** A new non-scrolling
[HeroBleed](../src/components/HeroBleed.tsx) layer paints the store hero's tinted
Aura wash + brand orbs as one gradient from the device's physical top edge,
dissolving into the page over a 300px white ramp — no box, no radius, no cut
edge. It is mounted in `Root` **above the mock status bar**, outside the clipped
`stageBody`: the first attempt mounted it inside the search layer, where
`overflow: hidden` cut it off at the status-bar line and a flat status-bar tint
had to fake the rest (a flat fill can't stay seamless against a gradient). Every
chrome layer over it goes transparent — status bar, the search-bar wrap (whose
field also turns white), and SearchBody's page fill. `StoreHero` gained a
content-only `bleed` mode that drops its own horizontal padding so the hero lines
up on the page's 20px like every other row (D071); SerpShell's scroller is
transparent and reports its offset through a `serpScrollY` shared value, driving
the backdrop's 0.4× parallax + fade and fading white back in under both chrome
strips on one shared opacity. Orbs bloom in over ~1.4s on mount. Finance/card
heroes and the Gallery preview keep the boxed hero. Verified by measuring the
built page: every hero row lands on `left: 20`, and at scroll 300 both chrome
strips are opaque white with no content leaking beneath them.

**The CTA and the figures matched the Store Page V2.0 spec (D070).** The hero
CTA now reads "Earn Cashback on {Store}" in 16/SemiBold with a 12px solid
arrow-up-right at gap 4 (Figma 1716:74837/74840; the bundled FA subset lacks
e09f, so it's `arrow-up` rotated 45°), under a looping soft-light
[Shine](../src/motion/Shine.tsx) sweep (Shine gained `repeat`/`blend`/`period`).
Hero cashback percentages carry 2 decimals ("6.00%") on the big figure and the
"Up from" chip.

**The count-up rolls again (D068).** On Fabric / RN-web, Reanimated
`animatedProps.text` updates are silently dropped, so the hero figure never
animated on page load. `CountUp` now re-renders a plain `<Text>` from a rAF loop
(the `CountUpText` mechanism) behind the same sizer-overlay layout.

---

## 2026-07-29 · The Myntra tile lost its wordmark; the hero figure got air

**Symbol only, and centred by geometry rather than by a nudge (D066).**
`BRAND.myntra` now points at `assets/brands/myntra-mark.png`, the M cropped out of
the full lockup at the widest gap in the image's own alpha column-profile (the mark
ends at x 719 of 1520; the word starts at 786), tight to its ink box at 720×495. The
word was doing two bad things at once: repeating the store name already set in 22px
beside the tile, and — as a 3.07:1 image in an 88×60 box — making the art width-bound
under `contain`, which pinned the mark hard left with the tile's right half spent on
type. At 1.45:1 it is height-bound, so `BrandThumb`'s existing centring is all that's
needed and no component changed. The original PNG stays as provenance.

**And the big cashback number stopped touching its own words (D067).** In
[StoreHero](../src/components/ResultCards.tsx) the qualifier now clears 12px above
the figure (was 6), "Cash Back" sits 8px off it (was 4), and the label went
`heading18SemiBold` → `heading22SemiBold`. The 52px figure tracks at -0.52 and ends
on a `%` whose open counter reads as space that isn't there, so 4px let the "C" sit
against it; and at 18px the label read as a caption on the number rather than the
other half of the phrase. Verified per D014 on the Myntra hero — 12.00 above, 8.00
between, label computed 22px.

## 2026-07-29 · Credit-card USP rows stopped wrapping

**One line each, ellipsised (D065).** The Flipkart card's two bullets both ran to two
lines at phone width, which pushed the fee strip and the CTA down — the card's height
was tracking how wordy the feed was rather than what the card contains, so two cards
in the finance stack ended on different baselines. `BenefitRow` in
[CreditCard](../src/components/CreditCard.tsx) now renders `numberOfLines={1}`, which
also moves the component toward the spec it was transcribed from (D061): the mock
clips that copy at 280.4px, and the fluid card measures 280px of room for it on a
390pt device. Verified per D014 — both rows come back 14px tall (one 12/14 line),
`white-space: nowrap` with `text-overflow: ellipsis`, and genuinely over-flowing
(304px and 325px of text in 280px), plus a screenshot of the card mid-page.
FinanceCard's loans/savings rows still allow two lines; they weren't the surface in
question.

## 2026-07-29 · Expand Search results became an endless 2-up grid

**From a rail of curated matches to a browse surface that never runs dry (D063).**
Tapping "Expand Search with AI" now collapses the band's entire pitch into one
minimal heading — compact `AiMark`, "From across the web", a count that ticks up —
and streams results one at a time into a vertical two-column grid of floating white
cards over the aura field. The feed is a new module,
[data/webResults.ts](../src/data/webResults.ts): a deterministic, endless pager
over the real catalog (query matches lead, the remainder rotates on a query-seeded
offset, indices wrap the pool) that continues the curated whey seed and dedupes
against it by title and photo asset. Mapped merchants (~2/3, stable per product)
keep their catalog cashback; the rest carry `{ type: 'none' }` — so the grid mixes
cards with and without a cashback pill, the honest Q-010 behaviour (D032). Infinite
growth rides the page's own scroll: SerpShell pulses a registered load-more within
480px of the page end, the band extends only after the previous batch has fully
landed, and a two-cell shimmer frontier marks where the next cards will appear.
`ProductCard` also learned to scale its photo box to the 132×96 ratio when widened,
so grid cards fill instead of letterboxing. Verified per D014: headless build,
scroll probe pulsing the page bottom, screenshots of the sheet-edge transition,
heading, mixed-cashback cells, and a count grown 8 → 20 across three pulses.

**Then the cards stopped stretching, and every one of them got a Final Price
(D064).** The grid became two independent columns rather than one wrapping row —
a wrapping row stretches each cell to the tallest in its row, so a card without a
cashback pill carried a hole of white space to match its neighbour. Items
alternate into the columns by index parity, so the streamed order still reads
left → right while each card is exactly as tall as its own content and the columns
pack independently. In the same pass `ProductCard` began deriving a Final Price
whenever it has a price at all — price − cashback where there is cashback, the
price itself where there isn't — so an unmapped merchant's card ends on the same
labelled payable number as every card beside it, and the only height difference
left between two cards is the cashback pill, which is real information. That one
is app-wide: the SERP products rail and the category grid gained the line too.

## 2026-07-29 · The credit-card card, transcribed from Mini App Main

**The spec's own numbers, colours and vectors (D061, D062).** [CreditCard](../src/components/CreditCard.tsx)
is rebuilt against Figma "Mini App Main" `9RfW1gNewOnFDsNqaHsRoF` frame 4007:57107
(component 731:33245, five instances): artwork 132×84 r6 bottom-aligned with the
name and a CK-Orange cashback pill (100°, 0.2 → 0.08 → 0.02), USP tags on a 0.859px
cool stroke over a 4%-alpha blue→white wash, USP rows built from the frame's **whole**
"Card Icons" set (714:32723 — Cashback, Discounts, Food, Fuels, Lounge, Vouchers,
reward, the variant names doubling as the mapping), and a closing strip that is
either the two fee columns — Annual then Joining, split by a 45px hairline that fades
to white at both ends — or the cream→mint LIFETIME FREE band, both ending in the same
108×40 cobalt-ramp CTA with its 6.14×9.94 chevron. Metrics live in `CARD_SPEC`,
colours in `color.card`, the shadow in a new `elevation.card`; the vectors are inlined
byte-for-byte as react-native-svg in [icons/cardIcons](../src/icons/cardIcons.tsx),
which also retires the `#000000` literal this component used to carry.

The pill is orange even though every cashback figure in the app went cobalt the day
before (D056) — the spec paints the CK Orange variable, and matching it was the ask;
the cobalt tokens stay in place, so nothing else moved. Three knowing deviations:
the card is fluid rather than 328 wide, its insets are symmetric where the mock's
frames drift 2-8px, and "LIFETIME FREE" takes its gradient's mid colour because RN
can't gradient text without a mask layer. Separately, the cards page lost its tab row
(D062): Credit Cards vs Co-branded partitioned nothing, since there are no
co-branded cards. Verified by driving the built page over CDP on a real clock and
comparing both strip variants against the Figma renders side by side.

## 2026-07-29 · The store hero's aura got a second hue

**One colour more, same temperature (D060).** The hero's drifting field used to be the
brand tint at five alphas, which could only get brighter and dimmer; two of its five orbs
now carry a companion hue derived from the tint — the same hue rotated 34° inside its own
temperature family, a touch lighter and slightly weaker in alpha so the brand still leads.
Cleartrip's orange field now shifts through amber where the orbs cross, Croma's teal
through green, and a colourless brand's sky fallback through indigo; nothing warm ever
gains a cold highlight, which is what would have made the field read as two lights instead
of one. `companionRgb` picks the rotation direction by how much arc is left, so a hue
already at its family's edge (a yellow brand) turns back toward orange rather than
crossing into chartreuse. Verified on the Cleartrip and Croma heroes at several points in
the 16s loop, clipping the capture to the hero card at 2× — the field is too subtle to
judge in a full-stage screenshot, and (cf. D035) the frames were taken over CDP in real
time, not under `--virtual-time-budget`.

## 2026-07-29 · The tab pills dock under the search bar

**One prop, and the rows that had to be flattened for it (D059).** Scrolling a SERP
past its pills now pins the tab row directly under the shared search bar:
[SerpShell](../src/components/SerpShell.tsx) passes the row's index as
`stickyHeaderIndices`, which RN implements natively and RN-web maps to
`position: sticky; top: 0` — so there is no scroll handler, no measured offset and no
duplicate TabBar holding a second copy of `active`. Getting there meant assembling
the page's rows as a flat array (context → hero → all-results line → tabs → sections
→ Expand Search → tail spacer) with falsy rows dropped as they're pushed, because
sticky indices address direct children and the old fragment buried the bar inside
one; nulls are filtered rather than left in place since native counts children with
`Children.toArray` and RN-web with `Children.map`, which disagree about them.
[TabBar](../src/components/TabBar.tsx)'s wrap also had to go opaque
(`color.surface`) — full-bleed and transparent, the sections scrolled visibly through
the pills. The gallery's static previews opt out. Verified by driving the built page
over CDP on a real clock (Reanimated doesn't settle under `--virtual-time-budget`):
at `scrollTop: 700` the pill row moved from 488px down the scroller to 8px from its
top edge, wrapper `position: sticky`, `top: 0px`, fill white.

## 2026-07-28 · The hero CTA went orange

**One button, one new token (D058).** The store hero's Sign Up & Earn / Shop & Earn
button now paints `color.aura.ctaHero` (`palette.orange` #ff6d1d) instead of the
cobalt `color.aura.cta`, which completes the rule "Cashback went blue" already
stated — cashback = cobalt, CTA = orange — by recolouring the last cobalt CTA left.
It took a new semantic role rather than a repoint because `aura.cta` is shared by
the mic, the SERP tab pills, the facet chips, the sheet checkmarks, the user-type
toggle and every inline "Shop & Earn ›" link. Verified on the built page by seeding
the controller onto the Amazon hero and shooting it headless (D011, D014), then
restoring the seed.

## 2026-07-28 · The tab hairline got its own air

**8 above the pills, 16 below (D057).** [TabBar](../src/components/TabBar.tsx)'s
scroll container traded `paddingVertical: space.s` for `paddingTop: space.s` +
`paddingBottom: space.m`, so the divider no longer runs along the pill's own edge —
with no shadow on the pill and a pale cobalt wash inside it, 8px read as one piece of
chrome rather than as the end of the bar. The row stays tight to the context line
above it, and nothing below the bar moves: this is padding inside a bar that still
owns no margin (D036), so the hairline→section-title distance is the same 16px
`sectionFirst` margin from D055. Measured on the built page rather than eyeballed
(D014): pill 36.00, above 8.00, below 16.00, hairline 1.00.

## 2026-07-28 · Pills went 36, and section spacing became the number in the style

**Three measured numbers, from the designer's spec on the "Flip" SERP: 12px title→
elements, 16px tab-divider→title, 36px pills everywhere (D054, D055).** The pill
height was the easy one — `PILL_HEIGHT` in
[theme/tokens.ts](../src/theme/tokens.ts) is now a plain `36` instead of an alias
for `space.xxl`, so the SERP tabs, the three filter-chip rows, Explore's
recent/trending/more chips and the category chip all moved together, and `PILL_SLOP`
recomputed to keep the ≥44px tap target.

The spacing needed the header rebuilt. `SectionHeader`
([atoms.tsx](../src/components/atoms.tsx)) had `paddingVertical: space.s` *and* a
View-all `Pressable` with `minHeight: 44`, which stretched the whole row to 44 and
let `alignItems: center` split the leftover 20px above and below the title — so the
gap a designer actually measures was 18px on any section with a View-all and 8px on
any without, before the body's own padding was added on top. Now the header is just
its title's line box, keeps its ≥44px target from `hitSlop` alone (the same pattern
TabBar's pills use), and OWNS the gap to its body through a `gap` prop defaulting to
12. [SerpShell](../src/components/SerpShell.tsx) nets each body's shadow-clearance
padding off that gap (`BODY_TOP_INSET`: rails 4, coupon rail 12, cards rail 8), so
12 means twelve *visible* pixels on every section kind — and sets the rhythm above
it: 24 section-to-section, 16 for the first section under the tab bar, which extends
"The SERP tab bar stopped double-spacing the first section" (D036) — the bar still
owns no space, so that one margin IS the hairline→title distance.
[ProductCategory](../src/screens/ProductCategory.tsx) gave up its `block`
`gap: space.s` for the same reason: two owners of one gap always double it in RN.
Verified with a DOM probe on the built page rather than by eye (D014) — hairline→
title 16.00, title→first store tile 12.00, all four pills 36.00.

## 2026-07-28 · Cashback went blue

**One colour for the number, everywhere (D056).** Every cashback figure now reads
cobalt #0036da instead of the W4 design's orange #e55a0e — the type-ahead rows,
the store hero's count-up, the product card and credit-card pills, the similar-cards
rail, the Explore destination tiles and the category page's "Earn up to" hero. The
warm gradient tints those numbers sat on went cool with them: `aura.cashbackPillFrom`
and `card.pillFrom` are both cobalt/50 #ebf0ff now (was peach #fff0e8 / saffron
#ffe6d6). The change is one token repoint plus two components that had hard-wired
`color.actionPrimary` into their pill (`CreditCard`, `SimilarCardsRail`); the legacy
orange/peach/saffron entries stay in tokens.ts, commented as superseded. Verified
across the type-ahead, store page, card SERP, product view-all and a category page
by driving the served preview build over CDP in real time — Reanimated does not
settle under `--virtual-time-budget`, so the nav-tap screenshots need a real clock
(cf. D035).

## 2026-07-28 · Voice search got the Siri/Gemini orb

**The meter became a gradient-blob sphere (D053).** The voice sheet's flat orange
disc — five band bars inside it, two orange pulse rings behind it — is gone, replaced
by [motion/VoiceBlobs.tsx](../src/motion/VoiceBlobs.tsx): a 112px circular-clipped
core (aqua → indigo → violet base ramp, four near-opaque blobs drifting inside it, an
orbiting specular, a lit rim and a bottom inner shade) standing in a 236px field of
three soft aura blobs that bloom outward as the room gets louder. Each blob rides one
of `useVoiceLevel`'s nine bands and is thrown along its own radius by it, so a
sibilant moves the magenta blob while a vowel swells the aqua one; `level` also
brightens and scales the aura, scales the core 8%, and speeds the whole field up by
retiming the shared clock rather than restarting anything.

It is built on the existing Aura engine rather than beside it — same
`useAuraClock`, same integer harmonics of `AURA_LOOP`, and one new additive
`softOrbFill` export so the blobs feather on the same eight-stop ramp as every other
AI surface (D017: real radial gradients, never a blur filter, every falloff ending on
its own hue at zero alpha). The orb holds its silhouette through all six phases and
only its glyph changes, so `settling`'s green disc went away and the hint line
dropped to `labelMuted`; `color.voice.micBg`/`pulse` are kept, not repurposed. New
tokens: `color.voice.orb*` plus the `VOICE_*` sizes and hue sets. Verified headless
per D014 by driving the built bundle's mic button and shooting the listening,
hearing, settling and processing beats — the seeded controller belonged to a parallel
chat, so the build went to a scratch directory and `Root.tsx` was never touched
(D011).

## 2026-07-28 · "loans" and "cards" answer with their vertical, not the recovery screen

**Intent routing between the hand-written cases and the catalog (D052).** Searching
`loans` or `cards` matched no store and no product, so `buildSerp` returned
undefined and the two broadest BFSI queries landed on recovery. `Root`'s `model`
memo now falls through `REAL_CASES` → `financeSerp` → `buildSerp`, where
`financeSerp` word-boundary matches the vertical's word (`loan`/`loans`,
`card`/`cards`, so "personal loans" and "credit cards" resolve too) onto two new
broad cases in [realData.ts](../src/data/realData.ts): `caseLoans` and `caseCards`.
Both reuse the existing `caseAmountLoan` / `caseCredit` sections item-for-item and
only restate the context line, so no rate, EMI or fee is duplicated and the
View-all verticals still count 3 loans and 3 cards. Exact keys still win first —
`sbi cashback card`, `credit` and `₹5,00,000 personal loan` are unchanged — and the
preview nav gained a jump for each new page. Verified by seeding the controller and
screenshotting both queries headless (D011, D014).

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

# CashKaro Search — project guide

Expo (managed) React Native prototype of CashKaro's search experience, run on
device and as a web preview inside a device frame. One hoisted search bar glides
Home → Explore → Typing → results; every result page is composed from one
`SerpModel` shape across 13 archetypes.

@AGENTS.md

## Start here (every session, especially with parallel chats)

Several chats work on this repo at once — two were editing it simultaneously on
2026-07-28, and one commit swept another chat's in-progress state into git. To
avoid re-exploring, re-deciding and colliding, do this first:

1. **Find code via [docs/MAP.md](docs/MAP.md)**, not by grepping `src/` — it's a
   generated module → exports → Figma-node → assets → used-by → purpose index.
   Regenerate with `node scripts/gen-map.mjs`. Never hand-edit it.
2. **Read [docs/DECISIONS.md](docs/DECISIONS.md)** before deciding anything
   durable — the convention may already be settled, with the reasoning. **Append
   a `Dnn` entry the moment you make a decision** so the next chat doesn't
   re-argue it or rebuild it differently.
3. **Skim [docs/CHANGELOG.md](docs/CHANGELOG.md)** if you need the story of how
   the current architecture came about.
4. **Obey the hard rules in [AGENTS.md](AGENTS.md)** — tokens-only, full-bleed
   rails, paged-carousel integers, store cards from the Figma tile set. They exist
   because each one was a shipped bug.

### Keep the context current — before you end a turn (hard rule)

Other chats only know what these files say. A change isn't done until they reflect
it:

1. **Added / renamed / removed a module?** → `node scripts/gen-map.mjs`
   (a PostToolUse hook does this automatically; run it yourself if you bypassed
   the tools).
2. **Made any durable decision** — a convention, a data-source choice, a rejected
   approach, an accepted trade-off, a new asset pipeline? → append a `Dnn` entry
   to [docs/DECISIONS.md](docs/DECISIONS.md) (newest-first inside its section,
   additive — never rewrite another chat's entry).
3. **Landed something structural?** → one dated paragraph in
   [docs/CHANGELOG.md](docs/CHANGELOG.md), referencing the `Dnn`s.
4. **Run `node scripts/check-context.mjs`** (a Stop hook also runs it). It reports
   stale context, modules with no doc header, and hard-rule violations. Fix what
   your change caused; don't inherit someone else's backlog silently — if you
   leave a reported item, say so in your reply.

Every new module gets a doc header: a leading `/** … */`, or one immediately above
the export named after the file. That header *is* its MAP.md row, including any
Figma node ids it mentions — so write it for the next chat, not for yourself.

### Parallel-work boundaries

- **One surface = one file.** Stay inside your screen's `src/screens/<X>.tsx` and
  its section components. Disjoint files → no conflicts.
- **Hot shared files are edited additively** — append, never reorder or rewrite:
  [src/Root.tsx](src/Root.tsx) (controller + overlay stack),
  [src/theme/tokens.ts](src/theme/tokens.ts) (add tokens, don't repurpose them),
  [src/data/realData.ts](src/data/realData.ts),
  [src/components/ResultCards.tsx](src/components/ResultCards.tsx). If a shared
  change is unavoidable, log it in DECISIONS.md.
- **Never leave test scaffolding in shared state.** Seeding `Root.tsx` to boot
  into a deep screen is fine *within* a turn; restore it before you finish, and
  diff against `HEAD` first — another chat may have edited the file meanwhile
  (D011).
- **Before restoring any backup you took earlier in the turn**, check whether the
  file changed underneath you. A blind `cp` once reverted another chat's refactor.

## Verify visually before claiming a fix

Layout claims need measurement, not vibes (D014):

```bash
npx expo export -p web --output-dir dist-check   # build
python3 -m http.server 8899 --directory dist-check &
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --hide-scrollbars --window-size=1200,1000 \
  --screenshot=out.png "http://localhost:8899/"
rm -rf dist-check                                # never commit a preview build (D012)
```

For clipping/overflow, inject a probe into the built `index.html` that prints each
scroller's `getBoundingClientRect()` + `scrollWidth`, then read it back with
`--dump-dom`. Chrome's minimum window is ~500px wide, so a narrower
`--window-size` renders 500px and crops it — that's not a layout bug.

## Before finishing

```bash
npx tsc --noEmit                 # must pass
node scripts/check-context.mjs   # map fresh · modules documented · rules hold
```

Report failures you didn't cause rather than fixing them blind — another chat may
be mid-edit (on 2026-07-28 a parallel session's half-applied `Product.sub` field
was failing typecheck; touching it would have collided).

## Run it

```bash
npx expo start            # device (Expo Go) or web
npx expo start --web
```

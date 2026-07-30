import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Image } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { color, type as t, space, radius, MIN_TAP_TARGET, SUGGEST_LEAD, SUGGEST_TILE_TONES, LIVE_BADGE } from '../theme/tokens';
import { Icon } from '../icons/Icon';
import { IconName } from '../icons/iconMap';
import { BrandThumb } from './ImageSlot';
import { RollingThumb } from '../motion/RollingThumb';
import { staggerDelay } from '../motion/motion';

/**
 * Row kinds. Each one's leading artwork is a different SHAPE inside the shared lead
 * box, and that shape is what tells the types apart now the group headings are gone
 * (D087, D088):
 *
 *  - 'store'  → white brand tile + name + cashback (Flat/Up to + blue value)
 *  - 'query'  → a rolling SKU disc (or a grey magnifier when there are no photos to
 *               roll) + "<typed> <completion>" + "in <scope> · N results"
 *  - 'tile'   → coloured icon tile, card render or category circle + title + meta
 */
export type SuggestGroupKind =
  | 'stores'
  | 'products'
  | 'categories'
  | 'credit_cards'
  | 'cobranded'
  | 'loans'
  | 'savings'
  | 'offers'
  | 'campaigns';

export type SuggestRow = {
  kind: 'store' | 'query' | 'tile';
  title: string; // full text; the leading `query` portion is de-emphasised
  logo?: string | number | null; // store thumbnail
  icon?: IconName; // tile icon
  tileImage?: number; // branded artwork filling the toned tile (require id), e.g. BBD badge — Figma 1646:7631
  /** Up to three real SKU photos for a products row — rendered as an overlapping
   *  cluster, the social-proof avatar stack (D087). Two or more, or it's not a stack. */
  stack?: number[];
  image?: number; // illustrated category icon (require id) — overrides the tile
  cardImage?: number; // credit-card artwork (require id), rendered at card ratio 1.58:1
  tileTone?: keyof typeof TILE_TONES;
  cashbackPrefix?: string; // "Flat" | "Up to"
  cashbackValue?: string; // "9%"
  meta?: string; // "in Beauty · 10+ results" / "Category · 800+ products"
  live?: boolean;
  goto?: string; // query to resolve when tapped
  catKey?: string; // categories group: the product category page to open
  /** 0–100 relevance for the typed query, from the one scorer in
   *  `data/matchScore.ts` — what `rank()` orders the whole list by (D115). */
  score?: number;
};

export type SuggestGroup = { kind: SuggestGroupKind; label: string; rows: SuggestRow[] };

/** Tile tones live in tokens.ts — they are colour (AGENTS, D087). */
const TILE_TONES = SUGGEST_TILE_TONES;

/**
 * Suggestions — the type-ahead (W3 · Aura, Figma 1646:7462). ONE ranked list, not the
 * nine labelled groups it started as (D088): a "Go to <store>" shortcut when the query
 * names one outright, the "Search all" pin, then every matching row ordered by how
 * likely a typed query means that type. No headings — a faint hairline marks each type
 * change, every row's leading visual is centred in one `SUGGEST_LEAD` box (D087), and
 * the artwork's shape carries the type. A products row's disc rolls through the SKUs
 * that completion actually returns.
 */
export function Suggestions({
  query,
  groups,
  onPick,
  onOpenCategory,
}: {
  query: string;
  groups: SuggestGroup[];
  onPick: (text: string) => void;
  /** Categories group → the product category page (not a search commit). */
  onOpenCategory?: (title: string) => void;
}) {
  // Dominant exact match → offer a one-tap "Go to <store>" shortcut straight to
  // its result, so the user skips scanning the full type-ahead.
  const q = query.trim().toLowerCase();
  const storesGroup = groups.find((g) => g.kind === 'stores');
  const top = storesGroup?.rows[0];
  const goStraight = top && q.length >= 2 && top.title.toLowerCase().startsWith(q) ? top : null;
  // Ranked once per render — it sorts, so calling it per row (as this did) re-sorted
  // the whole list for every row it drew.
  const ranked = rank(groups);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {/* Go straight to the exact match (primary shortcut) */}
      {goStraight && (
        <>
          <Pressable
            style={styles.goCard}
            onPress={() => onPick(goStraight.goto ?? goStraight.title)}
            accessibilityRole="button"
            accessibilityLabel={`Go to ${goStraight.title}`}
          >
            <BrandThumb uri={goStraight.logo} label={goStraight.title} width={64} height={44} radiusToken={radius.md} style={styles.logoRing} />
            <View style={styles.goText}>
              <Text style={[t.body16SemiBold, { color: color.ckds.ink }]} numberOfLines={1}>
                Go to {goStraight.title}
              </Text>
              {goStraight.cashbackValue ? (
                <Text numberOfLines={1}>
                  <Text style={[t.body12Medium, { color: color.ckds.cta }]}>Shop &amp; Earn · </Text>
                  <Text style={[t.body12Medium, { color: color.ckds.slateMuted }]}>{goStraight.cashbackPrefix} </Text>
                  <Text style={[t.body12SemiBold, { color: color.ckds.cashback }]}>{goStraight.cashbackValue}</Text>
                </Text>
              ) : (
                <Text style={[t.body12Medium, { color: color.ckds.cta }]}>Shop &amp; Earn ›</Text>
              )}
            </View>
            <Icon name="chevron" size={14} color={color.ckds.cta} />
          </Pressable>
          <View style={styles.pinDivider} />
        </>
      )}

      {/* Search-all pin */}
      <Pressable style={styles.pin} onPress={() => onPick(query)} accessibilityRole="button">
        <Icon name="search" size={15} color={color.ckds.fieldIcon} />
        <Text style={[t.body16Medium, { color: color.ckds.ink, flex: 1 }]} numberOfLines={1}>
          Search all for “{query}”
        </Text>
        <Icon name="chevron" size={13} color={color.ckds.fieldIcon} />
      </Pressable>
      <View style={styles.pinDivider} />

      {/* ONE ranked list — no group headings (D088). A hairline marks where the type
          changes; the lead artwork's shape says WHICH type. */}
      <View style={styles.list}>
        {ranked.map((item, i) => {
          const lead = i > 0 && ranked[i - 1].kind !== item.kind;
          return (
            <Animated.View key={item.key} entering={FadeInDown.delay(staggerDelay(i)).duration(180)}>
              {lead && <View style={styles.typeDivider} />}
              <SuggestionRow
                row={item.row}
                query={query}
                onSelect={
                  // A category row browses; every other row commits a search.
                  item.kind === 'categories' && onOpenCategory
                    ? () => onOpenCategory(item.row.catKey ?? item.row.title)
                    : () => onPick(item.row.goto ?? item.row.title)
                }
              />
            </Animated.View>
          );
        })}
      </View>
      <View style={{ height: space.xl }} />
    </ScrollView>
  );
}

function SuggestionRow({ row, query, onSelect }: { row: SuggestRow; query: string; onSelect: () => void }) {
  const tone = row.tileTone ? TILE_TONES[row.tileTone] : null;
  return (
    <Pressable style={styles.row} onPress={onSelect} accessibilityRole="button" accessibilityLabel={row.title}>
      {/* One fixed-width lead for every result type (D087), so the titles share a
          single baseline down the list. Each artwork keeps its own SHAPE inside it —
          that silhouette is what tells the types apart once the group labels go. */}
      <View style={styles.lead}>
        {row.stack && row.stack.length > 1 ? (
          // A products row leads with ONE disc that rolls through the SKUs the query
          // returns — the trending pill's reel at list scale (D088). Three 24px discs
          // in a cluster were too small to read as products at all.
          <RollingThumb images={row.stack} size={SUGGEST_LEAD} />
        ) : row.cardImage ? (
          <Image source={row.cardImage} style={styles.cardThumb} resizeMode="cover" />
        ) : row.image ? (
          <Image source={row.image} style={styles.catImg} resizeMode="cover" />
        ) : row.kind === 'store' ? (
          <BrandThumb uri={row.logo} label={row.title} width={SUGGEST_LEAD} height={34} radiusToken={radius.md} style={styles.logoRing} />
        ) : row.kind === 'tile' && tone && (row.icon || row.tileImage) ? (
          <View style={[styles.tile, { backgroundColor: tone.bg }]}>
            {row.tileImage ? (
              /* Branded artwork clipped to the rounded tile (Figma 1646:7631) */
              <Image source={row.tileImage} style={styles.tileImg} resizeMode="cover" />
            ) : (
              /* Lighter-weight glyph centred in the tile with breathing room */
              <Icon name={row.icon!} size={22} weight="light" color={tone.fg} />
            )}
          </View>
        ) : (
          <View style={styles.slot}>
            <Icon name="search" size={15} color={color.ckds.fieldIcon} />
          </View>
        )}
      </View>

      <View style={styles.rowText}>
        <Text style={[t.body16Regular, { color: color.ckds.ink }]} numberOfLines={1}>
          {highlight(row.title, query)}
        </Text>
        {row.cashbackValue ? (
          <Text numberOfLines={1}>
            <Text style={[t.body12Medium, { color: color.ckds.slateMuted }]}>{row.cashbackPrefix} </Text>
            <Text style={[t.body14SemiBold, { color: color.ckds.cashback }]}>{row.cashbackValue}</Text>
          </Text>
        ) : row.meta ? (
          <Text style={[t.body12Regular, { color: color.ckds.slateMuted }]} numberOfLines={1}>
            {row.meta}
          </Text>
        ) : null}
      </View>

      {row.live && (
        <View style={styles.live}>
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      )}
      <Icon name="chevron" size={13} color={color.ckds.fieldIcon} />
    </Pressable>
  );
}

/**
 * The rank. A type-ahead's job is one tap to the right result, so the list is ordered
 * by how well the query matched — not by the data's own group order (D088) and no
 * longer by a fixed type order either (D115). Each row carries a 0–100 `score` from
 * the one scorer every type is measured with, so the type the query NAMES leads:
 * "credit" puts the credit cards first, "myntra" the store, "whey" the product
 * completions. Types stay contiguous — a 1px hairline marks each change and the lead
 * artwork's shape says which type it is — and a type is placed by its best row.
 *
 * `RANK` survives only as the tie-break prior, for the case where two types match a
 * query equally well and something has to go first.
 */
const RANK: SuggestGroupKind[] = [
  'stores',
  'products',
  'offers',
  'campaigns',
  'categories',
  'credit_cards',
  'loans',
  'savings',
  'cobranded',
];

type RankedItem = { key: string; kind: SuggestGroupKind; row: SuggestRow };

function rank(groups: SuggestGroup[]): RankedItem[] {
  const ordered = groups
    .filter((g) => g.rows.length)
    .map((g) => ({
      g,
      best: g.rows.reduce((m, r) => Math.max(m, r.score ?? 0), 0),
      prior: RANK.indexOf(g.kind),
    }))
    .sort((a, b) => b.best - a.best || a.prior - b.prior);

  const out: RankedItem[] = [];
  for (const { g } of ordered) {
    [...g.rows]
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .forEach((row, i) => out.push({ key: `${g.kind}-${i}-${row.title}`, kind: g.kind, row }));
  }
  return out;
}

/**
 * De-emphasise the typed prefix; bold the completion (§ suggestions spec) — but only
 * when the row IS a completion of what was typed. Since the rank became relevance-led
 * (D115) a query can match in the MIDDLE of a title ("credit" → "Axis Flipkart Credit
 * Card"), and greying everything up to it read as the row's own name being struck out.
 * A mid-string match bolds the matched run instead, which is what it is: the reason
 * this row is here.
 */
function highlight(text: string, query: string) {
  const q = query.trim().toLowerCase();
  const lower = text.toLowerCase();
  const at = lower.indexOf(q);
  if (!q || at === -1) return <Text style={{ color: color.ckds.ink }}>{text}</Text>;
  if (at === 0) {
    return (
      <Text>
        <Text style={{ color: color.ckds.slateMuted }}>{text.slice(0, q.length)}</Text>
        <Text style={[t.body16SemiBold, { color: color.ckds.ink }]}>{text.slice(q.length)}</Text>
      </Text>
    );
  }
  return (
    <Text>
      <Text style={{ color: color.ckds.ink }}>{text.slice(0, at)}</Text>
      <Text style={[t.body16SemiBold, { color: color.ckds.ink }]}>{text.slice(at, at + q.length)}</Text>
      <Text style={{ color: color.ckds.ink }}>{text.slice(at + q.length)}</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: color.surface },
  content: { paddingTop: space.s12, paddingBottom: space.l },
  pin: { flexDirection: 'row', alignItems: 'center', gap: space.s12, paddingHorizontal: space.m20, paddingVertical: space.s12 },
  pinDivider: { height: 2, backgroundColor: color.ckds.bg, marginBottom: space.m },
  goCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s12,
    marginHorizontal: space.m,
    marginBottom: space.s12,
    paddingHorizontal: space.s12,
    paddingVertical: space.s12,
    borderRadius: radius.lg,
    backgroundColor: color.ckds.bg,
  },
  goText: { flex: 1, gap: space.xxs },
  list: { paddingHorizontal: space.m20 },
  /** Where the result TYPE changes. One faint hairline instead of a 28px heading
   *  (D088) — in `aura.bg`, the same near-white the pin dividers use, because at
   *  `aura.border` it read as a rule drawn across the list rather than as a seam. */
  typeDivider: { height: 1, backgroundColor: color.ckds.bg, marginVertical: space.s },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.s12, paddingVertical: space.s, minHeight: MIN_TAP_TARGET },
  /** The one leading box every row type is centred in — see D087. */
  lead: { width: SUGGEST_LEAD, alignItems: 'center', justifyContent: 'center' },
  /** The same hairline the stack discs carry, so a logo tile and a SKU disc read as
   *  one family of objects. Passed through `BrandThumb`'s own `style`, which leaves
   *  ImageSlot's W4 white-tile spec untouched on every other surface. */
  logoRing: { borderWidth: 1, borderColor: color.ckds.border },
  rowText: { flex: 1, gap: space.xxs },
  slot: { width: 40, height: 40, borderRadius: radius.sm, backgroundColor: color.ckds.bg, alignItems: 'center', justifyContent: 'center' },
  tile: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  // Branded artwork oversized + offset so the badge centres in the tile, clipped by
  // the tile's overflow:hidden (Figma 1646:7631: 60×61 at -8,-15 inside a 44 window).
  tileImg: { position: 'absolute', width: 60, height: 61, left: -8, top: -15 },
  catImg: { width: 44, height: 44, borderRadius: 22 }, // illustrated category icon, clipped to circle
  // Credit-card artwork at its ~1.58:1 asset ratio, sized to the shared lead box.
  cardThumb: { width: SUGGEST_LEAD, height: 30, borderRadius: radius.xs },
  live: { backgroundColor: LIVE_BADGE, borderRadius: radius.full, paddingHorizontal: space.s6, paddingVertical: space.xxs },
  liveText: { ...t.caption10SemiBold, color: color.textInverse, letterSpacing: 0.4 },
});

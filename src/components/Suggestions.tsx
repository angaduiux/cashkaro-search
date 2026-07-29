import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Image } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { color, type as t, space, radius, MIN_TAP_TARGET } from '../theme/tokens';
import { Icon } from '../icons/Icon';
import { IconName } from '../icons/iconMap';
import { BrandThumb } from './ImageSlot';
import { staggerDelay } from '../motion/motion';

/**
 * Suggestions screen — matches W3 · Aura (Figma 1646:7462). A result-type-grouped
 * type-ahead: a "Search all" pin, then grouped rows (Stores, Products, Categories,
 * Credit Cards, Co-branded, Loans, Savings, Offers, Campaigns). Each group routes
 * to that result-page type, so it doubles as the "what leads where" guide.
 *
 * Row kinds:
 *  - 'store'  → 40px brand thumbnail + name + cashback (Flat/Up to + blue value)
 *  - 'query'  → 40px slot + "<typed> <completion>" + "in <scope> · N results"
 *  - 'tile'   → 44px coloured icon tile + title + meta (+ optional LIVE badge)
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
  image?: number; // illustrated category icon (require id) — overrides the tile
  cardImage?: number; // credit-card artwork (require id), rendered at card ratio 1.58:1
  tileTone?: keyof typeof TILE_TONES;
  cashbackPrefix?: string; // "Flat" | "Up to"
  cashbackValue?: string; // "9%"
  meta?: string; // "in Beauty · 10+ results" / "Category · 800+ products"
  live?: boolean;
  goto?: string; // query to resolve when tapped
  catKey?: string; // categories group: the product category page to open
};

export type SuggestGroup = { kind: SuggestGroupKind; label: string; rows: SuggestRow[] };

const TILE_TONES = {
  purple: { bg: '#f3e8ff', fg: '#7c3aed' },
  blue: { bg: '#e8eeff', fg: '#0036da' },
  indigo: { bg: '#eef2ff', fg: '#4670f6' },
  orange: { bg: '#fdf0e4', fg: '#e55a0e' },
  teal: { bg: '#e6f4f1', fg: '#0f766e' },
  green: { bg: '#e7f7f1', fg: '#047857' },
  red: { bg: '#ffe9e9', fg: '#d41000' },
} as const;

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
  let idx = 0;
  // Dominant exact match → offer a one-tap "Go to <store>" shortcut straight to
  // its result, so the user skips scanning the full type-ahead.
  const q = query.trim().toLowerCase();
  const storesGroup = groups.find((g) => g.kind === 'stores');
  const top = storesGroup?.rows[0];
  const goStraight = top && q.length >= 2 && top.title.toLowerCase().startsWith(q) ? top : null;

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
            <BrandThumb uri={goStraight.logo} label={goStraight.title} width={64} height={44} radiusToken={radius.md} />
            <View style={styles.goText}>
              <Text style={[t.body16SemiBold, { color: color.aura.ink }]} numberOfLines={1}>
                Go to {goStraight.title}
              </Text>
              {goStraight.cashbackValue ? (
                <Text numberOfLines={1}>
                  <Text style={[t.body12Medium, { color: color.aura.cta }]}>Shop &amp; Earn · </Text>
                  <Text style={[t.body12Medium, { color: color.aura.slateMuted }]}>{goStraight.cashbackPrefix} </Text>
                  <Text style={[t.body12SemiBold, { color: color.aura.cashback }]}>{goStraight.cashbackValue}</Text>
                </Text>
              ) : (
                <Text style={[t.body12Medium, { color: color.aura.cta }]}>Shop &amp; Earn ›</Text>
              )}
            </View>
            <Icon name="chevron" size={14} color={color.aura.cta} />
          </Pressable>
          <View style={styles.pinDivider} />
        </>
      )}

      {/* Search-all pin */}
      <Pressable style={styles.pin} onPress={() => onPick(query)} accessibilityRole="button">
        <Icon name="search" size={15} color={color.aura.fieldIcon} />
        <Text style={[t.body16Medium, { color: color.aura.ink, flex: 1 }]} numberOfLines={1}>
          Search all for “{query}”
        </Text>
        <Icon name="chevron" size={13} color={color.aura.fieldIcon} />
      </Pressable>
      <View style={styles.pinDivider} />

      {groups.map((g) => (
        <View key={g.kind} style={styles.group}>
          <Text style={styles.groupLabel}>{g.label}</Text>
          <View>
            {g.rows.map((row) => {
              const i = idx++;
              // A category row browses; every other row commits a search.
              const onSelect =
                g.kind === 'categories' && onOpenCategory
                  ? () => onOpenCategory(row.catKey ?? row.title)
                  : () => onPick(row.goto ?? row.title);
              return (
                <Animated.View key={g.kind + i} entering={FadeInDown.delay(staggerDelay(i)).duration(180)}>
                  <SuggestionRow row={row} query={query} onSelect={onSelect} />
                </Animated.View>
              );
            })}
          </View>
        </View>
      ))}
      <View style={{ height: space.xl }} />
    </ScrollView>
  );
}

function SuggestionRow({ row, query, onSelect }: { row: SuggestRow; query: string; onSelect: () => void }) {
  const tone = row.tileTone ? TILE_TONES[row.tileTone] : null;
  return (
    <Pressable style={styles.row} onPress={onSelect} accessibilityRole="button" accessibilityLabel={row.title}>
      {row.cardImage ? (
        <Image source={row.cardImage} style={styles.cardThumb} resizeMode="cover" />
      ) : row.image ? (
        <Image source={row.image} style={styles.catImg} resizeMode="cover" />
      ) : row.kind === 'store' ? (
        <BrandThumb uri={row.logo} label={row.title} width={64} height={44} radiusToken={radius.md} />
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
          <Icon name="search" size={15} color={color.aura.fieldIcon} />
        </View>
      )}

      <View style={styles.rowText}>
        <Text style={[t.body16Regular, { color: color.aura.ink }]} numberOfLines={1}>
          {highlight(row.title, query)}
        </Text>
        {row.cashbackValue ? (
          <Text numberOfLines={1}>
            <Text style={[t.body12Medium, { color: color.aura.slateMuted }]}>{row.cashbackPrefix} </Text>
            <Text style={[t.body14SemiBold, { color: color.aura.cashback }]}>{row.cashbackValue}</Text>
          </Text>
        ) : row.meta ? (
          <Text style={[t.body12Regular, { color: color.aura.slateMuted }]} numberOfLines={1}>
            {row.meta}
          </Text>
        ) : null}
      </View>

      {row.live && (
        <View style={styles.live}>
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      )}
      <Icon name="chevron" size={13} color={color.aura.fieldIcon} />
    </Pressable>
  );
}

/** De-emphasise the typed prefix; bold the completion (§ suggestions spec). */
function highlight(text: string, query: string) {
  const q = query.trim().toLowerCase();
  const lower = text.toLowerCase();
  const at = lower.indexOf(q);
  if (!q || at === -1) return <Text style={{ color: color.aura.ink }}>{text}</Text>;
  return (
    <Text>
      <Text style={{ color: color.aura.slateMuted }}>{text.slice(0, at + q.length)}</Text>
      <Text style={[t.body16SemiBold, { color: color.aura.ink }]}>{text.slice(at + q.length)}</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: color.surface },
  content: { paddingTop: space.s12, paddingBottom: space.l },
  pin: { flexDirection: 'row', alignItems: 'center', gap: space.s12, paddingHorizontal: space.m20, paddingVertical: space.s12 },
  pinDivider: { height: 2, backgroundColor: color.aura.bg, marginBottom: space.m },
  goCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s12,
    marginHorizontal: space.m,
    marginBottom: space.s12,
    paddingHorizontal: space.s12,
    paddingVertical: space.s12,
    borderRadius: radius.lg,
    backgroundColor: color.aura.bg,
  },
  goText: { flex: 1, gap: space.xxs },
  group: { paddingHorizontal: space.m20, gap: space.xs, marginBottom: space.m20 },
  groupLabel: { ...t.body12Medium, color: color.aura.slateMuted, letterSpacing: 0.72, textTransform: 'uppercase' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.s12, paddingVertical: space.s, minHeight: MIN_TAP_TARGET },
  rowText: { flex: 1, gap: space.xxs },
  slot: { width: 40, height: 40, borderRadius: radius.sm, backgroundColor: color.aura.bg, alignItems: 'center', justifyContent: 'center' },
  tile: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  // Branded artwork oversized + offset so the badge centres in the tile, clipped by
  // the tile's overflow:hidden (Figma 1646:7631: 60×61 at -8,-15 inside a 44 window).
  tileImg: { position: 'absolute', width: 60, height: 61, left: -8, top: -15 },
  catImg: { width: 44, height: 44, borderRadius: 22 }, // illustrated category icon, clipped to circle
  cardThumb: { width: 70, height: 44, borderRadius: radius.sm }, // credit-card artwork at ~1.58:1 asset ratio
  live: { backgroundColor: '#d41000', borderRadius: radius.full, paddingHorizontal: space.s6, paddingVertical: space.xxs },
  liveText: { ...t.caption10SemiBold, color: color.textInverse, letterSpacing: 0.4 },
});

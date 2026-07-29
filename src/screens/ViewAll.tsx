import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { color, type as t, space, radius, MIN_TAP_TARGET, PILL_HEIGHT } from '../theme/tokens';
import { Icon } from '../icons/Icon';
import {
  StoreTile,
  ProductCard,
  CouponCard,
  DealCard,
  CampaignCard,
  CategoryChip,
} from '../components/ResultCards';
import { CreditCard } from '../components/CreditCard';
import { FinanceCard } from '../components/FinanceCard';
import { ResultItem, SectionKind } from '../data/dataContract';
import { Vertical } from '../data/realData';

/**
 * Generic "View all" page — the full set of items for one result vertical
 * (Stores · Products · Credit Cards · Loans · Savings · Coupons · Deals),
 * laid out full-page with the SAME cards the SERP rails use. A back/search
 * header states the vertical and result count; a vertical chip row switches
 * between all verticals so the one page serves every result type.
 */
const isCardArchetype = (item: ResultItem) =>
  ['05_credit_card', '06_cobranded_card'].includes(item.archetype);

export function ViewAll({
  verticals,
  activeKey,
  onSelect,
  onBack,
  onSearch,
}: {
  verticals: Vertical[];
  activeKey: string;
  onSelect: (key: string) => void;
  onBack: () => void;
  onSearch?: () => void;
}) {
  const vertical = verticals.find((v) => v.key === activeKey) ?? verticals[0];
  const [contentW, setContentW] = useState(0);

  return (
    <View style={styles.screen}>
      {/* Header: back · title + count · search */}
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          hitSlop={12}
          style={styles.headerLeft}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Icon name="back" size={20} color={color.textPrimary} />
          <View style={styles.headerTitle}>
            <Text style={[t.body14SemiBoldFlat, { color: color.textPrimary }]} numberOfLines={1}>
              All {vertical.title}
            </Text>
            <Text style={[t.caption10Medium, { color: color.textTertiary }]}>
              {vertical.items.length} {vertical.items.length === 1 ? 'Result' : 'Results'}
            </Text>
          </View>
        </Pressable>
        <Pressable
          onPress={onSearch}
          hitSlop={12}
          style={styles.searchBtn}
          accessibilityRole="button"
          accessibilityLabel="Search"
        >
          <Icon name="search" size={18} color={color.textSecondary} />
        </Pressable>
      </View>

      {/* Vertical chips — switch the browsed result type */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipRow}
      >
        {verticals.map((v) => {
          const on = v.key === vertical.key;
          return (
            <Pressable
              key={v.key}
              onPress={() => onSelect(v.key)}
              style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${v.title}`}
            >
              <Text style={[t.body12SemiBold, { color: on ? color.textInverse : color.textLink }]}>
                {v.title}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Full-page body — layout depends on the vertical's kind */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View onLayout={(e) => setContentW(Math.round(e.nativeEvent.layout.width))}>
          <VerticalBody kind={vertical.kind} items={vertical.items} width={contentW} />
        </View>
        <View style={{ height: space.huge }} />
      </ScrollView>
    </View>
  );
}

const GRID_GAP = space.s12; // min inter-column gap; leftover splits evenly (space-between)

function VerticalBody({ kind, items, width }: { kind: SectionKind; items: ResultItem[]; width: number }) {
  switch (kind) {
    // Three columns that fill the row with a fixed 12px gap between them; the
    // left edge hugs the page padding, tiles sized so the gap stays exactly 12.
    case 'stores': {
      const cols = 3;
      const tileW = width > 0 ? Math.floor((width - space.s12 * (cols - 1)) / cols) : 96;
      return (
        <View style={styles.tileGrid}>
          {items.map((item) => (
            <StoreTile key={item.id} item={item} width={tileW} />
          ))}
        </View>
      );
    }
    case 'products': {
      // Two equal columns; the gap between them equals the page's side padding, so
      // the left, center, and right spacing all match (space.m20).
      const cardW = width > 0 ? Math.floor((width - space.m20) / 2) : 132;
      return (
        <Grid
          items={items}
          width={width}
          itemWidth={cardW}
          render={(item, i) => <ProductCard key={item.id} item={item} index={i} width={cardW} />}
        />
      );
    }
    case 'categories':
      return (
        <View style={styles.categoryWrap}>
          {items.map((item) => (
            <CategoryChip key={item.id} item={item} />
          ))}
        </View>
      );
    // Vertical stacks — financial comparison / offer scanning (scan-down task).
    case 'cards':
    case 'similar_cards':
    case 'loans':
    case 'savings':
      return (
        <View style={styles.stack}>
          {items.map((item, i) =>
            isCardArchetype(item) ? (
              <CreditCard key={item.id} item={item} index={i} />
            ) : (
              <FinanceCard key={item.id} item={item} variant="full" index={i} />
            ),
          )}
        </View>
      );
    case 'coupons':
      return (
        <View style={styles.stack}>
          {items.map((item) => (
            <CouponCard key={item.id} item={item} />
          ))}
        </View>
      );
    case 'deals':
      return (
        <View style={styles.stack}>
          {items.map((item) => (
            <DealCard key={item.id} item={item} width={width || 320} />
          ))}
        </View>
      );
    case 'campaign':
      return (
        <View style={styles.stack}>
          {items.map((item) => (
            <CampaignCard key={item.id} item={item} />
          ))}
        </View>
      );
    default:
      return null;
  }
}

/**
 * Space-between grid of fixed-width cells. Columns are derived from the measured
 * content width so the edges always align to the page padding (equal both sides),
 * and the last row is padded with zero-height spacers so its cells keep the same
 * column positions instead of stretching apart.
 */
function Grid({
  items,
  width,
  itemWidth,
  render,
}: {
  items: ResultItem[];
  width: number;
  itemWidth: number;
  render: (item: ResultItem, index: number) => React.ReactNode;
}) {
  const cols = Math.max(1, Math.floor((width + GRID_GAP) / (itemWidth + GRID_GAP)));
  const spacers = (cols - (items.length % cols)) % cols;
  return (
    <View style={styles.grid}>
      {items.map((item, i) => render(item, i))}
      {Array.from({ length: spacers }).map((_, i) => (
        <View key={`spacer-${i}`} style={{ width: itemWidth }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.m,
    paddingVertical: space.s12,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
  },
  headerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.s12 },
  headerTitle: { flex: 1, gap: space.xs },
  searchBtn: {
    width: MIN_TAP_TARGET,
    height: MIN_TAP_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Horizontal scroller pinned to its content height so chips never stretch.
  chipScroll: { flexGrow: 0, flexShrink: 0 },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s,
    paddingHorizontal: space.m20,
    paddingVertical: space.s12,
  },
  chip: {
    height: PILL_HEIGHT, // 36px — canonical pill height
    paddingHorizontal: space.m,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: color.textLink },
  chipOff: { backgroundColor: color.surfaceAlt },
  scroll: { flex: 1 },
  body: { paddingHorizontal: space.m20 },
  // Space-between grid: fixed-width tiles/cards spread so the first hugs the left
  // and the last hugs the right — equal padding on both sides. Rows breathe at 20px.
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: space.m20 },
  // Fill grid: tiles sized to the column width, fixed 12px gap between them.
  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: space.s12, rowGap: space.m20 },
  // Two-row wrap of category icon pills.
  categoryWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
  // Vertical comparison stack (finance / coupons / deals).
  stack: { gap: space.s12 },
});

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { color, type as t, space, radius, MIN_TAP_TARGET } from '../theme/tokens';
import { Icon } from '../icons/Icon';
import { StoreTile } from '../components/ResultCards';
import { buildCategoryStores, CATEGORIES, Cat } from '../data/catalog';
import { staggerDelay } from '../motion/motion';

/**
 * Catalog "View all" page (Figma 1691:6220) — the full set of stores in a catalog
 * category, laid out as a full-page 3-up grid of the SAME store-logo tiles used
 * in the SERP rails (`StoreTile`). A back/search header states the category and
 * result count; a category chip row switches between all catalog categories so
 * the one page serves every category.
 */
export function CatalogViewAll({
  initialCategory,
  onBack,
  onSearch,
}: {
  initialCategory: Cat;
  onBack: () => void;
  onSearch?: () => void;
}) {
  const [cat, setCat] = useState<Cat>(initialCategory);
  const stores = buildCategoryStores(cat);

  return (
    <View style={styles.screen}>
      {/* Header (Figma 1691:6358): back · title + count · search */}
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
              All ‘{cat}’ Stores
            </Text>
            <Text style={[t.caption10Medium, { color: color.textTertiary }]}>
              {stores.length} {stores.length === 1 ? 'Result' : 'Results'}
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

      {/* Category chips (Figma 1691:6351) — switch the browsed category */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipRow}
      >
        {CATEGORIES.map((c) => {
          const on = c === cat;
          return (
            <Pressable
              key={c}
              onPress={() => setCat(c)}
              style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${c} stores`}
            >
              <Text style={[t.body12SemiBold, { color: on ? color.textInverse : color.textLink }]}>
                {c}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Full-page store grid (Figma 1691:6484) — 3-up brand-logo tiles */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {stores.map((item, i) => (
            <Animated.View key={item.id} entering={FadeInDown.delay(staggerDelay(i)).duration(220)}>
              <StoreTile item={item} />
            </Animated.View>
          ))}
        </View>
        <View style={{ height: space.huge }} />
      </ScrollView>
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
  // Horizontal scroller must NOT grow into the column's free space (that stretched
  // the chips into tall pillars) — pin it to its content height.
  chipScroll: { flexGrow: 0, flexShrink: 0 },
  chipRow: { flexDirection: 'row', alignItems: 'center', gap: space.s, paddingHorizontal: space.m20, paddingVertical: space.s12 },
  chip: {
    height: 34, // explicit height → chips never stretch vertically
    paddingHorizontal: space.m,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: color.textLink },
  chipOff: { backgroundColor: color.surfaceAlt },
  scroll: { flex: 1 },
  gridContent: { paddingHorizontal: space.m20 },
  // 3-up left-aligned grid: fixed 96-wide tiles + 12px column gap = 312 across a
  // 320 content column (three per row on the phone frame). Rows breathe at 20px.
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: space.s12, rowGap: space.m20 },
});

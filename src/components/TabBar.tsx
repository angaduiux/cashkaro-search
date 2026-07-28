import React, { useRef, useState } from 'react';
import { Text, Pressable, ScrollView, StyleSheet, LayoutRectangle, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { color, type as t, space, radius, MIN_TAP_TARGET, PILL_HEIGHT } from '../theme/tokens';
import { TabKey } from '../data/dataContract';
import { timingBase } from '../motion/motion';

const LABELS: Record<TabKey, string> = {
  all: 'All',
  stores: 'Stores',
  products: 'Products',
  categories: 'Categories',
  cards: 'Cards',
  coupons: 'Coupons',
  credit_cards: 'Credit Cards',
  cobranded: 'Co-branded',
  loans: 'Loans',
  savings: 'Savings',
};

/** Vertical slop that lifts the 40px pill's tap target back to ≥44px. */
const PILL_SLOP = Math.ceil((MIN_TAP_TARGET - PILL_HEIGHT) / 2);

/**
 * Pill tab bar (§6.2). "All" first when shown. The active-indicator pill slides
 * between tabs (shared-layout continuity anchor, §9.4). Every pill clears the
 * ≥44px tap target — the systemic fix from §6.2, applied here at the component
 * level so it's correct everywhere the bar is used.
 */
export function TabBar({
  tabs,
  active,
  onChange,
}: {
  tabs: TabKey[];
  active: TabKey;
  onChange: (t: TabKey) => void;
}) {
  const layouts = useRef<Record<string, LayoutRectangle>>({});
  const [, force] = useState(0);
  const x = useSharedValue(0);
  const w = useSharedValue(0);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
    width: w.value,
  }));

  const moveTo = (key: TabKey) => {
    const l = layouts.current[key];
    if (l) {
      x.value = withTiming(l.x, timingBase);
      w.value = withTiming(l.width, timingBase);
    }
  };

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <View>
          <Animated.View style={[styles.indicator, indicatorStyle]} pointerEvents="none" />
          <View style={styles.rowInner}>
            {tabs.map((key) => {
              const isActive = key === active;
              return (
                <Pressable
                  key={key}
                  onLayout={(e) => {
                    layouts.current[key] = e.nativeEvent.layout;
                    if (isActive) moveTo(key);
                    force((n) => n + 1);
                  }}
                  onPress={() => {
                    onChange(key);
                    moveTo(key);
                  }}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={LABELS[key]}
                  // Pill is 40px tall; slop restores the ≥44px effective tap target.
                  hitSlop={{ top: PILL_SLOP, bottom: PILL_SLOP }}
                  style={[styles.pill, !isActive && styles.pillInactive]}
                >
                  <Text
                    style={[
                      t.body14SemiBold,
                      { color: isActive ? color.textInverse : color.aura.cta },
                    ]}
                  >
                    {LABELS[key]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// CashKaro DS Tab/Primary (Figma 3232:29141): active pill #0741ef (cobalt500) +
// white text; inactive #ebf0ff (cobalt50) + #0036da (cobalt700) text; radius
// full; Outfit Medium 14; bottom hairline on the bar.
const styles = StyleSheet.create({
  // Bottom hairline divider (Figma 1646:7250 border-b #d9e3ec); left edge aligns
  // with the page content (no extra horizontal padding of its own).
  // Full-bleed: cancel the page's 20px side padding so pills align with the page
  // on the left and scroll cleanly off the physical screen edge on the right
  // (rather than clipping at an arbitrary inset). The hairline spans full width.
  wrap: {
    borderBottomWidth: 1,
    borderBottomColor: color.border,
    marginBottom: space.m,
    marginHorizontal: -space.m20,
  },
  container: { paddingVertical: space.s, paddingHorizontal: space.m20 },
  rowInner: { flexDirection: 'row', gap: space.s },
  pill: {
    height: PILL_HEIGHT, // 40px pill; hitSlop above keeps the ≥44px tap target (§6.2)
    borderRadius: radius.full,
    paddingHorizontal: space.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillInactive: {
    backgroundColor: color.surfaceAlt, // cobalt50 #ebf0ff
  },
  indicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: color.cashback, // cobalt500 #0741ef
    borderRadius: radius.full,
  },
});

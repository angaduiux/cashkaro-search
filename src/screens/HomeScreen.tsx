import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { color, type as t, space, radius, MIN_TAP_TARGET, fontFamily } from '../theme/tokens';
import { Icon } from '../icons/Icon';
import { IconName } from '../icons/iconMap';
import { BrandThumb } from '../components/ImageSlot';
import { DealsCarousel, CategoryChip } from '../components/ResultCards';
import { BRAND, ALL_DEALS } from '../data/realData';
import { staggerDelay } from '../motion/motion';
import { ResultItem } from '../data/dataContract';

/**
 * CashKaro app Home — the entry screen (Home → Explore → Typing → Enter). A
 * brand header with the live earnings pill, then the hoisted shared search bar
 * (which rests in the slot below the header and glides up on tap), plus home
 * content (deals, categories, top stores) and the app bottom-tab bar. Search
 * pages have no tab bar; this Home owns it.
 */
const TOP_STORES = [
  { name: 'Beyoung', brand: BRAND.beyoung, line: 'Up to 7.5%', q: 'body' },
  { name: 'Cleartrip', brand: BRAND.cleartrip, line: 'Flat ₹1,500', q: 'flip' },
  { name: 'Myntra', brand: BRAND.myntra, line: 'Up to 7.5%', q: 'body' },
  { name: 'Flipkart', brand: BRAND.flipkart, line: 'Up to 7%', q: 'flip' },
  { name: 'Nykaa', brand: BRAND.nykaa, line: 'Flat 9%', q: 'body' },
  { name: 'PharmEasy', brand: BRAND.pharmeasy, line: 'Up to 7%', q: 'phar' },
];
const CATEGORIES: ResultItem[] = [
  { id: 'c-fashion', archetype: '04_category', source: 'internal', title: 'Fashion', logo: null, logoBg: '#ff3f6c1a', cashback: { type: 'none' } },
  { id: 'c-electronics', archetype: '04_category', source: 'internal', title: 'Electronics', logo: null, logoBg: '#0741ef1a', cashback: { type: 'none' } },
  { id: 'c-beauty', archetype: '04_category', source: 'internal', title: 'Beauty', logo: null, logoBg: '#e5326617', cashback: { type: 'none' } },
  { id: 'c-travel', archetype: '04_category', source: 'internal', title: 'Travel', logo: null, logoBg: '#ff6d1d1a', cashback: { type: 'none' } },
];

// Height reserved at the top of the scroll content for the hoisted shared search
// bar, which floats over this slot (Root REST_Y positions it here).
const BAR_SLOT = 64;

export function HomeScreen({ onPick }: { onPick: (q: string) => void }) {
  return (
    <View style={styles.screen}>
      {/* Brand header */}
      <View style={styles.header}>
        <View>
          <Text style={[t.body12Regular, { color: color.aura.slateMuted }]}>Namaste 👋</Text>
          <Text style={[t.heading22SemiBold, { color: color.aura.ink }]}>CashKaro</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.earnPill}>
            <Icon name="rupee" size={12} color={color.reward} />
            <Text style={[t.body14SemiBold, { color: color.reward }]}> 27,440</Text>
          </View>
          <View style={styles.avatar}>
            <Icon name="user" size={16} color={color.aura.slate} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Slot for the hoisted shared search bar (rendered at the app root) */}
        <View style={{ height: BAR_SLOT }} />

        {/* Deals */}
        <View style={styles.block}>
          <DealsCarousel items={ALL_DEALS} />
        </View>

        {/* Categories */}
        <View style={styles.block}>
          <View style={styles.blockPad}>
            <Head title="Shop by category" />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catRow}
          >
            {CATEGORIES.map((c) => (
              <Pressable key={c.id} onPress={() => onPick(c.title.toLowerCase())}>
                <CategoryChip item={c} />
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Top stores */}
        <View style={styles.blockPad}>
          <Head title="Top Stores" seeAll />
          <View style={styles.storeGrid}>
            {TOP_STORES.map((s, i) => {
              const parts = s.line.split(' ');
              const value = parts[parts.length - 1];
              const prefix = parts.slice(0, -1).join(' ');
              return (
                <Animated.View key={s.name} entering={FadeInDown.delay(staggerDelay(i)).duration(220)}>
                  <Pressable onPress={() => onPick(s.q)} style={styles.storeTile} accessibilityRole="button" accessibilityLabel={s.name}>
                    <BrandThumb uri={s.brand.logo} label={s.name} width={100} height={44} radiusToken={11} />
                    <View style={styles.storeLine}>
                      <Text style={[t.body12Medium, { color: color.aura.slate }]}>{prefix} </Text>
                      <Text style={[styles.storeValue, { color: color.aura.cashback }]}>{value}</Text>
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </View>
        <View style={{ height: space.l }} />
      </ScrollView>

      <AppTabBar />
    </View>
  );
}

function Head({ title, seeAll }: { title: string; seeAll?: boolean }) {
  return (
    <View style={styles.head}>
      <Text style={[t.body14SemiBold, { color: color.aura.ink }]}>{title}</Text>
      {seeAll && <Text style={[t.body12Medium, { color: color.textLink }]}>See all</Text>}
    </View>
  );
}

/** CashKaro bottom tab bar — Home · Referrals · Earnings · Missing? · Profile. */
export function AppTabBar() {
  const items: { icon: IconName; label: string; active?: boolean }[] = [
    { icon: 'home', label: 'Home', active: true },
    { icon: 'gift', label: 'Referrals' },
    { icon: 'rupee', label: '₹27.4k' },
    { icon: 'search', label: 'Missing?' },
    { icon: 'user', label: 'Profile' },
  ];
  return (
    <View style={styles.tabBar}>
      {items.map((it) => (
        <View key={it.label} style={styles.tabItem}>
          <Icon name={it.icon} size={18} color={it.active ? color.cashback : color.aura.slateMuted} />
          <Text style={[t.caption10SemiBold, { color: it.active ? color.cashback : color.aura.slateMuted, marginTop: 2 }]}>
            {it.label}
          </Text>
        </View>
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
    paddingTop: space.s,
    paddingBottom: space.s12,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: space.s12 },
  earnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.successSurface,
    borderRadius: radius.full,
    paddingHorizontal: space.s12,
    paddingVertical: space.xs,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: color.aura.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingBottom: space.s, gap: space.m20 },
  block: { gap: space.s },
  blockPad: { paddingHorizontal: space.m, gap: space.s12 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  catRow: { flexDirection: 'row', gap: space.s12, paddingHorizontal: space.m },
  storeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.m },
  storeTile: { width: 100, alignItems: 'center', gap: space.s12 },
  storeLine: { flexDirection: 'row', alignItems: 'baseline' },
  storeValue: { fontFamily: fontFamily.semiBold, fontSize: 20, letterSpacing: -0.08 },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: color.border,
    paddingTop: space.s,
    paddingBottom: space.xs,
    backgroundColor: color.surface,
  },
  tabItem: { flex: 1, alignItems: 'center' },
});

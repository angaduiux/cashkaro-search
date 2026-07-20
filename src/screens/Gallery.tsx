import React from 'react';
import { View, Text, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { color, type as t, space, radius, elevation } from '../theme/tokens';
import { SerpShell } from '../components/SerpShell';
import { SerpModel } from '../data/dataContract';
import {
  caseFlip,
  caseBody,
  casePhar,
  caseMobile,
  caseTira,
  caseB,
  caseCredit,
  caseAmountLoan,
  caseSavings,
  caseWhey,
} from '../data/realData';
import { staggerDelay } from '../motion/motion';

/**
 * "All layouts on one page" — every result-page shape (Cases A–G) laid out
 * together as device-framed previews, so the whole system reads at a glance.
 * Each tile is a non-interactive SerpShell preview showing the top of that
 * layout. Responsive: multi-column on wide screens, single column on a phone.
 */
const ENTRIES: { label: string; sub: string; model: SerpModel }[] = [
  { label: 'A · Resolved store', sub: 'flip → Flipkart', model: caseFlip },
  { label: 'A · Store + categories', sub: 'body → The Body Shop', model: caseBody },
  { label: 'A · Store + pharmacy', sub: 'phar → PharmEasy', model: casePhar },
  { label: 'A · Category-led', sub: 'mobile', model: caseMobile },
  { label: 'A · Thin store', sub: 'tira', model: caseTira },
  { label: 'B · Resolved card', sub: 'sbi cashback card', model: caseB },
  { label: 'C · Cards category', sub: 'credit', model: caseCredit },
  { label: 'D · Amount loan', sub: '₹5,00,000 personal loan', model: caseAmountLoan },
  { label: 'E · Savings feature', sub: 'zero balance savings', model: caseSavings },
  { label: 'G · Web expand', sub: 'whey → products', model: caseWhey },
];

export function Gallery() {
  const { width } = useWindowDimensions();
  // one column on a phone frame; multi-column when there's room.
  const cols = width > 1100 ? 3 : width > 760 ? 2 : 1;
  const tileW = cols === 1 ? undefined : Math.floor((Math.min(width, 1280) - space.l * 2 - space.m * (cols - 1)) / cols);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[t.heading24SemiBold, { color: color.textPrimary }]}>All result layouts</Text>
        <Text style={[t.body14Regular, { color: color.textSecondary }]}>
          Every query-shape (A–G) composing the one SERP shell — context line, optional hero,
          content sections, and Expand Search where it applies.
        </Text>
      </View>

      <View style={styles.grid}>
        {ENTRIES.map((e, i) => (
          <Animated.View
            key={e.label}
            entering={FadeInDown.delay(staggerDelay(i)).duration(260)}
            style={[styles.tile, tileW ? { width: tileW } : styles.tileFull, elevation.md]}
          >
            <View style={styles.caption}>
              <Text style={[t.body14SemiBold, { color: color.textPrimary }]}>{e.label}</Text>
              <Text style={[t.body12Regular, { color: color.textTertiary }]}>{e.sub}</Text>
            </View>
            <View style={styles.window}>
              <SerpShell model={e.model} preview />
              <View style={styles.fade} pointerEvents="none" />
            </View>
          </Animated.View>
        ))}
      </View>
      <View style={{ height: space.huge }} />
    </ScrollView>
  );
}

const WINDOW_H = 560;

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: color.surfaceAlt },
  content: { padding: space.l, gap: space.l },
  header: { gap: space.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.m },
  tile: {
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: color.border,
  },
  tileFull: { alignSelf: 'stretch' },
  caption: {
    paddingHorizontal: space.m,
    paddingVertical: space.s12,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
    gap: space.xxs,
  },
  window: { height: WINDOW_H, overflow: 'hidden' },
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 56,
    backgroundColor: color.surface,
    opacity: 0.0,
  },
});

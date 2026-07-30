/**
 * Recovery / zero-or-degraded results (§4F, archetype 11). "Never a dead end":
 * warm tone, the query restated, and an inviting motion toward the next action.
 * Following NN/g's three no-results rules — state clearly, offer starting
 * points, never mock — plus popular stores as recovery paths.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { color, type as t, space, radius, MIN_TAP_TARGET } from '../theme/tokens';
import { Icon } from '../icons/Icon';
import { Button } from '../components/Button';
import { StoreRow } from '../components/ResultCards';
import { SectionHeader } from '../components/atoms';
import { caseFlip, didYouMean } from '../data/realData';


export function RecoveryScreen({ query, onExpand, onPick }: { query: string; onExpand?: () => void; onPick?: (q: string) => void }) {
  // The correction, if the catalog holds one — resolved from the same scorer the
  // type-ahead ranks with, which tolerates the typo that dropped this query here
  // (D112). This is the ONLY surface that shows it; the suggestions screen is
  // untouched, since there the corrected candidate is already a tappable row.
  const meant = didYouMean(query);
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown.duration(280)} style={styles.hero}>
        <View style={styles.iconWrap}>
          <Icon name="search" size={28} color={color.actionPrimary} />
        </View>
        <Text style={[t.heading22SemiBold, { color: color.textPrimary, textAlign: 'center' }]}>
          No exact matches for “{query}”
        </Text>
        {meant ? (
          /* The correction leads, because it is usually the whole answer — the query
             was a misspelling of something the catalog does have. */
          <Pressable style={styles.meant} onPress={() => onPick?.(meant.query)} accessibilityRole="button" accessibilityLabel={`Did you mean ${meant.label}`}>
            <Text style={[t.body16Regular, { color: color.textSecondary, textAlign: 'center' }]}>
              Did you mean{' '}
              <Text style={[t.body16SemiBold, { color: color.actionPrimary }]}>{meant.label}</Text>?
            </Text>
          </Pressable>
        ) : null}
        <Text style={[t.body16Regular, { color: color.textSecondary, textAlign: 'center' }]}>
          Try fewer or different words — or let us search the web for matching products.
        </Text>
        <Button label="Expand Search" icon="globe" onPress={onExpand} style={{ alignSelf: 'stretch' }} />
      </Animated.View>

      <View style={styles.section}>
        <SectionHeader title="Popular stores" />
        {caseFlip.sections[0].items.map((item, i) => (
          <StoreRow key={item.id} item={item} index={i} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.m, gap: space.m },
  hero: {
    alignItems: 'center',
    gap: space.s12,
    paddingVertical: space.xl,
    paddingHorizontal: space.m,
    backgroundColor: color.surfaceAlt,
    borderRadius: radius.xl,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { marginTop: space.s },
  /** The "Did you mean …?" line — a tap target, so it clears 44px (AGENTS). */
  meant: { alignSelf: 'stretch', minHeight: MIN_TAP_TARGET, justifyContent: 'center', paddingHorizontal: space.s },
});

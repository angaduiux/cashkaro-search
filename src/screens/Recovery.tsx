import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { color, type as t, space, radius } from '../theme/tokens';
import { Icon } from '../icons/Icon';
import { Button } from '../components/Button';
import { StoreRow } from '../components/ResultCards';
import { SectionHeader } from '../components/atoms';
import { caseFlip } from '../data/realData';

/**
 * Recovery / zero-or-degraded results (§4F, archetype 11). "Never a dead end":
 * warm tone, the query restated, and an inviting motion toward the next action.
 * Following NN/g's three no-results rules — state clearly, offer starting
 * points, never mock — plus popular stores as recovery paths.
 */
export function RecoveryScreen({ query, onExpand }: { query: string; onExpand?: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown.duration(280)} style={styles.hero}>
        <View style={styles.iconWrap}>
          <Icon name="search" size={28} color={color.actionPrimary} />
        </View>
        <Text style={[t.heading22SemiBold, { color: color.textPrimary, textAlign: 'center' }]}>
          No exact matches for “{query}”
        </Text>
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
});

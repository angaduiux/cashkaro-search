/**
 * Badge + TopPickTag — the two inline status pills the result cards use. `Badge`
 * renders a `Badge` from the data contract in its tone's colour pair (cashback,
 * reward, neutral, campaign); `TopPickTag` is the "why this is first" line a ranked
 * set puts on its leading row. Both are labels, not pills in the selector sense, so
 * neither takes PILL_HEIGHT.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Badge as BadgeModel } from '../data/dataContract';
import { color, type as t, space, radius } from '../theme/tokens';
import { Icon } from '../icons/Icon';

const toneColors: Record<BadgeModel['tone'], { bg: string; fg: string }> = {
  cashback: { bg: color.cashbackSurface, fg: color.cashbackStrong },
  reward: { bg: color.successSurface, fg: color.rewardStrong },
  neutral: { bg: color.surfaceAlt, fg: color.textSecondary },
  campaign: { bg: color.successSurface, fg: color.reward },
};

export function Badge({ badge }: { badge: BadgeModel }) {
  const c = toneColors[badge.tone];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[t.body12SemiBold, { color: c.fg }]} numberOfLines={1}>
        {badge.label}
      </Text>
    </View>
  );
}

/**
 * "Top pick · <reason>" (§6.6). Reason is mandatory (and, for finance, must be a
 * publicly pre-disclosed ranking metric per RBI Digital Lending Directions 2025).
 * Never silent — if there's no reason string, render nothing.
 */
export function TopPickTag({ reason }: { reason: string }) {
  if (!reason) return null;
  return (
    <View style={styles.topPick} accessibilityLabel={`Top pick: ${reason}`}>
      <Icon name="fire" size={11} color={color.actionPrimaryText} />
      <Text style={[t.body12SemiBold, { color: color.actionPrimaryText }]} numberOfLines={1}>
        {'  Top pick · '}
        {reason}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.full,
    paddingHorizontal: space.s,
    paddingVertical: space.xs,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  topPick: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.actionPrimary,
    borderRadius: radius.full,
    paddingHorizontal: space.s12,
    paddingVertical: space.xs,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
});

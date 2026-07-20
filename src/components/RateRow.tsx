import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Rate } from '../data/dataContract';
import { color, type as t, space } from '../theme/tokens';
import { Icon } from '../icons/Icon';

/**
 * Rate display with the reward-vs-cost colour rule (§6.5) baked in so the
 * direction is unmistakable:
 *   reward ("bigger is better": savings interest) → reward/green + up caret
 *   cost   ("smaller is better": loan APR, fee)   → neutral text, NEVER green
 * `display` is a preformatted feed string; this component never computes rates.
 */
export function RateRow({ rate, caption }: { rate: Rate; caption?: string }) {
  if (!rate) return null;
  const isReward = rate.kind === 'reward';
  const valueColor = isReward ? color.reward : color.cost;

  return (
    <View style={styles.row}>
      {isReward && <Icon name="bolt" size={12} color={color.reward} />}
      <Text style={[t.body16SemiBold, { color: valueColor }]}>{rate.display}</Text>
      {!!rate.note && (
        <Text style={[t.body12Regular, { color: color.textTertiary }]}> {rate.note}</Text>
      )}
      {!!caption && (
        <Text style={[t.body12Regular, { color: color.textTertiary }]}>{'  ·  '}{caption}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space.xs },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Cashback } from '../data/dataContract';
import { color, type as t, space, radius } from '../theme/tokens';

/**
 * Renders CashKaro's cashback figure (§3.4). Rules baked in:
 *  - `none` renders NOTHING (never "0%") — absence, not a zero.
 *  - `flat_inr` shows a flat rupee amount (card cashback mechanic).
 *  - `pct_single` / `pct_range` show percentages (marketplace / D2C).
 * Always uses the cashback colour role (Cobalt), distinct from reward/cost.
 */
export function CashbackElement({
  cashback,
  size = 'md',
  label = 'Cashback',
}: {
  cashback: Cashback;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}) {
  if (cashback.type === 'none') return null; // never render "0%"

  const figureStyle =
    size === 'lg' ? t.heading24SemiBold : size === 'sm' ? t.body14SemiBold : t.body16SemiBold;

  let figure = '';
  if (cashback.type === 'flat_inr') {
    const prefix = cashback.prefix === 'upto' ? 'Upto ' : 'Flat ';
    figure = `${prefix}₹${cashback.value.toLocaleString('en-IN')}`;
  } else if (cashback.type === 'pct_single') {
    figure = `Upto ${cashback.value}%`;
  } else if (cashback.type === 'pct_range') {
    figure = `${cashback.min}–${cashback.max}%`;
  }

  return (
    <View style={styles.row} accessibilityLabel={`${figure} ${label}`}>
      <Text style={[figureStyle, { color: color.cashback }]}>{figure}</Text>
      {!!label && size !== 'sm' && (
        <Text style={[t.body12Regular, { color: color.cashbackStrong }]}> {label}</Text>
      )}
    </View>
  );
}

/** Compact pill form of the cashback figure, for badges on tiles/deals. */
export function CashbackPill({ cashback, label = 'Cashback' }: { cashback: Cashback; label?: string }) {
  if (cashback.type === 'none') return null;
  return (
    <View style={styles.pill}>
      <CashbackElement cashback={cashback} size="sm" label={label} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap' },
  pill: {
    backgroundColor: color.cashbackSurface,
    borderRadius: radius.full,
    paddingHorizontal: space.s,
    paddingVertical: space.xs,
  },
});

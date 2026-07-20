import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ResultItem } from '../data/dataContract';
import { color, type as t, space, radius, elevation } from '../theme/tokens';
import { Icon } from '../icons/Icon';
import { CashbackElement } from './CashbackElement';
import { Badge, TopPickTag } from './Badge';
import { Button } from './Button';
import { ImageSlot } from './ImageSlot';
import { RateRow } from './RateRow';
import { Divider, PlaceholderPill, isPlaceholderValue } from './atoms';
import { Shine } from '../motion/Shine';

/**
 * The one finance-card component (§6.3). Two density variants:
 *  - Full (hero / single-entity): artwork → name → CashKaro flat-₹ cashback →
 *    up to 3 benefit tags → 2 benefit bullets (the card's OWN reward structure)
 *    → fee row (Joining | Annual) + primary CTA.
 *  - Compact (secondary/list): same, minus fee row + CTA; benefit text 1 line.
 *
 * Fixes carried (per §6.3):
 *  - tags row hugs its content height and wraps cleanly (no overlap with the
 *    text below) — `flexWrap` + no fixed height.
 *  - fee row is two labeled values with a thin divider, each independently
 *    fee/free/discontinued (§6.4).
 *
 * CashKaro's flat-₹ cashback and the card's own reward rate are two DISTINCT
 * pieces of UI (§2, §3.4): cashback element vs. benefit bullets. Never merged.
 */
export function FinanceCard({
  item,
  variant = 'full',
  index = 0,
}: {
  item: ResultItem;
  variant?: 'full' | 'compact';
  index?: number;
}) {
  const isFull = variant === 'full';
  const tags = (item.benefitTags ?? []).slice(0, 3);
  const bullets = (item.benefitBullets ?? []).slice(0, 2);

  return (
    <Animated.View
      entering={FadeIn.delay(Math.min(index * 40, 200)).duration(220)}
      style={[styles.card, isFull ? styles.cardFull : styles.cardCompact, isFull && elevation.sm]}
    >
      {/* Top: artwork + name + rating + cashback */}
      <View style={styles.headerRow}>
        <Shine style={{ borderRadius: radius.md }}>
          <View style={[styles.artWrap, { backgroundColor: item.logoBg ?? color.surfaceAlt }]}>
            <ImageSlot
              uri={item.artwork ?? item.logo}
              label={item.title}
              icon="card"
              size={isFull ? 76 : 56}
              radiusToken={radius.sm}
              bg="transparent"
              style={styles.artSlot}
            />
          </View>
        </Shine>
        <View style={styles.headerText}>
          <Text style={[isFull ? t.heading18SemiBold : t.body16SemiBold, { color: color.textPrimary }]} numberOfLines={2}>
            {item.title}
          </Text>
          {!!item.subtitle && (
            <Text style={[t.body12Regular, { color: color.textTertiary }]} numberOfLines={1}>
              {item.subtitle}
            </Text>
          )}
          {item.rating && (
            <View style={styles.ratingRow}>
              {Array.from({ length: 5 }, (_, i) => (
                <Icon
                  key={i}
                  name="star"
                  size={11}
                  color={i < item.rating!.stars ? color.actionPrimary : color.border}
                />
              ))}
              <Text style={[t.body12Regular, { color: color.textTertiary }]}>
                {'  '}{item.rating.stars}.0 ({item.rating.count})
              </Text>
            </View>
          )}
          {/* CashKaro flat-₹ cashback — distinct from the card's own rewards */}
          <View style={styles.cashbackWrap}>
            <CashbackElement cashback={item.cashback} size={isFull ? 'md' : 'sm'} label="CashKaro Reward" />
          </View>
        </View>
      </View>

      {/* Top pick (§6.6) */}
      {item.topPick?.reason && (
        <View style={styles.topPickWrap}>
          <TopPickTag reason={item.topPick.reason} />
        </View>
      )}

      {/* Rate row for loans/savings — reward-vs-cost colour rule (§6.5).
          Un-sourced rates render a loud placeholder, never an invented figure. */}
      {item.rate && (
        <View style={styles.rateWrap}>
          {item.rate.display.startsWith('PLACEHOLDER') ? (
            <PlaceholderPill label={`${item.rate.kind === 'cost' ? 'APR' : 'interest rate'} not sourced`} />
          ) : (
            <RateRow rate={item.rate} />
          )}
        </View>
      )}

      {/* Benefit tags — wrap cleanly, container hugs content (§6.3 fix) */}
      {tags.length > 0 && (
        <View style={styles.tagsRow}>
          {tags.map((b, i) => (
            <Badge key={i} badge={b} />
          ))}
        </View>
      )}

      {/* Benefit bullets — the card's OWN reward structure */}
      {bullets.length > 0 && (
        <View style={styles.bullets}>
          {bullets.map((b, i) => {
            const placeholder = b.text.startsWith('PLACEHOLDER');
            return (
              <View key={i} style={styles.bulletRow}>
                <Icon name="check" size={13} color={placeholder ? color.placeholder : color.reward} />
                {placeholder ? (
                  <PlaceholderPill label="reward bullet not sourced" />
                ) : (
                  <Text
                    style={[t.body14Regular, { color: color.textSecondary, flex: 1 }]}
                    numberOfLines={variant === 'compact' ? 1 : 2}
                  >
                    {b.text}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Fee row (Full only) */}
      {isFull && item.fees && (
        <>
          <Divider style={{ marginVertical: space.s12 }} />
          <FeeRow item={item} />
          {!!item.fees.waiver && (
            <Text style={[t.body12Regular, { color: color.reward, marginTop: space.xs }]}>
              {item.fees.waiver}
            </Text>
          )}
        </>
      )}

      {/* BFSI action → CK-blue CTA (loan eligibility / open account). Decoupled
          from the fee row so finance cards without a fee block still get a CTA. */}
      {isFull && !!item.ctaLabel && (
        <Button label={item.ctaLabel} bg={color.aura.cta} style={{ marginTop: space.s12 }} />
      )}
    </Animated.View>
  );
}

/** Joining | Annual, two labeled values split by a thin divider (§6.4). */
function FeeRow({ item }: { item: ResultItem }) {
  const fees = item.fees!;
  // Loans/savings repurpose the two-column row (not card joining/annual fees).
  const isLoan = item.archetype === '07_loan';
  const isSavings = item.archetype === '12_bank_savings';
  const labelA = isLoan ? 'Processing fee' : isSavings ? 'Min balance' : 'Joining';
  const labelB = isLoan ? 'Max tenure' : isSavings ? 'Interest credited' : 'Annual';
  const render = (labelText: string, value: string | null) => {
    if (fees.state === 'discontinued') {
      return <Text style={[t.body14SemiBold, { color: color.textTertiary }]}>Discontinued</Text>;
    }
    if (isPlaceholderValue(value)) return <PlaceholderPill label="fee not sourced" />;
    const isFree = fees.state === 'free' || value === 'Lifetime Free';
    return (
      <Text style={[t.body16SemiBold, { color: isFree ? color.reward : color.cost }]}>
        {value ?? '—'}
      </Text>
    );
  };
  return (
    <View style={styles.feeRow}>
      <View style={styles.feeCol}>
        <Text style={[t.body12Regular, { color: color.textTertiary }]}>{labelA}</Text>
        {render(labelA, fees.joining)}
      </View>
      <View style={styles.feeDivider} />
      <View style={styles.feeCol}>
        <Text style={[t.body12Regular, { color: color.textTertiary }]}>{labelB}</Text>
        {render(labelB, fees.annual)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: color.surface, borderRadius: radius.lg, padding: space.m, gap: space.s },
  cardFull: { borderWidth: 1, borderColor: color.border },
  cardCompact: { borderWidth: 1, borderColor: color.border },
  headerRow: { flexDirection: 'row', gap: space.s12, alignItems: 'flex-start' },
  headerText: { flex: 1, gap: space.xxs },
  artWrap: { borderRadius: radius.md, padding: space.xs },
  artSlot: { borderWidth: 0 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 1 },
  cashbackWrap: { marginTop: space.xs },
  topPickWrap: { marginTop: space.xxs },
  rateWrap: { marginTop: space.xxs },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s }, // hugs content, wraps (§6.3)
  bullets: { gap: space.s, marginTop: space.xxs },
  bulletRow: { flexDirection: 'row', gap: space.s, alignItems: 'center' },
  feeRow: { flexDirection: 'row', alignItems: 'center' },
  feeCol: { flex: 1, gap: space.xxs },
  feeDivider: { width: 1, alignSelf: 'stretch', backgroundColor: color.border, marginHorizontal: space.m },
});

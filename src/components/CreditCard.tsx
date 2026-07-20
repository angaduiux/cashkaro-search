import React from 'react';
import { View, Text, Image, Pressable, StyleSheet, ImageSourcePropType } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ResultItem } from '../data/dataContract';
import { color, type as t, space, radius, fontFamily } from '../theme/tokens';
import { Icon } from '../icons/Icon';
import { Shine } from '../motion/Shine';

/**
 * Credit-card card — faithful build of the design-system component (Figma
 * 1785:28364). White card (radius 16, subtle border + soft shadow, 12 padding):
 * landscape card render (132×84, ratio 1.58) + name + saffron "Upto ₹X Cashback"
 * pill, sky-tone feature tags, benefit bullets, and a fees strip (Joining |
 * Annual) with an inline cobalt "Apply Now" button. Variants: `inviteOnly`
 * ribbon, and any tag/benefit/fee content driven by the ResultItem.
 */
export function CreditCard({ item, index = 0, inviteOnly }: { item: ResultItem; index?: number; inviteOnly?: boolean }) {
  const tags = (item.benefitTags ?? []).slice(0, 3);
  const bullets = (item.benefitBullets ?? []).slice(0, 2);
  const cb = item.cashback;
  const cashbackValue =
    cb.type === 'flat_inr' ? `₹${cb.value.toLocaleString('en-IN')}` : cb.type === 'pct_single' ? `${cb.value}%` : cb.type === 'pct_range' ? `${cb.max}%` : null;
  const fees = item.fees;

  return (
    <Animated.View entering={FadeIn.delay(Math.min(index * 40, 200)).duration(220)} style={styles.card}>
      {inviteOnly && (
        <View style={styles.ribbon}>
          <Text style={styles.ribbonText}>INVITE ONLY</Text>
        </View>
      )}

      {/* Card render + name + cashback pill */}
      <View style={styles.top}>
        <Shine style={{ borderRadius: radius.md }}>
          <Image source={(item.artwork ?? item.logo) as ImageSourcePropType} style={styles.cardImg} resizeMode="cover" />
        </Shine>
        <View style={styles.info}>
          <Text style={[styles.name, { color: color.card.name }]} numberOfLines={2}>
            {item.title}
          </Text>
          {cashbackValue && (
            <LinearGradient
              colors={[color.card.pillFrom, color.surface]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.pill}
            >
              <Text style={[styles.pillUpto, { color: color.actionPrimary }]}>Upto </Text>
              <Text style={[styles.pillValue, { color: color.actionPrimary }]}>{cashbackValue} Cashback</Text>
            </LinearGradient>
          )}
        </View>
      </View>

      {/* Feature tags (sky badges) */}
      {tags.length > 0 && (
        <View style={styles.tags}>
          {tags.map((tag, i) => (
            <View key={i} style={styles.tag}>
              <Text style={styles.tagText}>{tag.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Benefit bullets — the card's own reward structure */}
      {bullets.length > 0 && (
        <View style={styles.benefits}>
          {bullets.map((b, i) => (
            <View key={i} style={styles.benefitRow}>
              <Icon name="check" size={14} color={color.aura.slateMuted} />
              <Text style={[styles.benefitText, { color: color.card.benefit }]}>{b.text}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Fees strip + Apply Now */}
      {fees && (
        <View style={styles.strip}>
          <View style={styles.fees}>
            <FeeCol label="Joining Fees" value={fees.joining} />
            <View style={styles.feeDivider} />
            <FeeCol label="Annual Fees" value={fees.annual} />
          </View>
          <Pressable style={styles.apply} accessibilityRole="button" accessibilityLabel={item.ctaLabel ?? 'Apply Now'}>
            <Text style={styles.applyText}>{item.ctaLabel ?? 'Apply Now'}</Text>
            <Icon name="chevron" size={16} color={color.textInverse} />
          </Pressable>
        </View>
      )}
    </Animated.View>
  );
}

function FeeCol({ label, value }: { label: string; value?: string | null }) {
  const free = !value || /free/i.test(value);
  return (
    <View style={styles.feeCol}>
      <Text style={styles.feeLabel}>{label}</Text>
      <Text style={[styles.feeValue, free && { color: color.aura.green }]}>{value ?? 'Free'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.xl, // 16
    borderWidth: 1,
    borderColor: color.card.border,
    padding: space.s12, // 12
    gap: space.s12,
    // Shadow/Light/SM
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    boxShadow: '0px 2px 4px rgba(0,0,0,0.08)',
  } as any,
  ribbon: {
    position: 'absolute',
    top: -3,
    left: 20,
    backgroundColor: color.actionPrimary,
    borderRadius: radius.xs,
    paddingHorizontal: space.s,
    paddingVertical: 1,
    zIndex: 2,
  },
  ribbonText: { ...t.caption10SemiBold, color: color.textInverse, letterSpacing: 0.4 },
  top: { flexDirection: 'row', gap: space.s, alignItems: 'flex-start' },
  cardImg: { width: 132, height: 84, borderRadius: radius.md },
  info: { flex: 1, gap: space.s6, alignSelf: 'stretch' },
  name: { fontFamily: fontFamily.semiBold, fontSize: 16, lineHeight: 24 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    borderRadius: radius.full,
    paddingHorizontal: space.s12,
  },
  pillUpto: { fontFamily: fontFamily.regular, fontSize: 14 },
  pillValue: { fontFamily: fontFamily.semiBold, fontSize: 14, letterSpacing: 0.4 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
  tag: {
    backgroundColor: color.card.tagBg,
    borderWidth: 1,
    borderColor: color.card.tagBorder,
    borderRadius: radius.xs,
    paddingHorizontal: space.s,
    paddingVertical: space.xxs,
  },
  tagText: { fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 16, color: color.card.tagText },
  benefits: { gap: space.s },
  benefitRow: { flexDirection: 'row', gap: space.s, alignItems: 'flex-start' },
  benefitText: { flex: 1, fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 16 },
  strip: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  fees: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  feeCol: { flex: 1, alignItems: 'center', gap: space.xs },
  feeLabel: { fontFamily: fontFamily.regular, fontSize: 10, lineHeight: 14, letterSpacing: 0.4, color: color.card.feeLabel },
  feeValue: { fontFamily: fontFamily.semiBold, fontSize: 14, lineHeight: 20, letterSpacing: 0.4, color: color.card.feeValue },
  feeDivider: { width: 1, height: 36, backgroundColor: color.card.divider },
  apply: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xxs,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: color.card.apply,
    paddingLeft: space.m,
    paddingRight: space.s,
  },
  applyText: { fontFamily: fontFamily.medium, fontSize: 12, color: color.textInverse },
});

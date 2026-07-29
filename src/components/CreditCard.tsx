/**
 * Credit-card card — built to the "Mini App Main" spec (Figma
 * `9RfW1gNewOnFDsNqaHsRoF`, frame 4007:57107, component 731:33245), transcribed
 * rather than approximated (D061). Every number comes from `CARD_SPEC` and every
 * colour from `color.card`; the vectors are the frame's own exports
 * ([icons/cardIcons](../icons/cardIcons.tsx)).
 *
 * Composition, top to bottom:
 *
 *   artwork 132×84 (r6) · title 16/22 + the CK-Orange cashback pill   ← gap 11, bottom-aligned
 *   ─ 19 ─
 *   USP tags (0.86px cool stroke over a blue→white wash)              ← gap 4, wraps
 *   ─ 7 ─
 *   USP rows: an 18px stroked glyph from the spec's own icon set + 12/14 copy,
 *   one line each, ellipsised (D065)
 *   ─ 10 ─
 *   the closing strip: either the two fee columns split by a fading 45px hairline,
 *   or the LIFETIME FREE band — both ending in the same 108×40 gradient CTA
 *
 * Two knowing deviations from the mock, both because the mock is a fixed 328×268
 * frame and this card is fluid inside the SERP's 20px column:
 *
 *  1. **Width is fluid**, so the info column and the strips flex instead of sitting
 *     at 161 / 318 / 312 px, and the USP copy clips to one line at whatever width
 *     that leaves rather than at the mock's 280.4 (D065). Every fixed metric that
 *     reads as a *size* — artwork, pill height, CTA, glyph, hairline — is exact.
 *  2. **Insets are symmetric** (16 for content, 8 for the strip). The mock's
 *     absolute frames drift: its details box sits 2px off the left edge and 8 off
 *     the right, and its LIFETIME FREE band is centred 3px right of centre.
 *
 * The cashback pill is ORANGE here while every other cashback figure in the app is
 * cobalt (D056). That is the spec's own call — it paints the CK Orange variable —
 * and it is scoped to this component only (D061).
 */
import React from 'react';
import { View, Text, Image, Pressable, StyleSheet, ImageSourcePropType } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ResultItem, Benefit, Fees } from '../data/dataContract';
import { color, type as t, space, radius, fontFamily, elevation, CARD_SPEC } from '../theme/tokens';
import { ApplyChevron, CardBenefitIcon, FeeDivider, benefitIconFor } from '../icons/cardIcons';

export function CreditCard({ item, index = 0, inviteOnly }: { item: ResultItem; index?: number; inviteOnly?: boolean }) {
  const tags = (item.benefitTags ?? []).slice(0, 3);
  const bullets = (item.benefitBullets ?? []).slice(0, 2);
  const cb = item.cashback;
  const cashbackValue =
    cb.type === 'flat_inr' ? `₹${cb.value.toLocaleString('en-IN')}` : cb.type === 'pct_single' ? `${cb.value}%` : cb.type === 'pct_range' ? `${cb.max}%` : null;
  // The spec writes the qualifier in Medium ahead of the ExtraBold figure: "Upto
  // ₹1200 Cashback" / "Flat ₹1400 Cashback". `prefix` is the feed's own word.
  const prefix = (cb.type === 'flat_inr' || cb.type === 'pct_single') && cb.prefix === 'flat' ? 'Flat' : 'Upto';
  const cta = item.ctaLabel ?? 'Apply Now';

  return (
    <Animated.View entering={FadeIn.delay(Math.min(index * 40, 200)).duration(220)} style={styles.card}>
      {inviteOnly && (
        <View style={styles.ribbon}>
          <Text style={styles.ribbonText}>INVITE ONLY</Text>
        </View>
      )}

      {/* artwork + name + cashback pill — bottom-aligned, so a two-line name grows
          upward and the pill stays level with the bottom of the artwork. */}
      <View style={styles.top}>
        <View style={styles.artClip}>
          <Image source={(item.artwork ?? item.logo) as ImageSourcePropType} style={styles.art} resizeMode="cover" />
        </View>
        <View style={styles.info}>
          <View style={styles.titleWrap}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
          </View>
          {cashbackValue && (
            <LinearGradient
              // 100°, three stops: the orange is strongest at the leading edge and
              // has all but vanished by the trailing one.
              colors={[color.card.pillOrange1, color.card.pillOrange2, color.card.pillOrange3]}
              locations={[0.023, 0.291, 0.977]}
              start={{ x: 0, y: 0.05 }}
              end={{ x: 1, y: 0.95 }}
              style={styles.pill}
            >
              <Text style={styles.pillPrefix}>{prefix} </Text>
              <Text style={styles.pillValue}>{cashbackValue} Cashback</Text>
            </LinearGradient>
          )}
        </View>
      </View>

      <View style={styles.group}>
        {tags.length > 0 && (
          <View style={styles.tags}>
            {tags.map((tag, i) => (
              <Tag key={i} label={tag.label} />
            ))}
          </View>
        )}

        {bullets.length > 0 && (
          <View style={styles.bullets}>
            {bullets.map((b, i) => (
              <BenefitRow key={i} benefit={b} />
            ))}
          </View>
        )}
      </View>

      {isLifetimeFree(item.fees) ? <LifetimeFreeStrip cta={cta} /> : <FeeStrip fees={item.fees} cta={cta} />}
    </Animated.View>
  );
}

/**
 * A USP tag. The fill is a diagonal wash of 4%-alpha blue into 4%-alpha white — on
 * white it is almost nothing, which is the point: the 0.86px cool stroke is what
 * draws the pill, and the wash only keeps it from looking like an outline.
 */
function Tag({ label }: { label: string }) {
  return (
    <LinearGradient
      colors={[color.card.tagFillFrom, color.card.tagFillTo]}
      locations={[0.095, 0.833]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.4, y: 1 }}
      style={styles.tag}
    >
      <Text style={styles.tagText}>{label}</Text>
    </LinearGradient>
  );
}

/**
 * One USP row: the spec's own glyph for what the line is about, then the copy on a
 * SINGLE line, ellipsised (D065). Two rows are two rows tall, whatever the feed
 * writes — a long benefit used to wrap to two lines and shift the whole closing
 * strip down, so a card's height depended on its copy rather than its content.
 */
function BenefitRow({ benefit }: { benefit: Benefit }) {
  return (
    <View style={styles.bulletRow}>
      <CardBenefitIcon name={benefitIconFor(benefit.text, benefit.icon)} />
      <Text style={styles.bulletText} numberOfLines={1}>
        {benefit.text}
      </Text>
    </View>
  );
}

/**
 * The fee strip: Annual then Joining (the spec's order — annual is the recurring
 * cost, so it leads), split by the fading hairline, with the CTA closing the row.
 */
function FeeStrip({ fees, cta }: { fees?: Fees; cta: string }) {
  if (!fees) return null;
  return (
    <View style={styles.strip}>
      <FeeCol label="Annual Fees" value={fees.annual} />
      <FeeDivider />
      <FeeCol label="Joining Fees" value={fees.joining} />
      <ApplyCta label={cta} />
    </View>
  );
}

function FeeCol({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.feeCol}>
      <Text style={styles.feeLabel}>{label}</Text>
      <Text style={styles.feeValue}>{value ?? 'Free'}</Text>
    </View>
  );
}

/**
 * The no-fee variant: the whole strip becomes a cream→mint→cream band stating the
 * card is free, in place of two columns of zeroes.
 */
function LifetimeFreeStrip({ cta }: { cta: string }) {
  return (
    <LinearGradient
      colors={[color.card.lftFrom, color.card.lftVia, color.card.lftTo]}
      locations={[0, 0.572, 1]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.lft}
    >
      <View style={styles.lftText}>
        {/* Figma paints this label with a green gradient whose ends sit at 70%
            alpha. RN can't gradient text without a mask layer, so it takes the
            ramp's own mid colour — the one the eye reads anyway. */}
        <Text style={styles.lftLabel}>LIFETIME FREE</Text>
        <Text style={styles.lftSub}>No Annual Fees •︎ No Joining Fees</Text>
      </View>
      <ApplyCta label={cta} />
    </LinearGradient>
  );
}

/** The CTA, identical in both strips: 108×40, 98° cobalt ramp, ExtraBold + chevron. */
function ApplyCta({ label }: { label: string }) {
  return (
    <View style={styles.applyBox}>
      <Pressable accessibilityRole="button" accessibilityLabel={label} style={styles.applyPress}>
        <LinearGradient
          colors={[color.card.applyFrom, color.card.applyTo]}
          locations={[0, 0.996]}
          start={{ x: 0, y: 0.31 }}
          end={{ x: 1, y: 0.69 }}
          style={styles.apply}
        >
          <Text style={styles.applyText}>{label}</Text>
          <ApplyChevron />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

/**
 * Which strip the card closes with. The feed says `state: 'free'` outright; the
 * fallback reads the two fee strings, because a card whose joining AND annual are
 * both nil/"free"/"lifetime free" is exactly what the spec's first variant is.
 */
function isLifetimeFree(fees?: Fees): boolean {
  if (!fees) return false;
  if (fees.state === 'free') return true;
  const free = (v?: string | null) => !v || /free|nil|^₹?0$/i.test(v.trim());
  return free(fees.joining) && free(fees.annual);
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.xl, // 16
    borderWidth: 1,
    borderColor: color.card.frameBorder,
    paddingTop: CARD_SPEC.padTop,
    paddingBottom: CARD_SPEC.padBottom,
    paddingHorizontal: CARD_SPEC.padX,
    // 0 8 16 rgba(0,0,0,0.05) — a wider, softer drop than the old 0 2 4. `boxShadow`
    // is the web half of the same spec (RN-web ignores shadowRadius).
    ...elevation.card,
    boxShadow: '0px 8px 16px rgba(0,0,0,0.05)',
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

  top: { flexDirection: 'row', gap: CARD_SPEC.gapArtInfo, alignItems: 'flex-end' },
  artClip: { borderRadius: CARD_SPEC.artRadius, overflow: 'hidden' },
  art: { width: CARD_SPEC.artW, height: CARD_SPEC.artH },
  info: { flex: 1, gap: CARD_SPEC.infoGap },
  titleWrap: { paddingHorizontal: CARD_SPEC.titleInsetX },
  title: { fontFamily: fontFamily.semiBold, fontSize: 16, lineHeight: 22, color: color.card.title },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    height: CARD_SPEC.pillH,
    borderRadius: radius.full,
    paddingHorizontal: CARD_SPEC.pillPadX,
  },
  pillPrefix: { fontFamily: fontFamily.medium, fontSize: 13, color: color.card.pillText },
  pillValue: { fontFamily: fontFamily.extraBold, fontSize: 13, color: color.card.pillText },

  // 19 from the artwork block, 7 between the tags and the USP rows.
  group: { gap: CARD_SPEC.groupGap, marginTop: CARD_SPEC.topGap },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: CARD_SPEC.tagGap },
  tag: {
    borderWidth: 0.859,
    borderColor: color.card.tagStroke,
    borderRadius: radius.xs,
    paddingHorizontal: space.s + 2, // 10
    paddingVertical: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagText: { fontFamily: fontFamily.regular, fontSize: 11, lineHeight: 16.5, color: color.card.tagLabel },
  bullets: { gap: CARD_SPEC.benefitGap },
  bulletRow: { flexDirection: 'row', gap: CARD_SPEC.benefitGap, alignItems: 'center' },
  bulletText: { flex: 1, fontFamily: fontFamily.medium, fontSize: 12, lineHeight: 14, color: color.card.benefit },

  // Both strips hang 8px off the card's edges, so they close the card rather than
  // sitting in the same column as the copy.
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: CARD_SPEC.feeStripH,
    borderRadius: CARD_SPEC.stripRadius,
    paddingVertical: CARD_SPEC.stripPadY,
    marginTop: CARD_SPEC.stripGap,
    marginHorizontal: CARD_SPEC.stripPadX - CARD_SPEC.padX,
  },
  feeCol: {
    flex: 1,
    alignItems: 'center',
    gap: CARD_SPEC.feeGap,
    paddingHorizontal: CARD_SPEC.feeColPad,
    paddingVertical: CARD_SPEC.feeColPad,
  },
  feeLabel: { fontFamily: fontFamily.regular, fontSize: 11, lineHeight: 12.6, color: color.card.feeLabel },
  feeValue: { fontFamily: fontFamily.semiBold, fontSize: 14, lineHeight: 16, color: color.card.feeValue },

  lft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: CARD_SPEC.stripRadius,
    borderWidth: 1,
    borderColor: color.card.lftBorder,
    paddingVertical: CARD_SPEC.stripPadY,
    marginTop: CARD_SPEC.stripGap,
    marginHorizontal: CARD_SPEC.stripPadX - CARD_SPEC.padX,
  },
  lftText: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  lftLabel: { fontFamily: fontFamily.extraBold, fontSize: 16, lineHeight: 16, color: color.card.lftLabel },
  lftSub: { fontFamily: fontFamily.medium, fontSize: 10, lineHeight: 16, color: color.card.lftSub },

  applyBox: { paddingHorizontal: CARD_SPEC.feeColPad, paddingVertical: CARD_SPEC.feeColPad },
  applyPress: { borderRadius: CARD_SPEC.applyRadius },
  apply: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: CARD_SPEC.applyGap,
    width: CARD_SPEC.applyW,
    height: CARD_SPEC.applyH,
    borderRadius: CARD_SPEC.applyRadius,
  },
  applyText: { fontFamily: fontFamily.extraBold, fontSize: 12, lineHeight: 12, color: color.textInverse },
});

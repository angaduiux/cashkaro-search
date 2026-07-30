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
 * As the resolved best match the card renders `bleed` (D104): the FRAME comes off —
 * fill, border, shadow and padding — and it sits directly on the HeroBleed scene in
 * its issuer's hue, the way a store's best match unboxes (D069). Everything inside
 * stays at spec; only the box goes.
 *
 * The cashback pill is ORANGE here while every other cashback figure in the app is
 * cobalt (D056). That is the spec's own call — it paints the CK Orange variable —
 * and it is scoped to this component only (D061).
 *
 * `CashbackPill`, `Tag` and `ApplyCta` are exported because
 * [LoanCard](./LoanCard.tsx) renders the loan archetype in this same visual system
 * and must not re-draw them (D089). This file stays the single source for all three.
 * The USP row is NOT shared: its glyph set is card perks, so a loan writes its own
 * (D089).
 */
import React from 'react';
import { View, Text, Image, Pressable, StyleSheet, ImageSourcePropType } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ResultItem, Benefit, Fees, Cashback } from '../data/dataContract';
import { color, type as t, space, radius, fontFamily, elevation, CARD_SPEC } from '../theme/tokens';
import { ApplyChevron, CardBenefitIcon, FeeDivider, benefitIconFor } from '../icons/cardIcons';
import { Icon } from '../icons/Icon';
import { Shine } from '../motion/Shine';

export function CreditCard({
  item,
  index = 0,
  inviteOnly,
  bleed = false,
}: {
  item: ResultItem;
  index?: number;
  inviteOnly?: boolean;
  /** Best-match hero on a HeroBleed scene (D104): the frame comes off — no fill,
   *  border, shadow or padding of its own — and the page column's 20px becomes the
   *  card's only inset, exactly as the store hero unboxes (D071). Every INTERNAL
   *  metric stays at spec; this drops the box, not the layout. */
  bleed?: boolean;
}) {
  const tags = (item.benefitTags ?? []).slice(0, 3);
  const bullets = (item.benefitBullets ?? []).slice(0, 2);
  const cta = item.ctaLabel ?? 'Apply Now';

  return (
    <Animated.View
      entering={FadeIn.delay(Math.min(index * 40, 200)).duration(220)}
      style={[styles.card, bleed && styles.cardBleed]}
    >
      {inviteOnly && (
        <View style={styles.ribbon}>
          <Text style={styles.ribbonText}>INVITE ONLY</Text>
        </View>
      )}

      {/* artwork + name + cashback pill — bottom-aligned, so a two-line name grows
          upward and the pill stays level with the bottom of the artwork. */}
      <View style={styles.top}>
        <View style={styles.artClip}>
          {item.artwork ? (
            <Image source={item.artwork as ImageSourcePropType} style={styles.art} resizeMode="cover" />
          ) : (
            <ArtPending issuerLogo={item.issuerLogo} logo={item.logo} />
          )}
        </View>
        <View style={styles.info}>
          <View style={styles.titleWrap}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
          </View>
          <CashbackPill cashback={item.cashback} onScene={bleed} />
        </View>
      </View>

      <View style={styles.group}>
        {tags.length > 0 && (
          <View style={[styles.tags, bleed && styles.tagsScene]}>
            {tags.map((tag, i) => (
              // On the scene each pill fills itself white (D108) — the spec's 4%-alpha
              // blue→white ramp was drawn to sit ON white, and the scene's blue is not.
              <Tag key={i} label={tag.label} onScene={bleed} />
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

      {/* Unboxed hero (D109): the closing strip keeps only the facts and the CTA
          leaves it for the brand hero's full-width sticky CTA below, so a resolved
          card and a resolved store close their pages with the same button. Both fee
          columns then flex against nothing but each other, which is what centres
          them under the copy instead of crowding left of a 108px box. */}
      {isLifetimeFree(item.fees) ? (
        <LifetimeFreeStrip cta={cta} bleed={bleed} />
      ) : (
        <FeeStrip fees={item.fees} cta={cta} bleed={bleed} />
      )}

      {bleed && <HeroCta label={cta} />}
    </Animated.View>
  );
}

/**
 * The resolved card's closing CTA, on the store hero's sticky-CTA spec (Figma
 * 1716:74837 → [StoreHero](./ResultCards.tsx) `heroCta`, D109): full width, 48 tall,
 * r12, CK Orange, a 16/SemiBold label and the 45°-turned `earn` arrow at gap 4, under
 * the same looping soft-light shine (D070). A best match closes the same way whether
 * it is a brand or a card; only the label differs, and that comes from the feed.
 *
 * The metrics are read from `StoreHero`'s own tokens rather than restated, so the two
 * buttons cannot drift apart.
 */
function HeroCta({ label }: { label: string }) {
  return (
    <Shine repeat blend="soft-light" delay={900} style={styles.heroCtaShine}>
      <Pressable style={styles.heroCta} onPress={() => {}} accessibilityRole="button" accessibilityLabel={label}>
        <Text style={styles.heroCtaText} numberOfLines={1}>
          {label}
        </Text>
        {/* 45° turns the icon subset's arrow-up into the spec's arrow-up-right. */}
        <View style={styles.heroCtaArrow}>
          <Icon name="earn" size={12} color={color.textInverse} />
        </View>
      </Pressable>
    </Shine>
  );
}

/**
 * The artwork slot for a card whose plastic render this project does not have (D107):
 * the issuer's wordmark, contained, on a plain `surfaceAlt` plate at the artwork's exact
 * 132×84. It deliberately does NOT imitate a card — a fabricated render would be an
 * un-sourced picture of a real product, and the old `artwork ?? logo` fallback stretched
 * a 16px favicon across the slot (D003's rule, one archetype over). It reads as "art
 * pending" and swaps out the moment a real export lands in `assets/cards/`.
 */
function ArtPending({ issuerLogo, logo }: { issuerLogo?: number | null; logo: ResultItem['logo'] }) {
  const mark = issuerLogo ?? logo;
  return (
    <View style={[styles.art, styles.artPending]}>
      {mark != null && <Image source={mark as ImageSourcePropType} style={styles.artPendingMark} resizeMode="contain" />}
    </View>
  );
}

/**
 * The CK-Orange cashback pill — `none` (and a range with no max) renders NOTHING,
 * never a zero. The spec writes the qualifier in Medium ahead of the ExtraBold
 * figure: "Upto ₹1200 Cashback" / "Flat ₹1400 Cashback"; `prefix` is the feed's
 * own word. Shared with [LoanCard](./LoanCard.tsx) so a loan's reward shows the same
 * pill in the same place (D089) — `noun` is the only difference, because the tile set
 * captions a loan merchant's figure REWARDS, not CASHBACK.
 */
export function CashbackPill({ cashback: cb, noun = 'Cashback', onScene }: { cashback: Cashback; noun?: string; onScene?: boolean }) {
  const value =
    cb.type === 'flat_inr' ? `₹${cb.value.toLocaleString('en-IN')}` : cb.type === 'pct_single' ? `${cb.value}%` : cb.type === 'pct_range' ? `${cb.max}%` : null;
  if (!value) return null;
  const prefix = (cb.type === 'flat_inr' || cb.type === 'pct_single') && cb.prefix === 'flat' ? 'Flat' : 'Upto';
  const pill = (
    <LinearGradient
      // 100°, three stops: the orange is strongest at the leading edge and
      // has all but vanished by the trailing one.
      //
      // On the scene the ramp goes WHITE (D110). The spec's orange-on-orange-tint is a
      // figure at low contrast, and on the blue wash the tint all but disappears —
      // white gives the CK Orange the most contrast the palette has, so the figure
      // reads as the loudest thing on the card, which is what it is.
      colors={
        onScene
          ? [color.card.pillWhite1, color.card.pillWhite2, color.card.pillWhite3]
          : [color.card.pillOrange1, color.card.pillOrange2, color.card.pillOrange3]
      }
      locations={[0.023, 0.291, 0.977]}
      start={{ x: 0, y: 0.05 }}
      end={{ x: 1, y: 0.95 }}
      style={[styles.pill, onScene && styles.pillScene]}
    >
      <Text style={styles.pillPrefix}>{prefix} </Text>
      <Text style={[styles.pillValue, onScene && styles.pillValueScene]}>
        {value} {noun}
      </Text>
    </LinearGradient>
  );
  if (!onScene) return pill;
  // The figure earns the page's one repeating shimmer besides the CTA (D110). Tinted,
  // because Shine's default band is white and this pill now is too; on a slower period
  // than the CTA's so the two never read as one synchronised pulse.
  return (
    <Shine repeat period={5200} delay={1400} tint={color.card.pillSheen} style={styles.pillShine}>
      {pill}
    </Shine>
  );
}

/**
 * A USP tag. The fill is a diagonal wash of 4%-alpha blue into 4%-alpha white — on
 * white it is almost nothing, which is the point: the 0.86px cool stroke is what
 * draws the pill, and the wash only keeps it from looking like an outline.
 *
 * `onScene` swaps that fill for a white one on the SAME diagonal (D108): unboxed on the
 * HeroBleed wash there is no white under the pill for a 4%-alpha ramp to sit on, so each
 * pill carries its own — per pill, so the fill follows the pill's own silhouette and a
 * wrapped row has no band running behind it. The stroke, radius, padding and type are
 * untouched; only what fills the shape changes.
 */
export function Tag({ label, onScene }: { label: string; onScene?: boolean }) {
  return (
    <LinearGradient
      colors={onScene ? [color.card.tagFillSceneFrom, color.card.tagFillSceneTo] : [color.card.tagFillFrom, color.card.tagFillTo]}
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
function FeeStrip({ fees, cta, bleed }: { fees?: Fees; cta: string; bleed?: boolean }) {
  if (!fees) return null;
  return (
    <View style={[styles.strip, bleed && styles.stripBleed]}>
      <FeeCol label="Annual Fees" value={fees.annual} />
      <FeeDivider />
      <FeeCol label="Joining Fees" value={fees.joining} />
      {/* On the hero the button is the full-width one below (D109). */}
      {!bleed && <ApplyCta label={cta} />}
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
function LifetimeFreeStrip({ cta, bleed }: { cta: string; bleed?: boolean }) {
  return (
    <LinearGradient
      colors={[color.card.lftFrom, color.card.lftVia, color.card.lftTo]}
      locations={[0, 0.572, 1]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={[styles.lft, bleed && styles.stripBleed]}
    >
      <View style={styles.lftText}>
        {/* Figma paints this label with a green gradient whose ends sit at 70%
            alpha. RN can't gradient text without a mask layer, so it takes the
            ramp's own mid colour — the one the eye reads anyway. */}
        <Text style={styles.lftLabel}>LIFETIME FREE</Text>
        <Text style={styles.lftSub}>No Annual Fees •︎ No Joining Fees</Text>
      </View>
      {/* As in the fee strip: the hero's button is the full-width one below (D109),
          and the band's own text block centres in the whole width without it. */}
      {!bleed && <ApplyCta label={cta} />}
    </LinearGradient>
  );
}

/**
 * The CTA, identical in both strips: 108×40, 98° cobalt ramp, ExtraBold + chevron.
 *
 * `fluid` keeps the height, ramp and type but lets the box grow past 108 from its
 * own padding — for labels longer than the spec's "Apply Now" ("Check eligibility"
 * on a loan, D089), which at 108 fixed would wrap to two lines inside a 40px box.
 */
export function ApplyCta({ label, fluid }: { label: string; fluid?: boolean }) {
  return (
    <View style={styles.applyBox}>
      <Pressable accessibilityRole="button" accessibilityLabel={label} style={styles.applyPress} hitSlop={4}>
        <LinearGradient
          colors={[color.card.applyFrom, color.card.applyTo]}
          locations={[0, 0.996]}
          start={{ x: 0, y: 0.31 }}
          end={{ x: 1, y: 0.69 }}
          style={[styles.apply, fluid ? styles.applyFluid : styles.applyFixed]}
        >
          <Text style={styles.applyText} numberOfLines={1}>
            {label}
          </Text>
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
  // Unboxed hero on a HeroBleed scene (D104). The shadow has to be cancelled on
  // BOTH halves of the spec above — `elevation.card`'s native props and the web
  // `boxShadow` — or RN-web keeps casting a drop shadow from a card that no longer
  // exists. Padding goes to 0: the page column's 20px is the whole inset (D071).
  cardBleed: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    // The SAME longhands the base style sets — `padding: 0` would not win, since
    // paddingTop/-Bottom/-Horizontal outrank the shorthand whatever the array order.
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    shadowOpacity: 0,
    shadowColor: 'transparent',
    elevation: 0,
    boxShadow: 'none',
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
  // The stand-in plate (D107): the artwork's own box, filled and hairlined, with the
  // wordmark centred at 60% of the width — the proportion the tile's issuer chip uses.
  artPending: {
    backgroundColor: color.surfaceAlt,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.card.frameBorder,
    borderRadius: CARD_SPEC.artRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artPendingMark: { width: CARD_SPEC.artW * 0.6, height: CARD_SPEC.artH * 0.4 },
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
  // On the scene: a hairline of the pill's own orange so the white plate has an edge
  // against the wash, and room for the bigger figure inside the spec's 33px height.
  pillScene: { borderWidth: 1, borderColor: color.card.pillSceneBorder, paddingHorizontal: CARD_SPEC.pillPadX - 1 },
  // The Shine wrap must hug the pill, not the info column — `alignSelf` moves off the
  // pill onto the wrap, or the sweep crosses the whole row's width (D110).
  pillShine: { alignSelf: 'flex-start', borderRadius: radius.full },
  pillPrefix: { fontFamily: fontFamily.medium, fontSize: 13, color: color.card.pillText },
  pillValue: { fontFamily: fontFamily.extraBold, fontSize: 13, color: color.card.pillText },
  // The figure only — the "Flat" qualifier stays at 13, so the number grows against it
  // rather than the whole line growing together (D110).
  pillValueScene: { fontSize: CARD_SPEC.pillValueScene },

  // 19 from the artwork block, 7 between the tags and the USP rows.
  group: { gap: CARD_SPEC.groupGap, marginTop: CARD_SPEC.topGap },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: CARD_SPEC.tagGap },
  // On the scene the pills are opaque plates rather than the near-invisible outlines
  // the spec's 7px gap was set for, so the row needs its own air below it (D108). The
  // `group` gap stays at spec; this is the extra, and only the hero carries it.
  tagsScene: { marginBottom: CARD_SPEC.sceneTagGap - CARD_SPEC.groupGap },
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
  // With no card padding left to hang out of, that -8 would pull the strip OUTSIDE
  // the page column and leave the fees 8px left of the copy above them (D104).
  stripBleed: { marginHorizontal: 0 },
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

  // The store hero's sticky CTA, verbatim (D109) — same 48/r12/CK-Orange box, same
  // 16/SemiBold label, same 45° arrow. `heroCtaShine` carries the radius so Shine's
  // `overflow: hidden` clips the sweep to the button silhouette.
  heroCtaShine: { alignSelf: 'stretch', borderRadius: radius.lg, marginTop: CARD_SPEC.heroCtaGap },
  heroCta: {
    alignSelf: 'stretch',
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: color.ckds.ctaHero,
    flexDirection: 'row',
    gap: space.xs,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.m,
  },
  heroCtaText: { fontFamily: fontFamily.semiBold, fontSize: 16, color: color.textInverse, flexShrink: 1 },
  heroCtaArrow: { transform: [{ rotateZ: '45deg' }] },

  applyBox: { paddingHorizontal: CARD_SPEC.feeColPad, paddingVertical: CARD_SPEC.feeColPad },
  applyPress: { borderRadius: CARD_SPEC.applyRadius },
  apply: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: CARD_SPEC.applyGap,
    height: CARD_SPEC.applyH,
    borderRadius: CARD_SPEC.applyRadius,
  },
  applyFixed: { width: CARD_SPEC.applyW },
  applyFluid: { minWidth: CARD_SPEC.applyW, paddingHorizontal: space.s12 },
  // SemiBold, not ExtraBold, and on a line box TALLER than the size (D093): at
  // lineHeight 12 the label sat below the CTA's centre, because Outfit's ascent is
  // far deeper than its descent and a clamped line box can't absorb it.
  applyText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    lineHeight: CARD_SPEC.applyLineH,
    textAlign: 'center',
    color: color.textInverse,
  },
});

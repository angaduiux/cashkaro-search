/**
 * Loan card — a personal-loan result drawn in the credit-card card's visual system
 * (D089). Frame, artwork block, USP tag pills, benefit rows and the closing strip
 * with its gradient CTA all come from [CreditCard](./CreditCard.tsx) and
 * `CARD_SPEC` / `color.card`, so a results page that stacks loans under cards
 * reads as one component family instead of two design languages.
 *
 * Composition, top to bottom — the same rhythm as the card, with a loan's own facts
 * in place of a card's joining/annual fees:
 *
 *   lender mark 64×64 · title 16/22 + the reward pill          ← gap 11
 *   ─ 19 ─
 *   tags: the disclosed top-pick reason, then tenure, then processing fee
 *   ─ 7 ─
 *   USP rows: the lender's own bullets, tick in the 18px glyph slot + one
 *   ellipsised line (D065)
 *   ─ 10 ─
 *   closing strip: Est. EMI │ fading hairline │ Interest, then the CTA
 *
 * Five deliberate differences from the card, each forced by what a loan is:
 *
 *  1. **The mark is 64 square** (`LOAN_SPEC`), not 132×84 artwork. Lender logos are
 *     square app-icon PNGs (`assets/lenders/*.png`, 120×120) — a 132×84 `cover` crop
 *     slices them, and at the artwork's own 84 an app icon beside a one-line name
 *     outweighed everything else on the card.
 *  2. **It carries no frame**, sits on the Storepage tile set's neutral wash, and is
 *     clipped at the 22% squircle those icons are drawn to — over a 1.07 overscan, so
 *     the clip trims each source's outermost pixels (`bajaj-finserv.png` has a dashed
 *     1px stroke baked onto its edge, which at 64px read as a dotted ring). A border of
 *     our own read as a double stroke, and insetting the mark only shrank the logo.
 *  3. **The USP tick replaces the card's glyph set** — see `UspRow` below.
 *  4. **The CTA is fluid** (`ApplyCta fluid`): "Check eligibility" does not fit the
 *     spec's fixed 108 at 12px ExtraBold, and drops to its own row on a narrow
 *     device rather than truncate a rupee figure (`STRIP_WRAP_BELOW`).
 *  5. **Tenure and the processing fee are tags, not strip columns.** The strip has
 *     room for two figures beside the CTA, and for a loan the two that decide the
 *     choice are the monthly outgo and the rate; tenure and fee qualify them.
 *
 * When a loan carries no reward the top block centres instead of bottom-aligning: with
 * no pill under it the title would otherwise hang at the foot of the mark.
 *
 * Nothing here computes a figure (D004): EMI, rate, tenure and fee are preformatted
 * feed strings, and an un-sourced one renders the loud placeholder instead of a
 * plausible number (D005). The two-column mapping — `fees.joining` is the
 * processing fee and `fees.annual` the maximum tenure for a `07_loan` — is the data
 * contract's own, and matches [FinanceCard](./FinanceCard.tsx)'s reading of it.
 */
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ImageSourcePropType, LayoutChangeEvent } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ResultItem } from '../data/dataContract';
import { color, space, radius, fontFamily, elevation, CARD_SPEC, LOAN_SPEC } from '../theme/tokens';
import { FeeDivider } from '../icons/cardIcons';
import { Icon } from '../icons/Icon';
import { ApplyCta, CashbackPill, Tag } from './CreditCard';
import { PlaceholderPill, isPlaceholderValue } from './atoms';

/** The lender mark: 64 square, clipped to its own squircle (`LOAN_SPEC`). */
const TILE = LOAN_SPEC.markW;

/**
 * Below this strip width the CTA drops to its own row. "Check eligibility" is a
 * ~150px box; two figures beside it need ~170 more, and on a 320pt device the strip
 * is only 264 — which truncated the EMI to "₹10,7…". A rupee figure must never
 * ellipsise, so the row breaks instead. (The credit card never hits this: "Get this
 * card" fits the spec's fixed 108.)
 */
const STRIP_WRAP_BELOW = 300;

export function LoanCard({ item, index = 0 }: { item: ResultItem; index?: number }) {
  const bullets = (item.benefitBullets ?? []).slice(0, 2);
  const tenure = sourced(item.fees?.annual);
  const fee = sourced(item.fees?.joining);
  const cta = item.ctaLabel ?? 'Check eligibility';

  // The disclosed ranking reason leads (it is why this loan sits where it does,
  // §6.6), then whatever the feed tags, then the two qualifying numbers.
  const tags = [
    item.topPick?.reason,
    ...(item.benefitTags ?? []).map((b) => b.label),
    tenure && `${tenure} tenure`,
    fee && `${fee} processing fee`,
  ]
    .filter((label): label is string => !!label)
    .slice(0, 3);

  // With a pill the info column is bottom-aligned like the card's, so a two-line
  // name grows upward off the tile's bottom edge. Without one (no CashKaro reward on
  // this loan) that leaves the title stranded at the foot of an 84px tile with a
  // white field above it — so it centres instead.
  const hasPill = item.cashback.type !== 'none';
  const [wrapped, setWrapped] = useState(false);
  const onStripLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setWrapped(w < STRIP_WRAP_BELOW);
  };
  const rate = item.rate;
  const ratePlaceholder = !!rate && rate.display.startsWith('PLACEHOLDER');
  const emiPlaceholder = isPlaceholderValue(item.emi);
  const hasEmi = !!item.emi;
  const hasRate = !!rate;

  return (
    <Animated.View entering={FadeIn.delay(Math.min(index * 40, 200)).duration(220)} style={styles.card}>
      <View style={[styles.top, !hasPill && styles.topCentred]}>
        {/* No logo ⇒ no tile: an empty 84 box would only push the title off the
            card's left edge for nothing. */}
        {item.logo != null && (
          <View style={[styles.tile, !!item.logoBg && item.logoBg !== 'transparent' && { backgroundColor: item.logoBg }]}>
            <Image source={item.logo as ImageSourcePropType} style={styles.logo} resizeMode="contain" />
          </View>
        )}
        <View style={styles.info}>
          <View style={styles.titleWrap}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
          </View>
          {/* A loan merchant's figure is captioned REWARDS in the tile set it comes
              from, so the pill says Rewards where a card's says Cashback. */}
          <CashbackPill cashback={item.cashback} noun={item.cashbackCaption === 'REWARDS' ? 'Rewards' : 'Cashback'} />
        </View>
      </View>

      {/* The whole middle block is conditional: an empty one still spent its 19px
          top gap, which read as a hole between the name and the strip. */}
      {(tags.length > 0 || bullets.length > 0) && (
        <View style={styles.group}>
          {tags.length > 0 && (
            <View style={styles.tags}>
              {tags.map((label, i) => (
                <Tag key={i} label={label} />
              ))}
            </View>
          )}

          {bullets.length > 0 && (
            <View style={styles.bullets}>
              {bullets.map((b, i) => (
                <UspRow key={i} text={b.text} />
              ))}
            </View>
          )}
        </View>
      )}

      <View
        style={[styles.strip, wrapped && styles.stripWrapped]}
        // The strip is always the card's full width, so its measurement doesn't
        // change when the layout inside it does — no feedback loop.
        onLayout={onStripLayout}
      >
        <View style={[styles.facts, wrapped && styles.factsWrapped]}>
          {hasEmi && (
            <Fact label="Est. EMI">
              {/* "not sourced" alone: the label above already says which figure this
                  is, and a longer string wraps out of the 60px strip. */}
              {emiPlaceholder ? <PlaceholderPill label="not sourced" /> : <Value text={item.emi!} />}
            </Fact>
          )}
          {hasEmi && hasRate && <FeeDivider />}
          {/* Short labels: the strip's columns shrink hard on a small device, where
              "Interest rate" ellipsised and "Interest" fits. */}
          {hasRate && (
            <Fact label={rate!.kind === 'cost' ? 'Interest' : 'Interest earned'}>
              {ratePlaceholder ? <PlaceholderPill label="not sourced" /> : <Value text={rate!.display} />}
            </Fact>
          )}
        </View>
        <ApplyCta label={cta} fluid />
      </View>
    </Animated.View>
  );
}

/**
 * One loan USP: a quiet tick in the credit card's own 18px glyph slot, then the copy
 * on one ellipsised line (D065) in the card's benefit type.
 *
 * The card's glyph set (Figma "Card Icons" 714:32723) is all card perks — lounge,
 * cloche, fuel pump, trophy — and every loan line fell through to its `reward`
 * trophy, so "No collateral or guarantor" got a trophy beside it. Rather than force
 * a wrong metaphor or invent vectors the design system doesn't have, a loan row takes
 * the neutral tick at the same size, colour and opacity as those glyphs.
 */
function UspRow({ text }: { text: string }) {
  return (
    <View style={styles.uspRow}>
      <View style={styles.uspIcon}>
        <Icon name="check" size={13} color={color.card.bulletIcon} />
      </View>
      <Text style={styles.uspText} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

/** One labelled figure in the closing strip — the card's fee column, relabelled. */
function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factLabel} numberOfLines={1}>
        {label}
      </Text>
      {children}
    </View>
  );
}

/** A strip figure. One line, ellipsised: the strip's height is fixed at 60 (D065). */
function Value({ text }: { text: string }) {
  return (
    <Text style={styles.factValue} numberOfLines={1}>
      {text}
    </Text>
  );
}

/** A feed string that is really a placeholder shows up as nothing in a tag — the
 *  loud flag belongs on the strip's figures, not on three pills of warnings. */
const sourced = (v?: string | null) => (!v || isPlaceholderValue(v) ? null : v);

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.xl, // 16
    borderWidth: 1,
    borderColor: color.card.frameBorder,
    paddingTop: CARD_SPEC.padTop,
    paddingBottom: CARD_SPEC.padBottom,
    paddingHorizontal: CARD_SPEC.padX,
    ...elevation.card,
    boxShadow: '0px 8px 16px rgba(0,0,0,0.05)',
  } as any,

  top: { flexDirection: 'row', gap: CARD_SPEC.gapArtInfo, alignItems: 'flex-end' },
  topCentred: { alignItems: 'center' },
  // No frame, no stroke: every lender mark in `assets/lenders/` is an app-icon PNG that
  // already carries its own rounded edge, so a border read as a double stroke and
  // insetting the logo inside one only shrank the mark — the artwork IS the tile,
  // clipped at the squircle radius those icons are drawn to.
  //
  // Behind it sits the Storepage Tiles frame's own neutral wash — the tint every loan
  // merchant's tile uses there (611:3360, rows 10–12). It is invisible under a
  // full-bleed mark (Axis, HDFC) and does the work on a WHITE one (Bajaj Finserv):
  // white-on-white left only the icon's antialiased corner arcs to define the shape,
  // which at this size broke into a dotted ring. The wash gives those corners
  // something to sit against, so the silhouette reads clean.
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: LOAN_SPEC.markRadius,
    backgroundColor: color.ckds.tileWash,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  // Drawn a touch larger than the clip, so the source PNG's own edge stroke lands
  // outside it (see LOAN_SPEC.markOverscan).
  logo: { width: Math.round(TILE * LOAN_SPEC.markOverscan), height: Math.round(TILE * LOAN_SPEC.markOverscan) },
  info: { flex: 1, gap: CARD_SPEC.infoGap },
  titleWrap: { paddingHorizontal: CARD_SPEC.titleInsetX },
  title: { fontFamily: fontFamily.semiBold, fontSize: 16, lineHeight: 22, color: color.card.title },

  group: { gap: CARD_SPEC.groupGap, marginTop: CARD_SPEC.topGap },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: CARD_SPEC.tagGap },
  bullets: { gap: CARD_SPEC.benefitGap },
  uspRow: { flexDirection: 'row', gap: CARD_SPEC.benefitGap, alignItems: 'center' },
  // The glyph slot is the card's 18px frame, so the copy starts on the same x as a
  // credit card's; the tick inside it carries the glyphs' own 50% opacity.
  uspIcon: {
    width: CARD_SPEC.benefitIcon,
    height: CARD_SPEC.benefitIcon,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: color.card.bulletIconOpacity,
  },
  uspText: { flex: 1, fontFamily: fontFamily.medium, fontSize: 12, lineHeight: 14, color: color.card.benefit },

  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: CARD_SPEC.feeStripH,
    borderRadius: CARD_SPEC.stripRadius,
    paddingVertical: CARD_SPEC.stripPadY,
    marginTop: CARD_SPEC.stripGap,
    marginHorizontal: CARD_SPEC.stripPadX - CARD_SPEC.padX,
  },
  // Narrow devices only: the figures keep their row, the CTA takes the next one and
  // spans it, and the strip's height becomes its content's.
  // `height: 'auto'`, not `undefined` — RN-web drops undefined values when it
  // flattens the style array, so the fixed 60 survived and the rows overlapped.
  stripWrapped: { flexDirection: 'column', alignItems: 'stretch', height: 'auto' },
  facts: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  // All three flex properties, not just `flexGrow`: `flex: 1` above also sets
  // `flexBasis: 0`, which in the wrapped column gave this row zero height and let
  // its figures overflow up into the benefit rows.
  factsWrapped: { flexGrow: 0, flexShrink: 0, flexBasis: 'auto', alignSelf: 'stretch' },
  fact: {
    flex: 1,
    alignItems: 'center',
    gap: CARD_SPEC.feeGap,
    paddingHorizontal: CARD_SPEC.feeColPad,
    paddingVertical: CARD_SPEC.feeColPad,
  },
  factLabel: { fontFamily: fontFamily.regular, fontSize: 11, lineHeight: 12.6, color: color.card.feeLabel },
  factValue: { fontFamily: fontFamily.semiBold, fontSize: 14, lineHeight: 16, color: color.card.feeValue },
});

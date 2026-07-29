/**
 * CouponTicket — the Store Page V2.0 coupon ticket, all three states.
 *
 * Spec: Figma "Store Page V2.0 — Deliverable" (`XgdQOrfPsC6HNv24uS9jgN`) node
 * **1835:16064 "Coupon"**, pulled with `get_design_context` + `get_variable_defs`
 * (AGENTS.md §Matching Figma — never eyeballed off a render). Its three component
 * variants map 1:1 to this component's `state`:
 *
 * | Figma variant             | `state`     | what changes |
 * |---------------------------|-------------|--------------|
 * | `Property 1=Default`      | `'default'` | cobalt code + copy icon |
 * | `Property 1=Variant3`     | `'copying'` | code dims to 40%, 36px spinner, `pr` 16→4 |
 * | `Property 1=Variant4`     | `'copied'`  | stub + border + label all turn green, 21px tick, `pr` 10 |
 *
 * Geometry, verbatim: card 328 × 152, radius 12, `drop-shadow(0 6px 5px
 * rgba(7,42,78,0.17))`. Columns 44 (stub) · 9 (perforation) · flex (body, 252 in the
 * frame) · 23 (right edge). Body `pt 12 / pb 20 / pl 10`, inner gap 8. Code field
 * h 35, radius 8, `py 8.21`, `pl 16`. Expiry ribbon 20 tall at `top -2 / left 4`.
 * Type is **Metropolis** because that is what the spec specifies (it is a store-page
 * deliverable, same family as the production app) — see D037.
 *
 * Artwork comes from the exported assets in
 * [icons/couponAssets.tsx](../icons/couponAssets.tsx); colours from
 * `color.coupon` in [theme/tokens.ts](../theme/tokens.ts).
 */
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { color, space } from '../theme/tokens';
import {
  CheckTickIcon,
  ClockIcon,
  CopyIcon,
  EdgeNotch,
  ExpiryRibbon,
  Perforation,
  RIBBON_W,
  RibbonFold,
  SeeDetailsChevron,
  StubBite,
} from '../icons/couponAssets';

export type CouponState = 'default' | 'copying' | 'copied';

/**
 * Card box — Figma 328 × **134** (node 10062:16020: the stub vector is 134 tall and
 * the body computes to the same: 12 + 32 + 9 + 18 + 8 + 35 + 20).
 *
 * A ticket that carries an expiry badge is taller by the band the badge occupies —
 * the badge hangs 2px over the top edge (spec `top -2 / left 4`), so it adds 18, not
 * its full 20. Deriving the height instead of hard-coding 152 is what keeps the
 * no-badge ticket from rendering its 134 of content inside a 152 box, centred, with
 * dead white above and below it.
 */
const CARD_H = 134;
const BADGE_BAND = 18;
const BADGE_OVERHANG = 2;
const STUB_W = 44;
const PERF_W = 9;
const EDGE_W = 23;
const NOTCH_H = 44;
/**
 * The frame places the perforation strip flush beside the stub, so its scallop bites
 * reveal the canvas — which is black there, giving the dashed tear line. On a white
 * page that reveals white and the line vanishes, so the strip is pulled 2px left and
 * the bites cut into the stub's gradient instead. Same read, any background.
 */
const PERF_OVERLAP = 2;

const FONT = {
  extrabold: 'Metropolis-ExtraBold',
  bold: 'Metropolis-Bold',
  semibold: 'Metropolis-SemiBold',
} as const;

/** One half of the stub's gradient column — the ramp above and below the notch. */
function Stripe({ copied }: { copied: boolean }) {
  return (
    <LinearGradient
      colors={
        copied
          ? [color.coupon.stubCopiedFrom, color.coupon.stubCopiedTo]
          : [color.coupon.stubFrom, color.coupon.stubVia, color.coupon.stubTo]
      }
      locations={copied ? [0, 1] : [0, 0.495192, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.stripe}
    />
  );
}

export function CouponTicket({
  title,
  subtitle,
  code,
  expiry,
  state: controlled,
  onCopy,
  onSeeDetails,
  showTag = true,
  showSeeDetails = true,
  showCta = true,
}: {
  title: string;
  /** Rendered as part of the SAME offer line as `title` — see D037. */
  subtitle?: string;
  code?: string;
  /** Ribbon label, e.g. "23h:25m". */
  expiry?: string;
  /** Leave undefined to let the ticket run its own copy → copying → copied cycle. */
  state?: CouponState;
  onCopy?: (code: string) => void;
  onSeeDetails?: () => void;
  showTag?: boolean;
  showSeeDetails?: boolean;
  showCta?: boolean;
}) {
  const [own, setOwn] = useState<CouponState>('default');
  const state = controlled ?? own;
  const copied = state === 'copied';

  // The ribbon art is drawn for the frame's 7-character timer; widen it when the
  // label is longer so the text stays inside it. 10px Metropolis SemiBold measures
  // ~5.8px/char with its 0.4 tracking; 37 clears the clock, 16 clears the taper.
  const ribbonW = Math.max(RIBBON_W, 37 + (expiry?.length ?? 0) * 5.8 + 16);
  const hasBadge = showTag && !!expiry;
  const cardH = hasBadge ? CARD_H + BADGE_BAND : CARD_H;

  const copy = () => {
    if (!code || state !== 'default') return;
    setOwn('copying');
    onCopy?.(code);
    // The design ships a spinner state, so the code is "claimed" before it lands.
    setTimeout(() => setOwn('copied'), 700);
  };

  return (
    <View style={[styles.card, { height: cardH }]}>
      {/* ── Stub: gradient column, bitten on its inner edge, vertical wordmark ── */}
      <View style={styles.stub}>
        {/* ONE gradient for the whole column, with the bite laid over it in the page's
            own white. Three stacked pieces (gradient · svg notch band · gradient) put
            two different gradient rasterisers edge to edge, which showed as a seam
            across the stub. */}
        <Stripe copied={copied} />
        <View style={[styles.stubBite, { top: (cardH - NOTCH_H) / 2 }]} pointerEvents="none">
          <StubBite />
        </View>
        <View style={styles.stubLabelWrap} pointerEvents="none">
          <Text style={styles.stubLabel}>COUPON</Text>
        </View>
      </View>

      {/* ── Perforation ─────────────────────────────────────────────────────── */}
      <View style={styles.perf}>
        <Perforation height={cardH} />
      </View>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <View style={styles.body}>
        {/* Spacer only — the badge art is an overlay on the CARD (below), so it can
            sit above the ticket's hairline and hang over its top edge. */}
        {hasBadge && <View style={styles.tagBand} />}

        <View style={styles.bodyPad}>
          {/* Title, subtitle and "See Details" are ONE block (D037). Figma's offer
              line is a single sentence ("Buy 3 for 999 + upto 15% cashback on all
              products.") while our data splits it in two, so the two halves are
              joined into that one line, and the affordance sits tight under it
              instead of the spec's 9px apart. */}
          <View style={styles.titleBlock}>
            <Text style={styles.title} numberOfLines={2}>
              {subtitle ? `${title} ${subtitle}` : title}
            </Text>
            {showSeeDetails && (
              <Pressable
                onPress={onSeeDetails}
                hitSlop={8}
                style={styles.seeDetails}
                accessibilityRole="button"
                accessibilityLabel="See details"
              >
                <Text style={styles.seeDetailsTxt}>See Details</Text>
                <SeeDetailsChevron tone={copied ? 'copied' : 'brand'} />
              </Pressable>
            )}
          </View>

          {showCta && !!code && (
            <Pressable
              onPress={copy}
              disabled={state !== 'default'}
              accessibilityRole="button"
              accessibilityLabel={copied ? `Code ${code} copied` : `Copy code ${code}`}
              style={[
                styles.codeField,
                copied ? styles.codeFieldCopied : null,
                state === 'copying' ? styles.codeFieldCopying : null,
              ]}
            >
              <Text
                style={[
                  styles.codeTxt,
                  state === 'copying' ? styles.codeTxtDim : null,
                  copied ? styles.codeTxtCopied : null,
                ]}
              >
                {copied ? 'COPIED' : code}
              </Text>
              {state === 'default' && (
                // Figma draws the 15.157 glyph inside an 18.196 box; both are kept.
                <View style={styles.copyBox}>
                  <CopyIcon />
                </View>
              )}
              {state === 'copying' && (
                <Image source={require('../../assets/coupon/circle-loading.gif')} style={styles.spinner} />
              )}
              {copied && <CheckTickIcon />}
            </Pressable>
          )}
        </View>
      </View>

      {/* ── Right edge: white column bitten on its outer edge ───────────────── */}
      <View style={styles.edge}>
        <View style={styles.edgeFill} />
        <EdgeNotch />
        <View style={styles.edgeFill} />
      </View>

      {/* ── Expiry badge, pinned over the ticket ───────────────────────────────
          Drawn last, so it sits above the hairline the way a tag pinned to the
          card would; `top: -2 / left 4` from the body's leading edge is the spec
          offset, which is what makes it straddle the top edge instead of sitting
          inside the body like a stripe. */}
      {hasBadge && (
        <View style={[styles.badge, { width: ribbonW }]} pointerEvents="none">
          <ExpiryRibbon width={ribbonW} />
          {/* The two dark tails at the badge's ends, reading as ribbon folded back
              behind the card. 12×2 exactly: an absolute box with no size lets
              react-native-svg stretch the glyph into a bar. */}
          <View style={[styles.badgeFold, styles.mirrorX]}>
            <RibbonFold />
          </View>
          <View style={[styles.badgeFold, { left: ribbonW - 12 }]}>
            <RibbonFold />
          </View>
          <View style={styles.badgeRow}>
            <ClockIcon />
            <Text style={styles.tagText} numberOfLines={1}>{expiry}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    position: 'relative',
    // The radius has to be on the CARD, not only on the stub and edge columns that
    // paint the corners: `boxShadow` is cast from this view's own border box, so
    // without it the ticket wore a hard rectangular shadow that stuck out past its
    // rounded corners — which reads as "the radius isn't working".
    borderRadius: 12,
    boxShadow: color.coupon.shadow,
  },
  mirrorX: { transform: [{ scaleX: -1 }] },

  // stub
  stub: {
    width: STUB_W,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  stripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: STUB_W },
  /**
   * The cut is on the ticket's OUTER edge, mid-height — the twin of the one on the
   * right edge, which is what makes it read as a torn-off ticket. It was mirrored
   * onto the stub's inner edge, where it fought the perforation scallops instead.
   */
  stubBite: { position: 'absolute', left: 0 },
  stubLabelWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  stubLabel: {
    fontFamily: FONT.extrabold,
    fontSize: 18,
    lineHeight: 30,
    letterSpacing: 0.36,
    color: color.coupon.stubLabel,
    textAlign: 'center',
    width: 84, // the rotated line's own length, per the 84×30 box in the frame
    transform: [{ rotate: '-90deg' }],
  },

  perf: { width: PERF_W, marginLeft: -PERF_OVERLAP },

  // body
  body: { flex: 1, backgroundColor: color.surface, justifyContent: 'center' },
  bodyPad: { paddingTop: 12, paddingBottom: 20, paddingLeft: 10, gap: space.s },

  /**
   * Expiry badge. It occupies an 18px band at the top of the body and its artwork
   * hangs `BADGE_OVERHANG` above the card's own edge (spec `top -2 / left 4`), so it
   * reads as a tag pinned over the ticket rather than a stripe inside it. Whatever
   * hosts the ticket has to allow that overhang — see `couponRail` in SerpShell.
   */
  /** 12×2 exactly, so the fold glyph cannot be stretched by its container. */
  badgeFold: { position: 'absolute', left: 0, top: 0, width: 12, height: 2 },
  /** In-flow spacer that reserves the band the badge overlay covers. */
  tagBand: { height: BADGE_BAND },
  /** The overlay itself: body's leading edge + the spec's 4, hanging 2 above. */
  badge: {
    position: 'absolute',
    left: STUB_W + PERF_W - PERF_OVERLAP + 4,
    top: -BADGE_OVERHANG,
    height: 28,
  },
  /** Clock + label centred in the ribbon's 20px body, inset past its left taper. */
  badgeRow: {
    position: 'absolute',
    left: 12,
    top: 0,
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  tagText: {
    fontFamily: FONT.semibold,
    fontSize: 10,
    letterSpacing: 0.4,
    color: color.coupon.ribbonText,
  },

  // title + see details, paired (D037)
  titleBlock: { gap: 9 }, // Figma 10062:15904 — the spec gap, not the tightened 4
  title: { fontFamily: FONT.extrabold, fontSize: 14, lineHeight: 16, color: color.coupon.title },
  seeDetails: { flexDirection: 'row', alignItems: 'center', gap: space.xxs },
  seeDetailsTxt: { fontFamily: FONT.semibold, fontSize: 12, lineHeight: 16.8, color: color.coupon.seeDetails },

  // code field
  codeField: {
    height: 35,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: color.coupon.codeBorder,
    backgroundColor: color.coupon.codeBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 16,
    paddingRight: 16,
    paddingVertical: 8.21,
  },
  codeFieldCopying: { paddingRight: 4 }, // Variant3
  codeFieldCopied: { borderColor: color.coupon.copiedBorder, paddingRight: 10 }, // Variant4
  codeTxt: { fontFamily: FONT.bold, fontSize: 16, lineHeight: 20, color: color.coupon.codeText },
  codeTxtDim: { color: color.coupon.codeTextDim },
  codeTxtCopied: { color: color.coupon.copiedText },
  copyBox: { width: 18.196, height: 18.196, alignItems: 'center', justifyContent: 'center' },
  spinner: { width: 36, height: 36 },

  // right edge
  edge: {
    width: EDGE_W,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
  },
  edgeFill: { flex: 1, width: EDGE_W, backgroundColor: color.surface },

});

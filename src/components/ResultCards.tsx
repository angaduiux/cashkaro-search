import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ImageSourcePropType,
  Platform,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  cancelAnimation,
  runOnJS,
  scrollTo,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useDerivedValue,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withSpring,
  withTiming,
  useReducedMotion,
  type SharedValue,
} from 'react-native-reanimated';
import { ResultItem } from '../data/dataContract';
import { categoryIcon } from '../data/categoryIcons';
import { color, type as t, space, radius, elevation, fontFamily, letterSpacing, PILL_HEIGHT, spring, duration } from '../theme/tokens';
import { Icon } from '../icons/Icon';
import { TIMELINE_ICON, TimelineIconKey } from '../icons/timelineIcons';
import { CouponTicket } from './CouponTicket';
import { CashbackElement } from './CashbackElement';
import { Badge } from './Badge';
import { ImageSlot, BrandThumb } from './ImageSlot';
import { Button } from './Button';
import { LinearGradient } from 'expo-linear-gradient';
import { CountUp } from '../motion/CountUp';
import { AuraField, auraWashTint, bottomBloomFill, brandOrbFills, useAuraClock } from '../motion/Aura';
import { staggerDelay, timingTravel } from '../motion/motion';
import { Shine } from '../motion/Shine';
import { heroBleedTint } from './HeroBleed';

/** Press-scale wrapper — every tappable card breathes on touch (§9.4). */
function Press({ children, label, onPress }: { children: React.ReactNode; label: string; onPress?: () => void }) {
  const s = useSharedValue(1);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <Animated.View style={st}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        onPressIn={() => (s.value = withSpring(0.97, spring.snappy))}
        onPressOut={() => (s.value = withSpring(1, spring.snappy))}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

/** Store row (§4A): card container, logo, name, cashback (or "Visit"). */
export function StoreRow({ item, index = 0 }: { item: ResultItem; index?: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(staggerDelay(index)).duration(220)}>
      <Press label={item.title}>
        <View style={styles.storeRow}>
          <BrandThumb uri={item.logo} label={item.title} width={56} height={56} />
          <View style={styles.storeText}>
            <Text style={[t.body16SemiBold, { color: color.textPrimary }]} numberOfLines={1}>
              {item.title}
            </Text>
            {item.cashback.type === 'none' ? (
              <Text style={[t.body14SemiBold, { color: color.textLink }]}>
                {item.ctaLabel ?? 'Visit Store'}
              </Text>
            ) : (
              <CashbackElement cashback={item.cashback} size="md" label="Cashback" />
            )}
            {!!item.subtitle && (
              <Text style={[t.body12Regular, { color: color.textTertiary }]}>{item.subtitle}</Text>
            )}
          </View>
          <Icon name="chevron" size={13} color={color.textTertiary} />
        </View>
      </Press>
    </Animated.View>
  );
}

/**
 * Product card — typography & structure per Figma 1646:7850: image (h96, r16),
 * brand caps (Outfit Bold 10 / #262626), 2-line title (Outfit Regular 12 /
 * #5b6470), a price row (current ₹ Outfit SemiBold 14 + strike Outfit Medium 10,
 * both #9aa3b2) with an 8px green "% OFF" chip, a full-width cobalt-tint→white
 * cashback pill (Outfit SemiBold 12 / #0036da — the spec's peach/#e55a0e re-hued
 * blue, D056), and a Final Price block (label 10 /
 * #9aa3b2, value Outfit SemiBold 15 / #0e1116). 132 px wide for the products rail.
 */
const parsePrice = (s?: string | null) => {
  if (!s) return NaN;
  const n = Number(s.replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : NaN;
};

/** The photo box's normalised ratio (132×96, D050). A widened card scales the
 *  box with it, so the photo fills the width instead of letterboxing at 132. */
const PRODUCT_IMG_RATIO = 132 / 96;

export function ProductCard({
  item,
  index = 0,
  width,
  onPress,
}: {
  item: ResultItem;
  index?: number;
  width?: number;
  /** Optional destination (e.g. the category page's price-breakdown sheet). */
  onPress?: () => void;
}) {
  const cbLabel =
    item.cashback.type === 'flat_inr'
      ? `₹${item.cashback.value} Cashback`
      : item.cashback.type === 'pct_single'
      ? `${item.cashback.value}% Cashback`
      : null;

  // Derive % OFF and Final Price when the data doesn't carry them, from the
  // current price (ctaLabel), original price, and cashback amount.
  const cur = parsePrice(item.ctaLabel);
  const orig = parsePrice(item.originalPrice);
  const discount =
    item.discount ?? (orig > cur && cur > 0 ? `${Math.round((1 - cur / orig) * 100)}% OFF` : null);
  const cbAmt =
    item.cashback.type === 'flat_inr'
      ? item.cashback.value
      : item.cashback.type === 'pct_single' && cur > 0
      ? Math.round((cur * item.cashback.value) / 100)
      : 0;
  // Every priced card ends on a Final Price — the amount actually payable. With
  // cashback that is price − cashback; WITHOUT cashback it is the price itself,
  // not nothing (D064), so no card in a grid trails off short of the number every
  // card beside it ends on. Only a card with no price at all omits the block.
  const finalPrice =
    item.finalPrice ?? (cur > 0 ? `₹${(cur - cbAmt).toLocaleString('en-IN')}` : null);

  const card = (
    <Animated.View
      entering={FadeInDown.delay(staggerDelay(index)).duration(220)}
      style={[styles.productCard, width != null && { width }]}
    >
      {item.productImage ? (
        // `contain`, never `cover`: the whole product has to be visible (D050). The
        // photos are normalised to this box's own 1.375 ratio with the subject at a
        // fixed 85% of the height, so contained they fill it AND read the same size
        // card to card; anything not yet normalised letterboxes instead of cropping.
        <Image
          source={item.productImage}
          style={[styles.productImg, width != null && { width, height: Math.round(width / PRODUCT_IMG_RATIO) }]}
          resizeMode="contain"
          accessibilityLabel={item.title}
        />
      ) : (
        // Never fall back to the brand logo as the product image — show a neutral
        // photo slot (tag glyph) instead so a logo never stands in for a product.
        <ImageSlot uri={undefined} label={item.title} icon="tag" size={width ?? 132} radiusToken={radius.md} bg={item.logoBg} style={[styles.productImg, width != null && { width }]} />
      )}
      <View style={styles.productInfo}>
        <View style={styles.productTitleBlock}>
          {!!item.subtitle && (
            <Text style={[t.caption10Bold, { color: color.textPrimary }]} numberOfLines={1}>
              {item.subtitle.toUpperCase()}
            </Text>
          )}
          <Text style={[t.body12Regular, { color: color.aura.slate }]} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
        <View style={styles.priceLine}>
          {(!!item.ctaLabel || !!item.originalPrice) && (
            <View style={styles.priceGroup}>
              {!!item.ctaLabel && <Text style={[t.body14SemiBoldFlat, { color: color.aura.priceMuted }]}>{item.ctaLabel}</Text>}
              {!!item.originalPrice && <Text style={[t.caption10Medium, styles.strike]}>{item.originalPrice}</Text>}
            </View>
          )}
          {!!discount && (
            <View style={styles.discountChip}>
              <Text style={[t.caption8SemiBold, { color: color.aura.green }]}>{discount}</Text>
            </View>
          )}
        </View>
      </View>
      {cbLabel && (
        <LinearGradient
          colors={[color.aura.cashbackPillFrom, color.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cbPill}
        >
          <Text style={[t.body12SemiBold, { color: color.aura.cashback }]}>{cbLabel}</Text>
        </LinearGradient>
      )}
      {!!finalPrice && (
        <View style={styles.finalPriceBlock}>
          <Text style={[t.caption10SemiBold, { color: color.aura.priceMuted, letterSpacing: letterSpacing.normal }]}>Final Price</Text>
          <Text style={[t.body15SemiBold, { color: color.aura.ink }]}>{finalPrice}</Text>
        </View>
      )}
      {/* Provenance footer — web-search results only, where the merchant is the
          one thing a catalog card doesn't already imply (D076). Deliberately the
          quietest row on the card: a hairline, a 12px mark, and 10px tertiary
          type, so it settles the card rather than competing with the price. */}
      {!!item.retailer && (
        <View style={styles.retailerRow}>
          {item.retailer.logo != null && (
            <Image
              source={item.retailer.logo as ImageSourcePropType}
              style={styles.retailerLogo}
              resizeMode="contain"
              accessibilityLabel={item.retailer.name}
            />
          )}
          <Text style={[t.caption10Medium, { color: color.aura.priceMuted }]} numberOfLines={1}>
            on {item.retailer.name}
          </Text>
        </View>
      )}
    </Animated.View>
  );

  // Pressable only where a destination exists (category page → price breakdown);
  // the SERP rails stay non-interactive, so no card ever advertises a dead end.
  return onPress ? (
    <Press label={item.title} onPress={onPress}>
      {card}
    </Press>
  ) : (
    card
  );
}

/**
 * Store card (Figma 1646:7182) — image-forward brand tile: a brand-tint gradient
 * wash carrying the merchant logo, a green "Upto X% Off" strip, and a cobalt
 * "Upto Y%" + muted "CASHBACK" footer. Replaces the old logo-only stores tile;
 * used across the SERP stores rail, category grids, View-all, and Home Top
 * Stores so every store surface renders the same card.
 *
 * Brands come from `data/storeTiles.ts` — the exact 44-brand set in Figma
 * "Storepage Tiles" (611:3360), with that frame's own logo PNGs and washes.
 */
// Soften a brand tint (which may carry a baked-in alpha suffix) toward white so
// any source colour — pale yellow or near-black — becomes a light pastel wash.
// Storepage tiles supply `heroTint` as the frame's *final* wash colour, so they
// bypass this and use it verbatim (whiteMix 0).
const softTintRgb = (hex: string, whiteMix = 0.8) => {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length === 8) h = h.slice(0, 6); // drop baked alpha; the gradient sets its own
  const mix = (c: number) => Math.round(c + (255 - c) * whiteMix);
  return `${mix(parseInt(h.slice(0, 2), 16))}, ${mix(parseInt(h.slice(2, 4), 16))}, ${mix(parseInt(h.slice(4, 6), 16))}`;
};

export function StoreTile({ item, width = 96, onPress }: { item: ResultItem; width?: number; onPress?: () => void }) {
  const cb = item.cashback;
  const prefix = cb.type === 'flat_inr' || (cb.type === 'pct_single' && cb.prefix === 'flat') ? 'Flat' : 'Upto';
  const value =
    cb.type === 'flat_inr' ? `₹${cb.value.toLocaleString('en-IN')}`
    : cb.type === 'pct_single' ? `${cb.value}%`
    : cb.type === 'pct_range' ? `${cb.max}%`
    : '';
  const rgb = item.heroTint
    ? softTintRgb(item.heroTint, 0)
    : softTintRgb(item.logoBg ?? color.aura.searchField);
  const source: ImageSourcePropType | undefined =
    item.logo == null ? undefined : typeof item.logo === 'string' ? { uri: item.logo } : (item.logo as ImageSourcePropType);
  const logoW = Math.round((width - 8) * 0.66);

  return (
    <Press label={item.title} onPress={onPress}>
      <View style={[styles.storeCard, { width }]}>
        <View style={styles.storeCardTile}>
          <LinearGradient
            colors={[`rgba(${rgb}, 0.95)`, `rgba(${rgb}, 0)`]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.storeCardLogoWrap}>
            {source ? (
              <Image source={source} style={{ width: logoW, height: Math.round(logoW * 0.62) }} resizeMode="contain" accessibilityLabel={item.title} />
            ) : (
              <Text style={[t.body16SemiBold, { color: color.aura.slate }]} numberOfLines={1}>{item.title}</Text>
            )}
          </View>
          {!!item.discount && (
            <View style={styles.storeCardOffStrip}>
              <Text style={[t.caption10Medium, { color: color.aura.offGreen }]} numberOfLines={1}>{item.discount}</Text>
            </View>
          )}
        </View>
        <View style={styles.storeCardFoot}>
          {value ? (
            <>
              <Text style={[t.body14BoldSnug, { color: color.aura.cta }]} numberOfLines={1}>
                {prefix} {value}
              </Text>
              <Text style={[t.caption8SemiBoldCaps, { color: color.aura.cashbackCaption }]}>{item.cashbackCaption ?? 'CASHBACK'}</Text>
            </>
          ) : (
            <Text style={[t.body14BoldSnug, { color: color.aura.cta }]} numberOfLines={1}>{item.ctaLabel ?? 'Visit'}</Text>
          )}
        </View>
      </View>
    </Press>
  );
}

/**
 * Web has no ScrollView drag/momentum events and no native paging, so the rail
 * pages itself there (see `settle`). Kept as a constant rather than a `Platform.OS`
 * check at each site so the two paths read as one decision.
 */
const WEB_PAGING = Platform.OS === 'web';
/** How long after the last scroll event a web rail is considered at rest. */
const DEAL_SETTLE_MS = 140;
/**
 * How long the driver keeps the rail after a travel lands. RNW emits one last
 * scroll event 100ms after scrolling stops; released any sooner, the rail's own
 * trailing tick reads as a touch and holds the pager off for six seconds.
 */
const DEAL_RELEASE_MS = 200;
/** Dwell on a banner before the pager moves itself on (travel time is separate). */
const DEAL_DWELL_MS = 3200;
/** A touch owns the pager for this long after the last one — no auto-advance under the finger. */
const DEAL_HOLD_MS = 6000;
/** Artwork trails its own page by this fraction of a page width while it travels. */
const DEAL_PARALLAX = 0.09;
/** Where the artwork sits when it is a full page off-centre: smaller, dimmer, further away. */
const DEAL_OFF_SCALE = 0.93;
const DEAL_OFF_DIM = 0.55;
/** Dot size / opacity by whole pages of distance (W4 spec, Figma 323:1367). */
const DEAL_DOT_SIZE = [8, 6, 4, 2] as const;
const DEAL_DOT_DIM = [0.8, 0.6, 0.4, 0.2] as const;

/**
 * Deals carousel — auto-rotating banner strip (118 px), paged with a "n/total"
 * pill and dots.
 *
 * Three things make the motion continuous rather than per-page (D084):
 *  - The scroll offset drives EVERY animation through one shared value, so the
 *    artwork's depth and the indicator's morph track the finger frame by frame
 *    instead of catching up after the page state changes.
 *  - Auto-advance is a `withTiming` on that offset (`timingTravel` — `spatial`
 *    over `hero`) fed to the scroller through Reanimated's `scrollTo`, so the
 *    travel carries the app's own curve instead of the platform's scroll ease.
 *  - The pages are duplicated and the offset is normalised back into the first
 *    copy at rest, so advancing off the last banner moves ONE page forward into
 *    an identical banner rather than rewinding the whole strip.
 *
 * Auto-advance (and with it the second copy) is disabled under reduced motion
 * (§9.6) — an auto-moving carousel is exactly what that setting opts out of.
 */
export function DealsCarousel({ items, bleed = 0 }: { items: ResultItem[]; bleed?: number }) {
  // Each page fills the carousel's own width and pages one at a time — no
  // gap/peek, so nothing clips at the sides. `bleed` cancels the host page's
  // horizontal padding (pass `space.m20` inside a padded column) so the scroll
  // frame spans the true screen width; the measured width still drives
  // card/step/frame, so paging stays sub-pixel exact.
  //
  // The artwork is inset `SIDE` inside each full-width page rather than the page
  // being narrowed — the snap step stays exactly the screen width, so the banner
  // sits 16px off both edges (and 32px apart mid-swipe) on every screen size.
  const INSET = 0;
  const GAP = 0;
  const SIDE = space.m;
  const [W, setW] = useState(0); // carousel width (rounded to whole px)
  const cardW = W > 0 ? W - INSET * 2 : 0;
  const step = cardW + GAP;
  const count = items.length;
  const reduced = useReducedMotion();
  // A second copy of the pages, so the wrap is a one-page move into an identical
  // banner instead of a rewind across the whole strip. Only when the pager
  // actually advances itself — under reduced motion the extra copy would just be
  // a second set of banners to swipe through.
  const looping = count > 1 && !reduced;
  const pages = looping ? [...items, ...items] : items;

  const [page, setPage] = useState(0);
  const scroller = useAnimatedRef<ScrollView>();
  const x = useSharedValue(0); // live content offset (px) — the one source of truth
  const drive = useSharedValue(0); // auto-advance target, animated with the app's curve
  const auto = useSharedValue(false); // true while `drive` owns the offset
  const stepSv = useSharedValue(0); // `step`, readable from worklets
  const touchedAt = useRef(0);

  const settleAt = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const releaseAt = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  /** An interaction owns the rail: auto-advance backs off until the user is done. */
  const hold = () => {
    touchedAt.current = Date.now();
  };
  /** Hand the rail back once the travel's own scroll events have drained. */
  const release = () => {
    clearTimeout(releaseAt.current);
    releaseAt.current = setTimeout(() => {
      auto.value = false;
    }, DEAL_RELEASE_MS);
  };

  useEffect(() => {
    stepSv.value = step;
  }, [step]);

  /** Continuous page position, wrapped into [0, count) — drives the indicator. */
  const cur = useDerivedValue(() => {
    if (!stepSv.value) return 0;
    const p = x.value / stepSv.value;
    return ((p % count) + count) % count;
  });

  // Banner-coloured glow: STATIC (D036) and now LOW — it rises from under the
  // artwork rather than sitting behind it (D084). Only the colour changes, and it
  // changes the moment the next banner takes the middle of the screen, not when
  // the scroll finally settles.
  const glowTint = items[Math.min(page, count - 1)]?.bannerTint ?? color.aura.tileWash;
  const glowFill = useMemo(() => bottomBloomFill(glowTint), [glowTint]);

  useAnimatedReaction(
    () => Math.round(cur.value) % count,
    (p, prev) => {
      if (p !== prev && p != null) runOnJS(setPage)(p);
    },
  );

  /**
   * Move the rail to `to` on the app's own curve. Every frame of the timing is
   * written straight to the scroll offset — Reanimated's `scrollTo`, not the
   * imperative `ScrollView.scrollTo(animated)`, because the platform's own animated
   * scroll has one fixed ease and no way to pass a curve in. When the move lands
   * past the first copy of the pages it normalises back into it (same artwork, so
   * the jump is invisible), which is what keeps a full copy ahead at all times.
   */
  const travel = (to: number) => {
    drive.value = x.value;
    auto.value = true;
    drive.value = withTiming(to, timingTravel, (done) => {
      'worklet';
      // A travel that was replaced must NOT release the rail: assigning `drive` a
      // plain value first cancels the previous animation, which calls this back with
      // done=false at the START of the next travel — and a release scheduled there
      // dropped the driver 200ms into a 600ms move, stalling it mid-curve (measured
      // frame by frame). Whoever replaced it owns the release.
      if (!done) return;
      // The wrap, and the reason the second copy exists: a travel that lands past
      // the first copy is moved back by exactly one copy's width onto the identical
      // banner. Done by handing the driver a new value rather than calling `scrollTo`
      // here — one path to the scroller means one thing to keep working (and the
      // direct call was measured doing nothing on web, leaving the rail to walk off
      // the end of the second copy).
      if (to > count * stepSv.value - 1) drive.value = to - count * stepSv.value;
      runOnJS(release)();
    });
  };

  /**
   * Web paging is OURS, not the browser's (D084). `pagingEnabled` compiles to
   * `scroll-snap-type: x mandatory`, and the browser then re-snaps every frame of a
   * programmatic scroll to the nearest page edge — measured on the built page, the
   * offset jumped 378 → 756 between two 40ms samples, and forcing snap off from the
   * DOM restored the curve. Neither an inline style nor a re-render can be relied on
   * to lift it in time for the frame the travel starts on. So on web the rail scrolls
   * freely and this settles it: 140ms after the last scroll event (RNW emits one when
   * scrolling stops), whatever page the rail came to rest nearest becomes a `travel`
   * — the same curve the auto-advance uses, so a released swipe and a self-advance
   * land the same way. Native keeps real paging, which is better than anything this
   * could imitate.
   */
  const settle = () => {
    if (!WEB_PAGING || !step) return;
    clearTimeout(settleAt.current);
    settleAt.current = setTimeout(() => {
      if (auto.value || !step) return;
      const nearest = Math.round(x.value / step) * step;
      if (Math.abs(nearest - x.value) >= 1) {
        travel(nearest);
      } else if (looping && nearest > count * step - 1) {
        // Already parked on a boundary, just in the second copy — normalise silently.
        // Value first, then hand it to the driver: the reaction fires on the change,
        // so arming it the other way round would scroll to the PREVIOUS target.
        drive.value = nearest - count * step;
        auto.value = true;
        release();
      }
    }, DEAL_SETTLE_MS);
  };

  // One handler for the whole rail: the offset feeds every animation, and any
  // interaction takes the pager off auto (cancelling a travel already in flight, so
  // the finger never fights a `withTiming`).
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      x.value = e.contentOffset.x;
      // Web has no drag or momentum events at all — a scroll the driver did not
      // cause IS the user, so that is where the hold and the settle come from.
      if (WEB_PAGING && !auto.value) {
        runOnJS(hold)();
        runOnJS(settle)();
      }
    },
    onBeginDrag: () => {
      auto.value = false;
      cancelAnimation(drive);
      runOnJS(hold)();
    },
    onEndDrag: () => {
      runOnJS(hold)();
    },
    onMomentumEnd: (e) => {
      runOnJS(hold)();
      // Land back in the first copy. The banner under the finger is the same
      // artwork either way, so the jump is invisible — and it guarantees a full
      // copy of pages ahead of wherever the user stopped.
      const s = stepSv.value;
      if (looping && s > 0 && e.contentOffset.x > count * s - 1) {
        scrollTo(scroller, e.contentOffset.x - count * s, 0, false);
      }
    },
  });

  useAnimatedReaction(
    () => (auto.value ? drive.value : null),
    (v) => {
      if (v != null) scrollTo(scroller, v, 0, false);
    },
  );

  useEffect(() => {
    if (!looping || !step) return;
    const id = setInterval(() => {
      if (Date.now() - touchedAt.current < DEAL_HOLD_MS) return;
      travel((Math.round(x.value / step) + 1) * step);
    }, DEAL_DWELL_MS);
    return () => clearInterval(id);
  }, [looping, step, count]);

  useEffect(
    () => () => {
      clearTimeout(settleAt.current);
      clearTimeout(releaseAt.current);
    },
    [],
  );

  return (
    <View style={{ marginHorizontal: -bleed }} onLayout={(e) => setW(Math.round(e.nativeEvent.layout.width))}>
      {/* Glow behind the rail, in the current banner's own colour (D036). The tint
          is sampled from each creative offline, so it always matches the art on
          screen; keying the layer on the tint crossfades it as pages change. It is
          transparent well inside its own left/right/top edges, so nothing clips
          there; the bottom is where its core lives, and the fade below dissolves
          that edge into the page (D084). */}
      <View pointerEvents="none" style={styles.dealGlow}>
        <Animated.View
          key={glowTint}
          entering={reduced ? undefined : FadeIn.duration(duration.slow)}
          exiting={reduced ? undefined : FadeOut.duration(duration.slow)}
          style={[StyleSheet.absoluteFill, glowFill]}
        />
        {/* The bloom is centred near the bed's bottom edge, so its ramp runs past
            it by construction — and the band that follows the rail paints opaque
            white over anything below (D077), which would end the bloom in a
            straight line. Dissolving into the page white first means there is no
            line to see. Under the banners and the dots, never over them. */}
        <LinearGradient
          colors={[color.aura.fade0, color.surface]}
          style={styles.dealGlowFade}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          pointerEvents="none"
        />
      </View>
      {cardW > 0 && (
        <Animated.ScrollView
          ref={scroller}
          horizontal
          // Native paging is the platform's own and stays exactly as it was — one
          // rounded integer for card, step and frame (AGENTS.md). On web these would
          // become the CSS scroll-snap that fights the timed travel, so `settle`
          // does the paging there instead.
          pagingEnabled={!WEB_PAGING}
          disableIntervalMomentum={!WEB_PAGING}
          snapToInterval={WEB_PAGING ? undefined : step}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          style={{ width: cardW }}
          contentContainerStyle={{ paddingHorizontal: INSET }}
        >
          {pages.map((item, i) => (
            <DealSlide key={`${item.id}-${i}`} item={item} index={i} width={cardW} side={SIDE} x={x} stepSv={stepSv} reduced={reduced} />
          ))}
        </Animated.ScrollView>
      )}
      {count > 1 && <PageIndicator count={count} page={page} cur={cur} />}
    </View>
  );
}

/**
 * One page of the deals rail. The page itself never moves — the snap step stays
 * exactly the measured width (AGENTS.md) — the ARTWORK moves inside it: it trails
 * the scroll by `DEAL_PARALLAX` of a page and shrinks and dims on its way out, so
 * a swipe reads as depth instead of as two flat images sliding past. The trail and
 * the shrink are matched: the art pulls into the 16px gutter by about as much as
 * the scale gives back, so the 32px between two banners mid-swipe stays open.
 */
function DealSlide({
  item,
  index,
  width,
  side,
  x,
  stepSv,
  reduced,
}: {
  item: ResultItem;
  index: number;
  width: number;
  side: number;
  x: SharedValue<number>;
  stepSv: SharedValue<number>;
  reduced: boolean;
}) {
  const style = useAnimatedStyle(() => {
    if (reduced || !stepSv.value) return { transform: [{ translateX: 0 }, { scale: 1 }], opacity: 1 };
    const d = x.value / stepSv.value - index; // 0 = centred, ±1 = one page off
    const k = Math.min(Math.abs(d), 1);
    return {
      transform: [
        { translateX: d * width * DEAL_PARALLAX },
        { scale: interpolate(k, [0, 1], [1, DEAL_OFF_SCALE]) },
      ],
      opacity: interpolate(k, [0, 1], [1, DEAL_OFF_DIM]),
    };
  });
  return (
    // `overflow: hidden` is load-bearing, not tidiness: the trail moves the art up
    // to 34px out of its own page, and the page's gutter is only 16 — without the
    // clip the NEXT banner's artwork pokes past the screen edge while the rail sits
    // at rest, which is the "banners clipped from the side" report from the other
    // direction. Pages tile the content exactly, so clipping each one to its own
    // slot costs nothing on screen (at most a 1px sliver of a moving image).
    <View style={{ width, paddingHorizontal: side, overflow: 'hidden' }}>
      <Animated.View style={style}>
        <DealCard item={item} width={width - side * 2} />
      </Animated.View>
    </View>
  );
}

/**
 * Page indicator — the W4 spec's own parts (Figma 323:1367): a "n/total" pill
 * among dots that shrink and fade with distance from the current page (8→6→4→2 px
 * at 80→60→40→20%). What changed is that there is no longer a pill and a set of
 * dots: every page renders ONE capsule that grows from dot to pill as it takes the
 * middle of the screen, driven by the live scroll position (D084). The pill used to
 * be swapped between children on the page change, which jumped a whole slot after
 * the swipe had finished; now it morphs under the finger and the label's ink
 * crosses from the outgoing page to the incoming one.
 *
 * Distance wraps (`min(d, count − d)`) because the rail wraps: without it the
 * capsule at page 0 is "count−1 pages away" for the whole travel off the last
 * banner, so the wrap would shrink the pill to nothing and pop a new one open.
 */
function PageIndicator({
  count,
  page,
  cur,
}: {
  count: number;
  page: number;
  cur: SharedValue<number>;
}) {
  // First-paint estimate, replaced on layout by the real typeset width of the
  // widest label this pager can show. Measured rather than computed so the pill
  // keeps the spec's 8px side padding at any digit count, and taken from "n/n" so
  // the width is the same on every page — a per-page width would make the row
  // twitch as the label went 9/10 → 10/10.
  const [pill, setPill] = useState({ w: 34, h: 18 });
  return (
    <View style={styles.indicator} accessible accessibilityLabel={`Deal ${page + 1} of ${count}`}>
      <Text
        style={[styles.countText, styles.countGhost]}
        onLayout={(e) =>
          setPill({
            w: Math.ceil(e.nativeEvent.layout.width) + space.s * 2,
            h: Math.ceil(e.nativeEvent.layout.height) + space.xxs * 2,
          })
        }
      >
        {count}/{count}
      </Text>
      {Array.from({ length: count }, (_, i) => (
        <IndicatorSlot key={i} index={i} count={count} cur={cur} pill={pill} label={`${i + 1}/${count}`} />
      ))}
    </View>
  );
}

/**
 * One page's capsule: a dot at a distance, the count pill at the centre, and every
 * state in between. Width and height run the same 8→6→4→2 ramp past one page out,
 * so away from the centre it is exactly the spec's square dot.
 */
function IndicatorSlot({
  index,
  count,
  cur,
  pill,
  label,
}: {
  index: number;
  count: number;
  cur: SharedValue<number>;
  pill: { w: number; h: number };
  label: string;
}) {
  /** Pages from the middle of the screen, the short way round. */
  const dist = (c: number) => {
    'worklet';
    const raw = Math.abs(index - c);
    return Math.min(raw, count - raw);
  };
  const box = useAnimatedStyle(() => {
    const d = dist(cur.value);
    return {
      width: interpolate(d, [0, 1, 2, 3, 4], [pill.w, ...DEAL_DOT_SIZE], Extrapolation.CLAMP),
      height: interpolate(d, [0, 1, 2, 3, 4], [pill.h, ...DEAL_DOT_SIZE], Extrapolation.CLAMP),
      opacity: interpolate(d, [0, 1, 2, 3, 4], [1, ...DEAL_DOT_DIM], Extrapolation.CLAMP),
    };
  });
  // Linear, so the two capsules in transit hold half the ink each and the row
  // never reads as blank mid-swipe.
  const ink = useAnimatedStyle(() => ({ opacity: interpolate(dist(cur.value), [0, 1], [1, 0], Extrapolation.CLAMP) }));
  return (
    <Animated.View style={[styles.slot, box]}>
      {/* Full-width label inside a box that is narrower than it for most of the
          morph: centred and clipped by the capsule, so the number appears to open
          out of the dot rather than to reflow inside it. */}
      <Animated.Text numberOfLines={1} style={[styles.countText, styles.slotText, { width: pill.w }, ink]}>
        {label}
      </Animated.Text>
    </Animated.View>
  );
}

/**
 * Deal banner — the real campaign creative at 118 px, rounded, top-anchored so
 * the brand logo + headline stay visible (matches the W4 banner treatment).
 */
export function DealCard({ item, width = 320 }: { item: ResultItem; width?: number }) {
  // Full creative at its natural aspect. The banner art already includes its own
  // rounded corners on a white ground, so we render it flat (no extra bg/radius)
  // — the baked corners sit cleanly on the white page, no white padding.
  const aspect = item.bannerAspect ?? 984 / 354;
  const height = Math.round(width / aspect);
  if (item.bannerImage == null) return null;
  return (
    <Image
      source={item.bannerImage as ImageSourcePropType}
      style={{ width, height }}
      resizeMode="contain"
      accessibilityLabel="Deal banner"
    />
  );
}

/**
 * Similar-cards rail — CashKaro DS card carousel (Figma 6573:13413): skewed card
 * artwork (151×96, radius 10) with a shine, a 2-line card name, and a cobalt-tint→
 * white gradient "Upto ₹X Cashback" pill in blue (D056). Horizontal scroll.
 */
export function SimilarCardsRail({ items }: { items: ResultItem[] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.railBleed} contentContainerStyle={styles.cardsRail}>
      {items.map((item) => {
        const cb = item.cashback;
        const value =
          cb.type === 'flat_inr'
            ? `₹${cb.value.toLocaleString('en-IN')} Cashback`
            : cb.type === 'pct_single'
            ? `${cb.value}% Cashback`
            : '';
        return (
          <Press key={item.id} label={item.title}>
            <View style={styles.simCard}>
              <View style={styles.simArt}>
                {item.artwork ? (
                  <Image source={(typeof item.artwork === 'string' ? { uri: item.artwork } : item.artwork) as ImageSourcePropType} style={styles.simArtImg} resizeMode="cover" accessibilityLabel={item.title} />
                ) : (
                  <View style={[styles.simArtImg, styles.simArtFallback]}>
                    <Icon name="card" size={28} color={color.aura.slateMuted} />
                  </View>
                )}
              </View>
              <Text style={[t.body12Medium, { color: color.textPrimary, height: 32 }]} numberOfLines={2}>
                {item.title}
              </Text>
              {!!value && (
                <LinearGradient
                  colors={[color.aura.cashbackPillFrom, color.surface]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.simPill}
                >
                  <Text style={[t.body12Regular, { color: color.aura.cashback }]} numberOfLines={1}>Upto </Text>
                  <Text style={[t.body12SemiBold, { color: color.aura.cashback, flexShrink: 1 }]} numberOfLines={1}>{value}</Text>
                </LinearGradient>
              )}
            </View>
          </Press>
        );
      })}
    </ScrollView>
  );
}

/**
 * Coupon card (W4 1646:7406) — offer + condition, a dashed copy-code box, and an
 * expiry footer. Copy morphs "Copy → ✓ Copied" with a success flash (§9.4).
 */
/**
 * Coupon card — now the Store Page V2.0 ticket. The design, all three of its states
 * and its provenance live in [CouponTicket.tsx](./CouponTicket.tsx) (Figma
 * `XgdQOrfPsC6HNv24uS9jgN` node 1835:16064); this stays as the adapter every SERP
 * coupon section already calls, mapping `ResultItem` onto it.
 */
export function CouponCard({ item }: { item: ResultItem }) {
  return (
    <CouponTicket
      title={item.title}
      subtitle={item.subtitle}
      code={item.code}
      expiry={item.expiry}
    />
  );
}

/** Sale-campaign card (W4 1646:7430) — banner + title + LIVE badge + subtitle. */
export function CampaignCard({ item }: { item: ResultItem }) {
  return (
    <Press label={item.title}>
      {/* Shadow parent / mask child. The shadow CANNOT live on the same View as the
          `overflow: 'hidden'` that rounds off the banner — iOS clips the shadow along
          with the content, which is why this card looked flat despite already asking
          for `elevation.soft`. Outer casts, inner masks; both carry the radius. */}
      <View style={[styles.campaignShadow, elevation.soft]}>
        <View style={styles.campaign}>
          {item.bannerImage != null ? (
            <Image source={item.bannerImage as ImageSourcePropType} style={styles.campaignImg} resizeMode="cover" />
          ) : (
            <LinearGradient colors={[color.error, '#ff6d1d']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.campaignImg} />
          )}
          <View style={styles.campaignBody}>
            <View style={{ flex: 1, gap: space.xxs }}>
              <View style={styles.campaignTitleRow}>
                <Text style={[t.body16SemiBold, { color: color.aura.ink }]} numberOfLines={1}>{item.title}</Text>
                {item.live && (
                  <View style={styles.liveBadge}>
                    <Text style={styles.liveBadgeText}>LIVE</Text>
                  </View>
                )}
              </View>
              {!!item.subtitle && <Text style={[t.body12Regular, { color: color.aura.slateMuted }]} numberOfLines={1}>{item.subtitle}</Text>}
            </View>
            <Icon name="chevron" size={13} color={color.aura.slateMuted} />
          </View>
        </View>
      </View>
    </Press>
  );
}

/** Category pill — icon tile + label inline (Figma 1646:7349): white→cobalt50
 * vertical gradient, hairline border, radius full; 32px circular icon on a white
 * base with an inset cobalt glow; label in Outfit Medium 13. */
export function CategoryChip({ item, onPress }: { item: ResultItem; onPress?: () => void }) {
  const catImg = categoryIcon(item.title); // real illustrated icon (Figma 1674:13000)
  return (
    <Press label={item.title} onPress={onPress}>
      <LinearGradient
        colors={[color.surface, color.surfaceAlt]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.categoryPill}
      >
        <View style={styles.categoryIcon}>
          {catImg ? (
            <Image source={catImg} style={styles.categoryImg} resizeMode="cover" />
          ) : (
            <ImageSlot uri={item.logo} label={item.title} icon="tag" size={32} radiusToken={radius.full} bg={color.surface} />
          )}
          {/* Inset cobalt glow overlay (Figma inset 0 0 4 rgba(0,54,218,0.3)) */}
          <View style={styles.categoryIconGlow} pointerEvents="none" />
        </View>
        <Text style={[t.body13Medium, { color: color.aura.ink }]} numberOfLines={1}>
          {item.title}
        </Text>
      </LinearGradient>
    </Press>
  );
}

/**
 * Store money-card hero — matches the W4 design (Figma 1646:7197): lavender→grey
 * gradient panel (radius 24), logo + name + rating, big blue cashback figure (D056)
 * with count-up, green "Up from x%" chip, blue "Shop & Earn" CTA, and the
 * 3-cell Cashback Timelines row.
 */
export function StoreHero({
  item,
  userType = 'existing',
  bleed = false,
}: {
  item: ResultItem;
  userType?: 'new' | 'existing';
  /** Content-only mode (D069): a HeroBleed backdrop behind the page already
   *  paints this hero's wash/orbs full-bleed (up to the status bar), so the
   *  hero draws no box, no background, no fade of its own. The Gallery preview
   *  leaves it off and keeps the self-contained card. */
  bleed?: boolean;
}) {
  const cb = item.cashback;
  const pct = cb.type === 'pct_single' ? cb.value : cb.type === 'pct_range' ? cb.max : null;
  const isNew = userType === 'new';
  // The count-up overlays an invisible sizer Text of the final value, which
  // reserves the figure's exact box — correct width + baseline on every
  // platform, with no hand-tuned per-glyph estimate (which clipped wide values).
  // Cashback percentages carry 2 decimals ("6.00%") per the money-page spec;
  // flat ₹ keeps Indian grouping without decimals.
  const figStr = cb.type === 'flat_inr' ? `₹${cb.value.toLocaleString('en-IN')}` : pct != null ? `${pct.toFixed(2)}%` : '—';
  // Living brand-hued backdrop (D033): the same Aura engine as Expand Search, its
  // orbs re-tinted from this store's own wash colour instead of the AI violet.
  const tint = heroBleedTint(item);
  // Brands whose tint is really just near-black (Nike, AJIO, Puma …) paint their
  // wash in pale sky too, so the sky-blue orbs aren't sitting on a grey field.
  const wash = auraWashTint(tint);
  const orbFills = useMemo(() => brandOrbFills(tint), [tint]);
  const clock = useAuraClock(!bleed); // in bleed mode HeroBleed runs the field
  const gain = useSharedValue(1);
  const ctaText = cb.type === 'none' ? item.ctaLabel ?? 'Visit Store' : `Earn Cashback on ${item.title}`;
  return (
    <View style={bleed ? styles.heroBleed : styles.hero}>
      {!bleed && (
        <>
          {/* Tinted wash → light grey base (Figma 1646:7197 #f6e5ff→#f6f7f9); the
              near-white base still merges into the page but keeps the white timeline
              cells legible. */}
          <LinearGradient
            colors={[wash, color.aura.heroTo]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
          {/* Drifting orbs over that wash — no second base gradient. */}
          <AuraField clock={clock} gain={gain} fills={orbFills} base={false} />
          {/* Bottom dissolve: the wash AND the orbs fade to the page white before the
              panel ends, so there is no cut edge where `overflow: hidden` clips them.
              Sits under the content, so it never veils the timeline cells. */}
          <LinearGradient
            colors={[color.aura.fade0, color.surface]}
            style={styles.heroFade}
            pointerEvents="none"
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        </>
      )}

      {/* id row: logo + name + rating */}
      <View style={styles.heroRow}>
        <BrandThumb uri={item.logo} label={item.title} width={88} height={60} radiusToken={radius.lg} scale={0.65} />
        <View style={{ flex: 1, gap: space.xs }}>
          <Text style={[t.heading22SemiBold, { color: color.aura.ink }]} numberOfLines={1}>
            {item.title}
          </Text>
          {(item.ratingValue || item.shoppers) && (
            <View style={styles.heroRating}>
              <Icon name="star" size={12} color={color.aura.star} />
              {!!item.ratingValue && (
                <Text style={[t.body12Regular, { color: color.aura.slate }]}>  {item.ratingValue.toFixed(1)}</Text>
              )}
              {!!item.shoppers && (
                <Text style={[t.body12Regular, { color: color.aura.slate }]}>  ·  {item.shoppers}</Text>
              )}
            </View>
          )}
        </View>
      </View>

      {/* big cashback figure */}
      <View style={{ gap: space.xs, width: '100%' }}>
        {/* +8px on top of the container gap (D067). The figure's tight lineHeight
            (54 on 52px) crops its ascent, so the qualifier needs more room here than
            a flat 4px to read as a separate line rather than the figure's hat. */}
        <Text style={[t.body13Medium, { color: color.aura.slateMuted, marginBottom: space.s }]}>
          {cb.type === 'flat_inr' && cb.prefix === 'flat' ? 'Flat' : 'Up to'}
        </Text>
        <View style={styles.heroBig}>
          {cb.type === 'none' ? (
            <Text style={[styles.heroFigure, { color: color.aura.cashback }]}>—</Text>
          ) : (
            <View style={styles.figSlot}>
              {/* invisible sizer — reserves the final figure's exact width/height */}
              <Text style={[styles.heroFigure, { opacity: 0 }]} accessibilityElementsHidden importantForAccessibility="no">
                {figStr}
              </Text>
              {cb.type === 'flat_inr' ? (
                <CountUp value={cb.value} prefix="₹" group style={[styles.heroFigure, styles.figFill, { color: color.aura.cashback }] as any} />
              ) : (
                <CountUp value={pct!} suffix="%" decimals={2} style={[styles.heroFigure, styles.figFill, { color: color.aura.cashback }] as any} />
              )}
            </View>
          )}
          <Text style={[t.heading22SemiBold, { color: color.aura.slate }]}>Cash Back</Text>
        </View>
        {/* New user → welcome-bonus chip; existing → loyalty "up from" chip */}
        {isNew && cb.type !== 'none' ? (
          <View style={[styles.upChip, { backgroundColor: color.aura.greenSurface }]}>
            {/* Solid, not the map's regular (D074): at 10px an outline gift is a
                few hairlines on a pale green field and reads as a smudge. The map
                entry stays regular for the Home clone's tab bar, where the glyph
                sits at 18px among four other outline tabs. */}
            <Icon name="gift" weight="solid" size={10} color={color.aura.green} />
            <Text style={[t.body12SemiBold, { color: color.aura.green }]}>  New user: Extra ₹150 on 1st order</Text>
          </View>
        ) : (
          !!item.priorPct && (
            <View style={styles.upChip}>
              <Icon name="shift" size={10} color={color.aura.green} />
              <Text style={[t.body12SemiBold, { color: color.aura.green }]}>  Up from {item.priorPct!.toFixed(2)}%</Text>
            </View>
          )
        )}
      </View>

      {/* Sticky-CTA spec (Figma 1716:74837): CK Orange, r12, "Earn Cashback on
          {Store}" 16/SemiBold + solid arrow-up-right 12 at gap 4, under a looping
          soft-light shine sweep (D070). */}
      <Shine repeat blend="soft-light" delay={900} style={styles.heroCtaShine}>
        <Pressable style={styles.heroCta} onPress={() => {}} accessibilityRole="button">
          <Text style={styles.heroCtaText} numberOfLines={1}>{ctaText}</Text>
          {cb.type !== 'none' && (
            // 45° turns the subset's arrow-up into the spec's arrow-up-right (iconMap `earn`).
            <View style={styles.heroCtaArrow}>
              <Icon name="earn" size={12} color={color.textInverse} />
            </View>
          )}
        </Pressable>
      </Shine>

      {/* cashback timelines */}
      {item.timelines && (
        <View style={{ width: '100%', gap: space.s }}>
          {/* Flush with the cells below it — the old 4px nudge lined the label up
              with a card edge that no longer exists in bleed mode (D071). */}
          <Text style={[t.body13Medium, { color: color.aura.slateMuted, paddingHorizontal: bleed ? 0 : space.xs }]}>
            Cashback Timelines
          </Text>
          <View style={styles.timelines}>
            <TimelineCell icon="tracksIn" label="Tracks In" value={item.timelines.tracksIn} chevron />
            <TimelineCell icon="confirmsIn" label="Confirms in" value={item.timelines.confirmsIn} chevron />
            <TimelineCell icon="withdraw" label="Withdraw" value={item.timelines.withdraw} />
          </View>
        </View>
      )}
    </View>
  );
}

const TL_H = 48; // timeline cell height
const TL_DEPTH = 13; // chevron point depth (fixed → never distorts with width)

// Cashback-timeline cell drawn with pure Views so the chevron stays crisp at any
// screen width (Figma 1646:7226): a white body + a fixed-size right-pointing
// arrow (border triangle). First two cells are chevrons (a left→right process
// flow), the last is a plain rounded cell.
//
// The 26px gradient glyph ahead of the text comes from the strip's newer spec
// (Figma 1716:76773) — see `icons/timelineIcons.tsx`. That frame insets its content
// 6px from the cell's left edge and leaves 3px between glyph and text, so the body's
// left padding drops from 16 to `space.s6` and the row gap is `space.xs`.
function TimelineCell({
  icon,
  label,
  value,
  chevron,
}: {
  icon: TimelineIconKey;
  label: string;
  value: string;
  chevron?: boolean;
}) {
  const Glyph = TIMELINE_ICON[icon];
  return (
    <View style={styles.timelineCell}>
      <View style={[styles.timelineBody, chevron && styles.timelineBodyChevron]}>
        <Glyph />
        <View style={styles.timelineText}>
          <Text style={[styles.timelineLabel, { color: color.aura.slateMuted }]}>{label}</Text>
          <Text style={[t.body12SemiBold, { color: color.aura.slate }]} numberOfLines={1}>
            {value}
          </Text>
        </View>
      </View>
      {chevron && <View style={styles.timelineArrow} pointerEvents="none" />}
    </View>
  );
}

const styles = StyleSheet.create({
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.m,
    paddingHorizontal: space.m,
    height: 64,
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    marginBottom: space.s12,
    ...elevation.soft, // no border, soft W4 shadow
  },
  storeText: { flex: 1, gap: space.xxs },

  productCard: { width: 132, gap: space.s12 }, // Figma root col gap 12
  productImg: { width: 132, height: 96, borderWidth: 0, borderRadius: radius.md, backgroundColor: color.surfaceAlt }, // Figma img h96 r16
  productInfo: { gap: space.s, paddingHorizontal: space.xxs }, // gap 8, px 2
  productTitleBlock: { gap: space.xs }, // brand + title, gap 4
  priceLine: { flexDirection: 'row', alignItems: 'center', gap: space.s6 }, // gap 6
  priceGroup: { flexDirection: 'row', alignItems: 'center', gap: space.xs }, // ₹ + strike, gap 4
  strike: { color: color.aura.priceMuted, textDecorationLine: 'line-through' },
  discountChip: {
    backgroundColor: color.aura.greenSurface,
    borderRadius: radius.xs, // r4
    paddingHorizontal: space.s6, // px 6
    paddingVertical: space.xxs, // py 2
  },
  cbPill: {
    width: '100%', // Figma full-width pill
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xs, // r4
    paddingHorizontal: space.s6, // px 6
    paddingVertical: space.xs, // py 4
  },
  finalPriceBlock: { gap: space.xxs, paddingHorizontal: space.xxs }, // gap 2, px 2
  // Muted provenance line (D076): hairline above, then mark + "on <shop>". The
  // hairline is what keeps it from reading as another price row.
  retailerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s6,
    marginTop: space.xxs,
    paddingTop: space.s,
    paddingHorizontal: space.xxs, // align with the Final Price block above
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.aura.border,
  },
  retailerLogo: { width: 14, height: 14, borderRadius: radius.xs },

  deal: { borderRadius: radius.xl, overflow: 'hidden', backgroundColor: color.aura.bg },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
    height: 20,
    marginTop: space.s12,
  },
  /** Dot ⇄ count pill: one box that morphs, so `radius.full` has to hold at 2px. */
  slot: {
    backgroundColor: color.aura.indicator,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  countText: { ...t.caption10SemiBold, color: color.textInverse, letterSpacing: 1 },
  /** The label is wider than its capsule for most of the morph — centred, clipped. */
  slotText: { textAlign: 'center', flexShrink: 0 },
  /** Measures the widest label without taking a slot in the row. */
  countGhost: { position: 'absolute', left: 0, opacity: 0 },

  // Rails inside a 20px-padded page column break out of that padding, then re-inset
  // their content on BOTH sides (see `cardsRail`), so a mid-scroll card is cut by the
  // screen edge instead of an arbitrary inset (AGENTS.md full-bleed rule).
  railBleed: { marginHorizontal: -space.m20 },
  // (the old hand-rolled coupon styles are gone — CouponTicket.tsx owns them now)
  /** Casts the shadow. Opaque background: a shadow needs one to have a shape. */
  campaignShadow: { borderRadius: radius.lg, backgroundColor: color.surface },
  /** Masks the banner to the radius. Never put the shadow on this one. */
  campaign: { borderRadius: radius.lg, backgroundColor: color.surface, overflow: 'hidden' },
  campaignImg: { width: '100%', height: 128 },
  campaignBody: { flexDirection: 'row', alignItems: 'center', gap: space.s, padding: space.s12 },
  campaignTitleRow: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  liveBadge: { backgroundColor: color.error, borderRadius: radius.full, paddingHorizontal: space.s6, paddingVertical: 1 },
  liveBadgeText: { ...t.caption10SemiBold, color: color.textInverse, letterSpacing: 0.4 },
  cardsRail: { gap: space.s12, paddingVertical: space.s, paddingHorizontal: space.m20 },
  simCard: { width: 151, gap: space.s },
  simArt: { width: 151, height: 96, borderRadius: radius.md, overflow: 'hidden', transform: [{ skewX: '-0.27deg' }] },
  simArtImg: { width: 151, height: 96 },
  simArtFallback: { backgroundColor: color.aura.bg, alignItems: 'center', justifyContent: 'center' },
  simPill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    paddingHorizontal: space.s, // tighter → "Upto ₹1,500 Cashback" fits one line
    borderRadius: radius.full,
    alignSelf: 'stretch', // span the 151px card so the label never wraps
  },
  // Store card (Figma 1646:7182): white card, tinted tile, offer strip, footer.
  storeCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg, // 12
    borderWidth: 1,
    borderColor: color.card.border, // #eee
    paddingHorizontal: space.xs, // 4px frame around the tile (Figma 104→96 inset)
    paddingTop: space.xs,
    paddingBottom: space.s,
    ...elevation.xs, // 0 2 2 rgba(0,0,0,.12) equivalent
  },
  storeCardTile: {
    aspectRatio: 96 / 113,
    borderRadius: radius.md, // 10
    overflow: 'hidden',
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeCardLogoWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.s },
  storeCardOffStrip: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: color.surface,
    paddingVertical: space.xxs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeCardFoot: { alignItems: 'center', paddingTop: space.s6, gap: space.xxs },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s,
    height: PILL_HEIGHT, // 36px — canonical pill height (32px icon centred, 2px each side)
    paddingRight: space.m,
    paddingLeft: space.s6, // ~7px (Figma pl-[7px])
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: color.border, // hairline #d9e3ec
    overflow: 'hidden',
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    overflow: 'hidden',
    backgroundColor: color.surface,
  },
  categoryImg: { width: 32, height: 32, borderRadius: radius.full }, // clip illustrated icon to its circle
  categoryIconGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: radius.full,
    boxShadow: 'inset 0px 0px 4px rgba(0,54,218,0.3)',
  },

  hero: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    // bottom corners square + no shadow → the wash dissolves into the page
    padding: space.m,
    // extra room under the timelines so the bottom fade has somewhere to land
    paddingBottom: space.xl,
    gap: space.m,
    overflow: 'hidden',
  },
  // Content-only hero under a HeroBleed backdrop (D069): same vertical rhythm,
  // no box — no radius, no clip, no background, and NO horizontal padding of its
  // own. Without the card there is nothing for a 16px inset to be measured from,
  // so the hero inherits the page column's 20px and its logo, figure, CTA and
  // timeline strip line up with every other row on the page (D071).
  heroBleed: {
    // 8, not 16: the context line's own 8px bottom padding sits above this, so
    // the measured "Best match for …" → logo-tile gap is 16 (D071).
    paddingTop: space.s,
    paddingBottom: space.xl,
    gap: space.m,
  },
  /** Glow bed behind the deals rail. Deliberately LARGER than the section: the
   *  banner artwork is opaque, so a bed the size of the section leaves only a
   *  hairline of visible glow around it. Spilling past the section lets the bloom
   *  read in the page around the deal. No `overflow: hidden` — the glow fades out
   *  inside its own box (GLOW_REACH), so there is nothing to clip. */
  dealGlow: {
    // Deliberately far larger than the rail: the bloom is wider than the screen,
    // and its ramp has to reach zero inside its own left/right/top edges so no
    // `overflow` setting can cut it. `bottomBloomFill` sizes the light itself —
    // this box only says how much room it has to fall off in.
    position: 'absolute',
    left: -space.huge,
    right: -space.huge,
    top: -space.huge,
    // The bottom is the ONE side that can't spill: whatever follows the deals
    // rail (the Expand Search band) paints an opaque surface over anything below
    // it, which cut the glow off in a hard horizontal line (D077). The bloom's
    // core now sits close above that edge on purpose (D084), so the ramp DOES
    // reach it — `dealGlowFade` is what dissolves it to nothing first.
    bottom: -space.s,
  },
  /** The dissolve that ends the bloom in page white instead of at an edge. Short
   *  on purpose: `bottomBloomFill`'s ramp already reaches ~4% by this edge, so this
   *  only has to take the last of it — a tall fade would veil the core, which sits
   *  just under the artwork and is the whole point of a low light. */
  dealGlowFade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: space.s12 },
  /** Bottom dissolve — wash + orbs → page white, so the panel has no cut edge. */
  heroFade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: space.huge96 },
  heroRow: { flexDirection: 'row', gap: space.s14, alignItems: 'center' },
  heroLogo: {
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...elevation.logo, // exact W4 brand-logo shadow
  },
  heroRating: { flexDirection: 'row', alignItems: 'center' },
  // gap 8, not 4 (D067): the figure carries -0.52 tracking and ends on a `%`, whose
  // counter reads as space that isn't there — at 4 the "C" sat against it.
  heroBig: { flexDirection: 'row', alignItems: 'baseline', gap: space.s },
  heroFigure: { fontFamily: fontFamily.bold, fontSize: 52, lineHeight: 54, letterSpacing: -0.52 },
  figSlot: { position: 'relative' }, // sizer Text sets the box; CountUp overlays it
  figFill: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
  upChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: color.aura.greenSurface,
    borderWidth: 1,
    borderColor: 'rgba(26,122,57,0.15)',
    borderRadius: radius.full,
    paddingHorizontal: space.s,
    paddingVertical: space.xs,
    marginTop: space.xxs,
  },
  // Sticky-CTA spec (Figma 1716:74837): CK Orange (D058), 48 tall, radius 12,
  // label + arrow-up-right at gap 4. The Shine wrap carries the radius so its
  // `overflow: hidden` clips the sweep band to the button silhouette.
  heroCtaShine: { alignSelf: 'stretch', borderRadius: radius.lg },
  heroCta: {
    alignSelf: 'stretch',
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: color.aura.ctaHero,
    flexDirection: 'row',
    gap: space.xs,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.m, // long store names ellipsize inside, not at the edge
  },
  heroCtaText: { fontFamily: fontFamily.semiBold, fontSize: 16, color: color.textInverse, flexShrink: 1 },
  heroCtaArrow: { transform: [{ rotateZ: '45deg' }] },
  // Gap leaves room for the chevron point to sit between cells (pointing at the
  // next step) without overlapping it.
  timelines: { flexDirection: 'row', gap: TL_DEPTH + 3 },
  // Soft raise cast around the WHOLE composed shape (body + arrow triangle) so no
  // shadow seam appears down the body/arrow join. `filter` follows the union alpha;
  // native falls back to the body's own shadow* below.
  timelineCell: { flex: 1, height: TL_H, position: 'relative', filter: 'drop-shadow(0px 2px 8px rgba(18,23,38,0.06))' } as any,
  timelineBody: {
    flex: 1,
    height: TL_H,
    borderRadius: radius.sm,
    backgroundColor: color.surface,
    // Figma 1716:76773 insets the icon+text row 6px from the cell's left edge.
    paddingLeft: space.s6,
    paddingRight: space.s,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    // native-only raise (web uses the cell's drop-shadow filter above)
    shadowColor: '#121726',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  } as any,
  // Label over value; shrinks (never the glyph) when the cell is narrow.
  timelineText: { flexShrink: 1, gap: space.xxs },
  // Square off the right corners so the arrow attaches flush.
  timelineBodyChevron: { borderTopRightRadius: 0, borderBottomRightRadius: 0 },
  // Fixed-size right-pointing triangle (border trick) — same white as the body,
  // extends TL_DEPTH beyond the body's right edge into the gap.
  timelineArrow: {
    position: 'absolute',
    right: -TL_DEPTH,
    top: 0,
    width: 0,
    height: 0,
    borderTopWidth: TL_H / 2,
    borderBottomWidth: TL_H / 2,
    borderLeftWidth: TL_DEPTH,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: color.surface,
  },
  timelineLabel: { ...t.caption10SemiBold, letterSpacing: 0.1, fontFamily: fontFamily.regular },
});

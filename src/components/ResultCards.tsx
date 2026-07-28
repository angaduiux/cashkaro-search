import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Animated, {
  FadeInDown,
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
import { color, type as t, space, radius, elevation, fontFamily, letterSpacing, MIN_TAP_TARGET, spring } from '../theme/tokens';
import { Icon } from '../icons/Icon';
import { CashbackElement } from './CashbackElement';
import { Badge } from './Badge';
import { ImageSlot, BrandThumb } from './ImageSlot';
import { Button } from './Button';
import { LinearGradient } from 'expo-linear-gradient';
import { Shine } from '../motion/Shine';
import { CountUp } from '../motion/CountUp';
import { staggerDelay } from '../motion/motion';

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
 * both #9aa3b2) with an 8px green "% OFF" chip, a full-width peach→white cashback
 * pill (Outfit SemiBold 12 / #e55a0e), and a Final Price block (label 10 /
 * #9aa3b2, value Outfit SemiBold 15 / #0e1116). 132 px wide for the products rail.
 */
const parsePrice = (s?: string | null) => {
  if (!s) return NaN;
  const n = Number(s.replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : NaN;
};

export function ProductCard({ item, index = 0, width }: { item: ResultItem; index?: number; width?: number }) {
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
  const finalPrice =
    item.finalPrice ?? (cbAmt > 0 && cur > 0 ? `₹${(cur - cbAmt).toLocaleString('en-IN')}` : null);

  return (
    <Animated.View
      entering={FadeInDown.delay(staggerDelay(index)).duration(220)}
      style={[styles.productCard, width != null && { width }]}
    >
      {item.productImage ? (
        <Image source={item.productImage} style={[styles.productImg, width != null && { width }]} resizeMode="cover" accessibilityLabel={item.title} />
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
    </Animated.View>
  );
}

/**
 * Store card (Figma 1646:7182) — image-forward brand tile: a brand-tint gradient
 * wash carrying the merchant logo, a green "Upto X% Off" strip, and a cobalt
 * "Upto Y%" + muted "CASHBACK" footer. Replaces the old logo-only stores tile;
 * used across the SERP stores rail, category grids, View-all, and Home Top
 * Stores so every store surface renders the same card.
 */
// Soften a brand tint (which may carry a baked-in alpha suffix) toward white so
// any source colour — pale yellow or near-black — becomes a light pastel wash.
const softTintRgb = (hex: string, whiteMix = 0.8) => {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length === 8) h = h.slice(0, 6); // drop baked alpha; the gradient sets its own
  const mix = (c: number) => Math.round(c + (255 - c) * whiteMix);
  return `${mix(parseInt(h.slice(0, 2), 16))}, ${mix(parseInt(h.slice(2, 4), 16))}, ${mix(parseInt(h.slice(4, 6), 16))}`;
};

export function StoreTile({ item, width = 96, onPress }: { item: ResultItem; width?: number; onPress?: () => void }) {
  const cb = item.cashback;
  const prefix = cb.type === 'flat_inr' ? 'Flat' : 'Upto';
  const value =
    cb.type === 'flat_inr' ? `₹${cb.value.toLocaleString('en-IN')}`
    : cb.type === 'pct_single' ? `${cb.value}%`
    : cb.type === 'pct_range' ? `${cb.max}%`
    : '';
  const rgb = softTintRgb(item.heroTint ?? item.logoBg ?? color.aura.searchField);
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
              <Text style={[t.caption8SemiBoldCaps, { color: color.aura.cashbackCaption }]}>CASHBACK</Text>
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
 * Deals carousel — auto-rotating banner strip (118 px), paged with a "1/n" chip
 * and dots. Auto-advances every ~3.2 s and wraps; any manual swipe re-syncs the
 * page and resets the timer. Auto-advance is disabled under reduced motion
 * (§9.6) — an auto-moving carousel is exactly what that setting opts out of.
 */
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export function DealsCarousel({ items }: { items: ResultItem[] }) {
  // Banners sit inside the page's 20px padding (no full-bleed): each banner fills
  // the padded content width and pages one at a time — no gap/peek, so nothing
  // clips at the sides.
  const INSET = 0;
  const GAP = 0;
  const [W, setW] = useState(0); // padded content width (rounded to whole px)
  const cardW = W > 0 ? W - INSET * 2 : 0;
  const step = cardW + GAP;
  const [page, setPage] = useState(0);
  const scroller = useRef<ScrollView>(null);
  const reduced = useReducedMotion();
  const paused = useRef(false);
  const cur = useSharedValue(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!step) return;
    const p = Math.round(e.nativeEvent.contentOffset.x / step);
    if (p !== page) setPage(p);
  };

  useEffect(() => {
    cur.value = withTiming(page, { duration: 260 });
  }, [page]);

  useEffect(() => {
    if (reduced || items.length < 2 || !step) return;
    const id = setInterval(() => {
      if (paused.current) return;
      setPage((prev) => {
        const next = (prev + 1) % items.length;
        scroller.current?.scrollTo({ x: next * step, animated: true });
        return next;
      });
    }, 3200);
    return () => clearInterval(id);
  }, [reduced, items.length, step]);

  return (
    <View style={styles.bleed} onLayout={(e) => setW(Math.round(e.nativeEvent.layout.width))}>
      {cardW > 0 && (
        <AnimatedScrollView
          ref={scroller as any}
          horizontal
          pagingEnabled
          disableIntervalMomentum
          snapToInterval={step}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScroll}
          onScrollEndDrag={onScroll}
          onScrollBeginDrag={() => (paused.current = true)}
          scrollEventThrottle={16}
          style={{ width: cardW }}
          contentContainerStyle={{ paddingHorizontal: INSET }}
        >
          {items.map((item) => (
            <DealCard key={item.id} item={item} width={cardW} />
          ))}
        </AnimatedScrollView>
      )}
      {items.length > 1 && <PageIndicator count={items.length} page={page} cur={cur} />}
    </View>
  );
}

/**
 * Page indicator — exact match to the W4 spec (Figma 323:1367): a centred
 * "n/total" pill flanked by dots that shrink and fade with distance from the
 * current page (8→6→4→2 px at 80→60→40→20%). The pill slides through positions
 * as the carousel advances; dots ease via a shared value (respecting reduced
 * motion through the timing already applied to `cur`).
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
  return (
    <View style={styles.indicator}>
      {Array.from({ length: count }, (_, i) =>
        i === page ? (
          <View key={i} style={styles.countPill}>
            <Text style={styles.countText}>
              {page + 1}/{count}
            </Text>
          </View>
        ) : (
          <ShrinkDot key={i} index={i} cur={cur} />
        )
      )}
    </View>
  );
}

function ShrinkDot({ index, cur }: { index: number; cur: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const d = Math.abs(index - cur.value);
    const size = interpolate(d, [1, 2, 3, 4], [8, 6, 4, 2], Extrapolation.CLAMP);
    const opacity = interpolate(d, [1, 2, 3, 4], [0.8, 0.6, 0.4, 0.2], Extrapolation.CLAMP);
    return { width: size, height: size, opacity };
  });
  return <Animated.View style={[styles.shrinkDot, style]} />;
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
 * artwork (151×96, radius 10) with a shine, a 2-line card name, and a saffron→
 * white gradient "Upto ₹X Cashback" pill in orange. Horizontal scroll.
 */
export function SimilarCardsRail({ items }: { items: ResultItem[] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsRail}>
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
              <Shine style={styles.simArt}>
                {item.artwork ? (
                  <Image source={(typeof item.artwork === 'string' ? { uri: item.artwork } : item.artwork) as ImageSourcePropType} style={styles.simArtImg} resizeMode="cover" accessibilityLabel={item.title} />
                ) : (
                  <View style={[styles.simArtImg, styles.simArtFallback]}>
                    <Icon name="card" size={28} color={color.aura.slateMuted} />
                  </View>
                )}
              </Shine>
              <Text style={[t.body12Medium, { color: color.textPrimary, height: 32 }]} numberOfLines={2}>
                {item.title}
              </Text>
              {!!value && (
                <LinearGradient
                  colors={[color.saffron, color.surface]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.simPill}
                >
                  <Text style={[t.body12Regular, { color: color.actionPrimary }]} numberOfLines={1}>Upto </Text>
                  <Text style={[t.body12SemiBold, { color: color.actionPrimary, flexShrink: 1 }]} numberOfLines={1}>{value}</Text>
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
export function CouponCard({ item }: { item: ResultItem }) {
  const [copied, setCopied] = useState(false);
  return (
    <View style={styles.coupon}>
      <View style={{ gap: space.xxs }}>
        <Text style={[t.body16SemiBold, { color: color.aura.ink }]} numberOfLines={1}>{item.title}</Text>
        {!!item.subtitle && <Text style={[t.body14Regular, { color: color.aura.slate }]} numberOfLines={2}>{item.subtitle}</Text>}
      </View>
      {!!item.code && (
        <Pressable
          onPress={() => setCopied(true)}
          style={[styles.codeBox, copied && styles.codeBoxCopied]}
          accessibilityRole="button"
          accessibilityLabel={`Copy code ${item.code}`}
        >
          <Text style={[t.body14SemiBold, { color: color.aura.ink, letterSpacing: 1 }]}>{item.code}</Text>
          <View style={styles.copyRow}>
            {copied && <Icon name="check" size={12} color={color.reward} />}
            <Text style={[t.body14SemiBold, { color: copied ? color.reward : color.aura.cta }]}>
              {copied ? ' Copied' : 'Copy'}
            </Text>
          </View>
        </Pressable>
      )}
      {!!item.expiry && (
        <View style={styles.couponFoot}>
          <Icon name="clock" size={11} color={color.aura.slateMuted} />
          <Text style={[t.body12Regular, { color: color.aura.slateMuted }]}> {item.expiry}</Text>
        </View>
      )}
    </View>
  );
}

/** Sale-campaign card (W4 1646:7430) — banner + title + LIVE badge + subtitle. */
export function CampaignCard({ item }: { item: ResultItem }) {
  return (
    <Press label={item.title}>
      <View style={[styles.campaign, elevation.soft]}>
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
    </Press>
  );
}

/** Category pill — icon tile + label inline (Figma 1646:7349): white→cobalt50
 * vertical gradient, hairline border, radius full; 32px circular icon on a white
 * base with an inset cobalt glow; label in Outfit Medium 13. */
export function CategoryChip({ item }: { item: ResultItem }) {
  const catImg = categoryIcon(item.title); // real illustrated icon (Figma 1674:13000)
  return (
    <Press label={item.title}>
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
 * gradient panel (radius 24), logo + name + rating, big orange cashback figure
 * with count-up, green "Up from x%" chip, blue "Shop & Earn" CTA, and the
 * 3-cell Cashback Timelines row.
 */
export function StoreHero({ item, userType = 'existing' }: { item: ResultItem; userType?: 'new' | 'existing' }) {
  const cb = item.cashback;
  const pct = cb.type === 'pct_single' ? cb.value : cb.type === 'pct_range' ? cb.max : null;
  const isNew = userType === 'new';
  // The count-up runs in a TextInput (web defaults it to a huge width). We reserve
  // the figure's exact box with an invisible sizer Text of the final value and
  // overlay the animated CountUp on top — correct width + baseline on every
  // platform, with no hand-tuned per-glyph estimate (which clipped wide values).
  const figStr = cb.type === 'flat_inr' ? `₹${cb.value.toLocaleString('en-IN')}` : pct != null ? (Number.isInteger(pct) ? `${pct}%` : `${pct.toFixed(1)}%`) : '—';
  return (
    <Shine style={styles.hero}>
      {/* Tinted wash → light grey base (Figma 1646:7197 #f6e5ff→#f6f7f9); the
          near-white base still merges into the page but keeps the white timeline
          cells legible. */}
      <LinearGradient
        colors={[item.heroTint ?? item.logoBg ?? color.aura.heroFrom, color.aura.heroTo]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* id row: logo + name + rating */}
      <View style={styles.heroRow}>
        <BrandThumb uri={item.logo} label={item.title} width={88} height={60} radiusToken={radius.lg} />
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
        <Text style={[t.body13Medium, { color: color.aura.slateMuted }]}>
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
                <CountUp value={cb.value} prefix="₹" style={[styles.heroFigure, styles.figFill, { color: color.aura.cashback }] as any} />
              ) : (
                <CountUp value={pct!} suffix="%" format={(n) => (Number.isInteger(pct) ? `${Math.round(n)}` : `${n.toFixed(1)}`)} style={[styles.heroFigure, styles.figFill, { color: color.aura.cashback }] as any} />
              )}
            </View>
          )}
          <Text style={[t.heading18SemiBold, { color: color.aura.slate }]}>Cash Back</Text>
        </View>
        {/* New user → welcome-bonus chip; existing → loyalty "up from" chip */}
        {isNew && cb.type !== 'none' ? (
          <View style={[styles.upChip, { backgroundColor: color.aura.greenSurface }]}>
            <Icon name="gift" size={10} color={color.aura.green} />
            <Text style={[t.body12SemiBold, { color: color.aura.green }]}>  New user: Extra ₹150 on 1st order</Text>
          </View>
        ) : (
          !!item.priorPct && (
            <View style={styles.upChip}>
              <Icon name="shift" size={10} color={color.aura.green} />
              <Text style={[t.body12SemiBold, { color: color.aura.green }]}>  Up from {item.priorPct}%</Text>
            </View>
          )
        )}
      </View>

      <Pressable style={styles.heroCta} onPress={() => {}} accessibilityRole="button">
        <Text style={styles.heroCtaText}>
          {item.cashback.type === 'none' ? item.ctaLabel ?? 'Visit Store' : isNew ? 'Sign Up & Earn' : 'Shop & Earn'}
        </Text>
      </Pressable>

      {/* cashback timelines */}
      {item.timelines && (
        <View style={{ width: '100%', gap: space.s }}>
          <Text style={[t.body13Medium, { color: color.aura.slateMuted, paddingHorizontal: space.xs }]}>
            Cashback Timelines
          </Text>
          <View style={styles.timelines}>
            <TimelineCell label="Tracks In" value={item.timelines.tracksIn} chevron />
            <TimelineCell label="Confirms in" value={item.timelines.confirmsIn} chevron />
            <TimelineCell label="Withdraw" value={item.timelines.withdraw} />
          </View>
        </View>
      )}
    </Shine>
  );
}

const TL_H = 48; // timeline cell height
const TL_DEPTH = 13; // chevron point depth (fixed → never distorts with width)

// Cashback-timeline cell drawn with pure Views so the chevron stays crisp at any
// screen width (Figma 1646:7226): a white body + a fixed-size right-pointing
// arrow (border triangle). First two cells are chevrons (a left→right process
// flow), the last is a plain rounded cell.
function TimelineCell({ label, value, chevron }: { label: string; value: string; chevron?: boolean }) {
  return (
    <View style={styles.timelineCell}>
      <View style={[styles.timelineBody, chevron && styles.timelineBodyChevron]}>
        <Text style={[styles.timelineLabel, { color: color.aura.slateMuted }]}>{label}</Text>
        <Text style={[t.body12SemiBold, { color: color.aura.slate }]} numberOfLines={1}>
          {value}
        </Text>
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

  deal: { borderRadius: radius.xl, overflow: 'hidden', backgroundColor: color.aura.bg },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
    height: 20,
    marginTop: space.s12,
  },
  countPill: {
    backgroundColor: color.aura.indicator,
    borderRadius: radius.full,
    paddingHorizontal: space.s,
    paddingVertical: space.xxs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { ...t.caption10SemiBold, color: color.textInverse, letterSpacing: 1 },
  shrinkDot: { borderRadius: radius.full, backgroundColor: color.aura.indicator },

  bleed: {}, // carousel stays within the page's 20px padding (no bleed)
  coupon: {
    width: 248,
    gap: space.s12,
    padding: space.m,
    borderRadius: radius.lg,
    backgroundColor: color.surface,
    ...elevation.soft,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: color.aura.cta,
    borderStyle: 'dashed',
    borderRadius: radius.sm,
    paddingHorizontal: space.s12,
    paddingVertical: space.s,
    backgroundColor: color.surfaceAlt,
  },
  codeBoxCopied: { borderColor: color.reward, backgroundColor: color.successSurface },
  copyRow: { flexDirection: 'row', alignItems: 'center' },
  couponFoot: { flexDirection: 'row', alignItems: 'center' },
  campaign: { borderRadius: radius.lg, backgroundColor: color.surface, overflow: 'hidden' },
  campaignImg: { width: '100%', height: 128 },
  campaignBody: { flexDirection: 'row', alignItems: 'center', gap: space.s, padding: space.s12 },
  campaignTitleRow: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  liveBadge: { backgroundColor: color.error, borderRadius: radius.full, paddingHorizontal: space.s6, paddingVertical: 1 },
  liveBadgeText: { ...t.caption10SemiBold, color: color.textInverse, letterSpacing: 0.4 },
  cardsRail: { gap: space.s12, paddingVertical: space.s, paddingRight: space.m },
  simCard: { width: 151, gap: space.s },
  simArt: { width: 151, height: 96, borderRadius: radius.md, transform: [{ skewX: '-0.27deg' }] },
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
    paddingRight: space.m,
    paddingLeft: space.s6, // ~7px (Figma pl-[7px])
    paddingVertical: space.s6, // 6px (Figma py-[6px]) → 32 icon + 12 = 44 tall
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
    gap: space.m,
    overflow: 'hidden',
  },
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
  heroBig: { flexDirection: 'row', alignItems: 'baseline', gap: space.xs },
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
  // Flat cobalt CTA (Figma 1646:7220 — #0036da, 15/SemiBold, radius 12)
  heroCta: {
    alignSelf: 'stretch',
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: color.aura.cta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCtaText: { fontFamily: fontFamily.semiBold, fontSize: 15, color: color.textInverse },
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
    paddingLeft: space.m,
    paddingRight: space.s,
    justifyContent: 'center',
    gap: 2,
    // native-only raise (web uses the cell's drop-shadow filter above)
    shadowColor: '#121726',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  } as any,
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

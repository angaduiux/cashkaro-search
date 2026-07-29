import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Image, ImageSourcePropType, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { color, type as t, space, radius, fontFamily, spring, MIN_TAP_TARGET, PILL_HEIGHT, TRENDING_PILL_HEIGHT } from '../theme/tokens';
import { Icon } from '../icons/Icon';
import { IconName } from '../icons/iconMap';
import { BrandThumb } from '../components/ImageSlot';
import { DealsCarousel, StoreTile } from '../components/ResultCards';
import { storeTilesByKeys } from '../data/storeTiles';
import { CountUpText } from '../motion/CountUp';
import { UserType } from '../components/UserTypeToggle';
import { BRAND, ALL_DEALS, cardSbiCashback, cardAxisFlipkart, cardFederalScapia } from '../data/realData';
import { searchStores } from '../data/catalog';
import { trendingPills, type TrendingPill } from '../data/trendingPills';
import { Cashback, ResultItem } from '../data/dataContract';
import { staggerDelay } from '../motion/motion';
import { RollingThumb } from '../motion/RollingThumb';
import { LoopRail } from '../motion/LoopRail';

/** Vertical slop that lifts the 40px pill's tap target back to ≥44px (§6.2). */
const PILL_SLOP = Math.ceil((MIN_TAP_TARGET - PILL_HEIGHT) / 2);

/** Section header — title (Outfit SemiBold 14) + optional right-side action.
 *  `gif` (an animated source) takes precedence over the glyph `icon`. */
function Head({ icon, gif, title, action }: { icon?: IconName; gif?: ImageSourcePropType; title: string; action?: React.ReactNode }) {
  return (
    <View style={styles.head}>
      {/* A gif mark sits tighter to its title than a glyph does (D085): the flame
          art carries its own transparent margin, so the 6px a 18px glyph needs
          reads as a gap at 30px. */}
      <View style={[styles.headLeft, gif ? styles.headLeftGif : null]}>
        {gif ? (
          <Image source={gif} style={styles.headGif} resizeMode="contain" accessibilityLabel={`${title} icon`} />
        ) : (
          icon && <Icon name={icon} size={18} color={icon === 'fire' ? color.actionPrimary : color.aura.ink} />
        )}
        <Text style={[t.body14SemiBold, { color: color.aura.ink, letterSpacing: 0 }]}>{title}</Text>
      </View>
      {action}
    </View>
  );
}

/**
 * Explore landing (pre-typing). "Jump back in" is a compact rail of logo tiles
 * (like Home's Top Stores) for recents that resolved to an exact store/card —
 * one tap goes straight to that result. "Recent" keeps the full search history
 * as removable pills (matches aren't always exact), with a Clear action. Then
 * Trending chips and the deals carousel.
 */
// Trending queries + the SKU reel each pill's thumb rolls through live in the data
// layer (`data/trendingPills.ts`, D081) — a lazy memo, so this screen resolves it
// at render time, never at module scope.

/** Drift for both trending rails; the second runs it in reverse (D086). */
const TREND_DRIFT = 10;

/** Trending pills dealt into TWO rails, longest-first so the rows balance (D086). */
function trendingRows(): TrendingPill[][] {
  const rows: TrendingPill[][] = [[], []];
  const widths = [0, 0];
  // Greedy: each pill joins the currently shorter row, so neither row ends up
  // carrying every long label. Length stands in for width — same type, same disc.
  for (const pill of trendingPills()) {
    const r = widths[0] <= widths[1] ? 0 : 1;
    rows[r].push(pill);
    widths[r] += pill.label.length;
  }
  return rows;
}

// Top-Stores grid — same Storepage tiles (Figma 611:3360) and key set as the Home
// rail, so the section reads identically either side of the search tap. Built at
// render time (not module scope) to stay clear of the catalog↔realData cycle.
const TOP_STORE_KEYS = ['croma', 'nykaa', 'ajio', 'amazon', 'mamaearth', 'dotKey'];

/** Cashback → short label, e.g. "Up to 3%" / "Flat ₹1,500". Null when none. */
function rateLabel(cb: Cashback): { prefix: string; value: string } | null {
  if (cb.type === 'none') return null;
  if (cb.type === 'flat_inr') return { prefix: cb.prefix === 'flat' ? 'Flat' : 'Up to', value: `₹${cb.value.toLocaleString('en-IN')}` };
  const v = cb.type === 'pct_range' ? cb.max : cb.value;
  return { prefix: 'Up to', value: `${v}%` };
}

// Recently-viewed credit/co-branded cards → direct card-page destinations.
const CARDS: { card: ResultItem; aliases: string[]; goto: string }[] = [
  { card: cardSbiCashback, aliases: ['sbi cashback card', 'sbi cashback', 'sbi card', 'sbi', 'cashback card'], goto: 'sbi cashback card' },
  { card: cardAxisFlipkart, aliases: ['axis flipkart card', 'axis flipkart', 'axis card', 'flipkart card'], goto: 'credit' },
  { card: cardFederalScapia, aliases: ['scapia federal card', 'scapia federal', 'scapia', 'federal card'], goto: 'credit' },
];
function matchCard(q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return undefined;
  // Only treat a recent as a card when it names one specifically — the query must
  // equal, start with, or contain a full card alias (never the reverse, so a short
  // store query like "flip" can't leak into "flipkart card").
  return CARDS.find((c) => c.aliases.some((a) => s === a || s.startsWith(a + ' ') || (a.length >= 4 && s.includes(a))));
}

type Dest = { kind: 'store' | 'card'; key: string; logo: string | number | null; title: string; cashback: Cashback; goto: string };

export function ExploreHome({
  recents,
  enterTick,
  userType,
  onPick,
  onOpenStore,
  onClearRecents,
  onRemoveRecent,
}: {
  recents: string[];
  enterTick: number;
  userType: UserType;
  onPick: (q: string) => void;
  onOpenStore: (q: string) => void;
  onClearRecents: () => void;
  onRemoveRecent: (q: string) => void;
}) {
  const { width } = useWindowDimensions();
  const TOP_STORES: ResultItem[] = storeTilesByKeys(TOP_STORE_KEYS, 'explore-top');
  // Same 3-up maths as the Home rail — 16px gutter inside the 20px page padding.
  const tileW = Math.floor((width - space.m20 * 2 - space.m * 2) / 3);

  // Recent pills stay ~2 lines by default; "View all" reveals the rest.
  const [showAllRecents, setShowAllRecents] = useState(false);
  const RECENT_CAP = 4;
  const visibleRecents = showAllRecents ? recents : recents.slice(0, RECENT_CAP);
  const extraRecents = recents.length - RECENT_CAP;

  // Resolve recents that map to an exact match → compact quick-access tiles.
  const seen = new Set<string>();
  const destinations: Dest[] = [];
  for (const q of recents) {
    const card = matchCard(q);
    if (card && !seen.has('card:' + card.card.id)) {
      seen.add('card:' + card.card.id);
      destinations.push({ kind: 'card', key: card.card.id, logo: card.card.logo, title: card.card.title, cashback: card.card.cashback, goto: card.goto });
      continue;
    }
    const store = searchStores(q)[0];
    // Only a confident (near-exact) match becomes a Jump-back-in tile — otherwise
    // the recent stays a plain pill (e.g. "nike shoes" must not surface Amazon).
    const s = q.trim().toLowerCase();
    const strong =
      store &&
      (store.name.toLowerCase().startsWith(s) || store.aliases.some((a) => a === s || a.startsWith(s) || s.startsWith(a)));
    if (store && strong && !seen.has('store:' + store.slug)) {
      seen.add('store:' + store.slug);
      destinations.push({ kind: 'store', key: store.slug, logo: store.brand ? BRAND[store.brand]?.logo ?? null : null, title: store.name, cashback: store.cashback, goto: store.name.toLowerCase() });
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {/* Jump back in — compact one-tap tiles to a match found earlier.
          New users have no history, so this is hidden for them. */}
      {userType !== 'new' && destinations.length > 0 && (
        <View style={styles.block}>
          <View style={styles.blockPad}>
            <Head title="Jump back in" />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tileRow}>
            {destinations.slice(0, 8).map((d, i) => (
              <Animated.View key={d.key} entering={FadeInDown.delay(staggerDelay(i)).duration(220)}>
                <DestinationTile dest={d} trigger={enterTick} onPress={() => (d.kind === 'store' ? onOpenStore(d.goto) : onPick(d.goto))} />
              </Animated.View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Recent searches — hidden for new users (no history yet) */}
      {userType !== 'new' && recents.length > 0 && (
        <View style={styles.blockPad}>
          <Head
            title="Recent"
            action={
              <Pressable hitSlop={10} onPress={onClearRecents} accessibilityRole="button" accessibilityLabel="Clear search history">
                <Text style={[t.body12Medium, { color: color.textLink }]}>Clear</Text>
              </Pressable>
            }
          />
          <View style={styles.chips}>
            {visibleRecents.map((r, i) => (
              <Animated.View key={r} entering={FadeInDown.delay(staggerDelay(i)).duration(200)}>
                <Chip icon="history" label={r} onPress={() => onPick(r)} onRemove={() => onRemoveRecent(r)} />
              </Animated.View>
            ))}
            {extraRecents > 0 && (
              <Pressable
                onPress={() => setShowAllRecents((v) => !v)}
                hitSlop={{ top: PILL_SLOP, bottom: PILL_SLOP }}
                style={styles.moreChip}
                accessibilityRole="button"
                accessibilityLabel={showAllRecents ? 'Show fewer recent searches' : 'View all recent searches'}
              >
                <Text style={[t.body12Medium, { color: color.textLink }]}>{showAllRecents ? 'Show less' : `View all (${recents.length})`}</Text>
                <Icon name="chevron" size={12} color={color.textLink} style={{ transform: [{ rotate: showAllRecents ? '270deg' : '90deg' }], marginLeft: space.xxs }} />
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* Trending */}
      <View style={styles.blockPad}>
        <Head gif={require('../../assets/anim/trending.gif')} title="Trending" />
        {/* Two rails, drifting opposite ways at a crawl (D086). Split rather than
            wrapped: seven pills wrapped to four rows once the disc took them to
            44px, and a rail keeps the section two lines tall at any pill count.
            One speed for both rows — only the direction differs, so the pair reads
            as one mechanism counter-rotating rather than as two loose rows. */}
        {trendingRows().map((row, r) => (
          <LoopRail key={r} speed={r % 2 ? -TREND_DRIFT : TREND_DRIFT} gap={space.s12} bleed={space.m20}>
            {row.map((pill, i) => (
              <Animated.View key={pill.query} entering={FadeInDown.delay(staggerDelay(i)).duration(200)}>
                <Chip icon="search" label={pill.label} images={pill.images} onPress={() => onPick(pill.query)} warm />
              </Animated.View>
            ))}
          </LoopRail>
        ))}
      </View>

      {/* Deals carousel */}
      {ALL_DEALS.length > 0 && (
        <Animated.View entering={FadeInDown.delay(120).duration(240)} style={styles.blockPad}>
          <Head title="Top Deals" />
          {/* Banners run to the screen edge — cancel this block's 20px padding. */}
          <DealsCarousel items={ALL_DEALS} bleed={space.m20} />
        </Animated.View>
      )}

      {/* Top stores — mirrors the Home rail so the section survives the search tap */}
      <View style={styles.blockPad}>
        <Head title="Top Stores" />
        <View style={styles.storeGrid}>
          {TOP_STORES.map((item, i) => (
            <Animated.View key={item.id} entering={FadeInDown.delay(staggerDelay(i)).duration(220)}>
              <StoreTile item={item} width={tileW} onPress={() => onOpenStore(item.title.toLowerCase())} />
            </Animated.View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

/** Compact recent-destination tile — logo + cashback figure (Home Top-Stores style). */
function DestinationTile({ dest, onPress, trigger }: { dest: Dest; onPress: () => void; trigger: number }) {
  const rate = rateLabel(dest.cashback);
  const cb = dest.cashback;
  const isFlat = cb.type === 'flat_inr';
  const num = cb.type === 'flat_inr' ? cb.value : cb.type === 'pct_range' ? cb.max : cb.type === 'pct_single' ? cb.value : 0;
  return (
    <Pressable style={styles.tile} onPress={onPress} accessibilityRole="button" accessibilityLabel={dest.title}>
      <BrandThumb uri={dest.logo} label={dest.title} width={104} height={44} radiusToken={11} />
      {rate ? (
        <View style={styles.tileRate}>
          <Text style={[t.body12Medium, { color: color.aura.slate }]}>{rate.prefix} </Text>
          <CountUpText
            value={num}
            prefix={isFlat ? '₹' : ''}
            suffix={isFlat ? '' : '%'}
            trigger={trigger}
            format={(n) => (isFlat ? Math.round(n).toLocaleString('en-IN') : Number.isInteger(num) ? `${Math.round(n)}` : n.toFixed(1))}
            style={[styles.tileRateValue, { color: color.aura.cashback }]}
          />
        </View>
      ) : (
        <Text style={[t.body12Medium, { color: color.aura.slate }]}>Visit store</Text>
      )}
    </Pressable>
  );
}

function Chip({
  icon,
  label,
  images,
  onPress,
  onRemove,
  warm,
}: {
  icon: IconName;
  label: string;
  /** SKU reel for the leading circle (trending). Omitted → the glyph `icon`. */
  images?: number[];
  onPress: () => void;
  onRemove?: () => void;
  warm?: boolean;
}) {
  // Press feedback: the same scale-spring as `Button` (§9.4 "card press / tap"),
  // so a chip answers the finger instead of reading as a dead label.
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const thumb = images && images.length > 0;

  return (
    <Animated.View style={pressStyle}>
    <Pressable
      onPress={onPress}
      onPressIn={() => (scale.value = withSpring(0.97, spring.snappy))}
      onPressOut={() => (scale.value = withSpring(1, spring.snappy))}
      hitSlop={{ top: PILL_SLOP, bottom: PILL_SLOP }}
      style={[styles.chip, warm ? styles.chipWarm : styles.chipRecent, thumb ? styles.chipThumb : null]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {/* Trending pills carry the category pill's treatment (Figma 1646:7349) —
          white→tint vertical gradient under a hairline — in warm instead of cobalt,
          so the two pill families read as one system without trending losing its
          orange (D085). Height and padding are untouched: the border sits inside
          the 36px box. */}
      {warm && (
        <LinearGradient
          colors={[color.surface, color.trendingSurface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      )}
      {/* A trending pill leads with the SKU reel its query resolves to (D081);
          recents keep the history glyph. */}
      {thumb ? <RollingThumb images={images!} /> : <Icon name={icon} size={13} color={color.aura.fieldIcon} />}
      <Text style={[t.body14Regular, { color: color.aura.slate }]}>{label}</Text>
      {onRemove && (
        <Pressable hitSlop={8} onPress={onRemove} accessibilityRole="button" accessibilityLabel={`Remove ${label}`} style={styles.chipRemove}>
          <Icon name="clear" size={13} color={color.aura.fieldIcon} />
        </Pressable>
      )}
    </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: space.m20, gap: space.m20 },
  block: { gap: space.s12 },
  blockPad: { paddingHorizontal: space.m20, gap: space.s12 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headLeft: { flexDirection: 'row', alignItems: 'center', gap: space.s6 },
  headLeftGif: { gap: space.xxs },
  headGif: { width: 30, height: 30 }, // 1.5× the glyph size — the flame is the section's mark
  // 12px between pills on both axes (D081) — at 44px tall with a 32px disc, the
  // old 8px gutter let the rows read as one mass instead of as separate pills.
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s12 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s, // breathing room between icon and label
    height: PILL_HEIGHT, // 36px — canonical pill height
    paddingHorizontal: space.s12,
    borderRadius: radius.full,
  },
  chipRecent: { backgroundColor: color.recentSurface },
  /** Gradient + hairline, the category pill's treatment in warm (D085). `overflow`
   *  clips the gradient to the pill's radius; the flat `trendingSurface` stays as
   *  the base under it so nothing shows through while the gradient rasterises. */
  chipWarm: {
    backgroundColor: color.trendingSurface,
    borderWidth: 1,
    borderColor: color.trendingBorder,
    overflow: 'hidden',
  },
  /** A thumb pill stands taller than the canonical 36 so the 32px disc gets real
   *  air (6px all round, D081) — and at 44 it clears MIN_TAP_TARGET unaided. The
   *  left inset matches that ring so the disc sits optically centred. */
  chipThumb: { height: TRENDING_PILL_HEIGHT, paddingLeft: space.s6 },
  chipRemove: { marginLeft: space.xs, alignItems: 'center', justifyContent: 'center' },
  moreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: PILL_HEIGHT, // 36px — canonical pill height
    paddingHorizontal: space.s12,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: color.aura.border,
    backgroundColor: color.surface,
  },
  // Top-Stores grid — matches the Home rail's wrap + gutters
  storeGrid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: space.m, rowGap: space.m },
  // Jump-back-in compact tile rail
  tileRow: { flexDirection: 'row', gap: space.m, paddingHorizontal: space.m20 },
  tile: { width: 104, alignItems: 'center', gap: space.s12 },
  tileRate: { flexDirection: 'row', alignItems: 'baseline' },
  tileRateValue: { fontFamily: fontFamily.semiBold, fontSize: 20, letterSpacing: -0.08 },
  welcome: { flexDirection: 'row', alignItems: 'center', gap: space.s, marginTop: space.s12, paddingHorizontal: space.xs },
});

import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Image, ImageSourcePropType, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { color, type as t, space, radius, fontFamily, MIN_TAP_TARGET, PILL_HEIGHT } from '../theme/tokens';
import { Icon } from '../icons/Icon';
import { IconName } from '../icons/iconMap';
import { BrandThumb } from '../components/ImageSlot';
import { DealsCarousel, StoreTile } from '../components/ResultCards';
import { storeTilesByKeys } from '../data/storeTiles';
import { CountUpText } from '../motion/CountUp';
import { UserType } from '../components/UserTypeToggle';
import { BRAND, ALL_DEALS, cardSbiCashback, cardAxisFlipkart, cardFederalScapia } from '../data/realData';
import { searchStores } from '../data/catalog';
import { Cashback, ResultItem } from '../data/dataContract';
import { staggerDelay } from '../motion/motion';

/** Vertical slop that lifts the 40px pill's tap target back to ≥44px (§6.2). */
const PILL_SLOP = Math.ceil((MIN_TAP_TARGET - PILL_HEIGHT) / 2);

/** Section header — title (Outfit SemiBold 14) + optional right-side action.
 *  `gif` (an animated source) takes precedence over the glyph `icon`. */
function Head({ icon, gif, title, action }: { icon?: IconName; gif?: ImageSourcePropType; title: string; action?: React.ReactNode }) {
  return (
    <View style={styles.head}>
      <View style={styles.headLeft}>
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
const TRENDING = ['iphone 16', 'myntra', 'nike', 'flight tickets', 'best cashback card'];

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
        <View style={styles.chips}>
          {TRENDING.map((q, i) => (
            <Animated.View key={q} entering={FadeInDown.delay(staggerDelay(i)).duration(200)}>
              <Chip icon="search" label={q} onPress={() => onPick(q)} warm />
            </Animated.View>
          ))}
        </View>
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
  onPress,
  onRemove,
  warm,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  onRemove?: () => void;
  warm?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: PILL_SLOP, bottom: PILL_SLOP }}
      style={[styles.chip, warm ? styles.chipWarm : styles.chipRecent]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Icon name={icon} size={13} color={color.aura.fieldIcon} />
      <Text style={[t.body14Regular, { color: color.aura.slate }]}>{label}</Text>
      {onRemove && (
        <Pressable hitSlop={8} onPress={onRemove} accessibilityRole="button" accessibilityLabel={`Remove ${label}`} style={styles.chipRemove}>
          <Icon name="clear" size={13} color={color.aura.fieldIcon} />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: space.m20, gap: space.m20 },
  block: { gap: space.s12 },
  blockPad: { paddingHorizontal: space.m20, gap: space.s12 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headLeft: { flexDirection: 'row', alignItems: 'center', gap: space.s6 },
  headGif: { width: 20, height: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s, // breathing room between icon and label
    height: PILL_HEIGHT, // 36px — canonical pill height
    paddingHorizontal: space.s12,
    borderRadius: radius.full,
  },
  chipRecent: { backgroundColor: color.recentSurface },
  chipWarm: { backgroundColor: color.trendingSurface },
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

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SerpModel, SerpSection, TabKey, ResultItem } from '../data/dataContract';
import { color, type as t, space, duration } from '../theme/tokens';
import { SectionHeader } from './atoms';
import { StoreTile, ProductCard, CategoryChip, DealsCarousel, SimilarCardsRail, CouponCard, CampaignCard } from './ResultCards';
import { FinanceCard } from './FinanceCard';
import { CreditCard } from './CreditCard';
import { StoreHero } from './ResultCards';
import { TabBar } from './TabBar';
import { ExpandSearchCard } from './ExpandSearch';
import { SkeletonCard, SkeletonBlock } from '../motion/Skeleton';

/**
 * SERP shell (§3.3) — the one shape every screen composes:
 *   context line → [hero, optional] → content sections → [Expand Search, if any]
 * Hero present only for single-entity queries; tab bar only when adjacent
 * categories are plausible; Expand Search only on product-result pages.
 */
export function SerpShell({
  model,
  webResults = [],
  loading = false,
  preview = false,
  userType = 'existing',
  onViewAllStores,
  onOpenCategory,
}: {
  model: SerpModel;
  webResults?: ResultItem[];
  /** Tap on a stores section's "View all" → open the catalog grid for its category. */
  onViewAllStores?: () => void;
  /** Tap a category row → open that product category page. */
  onOpenCategory?: (title: string) => void;
  /** Commit transition (§9.4): frame lands first, skeletons where content will
   *  stream in, then sections replace them top-to-bottom. */
  loading?: boolean;
  /** Gallery preview: disable inner scroll so the layout reads as a static card. */
  preview?: boolean;
  /** New vs existing user — drives welcome-bonus rates + CTAs on the hero. */
  userType?: 'new' | 'existing';
}) {
  const [tab, setTab] = useState<TabKey>(model.tabs?.[0] ?? 'all');

  // Infinite growth for the Expand Search grid: the band registers a load-more
  // while it is showing results, and the page's own scroll pulses it whenever
  // the reader nears the end. The band self-throttles (it extends only after
  // the previous batch has fully streamed in), so pulsing every frame is fine.
  const webLoadMore = useRef<(() => void) | null>(null);
  const registerLoadMore = useCallback((fn: (() => void) | null) => {
    webLoadMore.current = fn;
  }, []);
  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    if (contentOffset.y + layoutMeasurement.height >= contentSize.height - END_REACH_PX) {
      webLoadMore.current?.();
    }
  }, []);

  const visibleSections = useMemo(() => {
    if (!model.tabs || tab === 'all') return model.sections;
    return model.sections.filter((s) => sectionMatchesTab(s, tab));
  }, [model, tab]);

  const financeOnly = model.sections.every((s) =>
    ['cards', 'similar_cards', 'loans', 'savings'].includes(s.kind)
  );
  const expand = !!model.expandSearch && !financeOnly;

  /**
   * The page's rows, as a FLAT array rather than JSX nested in a fragment, because
   * `stickyHeaderIndices` addresses the ScrollView's children **by index** and a
   * fragment would hide the tab bar inside one child (D059). Falsy rows are dropped
   * as they are pushed, not left in place: native counts children with
   * `Children.toArray`, which discards nulls, while RN-web counts them with
   * `Children.map`, which does not — so a conditional hero would shift the index on
   * one platform only. Building the list here makes one index correct on both.
   */
  const rows: React.ReactNode[] = [];
  let stickyIndex = -1;

  // Context line (§3.3): count for broad match, "Best match for…" for single entity.
  rows.push(
    <Animated.View key="context" entering={FadeIn.duration(duration.fast)} style={styles.context}>
      <Text style={[t.body14Regular, { color: color.textSecondary }]}>{model.context.label}</Text>
    </Animated.View>,
  );

  if (loading) {
    rows.push(
      <View key="skeletons" style={{ gap: space.m, paddingTop: space.s }}>
        <SkeletonCard />
        <SkeletonBlock width={'55%'} height={22} />
        <SkeletonCard />
        <SkeletonCard />
      </View>,
    );
  } else {
    // Hero — single resolved entity only; rises slightly ahead (§9.4).
    if (model.hero) {
      rows.push(
        <Animated.View key="hero" entering={FadeInDown.duration(duration.moderate)} style={styles.heroWrap}>
          {isCardArchetype(model.hero) ? (
            <CreditCard item={model.hero} />
          ) : isFinance(model.hero) ? (
            <FinanceCard item={model.hero} variant="full" />
          ) : (
            <StoreHero item={model.hero} userType={userType} />
          )}
        </Animated.View>,
      );
    }

    // After the best-match hero: a heading that frames everything below as the full
    // set of matched results (§3.3).
    if (model.hero && model.tabs) {
      rows.push(
        <View key="allResults" style={styles.allResults}>
          <Text style={[t.body14Regular, { color: color.textSecondary }]}>
            All matched results for “{model.query.charAt(0).toUpperCase() + model.query.slice(1)}”
          </Text>
        </View>,
      );
    }

    // Tab bar — only when adjacent categories are plausible. This row is the sticky
    // one: scroll past it and it pins under the shared search bar (D059).
    if (model.tabs) {
      stickyIndex = rows.length;
      rows.push(<TabBar key="tabs" tabs={model.tabs} active={tab} onChange={setTab} />);
    }

    // Content sections — crossfade when the tab filter changes (the key remounts them).
    rows.push(
      <Animated.View key={'sections-' + tab} entering={FadeIn.duration(duration.fast)}>
        {visibleSections.map((section, si) => (
          <SectionView
            key={section.kind + si}
            section={section}
            // Under the tab bar the first section owns the whole gap below the
            // hairline, and that gap is 16 (D055); section-to-section is 24.
            first={si === 0 && !!model.tabs}
            onViewAllStores={onViewAllStores}
            onOpenCategory={onOpenCategory}
          />
        ))}
      </Animated.View>,
    );

    // Expand Search — product pages only, never finance-only (§3.3).
    if (expand) {
      rows.push(
        <ExpandSearchCard key="expand" webResults={webResults} query={model.query} registerLoadMore={registerLoadMore} />,
      );
    }
  }

  // The Expand-Search band ends the page itself: its own field runs to the bottom of
  // the screen, so the usual trailing spacer would put a white gap under it. Every
  // other page still gets the scroll breathing room.
  if (!expand) rows.push(<View key="tail" style={{ height: space.huge }} />);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      scrollEnabled={!preview}
      onScroll={preview ? undefined : onScroll}
      scrollEventThrottle={100}
      // Pinned only when the bar exists AND the page scrolls: in the gallery's
      // static preview a pinned row would sit over content that never moves.
      stickyHeaderIndices={stickyIndex >= 0 && !preview ? [stickyIndex] : undefined}
    >
      {rows}
    </ScrollView>
  );
}

/**
 * A store tile is keyed by its brand logo (the visible "thing"): two rows sharing
 * the same logo render as identical cards. We never show the same brand twice in
 * one rail — collapse duplicates so no two identical tiles sit side by side.
 */
function dedupeStores(items: ResultItem[]): ResultItem[] {
  const seen = new Set<string>();
  return items.filter((it) => {
    const key = it.logo != null ? (typeof it.logo === 'string' ? it.logo : JSON.stringify(it.logo)) : `t:${it.title.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Top padding each section body carries of its own, purely to clear the shadows /
 * overhanging badges of the cards inside it. It sits between the header and the
 * first *visible* pixel of content, so it is netted off the header's gap — that's
 * what makes the measured title→element distance 12px on every section kind and
 * not "12 plus whatever this body happens to pad" (D055).
 */
const BODY_TOP_INSET: Partial<Record<SerpSection['kind'], number>> = {
  stores: space.xs, // hScroll paddingVertical
  products: space.xs, // hScroll paddingVertical
  coupons: space.s12, // couponRail paddingVertical (expiry badge + 0 6 5 shadow)
  similar_cards: space.s, // cardsRail paddingVertical (ResultCards)
};

function SectionView({
  section,
  first = false,
  onViewAllStores,
  onOpenCategory,
}: {
  section: SerpSection;
  /** First section under the tab bar — 16px from the hairline, not 24 (D055). */
  first?: boolean;
  onViewAllStores?: () => void;
  onOpenCategory?: (title: string) => void;
}) {
  // Stores rail: drop duplicate brands and keep the header count in sync.
  const resolved = section.kind === 'stores' ? { ...section, items: dedupeStores(section.items) } : section;
  const count = resolved.kind === 'stores' ? resolved.items.length : resolved.count;
  // Only the stores rail has a wired destination (the catalog View-all grid).
  const viewAll = section.kind === 'stores' ? onViewAllStores : undefined;
  return (
    <View style={first ? styles.sectionFirst : styles.section}>
      <SectionHeader
        title={resolved.title}
        count={count}
        onViewAll={viewAll && resolved.items.length > 2 ? viewAll : undefined}
        gap={space.s12 - (BODY_TOP_INSET[section.kind] ?? 0)}
      />
      {renderSectionBody(resolved, onOpenCategory)}
    </View>
  );
}

function renderSectionBody(section: SerpSection, onOpenCategory?: (title: string) => void) {
  switch (section.kind) {
    case 'stores':
      // Horizontal rail of brand-logo tiles (W4 stores design).
      return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.railBleed} contentContainerStyle={styles.hScroll}>
          {section.items.map((item) => (
            <StoreTile key={item.id} item={item} />
          ))}
        </ScrollView>
      );
    case 'products':
      // Horizontal rail of product cards (W4 products design).
      return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.railBleed} contentContainerStyle={styles.hScroll}>
          {section.items.map((item, i) => (
            <ProductCard key={item.id} item={item} index={i} />
          ))}
        </ScrollView>
      );
    case 'categories':
      // Two-row wrap of icon pills (W4 categories design) → the product category page.
      return (
        <View style={styles.categoryWrap}>
          {section.items.map((item) => (
            <CategoryChip key={item.id} item={item} onPress={onOpenCategory ? () => onOpenCategory(item.title) : undefined} />
          ))}
        </View>
      );
    case 'deals':
      // Banners run to the screen edge — cancel the page column's 20px padding.
      return <DealsCarousel items={section.items} bleed={space.m20} />;
    case 'coupons':
      return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.railBleed} contentContainerStyle={styles.couponRail}>
          {section.items.map((item) => (
            <CouponCard key={item.id} item={item} />
          ))}
        </ScrollView>
      );
    case 'campaign':
      return (
        <View style={{ gap: space.s12 }}>
          {section.items.map((item) => (
            <CampaignCard key={item.id} item={item} />
          ))}
        </View>
      );
    case 'cards':
    case 'loans':
    case 'savings':
      // Vertical stacking for financial comparison (§12: scan-down task).
      return (
        <View style={{ gap: space.s12 }}>
          {section.items.map((item, i) =>
            isCardArchetype(item) ? (
              <CreditCard key={item.id} item={item} index={i} />
            ) : (
              <FinanceCard key={item.id} item={item} variant="full" index={i} />
            ),
          )}
        </View>
      );
    case 'similar_cards':
      // CashKaro DS card carousel (artwork + name + blue cashback pill, D056).
      return <SimilarCardsRail items={section.items} />;
    default:
      return null;
  }
}

/** How close to the page end (px) the Expand Search grid starts loading more. */
const END_REACH_PX = 480;

function sectionMatchesTab(s: SerpSection, tab: TabKey): boolean {
  const map: Record<string, TabKey[]> = {
    stores: ['stores'],
    products: ['products'],
    categories: ['categories'],
    cards: ['cards', 'credit_cards', 'cobranded'],
    coupons: ['coupons'],
    deals: ['coupons'],
    loans: ['loans'],
    savings: ['savings'],
    similar_cards: ['cards'],
  };
  return (map[s.kind] ?? []).includes(tab);
}

const isFinance = (item: ResultItem) =>
  ['05_credit_card', '06_cobranded_card', '07_loan', '12_bank_savings'].includes(item.archetype);
const isCardArchetype = (item: ResultItem) =>
  ['05_credit_card', '06_cobranded_card'].includes(item.archetype);

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: color.surface },
  content: { paddingHorizontal: space.m20, paddingTop: space.s },
  context: { paddingVertical: space.s },
  heroWrap: { marginBottom: space.s },
  allResults: { gap: space.xxs, marginTop: space.s, marginBottom: space.s12 },
  // Section rhythm (D055). SectionHeader has no vertical padding of its own, so
  // these margins ARE the measured gaps: 24 between sections, and 16 from the tab
  // bar's hairline down to the first section's title.
  section: { marginTop: space.l },
  sectionFirst: { marginTop: space.m },
  // Rails must be FULL-BLEED (AGENTS.md): cancel the page column's 20px padding so
  // a mid-scroll card is cut by the screen edge, then re-inset the content on BOTH
  // sides so the first card aligns with the page and the last scrolls to the edge.
  railBleed: { marginHorizontal: -space.m20 },
  hScroll: { gap: space.s12, paddingVertical: space.xs, paddingHorizontal: space.m20 },
  // Coupon tickets hang their expiry badge 2px over the top edge and cast a
  // 0 6 5 shadow, so 4px of vertical padding clipped both. 12 clears them.
  couponRail: { gap: space.s12, paddingVertical: space.s12, paddingHorizontal: space.m20 },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s12 },
  categoryWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
});

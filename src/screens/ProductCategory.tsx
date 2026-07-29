import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import {
  color,
  type as t,
  space,
  radius,
  elevation,
  duration,
  MIN_TAP_TARGET,
  PILL_HEIGHT,
} from '../theme/tokens';
import { Icon } from '../icons/Icon';
import { StoreTile, ProductCard } from '../components/ResultCards';
import { DealsCarousel } from '../components/ResultCards';
import { Sheet, SheetOption, SheetGroup, FacetChip } from '../components/Sheet';
import { SectionHeader } from '../components/atoms';
import { CountUpText } from '../motion/CountUp';
import { categoryIcon } from '../data/categoryIcons';
import { Product, productItem } from '../data/catalog';
import { storeTilesByKeys } from '../data/storeTiles';
import { ALL_DEALS } from '../data/realData';
import {
  productCategories,
  ProductCategory as Category,
  SORTS,
  SortKey,
  sortLabel,
  Filters,
  NO_FILTERS,
  activeFilterCount,
  toggle,
  browseProducts,
  facets,
  subChips,
  categoryStats,
  categoryByKey,
  categoryStoreTileKeys,
  categoryDealIds,
  cashbackPct,
  cashbackAmt,
  discountPct,
  finalPrice,
  inr,
  SUB_LABELS,
} from '../data/productCategories';

const CAT_ICON = 44; // header identity glyph
const HERO_ICON = 56; // hero band glyph
const BAR_H = 52; // floating sort/filter bar
const SHEET_IMG_H = 168; // product sheet artwork

type SheetKind = 'sort' | 'filter' | 'category' | null;

/**
 * Product category page — the browse destination behind every "category" surface
 * in the app (SERP category rows, the suggestions Categories group, the screen
 * nav). One page serves every category.
 *
 * Shape (top → bottom, fixed → scrolling → floating):
 *  - header      back · illustrated icon · title ▾ (switches category) · search
 *  - sub chips   the category's real sub-categories with live counts (FIXED, so
 *                switching facet never requires scrolling back up)
 *  - hero band   the one number that matters: highest real cashback in the set,
 *                counted up, plus what it applies to and that it stacks on top
 *                of the store's own discount
 *  - offers      the live campaign creatives (full-bleed carousel)
 *  - stores rail where the cashback is actually earned → View all
 *  - results bar count + current sort + removable filter pills
 *  - grid        2-up product cards; tapping one opens the price-breakdown sheet
 *  - floating    Sort / Filter — thumb-reachable at any scroll position
 *
 * Every count, rate and facet on the page is derived from the catalog
 * (`data/productCategories.ts`), so nothing here can claim stock it doesn't have.
 */

export function ProductCategory({
  categoryKey,
  initialSub,
  onBack,
  onSearch,
  onOpenStore,
  onFindStores,
  onViewAllStores,
}: {
  categoryKey: string;
  initialSub?: string;
  onBack: () => void;
  onSearch?: () => void;
  /** Store tile tap → that store's page. */
  onOpenStore?: (query: string) => void;
  /** Product sheet CTA → search for the product (where to buy it). */
  onFindStores?: (query: string) => void;
  /** Stores rail "View all" → the category's full store grid. */
  onViewAllStores?: () => void;
}) {
  const [key, setKey] = useState(categoryKey);
  const category: Category = categoryByKey(key) ?? productCategories()[0];
  const cat = category.cat;

  const [sort, setSort] = useState<SortKey>('popular');
  const [filters, setFilters] = useState<Filters>({ ...NO_FILTERS, sub: initialSub ?? null });
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [draft, setDraft] = useState<Filters>(filters); // filter sheet edits, applied on confirm
  const [product, setProduct] = useState<Product | null>(null);
  const [gridW, setGridW] = useState(0);

  const scroller = useRef<ScrollView>(null);
  const toTop = () => scroller.current?.scrollTo({ y: 0, animated: true });

  // Drive the headline count-up from an explicit tick (mount + category switch)
  // rather than leaving it to `useInView`: the figure is above the fold, so the
  // IntersectionObserver path can leave it sitting at 0 (observed in a headless
  // render), and switching category should replay it anyway.
  const [countTick, setCountTick] = useState(0);
  useEffect(() => setCountTick((n) => n + 1), [key]);

  const stats = useMemo(() => categoryStats(cat), [cat]);
  const chips = useMemo(() => subChips(cat, filters), [cat, filters]);
  const items = useMemo(() => browseProducts(cat, filters, sort), [cat, filters, sort]);
  const draftCount = useMemo(() => browseProducts(cat, draft, sort).length, [cat, draft, sort]);
  const draftFacets = useMemo(() => facets(cat, draft), [cat, draft]);
  // Curated on-design tiles for THIS category (see categoryStoreTileKeys) — the
  // generic hash-mapped slots would put Duolingo under "Electronics stores".
  const stores = useMemo(() => storeTilesByKeys(categoryStoreTileKeys(key), `pc-${key}`), [key]);
  const deals = useMemo(() => {
    const ids = categoryDealIds(key);
    return ALL_DEALS.filter((d) => ids.includes(d.id));
  }, [key]);

  const activeCount = activeFilterCount(filters);
  const cardW = gridW > 0 ? Math.floor((gridW - space.m20) / 2) : 132;
  // Crossfade the grid whenever the result set changes — the list visibly reacts
  // to a filter instead of silently swapping rows.
  const gridKey = `${key}|${filters.sub ?? ''}|${filters.brands.join()}|${filters.bands.join()}|${filters.minCb ?? ''}|${sort}`;

  const setSub = (sub: string | null) => {
    setFilters((f) => ({ ...f, sub }));
    toTop();
  };
  const clearFilters = () => setFilters((f) => ({ ...NO_FILTERS, sub: f.sub }));
  const openFilters = () => {
    setDraft(filters);
    setSheet('filter');
  };
  const applyFilters = () => {
    setFilters(draft);
    setSheet(null);
    toTop();
  };

  return (
    <View style={styles.screen}>
      {/* ── Header: back · identity · category switcher · search ─────────────── */}
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Go back">
          <Icon name="back" size={20} color={color.aura.ink} />
        </Pressable>
        <Pressable
          onPress={() => setSheet('category')}
          style={styles.headerId}
          accessibilityRole="button"
          accessibilityLabel={`${category.title}. Change category`}
        >
          <CategoryGlyph title={cat} size={CAT_ICON} />
          <View style={styles.headerText}>
            <View style={styles.headerTitleRow}>
              <Text style={[t.body16SemiBold, { color: color.aura.ink }]} numberOfLines={1}>
                {category.title}
              </Text>
              <Icon name="chevron" size={11} color={color.aura.slate} style={styles.caret} />
            </View>
            <Text style={[t.body12Regular, { color: color.aura.slateMuted }]} numberOfLines={1}>
              {stats.products} products · {stats.stores} stores
            </Text>
          </View>
        </Pressable>
        <Pressable onPress={onSearch} hitSlop={12} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Search">
          <Icon name="search" size={17} color={color.aura.slate} />
        </Pressable>
      </View>

      {/* ── Sub-category chips (fixed: this is navigation, not content) ──────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipRow}
      >
        <SubChip label="All" count={stats.products} on={filters.sub == null} onPress={() => setSub(null)} />
        {chips.map((c) => (
          <SubChip
            key={c.key}
            label={c.label}
            count={c.count}
            on={filters.sub === c.key}
            onPress={() => setSub(filters.sub === c.key ? null : c.key)}
          />
        ))}
      </ScrollView>

      <ScrollView
        ref={scroller}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero band: the highest real rate in this set ───────────────────── */}
        <View style={styles.heroWrap}>
          <LinearGradient
            colors={[color.aura.heroFrom, color.aura.heroTo]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroRow}>
            <CategoryGlyph title={cat} size={HERO_ICON} />
            <View style={styles.heroText}>
              <Text style={[t.body12Medium, { color: color.aura.slateMuted }]}>Earn up to</Text>
              <View style={styles.heroFigureRow}>
                <CountUpText
                  value={stats.maxCbPct}
                  suffix="%"
                  trigger={countTick}
                  format={(n) => (Number.isInteger(stats.maxCbPct) ? `${Math.round(n)}` : n.toFixed(1))}
                  style={[t.display32Bold, { color: color.aura.cashback }]}
                />
                <Text style={[t.heading18SemiBold, { color: color.aura.slate }]}>cashback</Text>
              </View>
              <Text style={[t.body12Regular, { color: color.aura.slate }]}>
                across {stats.products} products from {stats.brands} brands
              </Text>
            </View>
          </View>
          <View style={styles.heroChips}>
            <View style={styles.heroChip}>
              <Icon name="bolt" size={11} color={color.aura.green} />
              <Text style={[t.body12SemiBold, { color: color.aura.green }]}>  Stacks on top of store discounts</Text>
            </View>
            {stats.maxDiscount > 0 && (
              <View style={[styles.heroChip, styles.heroChipNeutral]}>
                <Icon name="tag" size={11} color={color.aura.slate} />
                <Text style={[t.body12SemiBold, { color: color.aura.slate }]}>  Up to {stats.maxDiscount}% off MRP</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Live campaign creatives that actually belong to this category ──── */}
        {deals.length > 0 && (
          <View style={styles.block}>
            <SectionHeader title="Offers live now" />
            <DealsCarousel items={deals} bleed={space.m20} />
          </View>
        )}

        {/* ── Where the cashback is earned ──────────────────────────────────── */}
        {stores.length > 0 && (
          <View style={styles.block}>
            {/* No count here: the rail shows the on-design tiles for the category
                while "View all" opens the catalog's full store list for it, so a
                number next to the title would contradict the destination. */}
            {/* `rail` pads 4px vertically to clear the tile shadows, so the header's
                gap nets down to 8 to keep the visible title→tile distance at 12 (D055). */}
            <SectionHeader title={`Earn at these ${cat} stores`} onViewAll={onViewAllStores} gap={space.s12 - space.xs} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.railBleed} contentContainerStyle={styles.rail}>
              {stores.map((item) => (
                <StoreTile key={item.id} item={item} onPress={() => onOpenStore?.(item.title.toLowerCase())} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Results bar: what you're looking at, and how it's ordered ─────── */}
        <View style={styles.resultsBar}>
          <Text style={[t.body14SemiBoldFlat, { color: color.aura.ink }]}>
            {items.length} {items.length === 1 ? 'product' : 'products'}
            {filters.sub ? ` in ${SUB_LABELS[filters.sub] ?? filters.sub}` : ''}
          </Text>
          <Text style={[t.body12Regular, { color: color.aura.slateMuted }]}>Sorted by {sortLabel(sort)}</Text>
        </View>

        {activeCount > 0 && (
          <View style={styles.pills}>
            {filters.brands.map((b) => (
              <RemovablePill key={`b-${b}`} label={b} onRemove={() => setFilters((f) => ({ ...f, brands: toggle(f.brands, b) }))} />
            ))}
            {filters.bands.map((b) => (
              <RemovablePill
                key={`p-${b}`}
                label={facets(cat, NO_FILTERS).bands.find((x) => x.key === b)?.label ?? b}
                onRemove={() => setFilters((f) => ({ ...f, bands: toggle(f.bands, b) }))}
              />
            ))}
            {filters.minCb != null && (
              <RemovablePill label={`${filters.minCb}% cashback & above`} onRemove={() => setFilters((f) => ({ ...f, minCb: null }))} />
            )}
            <Pressable onPress={clearFilters} hitSlop={10} style={styles.clearAll} accessibilityRole="button" accessibilityLabel="Clear all filters">
              <Text style={[t.body12SemiBold, { color: color.aura.cta }]}>Clear all</Text>
            </Pressable>
          </View>
        )}

        {/* ── Product grid ──────────────────────────────────────────────────── */}
        <View onLayout={(e) => setGridW(Math.round(e.nativeEvent.layout.width))}>
          {items.length > 0 ? (
            <Animated.View key={gridKey} entering={FadeIn.duration(duration.fast)} style={styles.grid}>
              {items.map((p, i) => (
                <ProductCard
                  key={p.id}
                  item={productItem(p, `pc-${p.id}`)}
                  index={i}
                  width={cardW}
                  onPress={() => setProduct(p)}
                />
              ))}
              {items.length % 2 === 1 && <View style={{ width: cardW }} />}
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInDown.duration(duration.base)} style={styles.empty}>
              <CategoryGlyph title={cat} size={HERO_ICON} dim />
              <Text style={[t.body16SemiBold, { color: color.aura.ink }]}>No products match these filters</Text>
              <Text style={[t.body14Regular, styles.emptyLine]}>
                {stats.products} products are available in {category.title} — try dropping a filter.
              </Text>
              <Pressable onPress={clearFilters} style={styles.emptyCta} accessibilityRole="button" accessibilityLabel="Clear filters">
                <Text style={[t.body14SemiBold, { color: color.textInverse }]}>Clear filters</Text>
              </Pressable>
            </Animated.View>
          )}
        </View>

        <Text style={[t.body12Regular, styles.foot]}>
          Prices and rates are indicative and change with the store's own offers. CashKaro cashback is credited after the
          store confirms the order.
        </Text>
        <View style={{ height: space.huge96 }} />
      </ScrollView>

      {/* ── Floating sort / filter bar ─────────────────────────────────────── */}
      <View style={styles.barWrap} pointerEvents="box-none">
        <View style={styles.bar}>
          <Pressable
            onPress={() => setSheet('sort')}
            style={styles.barHalf}
            accessibilityRole="button"
            accessibilityLabel={`Sort. Currently ${sortLabel(sort)}`}
          >
            <Icon name="sort" size={14} color={color.aura.ink} />
            <Text style={[t.body14SemiBoldFlat, { color: color.aura.ink }]}>{sortLabel(sort)}</Text>
          </Pressable>
          <View style={styles.barSep} />
          <Pressable
            onPress={openFilters}
            style={[styles.barHalf, activeCount > 0 && styles.barHalfOn]}
            accessibilityRole="button"
            accessibilityLabel={activeCount > 0 ? `Filters, ${activeCount} applied` : 'Filters'}
          >
            <Icon name="filter" size={14} color={activeCount > 0 ? color.textInverse : color.aura.ink} />
            <Text style={[t.body14SemiBoldFlat, { color: activeCount > 0 ? color.textInverse : color.aura.ink }]}>
              Filter{activeCount > 0 ? ` · ${activeCount}` : ''}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ── Sort sheet ────────────────────────────────────────────────────── */}
      {sheet === 'sort' && (
        <Sheet title="Sort by" subtitle={`${items.length} products in view`} onClose={() => setSheet(null)}>
          {SORTS.map((s) => (
            <SheetOption
              key={s.key}
              label={s.label}
              hint={s.hint}
              selected={sort === s.key}
              onPress={() => {
                setSort(s.key);
                setSheet(null);
                toTop();
              }}
            />
          ))}
        </Sheet>
      )}

      {/* ── Filter sheet — live counts, apply/clear ───────────────────────── */}
      {sheet === 'filter' && (
        <Sheet
          title="Filters"
          subtitle={`${category.title} · ${stats.products} products`}
          onClose={() => setSheet(null)}
          footer={
            <>
              <Pressable
                onPress={() => setDraft((d) => ({ ...NO_FILTERS, sub: d.sub }))}
                style={styles.sheetGhost}
                accessibilityRole="button"
                accessibilityLabel="Clear all filters"
              >
                <Text style={[t.body14SemiBold, { color: color.aura.slate }]}>Clear all</Text>
              </Pressable>
              <Pressable
                onPress={applyFilters}
                style={[styles.sheetCta, draftCount === 0 && styles.sheetCtaOff]}
                disabled={draftCount === 0}
                accessibilityRole="button"
                accessibilityLabel={draftCount === 0 ? 'No products match' : `Show ${draftCount} products`}
              >
                <Text style={[t.body14SemiBold, { color: color.textInverse }]}>
                  {draftCount === 0 ? 'No matches' : `Show ${draftCount} ${draftCount === 1 ? 'product' : 'products'}`}
                </Text>
              </Pressable>
            </>
          }
        >
          <SheetGroup label="BRAND">
            {draftFacets.brands.map((f) => (
              <FacetChip
                key={f.key}
                label={f.label}
                count={f.count}
                selected={draft.brands.includes(f.key)}
                onPress={() => setDraft((d) => ({ ...d, brands: toggle(d.brands, f.key) }))}
              />
            ))}
          </SheetGroup>
          <SheetGroup label="PRICE">
            {draftFacets.bands.map((f) => (
              <FacetChip
                key={f.key}
                label={f.label}
                count={f.count}
                selected={draft.bands.includes(f.key)}
                onPress={() => setDraft((d) => ({ ...d, bands: toggle(d.bands, f.key) }))}
              />
            ))}
          </SheetGroup>
          {draftFacets.cashback.length > 0 && (
            <SheetGroup label="CASHBACK RATE">
              {draftFacets.cashback.map((f) => (
                <FacetChip
                  key={f.key}
                  label={f.label}
                  count={f.count}
                  selected={draft.minCb === Number(f.key)}
                  onPress={() => setDraft((d) => ({ ...d, minCb: d.minCb === Number(f.key) ? null : Number(f.key) }))}
                />
              ))}
            </SheetGroup>
          )}
        </Sheet>
      )}

      {/* ── Category switcher ─────────────────────────────────────────────── */}
      {sheet === 'category' && (
        <Sheet title="Browse a category" onClose={() => setSheet(null)}>
          {productCategories().map((c) => {
            const s = categoryStats(c.cat);
            return (
              <Pressable
                key={c.key}
                onPress={() => {
                  setKey(c.key);
                  setFilters({ ...NO_FILTERS });
                  setSort('popular');
                  setSheet(null);
                  toTop();
                }}
                style={styles.catRow}
                accessibilityRole="button"
                accessibilityLabel={`${c.title}, ${s.products} products`}
                accessibilityState={{ selected: c.key === key }}
              >
                <CategoryGlyph title={c.cat} size={CAT_ICON} />
                <View style={styles.catRowText}>
                  <Text style={[c.key === key ? t.body16SemiBold : t.body16Regular, { color: color.aura.ink }]} numberOfLines={1}>
                    {c.title}
                  </Text>
                  <Text style={[t.body12Regular, { color: color.aura.slateMuted }]} numberOfLines={1}>
                    {s.products} products · up to {Math.round(s.maxCbPct)}% cashback
                  </Text>
                </View>
                {c.key === key ? (
                  <Icon name="check" size={15} color={color.aura.cta} />
                ) : (
                  <Icon name="chevron" size={12} color={color.aura.fieldIcon} />
                )}
              </Pressable>
            );
          })}
        </Sheet>
      )}

      {/* ── Product price-breakdown sheet ─────────────────────────────────── */}
      {product && (
        <ProductSheet
          product={product}
          onClose={() => setProduct(null)}
          onFindStores={() => {
            const q = product.title;
            setProduct(null);
            onFindStores?.(q);
          }}
        />
      )}
    </View>
  );
}

/**
 * Price-breakdown sheet — the honest version of "you save ₹X": MRP → store price
 * → cashback → effective price, each line sourced from the same derivations the
 * card and the sorts use, so no two numbers on the page can disagree.
 */
function ProductSheet({
  product,
  onClose,
  onFindStores,
}: {
  product: Product;
  onClose: () => void;
  onFindStores: () => void;
}) {
  const cb = cashbackAmt(product);
  const off = discountPct(product);
  const item = productItem(product, `sheet-${product.id}`);
  return (
    <Sheet
      title={product.brand}
      subtitle={product.title}
      onClose={onClose}
      footer={
        <Pressable onPress={onFindStores} style={styles.sheetCta} accessibilityRole="button" accessibilityLabel={`Find stores for ${product.title}`}>
          <Text style={[t.body14SemiBold, { color: color.textInverse }]}>
            Find stores{cb > 0 ? ` · earn ${inr(cb)}` : ''}
          </Text>
        </Pressable>
      }
    >
      {item.productImage != null && (
        <Image source={item.productImage} style={styles.sheetImg} resizeMode="contain" accessibilityLabel={product.title} />
      )}
      <View style={styles.breakdown}>
        <BreakRow label="MRP" value={inr(product.mrp)} strike={product.mrp > product.price} />
        <BreakRow
          label={off > 0 ? `Store price (${off}% off)` : 'Store price'}
          value={inr(product.price)}
        />
        {cb > 0 && (
          <BreakRow
            label={`CashKaro cashback (${cashbackPct(product) % 1 === 0 ? cashbackPct(product) : cashbackPct(product).toFixed(1)}%)`}
            value={`− ${inr(cb)}`}
            tone="reward"
          />
        )}
        <View style={styles.breakDivider} />
        <View style={styles.breakRow}>
          <Text style={[t.body14SemiBold, { color: color.aura.ink }]}>Effective price</Text>
          <Text style={[t.heading18SemiBold, { color: color.aura.ink }]}>{inr(finalPrice(product))}</Text>
        </View>
      </View>
      <Text style={[t.body12Regular, { color: color.aura.slateMuted }]}>
        Cashback tracks within 48 hours of the order and confirms once the store validates it.
      </Text>
    </Sheet>
  );
}

function BreakRow({
  label,
  value,
  strike,
  tone,
}: {
  label: string;
  value: string;
  strike?: boolean;
  tone?: 'reward';
}) {
  return (
    <View style={styles.breakRow}>
      <Text style={[t.body14Regular, { color: color.aura.slate }]}>{label}</Text>
      <Text
        style={[
          t.body14SemiBoldFlat,
          { color: tone === 'reward' ? color.aura.green : color.aura.ink },
          strike && styles.strike,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

/** Illustrated category glyph, clipped to its circle (Figma 1674:13000 set). */
function CategoryGlyph({ title, size, dim }: { title: string; size: number; dim?: boolean }) {
  const img = categoryIcon(title);
  if (!img) {
    return (
      <View style={[styles.glyphFallback, { width: size, height: size, borderRadius: size / 2 }]}>
        <Icon name="grid" size={size * 0.4} weight="light" color={color.aura.slateMuted} />
      </View>
    );
  }
  return (
    <Image
      source={img}
      style={[{ width: size, height: size, borderRadius: size / 2 }, dim && styles.glyphDim]}
      resizeMode="cover"
      accessibilityLabel={`${title} category`}
    />
  );
}

/** Sub-category chip with its live count. */
function SubChip({ label, count, on, onPress }: { label: string; count: number; on: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: space.xxs, bottom: space.xxs }}
      style={[styles.subChip, on ? styles.subChipOn : styles.subChipOff]}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      accessibilityLabel={`${label}, ${count} ${count === 1 ? 'product' : 'products'}`}
    >
      <Text style={[t.body13Medium, { color: on ? color.textInverse : color.aura.ink }]}>{label}</Text>
      <Text style={[t.body12Regular, { color: on ? color.textInverse : color.aura.slateMuted }]}>{count}</Text>
    </Pressable>
  );
}

/** Applied-filter pill — tapping it removes that one filter (no round trip). */
function RemovablePill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Pressable
      onPress={onRemove}
      hitSlop={{ top: space.s6, bottom: space.s6 }}
      style={styles.pill}
      accessibilityRole="button"
      accessibilityLabel={`Remove filter ${label}`}
    >
      <Text style={[t.body12Medium, { color: color.aura.cta }]}>{label}</Text>
      <Icon name="clear" size={10} color={color.aura.cta} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.surface },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s,
    paddingHorizontal: space.m,
    paddingVertical: space.s,
  },
  backBtn: { width: MIN_TAP_TARGET, height: MIN_TAP_TARGET, alignItems: 'center', justifyContent: 'center' },
  headerId: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.s12, minHeight: MIN_TAP_TARGET },
  headerText: { flex: 1, gap: space.xxs },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: space.s6 },
  caret: { transform: [{ rotate: '90deg' }] }, // chevron-right → down (switcher)
  iconBtn: {
    width: MIN_TAP_TARGET,
    height: MIN_TAP_TARGET,
    borderRadius: radius.full,
    backgroundColor: color.aura.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Full-bleed horizontal scroller (AGENTS.md): pinned to content height so the
  // chips never stretch, content re-inset on BOTH sides.
  chipScroll: { flexGrow: 0, flexShrink: 0 },
  chipRow: { flexDirection: 'row', alignItems: 'center', gap: space.s, paddingHorizontal: space.m20, paddingBottom: space.s12 },
  subChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s6,
    height: PILL_HEIGHT,
    paddingHorizontal: space.s12,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  subChipOn: { backgroundColor: color.aura.cta, borderColor: color.aura.cta },
  subChipOff: { backgroundColor: color.surface, borderColor: color.aura.border },

  scroll: { flex: 1 },
  content: { paddingHorizontal: space.m20 },

  // Hero band runs to the screen edge, rounded at the bottom so it reads as one
  // header surface flowing out of the fixed chip row.
  heroWrap: {
    marginHorizontal: -space.m20,
    paddingHorizontal: space.m20,
    paddingTop: space.m,
    paddingBottom: space.m,
    gap: space.s12,
    borderBottomLeftRadius: radius.hero,
    borderBottomRightRadius: radius.hero,
    overflow: 'hidden',
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: space.s14 },
  heroText: { flex: 1, gap: space.xxs },
  heroFigureRow: { flexDirection: 'row', alignItems: 'baseline', gap: space.s6 },
  heroChips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.aura.greenSurface,
    borderRadius: radius.full,
    paddingHorizontal: space.s,
    paddingVertical: space.xs,
  },
  heroChipNeutral: { backgroundColor: color.surface },

  // No `gap`: SectionHeader owns the 12px down to its body (D055), and a gap here
  // would stack on top of it (RN has no margin collapsing).
  block: { marginTop: space.m20 },
  railBleed: { marginHorizontal: -space.m20 },
  rail: { gap: space.s12, paddingVertical: space.xs, paddingHorizontal: space.m20 },

  resultsBar: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: space.s,
    marginTop: space.m20,
    marginBottom: space.s12,
  },
  pills: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.s, marginBottom: space.s12 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s6,
    paddingHorizontal: space.s12,
    paddingVertical: space.s6,
    borderRadius: radius.full,
    backgroundColor: color.surfaceAlt,
  },
  clearAll: { paddingHorizontal: space.s6, paddingVertical: space.s6 },

  // 2-up grid: cards sized so the middle gutter equals the page padding, spread
  // with space-between so both page edges stay equal on any frame width.
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: space.m20 },

  empty: { alignItems: 'center', gap: space.s12, paddingVertical: space.xxl },
  emptyLine: { color: color.aura.slate, textAlign: 'center' },
  emptyCta: {
    minHeight: MIN_TAP_TARGET,
    paddingHorizontal: space.m20,
    borderRadius: radius.full,
    backgroundColor: color.aura.cta,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.xs,
  },
  foot: { color: color.aura.slateMuted, marginTop: space.m20 },

  // Floating bar — sits above the page, clear of the last grid row (content pads
  // by space.huge96 so nothing is ever hidden behind it).
  barWrap: { position: 'absolute', left: 0, right: 0, bottom: space.m20, alignItems: 'center' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: BAR_H,
    borderRadius: radius.full,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.aura.border,
    overflow: 'hidden',
    ...elevation.md,
  },
  barHalf: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s,
    height: BAR_H,
    paddingHorizontal: space.m20,
  },
  barHalfOn: { backgroundColor: color.aura.cta },
  barSep: { width: 1, height: space.m20, backgroundColor: color.aura.border },

  sheetCta: {
    flex: 1,
    minHeight: MIN_TAP_TARGET,
    borderRadius: radius.lg,
    backgroundColor: color.aura.cta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCtaOff: { backgroundColor: color.aura.slateMuted },
  sheetGhost: {
    minHeight: MIN_TAP_TARGET,
    paddingHorizontal: space.m,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.aura.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  catRow: { flexDirection: 'row', alignItems: 'center', gap: space.s12, minHeight: MIN_TAP_TARGET + space.s, paddingVertical: space.s },
  catRowText: { flex: 1, gap: space.xxs },

  // White ground + hairline: the catalog photos are shot on white, so a tinted
  // panel behind a contained image reads as three separate boxes.
  sheetImg: {
    width: '100%',
    height: SHEET_IMG_H,
    borderRadius: radius.lg,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.aura.border,
  },
  breakdown: { gap: space.s12 },
  breakRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.s12 },
  breakDivider: { height: 1, backgroundColor: color.aura.border },
  strike: { color: color.aura.priceMuted, textDecorationLine: 'line-through' },

  glyphFallback: { backgroundColor: color.aura.bg, alignItems: 'center', justifyContent: 'center' },
  glyphDim: { opacity: 0.4 },
});

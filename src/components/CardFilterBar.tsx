/**
 * Credit-card filter bar — the whole filter UX for a page of cards: the
 * `Category ⌄` / `Filters` chips and the `Eligibility` switch, the anchored category
 * dropdown, the five-group Filters sheet, the Check Eligibility sheet, the
 * "Showing n Credit Cards" line, the applied-filter pills and the empty state.
 *
 * Two surfaces use it — the credit-cards result page
 * ([SerpShell](./SerpShell.tsx)) and the Credit Cards "View all"
 * ([ViewAll](../screens/ViewAll.tsx)) — so both filter identically (D091). Every
 * facet, count and eligibility verdict comes from
 * [data/cardFilters](../data/cardFilters.ts); nothing is decided here.
 *
 * It mounts in THREE pieces, because they belong in three different places:
 *
 *   `useCardFilters(items)`  the state, held by the screen — which needs
 *                            `filtered` for the list AND for its own count
 *   `<CardFilterBar c/>`     the controls, in the scrolling column
 *   `<CardFilterSheets c/>`  the bottom sheets, as a sibling of the scroller
 *
 * The split is not decoration: a `Sheet` is absolute against its nearest parent,
 * so mounted inside the scroll column its panel pins to the bottom of the content
 * rather than the screen (D091).
 *
 * Three interaction rules the mock implies and this enforces:
 *
 *  1. **The dropdown applies on tap** — one category, no confirm step. The sheet
 *     stages a DRAFT instead, because five groups' worth of edits need one Apply.
 *  2. **Eligibility needs a profile.** Switching it on with none opens Check
 *     Eligibility and only turns on once the profile is complete, so the toggle
 *     can never be on while silently filtering by nothing.
 *  3. **A zero-stock option is dimmed, never hidden** (D091). Canonical ladders
 *     keep their shape as you filter; the availability strip and a disabled Apply
 *     tell you when a combination has nothing in it.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet } from 'react-native';
import Animated, { FadeIn, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import {
  color,
  type as t,
  space,
  radius,
  elevation,
  duration,
  MIN_TAP_TARGET,
  PILL_HEIGHT,
  CARD_FILTER_SPEC as SPEC,
} from '../theme/tokens';
import { Icon } from '../icons/Icon';
import { HeadingLine } from './atoms';
import { Sheet } from './Sheet';
import { ResultItem } from '../data/dataContract';
import {
  CARD_FILTER_GROUPS,
  CATEGORY_OPTIONS,
  CardFacet,
  CardFilterGroup,
  CardFilterState,
  EligibilityProfile,
  INCOME_TYPES,
  IncomeType,
  NO_CARD_FILTERS,
  PIN_LENGTH,
  activeCardFilterCount,
  appliedCardFilters,
  availabilityLabel,
  cardFacets,
  categoryLabel,
  filterCards,
  groupHasSelection,
  isCompleteProfile,
  sheetFilterCount,
  toggleKey,
} from '../data/cardFilters';

/** How far the switch knob travels: the track less the knob and both insets. */
const KNOB_TRAVEL = SPEC.toggleW - SPEC.toggleKnob - SPEC.togglePad * 2;

/**
 * The filter state for one set of cards, plus the filtered set it produces —
 * INCLUDING which surface is open. The caller holds all of it because the pieces
 * mount in two different places: the bar goes in the scrolling column, and the
 * sheets have to go at screen level (see `CardFilterSheets`).
 */
export function useCardFilters(items: ResultItem[]) {
  const [filters, setFilters] = useState<CardFilterState>(NO_CARD_FILTERS);
  const [profile, setProfile] = useState<EligibilityProfile | null>(null);
  const [menu, setMenu] = useState(false);
  const [sheet, setSheet] = useState<'filters' | 'eligibility' | null>(null);
  const [draft, setDraft] = useState<CardFilterState>(NO_CARD_FILTERS);
  const [group, setGroup] = useState<CardFilterGroup>('category');

  // A new set means a new page (View all switching vertical): selections made
  // against the old one would silently hide most of this one, and a sheet left
  // open would be editing the set that just went away. The mount pass is skipped:
  // there is nothing to reset yet, and writing state on mount only causes a
  // second render.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setFilters(NO_CARD_FILTERS);
    setMenu(false);
    setSheet(null);
  }, [items]);

  const filtered = useMemo(() => filterCards(items, filters, profile), [items, filters, profile]);
  return {
    items,
    filters,
    setFilters,
    profile,
    setProfile,
    filtered,
    menu,
    setMenu,
    sheet,
    setSheet,
    draft,
    setDraft,
    group,
    setGroup,
  };
}

export type CardFilterController = ReturnType<typeof useCardFilters>;

/**
 * The bar itself — chips, switch, count line, applied pills, empty state, and the
 * category dropdown (which belongs here: it is anchored to its chip, so it should
 * travel with the bar when the page scrolls). The two bottom sheets do NOT belong
 * here; see `CardFilterSheets`.
 */
export function CardFilterBar({ c, noun = 'Credit Card' }: { c: CardFilterController; noun?: string }) {
  const { menu, setMenu, setSheet, setDraft, setGroup } = c;

  // The dropdown dims a category that would return nothing, so it needs the same
  // released-own-dimension counts the sheet uses.
  const barFacets = useMemo(() => cardFacets(c.items, c.filters, c.profile), [c.items, c.filters, c.profile]);
  const zeroCategories = useMemo(
    () => new Set(barFacets.category.filter((f) => f.count === 0).map((f) => f.key)),
    [barFacets],
  );

  const applied = appliedCardFilters(c.filters);
  const shown = c.filtered.length;

  // The sheet edits a copy: five groups' worth of changes land on the page once,
  // on Apply, instead of re-filtering the list under the sheet on every tap.
  const openFilters = () => {
    setMenu(false);
    setDraft(c.filters);
    setGroup('category');
    setSheet('filters');
  };

  const pickCategory = (key: string) => {
    c.setFilters((f) => ({ ...f, category: f.category === key ? null : key }));
    setMenu(false);
  };

  // Off → on needs a profile first; the sheet turns it on once it has one.
  const onEligible = () => {
    setMenu(false);
    if (c.filters.eligibleOnly) return c.setFilters((f) => ({ ...f, eligibleOnly: false }));
    if (c.profile) return c.setFilters((f) => ({ ...f, eligibleOnly: true }));
    setSheet('eligibility');
  };

  const clearAll = () => c.setFilters((f) => ({ ...NO_CARD_FILTERS, eligibleOnly: f.eligibleOnly }));

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <BarChip
          label={c.filters.category ? categoryLabel(c.filters.category) : 'Category'}
          active={!!c.filters.category}
          caret
          expanded={menu}
          onPress={() => setMenu((v) => !v)}
        />
        <BarChip
          label="Filters"
          active={sheetFilterCount(c.filters) > 0}
          icon
          onPress={openFilters}
        />
        <View style={styles.spacer} />
        <EligibleSwitch on={c.filters.eligibleOnly} onPress={onEligible} />
      </View>

      {/* Category dropdown, anchored under its chip. The backdrop reaches well
          past the frame so a tap anywhere outside closes it — it is absolutely
          positioned, so it costs nothing in layout. */}
      {menu && (
        <>
          <Pressable
            style={styles.backdrop}
            onPress={() => setMenu(false)}
            accessibilityRole="button"
            accessibilityLabel="Close category list"
          />
          <Animated.View entering={FadeIn.duration(duration.fast)} style={styles.menu}>
            <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
              {CATEGORY_OPTIONS.map((o) => {
                const on = c.filters.category === o.key;
                const dead = zeroCategories.has(o.key) && !on;
                return (
                  <Pressable
                    key={o.key}
                    onPress={() => pickCategory(o.key)}
                    style={[styles.menuRow, dead && styles.dead]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={dead ? `${o.label}, no cards` : o.label}
                  >
                    <Radio on={on} />
                    <Text style={[t.body14Regular, { color: color.ckds.ink }]} numberOfLines={1}>
                      {o.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>
        </>
      )}

      {/* The count IS this page's header, so it wears the same trailing-off rule
          as every other heading line on a results page (D094). */}
      <HeadingLine style={styles.countRow}>
        <Text style={[t.body14Regular, { color: color.ckds.slateMuted }]}>
          Showing {shown} {noun}
          {shown === 1 ? '' : 's'}
        </Text>
      </HeadingLine>

      {applied.length > 0 && (
        <View style={styles.pills}>
          {applied.map((p) => (
            <Pressable
              key={p.key}
              onPress={() => c.setFilters(p.without)}
              hitSlop={{ top: space.s6, bottom: space.s6 }}
              style={styles.pill}
              accessibilityRole="button"
              accessibilityLabel={`Remove filter ${p.label}`}
            >
              <Text style={[t.body12Medium, { color: color.ckds.cta }]}>{p.label}</Text>
              <Icon name="clear" size={10} color={color.ckds.cta} />
            </Pressable>
          ))}
          <Pressable
            onPress={clearAll}
            hitSlop={10}
            style={styles.clearAll}
            accessibilityRole="button"
            accessibilityLabel="Clear all filters"
          >
            <Text style={[t.body12SemiBold, { color: color.ckds.cta }]}>Clear all</Text>
          </Pressable>
        </View>
      )}

      {shown === 0 && (
        <View style={styles.empty}>
          <Text style={[t.body16SemiBold, { color: color.ckds.ink }]}>No cards match these filters</Text>
          <Text style={[t.body14Regular, styles.emptyLine]}>
            {c.items.length} {c.items.length === 1 ? 'card is' : 'cards are'} available — try dropping one.
          </Text>
          <Pressable
            onPress={clearAll}
            style={styles.emptyCta}
            accessibilityRole="button"
            accessibilityLabel="Clear filters"
          >
            <Text style={[t.body14SemiBold, { color: color.textInverse }]}>Clear filters</Text>
          </Pressable>
        </View>
      )}

    </View>
  );
}

/**
 * The bar's two bottom sheets. A SEPARATE mount because a `Sheet` is
 * `position: absolute` against its nearest parent, and the bar lives inside a
 * scrolling column: rendered there, the panel pins to the bottom of the CONTENT
 * (thousands of px down, past the cards) instead of the bottom of the screen,
 * and the scrim covers the content box rather than the page.
 *
 * So the screen mounts this as a sibling of its scroller — the same place
 * `ProductCategory` puts its sheets and `Root` puts the voice sheet. The
 * controller is what joins the two halves.
 */
export function CardFilterSheets({ c }: { c: CardFilterController }) {
  if (c.sheet === 'filters') {
    return (
      <FiltersSheet
        items={c.items}
        profile={c.profile}
        draft={c.draft}
        setDraft={c.setDraft}
        group={c.group}
        setGroup={c.setGroup}
        onClose={() => c.setSheet(null)}
        onApply={() => {
          c.setFilters(c.draft);
          c.setSheet(null);
        }}
      />
    );
  }
  if (c.sheet === 'eligibility') {
    return (
      <EligibilitySheet
        initial={c.profile}
        onClose={() => c.setSheet(null)}
        onSubmit={(p) => {
          c.setProfile(p);
          c.setFilters((f) => ({ ...f, eligibleOnly: true }));
          c.setSheet(null);
        }}
      />
    );
  }
  return null;
}

/** A bar chip. Active = this chip is carrying a selection, so it goes cobalt. */
function BarChip({
  label,
  active,
  caret,
  icon,
  expanded,
  onPress,
}: {
  label: string;
  active: boolean;
  caret?: boolean;
  icon?: boolean;
  expanded?: boolean;
  onPress: () => void;
}) {
  const tint = active ? color.textLink : color.ckds.ink;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: space.xs, bottom: space.xs }}
      style={[styles.chip, active ? styles.chipOn : styles.chipOff]}
      accessibilityRole="button"
      accessibilityState={{ selected: active, expanded }}
      accessibilityLabel={label}
    >
      <Text style={[t.body13Medium, { color: tint }]} numberOfLines={1}>
        {label}
      </Text>
      {caret && <Icon name="chevron" size={10} color={tint} style={expanded ? styles.caretUp : styles.caret} />}
      {icon && <Icon name="filter" size={12} color={tint} />}
    </Pressable>
  );
}

/** The Eligibility switch — label outside the track, both inside one tap target. */
function EligibleSwitch({ on, onPress }: { on: boolean; onPress: () => void }) {
  const p = useSharedValue(on ? 1 : 0);
  useEffect(() => {
    p.value = withTiming(on ? 1 : 0, { duration: duration.fast });
  }, [on, p]);
  const track = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(p.value, [0, 1], [color.border, color.ckds.cta]),
  }));
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: p.value * KNOB_TRAVEL }] }));
  return (
    <Pressable
      onPress={onPress}
      style={styles.eligible}
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      accessibilityLabel="Show only cards I am eligible for"
    >
      <Animated.View style={[styles.track, track]}>
        <Animated.View style={[styles.knob, knob]} />
      </Animated.View>
      <Text style={[t.body13Medium, { color: color.ckds.ink }]}>Eligibility</Text>
    </Pressable>
  );
}

function Radio({ on }: { on: boolean }) {
  return <View style={[styles.control, styles.radio, on && styles.radioOn]}>{on && <View style={styles.radioDot} />}</View>;
}

function Checkbox({ on }: { on: boolean }) {
  return (
    <View style={[styles.control, styles.checkbox, on && styles.checkboxOn]}>
      {on && <Icon name="check" size={11} color={color.textInverse} />}
    </View>
  );
}

/**
 * The Filters sheet: a fixed nav rail of the five groups on the left, that group's
 * options on the right, the live availability strip across the bottom, then Clear
 * All / Apply. Edits stage in `draft` and only reach the page on Apply, so the
 * list behind the sheet doesn't thrash while five groups are being set.
 */
function FiltersSheet({
  items,
  profile,
  draft,
  setDraft,
  group,
  setGroup,
  onClose,
  onApply,
}: {
  items: ResultItem[];
  profile: EligibilityProfile | null;
  draft: CardFilterState;
  setDraft: React.Dispatch<React.SetStateAction<CardFilterState>>;
  group: CardFilterGroup;
  setGroup: (g: CardFilterGroup) => void;
  onClose: () => void;
  onApply: () => void;
}) {
  const facets = useMemo(() => cardFacets(items, draft, profile), [items, draft, profile]);
  const count = useMemo(() => filterCards(items, draft, profile).length, [items, draft, profile]);
  const active = CARD_FILTER_GROUPS.find((g) => g.key === group) ?? CARD_FILTER_GROUPS[0];
  const selections = activeCardFilterCount(draft);

  const isOn = (key: string): boolean => {
    switch (group) {
      case 'category':
        return draft.category === key;
      case 'feeBand':
        return draft.feeBand === key;
      case 'network':
        return draft.networks.includes(key);
      case 'bank':
        return draft.banks.includes(key);
      case 'giftCard':
        return draft.minGiftCard != null && String(draft.minGiftCard) === key;
    }
  };

  // Single-select groups toggle off when re-tapped: with no "Any" row, that is the
  // only way back out of a choice without Clear All.
  const pick = (key: string) =>
    setDraft((d) => {
      switch (group) {
        case 'category':
          return { ...d, category: d.category === key ? null : key };
        case 'feeBand':
          return { ...d, feeBand: d.feeBand === key ? null : key };
        case 'network':
          return { ...d, networks: toggleKey(d.networks, key) };
        case 'bank':
          return { ...d, banks: toggleKey(d.banks, key) };
        case 'giftCard':
          return { ...d, minGiftCard: String(d.minGiftCard) === key ? null : Number(key) };
      }
    });

  const options: CardFacet[] = facets[group];

  return (
    <Sheet
      title="Filters"
      align="center"
      showClose={false}
      scroll={false}
      onClose={onClose}
      banner={
        <Text style={[t.body13Medium, styles.bannerText]}>{availabilityLabel(draft, count)}</Text>
      }
      footer={
        <>
          <Pressable
            onPress={() => setDraft((d) => ({ ...NO_CARD_FILTERS, eligibleOnly: d.eligibleOnly }))}
            style={styles.ghost}
            accessibilityRole="button"
            accessibilityLabel="Clear all filters"
          >
            <Text style={[t.body14SemiBold, { color: selections > 0 ? color.ckds.cta : color.ckds.slateMuted }]}>
              Clear All
            </Text>
          </Pressable>
          <Pressable
            onPress={onApply}
            disabled={count === 0}
            style={[styles.cta, count === 0 && styles.ctaOff]}
            accessibilityRole="button"
            accessibilityLabel={count === 0 ? 'No cards match these filters' : `Apply ${selections} filters`}
          >
            <Text style={[t.body14SemiBold, { color: color.textInverse }]}>
              Apply{selections > 0 ? ` (${selections})` : ''}
            </Text>
          </Pressable>
        </>
      }
    >
      <View style={styles.sheetBody}>
        <View style={styles.rail}>
          {CARD_FILTER_GROUPS.map((g) => {
            const on = g.key === group;
            return (
              <Pressable
                key={g.key}
                onPress={() => setGroup(g.key)}
                style={[styles.railItem, on && styles.railItemOn]}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                accessibilityLabel={g.label}
              >
                {/* Always rendered, so the labels share one left edge whether or
                    not their group is carrying a selection. */}
                <View style={[styles.railDot, groupHasSelection(g.key, draft) && styles.railDotOn]} />
                <Text
                  style={[on ? t.body14SemiBoldFlat : t.body14Regular, { color: on ? color.ckds.cta : color.ckds.ink }]}
                  numberOfLines={1}
                >
                  {g.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent} showsVerticalScrollIndicator={false}>
          <Text style={[t.body12Regular, { color: color.ckds.slateMuted }]}>{active.hint}</Text>
          {options.length === 0 ? (
            <Text style={[t.body14Regular, { color: color.ckds.slateMuted }]}>
              No {active.label.toLowerCase()} to filter by in this set.
            </Text>
          ) : (
            options.map((o) => {
              const on = isOn(o.key);
              const dead = o.count === 0 && !on;
              return (
                <Pressable
                  key={o.key}
                  onPress={() => pick(o.key)}
                  style={[styles.optionRow, dead && styles.dead]}
                  accessibilityRole={active.mode === 'multi' ? 'checkbox' : 'radio'}
                  accessibilityState={active.mode === 'multi' ? { checked: on } : { selected: on }}
                  accessibilityLabel={`${o.label}, ${o.count} ${o.count === 1 ? 'card' : 'cards'}`}
                >
                  {active.mode === 'multi' ? <Checkbox on={on} /> : <Radio on={on} />}
                  <Text style={[on ? t.body14SemiBoldFlat : t.body14Regular, { color: color.ckds.ink }]} numberOfLines={2}>
                    {o.label}
                  </Text>
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </View>
    </Sheet>
  );
}

/**
 * Check Eligibility — pin code, monthly in-hand income, income type. The three
 * are what the mini app asks for, and all three are required before the button
 * arms, so the Eligible switch can never come on against a half-filled profile.
 *
 * The note at the foot is not decoration: the verdict is an indicative one drawn
 * from the card's fee tier, not a bank decision (see `minMonthlyIncome`).
 */
function EligibilitySheet({
  initial,
  onClose,
  onSubmit,
}: {
  initial: EligibilityProfile | null;
  onClose: () => void;
  onSubmit: (p: EligibilityProfile) => void;
}) {
  const [pin, setPin] = useState(initial?.pin ?? '');
  const [income, setIncome] = useState(initial ? String(initial.monthlyIncome) : '');
  const [incomeType, setIncomeType] = useState<IncomeType | null>(initial?.incomeType ?? null);

  // Income type is deliberately unset until stated — it moves the threshold the
  // verdict is drawn against, so inheriting a default would answer for the user.
  const profile: Partial<EligibilityProfile> = {
    pin,
    monthlyIncome: Number(income) || 0,
    incomeType: incomeType ?? undefined,
  };
  const ready = isCompleteProfile(profile);
  const digits = (v: string, max: number) => v.replace(/\D/g, '').slice(0, max);

  return (
    <Sheet
      title="Check Eligibility"
      align="center"
      showClose={false}
      onClose={onClose}
      footer={
        <Pressable
          onPress={() => isCompleteProfile(profile) && onSubmit(profile)}
          disabled={!ready}
          style={[styles.cta, !ready && styles.ctaOff]}
          accessibilityRole="button"
          accessibilityLabel="Find eligible cards"
        >
          <Text style={[t.body14SemiBold, { color: color.textInverse }]}>Find Eligible Cards</Text>
        </Pressable>
      }
    >
      <View style={styles.field}>
        <Text style={[t.body15Medium, { color: color.ckds.ink }]}>Pin Code*</Text>
        <TextInput
          value={pin}
          onChangeText={(v) => setPin(digits(v, PIN_LENGTH))}
          placeholder={`Enter ${PIN_LENGTH} digits`}
          placeholderTextColor={color.ckds.slateMuted}
          keyboardType="number-pad"
          maxLength={PIN_LENGTH}
          style={[styles.input, t.body16Regular, { color: color.ckds.ink }]}
          accessibilityLabel="Pin code"
        />
      </View>

      <View style={styles.field}>
        <Text style={[t.body15Medium, { color: color.ckds.ink }]}>Monthly In Hand Income</Text>
        <View style={styles.inputRow}>
          <Text style={[t.body16Regular, { color: color.ckds.slateMuted }]}>₹</Text>
          <TextInput
            value={income}
            onChangeText={(v) => setIncome(digits(v, 8))}
            placeholder="Enter amount"
            placeholderTextColor={color.ckds.slateMuted}
            keyboardType="number-pad"
            style={[styles.inputBare, t.body16Regular, { color: color.ckds.ink }]}
            accessibilityLabel="Monthly in hand income"
          />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={[t.body15Medium, { color: color.ckds.ink }]}>Select Income Type</Text>
        <View style={styles.typeRow}>
          {INCOME_TYPES.map((it) => {
            const on = incomeType === it.key;
            return (
              <Pressable
                key={it.key}
                onPress={() => setIncomeType(it.key)}
                style={[styles.typeCard, on && styles.typeCardOn]}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                accessibilityLabel={it.label}
              >
                <Text
                  style={[on ? t.body15SemiBold : t.body15Medium, { color: on ? color.ckds.cta : color.ckds.ink }]}
                  numberOfLines={1}
                >
                  {it.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Text style={[t.body12Regular, { color: color.ckds.slateMuted }]}>
        What you see is indicative — the bank confirms eligibility when you apply.
      </Text>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  // Lifts the whole bar above the cards that follow it in the scroll, so the
  // dropdown covers them instead of being painted over.
  wrap: { zIndex: 5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  spacer: { flex: 1 },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1, // a long category name ellipsises rather than pushing the switch off
    gap: space.s6,
    height: PILL_HEIGHT,
    paddingHorizontal: space.s12,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  chipOff: { backgroundColor: color.surface, borderColor: color.border },
  chipOn: { backgroundColor: color.surfaceAlt, borderColor: color.ckds.cta },
  caret: { transform: [{ rotate: '90deg' }] }, // chevron-right → down
  caretUp: { transform: [{ rotate: '-90deg' }] }, // open ⇒ points back up

  eligible: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s6, // tighter than the chips' gap — the small track reads as part of the label
    height: PILL_HEIGHT,
    paddingHorizontal: space.s12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.border,
    backgroundColor: color.surface,
  },
  track: {
    width: SPEC.toggleW,
    height: SPEC.toggleH,
    borderRadius: radius.full,
    padding: SPEC.togglePad,
    justifyContent: 'center',
  },
  knob: {
    width: SPEC.toggleKnob,
    height: SPEC.toggleKnob,
    borderRadius: radius.full,
    backgroundColor: color.surface,
    ...elevation.xs,
  },

  backdrop: {
    position: 'absolute',
    // Both of these paint over the rows declared after them in `wrap` — without
    // it the count line drew straight through the open panel.
    zIndex: 1,
    top: -SPEC.backdropSpread,
    left: -SPEC.backdropSpread,
    right: -SPEC.backdropSpread,
    bottom: -SPEC.backdropSpread,
  },
  menu: {
    position: 'absolute',
    zIndex: 2,
    top: PILL_HEIGHT + space.s,
    left: 0,
    width: SPEC.menuW,
    paddingVertical: space.s,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.ckds.border,
    overflow: 'hidden',
    ...elevation.lg,
  },
  menuScroll: { maxHeight: SPEC.menuMaxH },
  // Without this the scroller's square corners paint over the panel's rounded
  // ones, and the first row's radio is clipped by the border rather than by the
  // curve.
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s12,
    minHeight: MIN_TAP_TARGET,
    paddingHorizontal: space.m,
  },
  /** An option that would return nothing: still tappable, visibly not worth it. */
  dead: { opacity: 0.38 },

  countRow: { marginTop: space.m, marginBottom: space.s12 },

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

  empty: { alignItems: 'center', gap: space.s12, paddingVertical: space.xl },
  emptyLine: { color: color.ckds.slate, textAlign: 'center' },
  emptyCta: {
    minHeight: MIN_TAP_TARGET,
    paddingHorizontal: space.m20,
    borderRadius: radius.full,
    backgroundColor: color.ckds.cta,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Filters sheet ──────────────────────────────────────────────────────────
  // Fixed height (SPEC.sheetBodyH): the panel scrolls inside it, so moving from a
  // 5-option group to a 12-option one can't resize the sheet under the thumb.
  sheetBody: { flexDirection: 'row', height: SPEC.sheetBodyH },
  rail: {
    width: SPEC.railW,
    paddingVertical: space.s12,
    borderRightWidth: 1,
    borderRightColor: color.ckds.border,
  },
  railItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s,
    minHeight: MIN_TAP_TARGET + space.s,
    paddingLeft: space.m,
    paddingRight: space.s,
    // Reserved on every row so the active bar doesn't shift the labels when it
    // appears (RN draws borders inside the box, so the width is unchanged).
    borderRightWidth: SPEC.railBar,
    borderRightColor: 'transparent',
  },
  railItemOn: { borderRightColor: color.ckds.cta },
  railDot: {
    width: SPEC.railDot,
    height: SPEC.railDot,
    borderRadius: radius.full,
    backgroundColor: 'transparent',
  },
  railDotOn: { backgroundColor: color.ckds.cta },

  panel: { flex: 1 },
  panelContent: { paddingHorizontal: space.m20, paddingVertical: space.s12, gap: space.s },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s12,
    minHeight: MIN_TAP_TARGET,
  },
  control: { width: SPEC.control, height: SPEC.control, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  radio: { borderRadius: radius.full, borderColor: color.border },
  radioOn: { borderColor: color.ckds.cta },
  radioDot: {
    width: SPEC.controlDot,
    height: SPEC.controlDot,
    borderRadius: radius.full,
    backgroundColor: color.ckds.cta,
  },
  checkbox: { borderRadius: radius.xs, borderColor: color.border },
  checkboxOn: { backgroundColor: color.ckds.cta, borderColor: color.ckds.cta },

  bannerText: { color: color.textLink, textAlign: 'center' },
  ghost: {
    minHeight: MIN_TAP_TARGET,
    paddingHorizontal: space.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cta: {
    flex: 1,
    minHeight: MIN_TAP_TARGET + space.s,
    borderRadius: radius.full,
    backgroundColor: color.ckds.cta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaOff: { backgroundColor: color.ckds.slateMuted },

  // ── Eligibility sheet ──────────────────────────────────────────────────────
  field: { gap: space.s },
  input: {
    minHeight: MIN_TAP_TARGET + space.s,
    paddingHorizontal: space.m,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.ckds.border,
    backgroundColor: color.surface,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s6,
    minHeight: MIN_TAP_TARGET + space.s,
    paddingHorizontal: space.m,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.ckds.border,
    backgroundColor: color.surface,
  },
  inputBare: { flex: 1, paddingVertical: space.s },
  typeRow: { flexDirection: 'row', gap: space.s12 },
  typeCard: {
    flex: 1,
    minHeight: MIN_TAP_TARGET + space.s,
    paddingHorizontal: space.s12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.ckds.border,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeCardOn: { borderColor: color.ckds.cta, backgroundColor: color.surfaceAlt },
});

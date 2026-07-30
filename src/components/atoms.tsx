/**
 * Shared page atoms — the small pieces every screen composes with, kept here so one
 * change lands everywhere: `Divider` (hairline), `FadingRule` (a heading's rule that
 * fades across the column, D094), `HeadingLine`, `SectionHeader` (title + optional
 * action), `Disclaimer` (the loudly-flagged un-sourced-number line, D005) and
 * `PlaceholderPill`.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { color, type as t, space, radius } from '../theme/tokens';
import { Icon } from '../icons/Icon';

/** Thin hairline divider (uses border token). */
export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.divider, style]} />;
}

/**
 * The hairline that carries a page's own heading line across the rest of the
 * column, fading out as it goes (D094). It is not a `Divider`: a full-strength
 * rule to the page edge reads as a table rule and boxes the content under it,
 * where this reads as the sentence trailing off — which is what a count line
 * ("Showing 12 Credit Cards", "3 cards for “credit”") is.
 *
 * Takes the width it is given, so it goes inside a `HeadingLine` (or any row) as
 * the flexible last child.
 */
export function FadingRule({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <LinearGradient
      colors={[color.ckds.border, color.ckds.border0]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={[styles.rule, style]}
    />
  );
}

/**
 * A heading line and its fading rule: the shape every "what am I looking at" line
 * on a results page shares — the SERP context line, the "All matched results"
 * line, and the cards page's "Showing n" count (D094). Pass the styled `Text`;
 * the rule takes whatever width is left.
 */
export function HeadingLine({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.headingLine, style]}>
      {children}
      <FadingRule />
    </View>
  );
}

/**
 * Section header: title + optional "(count)" + optional "View all →" action.
 *
 * The header OWNS the gap down to its section body — 12px by default (D055) — and
 * carries no vertical padding of its own, so the gap above it is exactly whatever
 * marginTop its section brings. A parent must not add its own header→body `gap`,
 * or the two stack (RN has no margin collapsing). When the body carries a top
 * inset of its own (a rail's shadow-clearance padding, say), pass `gap` netted
 * down by that inset so the VISIBLE title→element gap is still 12.
 */
export function SectionHeader({
  title,
  count,
  onViewAll,
  gap = space.s12,
}: {
  title: string;
  count?: number;
  onViewAll?: () => void;
  gap?: number;
}) {
  return (
    <View style={[styles.sectionHeader, { marginBottom: gap }]}>
      <View style={styles.sectionTitleWrap}>
        <Text style={[t.body16SemiBold, { color: color.textPrimary }]}>{title}</Text>
        {typeof count === 'number' && (
          <Text style={[t.body14Regular, { color: color.textTertiary }]}> ({count})</Text>
        )}
      </View>
      {onViewAll && (
        <Pressable
          onPress={onViewAll}
          hitSlop={12}
          style={styles.viewAll}
          accessibilityRole="button"
          accessibilityLabel={`View all ${title}`}
        >
          <Text style={[t.body14SemiBold, { color: color.textLink }]}>View all </Text>
          <Icon name="chevron" size={12} color={color.textLink} />
        </Pressable>
      )}
    </View>
  );
}

/**
 * Generic BFSI disclaimer (§6.7). Deliberately generic — no specific regulatory
 * claim. Shown above the end divider on any screen displaying rates/fees.
 */
export function Disclaimer({ text }: { text: string }) {
  return (
    <Text style={[t.body12Regular, styles.disclaimer]} accessibilityRole="text">
      {text}
    </Text>
  );
}

/**
 * Loud, dev-only placeholder styling (§7 Placeholder Protocol). Impossible to
 * mistake for real data; greppable via the word PLACEHOLDER at call sites.
 */
export function PlaceholderPill({ label = 'PLACEHOLDER' }: { label?: string }) {
  return (
    <View style={styles.placeholder}>
      <Text style={[t.caption10SemiBold, { color: color.textInverse }]}>⚠ {label}</Text>
    </View>
  );
}

/** True when a preformatted feed string is actually an un-sourced placeholder. */
export const isPlaceholderValue = (v?: string | null) => v === 'PLACEHOLDER';

const styles = StyleSheet.create({
  divider: { height: 1, backgroundColor: color.border, alignSelf: 'stretch' },
  // The rule is flexible and the row is centred, so the line always sits on the
  // label's optical middle whatever type size the caller uses.
  headingLine: { flexDirection: 'row', alignItems: 'center', gap: space.s12 },
  rule: { flex: 1, height: 1 },
  // No vertical padding, and nothing here may set a minHeight: the row's height is
  // the title's line box, so the gaps above (its section's marginTop) and below
  // (the `gap` prop) are exactly the numbers in the styles. A minHeight on the
  // View-all Pressable used to stretch the row to 44 and silently centre the title
  // inside it, which pushed the real title gaps to 18px on any section that had a
  // View-all and 8px on any that didn't (D055).
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleWrap: { flexDirection: 'row', alignItems: 'baseline' },
  // 20px line box + hitSlop 12 top/bottom = 44px effective tap target (§6.2) —
  // the same slop-not-minHeight pattern as TabBar's pills.
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: space.s,
  },
  disclaimer: {
    color: color.textTertiary,
    paddingVertical: space.s12,
    paddingHorizontal: space.xxs,
  },
  placeholder: {
    backgroundColor: color.placeholder,
    borderRadius: radius.xs,
    paddingHorizontal: space.s6,
    paddingVertical: space.xxs,
    alignSelf: 'flex-start',
  },
});

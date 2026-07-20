import React from 'react';
import { View, Text, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { color, type as t, space, radius, MIN_TAP_TARGET } from '../theme/tokens';
import { Icon } from '../icons/Icon';

/** Thin hairline divider (uses border token). */
export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.divider, style]} />;
}

/** Section header: title + optional "(count)" + optional "View all →" action. */
export function SectionHeader({
  title,
  count,
  onViewAll,
}: {
  title: string;
  count?: number;
  onViewAll?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space.s,
  },
  sectionTitleWrap: { flexDirection: 'row', alignItems: 'baseline' },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: MIN_TAP_TARGET,
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

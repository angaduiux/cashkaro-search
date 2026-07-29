import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { color, type as t, space, radius, elevation, duration, MIN_TAP_TARGET } from '../theme/tokens';
import { Icon } from '../icons/Icon';

/**
 * Bottom sheet — the app's one modal surface (sort, filters). Scrim + panel that
 * slides up from the bottom edge, capped at 84% of the host so the page stays
 * visible behind it (the user never loses their place in the grid).
 *
 * Dismissal has three routes, all of them cancel-safe: the scrim, the ✕, and the
 * grabber row. `footer` is pinned below the scrolling body so a long facet list
 * never pushes the primary action out of reach.
 */
export function Sheet({
  title,
  subtitle,
  onClose,
  footer,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View entering={FadeIn.duration(duration.fast)} exiting={FadeOut.duration(duration.fast)} style={StyleSheet.absoluteFill}>
        <Pressable
          style={styles.scrim}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={`Close ${title}`}
        />
      </Animated.View>

      <Animated.View
        entering={SlideInDown.duration(duration.moderate)}
        exiting={SlideOutDown.duration(duration.base)}
        style={styles.panel}
        accessibilityViewIsModal
      >
        {/* Grabber doubles as a dismiss target (thumb-reachable, no aim needed) */}
        <Pressable onPress={onClose} style={styles.grabWrap} accessibilityRole="button" accessibilityLabel="Dismiss">
          <View style={styles.grabber} />
        </Pressable>

        <View style={styles.head}>
          <View style={styles.headText}>
            <Text style={[t.body16SemiBold, { color: color.aura.ink }]}>{title}</Text>
            {!!subtitle && (
              <Text style={[t.body12Regular, { color: color.aura.slateMuted }]}>{subtitle}</Text>
            )}
          </View>
          <Pressable onPress={onClose} hitSlop={10} style={styles.close} accessibilityRole="button" accessibilityLabel="Close">
            <Icon name="clear" size={15} color={color.aura.slate} />
          </Pressable>
        </View>

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>

        {footer && <View style={styles.footer}>{footer}</View>}
      </Animated.View>
    </View>
  );
}

/** Single-select row (sort). Check mark carries the state — no radio ring needed. */
export function SheetOption({
  label,
  hint,
  selected,
  onPress,
}: {
  label: string;
  hint?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.option}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={hint ? `${label}. ${hint}` : label}
    >
      <View style={styles.optionText}>
        <Text style={[selected ? t.body16SemiBold : t.body16Regular, { color: color.aura.ink }]}>{label}</Text>
        {!!hint && <Text style={[t.body12Regular, { color: color.aura.slateMuted }]}>{hint}</Text>}
      </View>
      {selected && <Icon name="check" size={15} color={color.aura.cta} />}
    </Pressable>
  );
}

/** Multi-select facet chip with its live result count (filters). */
export function FacetChip({
  label,
  count,
  selected,
  onPress,
}: {
  label: string;
  count: number;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.facet, selected ? styles.facetOn : styles.facetOff]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${label}, ${count} ${count === 1 ? 'product' : 'products'}`}
    >
      {selected && <Icon name="check" size={11} color={color.textInverse} />}
      <Text style={[t.body13Medium, { color: selected ? color.textInverse : color.aura.ink }]}>{label}</Text>
      <Text style={[t.body12Regular, { color: selected ? color.textInverse : color.aura.slateMuted }]}>{count}</Text>
    </Pressable>
  );
}

/** Group label inside a sheet. */
export function SheetGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={[t.body12SemiBold, { color: color.aura.slate }]}>{label}</Text>
      <View style={styles.groupBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: color.scrim },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '84%',
    backgroundColor: color.surface,
    borderTopLeftRadius: radius.hero,
    borderTopRightRadius: radius.hero,
    ...elevation.lg,
  },
  grabWrap: { alignItems: 'center', paddingTop: space.s12, paddingBottom: space.s },
  grabber: { width: 44, height: 4, borderRadius: radius.full, backgroundColor: color.border },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s12,
    paddingHorizontal: space.m20,
    paddingBottom: space.s12,
    borderBottomWidth: 1,
    borderBottomColor: color.aura.border,
  },
  headText: { flex: 1, gap: space.xxs },
  close: {
    width: MIN_TAP_TARGET,
    height: MIN_TAP_TARGET,
    borderRadius: radius.full,
    backgroundColor: color.aura.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flexGrow: 0 },
  bodyContent: { paddingHorizontal: space.m20, paddingVertical: space.m, gap: space.m20 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s12,
    minHeight: MIN_TAP_TARGET + space.s,
    paddingVertical: space.s,
  },
  optionText: { flex: 1, gap: space.xxs },
  group: { gap: space.s12 },
  groupBody: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
  facet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s6,
    minHeight: MIN_TAP_TARGET,
    paddingHorizontal: space.s12,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  facetOn: { backgroundColor: color.aura.cta, borderColor: color.aura.cta },
  facetOff: { backgroundColor: color.surface, borderColor: color.aura.border },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s12,
    paddingHorizontal: space.m20,
    paddingTop: space.s12,
    paddingBottom: space.m20,
    borderTopWidth: 1,
    borderTopColor: color.aura.border,
  },
});

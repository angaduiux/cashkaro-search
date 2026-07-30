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
 *
 * The four optional props below are the card-filter sheets' variant (D092) — a
 * centred title on its own tinted head, no ✕ (the grabber and scrim still
 * dismiss), a body that scrolls internally instead of as a whole, and a strip
 * above the footer for a live count. All default to today's behaviour, so the
 * sort/filter/product sheets are untouched.
 */
export function Sheet({
  title,
  subtitle,
  onClose,
  footer,
  align = 'left',
  showClose = true,
  scroll = true,
  banner,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  footer?: React.ReactNode;
  /** 'center' also tints the head band, so the title reads as its own header. */
  align?: 'left' | 'center';
  showClose?: boolean;
  /** false ⇒ children own their scrolling and their padding (rail + panel). */
  scroll?: boolean;
  /** Full-width strip between body and footer (the availability count). */
  banner?: React.ReactNode;
  children: React.ReactNode;
}) {
  const centered = align === 'center';
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
        <Pressable
          onPress={onClose}
          style={[styles.grabWrap, centered && styles.grabWrapCentered]}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        >
          <View style={styles.grabber} />
        </Pressable>

        <View style={[styles.head, centered && styles.headCentered]}>
          <View style={[styles.headText, centered && styles.headTextCentered]}>
            <Text style={[centered ? t.heading18SemiBold : t.body16SemiBold, { color: color.ckds.ink }]}>{title}</Text>
            {!!subtitle && (
              <Text style={[t.body12Regular, { color: color.ckds.slateMuted }]}>{subtitle}</Text>
            )}
          </View>
          {showClose && (
            <Pressable onPress={onClose} hitSlop={10} style={styles.close} accessibilityRole="button" accessibilityLabel="Close">
              <Icon name="clear" size={15} color={color.ckds.slate} />
            </Pressable>
          )}
        </View>

        {scroll ? (
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        ) : (
          children
        )}

        {banner && <View style={styles.banner}>{banner}</View>}

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
        <Text style={[selected ? t.body16SemiBold : t.body16Regular, { color: color.ckds.ink }]}>{label}</Text>
        {!!hint && <Text style={[t.body12Regular, { color: color.ckds.slateMuted }]}>{hint}</Text>}
      </View>
      {selected && <Icon name="check" size={15} color={color.ckds.cta} />}
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
      <Text style={[t.body13Medium, { color: selected ? color.textInverse : color.ckds.ink }]}>{label}</Text>
      <Text style={[t.body12Regular, { color: selected ? color.textInverse : color.ckds.slateMuted }]}>{count}</Text>
    </Pressable>
  );
}

/** Group label inside a sheet. */
export function SheetGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={[t.body12SemiBold, { color: color.ckds.slate }]}>{label}</Text>
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
  // The centred head is a tinted band, and the grabber sits ON it — one surface
  // from the sheet's top edge down to the hairline, not a white strip above it.
  grabWrapCentered: {
    backgroundColor: color.ckds.bg,
    borderTopLeftRadius: radius.hero,
    borderTopRightRadius: radius.hero,
  },
  grabber: { width: 44, height: 4, borderRadius: radius.full, backgroundColor: color.border },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s12,
    paddingHorizontal: space.m20,
    paddingBottom: space.s12,
    borderBottomWidth: 1,
    borderBottomColor: color.ckds.border,
  },
  // Centred variant: the head becomes its own tinted header band, so the sheet
  // reads title-first (there is no ✕ competing with the title for the corner).
  headCentered: {
    backgroundColor: color.ckds.bg,
    paddingTop: space.s,
    paddingBottom: space.m,
    borderTopLeftRadius: radius.hero,
    borderTopRightRadius: radius.hero,
    borderBottomColor: 'transparent',
  },
  headText: { flex: 1, gap: space.xxs },
  headTextCentered: { alignItems: 'center' },
  // Live-count strip above the footer — full-bleed, so it reads as part of the
  // sheet's chrome rather than as the last row of the list.
  banner: {
    paddingHorizontal: space.m20,
    paddingVertical: space.s12,
    backgroundColor: color.surfaceAlt,
    borderTopWidth: 1,
    borderTopColor: color.ckds.border,
  },
  close: {
    width: MIN_TAP_TARGET,
    height: MIN_TAP_TARGET,
    borderRadius: radius.full,
    backgroundColor: color.ckds.bg,
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
  facetOn: { backgroundColor: color.ckds.cta, borderColor: color.ckds.cta },
  facetOff: { backgroundColor: color.surface, borderColor: color.ckds.border },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s12,
    paddingHorizontal: space.m20,
    paddingTop: space.s12,
    paddingBottom: space.m20,
    borderTopWidth: 1,
    borderTopColor: color.ckds.border,
  },
});

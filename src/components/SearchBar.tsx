import React, { useEffect, useState } from 'react';
import { TextInput, Text, View, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { color, type as t, space, radius, fontFamily, elevation, MIN_TAP_TARGET } from '../theme/tokens';
import { Icon } from '../icons/Icon';
import { EASE } from '../motion/motion';
import { duration } from '../theme/tokens';

/**
 * Catalog words the empty-field placeholder cycles through, one by one — the
 * whole thing CashKaro is searchable across (stores, products, and the finance
 * catalog: credit cards, loans, …). Each swaps in with a slide-up + fade.
 */
const CATALOG_WORDS = [
  'Stores',
  'Products',
  'Credit Cards',
  'Loans',
  'Fashion',
  'Beauty',
  'Electronics',
  'Flights',
  'Coupons',
  'Deals',
];
const PH_DWELL = 1600; // ms each word rests, fully shown
const PH_TRANS = 300; // ms slide-up + fade for enter/exit

/** Animated placeholder: static "Search " + one catalog word that rotates. */
function AnimatedPlaceholder() {
  const [idx, setIdx] = useState(0);
  const opacity = useSharedValue(1);
  const ty = useSharedValue(0);

  useEffect(() => {
    let alive = true;
    // Enter: the freshly-swapped word rises from below into place.
    opacity.value = withTiming(1, { duration: PH_TRANS, easing: EASE.emphasized });
    ty.value = withTiming(0, { duration: PH_TRANS, easing: EASE.emphasized });
    const rest = setTimeout(() => {
      if (!alive) return;
      // Exit: current word floats up and out.
      opacity.value = withTiming(0, { duration: PH_TRANS, easing: EASE.accelerate });
      ty.value = withTiming(-10, { duration: PH_TRANS, easing: EASE.accelerate });
      setTimeout(() => {
        if (!alive) return;
        ty.value = 10; // reset below the line so the next word can rise in
        setIdx((i) => (i + 1) % CATALOG_WORDS.length);
      }, PH_TRANS);
    }, PH_DWELL);
    return () => {
      alive = false;
      clearTimeout(rest);
    };
  }, [idx]);

  const wordStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: ty.value }],
  }));

  return (
    <View style={styles.phOverlay} pointerEvents="none">
      <Text style={styles.phText}>Search </Text>
      <View style={styles.phClip}>
        <Animated.Text style={[styles.phText, wordStyle]}>{CATALOG_WORDS[idx]}</Animated.Text>
      </View>
    </View>
  );
}

/**
 * Search bar (Figma 1646:7739 / typed-text 1646:7468). Elevated white field
 * (radius 12, soft 8/28 shadow), grey search icon, typed text in ink #0e1116
 * with a cobalt caret, and a clear (✕) affordance.
 *
 * Signature entry motion (§9.4): when the search screen mounts the back arrow
 * slides + fades in and grows its width, pushing the field across (a shared-
 * element-style morph from the Home search bar). The trailing mic↔clear icons
 * cross-fade with a scale as the query toggles. Transform/opacity only; honours
 * reduced motion via Reanimated defaults on withTiming.
 */
export function SearchBar({
  value,
  onChangeText,
  onFocus,
  onSubmit,
  onBack,
  onClear,
  onVoice,
  showBack,
  autoFocus,
  inputRef,
  onWash,
  placeholder = 'Search stores, products, cards…',
}: {
  value: string;
  onChangeText: (s: string) => void;
  onFocus?: () => void;
  onSubmit?: () => void;
  onBack?: () => void;
  onClear?: () => void;
  /** Mic tap. Opens the voice sheet in place of the keyboard (see VoiceSheet). */
  onVoice?: () => void;
  showBack?: boolean;
  autoFocus?: boolean;
  /** Lets the owner focus the field imperatively — the bar is persistent, so
   *  `autoFocus` only ever fires on first mount and can't raise the keyboard
   *  when search is entered from a chip, nav item, or back-out of the SERP. */
  inputRef?: React.RefObject<TextInput | null>;
  /** The bar is sitting on a HeroBleed wash (store-hero SERP, D069): the wrap
   *  drops its white so the wash runs behind it, and the field itself turns
   *  WHITE — the flat #eef1f6 fill is a grey-on-grey tint that goes muddy over a
   *  colour, where white reads as a clean floating field. Root fades a white
   *  underlay back in on scroll, so content never slides visibly beneath it. */
  onWash?: boolean;
  placeholder?: string;
}) {
  const hasText = value.length > 0;

  // Back arrow slides + widens in when showBack turns on, and back out when off.
  // (The bar is persistent, so this is driven by the showBack prop, not mount.)
  const enter = useSharedValue(showBack ? 1 : 0);
  useEffect(() => {
    enter.value = withTiming(showBack ? 1 : 0, { duration: duration.moderate, easing: EASE.emphasized });
  }, [showBack]);

  const backStyle = useAnimatedStyle(() => ({
    width: interpolate(enter.value, [0, 1], [0, 34], Extrapolation.CLAMP),
    opacity: interpolate(enter.value, [0.2, 1], [0, 1], Extrapolation.CLAMP),
    transform: [{ translateX: interpolate(enter.value, [0, 1], [-12, 0]) }],
  }));

  // Trailing icon cross-fade (mic ↔ clear).
  const tx = useSharedValue(hasText ? 1 : 0);
  useEffect(() => {
    tx.value = withTiming(hasText ? 1 : 0, { duration: duration.fast });
  }, [hasText]);
  // CLAMPed, all of them: `interpolate` extrapolates by default, and a trailing
  // icon that momentarily reads tx outside [0,1] scales by 11× — the glyph then
  // covers the whole frame (measured: the 16px mic laying out at 405×540).
  const clearStyle = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [0, 1], [0, 1], Extrapolation.CLAMP),
    transform: [
      { scale: interpolate(tx.value, [0, 1], [0.6, 1], Extrapolation.CLAMP) },
      { rotateZ: `${interpolate(tx.value, [0, 1], [-30, 0], Extrapolation.CLAMP)}deg` },
    ],
  }));
  const micStyle = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [0, 1], [1, 0], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(tx.value, [0, 1], [1, 0.6], Extrapolation.CLAMP) }],
  }));

  return (
    <Animated.View style={[styles.wrap, onWash && styles.wrapTransparent]}>
      {/* Always mounted so it can slide in/out; width collapses to 0 when hidden */}
      <Animated.View style={[styles.backWrap, backStyle]} pointerEvents={showBack ? 'auto' : 'none'}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.back} accessibilityRole="button" accessibilityLabel="Back">
          <Icon name="back" size={22} color={color.aura.ink} />
        </Pressable>
      </Animated.View>
      <Animated.View style={[styles.field, onWash && styles.fieldOnWash]}>
        <Icon name="search" size={16} color={color.aura.fieldIcon} />
        <View style={styles.inputWrap}>
          {/* Rotating catalog-word placeholder; only while the field is empty. */}
          {!hasText && <AnimatedPlaceholder />}
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={onChangeText}
            onFocus={onFocus}
            onSubmitEditing={onSubmit}
            autoFocus={autoFocus}
            placeholder=""
            placeholderTextColor={color.aura.fieldIcon}
            returnKeyType="search"
            selectionColor={color.aura.cta}
            cursorColor={color.aura.cta}
            style={[styles.input, { fontFamily: hasText ? fontFamily.medium : fontFamily.regular }]}
            accessibilityLabel={placeholder}
          />
        </View>
        <Pressable
          onPress={hasText ? onClear : onVoice}
          hitSlop={12}
          style={styles.trailing}
          accessibilityRole="button"
          accessibilityLabel={hasText ? 'Clear' : 'Voice search'}
        >
          <Animated.View style={[styles.trailingIcon, micStyle]} pointerEvents="none">
            <Icon name="mic" size={16} color={color.aura.cta} weight="solid" />
          </Animated.View>
          <Animated.View style={[styles.trailingIcon, clearStyle]} pointerEvents="none">
            <Icon name="clear" size={16} color={color.aura.fieldIcon} />
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.m,
    paddingVertical: space.s,
    backgroundColor: color.surface,
  },
  // Over a HeroBleed wash (D069): no white band around the field.
  wrapTransparent: { backgroundColor: 'transparent' },
  backWrap: { height: MIN_TAP_TARGET, overflow: 'hidden', justifyContent: 'center' },
  back: { width: 34, height: MIN_TAP_TARGET, alignItems: 'flex-start', justifyContent: 'center' },
  // Figma searchBar (1668:10754): flat #eef1f6 fill, radius 32, NO shadow.
  field: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s12,
    backgroundColor: color.aura.searchField,
    borderRadius: radius.xxl,
    paddingHorizontal: space.m, // 16px side padding
  },
  // On a wash: white field + a soft lift, so it floats on the colour instead of
  // dissolving into it (the flat grey fill reads as a hole over a tint).
  fieldOnWash: { backgroundColor: color.surface, ...elevation.soft },
  // Holds the TextInput plus the absolutely-positioned animated placeholder.
  inputWrap: { flex: 1, justifyContent: 'center' },
  // typed text: ink #0e1116, Outfit Medium 14; placeholder Regular (set inline)
  input: {
    fontSize: 14,
    lineHeight: 20,
    color: color.aura.ink,
    paddingVertical: space.s,
    outlineStyle: 'none',
  } as any,
  // Animated placeholder overlay — aligned to the text start, ignores touches.
  phOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center' },
  phClip: { height: 20, overflow: 'hidden', justifyContent: 'center' },
  phText: { fontSize: 14, lineHeight: 20, color: color.aura.fieldIcon, fontFamily: fontFamily.regular },
  trailing: { width: 24, height: 36, alignItems: 'center', justifyContent: 'center' },
  trailingIcon: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
});

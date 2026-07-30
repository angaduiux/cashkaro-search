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
import { MicGlyph } from '../icons/MicGlyph';
import { EASE } from '../motion/motion';
import { duration } from '../theme/tokens';

/** Width the clear slot opens to: the 26px button plus its 13px divider gutter. */
const CLEAR_SLOT = 39;
/** Tap padding. Split left/right so clear's and mic's hit areas never overlap —
 *  two 12px-slopped buttons 13px apart both claim the gap between them. */
const CLEAR_SLOP = { top: 12, bottom: 12, left: 10, right: 2 };
const MIC_SLOP = { top: 12, bottom: 12, left: 2, right: 12 };

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
 * element-style morph from the Home search bar). Transform/opacity only; honours
 * reduced motion via Reanimated defaults on withTiming.
 *
 * Trailing actions are PERSISTENT-MIC (D090): the gradient mic (`icons/MicGlyph`)
 * is always mounted at the field's right edge, and a clear (✕) opens to its left
 * behind a hairline once there's a query — the mic never moves and never leaves.
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

  // Clear reveal. The mic is NOT part of this: it stays mounted and visible at the
  // right edge for the whole session (D090) — voice is a way to *start over* mid-
  // query, which is exactly when the old cross-fade took it away. Clear slides in
  // to the mic's LEFT instead, its wrapper widening from 0 so the mic never moves.
  const tx = useSharedValue(hasText ? 1 : 0);
  useEffect(() => {
    tx.value = withTiming(hasText ? 1 : 0, { duration: duration.fast });
  }, [hasText]);
  // CLAMPed, all of them: `interpolate` extrapolates by default, and a trailing
  // icon that momentarily reads tx outside [0,1] scales by 11× — the glyph then
  // covers the whole frame (measured: the 16px mic laying out at 405×540).
  const clearSlotStyle = useAnimatedStyle(() => ({
    width: interpolate(tx.value, [0, 1], [0, CLEAR_SLOT], Extrapolation.CLAMP),
    opacity: interpolate(tx.value, [0, 1], [0, 1], Extrapolation.CLAMP),
  }));
  const clearGlyphStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(tx.value, [0, 1], [0.6, 1], Extrapolation.CLAMP) },
      { rotateZ: `${interpolate(tx.value, [0, 1], [-30, 0], Extrapolation.CLAMP)}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.wrap, onWash && styles.wrapTransparent]}>
      {/* Always mounted so it can slide in/out; width collapses to 0 when hidden */}
      <Animated.View style={[styles.backWrap, backStyle]} pointerEvents={showBack ? 'auto' : 'none'}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.back} accessibilityRole="button" accessibilityLabel="Back">
          <Icon name="back" size={22} color={color.ckds.ink} />
        </Pressable>
      </Animated.View>
      <Animated.View style={[styles.field, onWash && styles.fieldOnWash]}>
        <Icon name="search" size={16} color={color.ckds.fieldIcon} />
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
            placeholderTextColor={color.ckds.fieldIcon}
            returnKeyType="search"
            selectionColor={color.ckds.cta}
            cursorColor={color.ckds.cta}
            style={[styles.input, { fontFamily: hasText ? fontFamily.medium : fontFamily.regular }]}
            accessibilityLabel={placeholder}
          />
        </View>
        {/* Trailing actions: [clear │] mic. Two separate buttons, so each carries
            its own label instead of one control that silently changes meaning. */}
        <View style={styles.trailingRow}>
          <Animated.View
            style={[styles.clearSlot, clearSlotStyle]}
            pointerEvents={hasText ? 'auto' : 'none'}
          >
            <Pressable
              onPress={onClear}
              hitSlop={CLEAR_SLOP}
              style={styles.clearBtn}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Animated.View style={clearGlyphStyle}>
                <Icon name="clear" size={15} color={color.ckds.fieldIcon} />
              </Animated.View>
            </Pressable>
            {/* Hairline: makes clear and mic read as two actions, not one cluster. */}
            <View style={styles.trailingDivider} />
          </Animated.View>
          <Pressable
            onPress={onVoice}
            hitSlop={MIC_SLOP}
            style={({ pressed }) => [styles.mic, pressed && styles.micPressed]}
            accessibilityRole="button"
            accessibilityLabel="Voice search"
          >
            <MicGlyph size={22} />
          </Pressable>
        </View>
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
    backgroundColor: color.ckds.searchField,
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
    color: color.ckds.ink,
    paddingVertical: space.s,
    outlineStyle: 'none',
  } as any,
  // Animated placeholder overlay — aligned to the text start, ignores touches.
  phOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center' },
  phClip: { height: 20, overflow: 'hidden', justifyContent: 'center' },
  phText: { fontSize: 14, lineHeight: 20, color: color.ckds.fieldIcon, fontFamily: fontFamily.regular },
  // Trailing cluster: the mic is the fixed right-hand anchor; clear opens to its
  // left. Laid out in flow (not absolutely) so the two can coexist.
  trailingRow: { flexDirection: 'row', alignItems: 'center', height: 36 },
  // overflow hidden: the 26px button is clipped as the slot widens from 0.
  clearSlot: { flexDirection: 'row', alignItems: 'center', height: 36, overflow: 'hidden' },
  clearBtn: { width: 26, height: 36, alignItems: 'center', justifyContent: 'center' },
  trailingDivider: { width: 1, height: 18, marginHorizontal: space.s6, backgroundColor: color.ckds.fieldDivider },
  mic: { width: 26, height: 36, alignItems: 'center', justifyContent: 'center' },
  // Press feedback on the mic — it opens a full-screen sheet, so it needs to
  // acknowledge the touch before the sheet's own transition starts.
  micPressed: { opacity: 0.6, transform: [{ scale: 0.9 }] },
});

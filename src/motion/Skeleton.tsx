import React, { useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useReducedMotion,
  cancelAnimation,
} from 'react-native-reanimated';
import { color, radius, space } from '../theme/tokens';

/**
 * Shimmer skeleton (§9.4 "results reveal / loading"). Skeletons are shaped like
 * real content (card silhouettes). Under reduced motion the shimmer is disabled
 * and a static block is shown (§9.6). Opacity-only animation (GPU-composited).
 */
export function SkeletonBlock({
  width = '100%',
  height = 16,
  radiusToken = radius.sm,
  style,
}: {
  width?: DimensionValue;
  height?: number;
  radiusToken?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const reduced = useReducedMotion();
  const o = useSharedValue(0.5);

  useEffect(() => {
    if (reduced) {
      o.value = 0.6;
      return;
    }
    o.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
    return () => cancelAnimation(o);
  }, [reduced]);

  const animStyle = useAnimatedStyle(() => ({ opacity: o.value }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radiusToken, backgroundColor: color.surfaceAlt },
        animStyle,
        style,
      ]}
    />
  );
}

/** Card-shaped skeleton placeholder for SERP section loading. */
export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <SkeletonBlock width={56} height={56} radiusToken={radius.md} />
        <View style={styles.col}>
          <SkeletonBlock width={'70%'} height={16} />
          <SkeletonBlock width={'45%'} height={14} />
        </View>
      </View>
      <SkeletonBlock width={'90%'} height={12} />
      <SkeletonBlock width={'60%'} height={12} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: space.m,
    gap: space.s,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.border,
    backgroundColor: color.surface,
  },
  row: { flexDirection: 'row', gap: space.s12, alignItems: 'center' },
  col: { flex: 1, gap: space.s },
});

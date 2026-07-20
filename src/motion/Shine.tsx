import React, { useEffect } from 'react';
import { StyleSheet, StyleProp, ViewStyle, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  useReducedMotion,
  Easing,
} from 'react-native-reanimated';
import { color } from '../theme/tokens';

/**
 * One-shot shine sweep across card artwork (§9.5 signature moment). A translucent
 * diagonal band travels across once on entrance. Disabled entirely under reduced
 * motion (§9.6). Transform + opacity only.
 */
export function Shine({
  children,
  delay = 200,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const reduced = useReducedMotion();
  const p = useSharedValue(0);

  useEffect(() => {
    if (reduced) return; // no shine under reduced motion
    p.value = withDelay(delay, withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }));
  }, [reduced]);

  const bandStyle = useAnimatedStyle(() => ({
    opacity: p.value > 0 && p.value < 1 ? 0.35 : 0,
    transform: [{ translateX: -120 + p.value * 320 }, { rotateZ: '18deg' }],
  }));

  return (
    <View style={[styles.wrap, style]}>
      {children}
      {!reduced && <Animated.View pointerEvents="none" style={[styles.band, bandStyle]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
  band: {
    position: 'absolute',
    top: -40,
    bottom: -40,
    width: 60,
    backgroundColor: color.textInverse,
  },
});

import React, { useEffect } from 'react';
import { StyleSheet, StyleProp, ViewStyle, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withRepeat,
  useReducedMotion,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { color } from '../theme/tokens';

/**
 * Shine sweep across card artwork / CTAs (§9.5 signature moment). A soft
 * gradient band travels diagonally across the child — once on entrance by
 * default, or on a gentle loop with `repeat`. `blend` composites it with a
 * natural blend mode (e.g. 'soft-light' on the hero's orange Earn CTA, D070)
 * instead of flat white. Disabled entirely under reduced motion (§9.6).
 * Transform + opacity only; the wrap's `overflow: hidden` clips the band to
 * the child's silhouette — pass the child's radius via `style`.
 *
 * `tint` swaps the band's white for a colour, for a shimmer over a light surface
 * (the hero's white cashback pill, D110): a white band on a white pill is nothing
 * to see, whatever it is blended with.
 */
export function Shine({
  children,
  delay = 200,
  repeat = false,
  period = 3800,
  blend,
  tint,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  /** Loop the sweep every `period` ms instead of playing once. */
  repeat?: boolean;
  period?: number;
  /** Natural compositing for the band (e.g. 'soft-light', 'overlay'). */
  blend?: 'soft-light' | 'overlay' | 'screen';
  /** The band's own colour, for shining over a LIGHT surface. Its ends are drawn at
   *  zero alpha from this same colour, so the sweep has no edge on any ground. */
  tint?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const reduced = useReducedMotion();
  const p = useSharedValue(0);

  useEffect(() => {
    if (reduced) return; // no shine under reduced motion
    const once = withTiming(1, { duration: period, easing: Easing.linear });
    p.value = withDelay(delay, repeat ? withRepeat(once, -1, false) : once);
  }, [reduced, repeat, period, delay]);

  const bandStyle = useAnimatedStyle(() => {
    // The sweep occupies the first SWEEP_FRACTION of each period; the rest is rest.
    const s = Math.min(1, p.value / SWEEP_FRACTION);
    return {
      // Sine envelope: the band breathes in and out of the sweep — no hard pops.
      opacity: s > 0 && s < 1 ? Math.sin(s * Math.PI) * 0.85 : 0,
      transform: [{ translateX: -160 + s * 680 }, { rotateZ: '18deg' }],
    };
  });

  return (
    <View style={[styles.wrap, style]}>
      {children}
      {!reduced && (
        <Animated.View pointerEvents="none" style={[styles.band, blend ? ({ mixBlendMode: blend } as any) : null, bandStyle]}>
          <LinearGradient
            colors={tint ? [transparent(tint), tint, transparent(tint)] : [color.ckds.aiSheen0, color.textInverse, color.ckds.aiSheen0]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}
    </View>
  );
}

/** Share of each period the band spends crossing (the rest is dwell). */
const SWEEP_FRACTION = 0.32;

/**
 * The band's end stops: the tint at zero alpha, so the sweep fades out on its own
 * colour rather than on white (the `ckBorder0` rule — a fade ends on its own colour).
 * `rgba()` and `#rrggbb` are the two forms tokens are written in.
 */
function transparent(c: string): string {
  const rgba = c.match(/^rgba?\(([^)]+)\)$/);
  if (rgba) {
    const [r, g, b] = rgba[1].split(',');
    return `rgba(${r},${g},${b},0)`;
  }
  const hex = c.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},0)`;
  }
  return 'rgba(255,255,255,0)';
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
  band: {
    position: 'absolute',
    top: -40,
    bottom: -40,
    width: 80,
  },
});

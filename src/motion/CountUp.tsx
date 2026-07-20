import React, { useEffect, useState } from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  useReducedMotion,
  Easing,
} from 'react-native-reanimated';
import { TextInput } from 'react-native';
import { duration } from '../theme/tokens';
import { useInView } from './useInView';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

/**
 * Hero cashback count-up (§9.5 signature moment). Animates 0 → value over ~700ms.
 * Under reduced motion we show the final value immediately (no animation) — the
 * accessibility non-negotiable from §9.6. Drives an editable-disabled TextInput
 * so the number updates on the UI thread without per-frame React renders.
 */
export function CountUp({
  value,
  prefix = '',
  suffix = '',
  format = (n: number) => Math.round(n).toLocaleString('en-IN'),
  style,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  format?: (n: number) => string;
  style?: StyleProp<TextStyle>;
}) {
  const reduced = useReducedMotion();
  const { ref, tick } = useInView(); // replay the count-up each time it scrolls into view
  const progress = useSharedValue(reduced ? value : 0);

  useEffect(() => {
    if (reduced) {
      progress.value = value;
      return;
    }
    if (tick === 0) return; // hold at 0 until the figure is actually on screen
    progress.value = 0;
    progress.value = withTiming(value, { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [value, reduced, tick]);

  const animatedProps = useAnimatedProps(() => {
    return { text: `${prefix}${format(progress.value)}${suffix}`, defaultValue: `${prefix}${format(progress.value)}${suffix}` } as any;
  });

  return (
    <AnimatedTextInput
      ref={ref as any}
      editable={false}
      underlineColorAndroid="transparent"
      style={style as any}
      animatedProps={animatedProps}
      accessibilityLabel={`${prefix}${format(value)}${suffix}`}
    />
  );
}

/**
 * Text-based count-up for small inline figures (e.g. the Jump-back-in tiles),
 * where the TextInput-based CountUp would reserve width and wrap. Renders a plain
 * <Text> and rolls 0 → value whenever `trigger` changes (e.g. on search-bar tap)
 * or when it scrolls into view. Reduced motion shows the final value at once.
 */
export function CountUpText({
  value,
  prefix = '',
  suffix = '',
  format = (n: number) => `${Math.round(n)}`,
  style,
  trigger = 0,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  format?: (n: number) => string;
  style?: StyleProp<TextStyle>;
  trigger?: number;
}) {
  const reduced = useReducedMotion();
  const { ref, tick } = useInView();
  const [display, setDisplay] = useState(reduced ? value : 0);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    if (tick === 0 && trigger === 0) return; // wait for first appearance / trigger
    let raf = 0;
    let start: number | null = null;
    const step = (now: number) => {
      if (start == null) start = now;
      const p = Math.min(1, (now - start) / 700);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setDisplay(value * eased);
      if (p < 1) raf = requestAnimationFrame(step);
      else setDisplay(value);
    };
    setDisplay(0);
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, reduced, trigger, tick]);

  return (
    <Text ref={ref as any} style={style} accessibilityLabel={`${prefix}${format(value)}${suffix}`}>
      {`${prefix}${format(display)}${suffix}`}
    </Text>
  );
}

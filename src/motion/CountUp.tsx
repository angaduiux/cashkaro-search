import React, { useEffect, useState } from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useInView } from './useInView';

/**
 * Indian digit grouping (1,50,000) — hand-rolled so the formatter has zero
 * platform dependencies (Intl is missing on some RN runtimes).
 */
function groupIN(n: number): string {
  const s = String(Math.round(n));
  if (s.length <= 3) return s;
  const last3 = s.slice(-3);
  let rest = s.slice(0, -3);
  const parts: string[] = [];
  while (rest.length > 2) {
    parts.unshift(rest.slice(-2));
    rest = rest.slice(0, -2);
  }
  if (rest.length) parts.unshift(rest);
  return `${parts.join(',')},${last3}`;
}

function fmt(n: number, decimals: number, group: boolean): string {
  if (decimals > 0) {
    const [int, frac] = n.toFixed(decimals).split('.');
    return `${group ? groupIN(Number(int)) : int}.${frac}`;
  }
  return group ? groupIN(n) : String(Math.round(n));
}

/**
 * Hero cashback count-up (§9.5 signature moment). Animates 0 → value over ~700ms.
 * Under reduced motion we show the final value immediately (no animation) — the
 * accessibility non-negotiable from §9.6.
 *
 * Rolls on every `useInView` tick — the first fires as soon as the mounted
 * figure is on screen (immediately on native; first IO callback on web), later
 * ones replay it on scroll re-entry. It used to drive a TextInput through
 * Reanimated `animatedProps.text` — on the new RN architecture / RN-web those
 * per-frame text updates are silently dropped, so the figure never rolled on
 * page load (D068). A plain rAF-driven <Text> re-render is deterministic
 * everywhere; one figure at 60fps for 700ms is negligible.
 */
export function CountUp({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  group = false,
  style,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  group?: boolean;
  style?: StyleProp<TextStyle>;
}) {
  const reduced = useReducedMotion();
  const { ref, tick } = useInView(); // replay the count-up each time it scrolls into view
  const [display, setDisplay] = useState(reduced ? value : 0);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    if (tick === 0) return; // hold at 0 until the figure is actually on screen
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
  }, [value, reduced, tick]);

  return (
    <Text ref={ref as any} style={style} accessibilityLabel={`${prefix}${fmt(value, decimals, group)}${suffix}`}>
      {`${prefix}${fmt(display, decimals, group)}${suffix}`}
    </Text>
  );
}

/**
 * Text-based count-up for small inline figures (e.g. the Jump-back-in tiles),
 * where the sizer-overlay CountUp above would reserve width and wrap. Rolls
 * 0 → value whenever `trigger` changes (e.g. on search-bar tap) or when it
 * scrolls into view. Reduced motion shows the final value at once.
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

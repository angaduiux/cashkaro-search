import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  Easing,
  useReducedMotion,
  cancelAnimation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { color, type as t, space, radius } from '../theme/tokens';
import { Icon } from '../icons/Icon';
import { Divider } from './atoms';
import { ProductCard } from './ResultCards';
import { ResultItem } from '../data/dataContract';

/**
 * End-of-catalogue AI Expand card — exact W4 style (Figma 1646:7445): a
 * white→lavender gradient card with a living purple "shader" wash, a gradient
 * sparkle mark, and a blue→violet gradient CTA with a looping shine sweep.
 * On tap: brief searching state → streams web results one at a time (§9.4).
 * All motion honours reduced-motion.
 */
export function ExpandSearchCard({ webResults = [] }: { webResults?: ResultItem[] }) {
  const [phase, setPhase] = useState<'idle' | 'searching' | 'results'>('idle');
  const [shown, setShown] = useState(0);
  const reduced = useReducedMotion();

  // Living purple wash: two blobs drift + a slow rotation (shader-ish).
  const drift = useSharedValue(0);
  const pulse = useSharedValue(0);
  const shine = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    drift.value = withRepeat(withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.sin) }), -1, true);
    pulse.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }), -1, true);
    shine.value = withRepeat(withSequence(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.ease) }), withTiming(1, { duration: 900 })), -1, false);
    return () => {
      cancelAnimation(drift);
      cancelAnimation(pulse);
      cancelAnimation(shine);
    };
  }, [reduced]);

  const blobA = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(drift.value, [0, 1], [-30, 40]) },
      { translateY: interpolate(drift.value, [0, 1], [-10, 20]) },
      { scale: interpolate(pulse.value, [0, 1], [1, 1.15]) },
    ],
  }));
  const blobB = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(drift.value, [0, 1], [50, -30]) },
      { translateY: interpolate(drift.value, [0, 1], [10, -14]) },
      { scale: interpolate(pulse.value, [0, 1], [1.1, 0.95]) },
    ],
  }));
  const iconGlow = useAnimatedStyle(() => ({ opacity: interpolate(pulse.value, [0, 1], [0.5, 1]) }));
  const shineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shine.value, [0, 1], [-260, 340]) }, { rotateZ: '18deg' }],
    opacity: shine.value > 0 && shine.value < 1 ? 0.5 : 0,
  }));

  useEffect(() => {
    if (phase !== 'searching') return;
    const to = setTimeout(() => setPhase('results'), 1000);
    return () => clearTimeout(to);
  }, [phase]);
  useEffect(() => {
    if (phase !== 'results' || shown >= webResults.length) return;
    const to = setTimeout(() => setShown((n) => n + 1), 260);
    return () => clearTimeout(to);
  }, [phase, shown, webResults.length]);

  return (
    <View>
      <Divider style={{ marginVertical: space.m }} />
      <View style={styles.card}>
        <LinearGradient colors={[color.surface, color.aura.aiCardTo]} style={StyleSheet.absoluteFill} />
        {/* living purple shader wash — soft blurred glows (Figma 1646:7445) */}
        {!reduced && (
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, WEB_BLUR]}>
            <Animated.View style={[styles.blob, blobA]}>
              <LinearGradient colors={[color.aura.aiWash1, 'transparent']} start={{ x: 0.2, y: 0.2 }} end={{ x: 1, y: 1 }} style={styles.blobFill} />
            </Animated.View>
            <Animated.View style={[styles.blob, styles.blobRight, blobB]}>
              <LinearGradient colors={[color.aura.aiWash2, 'transparent']} start={{ x: 0.8, y: 0.2 }} end={{ x: 0, y: 1 }} style={styles.blobFill} />
            </Animated.View>
          </View>
        )}

        <View style={styles.headRow}>
          <View style={styles.aiMark}>
            <LinearGradient colors={[color.aura.aiFrom, color.aura.aiTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            <Animated.View style={[StyleSheet.absoluteFill, styles.aiGlow, iconGlow]} />
            <Text style={styles.sparkleGlyph}>✦</Text>
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={[styles.title, { color: color.aura.ink }]}>Didn’t find what you’re looking for?</Text>
            <Text style={[styles.body, { color: color.aura.slate }]}>
              We can search the whole web and find matching products.
            </Text>
          </View>
        </View>

        {phase === 'idle' && (
          <Pressable onPress={() => setPhase('searching')} accessibilityRole="button" accessibilityLabel="Expand Search with AI" style={styles.cta}>
            <LinearGradient colors={[color.aura.aiFrom, color.aura.aiTo, color.aura.aiWash1]} locations={[0, 0.6, 1]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
            {!reduced && <Animated.View pointerEvents="none" style={[styles.ctaShine, shineStyle]} />}
            <Icon name="aiSearch" size={14} color={color.textInverse} />
            <Text style={[t.body14SemiBold, { color: color.textInverse }]}>  Expand Search with AI</Text>
          </Pressable>
        )}

        {phase === 'searching' && (
          <Animated.View entering={FadeIn} style={styles.searchingRow}>
            <Icon name="sparkle" size={16} color={color.aura.aiTo} />
            <Text style={[t.body14Regular, { color: color.aura.slate }]}> Searching the web…</Text>
          </Animated.View>
        )}

        {phase === 'results' && (
          <View style={styles.stream}>
            {webResults.slice(0, shown).map((r) => (
              <Animated.View key={r.id} entering={FadeInDown.duration(240)}>
                <View style={styles.webItem}>
                  <ProductCard item={r} />
                  <View style={styles.webTag}>
                    <Icon name="globe" size={11} color={color.aura.slateMuted} />
                    <Text style={[t.caption10SemiBold, { color: color.aura.slateMuted }]}> FOUND ON THE WEB</Text>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

// Real gaussian blur for the wash on web (RN has no filter); native keeps the
// soft gradient falloff as-is.
const WEB_BLUR = (Platform.OS === 'web' ? ({ filter: 'blur(34px)' } as any) : null);

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: space.m,
    paddingBottom: space.xl,
    gap: space.s14,
    overflow: 'hidden',
    // W4 elevation: 0 3.6 20 rgba(18,23,38,.1) + top glow
    shadowColor: '#000f66',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 3.6 },
    elevation: 6,
  },
  blob: { position: 'absolute', top: -40, left: -30, width: 220, height: 220, opacity: 0.38 },
  blobRight: { left: undefined, right: -30 } as any,
  blobFill: { flex: 1, borderRadius: 200 },
  headRow: { flexDirection: 'row', gap: space.s12, alignItems: 'center' },
  sparkleGlyph: { color: '#ffffff', fontSize: 22, lineHeight: 24, fontWeight: '700', textAlign: 'center' },
  aiMark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#261a99',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  aiGlow: { backgroundColor: '#ffffff', opacity: 0.06 },
  title: { ...t.body16SemiBold, letterSpacing: -0.1 },
  body: { ...t.body12Regular, lineHeight: 17 },
  cta: {
    height: 48,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#261a99',
    shadowOpacity: 0.28,
    shadowRadius: 11,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  ctaShine: { position: 'absolute', top: -20, bottom: -20, width: 60, backgroundColor: '#ffffff' },
  searchingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.s },
  stream: { flexDirection: 'row', flexWrap: 'wrap', gap: space.m },
  webItem: { gap: space.xs },
  webTag: { flexDirection: 'row', alignItems: 'center' },
});

/**
 * End-of-catalogue AI Expand band — W4 style (Figma 1646:7445), rebuilt on the
 * Aura engine (`motion/Aura.tsx`): a full-bleed lavender band lit from behind by
 * five soft drifting orbs, a blue-green-purple glass sparkle mark (`icons/AiMark`)
 * with an orbiting highlight, and a CTA whose cobalt→indigo→violet→orchid→magenta→
 * aqua ramp flows with no seam.
 *
 * A band rather than a card because the result set is unbounded (D031): copy and
 * CTA sit on the 20px page column, web results stream into a full-bleed rail whose
 * last card scrolls off the true screen edge. It is the last section on the page,
 * so its field runs off the bottom of the screen rather than closing with a line
 * (D034) — SerpShell drops its trailing spacer when this band is present.
 *
 * The band opens with `sheetEnd`: the white bottom edge of the local results, 32px
 * corners, laid over the top of the aura. The web search then reads as the same
 * canvas expanding out from underneath the local results instead of a second block
 * stacked below them (D050).
 *
 * One display-linked clock drives every layer on the UI thread, so the band
 * keeps flowing at 120 Hz while the results above it scroll. Tapping the CTA
 * does not swap it out: the label crossfades in place, the whole surface's
 * motion quickens while it thinks (~2× rate), then settles as web results
 * stream in one at a time (§9.4). Under reduced motion the clock never starts
 * and every layer renders a composed still frame (§9.6).
 */
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, AccessibilityInfo } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import {
  color,
  type as t,
  space,
  radius,
  elevation,
  spring,
  duration,
  AI_MARK_SIZE,
  AI_CTA_HEIGHT,
} from '../theme/tokens';
import { Icon } from '../icons/Icon';
import { AiMark } from '../icons/AiMark';
import { ProductCard } from './ResultCards';
import { ResultItem } from '../data/dataContract';
import { AuraClock, AuraField, AURA_LOOP, FlowStrip, Orbit, radialFill, Sweep, useAuraClock } from '../motion/Aura';
import { EASE } from '../motion/motion';

type Phase = 'idle' | 'searching' | 'results';

/** The "thinking" beat before results start landing. */
const THINK_MS = 1150;
/** Gap between streamed web results (§9.4 — one at a time, never a batch). */
const STREAM_MS = 220;
/** Clock rate while searching: the surface visibly quickens, then settles. */
const THINK_RATE = 2.2;
/** Press depth — matches the DS card/button press (§9.4). */
const PRESS_SCALE = 0.03;
/**
 * How far the white local-results sheet reaches down into the band before it ends.
 * Taller than the 32px corner radius on purpose: at exactly 32 the two arcs meet in
 * the middle and the edge reads as a lozenge, not as the bottom of a sheet.
 */
const SHEET_END_H = space.xxl;

/** Soft platter behind the mark — cobalt core fading to nothing (matches the
 *  blue glass body; a violet platter under a blue mark read as a second object). */
const MARK_GLOW = radialFill([
  [color.aura.aiGlowBlueCore, '0%'],
  [color.aura.aiGlowBlueMid, '42%'],
  [color.aura.aiGlowBlue0, '78%'],
  [color.aura.aiGlowBlue0, '100%'],
]);

export function ExpandSearchCard({ webResults = [] }: { webResults?: ResultItem[] }) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [shown, setShown] = useState(0);
  const [ctaW, setCtaW] = useState(0);
  const reduced = useReducedMotion();

  const clock = useAuraClock();
  const gain = useSharedValue(1); // aura brightness
  const press = useSharedValue(0); // 0 → 1 while a finger is down

  // Phase retimes the whole surface. Nothing is keyframed to a fixed duration,
  // so `rate` can be animated mid-flight and no layer jumps.
  useEffect(() => {
    const searching = phase === 'searching';
    clock.rate.value = withTiming(searching ? THINK_RATE : 1, { duration: duration.slow, easing: EASE.standard });
    gain.value = withTiming(searching ? 1.22 : phase === 'results' ? 0.7 : 1, {
      duration: duration.slow,
      easing: EASE.standard,
    });
  }, [phase]);

  // Timed phases: think → stream.
  useEffect(() => {
    if (phase !== 'searching') return;
    const to = setTimeout(() => setPhase('results'), reduced ? 0 : THINK_MS);
    return () => clearTimeout(to);
  }, [phase, reduced]);
  useEffect(() => {
    if (phase !== 'results' || shown >= webResults.length) return;
    const to = setTimeout(() => setShown((n) => n + 1), reduced ? 0 : STREAM_MS);
    return () => clearTimeout(to);
  }, [phase, shown, webResults.length, reduced]);

  // VoiceOver: a purely visual state change is no state change at all.
  useEffect(() => {
    if (phase === 'searching') AccessibilityInfo.announceForAccessibility('Searching the whole web');
    if (phase === 'results') {
      AccessibilityInfo.announceForAccessibility(
        webResults.length
          ? `${webResults.length} matching products found on the web`
          : 'No matching products on the web',
      );
    }
  }, [phase]);

  const liftStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 - PRESS_SCALE * press.value }] }));
  const veilStyle = useAnimatedStyle(() => ({ opacity: press.value }));

  const busy = phase === 'searching';

  return (
    <Animated.View
      entering={reduced ? undefined : FadeInDown.duration(duration.moderate)}
      layout={reduced ? undefined : LinearTransition.duration(duration.moderate)}
      style={styles.band}
    >
      {/* Full-bleed band, not a card: the aura runs to both screen edges and the
          result rail can carry any number of products off the right edge. Only
          the copy + CTA are re-inset to the page column (AGENTS.md full-bleed
          rule — cancel the 20px page padding, re-add it inside). */}
      <AuraField clock={clock} gain={gain} />

      {/* Where the local results END. A white sheet edge with 32px bottom corners,
          laid over the top of the aura: the field then reads as ONE canvas
          expanding out from underneath the results, rather than a second block
          stacked below them. Drawn here rather than as a wrapper around the
          sections above because the aura has to be the thing behind the curve —
          rounding the content above would only cut a white corner out of white. */}
      <View style={styles.sheetEnd} pointerEvents="none" />

      <View style={styles.pitch}>
        <View style={styles.head}>
          {/* Vector glass mark on a soft glow platter (not a hard gradient tile —
              the platter lets the aura read through). Sky→mint→violet body under
              white specular layers; see icons/AiMark.tsx. */}
          <View style={styles.mark}>
            <View style={[StyleSheet.absoluteFill, MARK_GLOW]} pointerEvents="none" />
            {!reduced && <Orbit clock={clock} size={AI_MARK_SIZE} />}
            <AiMark size={AI_MARK_SIZE} />
          </View>
          {/* Title + pitch share one column beside the mark. The pitch breaks at a
              chosen point rather than wherever the column width happens to run out,
              so it is two balanced lines on every screen size (a 500px-wide preview
              would otherwise fit it on one). */}
          <View style={styles.headText}>
            <Text style={styles.title}>Didn’t find what you’re looking for?</Text>
            <Text style={styles.body} numberOfLines={2}>
              We can search the whole web{'\n'}and find matching products.
            </Text>
          </View>
        </View>

        {phase !== 'results' && (
          <Animated.View
            style={[styles.ctaShadow, liftStyle]}
            exiting={reduced ? undefined : FadeOut.duration(duration.fast)}
          >
            <Pressable
              disabled={busy}
              onPress={() => setPhase('searching')}
              onPressIn={() => (press.value = withSpring(1, spring.snappy))}
              onPressOut={() => (press.value = withSpring(0, spring.snappy))}
              onLayout={(e) => setCtaW(Math.round(e.nativeEvent.layout.width))}
              style={styles.ctaClip}
              accessibilityRole="button"
              accessibilityLabel="Expand search with AI"
              accessibilityHint="Searches the whole web for matching products"
              accessibilityState={{ disabled: busy, busy }}
            >
              {/* Base ramp — also the still frame under reduced motion. */}
              <LinearGradient
                colors={[color.aura.aiFrom, color.aura.aiVia, color.aura.aiTo, color.aura.aiWash1]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFill}
              />
              {ctaW > 0 && !reduced && <FlowStrip clock={clock} width={ctaW} harmonic={2} />}
              {/* Glass: gloss down from the top edge, shade at the bottom. */}
              <LinearGradient
                colors={[color.aura.aiGloss, color.aura.aiGlossMid, color.aura.aiInnerShade]}
                locations={[0, 0.55, 1]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.topLight} />
              {ctaW > 0 && !reduced && <Sweep clock={clock} width={ctaW} harmonic={2} />}
              <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.pressVeil, veilStyle]} />

              {/* Labels stack absolutely, so the crossfade can never shift layout. */}
              {busy ? (
                <Animated.View key="busy" entering={FadeIn.duration(duration.fast)} style={styles.ctaRow}>
                  <Icon name="globe" size={15} color={color.textInverse} />
                  <Text style={styles.ctaLabel}>Searching the whole web</Text>
                  <Dots clock={clock} reduced={reduced} />
                </Animated.View>
              ) : (
                <Animated.View
                  key="idle"
                  entering={FadeIn.duration(duration.fast)}
                  exiting={reduced ? undefined : FadeOut.duration(duration.instant)}
                  style={styles.ctaRow}
                >
                  <Icon name="aiSearch" size={15} color={color.textInverse} />
                  <Text style={styles.ctaLabel}>Expand Search with AI</Text>
                </Animated.View>
              )}
            </Pressable>
          </Animated.View>
        )}
      </View>

      {phase === 'results' && (
        <Animated.View entering={reduced ? undefined : FadeIn.duration(duration.base)} style={styles.results}>
          <View style={styles.provenance}>
            <View style={styles.webChip}>
              <Icon name="globe" size={10} color={color.aura.slateMuted} />
              <Text style={styles.webChipLabel}>FROM ACROSS THE WEB</Text>
            </View>
            {webResults.length > 0 && (
              <Text style={styles.matchCount}>
                {webResults.length} {webResults.length === 1 ? 'match' : 'matches'}
              </Text>
            )}
          </View>

          {webResults.length === 0 ? (
            <Text style={styles.empty}>No matching products turned up on the web this time.</Text>
          ) : (
            // Full-bleed rail: any number of results, the last one scrolling off
            // the true screen edge instead of being cut at a 20px inset.
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rail}
              // Streaming means the content grows while it is on screen; keep the
              // first card pinned left rather than letting the frame jump.
              contentOffset={{ x: 0, y: 0 }}
            >
              {webResults.slice(0, shown).map((r, i) => (
                <ProductCard key={r.id} item={r} index={i} />
              ))}
            </ScrollView>
          )}
        </Animated.View>
      )}
    </Animated.View>
  );
}

/** Three dots breathing in sequence off the master clock — the "thinking" tell. */
function Dots({ clock, reduced }: { clock: AuraClock; reduced: boolean }) {
  return (
    <View style={styles.dots}>
      {[0, 1, 2].map((i) => (
        <Dot key={i} clock={clock} index={i} reduced={reduced} />
      ))}
    </View>
  );
}

function Dot({ clock, index, reduced }: { clock: AuraClock; index: number; reduced: boolean }) {
  const anim = useAnimatedStyle(() => {
    const u = clock.t.value / AURA_LOOP;
    // 6 pulses per master loop, ×THINK_RATE while searching ≈ 1.8s each.
    const w = 0.5 + 0.5 * Math.sin(Math.PI * 2 * (6 * u - index / 3));
    return { opacity: 0.34 + 0.66 * w, transform: [{ scale: 0.8 + 0.2 * w }] };
  });
  return <Animated.View style={[styles.dot, reduced ? styles.dotStill : anim]} />;
}

const styles = StyleSheet.create({
  // Full-bleed band. Cancels the page column's 20px padding so the aura and the
  // result rail reach both screen edges; hairlines top and bottom stand in for
  // the card's border, and the section above no longer needs a Divider.
  band: {
    marginTop: space.xxl, // 16 + 24px extra breathing room above the web-search band
    marginHorizontal: -space.m20,
    backgroundColor: color.surface,
    // No hairline at either end. The top edge is the `sheetEnd` curve below — a
    // straight 1px line across it would read as a stray divider on the white
    // sheet — and the bottom is where the field runs off the screen instead of
    // closing with a line (this is the last section on the page). The extra 40
    // below the content is what keeps it running past the home indicator.
    overflow: 'hidden', // clips the drifting orbs + the sheet edge to the band
    paddingBottom: space.m + space.xxl,
  },
  /**
   * The white bottom edge of the local-results sheet, sitting on top of the aura.
   * Full-bleed with the band, so its 32px corners land at the true screen edges.
   */
  sheetEnd: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: SHEET_END_H,
    backgroundColor: color.surface,
    borderBottomLeftRadius: radius.xxl, // 32
    borderBottomRightRadius: radius.xxl,
    ...elevation.soft, // the sheet floats a little above the canvas it uncovers
  },
  /** The copy + CTA sit back on the page column, clear of the sheet edge above. */
  pitch: { paddingHorizontal: space.m20, paddingTop: SHEET_END_H + space.s12 },

  head: { flexDirection: 'row', alignItems: 'center', gap: space.s12 },
  mark: {
    width: AI_MARK_SIZE,
    height: AI_MARK_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** The text column beside the mark — title over a two-line pitch. */
  headText: { flex: 1 },
  /** 1px light along the top edge — how an iOS control catches ambient light. */
  topLight: { position: 'absolute', left: 0, right: 0, top: 0, height: 1, backgroundColor: color.aura.aiHairline },

  title: { ...t.body16SemiBold, color: color.aura.ink },
  body: { ...t.body14Regular, color: color.aura.slate, marginTop: space.xs },
  empty: { ...t.body14Regular, color: color.aura.slate, paddingHorizontal: space.m20 },

  ctaShadow: {
    marginTop: space.m,
    borderRadius: radius.xl,
    backgroundColor: color.aura.aiTo,
    shadowColor: color.aura.aiShadow,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  ctaClip: {
    height: AI_CTA_HEIGHT,
    borderRadius: radius.xl,
    borderCurve: 'continuous',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  ctaRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.s,
  },
  ctaLabel: { ...t.body15SemiBold, color: color.textInverse },
  pressVeil: { backgroundColor: color.aura.aiPress },

  dots: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  dot: { width: space.xs, height: space.xs, borderRadius: space.xxs, backgroundColor: color.textInverse },
  dotStill: { opacity: 0.6 },

  results: { marginTop: space.m, gap: space.s },
  provenance: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.m20, // back on the page column; the rail below is not
  },
  /** Re-inset on BOTH sides so card 1 aligns with the page and card N scrolls to the edge. */
  rail: { gap: space.s12, paddingHorizontal: space.m20, paddingVertical: space.xs },
  webChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s6,
    paddingHorizontal: space.s,
    paddingVertical: space.xs,
    borderRadius: radius.full,
    backgroundColor: color.aura.aiChip,
    borderWidth: 1,
    borderColor: color.aura.aiEdge,
  },
  webChipLabel: { ...t.caption8SemiBoldCaps, color: color.aura.slateMuted },
  matchCount: { ...t.body12Medium, color: color.aura.slateMuted },
});

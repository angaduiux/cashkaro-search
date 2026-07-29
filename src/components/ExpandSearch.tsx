/**
 * End-of-catalogue AI Expand band — W4 style (Figma 1646:7445), rebuilt on the
 * Aura engine (`motion/Aura.tsx`): a full-bleed lavender band lit from behind by
 * five soft drifting orbs, a blue-green-purple glass sparkle mark (`icons/AiMark`)
 * with an orbiting highlight, and a CTA whose cobalt→indigo→violet→orchid→magenta→
 * aqua ramp flows with no seam.
 *
 * A band rather than a card because the result set is unbounded (D031). The band
 * opens with `sheetEnd`: the white bottom edge of the local results, 32px corners,
 * laid over the top of the aura — the web search reads as the same canvas
 * expanding out from underneath the local results (D050). It is the last section
 * on the page, so its field runs off the bottom of the screen (D034).
 *
 * Tapping the CTA crossfades its label in place and quickens the whole surface
 * (~2× rate) while it thinks; then the ENTIRE pitch (mark, question, CTA)
 * collapses into one minimal heading — "From across the web" with a live count —
 * and results stream one at a time into a vertical two-column grid of floating
 * white cards (D063). The feed (`data/webResults.ts`) wraps the real catalog, so
 * the grid is never empty and keeps growing: SerpShell pulses `registerLoadMore`
 * when the page nears its end, a shimmering skeleton pair marks the frontier
 * where the next cards will land, and the count ticks up as they do. Cards may
 * or may not carry a cashback pill (unmapped merchants don't — Q-010). Under
 * reduced motion the clock never starts and results land instantly (§9.6).
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, AccessibilityInfo } from 'react-native';
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
import { webFeed } from '../data/webResults';
import { SkeletonBlock } from '../motion/Skeleton';
import { AuraClock, AuraField, AURA_LOOP, FlowStrip, Orbit, radialFill, Sweep, useAuraClock } from '../motion/Aura';
import { EASE } from '../motion/motion';

type Phase = 'idle' | 'searching' | 'results';

/** The "thinking" beat before results start landing. */
const THINK_MS = 1150;
/** Gap between streamed web results (§9.4 — one at a time, never a batch). */
const STREAM_MS = 220;
/** Stream cadence for load-more batches — quicker, the reveal already happened. */
const STREAM_MORE_MS = 130;
/** First reveal fills four grid rows; each scroll-triggered batch adds three. */
const INITIAL_COUNT = 8;
const BATCH_COUNT = 6;
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
/**
 * Clearance from the sheet's curved edge down to the band's first line of text —
 * 12 to breathe, plus 32 of real separation. At 12 alone the copy sat tight under
 * the curve and read as the last line of the sheet above it rather than the first
 * line of the AI surface below. The same value in both states, so the heading
 * doesn't shift against that edge when the pitch settles into results.
 */
const SHEET_CLEAR = space.s12 + space.xl;
/** The results heading's compact mark — the 64px pitch mark, settled. */
const HEADING_MARK = 20;

/** Soft platter behind the mark — cobalt core fading to nothing (matches the
 *  blue glass body; a violet platter under a blue mark read as a second object). */
const MARK_GLOW = radialFill([
  [color.aura.aiGlowBlueCore, '0%'],
  [color.aura.aiGlowBlueMid, '42%'],
  [color.aura.aiGlowBlue0, '78%'],
  [color.aura.aiGlowBlue0, '100%'],
]);

export function ExpandSearchCard({
  webResults = [],
  query = '',
  registerLoadMore,
}: {
  /** Curated seed results (e.g. the transcribed whey case) — lead the feed. */
  webResults?: ResultItem[];
  /** The committed query — seeds the generated feed's ordering. */
  query?: string;
  /** SerpShell calls the registered fn when the page scrolls near its end; the
   *  band answers by extending the grid. Registered only while in results. */
  registerLoadMore?: (fn: (() => void) | null) => void;
}) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [target, setTarget] = useState(0); // how many results the grid is growing toward
  const [shown, setShown] = useState(0); // how many have actually landed
  const [ctaW, setCtaW] = useState(0);
  const [gridW, setGridW] = useState(0);
  const reduced = useReducedMotion();

  const clock = useAuraClock();
  const gain = useSharedValue(1); // aura brightness
  const press = useSharedValue(0); // 0 → 1 while a finger is down

  // The endless feed continues the curated seed instead of repeating it.
  const feed = useMemo(() => webFeed(query, webResults), [query, webResults]);
  const items = useMemo(() => {
    const out = webResults.slice(0, target);
    for (let i = out.length; i < target; i++) out.push(feed(i - webResults.length));
    return out;
  }, [webResults, feed, target]);

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

  // Timed phases: think → stream. Results open with the first grid fill.
  useEffect(() => {
    if (phase !== 'searching') return;
    const to = setTimeout(() => {
      setTarget(INITIAL_COUNT);
      setPhase('results');
    }, reduced ? 0 : THINK_MS);
    return () => clearTimeout(to);
  }, [phase, reduced]);
  useEffect(() => {
    if (phase !== 'results' || shown >= target) return;
    const cadence = shown < INITIAL_COUNT ? STREAM_MS : STREAM_MORE_MS;
    const to = setTimeout(() => setShown((n) => n + 1), reduced ? 0 : cadence);
    return () => clearTimeout(to);
  }, [phase, shown, target, reduced]);

  // Infinite growth: while in results, hand SerpShell a load-more. Extends only
  // once the previous batch has fully landed, so scroll pulses self-throttle.
  const shownRef = useRef(0);
  shownRef.current = shown;
  useEffect(() => {
    if (!registerLoadMore) return;
    registerLoadMore(
      phase === 'results' ? () => setTarget((n) => (shownRef.current >= n ? n + BATCH_COUNT : n)) : null,
    );
    return () => registerLoadMore(null);
  }, [phase, registerLoadMore]);

  // VoiceOver: a purely visual state change is no state change at all.
  useEffect(() => {
    if (phase === 'searching') AccessibilityInfo.announceForAccessibility('Searching the whole web');
    if (phase === 'results') {
      AccessibilityInfo.announceForAccessibility(
        'Matching products found across the web. The list keeps growing as you scroll.',
      );
    }
  }, [phase]);

  const liftStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 - PRESS_SCALE * press.value }] }));
  const veilStyle = useAnimatedStyle(() => ({ opacity: press.value }));

  const busy = phase === 'searching';
  // Grid cell: two columns split one 12px gutter; the card fits inside the cell's padding.
  const cellW = gridW > 0 ? Math.floor((gridW - space.s12) / 2) : 0;
  const cardW = cellW - space.s12 * 2;
  // The shimmer frontier: up to two skeleton cells where the next cards will land.
  const pending = phase === 'results' && !reduced ? Math.min(2, target - shown) : 0;

  // TWO INDEPENDENT COLUMNS, not a wrapping row: in a wrapping row every cell
  // stretches to the tallest in its row, so a card with no cashback pill (or a
  // one-line title) carried dead white space to match its neighbour. Alternating
  // by index keeps the streaming order readable left → right while letting each
  // card be exactly as tall as its own content (D064).
  const columns: ResultItem[][] = [[], []];
  items.slice(0, shown).forEach((r, i) => columns[i % 2].push(r));
  // Skeletons continue that alternation, so the shimmer sits where the next card lands.
  const pendingPerCol = [0, 1].map((c) =>
    Array.from({ length: pending }, (_, i) => (shown + i) % 2).filter((x) => x === c).length,
  );

  return (
    <Animated.View
      entering={reduced ? undefined : FadeInDown.duration(duration.moderate)}
      layout={reduced ? undefined : LinearTransition.duration(duration.moderate)}
      style={styles.band}
    >
      {/* Full-bleed band, not a card: the aura runs to both screen edges and the
          result grid can grow to any length inside it. Only the copy + grid are
          re-inset to the page column (AGENTS.md full-bleed rule — cancel the
          20px page padding, re-add it inside). */}
      <AuraField clock={clock} gain={gain} />

      {/* Where the local results END. A white sheet edge with 32px bottom corners,
          laid over the top of the aura: the field then reads as ONE canvas
          expanding out from underneath the results, rather than a second block
          stacked below them. Drawn here rather than as a wrapper around the
          sections above because the aura has to be the thing behind the curve —
          rounding the content above would only cut a white corner out of white. */}
      <View style={styles.sheetEnd} pointerEvents="none" />

      {phase !== 'results' && (
        <Animated.View exiting={reduced ? undefined : FadeOut.duration(duration.fast)} style={styles.pitch}>
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

          <Animated.View style={[styles.ctaShadow, liftStyle]}>
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
        </Animated.View>
      )}

      {phase === 'results' && (
        <Animated.View entering={reduced ? undefined : FadeIn.duration(duration.base)} style={styles.results}>
          {/* The whole pitch settles into ONE minimal heading: compact mark,
              provenance, and a count that ticks up as the grid grows. */}
          <View style={styles.headingRow}>
            <AiMark size={HEADING_MARK} />
            <Text style={styles.heading}>From across the web</Text>
            {shown > 0 && (
              <Animated.Text
                key={`n-${shown}`}
                entering={reduced ? undefined : FadeIn.duration(duration.fast)}
                style={styles.headingCount}
              >
                {shown}
              </Animated.Text>
            )}
          </View>

          {/* Vertical two-column grid of floating white cards over the aura.
              Cards stream in one at a time; the page's own scroll (SerpShell)
              extends `target`, so the grid keeps getting longer on scroll. */}
          <View style={styles.grid} onLayout={(e) => setGridW(Math.round(e.nativeEvent.layout.width))}>
            {[0, 1].map((c) => (
              <View key={c} style={[styles.col, cellW > 0 && { width: cellW }]}>
                {cellW > 0 &&
                  columns[c].map((r) => (
                    <Animated.View
                      key={r.id}
                      entering={reduced ? undefined : FadeInDown.duration(duration.moderate)}
                      layout={reduced ? undefined : LinearTransition.duration(duration.fast)}
                      style={styles.cell}
                    >
                      <ProductCard item={r} index={0} width={cardW} />
                    </Animated.View>
                  ))}
                {cellW > 0 &&
                  Array.from({ length: pendingPerCol[c] }, (_, i) => (
                    <Animated.View
                      key={`sk-${c}-${i}`}
                      layout={LinearTransition.duration(duration.fast)}
                      exiting={FadeOut.duration(duration.fast)}
                      style={styles.cell}
                    >
                      {/* Same box the landing card's photo will occupy (132×96 ratio, D050). */}
                      <SkeletonBlock width={'100%'} height={Math.round(cardW / (132 / 96))} radiusToken={radius.md} />
                      <SkeletonBlock width={'70%'} height={12} />
                      <SkeletonBlock width={'45%'} height={12} />
                    </Animated.View>
                  ))}
              </View>
            ))}
          </View>
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
  // result grid's field reach both screen edges; hairlines top and bottom stand
  // in for the card's border, and the section above no longer needs a Divider.
  band: {
    // 8 — the band's own white sheet-end curve already reads as space below the
    // deals, so an outer gap on top of it stacked into ~60px of dead white
    // between the pagination dots and the aura. The air that separates the AI
    // copy from the sheet still lives INSIDE the band (SHEET_CLEAR). Was 16,
    // which superseded the +24 added on 2026-07-29 (D077).
    marginTop: space.s,
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
  pitch: { paddingHorizontal: space.m20, paddingTop: SHEET_END_H + SHEET_CLEAR },

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

  /** Results state — one heading + the grid, back on the page column. */
  results: { paddingHorizontal: space.m20, paddingTop: SHEET_END_H + SHEET_CLEAR, gap: space.m },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  heading: { ...t.body16SemiBold, color: color.aura.ink, flex: 1 },
  headingCount: { ...t.body12Medium, color: color.aura.slateMuted },
  /**
   * 2-up grid as two INDEPENDENT columns splitting one 12px gutter — not a
   * wrapping row, whose cells all stretch to the tallest in the row. `flex-start`
   * so the shorter column never stretches either (D064).
   */
  grid: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  col: { gap: space.s12 },
  /** A floating white card cell over the aura — the card content sits inside, and
   *  the cell is exactly as tall as that content. */
  cell: {
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    borderCurve: 'continuous',
    padding: space.s12,
    gap: space.s,
    ...elevation.soft,
  },
});

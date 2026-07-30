/**
 * MicGlyph — the search field's voice affordance, drawn as `react-native-svg` so
 * it can carry a LIVE GRADIENT: purple → blue → light blue travelling along the
 * glyph's own diagonal (`color.ckds.micFrom/Via/To`), looping every `LOOP_MS`.
 *
 * Why not the icon map: every other icon in the app is a Font Awesome glyph
 * rendered as `<Text>` (`icons/Icon.tsx`), and text takes ONE flat `color` — a
 * gradient would need a mask layer (`@react-native-masked-view`), which isn't a
 * dependency here and rasterises differently on web than on native. The mic is
 * the only gradient-filled icon in the chrome, so it is drawn the same way the AI
 * mark is (`icons/AiMark.tsx`, D017): parametric SVG, colours from tokens only.
 *
 * ## How the ramp animates (D106)
 *
 * SVG gradient STOPS are not animatable across this stack — Reanimated drives
 * native/DOM props, and `<Stop>` offsets/colours aren't wired through
 * `react-native-svg` on web, so an animated `stopColor` renders as a hard jump on
 * one platform and nothing on the other. Instead the glyph is drawn PHASE_COUNT
 * times, each drawing holding the same ramp sampled at a different offset round the
 * hue cycle, and their OPACITIES cross-fade on one clock. Opacity is a plain style
 * prop, so the whole thing runs on the UI thread on both platforms with no per-frame
 * React work.
 *
 * Layer 0 stays fully opaque underneath and the others fade over it, so total
 * coverage is always 1 — weighting every layer would thin the glyph out at each
 * hand-over and make it flicker against the field's grey.
 *
 * Geometry lives in a 24-unit box and is proportioned to FA6's `microphone` so it
 * drops into the trailing slot without re-tuning the field's layout: a filled
 * capsule head, a stroked U stand that ends in the two vertical stubs, and a stem
 * on a short base. Round caps and joins, matching the font's terminals.
 *
 * `id` must be unique per mounted instance — two SVGs sharing a gradient id on web
 * makes the second one resolve against the first's (already-removed) def and fall
 * back to black.
 */
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { color } from '../theme/tokens';

/** Head: a filled capsule, 7.5 × 11 in the 24-box, radius = half its width. */
const HEAD = { x: 8.25, y: 2, w: 7.5, h: 11, r: 3.75 } as const;
/** Stand: two stubs either side of a downward semicircle (sweep 0 = bulge down).
 *  r 5.5, not 6: at a wider opening the stand out-masses the head and the glyph
 *  starts reading as a bowl. */
const STAND = 'M6.5 10.6 L6.5 12 A5.5 5.5 0 0 0 17.5 12 L17.5 10.6';
/** Stem + base, each its own <Path> so they share the stroke gradient. */
const STEM = 'M12 17.5 L12 20.8';
const BASE = 'M8.8 20.8 L15.2 20.8';
const STROKE = 2.3;

/** The ramp, in the order it sits on the glyph at phase 0. Read as a CYCLE —
 *  violet → cobalt → azure → violet — so it can be scrolled without a seam. */
const HUES = [color.ckds.micFrom, color.ckds.micVia, color.ckds.micTo] as const;
/** Stops per drawing. Five, not three: the glyph is ~14px of ink, and at three
 *  stops a scrolled ramp spends most of the cycle looking like one flat hue. */
const STOP_OFFSETS = [0, 0.25, 0.5, 0.75, 1] as const;
/**
 * Phases of the scroll, baked at module load. Rotating the three hues between
 * three drawings (the first attempt) was invisible at this size — every rotation
 * still read as cobalt. Sampling a CYCLIC ramp at six offsets instead walks the
 * glyph through violet → cobalt → azure and back, which is legible at 22px.
 */
const PHASE_COUNT = 6;
/**
 * How much of the cycle the glyph shows at once. Half, NOT all of it: at a full
 * span every phase already contained violet AND cobalt AND azure, so scrolling
 * only moved which end of the mic held which — measured, the six drawings were
 * indistinguishable. At half a cycle the glyph reads as a two-hue ramp that
 * travels round, which is the thing that looks animated.
 */
const RAMP_SPAN = 0.5;
const PHASES: string[][] = Array.from({ length: PHASE_COUNT }, (_, p) =>
  STOP_OFFSETS.map((s) => rampAt(s * RAMP_SPAN + p / PHASE_COUNT)),
);
/** One full trip of the ramp. Slow on purpose: the mic is chrome, not a spinner —
 *  at ~2s it reads as a loading indicator and pulls the eye off the query. */
const LOOP_MS = 5600;

/**
 * The cyclic ramp at `t` (wrapped to 0–1): three hues evenly spaced round the
 * cycle, linearly mixed in sRGB. Mixing in sRGB is fine here because the three
 * are close in luminance — none of the pairs crosses grey, which is the case that
 * needs a perceptual space.
 */
function rampAt(t: number): string {
  const n = HUES.length;
  const x = ((t % 1) + 1) % 1;
  const i = Math.floor(x * n);
  return mix(HUES[i % n], HUES[(i + 1) % n], x * n - i);
}

function mix(a: string, b: string, k: number): string {
  const ca = hex(a);
  const cb = hex(b);
  const c = ca.map((v, i) => Math.round(v + (cb[i] - v) * k));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

/** `#rgb` / `#rrggbb` → [r,g,b]. Falls back to the violet end rather than feeding
 *  NaN into a gradient stop, which renders as black. */
function hex(h: string): [number, number, number] {
  const s = h.replace('#', '');
  const short = s.length === 3;
  const out: number[] = [];
  for (let i = 0; i < 3; i++) {
    const n = parseInt(short ? s[i].repeat(2) : s.slice(i * 2, i * 2 + 2), 16);
    out.push(Number.isNaN(n) ? 124 : n);
  }
  return out as [number, number, number];
}

export function MicGlyph({ size = 16, id = 'mic' }: { size?: number; id?: string }) {
  const reduced = useReducedMotion();
  // 0 → PHASE_COUNT, i.e. the index of the layer currently on top. Counting in
  // LAYERS rather than in a 0–1 progress keeps the hand-over maths integer-free:
  // layer i peaks at u === i, and u === PHASE_COUNT is layer 0 again.
  const u = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    u.value = withRepeat(
      withTiming(PHASE_COUNT, { duration: LOOP_MS, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(u);
  }, [reduced]);

  return (
    <View style={{ width: size, height: size }}>
      {PHASES.map((stops, i) => (
        <PhaseLayer key={i} stops={stops} index={i} u={u} size={size} id={`${id}-${i}`} reduced={!!reduced} />
      ))}
    </View>
  );
}

/**
 * One drawing of the glyph at one offset round the ramp. `index === 0` is the bed — it never
 * fades, so the glyph is never partly transparent. The rest ramp 0 → 1 → 0 across
 * their own slot of the loop.
 */
function PhaseLayer({
  stops,
  index,
  u,
  size,
  id,
  reduced,
}: {
  stops: string[];
  index: number;
  u: SharedValue<number>;
  size: number;
  id: string;
  reduced: boolean;
}) {
  const style = useAnimatedStyle(() => {
    if (index === 0 || reduced) return { opacity: index === 0 ? 1 : 0 };
    // Distance from this layer's own slot, measured on the wrapped clock, so the
    // last layer fades back out into layer 0's slot instead of snapping.
    const d = Math.abs(((u.value - index + PHASE_COUNT * 1.5) % PHASE_COUNT) - PHASE_COUNT * 0.5);
    return { opacity: Math.max(0, 1 - d) };
  });

  return (
    <Animated.View style={[index === 0 ? styles.bed : StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Defs>
          {/* The ramp runs from the HEAD's top-left corner to the base's right end
              (8,1.5 → 16.5,21) — not across the 24-box, whose corners the mic never
              reaches: measured at 17px, a box-diagonal ramp spent its purple end in
              empty space and the glyph rendered as flat cobalt. Purple therefore
              lands on the head, blue at the head/stand join, light blue on the stand
              and base — the three hues each get real ink. */}
          <LinearGradient id={`mic-${id}`} x1={8} y1={1.5} x2={16.5} y2={21} gradientUnits="userSpaceOnUse">
            {stops.map((c, s) => (
              <Stop key={s} offset={String(STOP_OFFSETS[s])} stopColor={c} />
            ))}
          </LinearGradient>
        </Defs>
        <Rect
          x={HEAD.x}
          y={HEAD.y}
          width={HEAD.w}
          height={HEAD.h}
          rx={HEAD.r}
          ry={HEAD.r}
          fill={`url(#mic-${id})`}
        />
        <Path
          d={STAND}
          stroke={`url(#mic-${id})`}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path d={STEM} stroke={`url(#mic-${id})`} strokeWidth={STROKE} strokeLinecap="round" fill="none" />
        <Path d={BASE} stroke={`url(#mic-${id})`} strokeWidth={STROKE} strokeLinecap="round" fill="none" />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // The bed lays out normally so the wrapper keeps the glyph's size; the fading
  // layers are absolute on top of it.
  bed: { position: 'relative' },
});

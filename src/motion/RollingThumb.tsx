import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, { ReduceMotion, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import { color, duration, elevation, radius, space, PILL_THUMB } from '../theme/tokens';
import { EASE } from './motion';

/**
 * RollingThumb — a circular SKU thumb whose image rolls upward to the next one on
 * a slow, per-instance random cadence (D081). Leads the Explore trending pills in
 * place of the search glyph, so the row reads as live merchandising rather than
 * five static chips.
 *
 * Built as a REEL on ONE monotonic clock:
 *
 * • `p` counts steps (0 → 1 → 2 …) and is never reset or reversed, so every
 *   transition travels the same direction — up. A toggled 0↔1 progress would roll
 *   back down on alternate steps.
 * • A slot's position is a PURE function of `p`: `d = (i - p) mod 2`, wrapped into
 *   (-1, +1]. The slot leaving the top therefore reappears below the window by
 *   arithmetic alone — no JS "recycle" step, so nothing can drift out of frame if a
 *   callback is dropped. (It did: recycling from the timing callback while reading
 *   `p.value` back on the JS side walked every layer below the circle. JS-side
 *   reads of a shared value mid-animation are stale by design.)
 * • JS therefore owns exactly one thing: which image the INVISIBLE slot will carry.
 *   It is set one step ahead, while that slot is at **exactly zero opacity**
 *   (`cos(π/2)`) below the centre, so the swap can never be seen.
 * • Pacing is a self-scheduling timer, never an animation callback — the reel keeps
 *   rolling even where those callbacks don't arrive.
 * • The curve is `spatial` over `duration.hero`: it leaves immediately and spends
 *   most of the roll arriving, which at this size reads as weight settling. Depth
 *   comes from scale + a cosine opacity ramp (no blur pass, no mid-roll dip).
 * • Cadence is randomised per instance (first roll and every gap), so five pills
 *   never pulse in lockstep — the tell of a shared interval.
 * • Under reduced motion nothing animates and no timer is armed: the first image
 *   just sits there (§9.6).
 */
export function RollingThumb({
  images,
  size = PILL_THUMB,
}: {
  /** Bundled require() ids to roll through. One image renders static. */
  images: number[];
  size?: number;
}) {
  const reduced = useReducedMotion();
  const p = useSharedValue(0);
  const travel = size * ROLL_TRAVEL; // see ROLL_TRAVEL — must stay INSIDE the window
  // SLOTS slots, each holding the image index it currently carries. Slot i is the
  // one centred whenever `p ≡ i (mod SLOTS)`.
  const [frames, setFrames] = useState<number[]>(() =>
    Array.from({ length: SLOTS }, (_, i) => (images.length ? i % images.length : 0)),
  );
  const step = useRef(0); // JS owns the step count; `p` only follows it
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reduced || images.length < 2) return;

    const tick = () => {
      const next = step.current + 1;
      step.current = next;
      // The slot that is about to rise into the window is the one for the step
      // AFTER this one — still below the circle, still invisible. Give it a frame
      // now so the swap happens off-screen.
      setFrames((prev) => {
        const incoming = (next + 1) % SLOTS;
        const fresh = [...prev];
        fresh[incoming] = nextImage(images.length, prev);
        return fresh;
      });
      p.value = withTiming(next, ROLL);
      timer.current = setTimeout(tick, DWELL_MIN + Math.random() * DWELL_SPAN);
    };

    timer.current = setTimeout(tick, FIRST_MIN + Math.random() * FIRST_SPAN);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [reduced, images.length]);

  if (!images.length) return <View style={[styles.circle, { width: size, height: size }]} />;

  return (
    <View style={[styles.circle, { width: size, height: size }]}>
      {reduced || images.length < 2 ? (
        <Image source={images[0]} style={imageSize(size)} resizeMode="contain" />
      ) : (
        frames.map((img, i) => <Layer key={i} p={p} index={i} source={images[img]} size={size} travel={travel} />)
      )}
      {/* The well, ABOVE the reel: an inset cast can only be drawn by an overlay
          (AGENTS "inset shadows"), and layering it over the images is what makes the
          photo sit *in* the disc instead of on it. The ring is a real border so the
          well survives anywhere inset `boxShadow` is dropped. */}
      <View style={styles.well} pointerEvents="none" />
    </View>
  );
}

function Layer({
  p,
  index,
  source,
  size,
  travel,
}: {
  p: SharedValue<number>;
  index: number;
  source: number;
  size: number;
  travel: number;
}) {
  const style = useAnimatedStyle(() => {
    // Steps away from the window, wrapped into (-1, +1]: 0 centred, -1 just above,
    // +1 waiting below. JS's `%` keeps the sign, which is what makes the wrap work.
    let d = (index - p.value) % SLOTS;
    if (d > SLOTS / 2) d -= SLOTS;
    if (d <= -SLOTS / 2) d += SLOTS;
    const a = Math.min(1, Math.abs(d));
    return {
      // Cosine ramp, not linear: the two images cross at ~0.7 opacity each, so the
      // middle of the roll never dips towards an empty circle.
      opacity: Math.cos(a * (Math.PI / 2)),
      transform: [{ translateY: d * travel }, { scale: 1 - DEPTH * a }],
    };
  });
  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.layer, style]} pointerEvents="none">
      <Image source={source} style={imageSize(size)} resizeMode="contain" />
    </Animated.View>
  );
}

/** Pick a frame no slot is carrying, so nothing repeats back-to-back. */
function nextImage(count: number, showing: number[]): number {
  if (count < 2) return 0;
  const free: number[] = [];
  for (let i = 0; i < count; i++) if (!showing.includes(i)) free.push(i);
  const pool = free.length ? free : [(showing[showing.length - 1] + 1) % count];
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Layers in the reel. Two is enough: one leaving, one arriving. */
const SLOTS = 2;
// `hero` (600), not `slow`: over a 40px disc the roll is the section's one piece of
// legible motion, and at 400 it read as a flick rather than as a reel turning.
const ROLL = { duration: duration.hero, easing: EASE.spatial, reduceMotion: ReduceMotion.System };
/** Scale drop at the edge of the roll — the depth cue that keeps it off a slot machine. */
const DEPTH = 0.14;
/**
 * How far a slot travels, as a fraction of the disc (D098). It MUST be well under
 * 1: the disc is the window and clips to itself, so a travel of a full diameter puts
 * BOTH images half outside it at the crossover — the reel then reads as two clipped
 * fragments stuck to the top and bottom edges with an empty middle, which is exactly
 * what "the pills look misaligned and clipped at the bottom" was. It was `size + 4`.
 * At 0.45 the two images still overlap across the centre as they cross, so the disc
 * always has a picture in the middle of it, and the cosine opacity ramp does the rest.
 */
const ROLL_TRAVEL = 0.45;
/** The image sits inside the circle with air around it, like a BrandThumb tile. */
const IMAGE_INSET = 0.82;
// Cadence (ms): the first roll lands after the pill's entrance has settled, then a
// slow random beat. Independent per instance — see the header.
const FIRST_MIN = 1200;
const FIRST_SPAN = 2800;
const DWELL_MIN = 6000;
const DWELL_SPAN = 5000;

const imageSize = (size: number) => ({ width: size * IMAGE_INSET, height: size * IMAGE_INSET });

const styles = StyleSheet.create({
  circle: {
    borderRadius: radius.full,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // clips the reel to the circle
    ...elevation.xs,
  },
  layer: { alignItems: 'center', justifyContent: 'center' },
  well: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.thumbWellRing,
    // Lit from above: the top edge casts down and in, the bottom edge returns a
    // little light. Two stops, both tight — a wide inset reads as a vignette.
    boxShadow: `inset 0 1.5px 3px -0.5px ${color.thumbWellShade}, inset 0 -1px 1.5px -0.5px ${color.thumbWellSheen}`,
  },
});

import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { space } from '../theme/tokens';

/**
 * LoopRail — a horizontal rail that drifts very slowly and forever, and that the
 * user can still drag in either direction without ever reaching an end (D086).
 * Carries the Explore trending pills, which outgrew a wrapping row.
 *
 * How the loop is built:
 *
 * • The children are laid out THREE times. The scroller is parked in the middle
 *   copy, so there is always a full copy of content off each edge and the seam is
 *   never in frame. One copy's width `W` is measured from the first copy's layout,
 *   plus the trailing gap, so item 1 of copy B sits exactly `W` from item 1 of A.
 * • Position is normalised into `[W, 2W)` every tick: crossing either boundary
 *   subtracts or adds exactly one copy width, which is invisible because the pixel
 *   under the finger is identical. That is what makes a drag endless in BOTH
 *   directions rather than stopping at offset 0.
 * • The drift is a plain `requestAnimationFrame` loop writing `scrollTo`, not a
 *   Reanimated worklet: `scrollTo` from a worklet is a native-only path, and this
 *   rail has to move in the web preview too — the same reasoning that keeps
 *   count-ups on rAF (D068). At this speed one frame moves a sixth of a pixel, so
 *   the cost is one imperative call per frame and nothing else.
 * • A drag pauses the drift (`onScrollBeginDrag`) and hands its end position back,
 *   so the rail carries on from wherever the user let go instead of snapping.
 * • Under reduced motion no frame loop is ever started; the rail is still a
 *   perfectly ordinary scroller (§9.6).
 */
export function LoopRail({
  children,
  speed = DRIFT,
  gap = space.s12,
  bleed = 0,
}: {
  /** One copy of the rail's content. Rendered three times. */
  children: React.ReactNode[];
  /** Drift in px per second — positive drifts left, negative drifts right. Small
   *  on purpose; see DRIFT. */
  speed?: number;
  gap?: number;
  /** Page padding to cancel so the rail runs to the screen edge (AGENTS full-bleed). */
  bleed?: number;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<ScrollView | null>(null);
  const [w, setW] = useState(0); // one copy's width + its trailing gap
  const [vw, setVw] = useState(0); // the rail's own visible width
  const pos = useRef(0); // last x we wrote, always inside [w, 2w)
  const dragging = useRef(false);

  // Enough copies that offset 2w is always REACHABLE: a scroller clamps at
  // `content − viewport`, so with only three copies a narrow set puts 2w past the
  // end, and a rail drifting right — which wraps to 2w on its first tick — sits
  // pinned there looking frozen. Two spare copies past the viewport fixes it.
  const copies = w && vw ? Math.max(3, Math.ceil(vw / w) + 3) : 3;

  // Park in the middle copy as soon as the width is known.
  useEffect(() => {
    if (!w) return;
    pos.current = w;
    ref.current?.scrollTo({ x: w, y: 0, animated: false });
  }, [w]);

  useEffect(() => {
    if (!w || reduced) return;
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      const dt = last ? Math.min(now - last, 64) : 0; // a backgrounded tab returns a huge dt
      last = now;
      if (!dragging.current && dt) {
        let x = pos.current + (speed * dt) / 1000;
        if (x >= 2 * w) x -= w; // drifting left (positive speed)
        if (x < w) x += w; // drifting right (negative speed), or dragged back
        pos.current = x;
        ref.current?.scrollTo({ x, y: 0, animated: false });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [w, reduced, speed]);

  /** Bring any offset back into the middle copy — silent, the content repeats. */
  const normalise = (x: number) => {
    let n = x;
    if (!w) return n;
    while (n >= 2 * w) n -= w;
    while (n < w) n += w;
    if (Math.abs(n - x) > 0.5) ref.current?.scrollTo({ x: n, y: 0, animated: false });
    return n;
  };

  const onRelease = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    pos.current = normalise(e.nativeEvent.contentOffset.x);
    dragging.current = false;
  };

  return (
    <ScrollView
      ref={ref}
      horizontal
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={16}
      onScrollBeginDrag={() => (dragging.current = true)}
      onScrollEndDrag={onRelease}
      onMomentumScrollEnd={onRelease}
      onLayout={(e) => setVw(Math.round(e.nativeEvent.layout.width))}
      style={bleed ? { marginHorizontal: -bleed } : null}
      contentContainerStyle={[styles.row, { gap }]}
    >
      {Array.from({ length: copies }, (_, c) => c).map((c) => (
        <View
          key={c}
          style={[styles.row, { gap }]}
          // Only the first copy is measured; all three are identical.
          onLayout={c === 0 ? (e) => setW(Math.round(e.nativeEvent.layout.width) + gap) : undefined}
        >
          {children.map((child, i) => (
            <View key={`${c}-${i}`}>{child}</View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

/**
 * Default drift: 10px/s. A ~900px set of pills takes ~90s to pass, which reads as
 * the row breathing rather than as a ticker — "very very slow" was the brief.
 */
const DRIFT = 10;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});

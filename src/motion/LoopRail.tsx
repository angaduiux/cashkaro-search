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
 * • The children are laid out several times over — `ceil(viewport / W) + 3` copies.
 *   The scroller is parked in the SECOND one, so there is always a full copy of
 *   content off each edge and the seam is never in frame. One copy's width `W` is
 *   measured from the first copy's layout, plus the trailing gap, so item 1 of copy B
 *   sits exactly `W` from item 1 of A.
 * • Position is normalised into `[W, 2W)` every tick: crossing either boundary
 *   subtracts or adds exactly one copy width, which is invisible because the pixel
 *   under the finger is identical. That is what makes a drag endless in BOTH
 *   directions rather than stopping at offset 0.
 * • The drift is a plain `requestAnimationFrame` loop writing `scrollTo`, not a
 *   Reanimated worklet: `scrollTo` from a worklet is a native-only path, and this
 *   rail has to move in the web preview too — the same reasoning that keeps
 *   count-ups on rAF (D068). At this speed one frame moves a sixth of a pixel, so
 *   the cost is one imperative call per frame and nothing else.
 * • A touch pauses the drift and a drag hands its end position back, so the rail
 *   carries on from wherever the user let go instead of snapping — and a pill's press
 *   is never cancelled by the rail moving under the finger.
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
  // A finger on the rail freezes it — from TOUCH, not just from drag. A rail that
  // keeps moving under the thumb cancels the press it lands on, which is why the
  // pills read as untappable. `sliding` is tracked separately so the drift also stays
  // out of the way through the momentum AFTER a fling, where a competing `scrollTo`
  // would fight the deceleration.
  const touching = useRef(false);
  const sliding = useRef(false);

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
      if (!touching.current && !sliding.current && dt) {
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
    sliding.current = false;
  };

  return (
    <ScrollView
      ref={ref}
      horizontal
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={16}
      // Explore is shown with the keyboard up, and a scroller's default is to spend
      // the first tap dismissing it. Without this the pills simply never fire.
      keyboardShouldPersistTaps="handled"
      onTouchStart={() => (touching.current = true)}
      onTouchEnd={() => (touching.current = false)}
      onTouchCancel={() => (touching.current = false)}
      onScrollBeginDrag={() => (sliding.current = true)}
      onScrollEndDrag={onRelease}
      onMomentumScrollEnd={onRelease}
      onLayout={(e) => setVw(Math.round(e.nativeEvent.layout.width))}
      style={[styles.rail, bleed ? { marginHorizontal: -bleed } : null]}
      contentContainerStyle={[styles.row, styles.pad, { gap }]}
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

/** Slack above and below the content so nothing at a pill's edge sits on the clip. */
const EDGE = space.xxs;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  // A horizontal scroller clips its CROSS axis (`overflow-y: hidden`), which shaved
  // the bottom of each pill's hairline and the disc's drop shadow. The content gets
  // 2px of slack and the rail gives it straight back as negative margin, so the
  // section's rhythm is unchanged.
  pad: { paddingVertical: EDGE },
  rail: { marginVertical: -EDGE },
});

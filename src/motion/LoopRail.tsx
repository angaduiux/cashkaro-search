/**
 * LoopRail — a horizontal rail that drifts very slowly and forever, and that the
 * user can still drag in either direction without ever reaching an end (D086).
 * Carries the Explore trending pills, which outgrew a wrapping row.
 *
 * **The drift is a TRANSFORM on the content, not a scroll of the scroller (D099).**
 * That is the whole design, and it is a correction. The drift used to write
 * `scrollTo` every frame from a rAF loop, which put JS in a fight with the finger
 * over one number — the scroll offset — and the fight had three symptoms, all of
 * them reported from a device: a drag never accumulated, because every frame reset
 * the offset before iOS could decide a pan had begun (so `onScrollBeginDrag` never
 * fired, so the loop never paused: a deadlock — "the auto-scroll stops but I can't
 * scroll manually either"); and a press was cancelled, because the pill slid out
 * from under a stationary finger ("the pills don't tap"). Driving the drift with
 * `translateX` leaves the scroll offset entirely to the user, so a drag is ordinary
 * native scrolling and a press is never moved out from under the finger.
 *
 * How the loop is built:
 *
 * • The children are laid out several times over — `ceil(viewport / W) + 3` copies.
 *   The scroller is parked in the SECOND one, so there is always a full copy of
 *   content off each edge: one copy of slack absorbs the drift transform, and the
 *   next absorbs a drag. One copy's width `W` is measured from the first copy's
 *   layout, plus the trailing gap, so item 1 of copy B sits exactly `W` from A's.
 * • `phase` advances on the UI thread (`useFrameCallback`) and wraps into `[0, W)`.
 *   The wrap is invisible because the pixel it lands on is identical, which is what
 *   makes the drift endless rather than something that runs out.
 * • A DRAG is normalised back into the middle copy when it ends — the same trick on
 *   the scroll offset — so the user never reaches an end either.
 * • `paused` freezes the drift. It is set from the rail's own touch handlers AND
 *   published to the children through `useRailPause()`, because once a child
 *   Pressable takes the responder the ScrollView may never see the touch at all
 *   (D097). A rail that keeps moving under the thumb is a rail whose pills don't tap.
 * • Under reduced motion the frame callback never starts; the rail is still a
 *   perfectly ordinary scroller (§9.6).
 */
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import Animated, { useAnimatedStyle, useFrameCallback, useReducedMotion, useSharedValue } from 'react-native-reanimated';
import { space } from '../theme/tokens';

/**
 * Freeze/thaw handles the rail publishes to its children (D097). Default is a
 * no-op pair, so a pressable that calls it outside a rail costs nothing.
 */
const RailPauseContext = createContext<{ hold: () => void; release: () => void }>({
  hold: () => {},
  release: () => {},
});

/** Pause the drifting rail this element sits in, for the length of a press. */
export const useRailPause = () => useContext(RailPauseContext);

export function LoopRail({
  children,
  speed = DRIFT,
  gap = space.s12,
  bleed = 0,
}: {
  /** One copy of the rail's content. Rendered several times over. */
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

  // UI-thread state: the frame callback reads all three, so none can be a ref.
  const phase = useSharedValue(0); // drift offset, always inside [0, w)
  const paused = useSharedValue(false);
  const copyW = useSharedValue(0);
  // Published in an effect, never in the render body: writing a shared value while
  // React renders is what Reanimated's strict mode flags, and it fired on every
  // measure pass. The frame callback already no-ops while the width is 0, so the
  // one-frame delay costs nothing.
  useEffect(() => {
    copyW.value = w;
  }, [w]);

  // Enough copies that the drift transform (up to one copy) and a drag (another)
  // both have covered content to move into.
  const copies = w && vw ? Math.max(3, Math.ceil(vw / w) + 3) : 3;

  // Park in the middle copy as soon as the width is known — a full copy of slack
  // off each edge is what makes a drag endless in both directions.
  useEffect(() => {
    if (!w) return;
    ref.current?.scrollTo({ x: w, y: 0, animated: false });
  }, [w]);

  useFrameCallback((frame) => {
    'worklet';
    const cw = copyW.value;
    if (!cw || paused.value) return;
    // A backgrounded tab hands back a huge delta; cap it so the rail never jumps.
    const dt = Math.min(frame.timeSincePreviousFrame ?? 0, 64);
    if (!dt) return;
    let next = phase.value + (speed * dt) / 1000;
    next %= cw; // the content repeats every cw, so the wrap cannot be seen
    if (next < 0) next += cw;
    phase.value = next;
  }, !reduced);

  // Positive speed drifts the content LEFT, so the transform runs negative.
  const driftStyle = useAnimatedStyle(() => ({ transform: [{ translateX: -phase.value }] }));

  /** Bring a drag's end offset back into the middle copy — silent, content repeats. */
  const onRelease = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    paused.value = false;
    if (!w) return;
    const x = e.nativeEvent.contentOffset.x;
    let n = x;
    while (n >= 2 * w) n -= w;
    while (n < w) n += w;
    if (Math.abs(n - x) > 0.5) ref.current?.scrollTo({ x: n, y: 0, animated: false });
  };

  // Stable across renders — a child's press handlers must not re-subscribe.
  const pause = useMemo(
    () => ({
      hold: () => {
        paused.value = true;
      },
      release: () => {
        paused.value = false;
      },
    }),
    [paused],
  );

  return (
    <ScrollView
      ref={ref}
      horizontal
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={16}
      // Explore is shown with the keyboard up, and a scroller's default is to spend
      // the first tap dismissing it. Without this the pills simply never fire.
      keyboardShouldPersistTaps="handled"
      onTouchStart={() => (paused.value = true)}
      onTouchEnd={() => (paused.value = false)}
      onTouchCancel={() => (paused.value = false)}
      onScrollBeginDrag={() => (paused.value = true)}
      onScrollEndDrag={onRelease}
      onMomentumScrollEnd={onRelease}
      onLayout={(e) => setVw(Math.round(e.nativeEvent.layout.width))}
      style={[styles.rail, bleed ? { marginHorizontal: -bleed } : null]}
      contentContainerStyle={[styles.row, styles.pad, { gap }]}
    >
      <RailPauseContext.Provider value={pause}>
        {/* The drift lives HERE — on the content, never on the scroll offset (D099). */}
        <Animated.View style={[styles.row, { gap }, driftStyle]}>
          {Array.from({ length: copies }, (_, c) => c).map((c) => (
            <View
              key={c}
              style={[styles.row, { gap }]}
              // Only the first copy is measured; all of them are identical.
              onLayout={c === 0 ? (e) => setW(Math.round(e.nativeEvent.layout.width) + gap) : undefined}
            >
              {children.map((child, i) => (
                <View key={`${c}-${i}`}>{child}</View>
              ))}
            </View>
          ))}
        </Animated.View>
      </RailPauseContext.Provider>
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

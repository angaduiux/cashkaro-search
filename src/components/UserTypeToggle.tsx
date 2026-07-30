import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { color, type as t, space, radius, fontFamily, elevation, PILL_HEIGHT } from '../theme/tokens';
import { Icon } from '../icons/Icon';
import { EASE } from '../motion/motion';

export type UserType = 'new' | 'existing';

/**
 * New-user / existing-user segmented toggle. One connected control that flips the
 * whole search flow's context — tapping it slides the thumb and the downstream
 * elements (hero bonus, CTAs, offers) re-render for that user type.
 */
export function UserTypeToggle({ value, onChange }: { value: UserType; onChange: (v: UserType) => void }) {
  const [w, setW] = useState(0);
  const sel = useSharedValue(value === 'new' ? 0 : 1);
  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);

  const set = (v: UserType) => {
    sel.value = withTiming(v === 'new' ? 0 : 1, { duration: 260, easing: EASE.emphasized });
    onChange(v);
  };

  const thumb = useAnimatedStyle(() => ({
    transform: [{ translateX: sel.value * ((w - 8) / 2) }],
  }));

  return (
    <View style={styles.track} onLayout={onLayout}>
      {w > 0 && <Animated.View style={[styles.thumb, { width: (w - 8) / 2 }, thumb]} />}
      <Segment icon="sparkle" label="New User" active={value === 'new'} onPress={() => set('new')} />
      <Segment icon="user" label="Existing User" active={value === 'existing'} onPress={() => set('existing')} />
    </View>
  );
}

/**
 * Compact new/existing switch — a small sticky pill that flips the whole flow from
 * INSIDE the phone (D102). `UserTypeToggle` above is the in-design segmented
 * control; this one is showcase chrome, for demoing on a device, where the web
 * preview's own User control does not exist. Deliberately dark: it should read as a
 * demo affordance sitting over the app, not as part of the Home design it covers.
 *
 * `bottom` is the caller's job, because only the caller knows what it has to clear
 * (Home's tab bar plus the safe-area inset).
 */
export function UserTypeSwitch({
  value,
  onChange,
  bottom,
}: {
  value: UserType;
  onChange: (v: UserType) => void;
  bottom: number;
}) {
  const next: UserType = value === 'new' ? 'existing' : 'new';
  return (
    <Pressable
      onPress={() => onChange(next)}
      hitSlop={8}
      style={[styles.switch, { bottom }]}
      accessibilityRole="switch"
      accessibilityState={{ checked: value === 'existing' }}
      accessibilityLabel={`Showing the ${value} user flow. Tap to switch to ${next}.`}
    >
      <Icon name="user" size={11} color={color.textInverse} />
      <Text style={styles.switchLabel}>{value === 'new' ? 'New' : 'Existing'}</Text>
    </Pressable>
  );
}

function Segment({ icon, label, active, onPress }: { icon: any; label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={styles.segment} onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: active }} accessibilityLabel={label}>
      <Icon name={icon} size={14} color={active ? color.textInverse : color.ckds.slate} />
      <Text style={[styles.segText, { color: active ? color.textInverse : color.ckds.slate }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    padding: space.xs,
    borderRadius: radius.full,
    backgroundColor: color.recentSurface,
    position: 'relative',
  },
  thumb: {
    position: 'absolute',
    left: space.xs,
    top: space.xs,
    bottom: space.xs,
    borderRadius: radius.full,
    backgroundColor: color.ckds.cta,
  },
  // Sticky showcase pill, bottom-right, 36 tall + 8 of slop to clear the tap-target
  // minimum. It DOES float over whatever is behind it — on Home that is the store
  // rail's "Shop Now" — which is why the label is one word: anything floating over a
  // full-width rail covers something, so it covers as little as possible.
  switch: {
    position: 'absolute',
    right: space.m20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s6,
    height: PILL_HEIGHT,
    paddingHorizontal: space.s12,
    borderRadius: radius.full,
    backgroundColor: color.ckds.ink,
    ...elevation.md,
  },
  switchLabel: { fontFamily: fontFamily.semiBold, fontSize: 12, color: color.textInverse },
  segment: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xs, height: '100%' },
  segText: { fontFamily: fontFamily.semiBold, fontSize: 13 },
});

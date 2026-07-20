import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { color, type as t, space, radius, fontFamily } from '../theme/tokens';
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

function Segment({ icon, label, active, onPress }: { icon: any; label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={styles.segment} onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: active }} accessibilityLabel={label}>
      <Icon name={icon} size={14} color={active ? color.textInverse : color.aura.slate} />
      <Text style={[styles.segText, { color: active ? color.textInverse : color.aura.slate }]}>{label}</Text>
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
    backgroundColor: color.aura.cta,
  },
  segment: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xs, height: '100%' },
  segText: { fontFamily: fontFamily.semiBold, fontSize: 13 },
});

/**
 * On-screen keyboard (prototype chrome, web only). A functional iOS/Android
 * light-theme QWERTY that drives the real query — tapping a key appends, so the
 * suggestions and SERP react exactly as with a hardware keyboard. Rides in from
 * the bottom on focus and out on blur (§9.4 "focus / entry: ride the keyboard
 * rise").
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { color, type as t, space, radius, elevation } from '../theme/tokens';
import { Icon } from '../icons/Icon';
import { DeviceOS } from './devices';


const ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

export function Keyboard({
  os,
  onKey,
  onBackspace,
  onSpace,
  onSubmit,
}: {
  os: DeviceOS;
  onKey: (c: string) => void;
  onBackspace: () => void;
  onSpace: () => void;
  onSubmit: () => void;
}) {
  return (
    <Animated.View
      entering={SlideInDown.duration(260)}
      exiting={SlideOutDown.duration(200)}
      style={[styles.wrap, elevation.lg]}
    >
      {ROWS.map((row, ri) => (
        <View key={ri} style={[styles.row, ri === 2 && styles.row3]}>
          {ri === 2 && <Key wide onPress={() => {}} label="" icon="shift" />}
          {row.map((c) => (
            <Key key={c} label={os === 'ios' ? c : c.toUpperCase()} onPress={() => onKey(c)} />
          ))}
          {ri === 2 && <Key wide onPress={onBackspace} label="" icon="backspace" />}
        </View>
      ))}
      <View style={styles.bottomRow}>
        <Key label="123" flex={1.4} muted onPress={() => {}} />
        <Key label="space" flex={4} onPress={onSpace} />
        <Key label="search" flex={2} accent onPress={onSubmit} />
      </View>
    </Animated.View>
  );
}

function Key({
  label,
  icon,
  onPress,
  wide,
  flex,
  accent,
  muted,
}: {
  label: string;
  icon?: 'shift' | 'backspace';
  onPress: () => void;
  wide?: boolean;
  flex?: number;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label || icon}
      style={[
        styles.key,
        wide && styles.keyWide,
        muted && styles.keyMuted,
        accent && styles.keyAccent,
        flex ? { flex } : null,
      ]}
    >
      {icon ? (
        <Icon name={icon} size={18} color={color.textPrimary} />
      ) : (
        <Text style={[t.body16Regular, { color: accent ? color.textInverse : color.textPrimary }]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#d1d5db', // iOS keyboard tray grey (chrome, not app UI)
    paddingHorizontal: space.xs,
    paddingTop: space.s,
    paddingBottom: space.s,
    gap: space.s,
  },
  row: { flexDirection: 'row', justifyContent: 'center', gap: space.xs },
  row3: { paddingHorizontal: space.none },
  bottomRow: { flexDirection: 'row', gap: space.xs, marginTop: space.xxs },
  key: {
    minWidth: 30,
    flex: 1,
    height: 42,
    borderRadius: radius.sm,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.xs,
  },
  keyWide: { flex: 1.5, backgroundColor: '#adb3bd' },
  keyMuted: { backgroundColor: '#adb3bd' },
  keyAccent: { backgroundColor: color.actionPrimary },
});

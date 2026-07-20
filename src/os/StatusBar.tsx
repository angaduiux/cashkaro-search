import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { color, type as t, space } from '../theme/tokens';
import { Icon } from '../icons/Icon';
import { DeviceOS } from './devices';

/**
 * OS status bar (prototype chrome). iOS: centered notch gap with time left,
 * signal/wifi/battery right. Android: time left, icons right, no notch gap.
 * Static values — this is device chrome, not app data.
 */
export function StatusBar({ os, notch }: { os: DeviceOS; notch: boolean }) {
  const isIOS = os === 'ios';
  return (
    <View style={[styles.bar, { paddingTop: notch ? space.s : space.xs }]}>
      <Text style={[isIOS ? styles.timeIOS : styles.timeAndroid, { color: color.textPrimary }]}>
        9:41
      </Text>
      {notch && isIOS && <View style={styles.notch} />}
      <View style={styles.icons}>
        <Icon name="signal" size={14} color={color.textPrimary} />
        <Icon name="wifi" size={14} color={color.textPrimary} />
        <Icon name="battery" size={16} color={color.textPrimary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.m,
    backgroundColor: color.surface,
  },
  timeIOS: { ...t.body14SemiBold, width: 80 },
  timeAndroid: { ...t.body14SemiBold, width: 80 },
  notch: {
    position: 'absolute',
    top: 6,
    alignSelf: 'center',
    left: '50%',
    marginLeft: -60,
    width: 120,
    height: 30,
    borderRadius: 20,
    backgroundColor: '#000000',
  },
  icons: { flexDirection: 'row', alignItems: 'center', gap: space.s6, width: 80, justifyContent: 'flex-end' },
});

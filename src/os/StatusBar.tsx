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
export function StatusBar({ os, notch, transparent }: { os: DeviceOS; notch: boolean; transparent?: boolean }) {
  const isIOS = os === 'ios';
  return (
    // `transparent` drops the white fill so a full-bleed layer mounted behind this
    // one (the HeroBleed wash, D069) runs unbroken up to the physical top edge.
    <View style={[styles.bar, { paddingTop: notch ? space.s : space.xs }, transparent && styles.barTransparent]}>
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

/** Mock status-bar height. Exported so Root can size the white veil that fades
 *  in behind it over a full-bleed wash (D069) without a magic number. */
export const STATUS_BAR_H = 44;

const styles = StyleSheet.create({
  bar: {
    height: STATUS_BAR_H,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.m,
    backgroundColor: color.surface,
  },
  barTransparent: { backgroundColor: 'transparent' },
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

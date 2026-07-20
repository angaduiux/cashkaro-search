import React from 'react';
import { View, StyleSheet } from 'react-native';
import { color, space, radius } from '../theme/tokens';
import { DeviceOS } from './devices';

/**
 * Bottom OS affordance: iOS home indicator (pill) or Android 3-button nav.
 * Prototype chrome, not app UI.
 */
export function NavChrome({ os }: { os: DeviceOS }) {
  if (os === 'android') {
    return (
      <View style={styles.androidBar}>
        <View style={styles.androidBtn} />
        <View style={styles.androidCircle} />
        <View style={styles.androidBtn} />
      </View>
    );
  }
  return (
    <View style={styles.iosBar}>
      <View style={styles.homeIndicator} />
    </View>
  );
}

const styles = StyleSheet.create({
  iosBar: { height: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: color.surface },
  homeIndicator: { width: 136, height: 5, borderRadius: radius.full, backgroundColor: color.textPrimary },
  androidBar: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: color.surface,
  },
  androidBtn: { width: 16, height: 16, borderWidth: 2, borderColor: color.textTertiary },
  androidCircle: { width: 16, height: 16, borderRadius: radius.full, borderWidth: 2, borderColor: color.textTertiary },
});

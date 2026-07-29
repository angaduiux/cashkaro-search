import React from 'react';
import { View, Text, Image, ImageSourcePropType, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { color, type as t, radius, space, elevation } from '../theme/tokens';
import { Icon } from '../icons/Icon';
import { IconName } from '../icons/iconMap';

/**
 * Brand thumbnail — the one store-card logo treatment used EVERYWHERE (W4 spec
 * Figma 1646:7258): white tile, radius 8, logo object-contain, soft shadow
 * (0 4.8 6.4 rgba(18,23,38,.1)). Falls back to the brand initial when no asset.
 */
export function BrandThumb({
  uri,
  label,
  width,
  height,
  radiusToken = radius.sm,
  scale = 1,
  style,
}: {
  uri?: string | number | null;
  label?: string;
  width: number;
  height: number;
  radiusToken?: number;
  /** Shrinks the logo INSIDE the tile without resizing the tile — 0.5 halves it.
   *  For assets cropped tight to their ink box (the Myntra symbol, D066), which
   *  otherwise reach the tile's edges where a lockup would have left air. */
  scale?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const initial = label?.trim()?.[0]?.toUpperCase() ?? '';
  const source: ImageSourcePropType | null =
    uri == null ? null : typeof uri === 'string' ? { uri } : (uri as ImageSourcePropType);
  return (
    <View style={[{ width, height, borderRadius: radiusToken }, styles.brand, elevation.logo, style]}>
      {source ? (
        <Image
          source={source}
          style={{ width: width * 0.96 * scale, height: height * 0.86 * scale }}
          resizeMode="contain"
          accessibilityLabel={label}
        />
      ) : (
        <Text style={[t.heading18SemiBold, { color: color.aura.slateMuted }]}>{initial}</Text>
      )}
    </View>
  );
}

/**
 * Image slot for store logos / card artwork. When no asset is provided we render
 * a neutral slot with an initial + concept icon — never a fabricated image URL
 * (§14 item 4). Real imagery drops in via the `uri` prop when the feed supplies
 * it. Images blur/fade-up from the slot colour (handled by the motion layer).
 */
export function ImageSlot({
  uri,
  label,
  icon = 'tag',
  size = 56,
  radiusToken = radius.md,
  bg,
  style,
}: {
  /** URL string, or a bundled require() (number) for design-system assets. */
  uri?: string | number | null;
  label?: string;
  icon?: IconName;
  size?: number;
  radiusToken?: number;
  /** Brand tint behind the logo (comes from the data layer, e.g. BRAND.*.bg). */
  bg?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const initial = label?.trim()?.[0]?.toUpperCase() ?? '';
  // A require()'d asset is a number on native but an object on RN-Web — pass
  // either straight through; only wrap plain URL strings in { uri }.
  const source: ImageSourcePropType | null =
    uri == null ? null : typeof uri === 'string' ? { uri } : (uri as ImageSourcePropType);
  return (
    <View
      style={[
        styles.slot,
        { width: size, height: size, borderRadius: radiusToken },
        bg ? { backgroundColor: bg, borderColor: 'transparent' } : null,
        style,
      ]}
    >
      {source ? (
        <Image
          source={source}
          style={{ width: size * 0.84, height: size * 0.84, borderRadius: radiusToken / 2 }}
          resizeMode="contain"
          accessibilityLabel={label}
        />
      ) : (
        <View style={styles.fallback}>
          {initial ? (
            <Text style={[t.heading18SemiBold, { color: color.textTertiary }]}>{initial}</Text>
          ) : (
            <Icon name={icon} size={size * 0.34} color={color.textTertiary} />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    backgroundColor: color.surfaceAlt,
    borderWidth: 1,
    borderColor: color.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fallback: { alignItems: 'center', justifyContent: 'center', padding: space.xs },
  brand: {
    backgroundColor: color.surface, // white tile, NO border (W4 spec)
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});

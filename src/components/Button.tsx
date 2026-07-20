import React from 'react';
import { Text, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { color, type as t, space, radius, spring, MIN_TAP_TARGET } from '../theme/tokens';
import { Icon } from '../icons/Icon';
import { IconName } from '../icons/iconMap';

type Variant = 'primary' | 'secondary';

/**
 * Primary/secondary button. Press interaction: scale ~.97 spring in, spring back
 * on release (§9.4 "card press / tap"). Transform-only, interruptible, honors
 * reduced motion via Reanimated defaults.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  bg,
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: IconName;
  bg?: string; // optional background override (e.g. Aura blue CTA)
  style?: StyleProp<ViewStyle>;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const isPrimary = variant === 'primary';
  const fg = isPrimary ? color.actionPrimaryText : color.actionPrimary;

  return (
    <Animated.View style={[animStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => (scale.value = withSpring(0.97, spring.snappy))}
        onPressOut={() => (scale.value = withSpring(1, spring.snappy))}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[styles.base, isPrimary ? styles.primary : styles.secondary, bg ? { backgroundColor: bg } : null]}
      >
        {icon && <Icon name={icon} size={16} color={fg} />}
        <Text style={[t.body16Medium, { color: fg }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

// CashKaro DS primary button (Figma 79:21506): bg #ff6d1d, radius lg (12),
// height 52, px 40, Outfit Medium 16, white text.
const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.lg,
    paddingHorizontal: space.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
  },
  primary: { backgroundColor: color.actionPrimary },
  secondary: { backgroundColor: color.surface, borderWidth: 1, borderColor: color.actionPrimary },
});

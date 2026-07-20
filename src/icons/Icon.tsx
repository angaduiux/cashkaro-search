import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import { ICON, IconName, FA_FONT_FAMILY, FaStyle } from './iconMap';
import { color as tokenColor } from '../theme/tokens';

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  /** Override the mapped FA style (e.g. 'light' for a thinner stroke weight). */
  weight?: FaStyle;
  style?: StyleProp<TextStyle>;
};

/**
 * Renders a Font Awesome 6 Pro glyph (bundled .otf) as a text glyph. All icons
 * in the app go through here so the iconMap stays the single source of truth.
 */
export function Icon({ name, size = 16, color = tokenColor.textPrimary, weight, style }: Props) {
  const def = ICON[name];
  return (
    <Text
      allowFontScaling={false}
      style={[
        {
          fontFamily: FA_FONT_FAMILY[weight ?? def.style],
          fontSize: size,
          lineHeight: size * 1.0,
          color,
        },
        style,
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      {def.glyph}
    </Text>
  );
}

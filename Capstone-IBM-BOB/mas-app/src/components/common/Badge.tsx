// src/components/common/Badge.tsx
import React from 'react';
import { View, ViewStyle, TextStyle } from 'react-native';
import { ThemedText } from './ThemedText';
import { useTheme } from '../../theme/ThemeContext';

interface BadgeProps {
  label: string;
  color?: string;
  textColor?: string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const BadgeChip = React.memo(function BadgeChip({
  label,
  color,
  textColor,
  size = 'md',
  style,
}: BadgeProps) {
  const { theme } = useTheme();

  const bg = color ?? theme.colors.surfaceAlt;
  const fg = textColor ?? theme.colors.textSecondary;
  const py = size === 'sm' ? 2 : 4;
  const px = size === 'sm' ? 6 : 10;
  const fontSize = size === 'sm' ? theme.font.size.xs : theme.font.size.sm;

  return (
    <View
      style={[
        {
          backgroundColor: bg + '22',
          borderColor: bg,
          borderWidth: 1,
          borderRadius: theme.radius.full,
          paddingVertical: py,
          paddingHorizontal: px,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <ThemedText
        style={{ fontSize, fontWeight: theme.font.weight.semibold, color: color ?? fg }}
      >
        {label}
      </ThemedText>
    </View>
  );
});

// src/components/common/ThemedText.tsx
import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface ThemedTextProps {
  children: React.ReactNode;
  variant?: 'hero' | 'title' | 'subtitle' | 'body' | 'caption' | 'label';
  color?: string;
  bold?: boolean;
  semibold?: boolean;
  muted?: boolean;
  center?: boolean;
  style?: TextStyle;
  numberOfLines?: number;
  accessibilityLabel?: string;
}

export const ThemedText = React.memo(function ThemedText({
  children,
  variant = 'body',
  color,
  bold,
  semibold,
  muted,
  center,
  style,
  numberOfLines,
  accessibilityLabel,
}: ThemedTextProps) {
  const { theme } = useTheme();

  const variantStyle: TextStyle = {
    hero:     { fontSize: theme.font.size.hero, fontWeight: theme.font.weight.bold,     lineHeight: theme.font.size.hero * 1.2 },
    title:    { fontSize: theme.font.size.xxl,  fontWeight: theme.font.weight.bold,     lineHeight: theme.font.size.xxl * 1.3  },
    subtitle: { fontSize: theme.font.size.xl,   fontWeight: theme.font.weight.semibold, lineHeight: theme.font.size.xl * 1.4   },
    body:     { fontSize: theme.font.size.md,   fontWeight: theme.font.weight.regular,  lineHeight: theme.font.size.md * 1.6   },
    caption:  { fontSize: theme.font.size.sm,   fontWeight: theme.font.weight.regular,  lineHeight: theme.font.size.sm * 1.5   },
    label:    { fontSize: theme.font.size.xs,   fontWeight: theme.font.weight.medium,   lineHeight: theme.font.size.xs * 1.4   },
  }[variant];

  return (
    <Text
      style={[
        variantStyle,
        { color: color ?? (muted ? theme.colors.textMuted : theme.colors.textPrimary) },
        bold     && { fontWeight: theme.font.weight.bold },
        semibold && { fontWeight: theme.font.weight.semibold },
        center   && { textAlign: 'center' },
        style,
      ]}
      numberOfLines={numberOfLines}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </Text>
  );
});

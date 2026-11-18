// src/components/common/Card.tsx
import React from 'react';
import { View, ViewStyle, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  elevated?: boolean;
}

export const Card = React.memo(function Card({
  children,
  style,
  onPress,
  padding = 'md',
  elevated = false,
}: CardProps) {
  const { theme } = useTheme();

  const paddingMap = {
    none: 0,
    sm:   theme.spacing.sm,
    md:   theme.spacing.md,
    lg:   theme.spacing.lg,
  };

  const containerStyle: ViewStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: paddingMap[padding],
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...(elevated ? theme.shadow.md : {}),
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          containerStyle,
          pressed && { opacity: 0.85 },
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[containerStyle, style]}>{children}</View>;
});

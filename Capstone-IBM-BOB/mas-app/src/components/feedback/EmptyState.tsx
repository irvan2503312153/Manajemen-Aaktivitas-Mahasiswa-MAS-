// src/components/feedback/EmptyState.tsx
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../common/ThemedText';
import { useTheme } from '../../theme/ThemeContext';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  style?: ViewStyle;
}

export function EmptyState({ icon, title, subtitle, style }: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing.xl,
          gap: theme.spacing.sm,
        },
        style,
      ]}
    >
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing.sm,
        }}
      >
        <Ionicons name={icon} size={36} color={theme.colors.textMuted} />
      </View>
      <ThemedText variant="subtitle" center bold style={{ color: theme.colors.textSecondary }}>
        {title}
      </ThemedText>
      {subtitle && (
        <ThemedText variant="body" center muted>
          {subtitle}
        </ThemedText>
      )}
    </View>
  );
}

// src/components/common/FormField.tsx
// Label + input + pesan error yang konsisten

import React from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  ViewStyle,
  Pressable,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { ThemedText } from './ThemedText';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  style?: ViewStyle;
  required?: boolean;
}

export const FormField = React.memo(function FormField({
  label,
  error,
  style,
  required,
  ...inputProps
}: FormFieldProps) {
  const { theme } = useTheme();

  return (
    <View style={[{ marginBottom: theme.spacing.md }, style]}>
      <ThemedText
        variant="label"
        semibold
        style={{ marginBottom: theme.spacing.xs, color: theme.colors.textSecondary }}
      >
        {label}{required && <ThemedText style={{ color: theme.colors.danger }}> *</ThemedText>}
      </ThemedText>
      <TextInput
        style={{
          backgroundColor: theme.colors.surfaceAlt,
          borderWidth: 1,
          borderColor: error ? theme.colors.danger : theme.colors.border,
          borderRadius: theme.radius.md,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm + 2,
          fontSize: theme.font.size.md,
          color: theme.colors.textPrimary,
          minHeight: 44,
        }}
        placeholderTextColor={theme.colors.textMuted}
        {...inputProps}
      />
      {error ? (
        <ThemedText variant="caption" style={{ color: theme.colors.danger, marginTop: 4 }}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
});

interface SelectFieldProps {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
  error?: string;
  required?: boolean;
}

export const SelectField = React.memo(function SelectField({
  label,
  value,
  options,
  onChange,
  error,
  required,
}: SelectFieldProps) {
  const { theme } = useTheme();

  return (
    <View style={{ marginBottom: theme.spacing.md }}>
      <ThemedText
        variant="label"
        semibold
        style={{ marginBottom: theme.spacing.xs, color: theme.colors.textSecondary }}
      >
        {label}{required && <ThemedText style={{ color: theme.colors.danger }}> *</ThemedText>}
      </ThemedText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              style={({ pressed }) => ({
                paddingVertical: theme.spacing.xs,
                paddingHorizontal: theme.spacing.sm,
                borderRadius: theme.radius.full,
                borderWidth: 1.5,
                borderColor: active ? theme.colors.primary : theme.colors.border,
                backgroundColor: active ? theme.colors.primary + '15' : theme.colors.surfaceAlt,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <ThemedText
                style={{
                  fontSize: theme.font.size.sm,
                  fontWeight: active ? theme.font.weight.semibold : theme.font.weight.regular,
                  color: active ? theme.colors.primary : theme.colors.textSecondary,
                }}
              >
                {opt.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <ThemedText variant="caption" style={{ color: theme.colors.danger, marginTop: 4 }}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
});

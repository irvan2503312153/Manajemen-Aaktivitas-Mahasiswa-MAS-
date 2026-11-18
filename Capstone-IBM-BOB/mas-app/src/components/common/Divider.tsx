// src/components/common/Divider.tsx
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface DividerProps {
  style?: ViewStyle;
  vertical?: boolean;
}

export const Divider = React.memo(function Divider({ style, vertical }: DividerProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.border,
          ...(vertical
            ? { width: 1, alignSelf: 'stretch' }
            : { height: 1, width: '100%' }),
        },
        style,
      ]}
    />
  );
});

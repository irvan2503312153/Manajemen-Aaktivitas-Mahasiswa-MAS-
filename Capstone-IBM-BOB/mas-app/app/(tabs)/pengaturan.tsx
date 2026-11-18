// app/(tabs)/pengaturan.tsx  —  Tab Pengaturan & Profil (Fase 5)

import React from 'react';
import { ScreenContainer } from '../../src/components/layout/ScreenContainer';
import { ThemedText } from '../../src/components/common/ThemedText';
import { useTheme } from '../../src/theme/ThemeContext';
import { View } from 'react-native';
import { SettingsScreen } from '../../src/components/settings/SettingsScreen';

export default function PengaturanTab() {
  const { theme } = useTheme();

  return (
    <ScreenContainer>
      <View style={{ paddingTop: theme.spacing.lg, marginBottom: theme.spacing.lg }}>
        <ThemedText variant="title" bold>
          Pengaturan
        </ThemedText>
        <ThemedText variant="body" muted>
          Profil, tampilan & manajemen data
        </ThemedText>
      </View>
      <SettingsScreen />
    </ScreenContainer>
  );
}

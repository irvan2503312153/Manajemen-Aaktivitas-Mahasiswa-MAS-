// src/components/layout/ScreenContainer.tsx
// Container responsif: konten terpusat di desktop, full-width di mobile
//
// Perbaikan Tahap 1 (scroll fix):
//  - innerStyle: flex:1 → flexGrow:1 agar ScrollView bisa mengembang melewati viewport
//  - paddingBottom: pakai useSafeAreaInsets().bottom + tinggi bottom tab bar + extra padding
//    sehingga konten tidak tersembunyi di balik tab bar di semua device
//  - bounces: true (iOS) / overScrollMode: 'auto' (Android) untuk feel native
//  - keyboardShouldPersistTaps: 'handled' agar tap dismiss keyboard bekerja
//  - showsVerticalScrollIndicator: false (estetika, sudah ada sebelumnya)

import React from 'react';
import { ScrollView, View, ViewStyle, RefreshControl, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';

// Tinggi bottom tab bar (60px per definisi di _layout.tsx)
const BOTTOM_TAB_HEIGHT = 60;

interface ScreenContainerProps {
  children: React.ReactNode;
  /** true = dengan ScrollView (default). false = layout statis tanpa scroll */
  scrollable?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  noPadding?: boolean;
}

export function ScreenContainer({
  children,
  scrollable = true,
  refreshing = false,
  onRefresh,
  style,
  contentStyle,
  noPadding = false,
}: ScreenContainerProps) {
  const { theme } = useTheme();
  const { contentMaxWidth } = useResponsive();
  const insets = useSafeAreaInsets();

  // Padding bawah: insets (home-indicator / notch bawah) + tab bar + sedikit napas
  // Di web, insets.bottom = 0 dan tab bar tidak menimpa konten, cukup spacing biasa
  const bottomPad =
    Platform.OS === 'web'
      ? theme.spacing.xxl
      : insets.bottom + BOTTOM_TAB_HEIGHT + theme.spacing.lg;

  const outerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
  };

  // PENTING: flexGrow:1, BUKAN flex:1
  // flex:1 di contentContainerStyle memaksa ScrollView hanya setinggi viewport → tidak bisa scroll
  // flexGrow:1 membiarkan konten tumbuh bebas melampaui viewport → scroll bekerja normal
  const innerStyle: ViewStyle = {
    flexGrow: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: contentMaxWidth,
    paddingHorizontal: noPadding ? 0 : theme.spacing.md,
    paddingBottom: bottomPad,
  };

  if (!scrollable) {
    return (
      <SafeAreaView style={[outerStyle, style]} edges={['bottom']}>
        <View
          style={[
            {
              flex: 1,
              alignSelf: 'center',
              width: '100%',
              maxWidth: contentMaxWidth,
              paddingHorizontal: noPadding ? 0 : theme.spacing.md,
            },
            contentStyle,
          ]}
        >
          {children}
        </View>
      </SafeAreaView>
    );
  }

  return (
    // edges=['top'] agar header tidak tertutup status bar
    <SafeAreaView style={[outerStyle, style]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[innerStyle, contentStyle]}
        showsVerticalScrollIndicator={false}
        // Scroll feel native
        bounces={Platform.OS !== 'web'}
        overScrollMode="auto"
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

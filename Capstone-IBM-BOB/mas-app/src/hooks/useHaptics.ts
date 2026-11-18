// src/hooks/useHaptics.ts
// Wrapper haptic feedback dengan fallback graceful di web

import { Platform } from 'react-native';

// Lazy-import agar tidak crash di web
let Haptics: typeof import('expo-haptics') | null = null;
if (Platform.OS !== 'web') {
  Haptics = require('expo-haptics');
}

export function useHaptics() {
  const impact = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!Haptics) return;
    const styleMap = {
      light:  Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy:  Haptics.ImpactFeedbackStyle.Heavy,
    };
    Haptics.impactAsync(styleMap[style]).catch(() => {});
  };

  const notification = (type: 'success' | 'warning' | 'error' = 'success') => {
    if (!Haptics) return;
    const typeMap = {
      success: Haptics.NotificationFeedbackType.Success,
      warning: Haptics.NotificationFeedbackType.Warning,
      error:   Haptics.NotificationFeedbackType.Error,
    };
    Haptics.notificationAsync(typeMap[type]).catch(() => {});
  };

  const selection = () => {
    if (!Haptics) return;
    Haptics.selectionAsync().catch(() => {});
  };

  return { impact, notification, selection };
}

// src/components/feedback/Snackbar.tsx
// Toast/Snackbar ringan — muncul dari bawah, otomatis hilang.
// Gunakan hook useSnackbar() untuk memunculkannya dari mana saja.
// Web-safe: tidak ada shadow native yang crash.

import React, { useEffect, useRef, createContext, useContext, useState, useCallback } from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../common/ThemedText';
import { useTheme } from '../../theme/ThemeContext';
import { AnimatedPressable } from '../common/AnimatedPressable';

// ─── Tipe ───────────────────────────────────────────────────────────────────
export type SnackbarType = 'info' | 'success' | 'warning' | 'error';

export interface SnackbarOptions {
  message: string;
  type?: SnackbarType;
  duration?: number;        // ms, default 3500
  actionLabel?: string;
  onAction?: () => void;
}

interface SnackbarContextValue {
  show: (opts: SnackbarOptions) => void;
  hide: () => void;
}

const SnackbarContext = createContext<SnackbarContextValue>({
  show: () => {},
  hide: () => {},
});

// ─── Provider ───────────────────────────────────────────────────────────────
export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [current, setCurrent] = useState<SnackbarOptions | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);

  const dismiss = useCallback(() => {
    opacity.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(80, { duration: 220, easing: Easing.in(Easing.cubic) },
      () => { runOnJS(setCurrent)(null); }
    );
  }, [opacity, translateY]);

  const show = useCallback((opts: SnackbarOptions) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrent(opts);
    translateY.value = 80;
    opacity.value = 0;
    translateY.value = withSpring(0, { stiffness: 300, damping: 24 });
    opacity.value = withTiming(1, { duration: 220 });
    const dur = opts.duration ?? 3500;
    timerRef.current = setTimeout(dismiss, dur);
  }, [translateY, opacity, dismiss]);

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    dismiss();
  }, [dismiss]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const typeConfig: Record<SnackbarType, { color: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = {
    info:    { color: theme.colors.primary,   icon: 'information-circle' },
    success: { color: theme.colors.success,   icon: 'checkmark-circle' },
    warning: { color: theme.colors.warning,   icon: 'warning' },
    error:   { color: theme.colors.danger,    icon: 'close-circle' },
  };

  const cfg = current ? typeConfig[current.type ?? 'info'] : typeConfig.info;

  // Bottom: safe area + tab bar approx + 8
  const bottomOffset = insets.bottom + (Platform.OS !== 'web' ? 68 : 16);

  return (
    <SnackbarContext.Provider value={{ show, hide }}>
      {children}
      {current && (
        <Animated.View
          style={[
            styles.snackbar,
            animStyle,
            {
              bottom: bottomOffset,
              backgroundColor: theme.colors.surface,
              borderColor: cfg.color + '40',
              borderLeftColor: cfg.color,
            },
          ]}
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
        >
          <Ionicons name={cfg.icon} size={20} color={cfg.color} style={{ flexShrink: 0 }} />
          <ThemedText
            variant="body"
            style={{ flex: 1, fontSize: 14, color: theme.colors.textPrimary }}
            numberOfLines={2}
          >
            {current.message}
          </ThemedText>
          {current.actionLabel && current.onAction && (
            <AnimatedPressable
              onPress={() => { current.onAction?.(); hide(); }}
              haptic="light"
              style={{ marginLeft: 4 }}
            >
              <ThemedText
                style={{ fontSize: 13, color: cfg.color, fontWeight: '700' }}
              >
                {current.actionLabel}
              </ThemedText>
            </AnimatedPressable>
          )}
        </Animated.View>
      )}
    </SnackbarContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useSnackbar() {
  return useContext(SnackbarContext);
}

const styles = StyleSheet.create({
  snackbar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    zIndex: 9999,
    // Shadow web-safe
    ...(Platform.OS !== 'web'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
        }
      : {}),
  },
});

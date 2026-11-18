// src/components/home/QuickActions.tsx
// Tombol aksi cepat di Beranda dengan animated spring scale

import React, { useRef, useCallback } from 'react';
import { View, Pressable, Animated } from 'react-native';
import { nativeDriver } from '../../utils/animationDriver';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../theme/ThemeContext';
import { ThemedText } from '../common/ThemedText';

interface QuickAction {
  id: string;
  label: string;
  hint: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  href: string;
}

// ─── Single animated action button ───────────────────────────────────────────
interface ActionButtonProps {
  action: QuickAction;
  onPress: (href: string) => void;
}

function ActionButton({ action, onPress }: ActionButtonProps) {
  const { theme } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.92,
      useNativeDriver: nativeDriver,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: nativeDriver,
      speed: 30,
      bounciness: 8,
    }).start();
  }, [scale]);

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale }] }}>
      <Pressable
        onPress={() => onPress(action.href)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          alignItems: 'center',
          gap: 6,
          paddingVertical: theme.spacing.sm + 2,
          paddingHorizontal: theme.spacing.xs,
          borderRadius: theme.radius.md,
          backgroundColor: action.color + '12',
          borderWidth: 1,
          borderColor: action.color + '30',
        }}
        accessibilityRole="button"
        accessibilityLabel={action.label}
        accessibilityHint={action.hint}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: theme.radius.full,
            backgroundColor: action.color + '22',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={action.icon} size={18} color={action.color} />
        </View>
        <ThemedText
          style={{
            fontSize: theme.font.size.xs,
            color: action.color,
            fontWeight: theme.font.weight.semibold,
            textAlign: 'center',
          }}
          numberOfLines={2}
        >
          {action.label}
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
}

// ─── QuickActions grid ────────────────────────────────────────────────────────
export function QuickActions() {
  const { theme } = useTheme();
  const router = useRouter();

  const actions: QuickAction[] = [
    {
      id: 'task',
      label: 'Tambah Tugas',
      hint: 'Navigasi ke halaman Aktivitas untuk menambah tugas baru',
      icon: 'add-circle-outline',
      color: theme.colors.primary,
      href: '/aktivitas',
    },
    {
      id: 'focus',
      label: 'Mulai Fokus',
      hint: 'Navigasi ke halaman Aktivitas untuk memulai sesi Pomodoro',
      icon: 'timer-outline',
      color: theme.colors.focus,
      href: '/aktivitas',
    },
    {
      id: 'finance',
      label: 'Catat Pengeluaran',
      hint: 'Navigasi ke halaman Keuangan untuk mencatat transaksi baru',
      icon: 'wallet-outline',
      color: theme.colors.success,
      href: '/keuangan',
    },
    {
      id: 'schedule',
      label: 'Lihat Jadwal',
      hint: 'Navigasi ke halaman Aktivitas untuk melihat jadwal kuliah',
      icon: 'calendar-outline',
      color: theme.colors.secondary,
      href: '/aktivitas',
    },
  ];

  const handlePress = useCallback(
    (href: string) => router.push(href as any),
    [router]
  );

  return (
    <View
      style={{
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.lg,
      }}
    >
      {actions.map((action) => (
        <ActionButton key={action.id} action={action} onPress={handlePress} />
      ))}
    </View>
  );
}

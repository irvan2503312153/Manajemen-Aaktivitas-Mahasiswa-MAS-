// app/(tabs)/_layout.tsx
// Navigasi tab (mobile: bottom tabs) / sidebar (desktop: drawer kiri)

import React from 'react';
import { View, Pressable, ViewStyle, Platform } from 'react-native';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/ThemeContext';
import { useResponsive } from '../../src/hooks/useResponsive';
import { ThemedText } from '../../src/components/common/ThemedText';

// ─── Definisi tab ────────────────────────────────────────────────────────────
const TABS = [
  {
    name: 'index',
    label: 'Beranda',
    icon: 'home-outline' as const,
    iconActive: 'home' as const,
    href: '/',
  },
  {
    name: 'aktivitas',
    label: 'Aktivitas',
    icon: 'calendar-outline' as const,
    iconActive: 'calendar' as const,
    href: '/aktivitas',
  },
  {
    name: 'keuangan',
    label: 'Keuangan',
    icon: 'wallet-outline' as const,
    iconActive: 'wallet' as const,
    href: '/keuangan',
  },
  {
    name: 'insight',
    label: 'Insight',
    icon: 'bar-chart-outline' as const,
    iconActive: 'bar-chart' as const,
    href: '/insight',
  },
  {
    name: 'pengaturan',
    label: 'Pengaturan',
    icon: 'settings-outline' as const,
    iconActive: 'settings' as const,
    href: '/pengaturan',
  },
] as const;

// ─── Sidebar Desktop ──────────────────────────────────────────────────────────
function DesktopSidebar() {
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        width: 220,
        backgroundColor: theme.colors.surface,
        borderRightWidth: 1,
        borderRightColor: theme.colors.border,
        paddingTop: insets.top + theme.spacing.lg,
        paddingBottom: insets.bottom + theme.spacing.lg,
        paddingHorizontal: theme.spacing.md,
      }}
    >
      {/* Logo / Brand */}
      <View style={{ marginBottom: theme.spacing.xl, paddingHorizontal: theme.spacing.sm }}>
        <ThemedText variant="title" bold style={{ color: theme.colors.primary }}>
          MAS
        </ThemedText>
        <ThemedText variant="caption" muted>
          Manajemen Aktivitas Mahasiswa
        </ThemedText>
      </View>

      {/* Nav Items */}
      {TABS.map((tab) => {
        const isActive =
          tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
        return (
          <Pressable
            key={tab.name}
            onPress={() => router.push(tab.href as any)}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            style={({ pressed }) => [
              {
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.spacing.sm,
                paddingVertical: theme.spacing.sm + 2,
                paddingHorizontal: theme.spacing.sm,
                borderRadius: theme.radius.md,
                marginBottom: theme.spacing.xs,
                backgroundColor: isActive
                  ? theme.colors.primary + '18'
                  : pressed
                  ? theme.colors.surfaceAlt
                  : 'transparent',
              },
            ]}
          >
            <Ionicons
              name={isActive ? tab.iconActive : tab.icon}
              size={22}
              color={isActive ? theme.colors.primary : theme.colors.textSecondary}
            />
            <ThemedText
              style={{
                fontSize: theme.font.size.md,
                fontWeight: isActive
                  ? theme.font.weight.semibold
                  : theme.font.weight.regular,
                color: isActive ? theme.colors.primary : theme.colors.textSecondary,
              }}
            >
              {tab.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Layout utama ─────────────────────────────────────────────────────────────
export default function TabsLayout() {
  const { theme } = useTheme();
  const { isDesktop } = useResponsive();

  if (isDesktop) {
    // Desktop: sidebar kiri + konten kanan
    return (
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: theme.colors.background }}>
        <DesktopSidebar />
        <View style={{ flex: 1 }}>
          <Tabs
            screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}
          >
            {TABS.map((tab) => (
              <Tabs.Screen key={tab.name} name={tab.name} />
            ))}
          </Tabs>
        </View>
      </View>
    );
  }

  // Mobile: bottom tab bar
  return (
    <Tabs
      screenOptions={({ route }) => {
        const tab = TABS.find((t) => t.name === route.name);
        return {
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.colors.tabBar,
            borderTopColor: theme.colors.tabBarBorder,
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
          },
          tabBarActiveTintColor: theme.colors.tabIconActive,
          tabBarInactiveTintColor: theme.colors.tabIcon,
          tabBarLabel: tab?.label ?? '',
          tabBarLabelStyle: {
            fontSize: theme.font.size.xs,
            fontWeight: theme.font.weight.medium,
          },
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? (tab?.iconActive ?? 'home') : (tab?.icon ?? 'home-outline')}
              size={24}
              color={color as string}
            />
          ),
        };
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} />
      ))}
    </Tabs>
  );
}

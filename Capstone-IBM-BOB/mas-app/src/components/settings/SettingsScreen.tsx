// src/components/settings/SettingsScreen.tsx
// Halaman pengaturan & profil lengkap

import React from 'react';
import { View, Switch, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { ThemedText } from '../common/ThemedText';
import { Card } from '../common/Card';
import { useProfileStore } from '../../store/profileStore';
import { useTaskStore } from '../../store/taskStore';
import { useScheduleStore } from '../../store/scheduleStore';
import { useFinanceStore } from '../../store/financeStore';
import { useFocusStore } from '../../store/focusStore';
import { AppTheme } from '../../types/profile.types';

// ─── Baris pengaturan tunggal ────────────────────────────────────────────────
interface SettingRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor?: string;
  label: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  dangerous?: boolean;
}

function SettingRow({
  icon,
  iconColor,
  label,
  subtitle,
  right,
  onPress,
  dangerous,
}: SettingRowProps) {
  const { theme } = useTheme();
  const color = dangerous ? theme.colors.danger : (iconColor ?? theme.colors.primary);

  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        paddingVertical: theme.spacing.sm + 2,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: theme.radius.md,
          backgroundColor: color + '18',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText
          style={{
            fontSize: theme.font.size.md,
            color: dangerous ? theme.colors.danger : theme.colors.textPrimary,
            fontWeight: theme.font.weight.medium,
          }}
        >
          {label}
        </ThemedText>
        {subtitle ? (
          <ThemedText variant="caption" muted>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {right ?? (
        onPress ? (
          <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
        ) : null
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        accessibilityRole="button"
      >
        {content}
      </Pressable>
    );
  }
  return content;
}

// ─── Section wrapper ─────────────────────────────────────────────────────────
function SettingSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  return (
    <View style={{ marginBottom: theme.spacing.lg }}>
      <ThemedText
        style={{
          fontSize: theme.font.size.sm,
          color: theme.colors.textMuted,
          fontWeight: theme.font.weight.semibold,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
          marginBottom: theme.spacing.xs,
          paddingHorizontal: theme.spacing.xs,
        }}
      >
        {title}
      </ThemedText>
      <Card padding="none">
        <View style={{ paddingHorizontal: theme.spacing.md }}>
          {children}
        </View>
      </Card>
    </View>
  );
}

// ─── Divider tipis ───────────────────────────────────────────────────────────
function RowDivider() {
  const { theme } = useTheme();
  return (
    <View
      style={{
        height: 1,
        backgroundColor: theme.colors.border,
        marginLeft: 36 + theme.spacing.md,
      }}
    />
  );
}

// ─── Komponen utama ──────────────────────────────────────────────────────────
export function SettingsScreen() {
  const { theme, themePreference, setThemePreference } = useTheme();
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const resetProfile = useProfileStore((s) => s.resetProfile);

  const loadProfileSeed = useProfileStore((s) => s.loadSeedData);
  const loadTaskSeed    = useTaskStore((s) => s.loadSeedData);
  const loadScheduleSeed = useScheduleStore((s) => s.loadSeedData);
  const loadFinanceSeed = useFinanceStore((s) => s.loadSeedData);

  const resetTasks    = useTaskStore((s) => s.resetTasks);
  const resetSchedule = useScheduleStore((s) => s.resetSchedule);
  const resetFinance  = useFinanceStore((s) => s.resetFinance);
  const resetFocus    = useFocusStore((s) => s.resetFocus);

  const themeOptions: { label: string; value: AppTheme }[] = [
    { label: 'Terang', value: 'terang' },
    { label: 'Gelap', value: 'gelap' },
    { label: 'Ikuti Sistem', value: 'sistem' },
  ];

  const handleLoadSeed = () => {
    Alert.alert(
      'Muat Data Contoh',
      'Ini akan menambahkan data demo ke semua fitur. Lanjutkan?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Muat',
          onPress: () => {
            loadProfileSeed();
            loadTaskSeed();
            loadScheduleSeed();
            loadFinanceSeed();
          },
        },
      ]
    );
  };

  const handleResetAll = () => {
    Alert.alert(
      'Reset Semua Data',
      'Semua data akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetProfile();
            resetTasks();
            resetSchedule();
            resetFinance();
            resetFocus();
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Profil card */}
      <Card
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.md,
          marginBottom: theme.spacing.xl,
        }}
        elevated
      >
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: theme.radius.full,
            backgroundColor: theme.colors.primary + '20',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="person" size={32} color={theme.colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText variant="subtitle" bold>
            {profile.name}
          </ThemedText>
          <ThemedText variant="caption" muted>
            Level {profile.level} · {profile.xp} XP
          </ThemedText>
          <ThemedText variant="caption" muted>
            Streak {profile.currentStreak} hari
          </ThemedText>
        </View>
      </Card>

      {/* Tampilan */}
      <SettingSection title="Tampilan">
        <View style={{ paddingVertical: theme.spacing.sm }}>
          <ThemedText
            style={{
              fontSize: theme.font.size.sm,
              color: theme.colors.textSecondary,
              marginBottom: theme.spacing.sm,
            }}
          >
            Tema Aplikasi
          </ThemedText>
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            {themeOptions.map((opt) => {
              const isActive = themePreference === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => {
                    setThemePreference(opt.value);
                    updateProfile({ theme: opt.value });
                  }}
                  style={({ pressed }) => ({
                    flex: 1,
                    paddingVertical: theme.spacing.sm,
                    paddingHorizontal: theme.spacing.xs,
                    borderRadius: theme.radius.md,
                    backgroundColor: isActive
                      ? theme.colors.primary
                      : theme.colors.surfaceAlt,
                    borderWidth: 1,
                    borderColor: isActive
                      ? theme.colors.primary
                      : theme.colors.border,
                    alignItems: 'center',
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <ThemedText
                    style={{
                      fontSize: theme.font.size.sm,
                      color: isActive ? '#fff' : theme.colors.textSecondary,
                      fontWeight: isActive
                        ? theme.font.weight.semibold
                        : theme.font.weight.regular,
                    }}
                  >
                    {opt.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>
      </SettingSection>

      {/* Notifikasi */}
      <SettingSection title="Notifikasi">
        <SettingRow
          icon="notifications-outline"
          label="Aktifkan Notifikasi"
          subtitle="Pengingat tugas dan kelas"
          right={
            <Switch
              value={profile.notificationsEnabled}
              onValueChange={(v) => updateProfile({ notificationsEnabled: v })}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary + '80',
              }}
              thumbColor={
                profile.notificationsEnabled
                  ? theme.colors.primary
                  : theme.colors.textMuted
              }
            />
          }
        />
      </SettingSection>

      {/* Data */}
      <SettingSection title="Data">
        <SettingRow
          icon="download-outline"
          iconColor={theme.colors.info}
          label="Muat Data Contoh"
          subtitle="Isi aplikasi dengan data demo"
          onPress={handleLoadSeed}
        />
        <RowDivider />
        <SettingRow
          icon="trash-outline"
          label="Reset Semua Data"
          subtitle="Hapus semua data secara permanen"
          onPress={handleResetAll}
          dangerous
        />
      </SettingSection>

      {/* Tentang */}
      <SettingSection title="Tentang">
        <SettingRow
          icon="information-circle-outline"
          iconColor={theme.colors.textSecondary}
          label="Versi Aplikasi"
          subtitle="MAS v1.0.0 · Fase 6 (Final)"
        />
        <RowDivider />
        <SettingRow
          icon="school-outline"
          iconColor={theme.colors.textSecondary}
          label="Manajemen Aktivitas Mahasiswa"
          subtitle="Kelola studi, keuangan & produktivitasmu"
        />
      </SettingSection>
    </View>
  );
}

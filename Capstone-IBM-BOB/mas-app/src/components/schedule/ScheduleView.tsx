// src/components/schedule/ScheduleView.tsx
// Tampilan jadwal kuliah: tab hari (mobile) atau grid mingguan (desktop)

import React, { useState } from 'react';
import { View, Pressable, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ClassSession, DayOfWeek } from '../../types/schedule.types';
import { useTheme } from '../../theme/ThemeContext';
import { ThemedText } from '../common/ThemedText';
import { Card } from '../common/Card';
import { EmptyState } from '../feedback/EmptyState';
import { useResponsive } from '../../hooks/useResponsive';

interface ScheduleViewProps {
  sessions: ClassSession[];
  onAddSession?: () => void;
  onDeleteSession?: (id: string) => void;
}

const DAYS: DayOfWeek[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

/** Hari ini dalam format DayOfWeek */
function todayDay(): DayOfWeek {
  const idx = new Date().getDay(); // 0=Minggu
  const map: DayOfWeek[] = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  return map[idx];
}

function ClassSessionCard({
  session,
  onDelete,
}: {
  session: ClassSession;
  onDelete?: () => void;
}) {
  const { theme } = useTheme();
  const color = session.color ?? theme.colors.primary;

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: theme.spacing.xs,
        overflow: 'hidden',
      }}
    >
      {/* Garis warna */}
      <View style={{ width: 4, backgroundColor: color }} />
      <View style={{ flex: 1, padding: theme.spacing.sm, gap: 2 }}>
        <ThemedText variant="body" semibold numberOfLines={1}>
          {session.mataKuliah}
        </ThemedText>
        <View style={{ flexDirection: 'row', gap: theme.spacing.md, flexWrap: 'wrap' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Ionicons name="time-outline" size={12} color={theme.colors.textMuted} />
            <ThemedText variant="caption" muted>
              {session.startTime} – {session.endTime}
            </ThemedText>
          </View>
          {session.ruangan && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Ionicons name="location-outline" size={12} color={theme.colors.textMuted} />
              <ThemedText variant="caption" muted>{session.ruangan}</ThemedText>
            </View>
          )}
          {session.dosen && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Ionicons name="person-outline" size={12} color={theme.colors.textMuted} />
              <ThemedText variant="caption" muted>{session.dosen}</ThemedText>
            </View>
          )}
        </View>
      </View>
      {onDelete && (
        <Pressable
          onPress={onDelete}
          hitSlop={8}
          accessibilityLabel="Hapus kelas"
          style={{ padding: theme.spacing.sm, justifyContent: 'center' }}
        >
          <Ionicons name="trash-outline" size={16} color={theme.colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

export function ScheduleView({ sessions, onAddSession, onDeleteSession }: ScheduleViewProps) {
  const { theme } = useTheme();
  const { isDesktop } = useResponsive();
  const today = todayDay();
  const [activeDay, setActiveDay] = useState<DayOfWeek>(today);

  if (isDesktop) {
    // Grid semua hari sekaligus
    return (
      <View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
          {DAYS.map((day) => {
            const daySessions = sessions
              .filter((s) => s.day === day)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));
            const isToday = day === today;

            return (
              <View
                key={day}
                style={{
                  flex: 1,
                  minWidth: 120,
                  backgroundColor: isToday ? theme.colors.primary + '08' : theme.colors.surfaceAlt,
                  borderRadius: theme.radius.md,
                  borderWidth: 1,
                  borderColor: isToday ? theme.colors.primary + '40' : theme.colors.border,
                  padding: theme.spacing.sm,
                }}
              >
                <ThemedText
                  variant="label"
                  semibold
                  style={{
                    color: isToday ? theme.colors.primary : theme.colors.textSecondary,
                    marginBottom: theme.spacing.xs,
                  }}
                >
                  {day}
                </ThemedText>
                {daySessions.length === 0 ? (
                  <ThemedText variant="caption" muted style={{ fontStyle: 'italic' }}>
                    Tidak ada kelas
                  </ThemedText>
                ) : (
                  daySessions.map((s) => (
                    <ClassSessionCard
                      key={s.id}
                      session={s}
                      onDelete={onDeleteSession ? () => onDeleteSession(s.id) : undefined}
                    />
                  ))
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  // Mobile: tab per hari
  const activeSessions = sessions
    .filter((s) => s.day === activeDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <View>
      {/* Tab hari */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: theme.spacing.sm }}
        contentContainerStyle={{ gap: theme.spacing.xs, paddingRight: theme.spacing.md }}
      >
        {DAYS.map((day) => {
          const active = day === activeDay;
          const isT = day === today;
          const count = sessions.filter((s) => s.day === day).length;
          return (
            <Pressable
              key={day}
              onPress={() => setActiveDay(day)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 14,
                borderRadius: theme.radius.full,
                backgroundColor: active ? theme.colors.primary : isT ? theme.colors.primary + '15' : theme.colors.surfaceAlt,
                borderWidth: 1,
                borderColor: active ? theme.colors.primary : isT ? theme.colors.primary + '40' : theme.colors.border,
              }}
            >
              <ThemedText
                style={{
                  fontSize: theme.font.size.sm,
                  fontWeight: active ? theme.font.weight.semibold : theme.font.weight.regular,
                  color: active ? '#fff' : isT ? theme.colors.primary : theme.colors.textSecondary,
                }}
              >
                {day.substring(0, 3)}{count > 0 ? ` (${count})` : ''}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Sesi hari aktif */}
      {activeSessions.length === 0 ? (
        <View style={{ paddingVertical: theme.spacing.md, alignItems: 'center', gap: 8 }}>
          <Ionicons name="calendar-outline" size={36} color={theme.colors.textMuted} />
          <ThemedText variant="caption" muted>Tidak ada kelas {activeDay}</ThemedText>
        </View>
      ) : (
        activeSessions.map((s) => (
          <ClassSessionCard
            key={s.id}
            session={s}
            onDelete={onDeleteSession ? () => onDeleteSession(s.id) : undefined}
          />
        ))
      )}
    </View>
  );
}

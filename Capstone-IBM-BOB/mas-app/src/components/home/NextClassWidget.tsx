// src/components/home/NextClassWidget.tsx
// Widget yang menampilkan sesi kelas berikutnya hari ini atau besok

import React, { useMemo, useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { nativeDriver } from '../../utils/animationDriver';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useScheduleStore } from '../../store/scheduleStore';
import { ThemedText } from '../common/ThemedText';
import { Card } from '../common/Card';
import { ClassSession, DayOfWeek } from '../../types/schedule.types';

const DAY_NAMES: DayOfWeek[] = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

interface NextClass {
  session: ClassSession;
  label: string; // "Hari ini" | "Besok"
}

function findNextClass(sessions: ClassSession[]): NextClass | null {
  if (sessions.length === 0) return null;
  const now = new Date();
  const todayIdx = now.getDay(); // 0=Minggu
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Cari sesi hari ini yang belum dimulai
  const todayName = DAY_NAMES[todayIdx];
  const todaySessions = sessions
    .filter((s) => s.day === todayName)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  const nextToday = todaySessions.find(
    (s) => timeToMinutes(s.startTime) > currentMinutes
  );
  if (nextToday) return { session: nextToday, label: 'Hari ini' };

  // Cari sesi besok
  const tomorrowIdx = (todayIdx + 1) % 7;
  const tomorrowName = DAY_NAMES[tomorrowIdx];
  const tomorrowSessions = sessions
    .filter((s) => s.day === tomorrowName)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  if (tomorrowSessions.length > 0) {
    return { session: tomorrowSessions[0], label: 'Besok' };
  }

  // Cari hari-hari berikutnya dalam minggu ini
  for (let offset = 2; offset <= 6; offset++) {
    const targetIdx = (todayIdx + offset) % 7;
    const targetName = DAY_NAMES[targetIdx];
    const targetSessions = sessions
      .filter((s) => s.day === targetName)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    if (targetSessions.length > 0) {
      return { session: targetSessions[0], label: targetName };
    }
  }

  return null;
}

export function NextClassWidget() {
  const { theme } = useTheme();
  const sessions = useScheduleStore((s) => s.sessions);
  const next = useMemo(() => findNextClass(sessions), [sessions]);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 350,
      useNativeDriver: nativeDriver,
    }).start();
  }, [opacity]);

  if (!next) {
    return (
      <Animated.View style={{ opacity }}>
        <Card style={{ marginBottom: theme.spacing.lg }}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}
            accessibilityLabel="Tidak ada jadwal kelas terdaftar"
          >
            <Ionicons name="school-outline" size={22} color={theme.colors.textMuted} />
            <ThemedText variant="body" muted>
              Tidak ada jadwal kelas terdaftar
            </ThemedText>
          </View>
        </Card>
      </Animated.View>
    );
  }

  const { session, label } = next;
  const accentColor = session.color ?? theme.colors.primary;
  const a11yLabel = `Kelas ${session.mataKuliah}, ${label}, ${session.startTime} sampai ${session.endTime}${session.ruangan ? `, di ${session.ruangan}` : ''}`;

  return (
    <Animated.View style={{ opacity }}>
    <Card
      style={{
        marginBottom: theme.spacing.lg,
        borderLeftWidth: 4,
        borderLeftColor: accentColor,
      }}
      elevated
    >
      <View
        style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm }}
        accessibilityLabel={a11yLabel}
        accessible
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: theme.radius.md,
            backgroundColor: accentColor + '20',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="school" size={20} color={accentColor} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, marginBottom: 2 }}>
            <ThemedText
              style={{
                fontSize: theme.font.size.xs,
                color: accentColor,
                fontWeight: theme.font.weight.semibold,
              }}
            >
              {label.toUpperCase()}
            </ThemedText>
          </View>
          <ThemedText variant="body" semibold numberOfLines={1}>
            {session.mataKuliah}
          </ThemedText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginTop: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="time-outline" size={13} color={theme.colors.textMuted} />
              <ThemedText variant="caption" muted>
                {session.startTime} – {session.endTime}
              </ThemedText>
            </View>
            {session.ruangan ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="location-outline" size={13} color={theme.colors.textMuted} />
                <ThemedText variant="caption" muted numberOfLines={1}>
                  {session.ruangan}
                </ThemedText>
              </View>
            ) : null}
          </View>
          {session.dosen ? (
            <ThemedText variant="caption" muted style={{ marginTop: 2 }}>
              {session.dosen}
            </ThemedText>
          ) : null}
        </View>
      </View>
    </Card>
    </Animated.View>
  );
}

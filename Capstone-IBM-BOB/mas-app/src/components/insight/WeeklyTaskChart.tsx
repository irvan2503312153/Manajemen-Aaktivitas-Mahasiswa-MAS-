// src/components/insight/WeeklyTaskChart.tsx
// Bar chart sederhana menggunakan View (tanpa library eksternal)
// Menampilkan jumlah tugas selesai per hari dalam 7 hari terakhir
// Fase 6: staggered grow animation per bar

import React, { useMemo, useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
// height adalah layout property — harus useNativeDriver: false (jsDriver) di semua platform
import { jsDriver } from '../../utils/animationDriver';
import { useTheme } from '../../theme/ThemeContext';
import { ThemedText } from '../common/ThemedText';
import { Card } from '../common/Card';
import { Task } from '../../types/task.types';

interface WeeklyTaskChartProps {
  tasks: Task[];
}

const SHORT_DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function getLast7Days(): { date: string; label: string }[] {
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    result.push({
      date: d.toISOString().split('T')[0],
      label: SHORT_DAYS[d.getDay()],
    });
  }
  return result;
}

// ─── Animated bar column ──────────────────────────────────────────────────────
interface BarColumnProps {
  count: number;
  maxCount: number;
  isToday: boolean;
  label: string;
  delay: number;
}

function BarColumn({ count, maxCount, isToday, label, delay }: BarColumnProps) {
  const { theme } = useTheme();
  const fillPercent = count === 0 ? 0.04 : count / maxCount;
  const targetHeight = Math.max(4, fillPercent * 72);
  const barColor = count > 0 ? theme.colors.success : theme.colors.border;

  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.spring(heightAnim, {
        toValue: targetHeight,
        useNativeDriver: jsDriver,
        speed: 14,
        bounciness: 3,
      }).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [heightAnim, targetHeight, delay]);

  return (
    <View
      style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}
      accessibilityLabel={`${label}: ${count} tugas selesai`}
    >
      {count > 0 && (
        <ThemedText
          style={{
            fontSize: 10,
            color: theme.colors.success,
            fontWeight: theme.font.weight.semibold,
            marginBottom: 2,
          }}
        >
          {count}
        </ThemedText>
      )}
      <Animated.View
        style={{
          width: '100%',
          height: heightAnim,
          backgroundColor: barColor,
          borderRadius: 4,
          opacity: isToday ? 1 : 0.75,
          borderWidth: isToday ? 2 : 0,
          borderColor: isToday ? theme.colors.primary : 'transparent',
        }}
      />
    </View>
  );
}

// ─── Main chart component ─────────────────────────────────────────────────────
export function WeeklyTaskChart({ tasks }: WeeklyTaskChartProps) {
  const { theme } = useTheme();

  const { days, maxCount } = useMemo(() => {
    const last7 = getLast7Days();
    const days = last7.map(({ date, label }) => {
      const count = tasks.filter((t) => {
        if (t.status !== 'selesai' || !t.completedAt) return false;
        return t.completedAt.split('T')[0] === date;
      }).length;
      return { date, label, count };
    });
    const maxCount = Math.max(1, ...days.map((d) => d.count));
    return { days, maxCount };
  }, [tasks]);

  const totalThisWeek = days.reduce((s, d) => s + d.count, 0);
  const todayDate = new Date().toISOString().split('T')[0];

  return (
    <Card
      style={{ marginBottom: theme.spacing.lg }}
      elevated
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.md,
        }}
      >
        <ThemedText variant="subtitle" semibold>
          Tugas Selesai
        </ThemedText>
        <View
          style={{
            backgroundColor: theme.colors.success + '15',
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: 4,
            borderRadius: theme.radius.full,
          }}
        >
          <ThemedText
            style={{
              color: theme.colors.success,
              fontSize: theme.font.size.sm,
              fontWeight: theme.font.weight.semibold,
            }}
            accessibilityLabel={`${totalThisWeek} tugas selesai minggu ini`}
          >
            {totalThisWeek} minggu ini
          </ThemedText>
        </View>
      </View>

      {/* Animated chart bars */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          height: 80,
          gap: 4,
        }}
        accessibilityLabel="Grafik tugas selesai 7 hari terakhir"
        accessible
      >
        {days.map((day, idx) => (
          <BarColumn
            key={day.date}
            count={day.count}
            maxCount={maxCount}
            isToday={day.date === todayDate}
            label={day.label}
            delay={idx * 60}
          />
        ))}
      </View>

      {/* Day labels */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: theme.spacing.xs,
        }}
      >
        {days.map((day) => {
          const isToday = day.date === todayDate;
          return (
            <ThemedText
              key={day.date}
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: 10,
                color: isToday ? theme.colors.primary : theme.colors.textMuted,
                fontWeight: isToday
                  ? theme.font.weight.bold
                  : theme.font.weight.regular,
              }}
            >
              {day.label}
            </ThemedText>
          );
        })}
      </View>
    </Card>
  );
}

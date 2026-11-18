// src/components/focus/FocusTimer.tsx
// Timer Pomodoro: lingkaran animasi SVG + kontrol
// Tahap 2: pulse animasi saat running (Reanimated)

import React, { useCallback, useEffect } from 'react';
import { View, Pressable, Platform, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { FocusPhase } from '../../types/focus.types';
import { FocusSettings } from '../../types/focus.types';
import { useTheme } from '../../theme/ThemeContext';
import { ThemedText } from '../common/ThemedText';
import { formatTimer } from '../../utils/formatters';
import { TimerState } from '../../features/focus/usePomodoroTimer';
import { Task } from '../../types/task.types';
import { useReduceMotion } from '../../hooks/useReduceMotion';

interface FocusTimerProps {
  phase: FocusPhase;
  timerState: TimerState;
  secondsLeft: number;
  totalSeconds: number;
  progress: number;      // 0–1
  sessionCount: number;
  settings: FocusSettings;
  linkedTask?: Task;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  onReset: () => void;
  onClose?: () => void;
}

const RADIUS = 90;
const STROKE = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SIZE = (RADIUS + STROKE) * 2 + 4;

function phaseLabel(phase: FocusPhase): string {
  if (phase === 'fokus') return 'Fokus';
  if (phase === 'istirahat_panjang') return 'Istirahat Panjang';
  return 'Istirahat Pendek';
}

function phaseColor(phase: FocusPhase, theme: any): string {
  if (phase === 'fokus') return theme.colors.focus;
  if (phase === 'istirahat_panjang') return theme.colors.success;
  return theme.colors.info;
}

export function FocusTimer({
  phase,
  timerState,
  secondsLeft,
  totalSeconds,
  progress,
  sessionCount,
  settings,
  linkedTask,
  onStart,
  onPause,
  onResume,
  onSkip,
  onReset,
  onClose,
}: FocusTimerProps) {
  const { theme } = useTheme();
  const color = phaseColor(phase, theme);
  const reduceMotion = useReduceMotion();

  // strokeDashoffset: 0 = penuh, CIRCUMFERENCE = kosong
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const isRunning = timerState === 'running';
  const isIdle    = timerState === 'idle';
  const isDone    = timerState === 'finished';

  // Pulse animasi pada lingkaran saat timer sedang berjalan
  const pulseScale = useSharedValue(1);
  useEffect(() => {
    if (isRunning && !reduceMotion) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 800, easing: Easing.out(Easing.quad) }),
          withTiming(1.0,  { duration: 800, easing: Easing.in(Easing.quad) })
        ),
        -1,
        false
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 300 });
    }
  }, [isRunning, reduceMotion, pulseScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Tombol tutup */}
      {onClose && (
        <Pressable onPress={onClose} style={styles.closeBtn} accessibilityLabel="Tutup mode fokus">
          <Ionicons name="chevron-down" size={28} color={theme.colors.textSecondary} />
        </Pressable>
      )}

      {/* Label fase */}
      <ThemedText
        variant="subtitle"
        semibold
        center
        style={{ color, marginBottom: theme.spacing.sm }}
      >
        {phaseLabel(phase)}
      </ThemedText>

      {/* Lingkaran timer dengan pulse */}
      <Animated.View style={[{ alignItems: 'center', marginBottom: theme.spacing.lg }, pulseStyle]}>
        <Svg width={SIZE} height={SIZE}>
          {/* Track */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={theme.colors.border}
            strokeWidth={STROKE}
            fill="none"
          />
          {/* Progress */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={color}
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            // Rotasi agar mulai dari atas
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </Svg>

        {/* Teks di tengah lingkaran */}
        <View style={[styles.timerText, { width: SIZE, height: SIZE }]}>
          <ThemedText
            style={{ fontSize: 52, fontWeight: '700', color: theme.colors.textPrimary, letterSpacing: -1 }}
          >
            {formatTimer(secondsLeft)}
          </ThemedText>
          {sessionCount > 0 && (
            <ThemedText variant="caption" muted>
              Sesi #{sessionCount + 1}
            </ThemedText>
          )}
        </View>
      </Animated.View>

      {/* Tugas yang ditautkan */}
      {linkedTask && (
        <View
          style={{
            backgroundColor: theme.colors.surfaceAlt,
            borderRadius: theme.radius.md,
            padding: theme.spacing.sm,
            marginHorizontal: theme.spacing.lg,
            marginBottom: theme.spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
          }}
        >
          <Ionicons name="document-text-outline" size={16} color={color} />
          <ThemedText variant="caption" numberOfLines={1} style={{ flex: 1 }}>
            {linkedTask.title}
          </ThemedText>
        </View>
      )}

      {/* Kontrol */}
      <View style={styles.controls}>
        {/* Reset */}
        <Pressable
          onPress={onReset}
          accessibilityLabel="Reset timer"
          style={({ pressed }) => [styles.controlBtn, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Ionicons name="refresh" size={24} color={theme.colors.textSecondary} />
        </Pressable>

        {/* Play / Pause — tombol utama */}
        <Pressable
          onPress={isIdle || isDone ? onStart : isRunning ? onPause : onResume}
          accessibilityLabel={isRunning ? 'Jeda' : 'Mulai'}
          style={({ pressed }) => [
            styles.playBtn,
            {
              backgroundColor: color,
              transform: [{ scale: pressed ? 0.94 : 1 }],
            },
          ]}
        >
          <Ionicons
            name={isRunning ? 'pause' : 'play'}
            size={34}
            color="#fff"
            style={{ marginLeft: isRunning ? 0 : 3 }}
          />
        </Pressable>

        {/* Skip */}
        <Pressable
          onPress={onSkip}
          accessibilityLabel="Lewati fase"
          style={({ pressed }) => [styles.controlBtn, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Ionicons name="play-skip-forward" size={24} color={theme.colors.textSecondary} />
        </Pressable>
      </View>

      {/* Indikator sesi (Pomodoro dots) */}
      <View style={styles.dots}>
        {Array.from({ length: settings.sessionsBeforeLongBreak }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor:
                  i < sessionCount % settings.sessionsBeforeLongBreak
                    ? color
                    : theme.colors.border,
              },
            ]}
          />
        ))}
      </View>

      {/* Pengaturan cepat */}
      <View style={[styles.settingsRow, { borderTopColor: theme.colors.border }]}>
        <ThemedText variant="caption" muted>
          🍅 {settings.workMinutes}m · ☕ {settings.shortBreakMinutes}m · 🛌 {settings.longBreakMinutes}m
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    padding: 8,
  },
  timerText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginBottom: 24,
  },
  controlBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  settingsRow: {
    borderTopWidth: 1,
    paddingTop: 16,
    paddingHorizontal: 24,
  },
});

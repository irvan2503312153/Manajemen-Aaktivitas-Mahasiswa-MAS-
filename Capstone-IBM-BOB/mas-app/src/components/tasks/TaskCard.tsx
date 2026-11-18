// src/components/tasks/TaskCard.tsx
// Kartu tugas: swipe kanan = selesai, swipe kiri = hapus (mobile)
// Tombol aksi sebagai SIBLING (bukan child) Pressable kartu di web

import React, { useCallback } from 'react';
import {
  View,
  Pressable,
  Platform,
  StyleSheet,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../../types/task.types';
import { useTheme } from '../../theme/ThemeContext';
import { ThemedText } from '../common/ThemedText';
import { BadgeChip } from '../common/Badge';
import { formatDeadlineLabel } from '../../utils/formatters';
import { isOverdue } from '../../features/tasks/taskUtils';

interface TaskCardProps {
  task: Task;
  onComplete: () => void;
  onDelete: () => void;
  onPress: () => void;
}

const SWIPE_THRESHOLD = 80;

export const TaskCard = React.memo(function TaskCard({
  task,
  onComplete,
  onDelete,
  onPress,
}: TaskCardProps) {
  const { theme } = useTheme();
  const translateX = useSharedValue(0);
  const cardOpacity = useSharedValue(1);

  const dl = formatDeadlineLabel(task.deadline);
  const overdue = isOverdue(task);
  const isDone = task.status === 'selesai';

  const triggerComplete = useCallback(() => {
    if (!isDone) onComplete();
  }, [isDone, onComplete]);

  const triggerDelete = useCallback(() => {
    onDelete();
  }, [onDelete]);

  // ── Gesture (mobile only) ─────────────────────────────────────
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      if (isDone) return;
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (isDone) {
        translateX.value = withSpring(0);
        return;
      }
      if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(400, { duration: 250 }, () => {
          runOnJS(triggerComplete)();
        });
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-400, { duration: 250 }, () => {
          runOnJS(triggerDelete)();
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedCard = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: cardOpacity.value,
  }));

  const hintRight = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.max(0, translateX.value / SWIPE_THRESHOLD)),
  }));
  const hintLeft = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.max(0, -translateX.value / SWIPE_THRESHOLD)),
  }));

  const priorityColor = theme.colors.priority[task.priority as keyof typeof theme.colors.priority];
  const deadlineColor = overdue
    ? theme.colors.danger
    : dl.isUrgent
    ? theme.colors.warning
    : theme.colors.textMuted;

  // ── Konten kartu (tanpa tombol aksi di dalamnya) ───────────────
  const cardBody = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
          opacity: isDone ? 0.6 : 1,
          flex: 1,
        },
      ]}
    >
      {/* Garis prioritas kiri */}
      <View style={[styles.priorityBar, { backgroundColor: priorityColor }]} />

      <View style={{ flex: 1, paddingVertical: theme.spacing.sm, paddingRight: theme.spacing.sm }}>
        {/* Judul */}
        <ThemedText
          variant="body"
          semibold
          numberOfLines={2}
          style={isDone ? { textDecorationLine: 'line-through', opacity: 0.7 } : {}}
        >
          {task.title}
        </ThemedText>

        {/* Mata kuliah + deadline */}
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons name="school-outline" size={12} color={theme.colors.textMuted} />
            <ThemedText variant="caption" muted numberOfLines={1}>
              {task.mataKuliah}
            </ThemedText>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={12} color={deadlineColor} />
            <ThemedText variant="caption" style={{ color: deadlineColor }}>
              {dl.label}
            </ThemedText>
          </View>
        </View>

        {/* Chips + pomodoro */}
        <View style={styles.chips}>
          <BadgeChip label={task.priority} color={priorityColor} size="sm" />
          <BadgeChip
            label={isDone ? 'Selesai' : task.status === 'proses' ? 'Proses' : 'Belum'}
            color={
              isDone ? theme.colors.success :
              task.status === 'proses' ? theme.colors.info :
              theme.colors.textMuted
            }
            size="sm"
          />
          {task.pomodoroCount > 0 && (
            <ThemedText variant="caption" muted>🍅 {task.pomodoroCount}</ThemedText>
          )}
        </View>
      </View>

      {isDone && (
        <View style={{ padding: theme.spacing.sm, justifyContent: 'center' }}>
          <Ionicons name="checkmark-circle" size={22} color={theme.colors.success} />
        </View>
      )}
    </View>
  );

  // ── WEB: row = [Pressable kartu] + [tombol aksi sebagai sibling] ──
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webRow, { marginBottom: theme.spacing.sm }]}>
        {/* Area klik kartu → edit (tidak ada button di dalamnya) */}
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`Edit tugas: ${task.title}`}
          style={{ flex: 1 }}
        >
          {cardBody}
        </Pressable>

        {/* Tombol aksi: SIBLING dari Pressable kartu, bukan child */}
        {!isDone && (
          <View style={styles.webActions}>
            <Pressable
              onPress={onComplete}
              accessibilityLabel="Selesaikan tugas"
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.webBtn,
                { backgroundColor: theme.colors.success + (pressed ? '44' : '18') },
              ]}
            >
              <Ionicons name="checkmark" size={18} color={theme.colors.success} />
            </Pressable>
            <Pressable
              onPress={onDelete}
              accessibilityLabel="Hapus tugas"
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.webBtn,
                { backgroundColor: theme.colors.danger + (pressed ? '44' : '18') },
              ]}
            >
              <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
            </Pressable>
          </View>
        )}
      </View>
    );
  }

  // ── MOBILE: swipe gesture ──────────────────────────────────────
  return (
    <View style={{ marginBottom: theme.spacing.sm }}>
      {/* Hint background */}
      <View style={[styles.hintContainer, { borderRadius: theme.radius.lg }]}>
        <Animated.View
          style={[styles.hintRight, hintRight, {
            backgroundColor: theme.colors.success + '30',
            borderRadius: theme.radius.lg,
          }]}
        >
          <Ionicons name="checkmark-circle" size={28} color={theme.colors.success} />
          <ThemedText variant="caption" style={{ color: theme.colors.success }}>Selesai</ThemedText>
        </Animated.View>
        <Animated.View
          style={[styles.hintLeft, hintLeft, {
            backgroundColor: theme.colors.danger + '30',
            borderRadius: theme.radius.lg,
          }]}
        >
          <ThemedText variant="caption" style={{ color: theme.colors.danger }}>Hapus</ThemedText>
          <Ionicons name="trash" size={28} color={theme.colors.danger} />
        </Animated.View>
      </View>

      {/* GestureDetector membungkus Animated.View (BUKAN sebaliknya) */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedCard}>
          {/* Mobile: Pressable kartu → edit, tidak ada tombol nested */}
          <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`Edit tugas: ${task.title}`}
          >
            {cardBody}
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderWidth: 1,
    overflow: 'hidden',
  },
  priorityBar: {
    width: 4,
  },
  meta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  chips: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  // Web-only
  webRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  webActions: {
    flexDirection: 'column',
    gap: 4,
  },
  webBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Mobile-only
  hintContainer: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  hintRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    gap: 8,
    height: '100%',
  },
  hintLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    gap: 8,
    height: '100%',
  },
});

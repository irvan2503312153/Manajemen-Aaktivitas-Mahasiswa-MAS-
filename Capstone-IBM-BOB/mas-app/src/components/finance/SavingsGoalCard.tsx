// src/components/finance/SavingsGoalCard.tsx
// Kartu target tabungan dengan progress ring dan tombol deposit

import React, { useState } from 'react';
import { View, Pressable, TextInput, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { SavingsGoal } from '../../types/finance.types';
import { useTheme } from '../../theme/ThemeContext';
import { ThemedText } from '../common/ThemedText';
import { formatRupiah, calcPercent, formatDate } from '../../utils/formatters';
import { parseRupiahInput } from '../../features/finance/financeUtils';

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onDeposit: (amount: number) => void;
  onDelete: () => void;
}

const RING_SIZE = 56;
const RING_STROKE = 6;
const RING_R = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRC = 2 * Math.PI * RING_R;

export const SavingsGoalCard = React.memo(function SavingsGoalCard({
  goal,
  onDeposit,
  onDelete,
}: SavingsGoalCardProps) {
  const { theme } = useTheme();
  const [depositing, setDepositing] = useState(false);
  const [depositRaw, setDepositRaw] = useState('');

  const percent   = calcPercent(goal.currentAmount, goal.targetAmount);
  const isDone    = goal.currentAmount >= goal.targetAmount;
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const offset    = RING_CIRC * (1 - percent / 100);

  const ringColor = isDone
    ? theme.colors.success
    : percent >= 75
    ? theme.colors.info
    : theme.colors.primary;

  function handleDeposit() {
    const amount = parseRupiahInput(depositRaw);
    if (amount > 0) {
      onDeposit(amount);
      setDepositing(false);
      setDepositRaw('');
    }
  }

  return (
    <View style={[styles.card, {
      backgroundColor: theme.colors.surface,
      borderColor: isDone ? theme.colors.success + '60' : theme.colors.border,
      borderRadius: theme.radius.lg,
    }]}>
      <View style={styles.header}>
        {/* Progress ring */}
        <View style={{ width: RING_SIZE, height: RING_SIZE }}>
          <Svg width={RING_SIZE} height={RING_SIZE}>
            <Circle
              cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_R}
              stroke={theme.colors.border} strokeWidth={RING_STROKE} fill="none"
            />
            <Circle
              cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_R}
              stroke={ringColor} strokeWidth={RING_STROKE} fill="none"
              strokeDasharray={`${RING_CIRC} ${RING_CIRC}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            />
          </Svg>
          {/* Persen di tengah ring */}
          <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
            <ThemedText style={{ fontSize: 10, fontWeight: '700', color: ringColor }}>
              {percent}%
            </ThemedText>
          </View>
        </View>

        {/* Info */}
        <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {goal.emoji && <ThemedText style={{ fontSize: 16 }}>{goal.emoji}</ThemedText>}
            <ThemedText variant="body" semibold numberOfLines={1} style={{ flex: 1 }}>
              {goal.title}
            </ThemedText>
            {isDone && <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />}
          </View>
          <ThemedText variant="caption" muted>
            {formatRupiah(goal.currentAmount)} / {formatRupiah(goal.targetAmount)}
          </ThemedText>
          {!isDone && (
            <ThemedText variant="caption" style={{ color: theme.colors.textSecondary }}>
              Kurang {formatRupiah(remaining)}
            </ThemedText>
          )}
          {goal.targetDate && (
            <ThemedText variant="caption" muted>
              Target: {formatDate(goal.targetDate)}
            </ThemedText>
          )}
        </View>

        {/* Tombol aksi */}
        <View style={{ gap: 4 }}>
          {!isDone && (
            <Pressable
              onPress={() => setDepositing(!depositing)}
              accessibilityLabel="Tambah tabungan"
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.actionBtn,
                { backgroundColor: theme.colors.primary + (pressed ? '40' : '15') },
              ]}
            >
              <Ionicons name="add" size={18} color={theme.colors.primary} />
            </Pressable>
          )}
          <Pressable
            onPress={onDelete}
            accessibilityLabel="Hapus target tabungan"
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: theme.colors.danger + (pressed ? '40' : '12') },
            ]}
          >
            <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
          </Pressable>
        </View>
      </View>

      {/* Input deposit */}
      {depositing && (
        <View style={[styles.depositRow, { borderTopColor: theme.colors.border }]}>
          <ThemedText variant="caption" muted style={{ marginRight: 4 }}>+ Rp</ThemedText>
          <TextInput
            value={depositRaw}
            onChangeText={(v) => {
              const digits = v.replace(/[^0-9]/g, '');
              setDepositRaw(digits ? parseInt(digits, 10).toLocaleString('id-ID') : '');
            }}
            keyboardType="numeric"
            placeholder="0"
            autoFocus
            style={{
              flex: 1,
              fontSize: theme.font.size.md,
              color: theme.colors.textPrimary,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.primary,
              paddingVertical: 2,
            }}
          />
          <Pressable
            onPress={handleDeposit}
            accessibilityLabel="Konfirmasi deposit"
            accessibilityRole="button"
            style={{ marginLeft: 8 }}
          >
            <Ionicons name="checkmark-circle" size={22} color={theme.colors.success} />
          </Pressable>
          <Pressable
            onPress={() => setDepositing(false)}
            accessibilityLabel="Batal"
            accessibilityRole="button"
            style={{ marginLeft: 4 }}
          >
            <Ionicons name="close-circle-outline" size={22} color={theme.colors.textMuted} />
          </Pressable>
        </View>
      )}

      {/* Progress bar linear */}
      <View style={[styles.track, { backgroundColor: theme.colors.border, marginTop: theme.spacing.sm }]}>
        <View style={[styles.fill, { backgroundColor: ringColor, width: `${percent}%` }]} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  depositRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});

// src/components/finance/SavingsGoalForm.tsx
// Form tambah target tabungan

import React, { useState } from 'react';
import { View, Pressable, Platform } from 'react-native';
import { SavingsGoal } from '../../types/finance.types';
import { useTheme } from '../../theme/ThemeContext';
import { ThemedText } from '../common/ThemedText';
import { FormField } from '../common/FormField';
import { parseRupiahInput } from '../../features/finance/financeUtils';
import { formatRupiah } from '../../utils/formatters';

interface SavingsGoalFormProps {
  onSubmit: (data: Omit<SavingsGoal, 'id' | 'createdAt' | 'currentAmount'>) => void;
  onCancel: () => void;
}

const EMOJI_OPTIONS = ['💻','📱','✈️','🎓','🏠','🎸','📚','💪','🌟','🎯'];

function todayStr(): string { return new Date().toISOString().split('T')[0]; }

export function SavingsGoalForm({ onSubmit, onCancel }: SavingsGoalFormProps) {
  const { theme } = useTheme();

  const [title,       setTitle]       = useState('');
  const [targetRaw,   setTargetRaw]   = useState('');
  const [targetDate,  setTargetDate]  = useState('');
  const [emoji,       setEmoji]       = useState('🎯');
  const [errors,      setErrors]      = useState<Record<string,string>>({});

  const targetAmount = parseRupiahInput(targetRaw);

  function handleAmountChange(raw: string) {
    const digits = raw.replace(/[^0-9]/g, '');
    setTargetRaw(digits ? parseInt(digits, 10).toLocaleString('id-ID') : '');
    setErrors((e) => ({ ...e, target: '' }));
  }

  function handleSubmit() {
    const e: Record<string,string> = {};
    if (!title.trim()) e.title = 'Nama target wajib diisi';
    if (targetAmount <= 0) e.target = 'Target harus lebih dari 0';
    if (Object.keys(e).length) { setErrors(e); return; }
    onSubmit({ title: title.trim(), targetAmount, targetDate: targetDate || undefined, emoji });
  }

  return (
    <View>
      {/* Emoji pilih */}
      <ThemedText variant="label" semibold style={{ marginBottom: theme.spacing.xs, color: theme.colors.textSecondary }}>
        Ikon
      </ThemedText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: theme.spacing.md }}>
        {EMOJI_OPTIONS.map((em) => (
          <Pressable
            key={em}
            onPress={() => setEmoji(em)}
            style={{
              width: 40, height: 40, borderRadius: theme.radius.md,
              backgroundColor: em === emoji ? theme.colors.primary + '20' : theme.colors.surfaceAlt,
              borderWidth: 1.5,
              borderColor: em === emoji ? theme.colors.primary : theme.colors.border,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ThemedText style={{ fontSize: 20 }}>{em}</ThemedText>
          </Pressable>
        ))}
      </View>

      <FormField
        label="Nama Target"
        required
        value={title}
        onChangeText={(v) => { setTitle(v); setErrors((e) => ({ ...e, title: '' })); }}
        placeholder="cth. Beli Laptop Baru"
        error={errors.title}
      />

      {/* Target nominal */}
      <View style={{ marginBottom: theme.spacing.md }}>
        <ThemedText variant="label" semibold style={{ marginBottom: theme.spacing.xs, color: theme.colors.textSecondary }}>
          Nominal Target <ThemedText style={{ color: theme.colors.danger }}>*</ThemedText>
        </ThemedText>
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: theme.colors.surfaceAlt,
          borderWidth: 1, borderColor: errors.target ? theme.colors.danger : theme.colors.border,
          borderRadius: theme.radius.md, paddingHorizontal: theme.spacing.md, minHeight: 44,
        }}>
          <ThemedText style={{ color: theme.colors.textMuted, marginRight: 4 }}>Rp</ThemedText>
          <FormField
            label="" value={targetRaw} onChangeText={handleAmountChange}
            placeholder="0" keyboardType="numeric"
            style={{ flex: 1, marginBottom: 0 }} error={undefined}
          />
        </View>
        {errors.target ? (
          <ThemedText variant="caption" style={{ color: theme.colors.danger, marginTop: 4 }}>{errors.target}</ThemedText>
        ) : targetAmount > 0 ? (
          <ThemedText variant="caption" muted style={{ marginTop: 4 }}>{formatRupiah(targetAmount)}</ThemedText>
        ) : null}
      </View>

      {/* Target tanggal */}
      {Platform.OS === 'web' ? (
        <View style={{ marginBottom: theme.spacing.md }}>
          <ThemedText variant="label" semibold style={{ marginBottom: theme.spacing.xs, color: theme.colors.textSecondary }}>
            Target Tanggal (opsional)
          </ThemedText>
          <input
            type="date"
            value={targetDate}
            min={todayStr()}
            onChange={(e) => setTargetDate(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: theme.radius.md,
              border: `1.5px solid ${theme.colors.border}`,
              backgroundColor: theme.colors.surfaceAlt, color: theme.colors.textPrimary,
              fontSize: 15, boxSizing: 'border-box', outline: 'none',
            } as React.CSSProperties}
          />
        </View>
      ) : (
        <FormField
          label="Target Tanggal (YYYY-MM-DD, opsional)"
          value={targetDate}
          onChangeText={setTargetDate}
          placeholder="YYYY-MM-DD"
        />
      )}

      <View style={{ flexDirection: 'row', gap: theme.spacing.sm, paddingBottom: theme.spacing.md }}>
        <Pressable onPress={onCancel} style={({ pressed }) => ({ flex: 1, paddingVertical: 12, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', opacity: pressed ? 0.7 : 1 })}>
          <ThemedText semibold style={{ color: theme.colors.textSecondary }}>Batal</ThemedText>
        </Pressable>
        <Pressable onPress={handleSubmit} accessibilityRole="button" style={({ pressed }) => ({ flex: 2, paddingVertical: 12, borderRadius: theme.radius.md, backgroundColor: theme.colors.primary, alignItems: 'center', opacity: pressed ? 0.8 : 1 })}>
          <ThemedText semibold style={{ color: '#fff' }}>Buat Target</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

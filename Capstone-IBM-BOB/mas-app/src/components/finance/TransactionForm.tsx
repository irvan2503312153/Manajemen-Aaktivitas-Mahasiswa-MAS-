// src/components/finance/TransactionForm.tsx
// Form catat pemasukan / pengeluaran

import React, { useState } from 'react';
import { View, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction, TransactionType, ExpenseCategory } from '../../types/finance.types';
import { useTheme } from '../../theme/ThemeContext';
import { ThemedText } from '../common/ThemedText';
import { FormField, SelectField } from '../common/FormField';
import { validateTransaction } from '../../utils/validators';
import { formatRupiah } from '../../utils/formatters';
import { CATEGORY_LABELS, ALL_CATEGORIES, parseRupiahInput } from '../../features/finance/financeUtils';
import { tokens } from '../../theme/tokens';

interface TransactionFormProps {
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const TYPE_OPTIONS = [
  { label: '+ Pemasukan', value: 'pemasukan' },
  { label: '- Pengeluaran', value: 'pengeluaran' },
];

/** Format "YYYY-MM-DD" dari Date */
function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function TransactionForm({ onSubmit, onCancel }: TransactionFormProps) {
  const { theme } = useTheme();

  const [type,        setType]        = useState<TransactionType>('pengeluaran');
  const [amountRaw,   setAmountRaw]   = useState('');
  const [description, setDescription] = useState('');
  const [category,    setCategory]    = useState<ExpenseCategory>('makan');
  const [date,        setDate]        = useState(todayStr());
  const [errors,      setErrors]      = useState<Record<string, string>>({});

  const amount = parseRupiahInput(amountRaw);

  // Format nominal saat diinput (pisahkan ribuan)
  function handleAmountChange(raw: string) {
    const digits = raw.replace(/[^0-9]/g, '');
    if (digits === '') { setAmountRaw(''); return; }
    const num = parseInt(digits, 10);
    setAmountRaw(num.toLocaleString('id-ID'));
    setErrors((e) => ({ ...e, amount: '' }));
  }

  function handleSubmit() {
    const data = { type, amount, description: description.trim(), category, date };
    const result = validateTransaction(data);
    if (!result.valid) { setErrors(result.errors); return; }
    onSubmit(data);
  }

  const catOptions = ALL_CATEGORIES.map((c) => ({ label: CATEGORY_LABELS[c], value: c }));

  return (
    <View>
      {/* Tipe: Pemasukan / Pengeluaran */}
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.md }}>
        {TYPE_OPTIONS.map((opt) => {
          const active = opt.value === type;
          const isIn   = opt.value === 'pemasukan';
          const color  = isIn ? theme.colors.success : theme.colors.danger;
          return (
            <Pressable
              key={opt.value}
              onPress={() => setType(opt.value as TransactionType)}
              style={({ pressed }) => ({
                flex: 1,
                paddingVertical: 10,
                borderRadius: theme.radius.md,
                borderWidth: 1.5,
                borderColor: active ? color : theme.colors.border,
                backgroundColor: active ? color + '15' : theme.colors.surfaceAlt,
                alignItems: 'center',
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <ThemedText style={{
                fontWeight: active ? theme.font.weight.bold : theme.font.weight.regular,
                color: active ? color : theme.colors.textSecondary,
                fontSize: theme.font.size.md,
              }}>
                {opt.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Nominal */}
      <View style={{ marginBottom: theme.spacing.md }}>
        <ThemedText variant="label" semibold style={{ marginBottom: theme.spacing.xs, color: theme.colors.textSecondary }}>
          Nominal <ThemedText style={{ color: theme.colors.danger }}>*</ThemedText>
        </ThemedText>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.surfaceAlt,
          borderWidth: 1,
          borderColor: errors.amount ? theme.colors.danger : theme.colors.border,
          borderRadius: theme.radius.md,
          paddingHorizontal: theme.spacing.md,
          minHeight: 44,
        }}>
          <ThemedText style={{ color: theme.colors.textMuted, marginRight: 4 }}>Rp</ThemedText>
          <FormField
            label=""
            value={amountRaw}
            onChangeText={handleAmountChange}
            placeholder="0"
            keyboardType="numeric"
            style={{ flex: 1, marginBottom: 0 }}
            error={undefined}
          />
        </View>
        {errors.amount ? (
          <ThemedText variant="caption" style={{ color: theme.colors.danger, marginTop: 4 }}>{errors.amount}</ThemedText>
        ) : amount > 0 ? (
          <ThemedText variant="caption" muted style={{ marginTop: 4 }}>{formatRupiah(amount)}</ThemedText>
        ) : null}
      </View>

      {/* Keterangan */}
      <FormField
        label="Keterangan"
        required
        value={description}
        onChangeText={(v) => { setDescription(v); setErrors((e) => ({ ...e, description: '' })); }}
        placeholder="cth. Makan siang di kantin"
        error={errors.description}
      />

      {/* Kategori */}
      <SelectField
        label="Kategori"
        required
        value={category}
        options={catOptions}
        onChange={(v) => setCategory(v as ExpenseCategory)}
        error={errors.category}
      />

      {/* Tanggal */}
      {Platform.OS === 'web' ? (
        <View style={{ marginBottom: theme.spacing.md }}>
          <ThemedText variant="label" semibold style={{ marginBottom: theme.spacing.xs, color: theme.colors.textSecondary }}>
            Tanggal <ThemedText style={{ color: theme.colors.danger }}>*</ThemedText>
          </ThemedText>
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setErrors((err) => ({ ...err, date: '' })); }}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: theme.radius.md,
              border: `1.5px solid ${errors.date ? theme.colors.danger : theme.colors.border}`,
              backgroundColor: theme.colors.surfaceAlt,
              color: theme.colors.textPrimary,
              fontSize: 15,
              boxSizing: 'border-box',
              outline: 'none',
            } as React.CSSProperties}
          />
        </View>
      ) : (
        <FormField
          label="Tanggal (YYYY-MM-DD)"
          required
          value={date}
          onChangeText={(v) => { setDate(v); setErrors((e) => ({ ...e, date: '' })); }}
          placeholder="YYYY-MM-DD"
          error={errors.date}
        />
      )}

      {/* Tombol */}
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm, paddingBottom: theme.spacing.md }}>
        <Pressable
          onPress={onCancel}
          style={({ pressed }) => ({
            flex: 1, paddingVertical: 12, borderRadius: theme.radius.md,
            borderWidth: 1, borderColor: theme.colors.border,
            alignItems: 'center', opacity: pressed ? 0.7 : 1,
          })}
        >
          <ThemedText semibold style={{ color: theme.colors.textSecondary }}>Batal</ThemedText>
        </Pressable>
        <Pressable
          onPress={handleSubmit}
          accessibilityRole="button"
          style={({ pressed }) => ({
            flex: 2, paddingVertical: 12, borderRadius: theme.radius.md,
            backgroundColor: type === 'pemasukan' ? theme.colors.success : theme.colors.secondary,
            alignItems: 'center', opacity: pressed ? 0.8 : 1,
          })}
        >
          <ThemedText semibold style={{ color: '#fff' }}>
            Catat {type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

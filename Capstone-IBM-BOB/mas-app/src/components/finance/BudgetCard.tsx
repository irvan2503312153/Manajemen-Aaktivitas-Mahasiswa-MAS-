// src/components/finance/BudgetCard.tsx
// Kartu budget per kategori dengan progress bar + indikator sisa

import React, { useState } from 'react';
import { View, Pressable, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExpenseCategory } from '../../types/finance.types';
import { useTheme } from '../../theme/ThemeContext';
import { ThemedText } from '../common/ThemedText';
import { formatRupiah } from '../../utils/formatters';
import { CATEGORY_LABELS, parseRupiahInput } from '../../features/finance/financeUtils';
import { tokens } from '../../theme/tokens';

interface BudgetCardProps {
  category: ExpenseCategory;
  limit: number;
  spent: number;
  percent: number;
  onUpdateLimit: (limit: number) => void;
}

const CATEGORY_ICONS: Record<ExpenseCategory, keyof typeof Ionicons.glyphMap> = {
  makan:     'restaurant-outline',
  transport: 'car-outline',
  kuliah:    'school-outline',
  hiburan:   'game-controller-outline',
  kos:       'home-outline',
  lainnya:   'ellipsis-horizontal-outline',
};

export const BudgetCard = React.memo(function BudgetCard({
  category,
  limit,
  spent,
  percent,
  onUpdateLimit,
}: BudgetCardProps) {
  const { theme } = useTheme();
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState('');

  const catColor = tokens.color.category[category];
  const remaining = Math.max(0, limit - spent);

  // Warna progress bar
  const barColor =
    percent >= 100 ? theme.colors.danger :
    percent >= 80  ? theme.colors.warning :
    theme.colors.success;

  function handleEditStart() {
    setInputVal(limit > 0 ? limit.toLocaleString('id-ID') : '');
    setEditing(true);
  }

  function handleEditSave() {
    const val = parseRupiahInput(inputVal);
    if (val > 0) onUpdateLimit(val);
    setEditing(false);
  }

  return (
    <View style={[styles.card, {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
    }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: catColor + '20' }]}>
          <Ionicons name={CATEGORY_ICONS[category]} size={18} color={catColor} />
        </View>
        <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
          <ThemedText variant="body" semibold>{CATEGORY_LABELS[category]}</ThemedText>
          <ThemedText variant="caption" muted>
            {formatRupiah(spent)} / {limit > 0 ? formatRupiah(limit) : '—'}
          </ThemedText>
        </View>
        {/* Edit tombol budget */}
        <Pressable
          onPress={handleEditStart}
          hitSlop={8}
          accessibilityLabel={`Atur budget ${CATEGORY_LABELS[category]}`}
          accessibilityRole="button"
        >
          <Ionicons name="pencil-outline" size={16} color={theme.colors.textMuted} />
        </Pressable>
      </View>

      {/* Input edit limit */}
      {editing && (
        <View style={[styles.editRow, { borderTopColor: theme.colors.border }]}>
          <ThemedText variant="caption" muted style={{ marginRight: 4 }}>Rp</ThemedText>
          <TextInput
            value={inputVal}
            onChangeText={(v) => {
              const digits = v.replace(/[^0-9]/g, '');
              setInputVal(digits ? parseInt(digits, 10).toLocaleString('id-ID') : '');
            }}
            keyboardType="numeric"
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
            onPress={handleEditSave}
            accessibilityLabel="Simpan budget"
            accessibilityRole="button"
            style={{ marginLeft: 8 }}
          >
            <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />
          </Pressable>
          <Pressable
            onPress={() => setEditing(false)}
            accessibilityLabel="Batal"
            accessibilityRole="button"
            style={{ marginLeft: 4 }}
          >
            <Ionicons name="close-circle-outline" size={22} color={theme.colors.textMuted} />
          </Pressable>
        </View>
      )}

      {/* Progress bar */}
      {limit > 0 && (
        <View style={{ marginTop: theme.spacing.sm }}>
          <View style={[styles.track, { backgroundColor: theme.colors.border }]}>
            <View
              style={[
                styles.fill,
                {
                  backgroundColor: barColor,
                  width: `${Math.min(100, percent)}%`,
                },
              ]}
            />
          </View>
          <View style={styles.legend}>
            <ThemedText variant="caption" style={{ color: barColor }}>
              {percent}% terpakai
            </ThemedText>
            <ThemedText variant="caption" muted>
              Sisa {formatRupiah(remaining)}
            </ThemedText>
          </View>
        </View>
      )}

      {limit === 0 && (
        <ThemedText variant="caption" muted style={{ marginTop: 4 }}>
          Ketuk ✏️ untuk atur budget
        </ThemedText>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
});

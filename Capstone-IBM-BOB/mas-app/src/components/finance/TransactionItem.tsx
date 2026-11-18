// src/components/finance/TransactionItem.tsx
// Baris transaksi — tombol hapus sebagai sibling (bukan nested button)

import React from 'react';
import { View, Pressable, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../../types/finance.types';
import { useTheme } from '../../theme/ThemeContext';
import { ThemedText } from '../common/ThemedText';
import { formatRupiah, formatDate } from '../../utils/formatters';
import { CATEGORY_LABELS } from '../../features/finance/financeUtils';
import { tokens } from '../../theme/tokens';

interface TransactionItemProps {
  transaction: Transaction;
  onDelete: () => void;
}

export const TransactionItem = React.memo(function TransactionItem({
  transaction: tx,
  onDelete,
}: TransactionItemProps) {
  const { theme } = useTheme();
  const isIn    = tx.type === 'pemasukan';
  const catColor = tokens.color.category[tx.category as keyof typeof tokens.color.category];
  const amtColor = isIn ? theme.colors.success : theme.colors.danger;

  const rowContent = (
    <View style={[styles.row, {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      flex: 1,
    }]}>
      {/* Ikon kategori */}
      <View style={[styles.iconBox, { backgroundColor: catColor + '20' }]}>
        <Ionicons
          name={isIn ? 'arrow-down' : 'arrow-up'}
          size={16}
          color={amtColor}
        />
      </View>

      {/* Info */}
      <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
        <ThemedText variant="body" semibold numberOfLines={1}>
          {tx.description}
        </ThemedText>
        <ThemedText variant="caption" muted>
          {CATEGORY_LABELS[tx.category]} · {formatDate(tx.date)}
        </ThemedText>
      </View>

      {/* Nominal */}
      <ThemedText semibold style={{ color: amtColor, fontSize: theme.font.size.md }}>
        {isIn ? '+' : '-'}{formatRupiah(tx.amount)}
      </ThemedText>
    </View>
  );

  // Web: tombol hapus sebagai sibling (hindari nested button)
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webWrapper, { marginBottom: theme.spacing.xs }]}>
        {rowContent}
        <Pressable
          onPress={onDelete}
          accessibilityLabel="Hapus transaksi"
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.deleteBtn,
            { backgroundColor: theme.colors.danger + (pressed ? '30' : '12') },
          ]}
        >
          <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
        </Pressable>
      </View>
    );
  }

  // Mobile: Pressable bungkus seluruh baris, hapus via long-press
  return (
    <Pressable
      onLongPress={onDelete}
      delayLongPress={500}
      accessibilityLabel={`${tx.description}, tekan lama untuk hapus`}
      style={{ marginBottom: theme.spacing.xs }}
    >
      {rowContent}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

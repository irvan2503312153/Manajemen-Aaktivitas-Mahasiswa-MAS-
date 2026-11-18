// src/components/home/FinanceSummaryCard.tsx
// Ringkasan saldo keuangan: saldo berjalan, pemasukan vs pengeluaran bulan ini

import React, { useMemo, useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { nativeDriver } from '../../utils/animationDriver';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useFinanceStore } from '../../store/financeStore';
import { ThemedText } from '../common/ThemedText';
import { Card } from '../common/Card';
import { formatCompact, formatRupiah } from '../../utils/formatters';

function getThisMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  return { start, end };
}

export function FinanceSummaryCard() {
  const { theme } = useTheme();
  const transactions = useFinanceStore((s) => s.transactions);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: nativeDriver,
    }).start();
  }, [opacity]);

  const { balance, income, expense } = useMemo(() => {
    const { start, end } = getThisMonthRange();

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((tx) => {
      if (tx.date >= start && tx.date <= end) {
        if (tx.type === 'pemasukan') totalIncome += tx.amount;
        else totalExpense += tx.amount;
      }
    });

    // Saldo keseluruhan (semua waktu)
    const allBalance = transactions.reduce(
      (acc, tx) => acc + (tx.type === 'pemasukan' ? tx.amount : -tx.amount),
      0
    );

    return { balance: allBalance, income: totalIncome, expense: totalExpense };
  }, [transactions]);

  return (
    <Animated.View
      style={{ opacity }}
      accessibilityLabel="Ringkasan keuangan bulanan"
      accessible
    >
    <Card
      style={{
        marginBottom: theme.spacing.lg,
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
      }}
      elevated
    >
      {/* Saldo utama */}
      <View style={{ marginBottom: theme.spacing.md }}>
        <ThemedText
          style={{
            fontSize: theme.font.size.sm,
            color: 'rgba(255,255,255,0.75)',
            fontWeight: theme.font.weight.medium,
            marginBottom: 4,
          }}
        >
          Saldo Tersedia
        </ThemedText>
        <ThemedText
          style={{
            fontSize: theme.font.size.xxl,
            color: '#FFFFFF',
            fontWeight: theme.font.weight.bold,
            letterSpacing: -0.5,
          }}
        >
          {formatRupiah(balance)}
        </ThemedText>
      </View>

      {/* Divider */}
      <View
        style={{
          height: 1,
          backgroundColor: 'rgba(255,255,255,0.2)',
          marginBottom: theme.spacing.md,
        }}
      />

      {/* Pemasukan & Pengeluaran bulan ini */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: theme.radius.full,
              backgroundColor: 'rgba(255,255,255,0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="arrow-down" size={14} color="#fff" />
          </View>
          <View>
            <ThemedText style={{ fontSize: theme.font.size.xs, color: 'rgba(255,255,255,0.7)' }}>
              Pemasukan
            </ThemedText>
            <ThemedText style={{ fontSize: theme.font.size.sm, color: '#fff', fontWeight: theme.font.weight.semibold }}>
              +{formatCompact(income)}
            </ThemedText>
          </View>
        </View>

        <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: theme.radius.full,
              backgroundColor: 'rgba(255,255,255,0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="arrow-up" size={14} color="#fff" />
          </View>
          <View>
            <ThemedText style={{ fontSize: theme.font.size.xs, color: 'rgba(255,255,255,0.7)' }}>
              Pengeluaran
            </ThemedText>
            <ThemedText style={{ fontSize: theme.font.size.sm, color: '#fff', fontWeight: theme.font.weight.semibold }}>
              -{formatCompact(expense)}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Label bulan ini */}
      <ThemedText
        style={{
          fontSize: theme.font.size.xs,
          color: 'rgba(255,255,255,0.55)',
          marginTop: theme.spacing.sm,
          textAlign: 'right',
        }}
      >
        Bulan ini
      </ThemedText>
    </Card>
    </Animated.View>
  );
}

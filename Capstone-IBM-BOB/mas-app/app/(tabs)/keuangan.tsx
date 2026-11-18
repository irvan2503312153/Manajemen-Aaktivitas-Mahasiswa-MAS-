// app/(tabs)/keuangan.tsx
// Fitur Keuangan: transaksi, budget, target tabungan, grafik

import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Pressable,
  FlatList,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '../../src/components/common/ThemedText';
import { Card } from '../../src/components/common/Card';
import { EmptyState } from '../../src/components/feedback/EmptyState';
import { AppModal } from '../../src/components/common/Modal';
import { TransactionForm } from '../../src/components/finance/TransactionForm';
import { TransactionItem } from '../../src/components/finance/TransactionItem';
import { BudgetCard } from '../../src/components/finance/BudgetCard';
import { SavingsGoalCard } from '../../src/components/finance/SavingsGoalCard';
import { SavingsGoalForm } from '../../src/components/finance/SavingsGoalForm';
import { BarChart, DonutChart } from '../../src/components/charts/SpendingChart';

import { useTheme } from '../../src/theme/ThemeContext';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useHaptics } from '../../src/hooks/useHaptics';

import { useFinanceStore } from '../../src/store/financeStore';
import { useProfileStore } from '../../src/store/profileStore';

import { Transaction, BudgetItem, SavingsGoal, ExpenseCategory } from '../../src/types/finance.types';

import {
  monthlySummary,
  budgetRemaining,
  spendingByCategory,
  weeklyExpenseTrend,
  generateFinanceTips,
  ALL_CATEGORIES,
  CATEGORY_LABELS,
} from '../../src/features/finance/financeUtils';

import { formatRupiah, formatDate } from '../../src/utils/formatters';
import { tokens } from '../../src/theme/tokens';

// ─── Tipe ────────────────────────────────────────────────────────────────────
type MainTab = 'ringkasan' | 'transaksi' | 'budget' | 'tabungan';
type ModalType = 'add_tx' | 'add_goal' | null;

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Tab bar internal ─────────────────────────────────────────────────────────
function TabBar({ active, onChange }: { active: MainTab; onChange: (t: MainTab) => void }) {
  const { theme } = useTheme();
  const TABS: { key: MainTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'ringkasan',  label: 'Ringkasan', icon: 'pie-chart' },
    { key: 'transaksi',  label: 'Transaksi', icon: 'list' },
    { key: 'budget',     label: 'Budget',    icon: 'bar-chart' },
    { key: 'tabungan',   label: 'Tabungan',  icon: 'wallet' },
  ];
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 6, paddingRight: 8 }}
    >
      {TABS.map((t) => {
        const isActive = t.key === active;
        return (
          <Pressable
            key={t.key}
            onPress={() => onChange(t.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              paddingVertical: 7,
              paddingHorizontal: 14,
              borderRadius: theme.radius.full,
              backgroundColor: isActive ? theme.colors.primary : theme.colors.surfaceAlt,
              borderWidth: 1,
              borderColor: isActive ? theme.colors.primary : theme.colors.border,
            }}
          >
            <Ionicons name={t.icon} size={14} color={isActive ? '#fff' : theme.colors.textMuted} />
            <ThemedText style={{
              fontSize: theme.font.size.sm,
              fontWeight: isActive ? theme.font.weight.semibold : theme.font.weight.regular,
              color: isActive ? '#fff' : theme.colors.textSecondary,
            }}>
              {t.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ─── SCREEN UTAMA ─────────────────────────────────────────────────────────────
export default function KeuanganScreen() {
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  const haptics = useHaptics();
  const insets = useSafeAreaInsets();

  // Stores
  const {
    transactions, budgets, savingsGoals,
    addTransaction, removeTransaction,
    setBudget,
    addSavingsGoal, removeSavingsGoal, depositToGoal,
    loadSeedData,
  } = useFinanceStore();
  const { unlockBadge } = useProfileStore();

  // UI state
  const [mainTab, setMainTab] = useState<MainTab>('ringkasan');
  const [modal,   setModal]   = useState<ModalType>(null);
  const [txSearch, setTxSearch] = useState('');
  const [txFilter, setTxFilter] = useState<'semua' | 'pemasukan' | 'pengeluaran'>('semua');

  // Seed data bila kosong
  const hasSeeded = useRef(false);
  React.useEffect(() => {
    if (!hasSeeded.current && transactions.length === 0) {
      loadSeedData();
      hasSeeded.current = true;
    }
  }, []);

  // ── Kalkulasi ──────────────────────────────────────────────────────────────
  const summary    = useMemo(() => monthlySummary(transactions),     [transactions]);
  const budgetData = useMemo(() => budgetRemaining(budgets, transactions), [budgets, transactions]);
  const catSpend   = useMemo(() => spendingByCategory(transactions), [transactions]);
  const trendData  = useMemo(() => weeklyExpenseTrend(transactions), [transactions]);
  const tips       = useMemo(() => generateFinanceTips(budgets, transactions), [budgets, transactions]);

  // Donut data: kategori dengan pengeluaran > 0
  const donutData = useMemo(() =>
    ALL_CATEGORIES
      .filter((c) => catSpend[c] > 0)
      .map((c) => ({
        label: CATEGORY_LABELS[c],
        value: catSpend[c],
        color: tokens.color.category[c],
      })),
    [catSpend]
  );

  // Transaksi terfilter + dicari
  const filteredTx = useMemo(() => {
    let tx = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
    if (txFilter !== 'semua') tx = tx.filter((t) => t.type === txFilter);
    if (txSearch.trim()) {
      const q = txSearch.toLowerCase();
      tx = tx.filter((t) =>
        t.description.toLowerCase().includes(q) ||
        CATEGORY_LABELS[t.category].toLowerCase().includes(q)
      );
    }
    return tx;
  }, [transactions, txFilter, txSearch]);

  // ── Aksi ───────────────────────────────────────────────────────────────────
  const handleAddTx = useCallback((data: Omit<Transaction, 'id' | 'createdAt'>) => {
    addTransaction({ id: generateId(), createdAt: new Date().toISOString(), ...data });
    haptics.impact('medium');
    setModal(null);
  }, [addTransaction, haptics]);

  const handleAddGoal = useCallback((data: Omit<SavingsGoal, 'id' | 'createdAt' | 'currentAmount'>) => {
    addSavingsGoal({ id: generateId(), createdAt: new Date().toISOString(), currentAmount: 0, ...data });
    haptics.impact('light');
    setModal(null);
  }, [addSavingsGoal, haptics]);

  const handleDeposit = useCallback((goalId: string, amount: number) => {
    depositToGoal(goalId, amount);
    haptics.notification('success');
    // Cek apakah goal tercapai setelah deposit
    const goal = savingsGoals.find((g) => g.id === goalId);
    if (goal && goal.currentAmount + amount >= goal.targetAmount) {
      unlockBadge('saver');
    }
  }, [depositToGoal, haptics, savingsGoals, unlockBadge]);

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['bottom']}>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View>
          <ThemedText variant="title" bold>Keuangan</ThemedText>
          <ThemedText variant="caption" muted>
            {summary.balance >= 0
              ? `Surplus ${formatRupiah(summary.balance)}`
              : `Defisit ${formatRupiah(Math.abs(summary.balance))}`}
          </ThemedText>
        </View>
        <Pressable
          onPress={() => mainTab === 'tabungan' ? setModal('add_goal') : setModal('add_tx')}
          accessibilityRole="button"
          accessibilityLabel="Catat transaksi"
          style={[styles.addBtn, { backgroundColor: theme.colors.secondary }]}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </Pressable>
      </View>

      {/* Tab bar */}
      <View style={{ paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.sm }}>
        <TabBar active={mainTab} onChange={setMainTab} />
      </View>

      {/* ── TAB: RINGKASAN ───────────────────────────────────────────────── */}
      {mainTab === 'ringkasan' && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: 100 }}
        >
          {/* Kartu saldo */}
          <Card
            style={{ marginBottom: theme.spacing.md }}
            elevated
          >
            <ThemedText variant="caption" muted>Saldo Bulan Ini</ThemedText>
            <ThemedText
              variant="title"
              bold
              style={{
                color: summary.balance >= 0 ? theme.colors.success : theme.colors.danger,
                marginBottom: theme.spacing.sm,
              }}
            >
              {formatRupiah(Math.abs(summary.balance))}
              <ThemedText variant="body" style={{ color: theme.colors.textMuted }}>
                {summary.balance >= 0 ? ' ↑ Surplus' : ' ↓ Defisit'}
              </ThemedText>
            </ThemedText>
            <View style={{ flexDirection: 'row', gap: theme.spacing.lg }}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="arrow-down-circle" size={14} color={theme.colors.success} />
                  <ThemedText variant="caption" muted>Pemasukan</ThemedText>
                </View>
                <ThemedText semibold style={{ color: theme.colors.success }}>
                  {formatRupiah(summary.income)}
                </ThemedText>
              </View>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="arrow-up-circle" size={14} color={theme.colors.danger} />
                  <ThemedText variant="caption" muted>Pengeluaran</ThemedText>
                </View>
                <ThemedText semibold style={{ color: theme.colors.danger }}>
                  {formatRupiah(summary.expense)}
                </ThemedText>
              </View>
            </View>
          </Card>

          {/* Grafik donut + legend */}
          {donutData.length > 0 && (
            <Card style={{ marginBottom: theme.spacing.md }}>
              <ThemedText variant="body" semibold style={{ marginBottom: theme.spacing.sm }}>
                Pengeluaran per Kategori
              </ThemedText>
              <View style={{ flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: theme.spacing.md }}>
                <DonutChart
                  data={donutData}
                  size={150}
                  centerLabel={formatRupiah(summary.expense).replace('Rp ', '')}
                />
                {/* Legend */}
                <View style={{ flex: 1, gap: 6 }}>
                  {donutData.map((d) => (
                    <View key={d.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: d.color }} />
                      <ThemedText variant="caption" style={{ flex: 1 }}>{d.label}</ThemedText>
                      <ThemedText variant="caption" semibold>{formatRupiah(d.value)}</ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            </Card>
          )}

          {/* Bar chart tren mingguan */}
          <Card style={{ marginBottom: theme.spacing.md }}>
            <ThemedText variant="body" semibold style={{ marginBottom: theme.spacing.sm }}>
              Tren Pengeluaran (4 Minggu)
            </ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <BarChart
                data={trendData.map((w) => ({
                  label: w.label,
                  value: w.amount,
                  color: theme.colors.secondary,
                }))}
                height={140}
              />
            </ScrollView>
          </Card>

          {/* Saran keuangan */}
          <ThemedText variant="subtitle" semibold style={{ marginBottom: theme.spacing.sm }}>
            Saran Keuangan
          </ThemedText>
          {tips.map((tip, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                gap: theme.spacing.sm,
                padding: theme.spacing.sm,
                borderRadius: theme.radius.md,
                marginBottom: theme.spacing.xs,
                backgroundColor:
                  tip.severity === 'danger'  ? theme.colors.danger  + '12' :
                  tip.severity === 'warning' ? theme.colors.warning + '12' :
                  theme.colors.success + '12',
                borderWidth: 1,
                borderColor:
                  tip.severity === 'danger'  ? theme.colors.danger  + '30' :
                  tip.severity === 'warning' ? theme.colors.warning + '30' :
                  theme.colors.success + '30',
              }}
            >
              <ThemedText style={{ fontSize: 18 }}>{tip.icon}</ThemedText>
              <ThemedText variant="caption" style={{ flex: 1, lineHeight: 18 }}>{tip.message}</ThemedText>
            </View>
          ))}
        </ScrollView>
      )}

      {/* ── TAB: TRANSAKSI ───────────────────────────────────────────────── */}
      {mainTab === 'transaksi' && (
        <View style={{ flex: 1 }}>
          {/* Search + filter */}
          <View style={{ paddingHorizontal: theme.spacing.md, gap: theme.spacing.xs, marginBottom: theme.spacing.sm }}>
            <View style={[styles.searchBox, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border }]}>
              <Ionicons name="search" size={16} color={theme.colors.textMuted} />
              <TextInput
                value={txSearch}
                onChangeText={setTxSearch}
                placeholder="Cari transaksi..."
                placeholderTextColor={theme.colors.textMuted}
                style={{ flex: 1, fontSize: theme.font.size.md, color: theme.colors.textPrimary }}
              />
              {txSearch.length > 0 && (
                <Pressable onPress={() => setTxSearch('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={16} color={theme.colors.textMuted} />
                </Pressable>
              )}
            </View>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {(['semua','pemasukan','pengeluaran'] as const).map((f) => {
                const active = f === txFilter;
                return (
                  <Pressable
                    key={f}
                    onPress={() => setTxFilter(f)}
                    style={{
                      paddingVertical: 4, paddingHorizontal: 12,
                      borderRadius: theme.radius.full,
                      backgroundColor: active ? theme.colors.secondary + '20' : theme.colors.surfaceAlt,
                      borderWidth: 1,
                      borderColor: active ? theme.colors.secondary : theme.colors.border,
                    }}
                  >
                    <ThemedText style={{
                      fontSize: theme.font.size.xs,
                      fontWeight: active ? theme.font.weight.semibold : theme.font.weight.regular,
                      color: active ? theme.colors.secondary : theme.colors.textMuted,
                    }}>
                      {f === 'semua' ? 'Semua' : f === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {filteredTx.length === 0 ? (
            <EmptyState
              icon="receipt-outline"
              title="Tidak ada transaksi"
              subtitle="Ketuk + untuk mencatat transaksi baru"
            />
          ) : (
            <FlatList
              data={filteredTx}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: theme.spacing.md, paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TransactionItem
                  transaction={item}
                  onDelete={() => { removeTransaction(item.id); haptics.impact('medium'); }}
                />
              )}
            />
          )}
        </View>
      )}

      {/* ── TAB: BUDGET ──────────────────────────────────────────────────── */}
      {mainTab === 'budget' && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: 100 }}
        >
          <ThemedText variant="caption" muted style={{ marginBottom: theme.spacing.sm }}>
            Ketuk ✏️ pada kategori untuk mengatur batas budget bulanan
          </ThemedText>
          {ALL_CATEGORIES.map((cat) => {
            const data = budgetData.find((b) => b.category === cat);
            const limit   = data?.limit   ?? 0;
            const spent   = data?.spent   ?? 0;
            const percent = data?.percent ?? 0;
            return (
              <BudgetCard
                key={cat}
                category={cat}
                limit={limit}
                spent={spent}
                percent={percent}
                onUpdateLimit={(newLimit) =>
                  setBudget({ category: cat, limit: newLimit })
                }
              />
            );
          })}
        </ScrollView>
      )}

      {/* ── TAB: TABUNGAN ────────────────────────────────────────────────── */}
      {mainTab === 'tabungan' && (
        <View style={{ flex: 1 }}>
          {savingsGoals.length === 0 ? (
            <EmptyState
              icon="wallet-outline"
              title="Belum ada target tabungan"
              subtitle="Ketuk + untuk membuat target baru"
            />
          ) : (
            <FlatList
              data={savingsGoals}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <SavingsGoalCard
                  goal={item}
                  onDeposit={(amount) => handleDeposit(item.id, amount)}
                  onDelete={() => { removeSavingsGoal(item.id); haptics.impact('medium'); }}
                />
              )}
            />
          )}
        </View>
      )}

      {/* FAB mobile */}
      {isMobile && (
        <Pressable
          onPress={() => mainTab === 'tabungan' ? setModal('add_goal') : setModal('add_tx')}
          accessibilityRole="button"
          accessibilityLabel="Tambah"
          style={[styles.fab, { backgroundColor: theme.colors.secondary, bottom: insets.bottom + 16 }]}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </Pressable>
      )}

      {/* Modal: Catat Transaksi */}
      <AppModal
        visible={modal === 'add_tx'}
        onClose={() => setModal(null)}
        title="Catat Transaksi"
        desktopWidth={480}
      >
        <TransactionForm
          onSubmit={handleAddTx}
          onCancel={() => setModal(null)}
        />
      </AppModal>

      {/* Modal: Tambah Target Tabungan */}
      <AppModal
        visible={modal === 'add_goal'}
        onClose={() => setModal(null)}
        title="Target Tabungan Baru"
        desktopWidth={480}
      >
        <SavingsGoalForm
          onSubmit={handleAddGoal}
          onCancel={() => setModal(null)}
        />
      </AppModal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  addBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 44,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
});

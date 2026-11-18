// src/features/finance/financeUtils.ts
// Kalkulasi budget, agregasi, dan saran otomatis

import { Transaction, BudgetItem, ExpenseCategory } from '../../types/finance.types';

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  makan:     'Makan',
  transport: 'Transport',
  kuliah:    'Kuliah',
  hiburan:   'Hiburan',
  kos:       'Kos/Kontrakan',
  lainnya:   'Lainnya',
};

export const ALL_CATEGORIES: ExpenseCategory[] = [
  'makan', 'transport', 'kuliah', 'hiburan', 'kos', 'lainnya',
];

/** Transaksi bulan tertentu (format YYYY-MM) */
export function txThisMonth(transactions: Transaction[], yearMonth?: string): Transaction[] {
  const ym = yearMonth ?? currentYearMonth();
  return transactions.filter((t) => t.date.startsWith(ym));
}

/** "YYYY-MM" bulan ini */
export function currentYearMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Total pengeluaran per kategori bulan ini */
export function spendingByCategory(
  transactions: Transaction[],
  yearMonth?: string
): Record<ExpenseCategory, number> {
  const result: Record<ExpenseCategory, number> = {
    makan: 0, transport: 0, kuliah: 0, hiburan: 0, kos: 0, lainnya: 0,
  };
  for (const tx of txThisMonth(transactions, yearMonth)) {
    if (tx.type === 'pengeluaran') {
      result[tx.category] += tx.amount;
    }
  }
  return result;
}

/** Sisa budget per kategori */
export function budgetRemaining(
  budgets: BudgetItem[],
  transactions: Transaction[],
  yearMonth?: string
): Array<{
  category: ExpenseCategory;
  limit: number;
  spent: number;
  remaining: number;
  percent: number;
}> {
  const spending = spendingByCategory(transactions, yearMonth);
  return budgets.map((b) => {
    const spent = spending[b.category] ?? 0;
    const remaining = Math.max(0, b.limit - spent);
    const percent = b.limit > 0 ? Math.min(100, Math.round((spent / b.limit) * 100)) : 0;
    return { category: b.category, limit: b.limit, spent, remaining, percent };
  });
}

/** Total pemasukan & pengeluaran bulan ini */
export function monthlySummary(transactions: Transaction[], yearMonth?: string) {
  const txs = txThisMonth(transactions, yearMonth);
  const income  = txs.filter((t) => t.type === 'pemasukan').reduce((s, t) => s + t.amount, 0);
  const expense = txs.filter((t) => t.type === 'pengeluaran').reduce((s, t) => s + t.amount, 0);
  return { income, expense, balance: income - expense };
}

/** Tren mingguan: total pengeluaran per minggu (4 minggu terakhir) */
export function weeklyExpenseTrend(transactions: Transaction[]): Array<{ label: string; amount: number }> {
  const now = new Date();
  const weeks: Array<{ label: string; amount: number }> = [];
  for (let i = 3; i >= 0; i--) {
    const end = new Date(now);
    end.setDate(end.getDate() - i * 7);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    const label = `M-${i > 0 ? i : 'ini'}`;
    const amount = transactions
      .filter((t) => {
        if (t.type !== 'pengeluaran') return false;
        const d = new Date(t.date);
        return d >= start && d <= end;
      })
      .reduce((s, t) => s + t.amount, 0);
    weeks.push({ label, amount });
  }
  return weeks;
}

/** Saran otomatis berbasis aturan sederhana */
export interface FinanceTip {
  icon: string;
  message: string;
  severity: 'info' | 'warning' | 'danger';
}

export function generateFinanceTips(
  budgets: BudgetItem[],
  transactions: Transaction[]
): FinanceTip[] {
  const tips: FinanceTip[] = [];
  const spending = spendingByCategory(transactions);
  const { income, expense, balance } = monthlySummary(transactions);

  // Cek setiap kategori
  for (const b of budgets) {
    const spent = spending[b.category] ?? 0;
    const pct = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;
    const label = CATEGORY_LABELS[b.category];

    if (pct >= 100) {
      tips.push({
        icon: '🚨',
        message: `Budget ${label} sudah habis (${pct}%)! Hati-hati pengeluaran lebih lanjut.`,
        severity: 'danger',
      });
    } else if (pct >= 80) {
      tips.push({
        icon: '⚠️',
        message: `Pengeluaran ${label} sudah ${pct}% dari budget. Sisakan lebih banyak!`,
        severity: 'warning',
      });
    }
  }

  // Cek balance
  if (balance < 0) {
    tips.push({
      icon: '💸',
      message: 'Pengeluaran bulan ini melebihi pemasukan. Kurangi pengeluaran tidak penting.',
      severity: 'danger',
    });
  } else if (income > 0 && expense / income > 0.9) {
    tips.push({
      icon: '📉',
      message: 'Kamu sudah menghabiskan lebih dari 90% pemasukan. Coba sisihkan untuk tabungan.',
      severity: 'warning',
    });
  }

  if (tips.length === 0 && income > 0) {
    tips.push({
      icon: '✅',
      message: 'Keuangan bulan ini terkendali. Pertahankan pola pengeluaran yang baik!',
      severity: 'info',
    });
  }

  return tips;
}

/** Parse angka Rupiah dari string input (menghapus titik/koma) */
export function parseRupiahInput(raw: string): number {
  const cleaned = raw.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}

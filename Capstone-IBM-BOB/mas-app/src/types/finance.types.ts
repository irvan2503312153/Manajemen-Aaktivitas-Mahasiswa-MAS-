// src/types/finance.types.ts

export type TransactionType = 'pemasukan' | 'pengeluaran';
export type ExpenseCategory =
  | 'makan'
  | 'transport'
  | 'kuliah'
  | 'hiburan'
  | 'kos'
  | 'lainnya';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // Rupiah integer
  category: ExpenseCategory;
  description: string;
  date: string; // "YYYY-MM-DD"
  createdAt: string;
}

export interface BudgetItem {
  category: ExpenseCategory;
  limit: number;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  emoji?: string;
  createdAt: string;
}

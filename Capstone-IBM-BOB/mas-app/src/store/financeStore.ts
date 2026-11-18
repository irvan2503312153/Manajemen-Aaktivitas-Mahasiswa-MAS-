// src/store/financeStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, BudgetItem, SavingsGoal } from '../types/finance.types';
import { seedTransactions, seedBudgets, seedSavingsGoals } from '../utils/seedData';

interface FinanceState {
  transactions: Transaction[];
  budgets: BudgetItem[];
  savingsGoals: SavingsGoal[];

  addTransaction: (tx: Transaction) => void;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;

  setBudget: (item: BudgetItem) => void;

  addSavingsGoal: (goal: SavingsGoal) => void;
  updateSavingsGoal: (id: string, patch: Partial<SavingsGoal>) => void;
  removeSavingsGoal: (id: string) => void;
  depositToGoal: (id: string, amount: number) => void;

  resetFinance: () => void;
  loadSeedData: () => void;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      transactions: [],
      budgets: [],
      savingsGoals: [],

      addTransaction: (tx) =>
        set((s) => ({ transactions: [tx, ...s.transactions] })),

      updateTransaction: (id, patch) =>
        set((s) => ({
          transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),

      removeTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),

      setBudget: (item) =>
        set((s) => {
          const existing = s.budgets.findIndex((b) => b.category === item.category);
          if (existing >= 0) {
            const updated = [...s.budgets];
            updated[existing] = item;
            return { budgets: updated };
          }
          return { budgets: [...s.budgets, item] };
        }),

      addSavingsGoal: (goal) =>
        set((s) => ({ savingsGoals: [...s.savingsGoals, goal] })),

      updateSavingsGoal: (id, patch) =>
        set((s) => ({
          savingsGoals: s.savingsGoals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        })),

      removeSavingsGoal: (id) =>
        set((s) => ({ savingsGoals: s.savingsGoals.filter((g) => g.id !== id) })),

      depositToGoal: (id, amount) =>
        set((s) => ({
          savingsGoals: s.savingsGoals.map((g) =>
            g.id === id
              ? { ...g, currentAmount: Math.min(g.currentAmount + amount, g.targetAmount) }
              : g
          ),
        })),

      resetFinance: () => set({ transactions: [], budgets: [], savingsGoals: [] }),

      loadSeedData: () =>
        set({ transactions: seedTransactions, budgets: seedBudgets, savingsGoals: seedSavingsGoals }),
    }),
    {
      name: '@mas/finance',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

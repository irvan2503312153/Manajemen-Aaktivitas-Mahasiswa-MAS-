// src/utils/validators.ts
// Validasi form input

import { Task, TaskStatus, Priority } from '../types/task.types';
import { Transaction, ExpenseCategory, TransactionType } from '../types/finance.types';

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateTask(data: Partial<Task>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.title || data.title.trim().length === 0) {
    errors.title = 'Judul tugas wajib diisi';
  } else if (data.title.trim().length > 100) {
    errors.title = 'Judul terlalu panjang (maks 100 karakter)';
  }

  if (!data.mataKuliah || data.mataKuliah.trim().length === 0) {
    errors.mataKuliah = 'Mata kuliah wajib diisi';
  }

  if (!data.deadline) {
    errors.deadline = 'Deadline wajib diisi';
  } else {
    const d = new Date(data.deadline);
    if (isNaN(d.getTime())) {
      errors.deadline = 'Format tanggal tidak valid';
    }
  }

  const validPriorities: Priority[] = ['rendah', 'sedang', 'tinggi'];
  if (data.priority && !validPriorities.includes(data.priority)) {
    errors.priority = 'Prioritas tidak valid';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateTransaction(data: Partial<Transaction>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.description || data.description.trim().length === 0) {
    errors.description = 'Keterangan wajib diisi';
  }

  if (data.amount === undefined || data.amount === null) {
    errors.amount = 'Nominal wajib diisi';
  } else if (!Number.isInteger(data.amount) || data.amount <= 0) {
    errors.amount = 'Nominal harus angka positif';
  } else if (data.amount > 999_999_999_999) {
    errors.amount = 'Nominal terlalu besar';
  }

  const validCategories: ExpenseCategory[] = ['makan','transport','kuliah','hiburan','kos','lainnya'];
  if (!data.category || !validCategories.includes(data.category)) {
    errors.category = 'Kategori tidak valid';
  }

  const validTypes: TransactionType[] = ['pemasukan', 'pengeluaran'];
  if (!data.type || !validTypes.includes(data.type)) {
    errors.type = 'Tipe transaksi tidak valid';
  }

  if (!data.date) {
    errors.date = 'Tanggal wajib diisi';
  } else {
    const d = new Date(data.date);
    if (isNaN(d.getTime())) {
      errors.date = 'Format tanggal tidak valid';
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

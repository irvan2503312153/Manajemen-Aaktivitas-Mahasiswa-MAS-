// src/utils/seedData.ts
// Data contoh untuk demo — dapat diaktifkan dari Pengaturan

import { Task } from '../types/task.types';
import { ClassSession } from '../types/schedule.types';
import { Transaction, BudgetItem, SavingsGoal } from '../types/finance.types';
import { FocusSession, FocusSettings } from '../types/focus.types';
import { UserProfile, Badge } from '../types/profile.types';

const NOW = new Date();
const today = NOW.toISOString().split('T')[0];

function daysFromNow(d: number): string {
  const dt = new Date(NOW);
  dt.setDate(dt.getDate() + d);
  return dt.toISOString();
}

function dateOffset(d: number): string {
  const dt = new Date(NOW);
  dt.setDate(dt.getDate() + d);
  return dt.toISOString().split('T')[0];
}

// ─── TUGAS ────────────────────────────────────────────────────────────────────
export const seedTasks: Task[] = [
  {
    id: 't1',
    title: 'Implementasi REST API dengan Express.js',
    mataKuliah: 'Pemrograman Web',
    deadline: daysFromNow(2),
    priority: 'tinggi',
    status: 'proses',
    notes: 'Buat endpoint CRUD untuk entitas User dan Product',
    createdAt: daysFromNow(-3),
    pomodoroCount: 3,
  },
  {
    id: 't2',
    title: 'Normalisasi database sampai 3NF',
    mataKuliah: 'Basis Data',
    deadline: daysFromNow(5),
    priority: 'sedang',
    status: 'belum',
    notes: 'Studi kasus sistem perpustakaan',
    createdAt: daysFromNow(-1),
    pomodoroCount: 0,
  },
  {
    id: 't3',
    title: 'Latihan soal integral tak tentu',
    mataKuliah: 'Kalkulus',
    deadline: daysFromNow(1),
    priority: 'tinggi',
    status: 'belum',
    createdAt: daysFromNow(-2),
    pomodoroCount: 1,
  },
  {
    id: 't4',
    title: 'Resume materi OOP Python',
    mataKuliah: 'Pemrograman Lanjut',
    deadline: daysFromNow(-1),
    priority: 'sedang',
    status: 'selesai',
    createdAt: daysFromNow(-5),
    completedAt: daysFromNow(-1),
    pomodoroCount: 2,
  },
  {
    id: 't5',
    title: 'Presentasi proposal penelitian',
    mataKuliah: 'Metodologi Penelitian',
    deadline: daysFromNow(10),
    priority: 'tinggi',
    status: 'belum',
    notes: 'Siapkan slide minimal 15 halaman',
    createdAt: NOW.toISOString(),
    pomodoroCount: 0,
  },
];

// ─── JADWAL ───────────────────────────────────────────────────────────────────
export const seedSchedule: ClassSession[] = [
  { id: 's1', mataKuliah: 'Pemrograman Web',      dosen: 'Dr. Budi Santoso',   ruangan: 'Lab Komputer 1', day: 'Senin',  startTime: '08:00', endTime: '09:40', color: '#5B6EF5' },
  { id: 's2', mataKuliah: 'Basis Data',            dosen: 'Ir. Sari Dewi',      ruangan: 'Gedung A-203',   day: 'Senin',  startTime: '10:00', endTime: '11:40', color: '#29B6F6' },
  { id: 's3', mataKuliah: 'Kalkulus',              dosen: 'Prof. Ahmad Yani',   ruangan: 'Gedung B-101',   day: 'Selasa', startTime: '07:30', endTime: '09:10', color: '#FF7043' },
  { id: 's4', mataKuliah: 'Pemrograman Lanjut',    dosen: 'Dr. Rina Kartika',   ruangan: 'Lab Komputer 2', day: 'Rabu',   startTime: '09:00', endTime: '10:40', color: '#4CAF50' },
  { id: 's5', mataKuliah: 'Metodologi Penelitian', dosen: 'Dr. Hendra Wijaya',  ruangan: 'Gedung C-305',   day: 'Kamis',  startTime: '13:00', endTime: '14:40', color: '#FFC107' },
  { id: 's6', mataKuliah: 'Pemrograman Web',       dosen: 'Dr. Budi Santoso',   ruangan: 'Lab Komputer 1', day: 'Jumat',  startTime: '08:00', endTime: '09:40', color: '#5B6EF5' },
  { id: 's7', mataKuliah: 'Basis Data',            dosen: 'Ir. Sari Dewi',      ruangan: 'Gedung A-203',   day: 'Jumat',  startTime: '10:00', endTime: '11:40', color: '#29B6F6' },
];

// ─── TRANSAKSI ────────────────────────────────────────────────────────────────
export const seedTransactions: Transaction[] = [
  { id: 'tr1',  type: 'pemasukan',    amount: 1_500_000, category: 'lainnya',   description: 'Uang saku bulanan dari orang tua', date: dateOffset(-28), createdAt: daysFromNow(-28) },
  { id: 'tr2',  type: 'pengeluaran',  amount: 35_000,    category: 'makan',     description: 'Makan siang di kantin',            date: dateOffset(-14), createdAt: daysFromNow(-14) },
  { id: 'tr3',  type: 'pengeluaran',  amount: 25_000,    category: 'transport', description: 'Grab ke kampus',                   date: dateOffset(-13), createdAt: daysFromNow(-13) },
  { id: 'tr4',  type: 'pengeluaran',  amount: 50_000,    category: 'kuliah',    description: 'Print + jilid laporan',            date: dateOffset(-12), createdAt: daysFromNow(-12) },
  { id: 'tr5',  type: 'pengeluaran',  amount: 30_000,    category: 'makan',     description: 'Sarapan + kopi',                   date: dateOffset(-11), createdAt: daysFromNow(-11) },
  { id: 'tr6',  type: 'pengeluaran',  amount: 650_000,   category: 'kos',       description: 'Bayar kos bulan ini',              date: dateOffset(-10), createdAt: daysFromNow(-10) },
  { id: 'tr7',  type: 'pengeluaran',  amount: 80_000,    category: 'hiburan',   description: 'Nonton bioskop bareng teman',      date: dateOffset(-9),  createdAt: daysFromNow(-9)  },
  { id: 'tr8',  type: 'pengeluaran',  amount: 45_000,    category: 'makan',     description: 'Makan malam di warteg',            date: dateOffset(-8),  createdAt: daysFromNow(-8)  },
  { id: 'tr9',  type: 'pengeluaran',  amount: 20_000,    category: 'transport', description: 'Isi bensin motor',                 date: dateOffset(-7),  createdAt: daysFromNow(-7)  },
  { id: 'tr10', type: 'pengeluaran',  amount: 75_000,    category: 'kuliah',    description: 'Beli buku referensi kuliah',       date: dateOffset(-6),  createdAt: daysFromNow(-6)  },
  { id: 'tr11', type: 'pemasukan',    amount: 200_000,   category: 'lainnya',   description: 'Honor jadi asisten lab',           date: dateOffset(-5),  createdAt: daysFromNow(-5)  },
  { id: 'tr12', type: 'pengeluaran',  amount: 40_000,    category: 'makan',     description: 'Makan siang + minuman',            date: dateOffset(-4),  createdAt: daysFromNow(-4)  },
  { id: 'tr13', type: 'pengeluaran',  amount: 15_000,    category: 'transport', description: 'Parkir motor mingguan',            date: dateOffset(-3),  createdAt: daysFromNow(-3)  },
  { id: 'tr14', type: 'pengeluaran',  amount: 35_000,    category: 'makan',     description: 'Sarapan + jajan sore',             date: dateOffset(-2),  createdAt: daysFromNow(-2)  },
  { id: 'tr15', type: 'pengeluaran',  amount: 50_000,    category: 'hiburan',   description: 'Langganan Spotify + Netflix split', date: dateOffset(-1), createdAt: daysFromNow(-1)  },
];

// ─── BUDGET ───────────────────────────────────────────────────────────────────
export const seedBudgets: BudgetItem[] = [
  { category: 'makan',     limit: 450_000 },
  { category: 'transport', limit: 150_000 },
  { category: 'kuliah',    limit: 200_000 },
  { category: 'hiburan',   limit: 150_000 },
  { category: 'kos',       limit: 700_000 },
  { category: 'lainnya',   limit: 100_000 },
];

// ─── TARGET TABUNGAN ──────────────────────────────────────────────────────────
export const seedSavingsGoals: SavingsGoal[] = [
  {
    id: 'sg1',
    title: 'Beli Laptop Baru',
    targetAmount: 8_000_000,
    currentAmount: 5_200_000,
    targetDate: daysFromNow(90),
    emoji: '💻',
    createdAt: daysFromNow(-60),
  },
  {
    id: 'sg2',
    title: 'Liburan Akhir Semester',
    targetAmount: 1_500_000,
    currentAmount: 450_000,
    targetDate: daysFromNow(45),
    emoji: '✈️',
    createdAt: daysFromNow(-14),
  },
];

// ─── SESI FOKUS ───────────────────────────────────────────────────────────────
export const seedFocusSessions: FocusSession[] = [
  { id: 'f1', taskId: 't4', phase: 'fokus', durationMinutes: 25, startedAt: daysFromNow(-2), endedAt: daysFromNow(-2), completed: true },
  { id: 'f2', taskId: 't4', phase: 'fokus', durationMinutes: 25, startedAt: daysFromNow(-2), endedAt: daysFromNow(-2), completed: true },
  { id: 'f3', taskId: 't1', phase: 'fokus', durationMinutes: 25, startedAt: daysFromNow(-1), endedAt: daysFromNow(-1), completed: true },
  { id: 'f4', taskId: 't1', phase: 'fokus', durationMinutes: 25, startedAt: daysFromNow(-1), endedAt: daysFromNow(-1), completed: true },
  { id: 'f5', taskId: 't1', phase: 'fokus', durationMinutes: 25, startedAt: daysFromNow(0),  endedAt: daysFromNow(0),  completed: true },
];

export const defaultFocusSettings: FocusSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
  autoStartBreak: false,
  soundEnabled: true,
};

// ─── BADGE ───────────────────────────────────────────────────────────────────
const ALL_BADGES: Badge[] = [
  { id: 'first_task',   title: 'Langkah Pertama',    description: 'Selesaikan tugas pertama',          emoji: '🎯' },
  { id: 'task_10',      title: 'Produktif',           description: 'Selesaikan 10 tugas',               emoji: '🏆' },
  { id: 'streak_3',     title: 'Konsisten 3 Hari',    description: 'Aktif 3 hari berturut-turut',       emoji: '🔥' },
  { id: 'streak_7',     title: 'Seminggu Penuh',      description: 'Aktif 7 hari berturut-turut',       emoji: '⚡' },
  { id: 'streak_30',    title: 'Mahasiswa Sejati',    description: 'Aktif 30 hari berturut-turut',      emoji: '👑' },
  { id: 'focus_60min',  title: 'Fokus Pemula',        description: 'Total 60 menit sesi fokus',         emoji: '⏱️' },
  { id: 'focus_10hrs',  title: 'Fokus Master',        description: 'Total 10 jam sesi fokus',           emoji: '🎓' },
  { id: 'saver',        title: 'Penabung Pertama',    description: 'Capai target tabungan pertama',     emoji: '💰' },
  { id: 'budget_master',title: 'Master Keuangan',     description: 'Semua kategori dalam budget sebulan', emoji: '📊' },
];

// ─── PROFIL ───────────────────────────────────────────────────────────────────
export const seedProfile: UserProfile = {
  name: 'Andi Mahasiswa',
  theme: 'sistem',
  currency: 'IDR',
  notificationsEnabled: true,
  xp: 320,
  level: 4,
  currentStreak: 5,
  longestStreak: 12,
  lastActivityDate: today,
  badges: ALL_BADGES.map((b, i) =>
    i < 2 ? { ...b, unlockedAt: daysFromNow(-10) } : b
  ),
  // 1 task selesai di seedTasks (t4), 5 sesi fokus × 25 menit = 125 menit
  totalTasksCompleted: 1,
  totalFocusMinutes: 125,
  createdAt: daysFromNow(-60),
};

export const allBadgeDefinitions = ALL_BADGES;

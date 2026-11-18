// src/features/tasks/taskUtils.ts
// Logika bisnis tugas: sorting, filtering, grouping

import { Task, Priority, TaskStatus } from '../../types/task.types';
import { isToday, isTomorrow, isPast, parseISO, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

/** Bobot prioritas untuk pengurutan */
const PRIORITY_WEIGHT: Record<Priority, number> = {
  tinggi: 3,
  sedang: 2,
  rendah: 1,
};

/** Urutkan: overdue dulu → urgency → prioritas → deadline */
export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const da = new Date(a.deadline);
    const db = new Date(b.deadline);
    const aOverdue = isPast(da) && !isToday(da) && a.status !== 'selesai';
    const bOverdue = isPast(db) && !isToday(db) && b.status !== 'selesai';
    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;

    const pw = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
    if (pw !== 0) return pw;

    return da.getTime() - db.getTime();
  });
}

/** Filter tugas berdasarkan tab aktif */
export type FilterTab = 'semua' | 'hari_ini' | 'minggu_ini' | 'selesai';

export function filterTasks(tasks: Task[], tab: FilterTab, search: string, mataKuliah: string): Task[] {
  let result = tasks;

  // Filter tab
  switch (tab) {
    case 'hari_ini':
      result = result.filter((t) => {
        const d = new Date(t.deadline);
        return (isToday(d) || (isPast(d) && t.status !== 'selesai'));
      });
      break;
    case 'minggu_ini':
      result = result.filter((t) => {
        const d = new Date(t.deadline);
        const now = new Date();
        return isWithinInterval(d, { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) });
      });
      break;
    case 'selesai':
      result = result.filter((t) => t.status === 'selesai');
      break;
    default: // semua: tampilkan belum + proses
      result = result.filter((t) => t.status !== 'selesai');
  }

  // Filter mata kuliah
  if (mataKuliah && mataKuliah !== 'Semua') {
    result = result.filter((t) => t.mataKuliah === mataKuliah);
  }

  // Filter pencarian
  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.mataKuliah.toLowerCase().includes(q) ||
        (t.notes ?? '').toLowerCase().includes(q)
    );
  }

  return sortTasks(result);
}

/** Daftar mata kuliah unik dari daftar tugas */
export function getUniqueMataKuliah(tasks: Task[]): string[] {
  return Array.from(new Set(tasks.map((t) => t.mataKuliah))).sort();
}

/** Apakah tugas sudah lewat deadline */
export function isOverdue(task: Task): boolean {
  if (task.status === 'selesai') return false;
  const d = new Date(task.deadline);
  return isPast(d) && !isToday(d);
}

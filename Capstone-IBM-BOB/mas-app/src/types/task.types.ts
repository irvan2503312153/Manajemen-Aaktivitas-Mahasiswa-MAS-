// src/types/task.types.ts

export type Priority = 'rendah' | 'sedang' | 'tinggi';
export type TaskStatus = 'belum' | 'proses' | 'selesai';

export interface Task {
  id: string;
  title: string;
  mataKuliah: string;
  deadline: string; // ISO 8601
  priority: Priority;
  status: TaskStatus;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  pomodoroCount: number;
}

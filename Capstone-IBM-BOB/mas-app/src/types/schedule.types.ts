// src/types/schedule.types.ts

export type DayOfWeek =
  | 'Senin'
  | 'Selasa'
  | 'Rabu'
  | 'Kamis'
  | 'Jumat'
  | 'Sabtu'
  | 'Minggu';

export interface ClassSession {
  id: string;
  mataKuliah: string;
  dosen?: string;
  ruangan?: string;
  day: DayOfWeek;
  startTime: string; // "08:00"
  endTime: string;   // "09:40"
  color?: string;
}

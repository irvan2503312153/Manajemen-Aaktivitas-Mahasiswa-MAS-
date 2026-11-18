// src/types/focus.types.ts

export type FocusPhase = 'fokus' | 'istirahat_pendek' | 'istirahat_panjang';

export interface FocusSession {
  id: string;
  taskId?: string;
  phase: FocusPhase;
  durationMinutes: number;
  startedAt: string;
  endedAt?: string;
  completed: boolean;
}

export interface FocusSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
  autoStartBreak: boolean;
  soundEnabled: boolean;
}

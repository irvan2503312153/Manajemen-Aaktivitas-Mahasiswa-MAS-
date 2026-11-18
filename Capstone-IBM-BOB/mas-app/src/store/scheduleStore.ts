// src/store/scheduleStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClassSession } from '../types/schedule.types';
import { seedSchedule } from '../utils/seedData';

interface ScheduleState {
  sessions: ClassSession[];
  addSession: (session: ClassSession) => void;
  updateSession: (id: string, patch: Partial<ClassSession>) => void;
  removeSession: (id: string) => void;
  resetSchedule: () => void;
  loadSeedData: () => void;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set) => ({
      sessions: [],

      addSession: (session) =>
        set((s) => ({ sessions: [...s.sessions, session] })),

      updateSession: (id, patch) =>
        set((s) => ({
          sessions: s.sessions.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),

      removeSession: (id) =>
        set((s) => ({ sessions: s.sessions.filter((c) => c.id !== id) })),

      resetSchedule: () => set({ sessions: [] }),

      loadSeedData: () => set({ sessions: seedSchedule }),
    }),
    {
      name: '@mas/schedule',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

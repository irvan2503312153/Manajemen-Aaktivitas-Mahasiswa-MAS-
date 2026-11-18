// src/store/focusStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FocusSession, FocusSettings } from '../types/focus.types';
import { seedFocusSessions, defaultFocusSettings } from '../utils/seedData';

interface FocusState {
  sessions: FocusSession[];
  settings: FocusSettings;

  addSession: (session: FocusSession) => void;
  completeSession: (id: string) => void;
  updateSettings: (patch: Partial<FocusSettings>) => void;
  resetFocus: () => void;
  loadSeedData: () => void;
}

export const useFocusStore = create<FocusState>()(
  persist(
    (set) => ({
      sessions: [],
      settings: defaultFocusSettings,

      addSession: (session) =>
        set((s) => ({ sessions: [session, ...s.sessions] })),

      completeSession: (id) =>
        set((s) => ({
          sessions: s.sessions.map((f) =>
            f.id === id ? { ...f, completed: true, endedAt: new Date().toISOString() } : f
          ),
        })),

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      resetFocus: () => set({ sessions: [] }),

      loadSeedData: () => set({ sessions: seedFocusSessions }),
    }),
    {
      name: '@mas/focus',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

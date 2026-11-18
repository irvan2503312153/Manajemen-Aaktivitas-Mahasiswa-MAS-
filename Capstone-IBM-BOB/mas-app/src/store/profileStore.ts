// src/store/profileStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, BadgeId } from '../types/profile.types';
import { seedProfile } from '../utils/seedData';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Mahasiswa',
  theme: 'sistem',
  currency: 'IDR',
  notificationsEnabled: true,
  xp: 0,
  level: 1,
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: undefined,
  badges: seedProfile.badges.map((b) => ({ ...b, unlockedAt: undefined })),
  totalTasksCompleted: 0,
  totalFocusMinutes: 0,
  createdAt: new Date().toISOString(),
};

interface ProfileState {
  profile: UserProfile;

  updateProfile: (patch: Partial<UserProfile>) => void;
  addXP: (amount: number) => void;
  updateStreak: () => void;
  unlockBadge: (id: BadgeId) => void;
  incrementTasksCompleted: () => void;
  addFocusMinutes: (minutes: number) => void;
  resetProfile: () => void;
  loadSeedData: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,

      updateProfile: (patch) =>
        set((s) => ({ profile: { ...s.profile, ...patch } })),

      addXP: (amount) =>
        set((s) => {
          const newXP = s.profile.xp + amount;
          const newLevel = Math.floor(newXP / 100) + 1;
          return { profile: { ...s.profile, xp: newXP, level: newLevel } };
        }),

      updateStreak: () =>
        set((s) => {
          const today = new Date().toISOString().split('T')[0];
          const last = s.profile.lastActivityDate;
          if (last === today) return s; // Sudah dihitung hari ini

          let newStreak = 1;
          if (last) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yStr = yesterday.toISOString().split('T')[0];
            newStreak = last === yStr ? s.profile.currentStreak + 1 : 1;
          }

          const longest = Math.max(newStreak, s.profile.longestStreak);
          return {
            profile: {
              ...s.profile,
              currentStreak: newStreak,
              longestStreak: longest,
              lastActivityDate: today,
            },
          };
        }),

      unlockBadge: (id) =>
        set((s) => ({
          profile: {
            ...s.profile,
            badges: s.profile.badges.map((b) =>
              b.id === id && !b.unlockedAt
                ? { ...b, unlockedAt: new Date().toISOString() }
                : b
            ),
          },
        })),

      incrementTasksCompleted: () =>
        set((s) => ({
          profile: {
            ...s.profile,
            totalTasksCompleted: s.profile.totalTasksCompleted + 1,
          },
        })),

      addFocusMinutes: (minutes) =>
        set((s) => ({
          profile: {
            ...s.profile,
            totalFocusMinutes: s.profile.totalFocusMinutes + minutes,
          },
        })),

      resetProfile: () => set({ profile: DEFAULT_PROFILE }),

      loadSeedData: () => set({ profile: seedProfile }),
    }),
    {
      name: '@mas/profile',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

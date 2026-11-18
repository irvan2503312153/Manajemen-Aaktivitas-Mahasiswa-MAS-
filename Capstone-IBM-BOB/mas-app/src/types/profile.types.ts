// src/types/profile.types.ts

export type AppTheme = 'terang' | 'gelap' | 'sistem';
export type Currency = 'IDR';

export type BadgeId =
  | 'first_task'
  | 'streak_3'
  | 'streak_7'
  | 'streak_30'
  | 'focus_60min'
  | 'focus_10hrs'
  | 'saver'
  | 'budget_master'
  | 'task_10';

export interface Badge {
  id: BadgeId;
  title: string;
  description: string;
  emoji: string;
  unlockedAt?: string;
}

export interface UserProfile {
  name: string;
  theme: AppTheme;
  currency: Currency;
  notificationsEnabled: boolean;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
  badges: Badge[];
  totalTasksCompleted: number;
  totalFocusMinutes: number;
  createdAt: string;
}

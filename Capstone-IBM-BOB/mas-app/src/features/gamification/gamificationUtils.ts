// src/features/gamification/gamificationUtils.ts
// Kalkulasi XP, level, streak, dan kondisi unlock badge

import { UserProfile, BadgeId } from '../../types/profile.types';

/** XP yang dibutuhkan untuk mencapai level N */
export function xpForLevel(level: number): number {
  return level * 100;
}

/** XP yang sudah dikumpulkan dalam level saat ini */
export function xpInCurrentLevel(xp: number): number {
  const level = Math.floor(xp / 100) + 1;
  return xp - (level - 1) * 100;
}

/** XP yang dibutuhkan untuk level berikutnya (selalu 100) */
export const XP_PER_LEVEL = 100;

/** Persentase progres XP dalam level saat ini (0–100) */
export function xpProgressPercent(xp: number): number {
  return Math.min(100, (xpInCurrentLevel(xp) / XP_PER_LEVEL) * 100);
}

/** Deskripsi level berdasarkan angka */
export function levelTitle(level: number): string {
  if (level <= 2)  return 'Mahasiswa Baru';
  if (level <= 5)  return 'Pelajar Tekun';
  if (level <= 10) return 'Akademisi Muda';
  if (level <= 20) return 'Sarjana Muda';
  return 'Mahasiswa Sejati';
}

/** Jumlah XP yang diberikan untuk setiap aksi */
export const XP_REWARDS = {
  COMPLETE_TASK:  20,
  COMPLETE_FOCUS: 10,
  LOGIN_STREAK:   5,
} as const;

/** Cek badge mana yang seharusnya ter-unlock berdasarkan profil saat ini */
export function computeBadgesToUnlock(profile: UserProfile): BadgeId[] {
  const toUnlock: BadgeId[] = [];
  const unlockedIds = new Set(
    profile.badges.filter((b) => b.unlockedAt).map((b) => b.id)
  );

  const check = (id: BadgeId, condition: boolean) => {
    if (condition && !unlockedIds.has(id)) toUnlock.push(id);
  };

  check('first_task',    profile.totalTasksCompleted >= 1);
  check('task_10',       profile.totalTasksCompleted >= 10);
  check('streak_3',      profile.currentStreak >= 3);
  check('streak_7',      profile.currentStreak >= 7);
  check('streak_30',     profile.currentStreak >= 30);
  check('focus_60min',   profile.totalFocusMinutes >= 60);
  check('focus_10hrs',   profile.totalFocusMinutes >= 600);

  return toUnlock;
}

/** Label streak motivasi */
export function streakLabel(streak: number): string {
  if (streak === 0) return 'Mulai streakmu hari ini!';
  if (streak < 3)   return `${streak} hari — terus semangat!`;
  if (streak < 7)   return `${streak} hari — kamu konsisten!`;
  if (streak < 30)  return `${streak} hari — luar biasa!`;
  return `${streak} hari — legenda!`;
}

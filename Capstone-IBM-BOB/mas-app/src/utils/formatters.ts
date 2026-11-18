// src/utils/formatters.ts
// Fungsi format angka, tanggal, dan durasi untuk locale Indonesia

import { format, formatDistance, isToday, isTomorrow, isPast } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

/** Format angka ke Rupiah: 25000 → "Rp 25.000" */
export function formatRupiah(amount: number): string {
  if (!isFinite(amount)) return 'Rp 0';
  const abs = Math.abs(Math.round(amount));
  const formatted = abs.toLocaleString('id-ID');
  return `Rp ${formatted}`;
}

/** Format tanggal ISO ke tampilan Indonesia: "15 Jun 2025" */
export function formatDate(isoString: string): string {
  try {
    return format(new Date(isoString), 'd MMM yyyy', { locale: idLocale });
  } catch {
    return isoString;
  }
}

/** Format tanggal + jam: "15 Jun 2025, 23:59" */
export function formatDateTime(isoString: string): string {
  try {
    return format(new Date(isoString), 'd MMM yyyy, HH:mm', { locale: idLocale });
  } catch {
    return isoString;
  }
}

/** Label deadline relatif: "Hari ini", "Besok", "2 hari lagi", "Terlambat" */
export function formatDeadlineLabel(isoString: string): {
  label: string;
  isOverdue: boolean;
  isUrgent: boolean;
} {
  try {
    const date = new Date(isoString);
    const overdue = isPast(date) && !isToday(date);
    if (overdue) {
      return { label: 'Terlambat', isOverdue: true, isUrgent: false };
    }
    if (isToday(date)) {
      return { label: 'Hari ini', isOverdue: false, isUrgent: true };
    }
    if (isTomorrow(date)) {
      return { label: 'Besok', isOverdue: false, isUrgent: true };
    }
    const rel = formatDistance(date, new Date(), { locale: idLocale, addSuffix: true });
    return { label: rel, isOverdue: false, isUrgent: false };
  } catch {
    return { label: isoString, isOverdue: false, isUrgent: false };
  }
}

/** Format menit ke "1 j 25 m" atau "45 m" */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} j ${m} m` : `${h} j`;
}

/** Format detik timer ke "25:00" */
export function formatTimer(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Hitung persentase: 0–100 */
export function calcPercent(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((value / total) * 100));
}

/** Singkat angka besar: 1500000 → "1,5 Jt" */
export function formatCompact(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} M`;
  if (amount >= 1_000_000)     return `${(amount / 1_000_000).toFixed(1)} Jt`;
  if (amount >= 1_000)         return `${(amount / 1_000).toFixed(0)} Rb`;
  return String(amount);
}

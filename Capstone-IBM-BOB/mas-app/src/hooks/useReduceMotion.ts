// src/hooks/useReduceMotion.ts
// Mengembalikan true jika pengguna mengaktifkan "Reduce Motion" di OS.
// Semua animasi dekoratif HARUS dimatikan jika nilai ini true.
// Di web, gunakan CSS media query via window.matchMedia sebagai fallback.

import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

export function useReduceMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    // Web: matchMedia
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.matchMedia) {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReduced(mq.matches);
        const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
      }
      return;
    }

    // Native: AccessibilityInfo
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => sub.remove();
  }, []);

  return reduced;
}

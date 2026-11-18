// src/theme/ThemeContext.tsx
// Menyediakan tema aktif ke seluruh pohon komponen

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, AppThemeType } from './lightTheme';
import { darkTheme } from './darkTheme';
import { AppTheme } from '../types/profile.types';

interface ThemeContextValue {
  theme: AppThemeType;
  themePreference: AppTheme;
  setThemePreference: (pref: AppTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  themePreference: 'sistem',
  setThemePreference: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themePreference, setThemePreference] = useState<AppTheme>('sistem');

  // Hitung tema aktif berdasarkan preferensi + sistem
  const resolvedDark =
    themePreference === 'gelap' ||
    (themePreference === 'sistem' && systemScheme === 'dark');

  const theme = resolvedDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, themePreference, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** Hook utama — gunakan di setiap komponen untuk mengakses tema */
export function useTheme() {
  return useContext(ThemeContext);
}

// src/hooks/useResponsive.ts
// Hook untuk membaca lebar layar dan menentukan tipe perangkat

import { useWindowDimensions } from 'react-native';
import { tokens } from '../theme/tokens';

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isMobile  = width < tokens.breakpoint.tablet;
  const isTablet  = width >= tokens.breakpoint.tablet && width < tokens.breakpoint.desktop;
  const isDesktop = width >= tokens.breakpoint.desktop;

  // Lebar konten yang nyaman dibaca di desktop
  const contentMaxWidth = isDesktop ? 960 : isTablet ? 720 : width;

  // Jumlah kolom grid berdasarkan lebar
  const gridColumns = isDesktop ? 3 : isTablet ? 2 : 1;

  return { width, height, isMobile, isTablet, isDesktop, contentMaxWidth, gridColumns };
}

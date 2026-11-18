// src/theme/tokens.ts
// Design tokens — single source of truth untuk seluruh UI

export const tokens = {
  color: {
    primary:   '#5B6EF5',
    secondary: '#FF7043',
    success:   '#4CAF50',
    warning:   '#FFC107',
    danger:    '#F44336',
    info:      '#29B6F6',
    focus:     '#7C4DFF',

    // Light palette
    background:    '#F8F9FE',
    surface:       '#FFFFFF',
    surfaceAlt:    '#EEF0FB',
    border:        '#E0E3F0',
    textPrimary:   '#1A1D3A',
    textSecondary: '#6B7280',
    textMuted:     '#9CA3AF',

    // Dark palette
    dark: {
      background:    '#0F1021',
      surface:       '#1A1D3A',
      surfaceAlt:    '#252847',
      border:        '#2E3254',
      textPrimary:   '#F0F1FA',
      textSecondary: '#9BA3C7',
      textMuted:     '#6B7280',
    },

    // Kategori keuangan
    category: {
      makan:     '#FF7043',
      transport: '#29B6F6',
      kuliah:    '#5B6EF5',
      hiburan:   '#AB47BC',
      kos:       '#26A69A',
      lainnya:   '#78909C',
    },

    // Prioritas tugas
    priority: {
      tinggi: '#F44336',
      sedang: '#FFC107',
      rendah: '#4CAF50',
    },
  },

  spacing: {
    xs:  4,
    sm:  8,
    md:  16,
    lg:  24,
    xl:  32,
    xxl: 48,
  },

  radius: {
    sm:   6,
    md:   12,
    lg:   18,
    xl:   24,
    full: 9999,
  },

  font: {
    size: {
      xs:   11,
      sm:   13,
      md:   15,
      lg:   17,
      xl:   20,
      xxl:  26,
      hero: 34,
    },
    weight: {
      regular:  '400' as const,
      medium:   '500' as const,
      semibold: '600' as const,
      bold:     '700' as const,
    },
  },

  shadow: {
    sm: {
      shadowColor: '#1A1D3A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#1A1D3A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.10,
      shadowRadius: 12,
      elevation: 6,
    },
    lg: {
      shadowColor: '#1A1D3A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.14,
      shadowRadius: 24,
      elevation: 12,
    },
  },

  breakpoint: {
    mobile:  0,
    tablet:  768,
    desktop: 1200,
  },

  animation: {
    fast:   150,
    normal: 300,
    slow:   500,
  },
} as const;

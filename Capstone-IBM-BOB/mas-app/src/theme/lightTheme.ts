// src/theme/lightTheme.ts
import { tokens } from './tokens';

export const lightTheme = {
  dark: false as boolean,
  colors: {
    primary:       tokens.color.primary as string,
    secondary:     tokens.color.secondary as string,
    background:    tokens.color.background as string,
    surface:       tokens.color.surface as string,
    surfaceAlt:    tokens.color.surfaceAlt as string,
    border:        tokens.color.border as string,
    textPrimary:   tokens.color.textPrimary as string,
    textSecondary: tokens.color.textSecondary as string,
    textMuted:     tokens.color.textMuted as string,
    success:       tokens.color.success as string,
    warning:       tokens.color.warning as string,
    danger:        tokens.color.danger as string,
    info:          tokens.color.info as string,
    focus:         tokens.color.focus as string,
    tabBar:        tokens.color.surface as string,
    tabBarBorder:  tokens.color.border as string,
    tabIcon:       tokens.color.textMuted as string,
    tabIconActive: tokens.color.primary as string,
    card:          tokens.color.surface as string,
    notification:  tokens.color.danger as string,
    category:      tokens.color.category as typeof tokens.color.category,
    priority:      tokens.color.priority as typeof tokens.color.priority,
  },
  spacing: tokens.spacing,
  radius:  tokens.radius,
  font:    tokens.font,
  shadow:  tokens.shadow,
  animation: tokens.animation,
};

export type AppThemeType = typeof lightTheme;

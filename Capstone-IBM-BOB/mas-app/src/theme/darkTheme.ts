// src/theme/darkTheme.ts
import { tokens } from './tokens';
import { AppThemeType } from './lightTheme';

export const darkTheme: AppThemeType = {
  dark: true,
  colors: {
    primary:       tokens.color.primary,
    secondary:     tokens.color.secondary,
    background:    tokens.color.dark.background,
    surface:       tokens.color.dark.surface,
    surfaceAlt:    tokens.color.dark.surfaceAlt,
    border:        tokens.color.dark.border,
    textPrimary:   tokens.color.dark.textPrimary,
    textSecondary: tokens.color.dark.textSecondary,
    textMuted:     tokens.color.dark.textMuted,
    success:       tokens.color.success,
    warning:       tokens.color.warning,
    danger:        tokens.color.danger,
    info:          tokens.color.info,
    focus:         tokens.color.focus,
    tabBar:        tokens.color.dark.surface,
    tabBarBorder:  tokens.color.dark.border,
    tabIcon:       tokens.color.dark.textMuted,
    tabIconActive: tokens.color.primary,
    card:          tokens.color.dark.surface,
    notification:  tokens.color.danger,
    category:      tokens.color.category,
    priority:      tokens.color.priority,
  },
  spacing: tokens.spacing,
  radius:  tokens.radius,
  font:    tokens.font,
  shadow:  tokens.shadow,
  animation: tokens.animation,
};

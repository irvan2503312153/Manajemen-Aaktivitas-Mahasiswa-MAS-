// src/components/insight/XPProgressBar.tsx
// Menampilkan progress bar XP menuju level berikutnya

import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
// width adalah layout property — harus useNativeDriver: false (jsDriver) di semua platform
import { jsDriver } from '../../utils/animationDriver';
import { useTheme } from '../../theme/ThemeContext';
import { ThemedText } from '../common/ThemedText';
import { Card } from '../common/Card';
import { xpInCurrentLevel, xpProgressPercent, XP_PER_LEVEL, levelTitle } from '../../features/gamification/gamificationUtils';

interface XPProgressBarProps {
  xp: number;
  level: number;
}

export function XPProgressBar({ xp, level }: XPProgressBarProps) {
  const { theme } = useTheme();
  const inLevel = xpInCurrentLevel(xp);
  const percent = xpProgressPercent(xp);
  const title = levelTitle(level);

  // Animate the fill bar width on mount
  const fillAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: percent,
      duration: 700,
      useNativeDriver: jsDriver,
    }).start();
  }, [fillAnim, percent]);

  const animatedWidth = fillAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <Card style={{ marginBottom: theme.spacing.lg }} elevated>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.sm,
        }}
      >
        <View>
          <ThemedText variant="body" semibold>
            {title}
          </ThemedText>
          <ThemedText variant="caption" muted>
            Level {level}
          </ThemedText>
        </View>
        <View
          style={{
            backgroundColor: theme.colors.primary + '15',
            paddingHorizontal: theme.spacing.md,
            paddingVertical: 6,
            borderRadius: theme.radius.full,
          }}
        >
          <ThemedText
            style={{
              color: theme.colors.primary,
              fontSize: theme.font.size.sm,
              fontWeight: theme.font.weight.bold,
            }}
          >
            {xp} XP
          </ThemedText>
        </View>
      </View>

      {/* Progress track */}
      <View
        style={{
          height: 10,
          backgroundColor: theme.colors.surfaceAlt,
          borderRadius: theme.radius.full,
          overflow: 'hidden',
          marginBottom: 6,
        }}
      >
        <Animated.View
          style={{
            height: '100%',
            width: animatedWidth,
            backgroundColor: theme.colors.primary,
            borderRadius: theme.radius.full,
          }}
          accessibilityLabel={`Progres XP: ${inLevel} dari ${XP_PER_LEVEL}, level ${level}`}
        />
      </View>

      {/* Labels */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <ThemedText variant="caption" muted>
          {inLevel} / {XP_PER_LEVEL} XP
        </ThemedText>
        <ThemedText variant="caption" muted>
          Level {level + 1} dalam {XP_PER_LEVEL - inLevel} XP
        </ThemedText>
      </View>
    </Card>
  );
}

// src/components/common/FadeInCard.tsx
// Container yang muncul dengan fade + slide-up saat mount.
// delay: stagger per item (index × STAGGER_MS).
// reduceMotion: langsung tampil tanpa animasi.

import React, { useEffect } from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useReduceMotion } from '../../hooks/useReduceMotion';

export const STAGGER_MS = 70; // jeda antar kartu

interface FadeInCardProps {
  index?: number;        // urutan untuk stagger (0-based)
  delay?: number;        // ms tambahan di atas stagger
  duration?: number;     // default 320ms
  slideOffset?: number;  // pixel slide awal, default 18
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export function FadeInCard({
  index = 0,
  delay = 0,
  duration = 320,
  slideOffset = 18,
  style,
  children,
}: FadeInCardProps) {
  const reduceMotion = useReduceMotion();
  const totalDelay = reduceMotion ? 0 : delay + index * STAGGER_MS;

  const opacity = useSharedValue(reduceMotion ? 1 : 0);
  const translateY = useSharedValue(reduceMotion ? 0 : slideOffset);

  useEffect(() => {
    const cfg = { duration, easing: Easing.out(Easing.cubic) };
    opacity.value = withDelay(totalDelay, withTiming(1, cfg));
    translateY.value = withDelay(totalDelay, withTiming(0, cfg));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[animStyle, style]}>
      {children}
    </Animated.View>
  );
}

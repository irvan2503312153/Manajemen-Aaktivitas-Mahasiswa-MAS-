// src/components/common/StreakPulse.tsx
// Ikon api yang berdenyut saat streak > 0.
// Efek: scale 1 → 1.18 → 1 berulang dengan Reanimated withRepeat.
// Jika reduceMotion aktif: tampilkan ikon statis.

import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useReduceMotion } from '../../hooks/useReduceMotion';

interface StreakPulseProps {
  streak: number;
  color: string;
  size?: number;
  style?: ViewStyle;
}

export function StreakPulse({ streak, color, size = 28, style }: StreakPulseProps) {
  const reduceMotion = useReduceMotion();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion || streak === 0) {
      scale.value = 1;
      return;
    }
    scale.value = withRepeat(
      withSequence(
        withTiming(1.18, { duration: 600, easing: Easing.out(Easing.quad) }),
        withTiming(1.0,  { duration: 500, easing: Easing.in(Easing.quad) })
      ),
      -1, // tak terbatas
      false
    );
  }, [streak, reduceMotion, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animStyle, style]}>
      <Ionicons name="flame" size={size} color={streak > 0 ? color : '#9CA3AF'} />
    </Animated.View>
  );
}

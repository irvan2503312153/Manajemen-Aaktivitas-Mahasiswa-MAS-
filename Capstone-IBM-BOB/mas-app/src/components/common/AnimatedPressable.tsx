// src/components/common/AnimatedPressable.tsx
// Pressable dengan spring scale (Reanimated) + haptic ringan.
// Fallback graceful di web (tidak ada transform glitch).
// Menghormati reduceMotion — nonaktif bila pengguna memilihnya.

import React, { useCallback } from 'react';
import { ViewStyle, StyleProp, GestureResponderEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Pressable } from 'react-native';
import { useHaptics } from '../../hooks/useHaptics';
import { useReduceMotion } from '../../hooks/useReduceMotion';

interface AnimatedPressableProps {
  onPress?: (e: GestureResponderEvent) => void;
  onLongPress?: (e: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  /** Haptic style saat ditekan. null = tanpa haptic */
  haptic?: 'light' | 'medium' | 'heavy' | null;
  scaleDown?: number;        // default 0.96
  disabled?: boolean;
  accessibilityRole?: React.ComponentProps<typeof Pressable>['accessibilityRole'];
  accessibilityLabel?: string;
  accessibilityHint?: string;
  children: React.ReactNode;
}

export function AnimatedPressable({
  onPress,
  onLongPress,
  style,
  haptic = 'light',
  scaleDown = 0.96,
  disabled = false,
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint,
  children,
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);
  const { impact } = useHaptics();
  const reduceMotion = useReduceMotion();

  const handlePressIn = useCallback(() => {
    if (reduceMotion) return;
    scale.value = withSpring(scaleDown, { stiffness: 400, damping: 20 });
  }, [scale, scaleDown, reduceMotion]);

  const handlePressOut = useCallback(() => {
    if (reduceMotion) return;
    scale.value = withSpring(1, { stiffness: 300, damping: 18 });
  }, [scale, reduceMotion]);

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      if (haptic) impact(haptic);
      onPress?.(e);
    },
    [haptic, impact, onPress]
  );

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animStyle, style]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        onLongPress={onLongPress}
        disabled={disabled}
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        style={{ flex: 1 }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

// src/components/common/StatCountUp.tsx
// Angka yang menghitung naik dari 0 ke nilai target saat pertama kali ditampilkan.
// Menggunakan Reanimated withTiming di UI thread → 60 fps tanpa re-render.
// Jika reduceMotion aktif, langsung tampilkan nilai akhir tanpa animasi.

import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { TextInput, TextStyle } from 'react-native';
import { useReduceMotion } from '../../hooks/useReduceMotion';

// TextInput yang bisa menerima animatedProps (Reanimated native driver)
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface StatCountUpProps {
  /** Nilai akhir yang ingin ditampilkan */
  value: number;
  /** Format: 'integer' (default) | 'percent' (tambah %) | 'menit' (tambah 'm') */
  format?: 'integer' | 'percent' | 'menit';
  duration?: number;   // ms, default 900
  style?: TextStyle;
}

export function StatCountUp({
  value,
  format = 'integer',
  duration = 900,
  style,
}: StatCountUpProps) {
  const reduceMotion = useReduceMotion();
  const animated = useSharedValue(reduceMotion ? value : 0);

  useEffect(() => {
    animated.value = withTiming(value, {
      duration: reduceMotion ? 0 : duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, duration, reduceMotion, animated]);

  const animatedProps = useAnimatedProps(() => {
    const v = Math.round(animated.value);
    let text = String(v);
    if (format === 'percent') text = `${v}%`;
    if (format === 'menit') text = `${v}m`;
    return { text, defaultValue: text } as any;
  });

  return (
    <AnimatedTextInput
      animatedProps={animatedProps}
      editable={false}
      underlineColorAndroid="transparent"
      style={[
        {
          padding: 0,
          margin: 0,
          color: (style as any)?.color ?? '#1A1D3A',
        },
        style,
      ]}
    />
  );
}

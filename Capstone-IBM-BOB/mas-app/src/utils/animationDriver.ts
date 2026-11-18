// src/utils/animationDriver.ts
// Helper untuk menentukan apakah useNativeDriver aman dipakai.
//
// Masalah: di platform Web, modul native Animated tidak tersedia.
// Menggunakan useNativeDriver: true di web akan memunculkan peringatan kuning:
//   "useNativeDriver is not supported because the native animated module is missing"
//
// Solusi: gunakan Platform.OS untuk mendeteksi platform.
//   - Native (ios / android) → true  (lebih smooth, jalan di GPU)
//   - Web                   → false  (JS-driven, tidak ada peringatan)
//
// Cara pakai:
//   import { nativeDriver } from '../../utils/animationDriver';
//   Animated.timing(val, { toValue: 1, useNativeDriver: nativeDriver, ... })

import { Platform } from 'react-native';

/**
 * `true` di iOS/Android, `false` di web.
 * Gunakan nilai ini sebagai useNativeDriver pada semua Animated config
 * yang menganimasikan properti transform atau opacity.
 */
export const nativeDriver: boolean = Platform.OS !== 'web';

/**
 * Untuk properti yang TIDAK bisa pakai native driver sama sekali
 * (misalnya width, height, backgroundColor) selalu gunakan false.
 */
export const jsDriver: boolean = false;

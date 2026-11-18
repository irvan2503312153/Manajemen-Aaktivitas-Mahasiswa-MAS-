// src/components/common/Modal.tsx
// Modal responsif: bottom sheet di mobile, dialog di desktop

import React, { useEffect } from 'react';
import {
  Modal as RNModal,
  View,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { ThemedText } from './ThemedText';

interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Lebar dialog di desktop (default 480) */
  desktopWidth?: number;
}

export function AppModal({ visible, onClose, title, children, desktopWidth = 480 }: AppModalProps) {
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  const insets = useSafeAreaInsets();

  if (isMobile) {
    // ── Bottom Sheet (mobile) ──────────────────────────────────────
    return (
      <RNModal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ justifyContent: 'flex-end' }}
        >
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: theme.colors.surface,
                borderTopLeftRadius: theme.radius.xl,
                borderTopRightRadius: theme.radius.xl,
                paddingBottom: insets.bottom + theme.spacing.md,
              },
            ]}
          >
            {/* Handle bar */}
            <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
              <ThemedText variant="subtitle" bold>{title}</ThemedText>
              <Pressable
                onPress={onClose}
                hitSlop={12}
                accessibilityLabel="Tutup"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </Pressable>
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.sm }}
            >
              {children}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </RNModal>
    );
  }

  // ── Dialog Desktop ─────────────────────────────────────────────
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.dialogWrapper} pointerEvents="box-none">
        <KeyboardAvoidingView behavior="padding">
          <View
            style={[
              styles.dialog,
              {
                width: desktopWidth,
                backgroundColor: theme.colors.surface,
                borderRadius: theme.radius.xl,
                borderWidth: 1,
                borderColor: theme.colors.border,
                ...theme.shadow.lg,
              },
            ]}
          >
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
              <ThemedText variant="subtitle" bold>{title}</ThemedText>
              <Pressable
                onPress={onClose}
                hitSlop={12}
                accessibilityLabel="Tutup"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </Pressable>
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: theme.spacing.md }}
            >
              {children}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    maxHeight: Dimensions.get('window').height * 0.92,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dialogWrapper: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialog: {
    maxHeight: Dimensions.get('window').height * 0.85,
    minHeight: 200,
  },
});

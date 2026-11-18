// src/components/insight/BadgeGrid.tsx
// Grid lencana/pencapaian dengan expandable inline detail

import React, { useCallback, useRef } from 'react';
import { View, Pressable, Animated } from 'react-native';
import { nativeDriver } from '../../utils/animationDriver';
import { useTheme } from '../../theme/ThemeContext';
import { ThemedText } from '../common/ThemedText';
import { Card } from '../common/Card';
import { Badge } from '../../types/profile.types';
import { formatDate } from '../../utils/formatters';

interface BadgeGridProps {
  badges: Badge[];
}

// ─── Single badge item with animated press scale ─────────────────────────────
interface BadgeItemProps {
  badge: Badge;
  isSelected: boolean;
  onPress: (id: string) => void;
}

function BadgeItem({ badge, isSelected, onPress }: BadgeItemProps) {
  const { theme } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const isUnlocked = !!badge.unlockedAt;

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.93,
      useNativeDriver: nativeDriver,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: nativeDriver,
      speed: 30,
      bounciness: 6,
    }).start();
  }, [scale]);

  return (
    <View style={{ width: '21%', minWidth: 72 }}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          onPress={() => onPress(badge.id)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={{
            alignItems: 'center',
            padding: theme.spacing.sm,
            borderRadius: theme.radius.md,
            backgroundColor: isSelected
              ? theme.colors.primary + '15'
              : theme.colors.surfaceAlt,
            borderWidth: isSelected ? 1.5 : 1,
            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
            opacity: isUnlocked ? 1 : 0.4,
          }}
          accessibilityRole="button"
          accessibilityLabel={badge.title}
          accessibilityHint={
            isUnlocked
              ? `Terbuka ${badge.unlockedAt ? formatDate(badge.unlockedAt) : ''}. Ketuk untuk melihat detail`
              : 'Belum terbuka. Ketuk untuk melihat syarat'
          }
          accessibilityState={{ selected: isSelected }}
        >
          <ThemedText style={{ fontSize: 28, marginBottom: 4 }}>
            {badge.emoji}
          </ThemedText>
          <ThemedText
            style={{
              fontSize: 10,
              textAlign: 'center',
              color: isUnlocked ? theme.colors.textPrimary : theme.colors.textMuted,
              fontWeight: isUnlocked
                ? theme.font.weight.semibold
                : theme.font.weight.regular,
            }}
            numberOfLines={2}
          >
            {badge.title}
          </ThemedText>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// ─── Main BadgeGrid component ─────────────────────────────────────────────────
export function BadgeGrid({ badges }: BadgeGridProps) {
  const { theme } = useTheme();
  const [selected, setSelected] = React.useState<string | null>(null);

  const handlePress = useCallback((id: string) => {
    setSelected((prev) => (prev === id ? null : id));
  }, []);

  const unlockedCount = badges.filter((b) => b.unlockedAt).length;
  const selectedBadge = badges.find((b) => b.id === selected);

  return (
    <Card style={{ marginBottom: theme.spacing.lg }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.md,
        }}
      >
        <ThemedText variant="subtitle" semibold>
          Pencapaian
        </ThemedText>
        <ThemedText variant="caption" muted>
          {unlockedCount}/{badges.length} terbuka
        </ThemedText>
      </View>

      {/* Grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
        {badges.map((badge) => (
          <BadgeItem
            key={badge.id}
            badge={badge}
            isSelected={selected === badge.id}
            onPress={handlePress}
          />
        ))}
      </View>

      {/* Inline detail panel — shown below grid, no absolute positioning */}
      {selectedBadge && (
        <View
          style={{
            marginTop: theme.spacing.md,
            padding: theme.spacing.md,
            borderRadius: theme.radius.md,
            backgroundColor: selectedBadge.unlockedAt
              ? theme.colors.success + '10'
              : theme.colors.surfaceAlt,
            borderWidth: 1,
            borderColor: selectedBadge.unlockedAt
              ? theme.colors.success + '30'
              : theme.colors.border,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm }}>
            <ThemedText style={{ fontSize: 24 }}>{selectedBadge.emoji}</ThemedText>
            <View style={{ flex: 1 }}>
              <ThemedText variant="body" semibold>
                {selectedBadge.title}
              </ThemedText>
              <ThemedText variant="caption" muted style={{ marginTop: 2 }}>
                {selectedBadge.description}
              </ThemedText>
              {selectedBadge.unlockedAt ? (
                <ThemedText
                  style={{
                    fontSize: theme.font.size.xs,
                    color: theme.colors.success,
                    fontWeight: theme.font.weight.semibold,
                    marginTop: 4,
                  }}
                >
                  ✓ Terbuka pada {formatDate(selectedBadge.unlockedAt)}
                </ThemedText>
              ) : (
                <ThemedText
                  style={{
                    fontSize: theme.font.size.xs,
                    color: theme.colors.textMuted,
                    marginTop: 4,
                  }}
                >
                  Belum terbuka
                </ThemedText>
              )}
            </View>
          </View>
        </View>
      )}
    </Card>
  );
}

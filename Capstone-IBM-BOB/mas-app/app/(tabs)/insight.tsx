// app/(tabs)/insight.tsx  —  Insight & Gamifikasi (Fase 5 · Tahap 2 animasi)

import React, { useCallback, useState } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "../../src/components/layout/ScreenContainer";
import { ThemedText } from "../../src/components/common/ThemedText";
import { Card } from "../../src/components/common/Card";
import { FadeInCard } from "../../src/components/common/FadeInCard";
import { StatCountUp } from "../../src/components/common/StatCountUp";
import { StreakPulse } from "../../src/components/common/StreakPulse";
import { useTheme } from "../../src/theme/ThemeContext";
import { useProfileStore } from "../../src/store/profileStore";
import { useTaskStore } from "../../src/store/taskStore";
import { formatDuration } from "../../src/utils/formatters";
import { XPProgressBar } from "../../src/components/insight/XPProgressBar";
import { WeeklyTaskChart } from "../../src/components/insight/WeeklyTaskChart";
import { BadgeGrid } from "../../src/components/insight/BadgeGrid";
import { streakLabel } from "../../src/features/gamification/gamificationUtils";

export default function InsightScreen() {
  const { theme } = useTheme();
  const profile = useProfileStore((s) => s.profile);
  const tasks = useTaskStore((s) => s.tasks);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "selesai").length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={onRefresh}>

      {/* ── Header ───────────────────────────────────────────────────── */}
      <FadeInCard index={0}>
        <View style={{ paddingTop: theme.spacing.lg, marginBottom: theme.spacing.lg }}>
          <ThemedText variant="title" bold>Insight</ThemedText>
          <ThemedText variant="body" muted>Statistik, pencapaian & gamifikasi</ThemedText>
        </View>
      </FadeInCard>

      {/* ── Profil card ───────────────────────────────────────────────── */}
      <FadeInCard index={1}>
        <Card
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.md,
            marginBottom: theme.spacing.md,
          }}
          elevated
        >
          <View
            style={{
              width: 60, height: 60,
              borderRadius: theme.radius.full,
              backgroundColor: theme.colors.primary + "20",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <Ionicons name="person" size={30} color={theme.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText variant="subtitle" bold>{profile.name}</ThemedText>
            <ThemedText variant="caption" muted>
              Level {profile.level} · {profile.xp} XP total
            </ThemedText>
          </View>
          <View
            style={{
              backgroundColor: theme.colors.primary + "15",
              paddingHorizontal: theme.spacing.sm,
              paddingVertical: 4,
              borderRadius: theme.radius.full,
            }}
          >
            <ThemedText style={{ color: theme.colors.primary, fontSize: theme.font.size.sm, fontWeight: theme.font.weight.bold }}>
              Lv.{profile.level}
            </ThemedText>
          </View>
        </Card>
      </FadeInCard>

      {/* ── XP Bar ────────────────────────────────────────────────────── */}
      <FadeInCard index={2}>
        <XPProgressBar xp={profile.xp} level={profile.level} />
      </FadeInCard>

      {/* ── Streak ────────────────────────────────────────────────────── */}
      <FadeInCard index={3}>
        <Card
          style={{
            marginBottom: theme.spacing.lg,
            backgroundColor: theme.colors.secondary + "10",
            borderColor: theme.colors.secondary + "30",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.md }}>
            <View
              style={{
                width: 48, height: 48,
                borderRadius: theme.radius.full,
                backgroundColor: theme.colors.secondary + "20",
                alignItems: "center", justifyContent: "center",
              }}
            >
              <StreakPulse streak={profile.currentStreak} color={theme.colors.secondary} size={24} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
                <StatCountUp
                  value={profile.currentStreak}
                  style={{
                    fontSize: theme.font.size.xl,
                    fontWeight: theme.font.weight.bold,
                    color: theme.colors.secondary,
                  }}
                />
                <ThemedText style={{ fontSize: theme.font.size.sm, color: theme.colors.secondary }}>
                  {" "}hari
                </ThemedText>
              </View>
              <ThemedText variant="caption" style={{ color: theme.colors.secondary }}>
                {streakLabel(profile.currentStreak)}
              </ThemedText>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <ThemedText variant="caption" muted>Terpanjang</ThemedText>
              <ThemedText variant="body" semibold>{profile.longestStreak} hari</ThemedText>
            </View>
          </View>
        </Card>
      </FadeInCard>

      {/* ── Statistik Produktivitas ───────────────────────────────────── */}
      <FadeInCard index={4}>
        <ThemedText variant="subtitle" semibold style={{ marginBottom: theme.spacing.sm }}>
          Produktivitas
        </ThemedText>
        <View style={{ flexDirection: "row", gap: theme.spacing.sm, marginBottom: theme.spacing.lg }}>
          {[
            { label: "Tugas Selesai", value: completedTasks, sub: `dari ${totalTasks}`, icon: "checkmark-circle" as const, color: theme.colors.success },
            { label: "Tingkat Selesai", value: completionRate, sub: "semua tugas", icon: "pie-chart" as const, color: theme.colors.primary, format: "percent" as const },
            { label: "Waktu Fokus", value: profile.totalFocusMinutes, sub: "total", icon: "timer" as const, color: theme.colors.focus, format: "menit" as const },
          ].map((s) => (
            <Card key={s.label} style={{ flex: 1 }} elevated>
              <View style={{ alignItems: "center", gap: 4 }}>
                <Ionicons name={s.icon} size={22} color={s.color} />
                <StatCountUp
                  value={s.value}
                  format={s.format ?? "integer"}
                  style={{ fontSize: theme.font.size.lg, fontWeight: theme.font.weight.bold, color: s.color, textAlign: "center" }}
                />
                <ThemedText style={{ fontSize: 10, color: theme.colors.textMuted, textAlign: "center" }}>
                  {s.label}
                </ThemedText>
                <ThemedText style={{ fontSize: 10, color: theme.colors.textMuted, textAlign: "center" }}>
                  {s.sub}
                </ThemedText>
              </View>
            </Card>
          ))}
        </View>
      </FadeInCard>

      {/* ── Grafik Tugas Mingguan ─────────────────────────────────────── */}
      <FadeInCard index={5}>
        <ThemedText variant="subtitle" semibold style={{ marginBottom: theme.spacing.sm }}>
          Riwayat 7 Hari
        </ThemedText>
        <WeeklyTaskChart tasks={tasks} />
      </FadeInCard>

      {/* ── Lencana / Badge ───────────────────────────────────────────── */}
      <FadeInCard index={6}>
        <ThemedText variant="subtitle" semibold style={{ marginBottom: theme.spacing.sm }}>
          Lencana
        </ThemedText>
        <BadgeGrid badges={profile.badges} />
      </FadeInCard>

    </ScreenContainer>
  );
}

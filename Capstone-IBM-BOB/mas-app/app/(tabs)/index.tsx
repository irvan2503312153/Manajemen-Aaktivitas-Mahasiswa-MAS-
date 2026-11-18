// app/(tabs)/index.tsx  —  Beranda Lengkap (Fase 5 · Tahap 2 animasi)

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
import { useGreeting } from "../../src/hooks/useGreeting";
import { useMotivationalQuote } from "../../src/hooks/useMotivationalQuote";
import { useProfileStore } from "../../src/store/profileStore";
import { useTaskStore } from "../../src/store/taskStore";
import { formatDeadlineLabel } from "../../src/utils/formatters";
import { NextClassWidget } from "../../src/components/home/NextClassWidget";
import { FinanceSummaryCard } from "../../src/components/home/FinanceSummaryCard";
import { QuickActions } from "../../src/components/home/QuickActions";

export default function BerandaScreen() {
  const { theme } = useTheme();
  const profile = useProfileStore((s) => s.profile);
  const tasks = useTaskStore((s) => s.tasks);
  const greeting = useGreeting(profile.name);
  const quote = useMotivationalQuote();

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const urgentTasks = tasks.filter(
    (t) => t.status !== "selesai" && formatDeadlineLabel(t.deadline).isUrgent,
  );

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={onRefresh}>
      {/* ── Header sapaan ─────────────────────────────────────────────── */}
      <FadeInCard index={0}>
        <View
          style={{
            paddingTop: theme.spacing.lg,
            marginBottom: theme.spacing.lg,
          }}
        >
          <ThemedText variant="title" bold>
            {greeting}
          </ThemedText>
          <ThemedText variant="body" muted>
            Semangat belajar hari ini!
          </ThemedText>
        </View>
      </FadeInCard>

      {/* ── Statistik cepat ───────────────────────────────────────────── */}
      <FadeInCard index={1} style={{ marginBottom: theme.spacing.lg }}>
        <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
          {/* Tugas Selesai */}
          <Card style={{ flex: 1 }} elevated>
            <View style={{ alignItems: "center", gap: 4 }}>
              <Ionicons
                name="checkmark-circle"
                size={28}
                color={theme.colors.success}
              />
              <StatCountUp
                value={profile.totalTasksCompleted}
                style={{
                  fontSize: theme.font.size.xl,
                  fontWeight: theme.font.weight.bold,
                  color: theme.colors.success,
                  textAlign: "center",
                }}
              />
              <ThemedText variant="caption" muted center>
                Tugas Selesai
              </ThemedText>
            </View>
          </Card>

          {/* Streak dengan pulse */}
          <Card style={{ flex: 1 }} elevated>
            <View style={{ alignItems: "center", gap: 4 }}>
              <StreakPulse
                streak={profile.currentStreak}
                color={theme.colors.secondary}
                size={28}
              />
              <StatCountUp
                value={profile.currentStreak}
                style={{
                  fontSize: theme.font.size.xl,
                  fontWeight: theme.font.weight.bold,
                  color: theme.colors.secondary,
                  textAlign: "center",
                }}
              />
              <ThemedText variant="caption" muted center>
                Hari Streak
              </ThemedText>
            </View>
          </Card>

          {/* Menit Fokus */}
          <Card style={{ flex: 1 }} elevated>
            <View style={{ alignItems: "center", gap: 4 }}>
              <Ionicons name="timer" size={28} color={theme.colors.focus} />
              <StatCountUp
                value={profile.totalFocusMinutes}
                format="menit"
                style={{
                  fontSize: theme.font.size.xl,
                  fontWeight: theme.font.weight.bold,
                  color: theme.colors.focus,
                  textAlign: "center",
                }}
              />
              <ThemedText variant="caption" muted center>
                Menit Fokus
              </ThemedText>
            </View>
          </Card>
        </View>
      </FadeInCard>

      {/* ── Quick Actions ─────────────────────────────────────────────── */}
      <FadeInCard index={2}>
        <ThemedText
          variant="subtitle"
          semibold
          style={{ marginBottom: theme.spacing.sm }}
        >
          Aksi Cepat
        </ThemedText>
        <QuickActions />
      </FadeInCard>

      {/* ── Kelas Berikutnya ──────────────────────────────────────────── */}
      <FadeInCard index={3}>
        <ThemedText
          variant="subtitle"
          semibold
          style={{ marginBottom: theme.spacing.sm }}
        >
          Kelas Berikutnya
        </ThemedText>
        <NextClassWidget />
      </FadeInCard>

      {/* ── Ringkasan Keuangan ────────────────────────────────────────── */}
      <FadeInCard index={4}>
        <ThemedText
          variant="subtitle"
          semibold
          style={{ marginBottom: theme.spacing.sm }}
        >
          Keuangan
        </ThemedText>
        <FinanceSummaryCard />
      </FadeInCard>

      {/* ── Tugas Mendesak ────────────────────────────────────────────── */}
      <FadeInCard index={5}>
        <ThemedText
          variant="subtitle"
          semibold
          style={{ marginBottom: theme.spacing.sm }}
        >
          Tugas Mendesak
        </ThemedText>
        {urgentTasks.length === 0 ? (
          <Card style={{ marginBottom: theme.spacing.lg }}>
            <View style={{ alignItems: "center", padding: theme.spacing.md }}>
              <Ionicons
                name="checkmark-done-circle"
                size={40}
                color={theme.colors.success}
              />
              <ThemedText
                variant="body"
                center
                muted
                style={{ marginTop: theme.spacing.sm }}
              >
                Tidak ada tugas mendesak hari ini. Kerja bagus!
              </ThemedText>
            </View>
          </Card>
        ) : (
          <View style={{ marginBottom: theme.spacing.lg }}>
            {urgentTasks.slice(0, 3).map((task, i) => (
              <FadeInCard key={task.id} index={i} delay={300}>
                <Card style={{ marginBottom: theme.spacing.sm }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: theme.spacing.sm,
                    }}
                  >
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: theme.radius.full,
                        backgroundColor:
                          theme.colors.priority[
                            task.priority as keyof typeof theme.colors.priority
                          ],
                      }}
                    />
                    <View style={{ flex: 1 }}>
                      <ThemedText variant="body" semibold numberOfLines={1}>
                        {task.title}
                      </ThemedText>
                      <ThemedText variant="caption" muted>
                        {task.mataKuliah} ·{" "}
                        {formatDeadlineLabel(task.deadline).label}
                      </ThemedText>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={theme.colors.textMuted}
                    />
                  </View>
                </Card>
              </FadeInCard>
            ))}
          </View>
        )}
      </FadeInCard>

      {/* ── Kutipan Motivasi ──────────────────────────────────────────── */}
      <FadeInCard index={6}>
        <Card
          style={{
            marginBottom: theme.spacing.xl,
            backgroundColor: theme.colors.primary + "12",
            borderColor: theme.colors.primary + "30",
          }}
        >
          <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
            <Ionicons
              name="sparkles"
              size={20}
              color={theme.colors.primary}
              style={{ marginTop: 2 }}
            />
            <View style={{ flex: 1 }}>
              <ThemedText
                variant="body"
                style={{ color: theme.colors.textPrimary, fontStyle: "italic" }}
              >
                "{quote.text}"
              </ThemedText>
              <ThemedText variant="caption" muted style={{ marginTop: 4 }}>
                — {quote.author}
              </ThemedText>
            </View>
          </View>
        </Card>
      </FadeInCard>
    </ScreenContainer>
  );
}

// app/(tabs)/aktivitas.tsx
// Fitur Aktivitas: daftar tugas, jadwal kuliah mingguan, Mode Fokus Pomodoro

import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Pressable,
  FlatList,
  TextInput,
  Modal,
  Platform,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ScreenContainer } from '../../src/components/layout/ScreenContainer';
import { ThemedText } from '../../src/components/common/ThemedText';
import { Card } from '../../src/components/common/Card';
import { EmptyState } from '../../src/components/feedback/EmptyState';
import { AppModal } from '../../src/components/common/Modal';
import { TaskCard } from '../../src/components/tasks/TaskCard';
import { TaskForm } from '../../src/components/tasks/TaskForm';
import { ScheduleView } from '../../src/components/schedule/ScheduleView';
import { ClassSessionForm } from '../../src/components/schedule/ClassSessionForm';
import { FocusTimer } from '../../src/components/focus/FocusTimer';

import { useTheme } from '../../src/theme/ThemeContext';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useHaptics } from '../../src/hooks/useHaptics';

import { useTaskStore } from '../../src/store/taskStore';
import { useScheduleStore } from '../../src/store/scheduleStore';
import { useFocusStore } from '../../src/store/focusStore';
import { useProfileStore } from '../../src/store/profileStore';

import { Task } from '../../src/types/task.types';
import { ClassSession } from '../../src/types/schedule.types';
import { FocusPhase } from '../../src/types/focus.types';

import { filterTasks, getUniqueMataKuliah, FilterTab } from '../../src/features/tasks/taskUtils';
import { usePomodoroTimer } from '../../src/features/focus/usePomodoroTimer';

import { formatDuration } from '../../src/utils/formatters';
import { useSnackbar } from '../../src/components/feedback/Snackbar';

// ─── Tipe modal ───────────────────────────────────────────────────────────────
type MainTab = 'tugas' | 'jadwal' | 'fokus';
type ModalType = 'add_task' | 'edit_task' | 'add_class' | 'focus_full' | null;

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Komponen tab internal ────────────────────────────────────────────────────
function TabBar({
  active,
  onChange,
}: {
  active: MainTab;
  onChange: (t: MainTab) => void;
}) {
  const { theme } = useTheme();
  const TABS: { key: MainTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'tugas',  label: 'Tugas',    icon: 'list' },
    { key: 'jadwal', label: 'Jadwal',   icon: 'calendar' },
    { key: 'fokus',  label: 'Fokus',    icon: 'timer' },
  ];
  return (
    <View style={[styles.tabBar, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border }]}>
      {TABS.map((t) => {
        const isActive = t.key === active;
        return (
          <Pressable
            key={t.key}
            onPress={() => onChange(t.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            style={[
              styles.tabItem,
              isActive && { backgroundColor: theme.colors.surface, borderRadius: theme.radius.md },
            ]}
          >
            <Ionicons
              name={t.icon}
              size={16}
              color={isActive ? theme.colors.primary : theme.colors.textMuted}
            />
            <ThemedText
              style={{
                fontSize: theme.font.size.sm,
                fontWeight: isActive ? theme.font.weight.semibold : theme.font.weight.regular,
                color: isActive ? theme.colors.primary : theme.colors.textMuted,
              }}
            >
              {t.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── FILTER TAB tugas ─────────────────────────────────────────────────────────
const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'semua',      label: 'Aktif' },
  { key: 'hari_ini',   label: 'Hari Ini' },
  { key: 'minggu_ini', label: 'Minggu Ini' },
  { key: 'selesai',    label: 'Selesai' },
];

// ─── SCREEN UTAMA ─────────────────────────────────────────────────────────────
export default function AktivitasScreen() {
  const { theme } = useTheme();
  const { isMobile, isDesktop } = useResponsive();
  const haptics = useHaptics();
  const insets = useSafeAreaInsets();
  const { show: showSnackbar } = useSnackbar();
  // Simpan task yang baru dihapus untuk keperluan undo
  const deletedTaskRef = useRef<import('../../src/types/task.types').Task | null>(null);

  // Stores
  const { tasks, addTask, updateTask, removeTask, completeTask, loadSeedData: loadTaskSeed } = useTaskStore();
  const { sessions: classSessions, addSession, removeSession, loadSeedData: loadScheduleSeed } = useScheduleStore();
  const { sessions: focusSessions, settings: focusSettings, addSession: addFocusSession, completeSession, updateSettings } = useFocusStore();
  const { profile, addXP, updateStreak, incrementTasksCompleted, addFocusMinutes, unlockBadge } = useProfileStore();

  // UI state
  const [mainTab,     setMainTab]     = useState<MainTab>('tugas');
  const [filterTab,   setFilterTab]   = useState<FilterTab>('semua');
  const [search,      setSearch]      = useState('');
  const [mkFilter,    setMkFilter]    = useState('Semua');
  const [modal,       setModal]       = useState<ModalType>(null);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [focusTaskId, setFocusTaskId] = useState<string | undefined>();

  // Seed data bila kosong (pertama kali)
  const hasSeeded = React.useRef(false);
  React.useEffect(() => {
    if (!hasSeeded.current && tasks.length === 0 && classSessions.length === 0) {
      loadTaskSeed();
      loadScheduleSeed();
      hasSeeded.current = true;
    }
  }, []);

  // Filtered tasks
  const filteredTasks = useMemo(
    () => filterTasks(tasks, filterTab, search, mkFilter),
    [tasks, filterTab, search, mkFilter]
  );

  const mataKuliahOptions = useMemo(() => getUniqueMataKuliah(tasks), [tasks]);
  const mkFilterOptions = ['Semua', ...mataKuliahOptions];

  // Pomodoro timer
  const handleSessionComplete = useCallback((phase: FocusPhase, durationMinutes: number) => {
    if (phase !== 'fokus') return;
    const id = generateId();
    addFocusSession({
      id,
      taskId: focusTaskId,
      phase,
      durationMinutes,
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      completed: true,
    });
    // Update pomodoro count pada tugas terkait
    if (focusTaskId) {
      const t = tasks.find((tk) => tk.id === focusTaskId);
      if (t) updateTask(focusTaskId, { pomodoroCount: t.pomodoroCount + 1 });
    }
    addFocusMinutes(durationMinutes);
    addXP(10);
    updateStreak();
    // Badge: 60 menit fokus
    if (profile.totalFocusMinutes + durationMinutes >= 60) {
      unlockBadge('focus_60min');
    }
  }, [focusTaskId, tasks, addFocusSession, updateTask, addFocusMinutes, addXP, updateStreak, unlockBadge, profile.totalFocusMinutes]);

  const timer = usePomodoroTimer({
    settings: focusSettings,
    taskId: focusTaskId,
    onSessionComplete: handleSessionComplete,
  });

  const linkedTask = focusTaskId ? tasks.find((t) => t.id === focusTaskId) : undefined;

  // ── Aksi tugas ──────────────────────────────────────────────────────────────
  const handleAddTask = useCallback((data: Omit<Task, 'id' | 'createdAt' | 'pomodoroCount'>) => {
    const newTask: Task = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      pomodoroCount: 0,
      ...data,
    };
    addTask(newTask);
    haptics.impact('medium');
    setModal(null);
  }, [addTask, haptics]);

  const handleEditTask = useCallback((data: Omit<Task, 'id' | 'createdAt' | 'pomodoroCount'>) => {
    if (!editingTask) return;
    updateTask(editingTask.id, data);
    haptics.impact('light');
    setModal(null);
    setEditingTask(undefined);
  }, [editingTask, updateTask, haptics]);

  const handleCompleteTask = useCallback((id: string) => {
    const task = tasks.find((t) => t.id === id);
    completeTask(id);
    incrementTasksCompleted();
    addXP(20);
    updateStreak();
    haptics.notification('success');
    // Snackbar konfirmasi
    showSnackbar({
      message: task ? `✓ "${task.title}" selesai! +20 XP` : '✓ Tugas selesai! +20 XP',
      type: 'success',
      duration: 2500,
    });
    // Badge
    const totalDone = profile.totalTasksCompleted + 1;
    if (totalDone === 1)  unlockBadge('first_task');
    if (totalDone === 10) unlockBadge('task_10');
  }, [completeTask, incrementTasksCompleted, addXP, updateStreak, haptics, unlockBadge, profile, tasks, showSnackbar]);

  const handleDeleteTask = useCallback((id: string) => {
    // Simpan salinan sebelum menghapus untuk undo
    const taskToDelete = tasks.find((t) => t.id === id);
    deletedTaskRef.current = taskToDelete ?? null;
    removeTask(id);
    haptics.impact('heavy');
    showSnackbar({
      message: taskToDelete ? `"${taskToDelete.title}" dihapus` : 'Tugas dihapus',
      type: 'info',
      duration: 4000,
      actionLabel: 'Batalkan',
      onAction: () => {
        if (deletedTaskRef.current) {
          // addTask menaruh di awal array, kembalikan tugas persis
          addTask(deletedTaskRef.current);
          deletedTaskRef.current = null;
          haptics.notification('success');
        }
      },
    });
  }, [removeTask, addTask, haptics, showSnackbar, tasks]);

  // ── Aksi kelas ──────────────────────────────────────────────────────────────
  const handleAddClass = useCallback((data: Omit<ClassSession, 'id'>) => {
    addSession({ id: generateId(), ...data });
    haptics.impact('light');
    setModal(null);
  }, [addSession, haptics]);

  // ── Statistik tugas ─────────────────────────────────────────────────────────
  const taskStats = useMemo(() => ({
    total:   tasks.length,
    aktif:   tasks.filter((t) => t.status !== 'selesai').length,
    selesai: tasks.filter((t) => t.status === 'selesai').length,
  }), [tasks]);

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['bottom']}>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.background, paddingTop: insets.top + 8 }]}>
        <View>
          <ThemedText variant="title" bold>Aktivitas</ThemedText>
          <ThemedText variant="caption" muted>
            {taskStats.aktif} aktif · {taskStats.selesai} selesai
          </ThemedText>
        </View>
        <Pressable
          onPress={() => {
            if (mainTab === 'tugas')  { setEditingTask(undefined); setModal('add_task'); }
            if (mainTab === 'jadwal') setModal('add_class');
            if (mainTab === 'fokus')  setModal('focus_full');
          }}
          accessibilityRole="button"
          accessibilityLabel={mainTab === 'tugas' ? 'Tambah tugas' : mainTab === 'jadwal' ? 'Tambah kelas' : 'Mode fokus penuh'}
          style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
        >
          <Ionicons
            name={mainTab === 'fokus' ? 'expand' : 'add'}
            size={22}
            color="#fff"
          />
        </Pressable>
      </View>

      {/* Tab Tugas / Jadwal / Fokus */}
      <View style={{ paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.sm }}>
        <TabBar active={mainTab} onChange={setMainTab} />
      </View>

      {/* ── TAB: TUGAS ───────────────────────────────────────────────────── */}
      {mainTab === 'tugas' && (
        <View style={{ flex: 1 }}>
          {/* Search bar */}
          <View style={[styles.searchRow, { paddingHorizontal: theme.spacing.md }]}>
            <View style={[styles.searchBox, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border }]}>
              <Ionicons name="search" size={16} color={theme.colors.textMuted} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Cari tugas..."
                placeholderTextColor={theme.colors.textMuted}
                style={{ flex: 1, fontSize: theme.font.size.md, color: theme.colors.textPrimary }}
                returnKeyType="search"
                clearButtonMode="while-editing"
                accessibilityLabel="Cari tugas"
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={16} color={theme.colors.textMuted} />
                </Pressable>
              )}
            </View>
          </View>

          {/* Filter tab */}
          <View style={{ paddingHorizontal: theme.spacing.md, marginBottom: theme.spacing.sm }}>
            <FlatList
              horizontal
              data={FILTER_TABS}
              keyExtractor={(i) => i.key}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: theme.spacing.xs }}
              renderItem={({ item }) => {
                const active = item.key === filterTab;
                return (
                  <Pressable
                    onPress={() => setFilterTab(item.key)}
                    style={{
                      paddingVertical: 5,
                      paddingHorizontal: 12,
                      borderRadius: theme.radius.full,
                      backgroundColor: active ? theme.colors.primary : theme.colors.surfaceAlt,
                      borderWidth: 1,
                      borderColor: active ? theme.colors.primary : theme.colors.border,
                    }}
                  >
                    <ThemedText style={{
                      fontSize: theme.font.size.sm,
                      fontWeight: active ? theme.font.weight.semibold : theme.font.weight.regular,
                      color: active ? '#fff' : theme.colors.textSecondary,
                    }}>
                      {item.label}
                    </ThemedText>
                  </Pressable>
                );
              }}
            />
          </View>

          {/* Filter mata kuliah */}
          {mataKuliahOptions.length > 0 && (
            <View style={{ paddingHorizontal: theme.spacing.md, marginBottom: theme.spacing.sm }}>
              <FlatList
                horizontal
                data={mkFilterOptions}
                keyExtractor={(i) => i}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: theme.spacing.xs }}
                renderItem={({ item }) => {
                  const active = item === mkFilter;
                  return (
                    <Pressable
                      onPress={() => setMkFilter(item)}
                      style={{
                        paddingVertical: 3,
                        paddingHorizontal: 10,
                        borderRadius: theme.radius.full,
                        backgroundColor: active ? theme.colors.secondary + '20' : 'transparent',
                        borderWidth: 1,
                        borderColor: active ? theme.colors.secondary : theme.colors.border,
                      }}
                    >
                      <ThemedText style={{
                        fontSize: theme.font.size.xs,
                        fontWeight: active ? theme.font.weight.semibold : theme.font.weight.regular,
                        color: active ? theme.colors.secondary : theme.colors.textMuted,
                      }}>
                        {item}
                      </ThemedText>
                    </Pressable>
                  );
                }}
              />
            </View>
          )}

          {/* Daftar tugas */}
          {filteredTasks.length === 0 ? (
            <EmptyState
              icon={search ? 'search-outline' : 'checkmark-done-circle-outline'}
              title={search ? 'Tidak ditemukan' : filterTab === 'selesai' ? 'Belum ada tugas selesai' : 'Belum ada tugas aktif'}
              subtitle={search ? 'Coba kata kunci lain' : 'Ketuk + untuk menambah tugas baru'}
            />
          ) : (
            <FlatList
              data={filteredTasks}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{
                paddingHorizontal: theme.spacing.md,
                paddingBottom: 100,
              }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TaskCard
                  task={item}
                  onComplete={() => handleCompleteTask(item.id)}
                  onDelete={() => handleDeleteTask(item.id)}
                  onPress={() => { setEditingTask(item); setModal('edit_task'); }}
                />
              )}
            />
          )}
        </View>
      )}

      {/* ── TAB: JADWAL ──────────────────────────────────────────────────── */}
      {mainTab === 'jadwal' && (
        <View style={{ flex: 1, paddingHorizontal: theme.spacing.md }}>
          <ScheduleView
            sessions={classSessions}
            onAddSession={() => setModal('add_class')}
            onDeleteSession={(id) => { removeSession(id); haptics.impact('medium'); }}
          />
          {classSessions.length === 0 && (
            <EmptyState
              icon="calendar-outline"
              title="Belum ada jadwal"
              subtitle="Ketuk + untuk menambah kelas"
            />
          )}
        </View>
      )}

      {/* ── TAB: FOKUS (inline, bukan full-screen) ───────────────────────── */}
      {mainTab === 'fokus' && (
        <View style={{ flex: 1 }}>
          {/* Pemilih tugas */}
          <View style={{ paddingHorizontal: theme.spacing.md, marginBottom: theme.spacing.sm }}>
            <ThemedText variant="caption" muted style={{ marginBottom: 6 }}>
              Tautkan ke tugas (opsional):
            </ThemedText>
            <FlatList
              horizontal
              data={[{ id: '', title: 'Tanpa Tugas' }, ...tasks.filter((t) => t.status !== 'selesai').slice(0, 10)]}
              keyExtractor={(i) => i.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 6 }}
              renderItem={({ item }) => {
                const active = item.id === (focusTaskId ?? '');
                return (
                  <Pressable
                    onPress={() => setFocusTaskId(item.id || undefined)}
                    style={{
                      paddingVertical: 5,
                      paddingHorizontal: 12,
                      borderRadius: theme.radius.full,
                      backgroundColor: active ? theme.colors.focus + '20' : theme.colors.surfaceAlt,
                      borderWidth: 1,
                      borderColor: active ? theme.colors.focus : theme.colors.border,
                      maxWidth: 180,
                    }}
                  >
                    <ThemedText numberOfLines={1} style={{
                      fontSize: theme.font.size.xs,
                      fontWeight: active ? theme.font.weight.semibold : theme.font.weight.regular,
                      color: active ? theme.colors.focus : theme.colors.textSecondary,
                    }}>
                      {item.title}
                    </ThemedText>
                  </Pressable>
                );
              }}
            />
          </View>

          {/* Timer */}
          <FocusTimer
            phase={timer.phase}
            timerState={timer.timerState}
            secondsLeft={timer.secondsLeft}
            totalSeconds={timer.totalSeconds}
            progress={timer.progress}
            sessionCount={timer.sessionCount}
            settings={focusSettings}
            linkedTask={linkedTask}
            onStart={timer.start}
            onPause={timer.pause}
            onResume={timer.resume}
            onSkip={timer.skip}
            onReset={timer.reset}
            onClose={undefined}
          />

          {/* Statistik sesi hari ini */}
          {focusSessions.length > 0 && (
            <View style={{ paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.lg }}>
              <Pressable
                style={[styles.statsRow, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border }]}
              >
                <View style={{ alignItems: 'center' }}>
                  <ThemedText bold style={{ color: theme.colors.focus }}>{focusSessions.filter((s) => s.phase === 'fokus' && s.completed).length}</ThemedText>
                  <ThemedText variant="caption" muted>Sesi</ThemedText>
                </View>
                <View style={{ width: 1, backgroundColor: theme.colors.border, height: '100%' }} />
                <View style={{ alignItems: 'center' }}>
                  <ThemedText bold style={{ color: theme.colors.focus }}>
                    {formatDuration(focusSessions.filter((s) => s.phase === 'fokus' && s.completed).reduce((sum, s) => sum + s.durationMinutes, 0))}
                  </ThemedText>
                  <ThemedText variant="caption" muted>Total Fokus</ThemedText>
                </View>
                <View style={{ width: 1, backgroundColor: theme.colors.border, height: '100%' }} />
                <View style={{ alignItems: 'center' }}>
                  <ThemedText bold style={{ color: theme.colors.focus }}>{profile.totalFocusMinutes}m</ThemedText>
                  <ThemedText variant="caption" muted>Semua Waktu</ThemedText>
                </View>
              </Pressable>
            </View>
          )}
        </View>
      )}

      {/* ── FAB mobile: tambah cepat ─────────────────────────────────────── */}
      {isMobile && mainTab !== 'fokus' && (
        <Pressable
          onPress={() => {
            if (mainTab === 'tugas')  { setEditingTask(undefined); setModal('add_task'); }
            if (mainTab === 'jadwal') setModal('add_class');
          }}
          accessibilityRole="button"
          accessibilityLabel="Tambah"
          style={[styles.fab, { backgroundColor: theme.colors.primary, bottom: insets.bottom + 16 }]}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </Pressable>
      )}

      {/* ── MODAL: Tambah/Edit Tugas ─────────────────────────────────────── */}
      <AppModal
        visible={modal === 'add_task' || modal === 'edit_task'}
        onClose={() => { setModal(null); setEditingTask(undefined); }}
        title={modal === 'edit_task' ? 'Edit Tugas' : 'Tambah Tugas'}
        desktopWidth={520}
      >
        <TaskForm
          initial={editingTask}
          mataKuliahOptions={mataKuliahOptions}
          onSubmit={modal === 'edit_task' ? handleEditTask : handleAddTask}
          onCancel={() => { setModal(null); setEditingTask(undefined); }}
        />
      </AppModal>

      {/* ── MODAL: Tambah Kelas ───────────────────────────────────────────── */}
      <AppModal
        visible={modal === 'add_class'}
        onClose={() => setModal(null)}
        title="Tambah Jadwal Kelas"
        desktopWidth={480}
      >
        <ClassSessionForm
          onSubmit={handleAddClass}
          onCancel={() => setModal(null)}
        />
      </AppModal>

      {/* ── MODAL: Mode Fokus Full-Screen ───────────────────────────────── */}
      <Modal
        visible={modal === 'focus_full'}
        animationType="slide"
        onRequestClose={() => setModal(null)}
        statusBarTranslucent
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <FocusTimer
            phase={timer.phase}
            timerState={timer.timerState}
            secondsLeft={timer.secondsLeft}
            totalSeconds={timer.totalSeconds}
            progress={timer.progress}
            sessionCount={timer.sessionCount}
            settings={focusSettings}
            linkedTask={linkedTask}
            onStart={timer.start}
            onPause={timer.pause}
            onResume={timer.resume}
            onSkip={timer.skip}
            onReset={timer.reset}
            onClose={() => setModal(null)}
          />
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 3,
    gap: 2,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 7,
  },
  searchRow: {
    marginBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 44,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    height: 64,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
});

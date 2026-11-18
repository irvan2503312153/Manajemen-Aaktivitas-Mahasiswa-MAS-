// src/components/tasks/TaskForm.tsx
// Form tambah/edit tugas — validasi lengkap

import React, { useState, useEffect } from 'react';
import { View, Pressable, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task, Priority, TaskStatus } from '../../types/task.types';
import { useTheme } from '../../theme/ThemeContext';
import { ThemedText } from '../common/ThemedText';
import { FormField, SelectField } from '../common/FormField';
import { validateTask } from '../../utils/validators';
import { formatDate } from '../../utils/formatters';

interface TaskFormProps {
  initial?: Partial<Task>;
  mataKuliahOptions: string[];
  onSubmit: (data: Omit<Task, 'id' | 'createdAt' | 'pomodoroCount'>) => void;
  onCancel: () => void;
}

const PRIORITY_OPTIONS = [
  { label: 'Rendah', value: 'rendah' },
  { label: 'Sedang', value: 'sedang' },
  { label: 'Tinggi', value: 'tinggi' },
];

const STATUS_OPTIONS = [
  { label: 'Belum', value: 'belum' },
  { label: 'Proses', value: 'proses' },
  { label: 'Selesai', value: 'selesai' },
];

/** Format ISO untuk input date (YYYY-MM-DDTHH:mm) */
function toDateInput(iso: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch { return ''; }
}

/** Parse dari datetime-local ke ISO */
function fromDateInput(val: string): string {
  if (!val) return '';
  try { return new Date(val).toISOString(); }
  catch { return val; }
}

export function TaskForm({ initial, mataKuliahOptions, onSubmit, onCancel }: TaskFormProps) {
  const { theme } = useTheme();

  const [title,       setTitle]       = useState(initial?.title ?? '');
  const [mataKuliah,  setMataKuliah]  = useState(initial?.mataKuliah ?? '');
  const [deadline,    setDeadline]    = useState(initial?.deadline ?? '');
  const [priority,    setPriority]    = useState<Priority>(initial?.priority ?? 'sedang');
  const [status,      setStatus]      = useState<TaskStatus>(initial?.status ?? 'belum');
  const [notes,       setNotes]       = useState(initial?.notes ?? '');
  const [errors,      setErrors]      = useState<Record<string, string>>({});

  // Daftar mata kuliah: gabung existing + input bebas
  const mkOptions = Array.from(new Set([
    ...mataKuliahOptions,
    ...(mataKuliah && !mataKuliahOptions.includes(mataKuliah) ? [mataKuliah] : []),
  ]));

  function handleSubmit() {
    const data = {
      title: title.trim(),
      mataKuliah: mataKuliah.trim(),
      deadline,
      priority,
      status,
      notes: notes.trim() || undefined,
      completedAt: status === 'selesai' ? (initial?.completedAt ?? new Date().toISOString()) : undefined,
    };
    const result = validateTask(data);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    onSubmit(data);
  }

  return (
    <View style={{ gap: 0 }}>
      {/* Judul */}
      <FormField
        label="Judul Tugas"
        required
        value={title}
        onChangeText={(t) => { setTitle(t); setErrors((e) => ({ ...e, title: '' })); }}
        placeholder="cth. Implementasi REST API"
        error={errors.title}
        returnKeyType="next"
      />

      {/* Mata Kuliah */}
      <FormField
        label="Mata Kuliah"
        required
        value={mataKuliah}
        onChangeText={(t) => { setMataKuliah(t); setErrors((e) => ({ ...e, mataKuliah: '' })); }}
        placeholder="cth. Pemrograman Web"
        error={errors.mataKuliah}
      />
      {/* Chip pilihan cepat mata kuliah */}
      {mkOptions.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: -8, marginBottom: theme.spacing.md }}>
          {mkOptions.map((mk) => (
            <Pressable
              key={mk}
              onPress={() => setMataKuliah(mk)}
              style={{
                paddingVertical: 3,
                paddingHorizontal: 10,
                borderRadius: theme.radius.full,
                borderWidth: 1,
                borderColor: mataKuliah === mk ? theme.colors.primary : theme.colors.border,
                backgroundColor: mataKuliah === mk ? theme.colors.primary + '15' : theme.colors.surfaceAlt,
              }}
            >
              <ThemedText style={{
                fontSize: theme.font.size.xs,
                color: mataKuliah === mk ? theme.colors.primary : theme.colors.textSecondary,
              }}>
                {mk}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      )}

      {/* Deadline */}
      {Platform.OS === 'web' ? (
        // Web: pakai input datetime-local native
        <View style={{ marginBottom: theme.spacing.md }}>
          <ThemedText variant="label" semibold style={{ marginBottom: theme.spacing.xs, color: theme.colors.textSecondary }}>
            Deadline <ThemedText style={{ color: theme.colors.danger }}>*</ThemedText>
          </ThemedText>
          <input
            type="datetime-local"
            value={toDateInput(deadline)}
            onChange={(e) => {
              setDeadline(fromDateInput(e.target.value));
              setErrors((err) => ({ ...err, deadline: '' }));
            }}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: theme.radius.md,
              border: `1.5px solid ${errors.deadline ? theme.colors.danger : theme.colors.border}`,
              backgroundColor: theme.colors.surfaceAlt,
              color: theme.colors.textPrimary,
              fontSize: 15,
              boxSizing: 'border-box',
              outline: 'none',
            } as React.CSSProperties}
          />
          {errors.deadline ? (
            <ThemedText variant="caption" style={{ color: theme.colors.danger, marginTop: 4 }}>
              {errors.deadline}
            </ThemedText>
          ) : null}
        </View>
      ) : (
        <FormField
          label="Deadline (ISO)"
          required
          value={deadline}
          onChangeText={(t) => { setDeadline(t); setErrors((e) => ({ ...e, deadline: '' })); }}
          placeholder="YYYY-MM-DDTHH:mm:00"
          error={errors.deadline}
          keyboardType="default"
        />
      )}

      {/* Prioritas */}
      <SelectField
        label="Prioritas"
        required
        value={priority}
        options={PRIORITY_OPTIONS}
        onChange={(v) => setPriority(v as Priority)}
        error={errors.priority}
      />

      {/* Status */}
      <SelectField
        label="Status"
        value={status}
        options={STATUS_OPTIONS}
        onChange={(v) => setStatus(v as TaskStatus)}
      />

      {/* Catatan */}
      <FormField
        label="Catatan (opsional)"
        value={notes}
        onChangeText={setNotes}
        placeholder="Tambahkan catatan..."
        multiline
        numberOfLines={3}
        style={{ marginBottom: theme.spacing.lg }}
        // @ts-ignore
        textAlignVertical="top"
      />

      {/* Tombol aksi */}
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm, paddingBottom: theme.spacing.md }}>
        <Pressable
          onPress={onCancel}
          style={({ pressed }) => ({
            flex: 1,
            paddingVertical: 12,
            borderRadius: theme.radius.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
            alignItems: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <ThemedText semibold style={{ color: theme.colors.textSecondary }}>Batal</ThemedText>
        </Pressable>
        <Pressable
          onPress={handleSubmit}
          style={({ pressed }) => ({
            flex: 2,
            paddingVertical: 12,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.primary,
            alignItems: 'center',
            opacity: pressed ? 0.8 : 1,
          })}
          accessibilityRole="button"
          accessibilityLabel="Simpan tugas"
        >
          <ThemedText semibold style={{ color: '#fff' }}>
            {initial?.id ? 'Simpan Perubahan' : 'Tambah Tugas'}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

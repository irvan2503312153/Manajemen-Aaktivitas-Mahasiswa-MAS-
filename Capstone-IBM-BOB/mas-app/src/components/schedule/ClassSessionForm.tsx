// src/components/schedule/ClassSessionForm.tsx
// Form tambah jadwal kelas

import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { ClassSession, DayOfWeek } from '../../types/schedule.types';
import { useTheme } from '../../theme/ThemeContext';
import { ThemedText } from '../common/ThemedText';
import { FormField, SelectField } from '../common/FormField';

interface ClassSessionFormProps {
  onSubmit: (data: Omit<ClassSession, 'id'>) => void;
  onCancel: () => void;
}

const DAY_OPTIONS: { label: string; value: string }[] = [
  { label: 'Sen', value: 'Senin' },
  { label: 'Sel', value: 'Selasa' },
  { label: 'Rab', value: 'Rabu' },
  { label: 'Kam', value: 'Kamis' },
  { label: 'Jum', value: 'Jumat' },
  { label: 'Sab', value: 'Sabtu' },
];

const COLOR_OPTIONS = ['#5B6EF5','#FF7043','#4CAF50','#29B6F6','#FFC107','#AB47BC','#26A69A'];

export function ClassSessionForm({ onSubmit, onCancel }: ClassSessionFormProps) {
  const { theme } = useTheme();

  const [mataKuliah, setMataKuliah] = useState('');
  const [dosen,      setDosen]      = useState('');
  const [ruangan,    setRuangan]    = useState('');
  const [day,        setDay]        = useState<DayOfWeek>('Senin');
  const [startTime,  setStartTime]  = useState('08:00');
  const [endTime,    setEndTime]    = useState('09:40');
  const [color,      setColor]      = useState(COLOR_OPTIONS[0]);
  const [errors,     setErrors]     = useState<Record<string,string>>({});

  function validate() {
    const e: Record<string,string> = {};
    if (!mataKuliah.trim()) e.mataKuliah = 'Mata kuliah wajib diisi';
    if (!startTime.match(/^\d{2}:\d{2}$/)) e.startTime = 'Format HH:MM';
    if (!endTime.match(/^\d{2}:\d{2}$/)) e.endTime = 'Format HH:MM';
    if (startTime >= endTime) e.endTime = 'Harus setelah waktu mulai';
    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSubmit({ mataKuliah: mataKuliah.trim(), dosen: dosen.trim() || undefined, ruangan: ruangan.trim() || undefined, day, startTime, endTime, color });
  }

  return (
    <View>
      <FormField label="Mata Kuliah" required value={mataKuliah} onChangeText={(v) => { setMataKuliah(v); setErrors((e) => ({ ...e, mataKuliah: '' })); }} error={errors.mataKuliah} placeholder="cth. Basis Data" />
      <FormField label="Dosen (opsional)" value={dosen} onChangeText={setDosen} placeholder="cth. Dr. Budi Santoso" />
      <FormField label="Ruangan (opsional)" value={ruangan} onChangeText={setRuangan} placeholder="cth. Lab Komputer 1" />

      {/* Hari */}
      <SelectField label="Hari" required value={day} options={DAY_OPTIONS} onChange={(v) => setDay(v as DayOfWeek)} />

      {/* Waktu */}
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        <View style={{ flex: 1 }}>
          <FormField label="Mulai" required value={startTime} onChangeText={(v) => { setStartTime(v); setErrors((e) => ({ ...e, startTime: '' })); }} error={errors.startTime} placeholder="08:00" keyboardType="numbers-and-punctuation" />
        </View>
        <View style={{ flex: 1 }}>
          <FormField label="Selesai" required value={endTime} onChangeText={(v) => { setEndTime(v); setErrors((e) => ({ ...e, endTime: '' })); }} error={errors.endTime} placeholder="09:40" keyboardType="numbers-and-punctuation" />
        </View>
      </View>

      {/* Warna */}
      <ThemedText variant="label" semibold style={{ marginBottom: theme.spacing.xs, color: theme.colors.textSecondary }}>Warna</ThemedText>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: theme.spacing.lg }}>
        {COLOR_OPTIONS.map((c) => (
          <Pressable
            key={c}
            onPress={() => setColor(c)}
            style={{
              width: 28, height: 28, borderRadius: 14,
              backgroundColor: c,
              borderWidth: color === c ? 3 : 1,
              borderColor: color === c ? theme.colors.textPrimary : 'transparent',
            }}
          />
        ))}
      </View>

      {/* Tombol */}
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm, paddingBottom: theme.spacing.md }}>
        <Pressable onPress={onCancel} style={({ pressed }) => ({ flex: 1, paddingVertical: 12, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', opacity: pressed ? 0.7 : 1 })}>
          <ThemedText semibold style={{ color: theme.colors.textSecondary }}>Batal</ThemedText>
        </Pressable>
        <Pressable onPress={handleSubmit} style={({ pressed }) => ({ flex: 2, paddingVertical: 12, borderRadius: theme.radius.md, backgroundColor: theme.colors.primary, alignItems: 'center', opacity: pressed ? 0.8 : 1 })}>
          <ThemedText semibold style={{ color: '#fff' }}>Tambah Kelas</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

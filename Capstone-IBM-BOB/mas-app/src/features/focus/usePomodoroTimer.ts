// src/features/focus/usePomodoroTimer.ts
// Hook Pomodoro timer — menggunakan setInterval dengan cleanup yang aman

import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { FocusPhase, FocusSettings } from '../../types/focus.types';

export type TimerState = 'idle' | 'running' | 'paused' | 'finished';

interface UsePomodoroTimerOptions {
  settings: FocusSettings;
  taskId?: string;
  onSessionComplete?: (phase: FocusPhase, durationMinutes: number) => void;
}

interface UsePomodoroTimerReturn {
  phase: FocusPhase;
  timerState: TimerState;
  secondsLeft: number;
  totalSeconds: number;
  sessionCount: number;   // sesi fokus selesai dalam satu run
  progress: number;       // 0–1
  start: () => void;
  pause: () => void;
  resume: () => void;
  skip: () => void;
  reset: () => void;
}

function phaseSeconds(phase: FocusPhase, settings: FocusSettings): number {
  if (phase === 'fokus')             return settings.workMinutes * 60;
  if (phase === 'istirahat_panjang') return settings.longBreakMinutes * 60;
  return settings.shortBreakMinutes * 60;
}

function nextPhase(phase: FocusPhase, sessionCount: number, settings: FocusSettings): FocusPhase {
  if (phase !== 'fokus') return 'fokus';
  if ((sessionCount + 1) % settings.sessionsBeforeLongBreak === 0) return 'istirahat_panjang';
  return 'istirahat_pendek';
}

export function usePomodoroTimer({
  settings,
  taskId,
  onSessionComplete,
}: UsePomodoroTimerOptions): UsePomodoroTimerReturn {
  const [phase, setPhase]           = useState<FocusPhase>('fokus');
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [sessionCount, setSessionCount] = useState(0);

  const totalSecs = phaseSeconds(phase, settings);
  const [secondsLeft, setSecondsLeft] = useState(totalSecs);

  // Refs untuk menjaga nilai terkini tanpa re-render
  const phaseRef        = useRef(phase);
  const sessionCountRef = useRef(sessionCount);
  const intervalRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef      = useRef<number | null>(null); // epoch ms kapan timer berakhir

  // Sync refs
  phaseRef.current        = phase;
  sessionCountRef.current = sessionCount;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /** Maju ke fase berikutnya */
  const advancePhase = useCallback(() => {
    const finishedPhase = phaseRef.current;
    const finishedCount = sessionCountRef.current;

    onSessionComplete?.(
      finishedPhase,
      phaseRef.current === 'fokus' ? settings.workMinutes :
        finishedPhase === 'istirahat_panjang' ? settings.longBreakMinutes : settings.shortBreakMinutes
    );

    const newCount = finishedPhase === 'fokus' ? finishedCount + 1 : finishedCount;
    const next = nextPhase(finishedPhase, finishedCount, settings);

    setSessionCount(newCount);
    setPhase(next);
    setTimerState(settings.autoStartBreak ? 'running' : 'finished');
    setSecondsLeft(phaseSeconds(next, settings));
  }, [settings, onSessionComplete]);

  /** Tick interval — akurat karena pakai endTime */
  const startTick = useCallback(() => {
    clearTimer();
    endTimeRef.current = Date.now() + secondsLeft * 1000;

    intervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.round((endTimeRef.current! - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) {
        clearTimer();
        advancePhase();
      }
    }, 500);
  }, [secondsLeft, clearTimer, advancePhase]);

  // Tangani AppState (layar mati / foreground kembali) agar timer tetap akurat
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active' && timerState === 'running' && endTimeRef.current) {
        const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
        setSecondsLeft(remaining);
        if (remaining === 0) advancePhase();
      }
    });
    return () => sub.remove();
  }, [timerState, advancePhase]);

  // Cleanup saat unmount
  useEffect(() => () => clearTimer(), [clearTimer]);

  const start = useCallback(() => {
    setTimerState('running');
    // secondsLeft masih penuh karena belum dimulai
  }, []);

  // Jalankan tick saat state berubah ke running
  useEffect(() => {
    if (timerState === 'running') {
      startTick();
    } else {
      clearTimer();
    }
  }, [timerState]); // eslint-disable-line react-hooks/exhaustive-deps

  const pause = useCallback(() => {
    clearTimer();
    setTimerState('paused');
  }, [clearTimer]);

  const resume = useCallback(() => {
    setTimerState('running');
  }, []);

  const skip = useCallback(() => {
    clearTimer();
    advancePhase();
  }, [clearTimer, advancePhase]);

  const reset = useCallback(() => {
    clearTimer();
    setPhase('fokus');
    setTimerState('idle');
    setSessionCount(0);
    setSecondsLeft(settings.workMinutes * 60);
  }, [clearTimer, settings.workMinutes]);

  const progress = 1 - secondsLeft / totalSecs;

  return {
    phase, timerState, secondsLeft,
    totalSeconds: totalSecs,
    sessionCount, progress,
    start, pause, resume, skip, reset,
  };
}

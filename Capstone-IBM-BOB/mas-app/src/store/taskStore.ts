// src/store/taskStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types/task.types';
import { seedTasks } from '../utils/seedData';

interface TaskState {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  removeTask: (id: string) => void;
  completeTask: (id: string) => void;
  resetTasks: () => void;
  loadSeedData: () => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],

      addTask: (task) =>
        set((s) => ({ tasks: [task, ...s.tasks] })),

      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),

      removeTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      completeTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, status: 'selesai', completedAt: new Date().toISOString() }
              : t
          ),
        })),

      resetTasks: () => set({ tasks: [] }),

      loadSeedData: () => set({ tasks: seedTasks }),
    }),
    {
      name: '@mas/tasks',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

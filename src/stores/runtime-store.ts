import { create } from 'zustand';
import { Resource } from '@/types/project';
import { RequestLog } from '@/lib/gen/handlers';

interface RuntimeState {
  isEnabled: boolean;
  isInitializing: boolean;
  seed: number;
  logs: RequestLog[];
  error: string | null;

  setEnabled: (enabled: boolean) => void;
  setInitializing: (initializing: boolean) => void;
  setSeed: (seed: number) => void;
  addLog: (log: RequestLog) => void;
  clearLogs: () => void;
  setLogs: (logs: RequestLog[]) => void;
  setError: (error: string | null) => void;
  randomizeSeed: () => number;
}

export const useRuntimeStore = create<RuntimeState>((set, get) => ({
  isEnabled: false,
  isInitializing: false,
  seed: Date.now(),
  logs: [],
  error: null,

  setEnabled: (enabled: boolean) => {
    set({ isEnabled: enabled });
  },

  setInitializing: (initializing: boolean) => {
    set({ isInitializing: initializing });
  },

  setSeed: (seed: number) => {
    set({ seed });
  },

  addLog: (log: RequestLog) => {
    const { logs } = get();
    set({ logs: [log, ...logs].slice(0, 100) });
  },

  clearLogs: () => {
    set({ logs: [] });
  },

  setLogs: (logs: RequestLog[]) => {
    set({ logs });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  randomizeSeed: () => {
    const newSeed = Date.now();
    set({ seed: newSeed });
    return newSeed;
  },
}));

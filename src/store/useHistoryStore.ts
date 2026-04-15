import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { FocusSession, FocusMode } from '../types';
import { mmkvStorage } from './storage';

interface HistoryState {
  sessions: FocusSession[];

  // Actions
  addSession: (session: FocusSession) => void;
  getWeeklyXP: () => number[];
  getCompletionRate: (mode: FocusMode) => number;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      sessions: [],

      addSession: (session) =>
        set((state) => ({ sessions: [...state.sessions, session] })),

      getWeeklyXP: () => {
        const { sessions } = get();
        return Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          const dayStr = date.toISOString().split('T')[0];
          return sessions
            .filter((s) => s.startedAt.startsWith(dayStr))
            .reduce((sum, s) => sum + s.xpEarned, 0);
        });
      },

      getCompletionRate: (mode) => {
        const { sessions } = get();
        const modeSessions = sessions.filter((s) => s.mode === mode);
        if (modeSessions.length === 0) return 0;
        const completed = modeSessions.filter((s) => s.completed).length;
        return Math.round((completed / modeSessions.length) * 100);
      },
    }),
    {
      name: 'history-store',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({ sessions: state.sessions }),
    }
  )
);

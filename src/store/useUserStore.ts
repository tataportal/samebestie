import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Rank } from '../types';
import { getLevelFromXP, getRankFromLevel, getXPProgress } from '../utils/levelSystem';
import { mmkvStorage } from './storage';

interface UserState {
  isOnboarded: boolean;
  onboardingStep: 1 | 2 | 3 | 4;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string | null;

  // Computed getters
  currentLevel: () => number;
  rank: () => Rank;
  xpProgress: () => { level: number; current: number; max: number; ratio: number };

  // Actions
  completeOnboarding: () => void;
  setOnboardingStep: (step: 1 | 2 | 3 | 4) => void;
  addXP: (amount: number) => void;
  updateStreak: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      isOnboarded: false,
      onboardingStep: 1 as 1 | 2 | 3 | 4,
      totalXP: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastSessionDate: null,

      currentLevel: () => getLevelFromXP(get().totalXP),
      rank: () => getRankFromLevel(getLevelFromXP(get().totalXP)),
      xpProgress: () => getXPProgress(get().totalXP),

      completeOnboarding: () => set({ isOnboarded: true }),
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      addXP: (amount) => set((state) => ({ totalXP: state.totalXP + amount })),

      updateStreak: () =>
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          const lastDate = state.lastSessionDate;
          if (lastDate === today) return { lastSessionDate: today };

          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          const newStreak = lastDate === yesterdayStr ? state.currentStreak + 1 : 1;
          return {
            currentStreak: newStreak,
            longestStreak: Math.max(state.longestStreak, newStreak),
            lastSessionDate: today,
          };
        }),
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        isOnboarded: state.isOnboarded,
        onboardingStep: state.onboardingStep,
        totalXP: state.totalXP,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        lastSessionDate: state.lastSessionDate,
      }),
    }
  )
);

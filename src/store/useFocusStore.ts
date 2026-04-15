import { create } from 'zustand';
import {
  FocusMode,
  TaskType,
  MoodLevel,
  EmotionTag,
  PostSessionMood,
} from '../types';

interface FocusState {
  isActive: boolean;
  mode: FocusMode;
  taskType: TaskType | null;
  studySubject: string | null;
  preMood: MoodLevel | null;
  preEmotions: EmotionTag[];
  postMood: PostSessionMood | null;
  startedAt: string | null;
  isPaused: boolean;
  interruptions: number;

  // Round tracking
  currentRound: number;
  totalRounds: number;
  focusSecs: number;       // per-round focus duration (seconds)
  breakSecs: number;       // per-round break duration (seconds)
  isBreak: boolean;        // currently in a break?
  timerDuration: number;   // current period duration
  timerRemaining: number;  // current period remaining
  focusSecsCompleted: number; // total focus seconds accumulated (for XP)

  // Actions
  startSession: (mode: FocusMode, focusSecs: number, breakSecs: number, totalRounds: number) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  tick: () => void;
  startBreak: () => void;
  startNextRound: () => void;
  endSession: () => void;
  setCheckIn: (mood: MoodLevel, emotions: EmotionTag[], taskType: TaskType, studySubject?: string) => void;
  setPostMood: (mood: PostSessionMood) => void;
  resetSession: () => void;
}

const initialState = {
  isActive: false,
  mode: 'classic' as FocusMode,
  taskType: null as TaskType | null,
  studySubject: null as string | null,
  preMood: null as MoodLevel | null,
  preEmotions: [] as EmotionTag[],
  postMood: null as PostSessionMood | null,
  startedAt: null as string | null,
  isPaused: false,
  interruptions: 0,
  currentRound: 1,
  totalRounds: 1,
  focusSecs: 1500,
  breakSecs: 300,
  isBreak: false,
  timerDuration: 0,
  timerRemaining: 0,
  focusSecsCompleted: 0,
};

export const useFocusStore = create<FocusState>((set, get) => ({
  ...initialState,

  startSession: (mode, focusSecs, breakSecs, totalRounds) =>
    set({
      isActive: true,
      mode,
      focusSecs,
      breakSecs,
      totalRounds,
      currentRound: 1,
      isBreak: false,
      timerDuration: focusSecs,
      timerRemaining: focusSecs,
      isPaused: false,
      interruptions: 0,
      postMood: null,
      focusSecsCompleted: 0,
      startedAt: new Date().toISOString(),
    }),

  pauseSession: () =>
    set((state) => ({ isPaused: true, interruptions: state.interruptions + 1 })),

  resumeSession: () => set({ isPaused: false }),

  tick: () =>
    set((state) => {
      if (!state.isActive || state.isPaused || state.timerRemaining <= 0) return state;
      return {
        timerRemaining: state.timerRemaining - 1,
        // Only accumulate focus time, not break time
        ...(!state.isBreak ? { focusSecsCompleted: state.focusSecsCompleted + 1 } : {}),
      };
    }),

  startBreak: () =>
    set((state) => ({
      isBreak: true,
      timerDuration: state.breakSecs,
      timerRemaining: state.breakSecs,
    })),

  startNextRound: () =>
    set((state) => ({
      isBreak: false,
      currentRound: state.currentRound + 1,
      timerDuration: state.focusSecs,
      timerRemaining: state.focusSecs,
    })),

  endSession: () => set({ isActive: false, isPaused: false }),

  setCheckIn: (mood, emotions, taskType, studySubject) =>
    set({ preMood: mood, preEmotions: emotions, taskType, studySubject: studySubject ?? null }),

  setPostMood: (mood) => set({ postMood: mood }),

  resetSession: () => set({ ...initialState }),
}));

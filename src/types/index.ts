// === Enums ===

export type Personality = 'soft' | 'chaotic' | 'strict';

export type PetAnimal = 'penguin' | 'cat' | 'fox' | 'frog' | 'panda';

export const PET_ANIMALS: { type: PetAnimal; emoji: string; label: string }[] = [
  { type: 'penguin', emoji: '🐧', label: 'Penguin' },
  { type: 'cat',     emoji: '🐱', label: 'Cat' },
  { type: 'fox',     emoji: '🦊', label: 'Fox' },
  { type: 'frog',    emoji: '🐸', label: 'Frog' },
  { type: 'panda',   emoji: '🐼', label: 'Panda' },
];

export type FocusMode = 'tiny-start' | 'gentle' | 'classic' | 'hyper';

export type TaskType = 'admin' | 'study' | 'creative' | 'deep-work' | 'urgent';

export type MoodLevel = 'fried' | 'low' | 'neutral' | 'good' | 'sharp';

export type EmotionTag = 'anxious' | 'bored' | 'sleepy' | 'locked-in' | 'chaotic' | 'inspired';

export type PostSessionMood = 'better' | 'same' | 'worse';

export type PetMood = 'proud' | 'neutral' | 'disappointed' | 'judging' | 'chaotic';

export type BondTier = 1 | 2 | 3 | 4 | 5;

export type Rank = 'Newbie' | 'Focus Rookie' | 'Study Bug' | 'Pro Focus' | 'Elite Quester' | 'Focus Legend';

// === Focus Mode Configs ===

export interface FocusModeConfig {
  mode: FocusMode;
  label: string;
  icon: string;
  description: string;
  focusMinutes: number;
  breakMinutes: number;
  rounds: number;
}

export const FOCUS_MODES: FocusModeConfig[] = [
  {
    mode: 'tiny-start',
    label: 'TINY START',
    icon: 'flash-on',
    description: 'Just 5 minutes. No pressure, no excuses. Perfect when you can\'t even.',
    focusMinutes: 5,
    breakMinutes: 1,
    rounds: 3,
  },
  {
    mode: 'gentle',
    label: 'GENTLE',
    icon: 'spa',
    description: '15 min focus, 3 min break. Low effort, real progress. For slow-start days.',
    focusMinutes: 15,
    breakMinutes: 3,
    rounds: 3,
  },
  {
    mode: 'classic',
    label: 'CLASSIC',
    icon: 'history',
    description: 'The original Pomodoro — 25 min on, 5 min off. Proven to actually work.',
    focusMinutes: 25,
    breakMinutes: 5,
    rounds: 4,
  },
  {
    mode: 'hyper',
    label: 'HYPER',
    icon: 'rocket',
    description: '50 min deep work, 10 min recovery. For when you\'re in beast mode.',
    focusMinutes: 50,
    breakMinutes: 10,
    rounds: 2,
  },
];

// === Task Type Configs ===

export interface TaskTypeConfig {
  type: TaskType;
  label: string;
  icon: string;
}

export const TASK_TYPES: TaskTypeConfig[] = [
  { type: 'admin', label: 'Admin / Cleanup', icon: 'folder' },
  { type: 'study', label: 'Study Session', icon: 'menu-book' },
  { type: 'creative', label: 'Creative Flow', icon: 'palette' },
  { type: 'deep-work', label: 'Deep Work', icon: 'psychology' },
  { type: 'urgent', label: 'Stressful / Urgent', icon: 'priority-high' },
];

// === Mood Configs ===

export interface MoodConfig {
  level: MoodLevel;
  label: string;
  icon: string;
}

export const MOOD_LEVELS: MoodConfig[] = [
  { level: 'fried', label: 'Fried', icon: 'flash-on' },
  { level: 'low', label: 'Low', icon: 'battery-alert' },
  { level: 'neutral', label: 'Neutral', icon: 'sentiment-neutral' },
  { level: 'good', label: 'Good', icon: 'sentiment-satisfied' },
  { level: 'sharp', label: 'Sharp', icon: 'flare' },
];

export const EMOTION_TAGS: EmotionTag[] = [
  'anxious', 'bored', 'sleepy', 'locked-in', 'chaotic', 'inspired',
];

// === Personality Configs ===

export interface PersonalityConfig {
  type: Personality;
  label: string;
  icon: string;
  description: string;
}

export const PERSONALITIES: PersonalityConfig[] = [
  {
    type: 'soft',
    label: 'Soft',
    icon: 'auto-awesome',
    description: '"Bestie, take a break. You\'ve been working so hard." Gentle reminders and cozy vibes.',
  },
  {
    type: 'chaotic',
    label: 'Chaotic',
    icon: 'celebration',
    description: '"If you open Twitter I\'m deleting your save file. Just kidding. Or am I?" High stakes, high reward.',
  },
  {
    type: 'strict',
    label: 'Strict',
    icon: 'gavel',
    description: '"Focus or fail. There is no in-between." No-nonsense accountability for serious questers.',
  },
];

// === Bond Tier Names ===

export const BOND_TIER_NAMES: Record<BondTier, string> = {
  1: 'Acquaintance',
  2: 'Roommate',
  3: 'Bestie',
  4: 'Ride or Die',
  5: 'Soulmate',
};

// === Data Models ===

export interface InventoryItem {
  id: string;
  name: string;
  type: 'furniture' | 'cosmetic' | 'room-theme';
  icon: string;
  unlockedAt: string;
  isEquipped: boolean;
}

export interface FocusSession {
  id: string;
  startedAt: string;
  endedAt: string;
  mode: FocusMode;
  taskType: TaskType;
  preMood: MoodLevel;
  preEmotions: EmotionTag[];
  postMood: PostSessionMood | null;
  durationPlanned: number;
  durationActual: number;
  interruptions: number;
  focusScore: number;
  xpEarned: number;
  completed: boolean;
}

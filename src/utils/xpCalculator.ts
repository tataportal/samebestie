import { FocusMode } from '../types';

const BASE_XP_PER_MINUTE = 5;

const MODE_MULTIPLIERS: Record<FocusMode, number> = {
  'tiny-start': 1.0,
  'gentle': 1.2,
  'classic': 1.5,
  'hyper': 2.0,
};

const COMPLETION_BONUS = 50;
const MAX_STREAK_BONUS_PERCENT = 50;
const STREAK_BONUS_PER_DAY = 10;

export function calculateSessionXP(
  durationMinutes: number,
  mode: FocusMode,
  completed: boolean,
  currentStreak: number,
): number {
  const baseXP = durationMinutes * BASE_XP_PER_MINUTE;
  const modeXP = baseXP * MODE_MULTIPLIERS[mode];
  const completionXP = completed ? COMPLETION_BONUS : 0;
  const streakPercent = Math.min(currentStreak * STREAK_BONUS_PER_DAY, MAX_STREAK_BONUS_PERCENT);
  const streakMultiplier = 1 + streakPercent / 100;

  return Math.round((modeXP + completionXP) * streakMultiplier);
}

export function calculateFocusScore(
  durationActual: number,
  durationPlanned: number,
  interruptions: number,
): number {
  const completionRatio = Math.min(durationActual / durationPlanned, 1);
  const interruptionPenalty = Math.min(interruptions * 5, 30);
  return Math.max(0, Math.round(completionRatio * 100 - interruptionPenalty));
}

export function getFocusScoreRank(score: number): string {
  if (score >= 95) return 'S-RANK';
  if (score >= 85) return 'A-RANK';
  if (score >= 70) return 'B-RANK';
  if (score >= 50) return 'C-RANK';
  return 'D-RANK';
}

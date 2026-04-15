import { Rank } from '../types';

const XP_PER_LEVEL = 500;

export function getLevelFromXP(totalXP: number): number {
  return Math.floor(totalXP / XP_PER_LEVEL) + 1;
}

export function getXPInCurrentLevel(totalXP: number): number {
  return totalXP % XP_PER_LEVEL;
}

export function getXPToNextLevel(): number {
  return XP_PER_LEVEL;
}

export function getXPProgress(totalXP: number): { level: number; current: number; max: number; ratio: number } {
  const level = getLevelFromXP(totalXP);
  const current = getXPInCurrentLevel(totalXP);
  return { level, current, max: XP_PER_LEVEL, ratio: current / XP_PER_LEVEL };
}

export function getRankFromLevel(level: number): Rank {
  if (level >= 50) return 'Focus Legend';
  if (level >= 30) return 'Elite Quester';
  if (level >= 20) return 'Pro Focus';
  if (level >= 10) return 'Study Bug';
  if (level >= 5) return 'Focus Rookie';
  return 'Newbie';
}

export function getBondXPMax(tier: number): number {
  return tier * 500;
}

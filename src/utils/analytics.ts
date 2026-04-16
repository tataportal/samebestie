import { FocusSession } from '../types';

/**
 * Real analytics computed from session history.
 * Everything here is data-driven — no hardcoded observations.
 */

/* ── Time of day buckets ───────────────────────────────── */

export type TimeBucket = 'morning' | 'midday' | 'afternoon' | 'evening' | 'night';

function bucketOf(hour: number): TimeBucket {
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 14) return 'midday';
  if (hour >= 14 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

const BUCKET_LABELS: Record<TimeBucket, string> = {
  morning: 'MORNING',
  midday: 'MIDDAY',
  afternoon: 'AFTERNOON',
  evening: 'EVENING',
  night: 'NIGHT',
};

const BUCKET_RANGES: Record<TimeBucket, string> = {
  morning: '5–11 AM',
  midday: '11 AM–2 PM',
  afternoon: '2–6 PM',
  evening: '6–10 PM',
  night: '10 PM–5 AM',
};

/* ── Peak time ─────────────────────────────────────────── */

/** Returns the time bucket where the user focuses best (highest avg score). */
export function getPeakTime(sessions: FocusSession[]): {
  bucket: TimeBucket;
  label: string;
  range: string;
  avgScore: number;
  sessionCount: number;
} | null {
  if (sessions.length < 3) return null;

  const bucketScores: Record<TimeBucket, { total: number; count: number }> = {
    morning: { total: 0, count: 0 },
    midday: { total: 0, count: 0 },
    afternoon: { total: 0, count: 0 },
    evening: { total: 0, count: 0 },
    night: { total: 0, count: 0 },
  };

  sessions.forEach((s) => {
    const hour = new Date(s.startedAt).getHours();
    const b = bucketOf(hour);
    bucketScores[b].total += s.focusScore;
    bucketScores[b].count += 1;
  });

  let best: TimeBucket | null = null;
  let bestAvg = -1;
  let bestCount = 0;
  (Object.keys(bucketScores) as TimeBucket[]).forEach((b) => {
    const { total, count } = bucketScores[b];
    if (count === 0) return;
    const avg = total / count;
    if (avg > bestAvg) {
      bestAvg = avg;
      best = b;
      bestCount = count;
    }
  });

  if (!best) return null;
  return {
    bucket: best,
    label: BUCKET_LABELS[best],
    range: BUCKET_RANGES[best],
    avgScore: Math.round(bestAvg),
    sessionCount: bestCount,
  };
}

/* ── Low time (dip) ────────────────────────────────────── */

/** Returns the time bucket where scores drop compared to peak. */
export function getDipTime(sessions: FocusSession[]): {
  bucket: TimeBucket;
  label: string;
  range: string;
  dropPct: number;
} | null {
  if (sessions.length < 5) return null;

  const bucketScores: Record<TimeBucket, { total: number; count: number }> = {
    morning: { total: 0, count: 0 },
    midday: { total: 0, count: 0 },
    afternoon: { total: 0, count: 0 },
    evening: { total: 0, count: 0 },
    night: { total: 0, count: 0 },
  };

  sessions.forEach((s) => {
    const hour = new Date(s.startedAt).getHours();
    const b = bucketOf(hour);
    bucketScores[b].total += s.focusScore;
    bucketScores[b].count += 1;
  });

  const averages: { b: TimeBucket; avg: number; count: number }[] = [];
  (Object.keys(bucketScores) as TimeBucket[]).forEach((b) => {
    const { total, count } = bucketScores[b];
    if (count >= 2) averages.push({ b, avg: total / count, count });
  });

  if (averages.length < 2) return null;

  const peak = averages.reduce((a, b) => (a.avg > b.avg ? a : b));
  const dip = averages.reduce((a, b) => (a.avg < b.avg ? a : b));

  if (dip.b === peak.b) return null;
  const dropPct = Math.round(((peak.avg - dip.avg) / peak.avg) * 100);
  if (dropPct < 10) return null;

  return {
    bucket: dip.b,
    label: BUCKET_LABELS[dip.b],
    range: BUCKET_RANGES[dip.b],
    dropPct,
  };
}

/* ── Best day of week ──────────────────────────────────── */

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function getBestDay(sessions: FocusSession[]): {
  dayName: string;
  avgXP: number;
  vsAverage: number;
} | null {
  if (sessions.length < 5) return null;

  const byDay: Record<number, { totalXP: number; count: number }> = {};
  sessions.forEach((s) => {
    const day = new Date(s.startedAt).getDay();
    if (!byDay[day]) byDay[day] = { totalXP: 0, count: 0 };
    byDay[day].totalXP += s.xpEarned;
    byDay[day].count += 1;
  });

  const avgs: { day: number; avg: number }[] = [];
  Object.keys(byDay).forEach((k) => {
    const day = Number(k);
    const { totalXP, count } = byDay[day];
    avgs.push({ day, avg: totalXP / count });
  });

  if (avgs.length < 2) return null;

  const overallAvg = avgs.reduce((s, a) => s + a.avg, 0) / avgs.length;
  const best = avgs.reduce((a, b) => (a.avg > b.avg ? a : b));
  const vsAverage = Math.round(((best.avg - overallAvg) / overallAvg) * 100);

  if (vsAverage < 10) return null;

  return {
    dayName: DAY_LABELS[best.day],
    avgXP: Math.round(best.avg),
    vsAverage,
  };
}

/* ── Interruption pattern ──────────────────────────────── */

export function getInterruptionPattern(sessions: FocusSession[]): {
  avgPerSession: number;
  worstMood: string;
  worstTaskType: string;
} | null {
  if (sessions.length < 4) return null;

  const total = sessions.reduce((s, x) => s + x.interruptions, 0);
  const avg = total / sessions.length;

  // Group by mood
  const byMood: Record<string, { total: number; count: number }> = {};
  sessions.forEach((s) => {
    if (!byMood[s.preMood]) byMood[s.preMood] = { total: 0, count: 0 };
    byMood[s.preMood].total += s.interruptions;
    byMood[s.preMood].count += 1;
  });

  const moodAvgs = Object.entries(byMood).map(([mood, { total, count }]) => ({
    mood,
    avg: total / count,
  }));
  const worstMood = moodAvgs.length > 0 ? moodAvgs.reduce((a, b) => (a.avg > b.avg ? a : b)).mood : 'neutral';

  // Group by task
  const byTask: Record<string, { total: number; count: number }> = {};
  sessions.forEach((s) => {
    if (!byTask[s.taskType]) byTask[s.taskType] = { total: 0, count: 0 };
    byTask[s.taskType].total += s.interruptions;
    byTask[s.taskType].count += 1;
  });

  const taskAvgs = Object.entries(byTask).map(([task, { total, count }]) => ({
    task,
    avg: total / count,
  }));
  const worstTaskType = taskAvgs.length > 0 ? taskAvgs.reduce((a, b) => (a.avg > b.avg ? a : b)).task : 'admin';

  return {
    avgPerSession: Math.round(avg * 10) / 10,
    worstMood,
    worstTaskType,
  };
}

/* ── Mood → performance link ──────────────────────────── */

export function getMoodImpact(sessions: FocusSession[]): {
  bestMood: string;
  bestMoodScore: number;
  worstMood: string;
  worstMoodScore: number;
} | null {
  if (sessions.length < 5) return null;

  const byMood: Record<string, { total: number; count: number }> = {};
  sessions.forEach((s) => {
    if (!byMood[s.preMood]) byMood[s.preMood] = { total: 0, count: 0 };
    byMood[s.preMood].total += s.focusScore;
    byMood[s.preMood].count += 1;
  });

  const moodData = Object.entries(byMood)
    .filter(([_, v]) => v.count >= 2)
    .map(([mood, { total, count }]) => ({ mood, avg: total / count }));

  if (moodData.length < 2) return null;

  const best = moodData.reduce((a, b) => (a.avg > b.avg ? a : b));
  const worst = moodData.reduce((a, b) => (a.avg < b.avg ? a : b));

  return {
    bestMood: best.mood,
    bestMoodScore: Math.round(best.avg),
    worstMood: worst.mood,
    worstMoodScore: Math.round(worst.avg),
  };
}

/* ── Archivist letter (dynamic) ───────────────────────── */

/** Compose a natural-sounding insight paragraph from the real data. */
export function getArchivistNote(sessions: FocusSession[]): string {
  if (sessions.length < 3) {
    return "Not enough sessions yet — give me a few more and I'll have patterns to share. Keep going.";
  }

  const peak = getPeakTime(sessions);
  const dip = getDipTime(sessions);
  const bestDay = getBestDay(sessions);

  const parts: string[] = [];

  if (peak) {
    parts.push(
      `Your attention arrives sharpest in the ${peak.label.toLowerCase()} — a ${peak.range.toLowerCase()} window where your focus scores average ${peak.avgScore}%. Consider this your natural study window.`,
    );
  }

  if (dip) {
    parts.push(
      `The ${dip.label.toLowerCase()} (${dip.range.toLowerCase()}) is for mending, not carving — scores drop ${dip.dropPct}% there. Don't fight it.`,
    );
  }

  if (bestDay && parts.length < 2) {
    parts.push(
      `${bestDay.dayName}s are your strongest days — ${bestDay.vsAverage}% above your weekly average.`,
    );
  }

  if (parts.length === 0) {
    return 'Your patterns are still forming. A few more sessions and the shape will emerge.';
  }

  return parts.join(' ');
}

/* ── Observations (3 cards) ───────────────────────────── */

export interface Observation {
  id: string;
  color: 'coral' | 'moss' | 'amber';
  title: string;
  subtitle: string;
  description: string;
}

export function getObservations(sessions: FocusSession[]): Observation[] {
  const obs: Observation[] = [];

  const peak = getPeakTime(sessions);
  if (peak) {
    obs.push({
      id: 'peak',
      color: 'coral',
      title: `${peak.label} PEAK`,
      subtitle: `${peak.range}, when you're sharpest.`,
      description: `Your best sessions cluster here — average focus ${peak.avgScore}% across ${peak.sessionCount} sessions. Honor it.`,
    });
  }

  const dip = getDipTime(sessions);
  if (dip) {
    obs.push({
      id: 'dip',
      color: 'moss',
      title: `${dip.label} EBBING`,
      subtitle: 'A quiet tide.',
      description: `Focus dips ${dip.dropPct}% during ${dip.range.toLowerCase()}. A Tiny Start is often enough to push through.`,
    });
  }

  const bestDay = getBestDay(sessions);
  if (bestDay) {
    obs.push({
      id: 'bestday',
      color: 'amber',
      title: `${bestDay.dayName.toUpperCase()} SURGE`,
      subtitle: 'A quiet fire.',
      description: `${bestDay.dayName} XP beats your weekly average by ${bestDay.vsAverage}%. Plan accordingly.`,
    });
  }

  const interr = getInterruptionPattern(sessions);
  if (interr && obs.length < 3) {
    obs.push({
      id: 'interr',
      color: 'coral',
      title: 'INTERRUPT PATTERN',
      subtitle: `${interr.avgPerSession} avg per session.`,
      description: `You break focus most often when feeling ${interr.worstMood} — schedule ${interr.worstMood} sessions for quieter hours.`,
    });
  }

  const mood = getMoodImpact(sessions);
  if (mood && obs.length < 3) {
    obs.push({
      id: 'mood',
      color: 'amber',
      title: 'MOOD EFFECT',
      subtitle: `${mood.bestMood} mood = +${mood.bestMoodScore - mood.worstMoodScore}%.`,
      description: `You score ${mood.bestMoodScore}% when ${mood.bestMood}, ${mood.worstMoodScore}% when ${mood.worstMood}. Ride the waves you're given.`,
    });
  }

  return obs.slice(0, 3);
}

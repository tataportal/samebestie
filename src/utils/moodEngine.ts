import { Personality, MoodLevel, FocusMode, PetMood } from '../types';

// Personality-driven session recommendations
export function getRecommendedMode(personality: Personality, mood: MoodLevel): FocusMode {
  if (mood === 'fried' || mood === 'low') {
    return 'tiny-start';
  }
  if (mood === 'sharp') {
    return personality === 'strict' ? 'hyper' : 'classic';
  }
  if (personality === 'soft') return 'gentle';
  if (personality === 'strict') return 'classic';
  // Chaotic gets random between gentle and classic
  return Math.random() > 0.5 ? 'gentle' : 'classic';
}

const ALL_QUOTES: Record<Personality, Record<string, string[]>> = {
  soft: {
    home: [
      "Bestie, you usually do better with shorter bursts when you feel overwhelmed. No pressure, just vibes.",
      "Ready when you are. No rush, we've got this together.",
      "Take a deep breath first. Then we focus.",
    ],
    session: [
      "We're doing it, bestie. Don't look away.",
      "You're doing amazing. Keep going.",
      "Almost there, you've got this!",
      "Take it one minute at a time. You're already winning.",
      "No rush, no panic — just you doing your thing.",
      "Your future self is sending you a high five right now.",
      "I believe in you more than you believe in yourself.",
      "Every second counts. You're collecting them beautifully.",
      "You came. You stayed. That's already more than most.",
      "Breathe. Focus. You've got all the time you need.",
      "Look how far you've come just in this session.",
      "Proud of you. Not after — right now, in this moment.",
    ],
    summary: [
      "You actually did the thing. 10/10, no notes.",
      "So proud of you right now. Genuinely.",
      "See? You're better than you think.",
    ],
    idle: [
      "I'm literally just here to watch you focus.",
      "Locked in, bestie.",
      "We're in our focus era.",
    ],
  },
  chaotic: {
    home: [
      "If you don't start a session, I'm changing your wallpaper to something embarrassing.",
      "Your screen time report is judging you. Let's fix that.",
      "Rolling dice... you got 'FOCUS MODE'. No take-backs.",
    ],
    session: [
      "The grind is real. Don't you dare check your phone.",
      "If you tab out I'm screaming.",
      "Plot twist: you're actually productive right now.",
      "What if I told you this session is making you unstoppable.",
      "The internet will still be there after. Probably.",
      "I added a secret timer. It's counting how legendary you're being.",
      "Your enemies are on their phones rn. Stay focused.",
      "Mid-session confession: I'm rooting for you.",
      "This is the part where you become the main character.",
      "You're literally speedrunning personal growth rn.",
      "No one thought you'd make it this far. Prove them wrong.",
      "Chaotic focus is still focus. Keep it up weirdo.",
    ],
    summary: [
      "Wait, you actually finished? Character development.",
      "I'd clap but I don't have hands. Mentally clapping.",
      "Bestie popped off. The internet can wait.",
    ],
    idle: [
      "The grind is real.",
      "Don't look at me, look at your work.",
      "I'm watching. Always watching.",
    ],
  },
  strict: {
    home: [
      "Stop scrolling and start focusing. The math is clear: discipline equals results.",
      "Every minute wasted is XP lost. Choose wisely.",
      "Ready to actually do something today or are we just scrolling?",
    ],
    session: [
      "Focus or fail. There is no in-between.",
      "Eyes on the prize. No distractions.",
      "The timer is running. Don't waste it.",
      "Weakness is not an option right now.",
      "Every second you hold focus, you get stronger.",
      "Discipline today. Results tomorrow. Simple.",
      "You committed. Follow through.",
      "No pausing. No checking. No excuses.",
      "This discomfort is exactly where growth lives.",
      "Stay locked. You're building something real.",
      "Average people check their phones. You're not average.",
      "Hard work compounds. So does distraction. Choose.",
    ],
    summary: [
      "Acceptable performance. There's always room for improvement.",
      "Mission complete. Debrief: you could've gone longer.",
      "Zero interruptions. That's the standard, not the exception.",
    ],
    idle: [
      "Focus. Now.",
      "Silence is productive. Keep it up.",
      "No excuses. Just execution.",
    ],
  },
};

// Personality-driven dialogue — random single quote
export function getBestieQuote(personality: Personality, context: 'home' | 'session' | 'summary' | 'idle'): string {
  const pool = ALL_QUOTES[personality][context] || ALL_QUOTES[personality].home;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Returns the full ordered array for a context — use for cycling in session
export function getSessionQuotes(personality: Personality): string[] {
  return ALL_QUOTES[personality].session;
}

// Determine pet mood after session
export function getPetMoodFromSession(
  focusScore: number,
  completed: boolean,
  personality: Personality,
): PetMood {
  if (focusScore >= 90 && completed) return 'proud';
  if (focusScore >= 60) return 'neutral';
  if (!completed && personality === 'strict') return 'judging';
  if (!completed && personality === 'chaotic') return 'chaotic';
  return 'disappointed';
}

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
      // ── ROAST: idle, hasn't opened in a while, low mood ──
      "oh you're alive? thought you ghosted me tbh.",
      "your screen time report just filed a missing persons report for productivity.",
      "babe the dust on this app was getting thick.",
      "not you opening the app after 3 days like nothing happened.",
      "I was about to send a search party. anyway, focus?",
      "the audacity of opening this without a plan.",
      "you look like someone who's been doomscrolling. be honest.",
      "bestie I literally forgot what your face looks like.",
      "oh NOW you want to be productive? interesting timing.",
      "your last session was so long ago it's basically vintage.",
      "I was just sitting here. alone. in the dark. no big deal.",
      "don't worry I kept the seat warm while you were on TikTok.",
      "you coming back is giving redemption arc energy.",
      "plot twist: the procrastinator returns.",
      "I already told everyone you quit. this is awkward.",
      "the WiFi password to productivity is 'just start' btw.",
      "your future self is looking at present you with disappointment.",
      "me waiting for you to open this app: 🦴💀🦴",
      "I see the dark circles. rough week huh.",
      "you're giving 'I'll start on Monday' energy and it's Wednesday.",
      "every hour you don't study, a brain cell rage quits.",
      "the books miss you. I asked them.",
      "you know what would be crazy? actually focusing today.",
      "POV: you finally remembered I exist.",
      "I've been counting. it's been too long. let's not talk about it.",
    ],
    session: [
      // ── HYPE: during sessions, feeling good ──
      "OK LOCK IN. this is YOUR moment bestie.",
      "you're literally becoming unstoppable rn and it's scary.",
      "the main character energy is radiating off you.",
      "if focus was a sport you'd be going pro.",
      "your enemies are on their phones rn. stay dangerous.",
      "not gonna lie you're kinda eating right now.",
      "I added a secret counter. it's tracking how legendary you're being.",
      "the grind doesn't stop and neither do you apparently.",
      "this is the montage scene. epic music playing in my head.",
      "you're in your zone and I'm honestly intimidated.",
      "POV: you chose violence against procrastination.",
      "the focus is giving. the dedication is serving.",
      "plot twist: you're actually doing the thing you said you'd do.",
      "if you tab out I'm screaming. don't test me.",
      "mid-session confession: I'm genuinely proud rn.",
      "the internet will still be trash after this. keep going.",
      "you're speedrunning personal growth and I'm here for it.",
      "this is the part of the movie where everything clicks.",
      "chaotic focus is still focus. keep going weirdo.",
      "imagine if you always studied like this. terrifying.",
      "your brain cells are having a party rn trust me.",
      "you said '5 more minutes' 20 minutes ago. love that for us.",
      "the concentration is immaculate. chef's kiss.",
      "no thoughts, just pure academic weapon energy.",
      "you're in the flow state and it's beautiful honestly.",
      "every minute you hold is another W. stack them.",
      "the timer is scared of you. as it should be.",
      "casually rewriting your entire academic destiny rn.",
      "this energy? unprecedented. historic even.",
      "if studying had a leaderboard you'd be climbing.",
      "OK but why are you actually locking in though.",
      "the focus gods are smiling upon you today.",
      "you are a machine. a slightly chaotic machine but still.",
      "I would cry if I had tear ducts. this is beautiful.",
      "stay locked. the notification can wait. I promise.",
      "you + this session = the collab of the century.",
      "the way you're ignoring distractions? elite behavior.",
      "not me getting emotional watching you study. moving on.",
      "you chose focus over fun and I've never respected you more.",
      "breaking news: local student actually studies. more at 11.",
    ],
    summary: [
      // ── COMEBACK: returning, post-session, after finishing ──
      "wait you actually finished?? CHARACTER DEVELOPMENT.",
      "I'd clap but I'm a penguin. mentally clapping though.",
      "bestie popped OFF. the internet can wait.",
      "that was disgusting. disgustingly good I mean.",
      "you just proved every doubter wrong including me.",
      "session complete. serotonin unlocked. you're welcome.",
      "not gonna cap that was impressive.",
      "you ate that and left no crumbs.",
      "the way you just demolished that session? iconic.",
      "I'm adding this to your highlight reel.",
      "OK so we're actually doing this growth thing huh.",
      "you came. you focused. you conquered. now rest.",
      "that session was giving valedictorian energy.",
      "plot twist: you're not a procrastinator after all??",
      "filing this under 'reasons bestie is that girl/guy'.",
      "the XP you just earned? you deserve every point.",
      "I literally can't with you. in the best way.",
      "your brain just got a six-pack from that workout.",
      "you can have screen time now. as a treat.",
      "session secured. touch some grass. you earned it.",
      "and you thought you couldn't do it. embarrassing for the old you.",
      "this goes on your permanent record. the good one.",
      "somebody get this person a trophy or something.",
      "first the session, next the world. probably.",
      "I'm telling everyone you actually studied today.",
    ],
    idle: [
      "don't look at me, look at your work.",
      "I'm watching. always watching.",
      "the grind is real and so is my judgment.",
      "you breathing heavy or is that focus I hear.",
      "pretend I'm not here. but also I'm definitely here.",
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

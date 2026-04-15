import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import {
  PenguinSprite,
  XPBar,
  StatBlock,
  RetroCard,
  PixelButton,
} from '../src/components';
import { useFocusStore } from '../src/store/useFocusStore';
import { useUserStore } from '../src/store/useUserStore';
import { usePetStore } from '../src/store/usePetStore';
import { useHistoryStore } from '../src/store/useHistoryStore';
import { calculateSessionXP, calculateFocusScore, getFocusScoreRank } from '../src/utils/xpCalculator';
import { getBestieQuote, getPetMoodFromSession } from '../src/utils/moodEngine';
import { getXPProgress } from '../src/utils/levelSystem';
import { PostSessionMood } from '../src/types';
import { colors, spacing, padding, textStyles } from '../src/theme';

export default function SummaryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const mode = useFocusStore((s) => s.mode);
  const timerRemaining = useFocusStore((s) => s.timerRemaining);
  const interruptions = useFocusStore((s) => s.interruptions);
  const preMood = useFocusStore((s) => s.preMood);
  const preEmotions = useFocusStore((s) => s.preEmotions);
  const taskType = useFocusStore((s) => s.taskType);
  const studySubject = useFocusStore((s) => s.studySubject);
  const startedAt = useFocusStore((s) => s.startedAt);
  const focusSecsCompleted = useFocusStore((s) => s.focusSecsCompleted);
  const totalRounds = useFocusStore((s) => s.totalRounds);
  const focusSecs = useFocusStore((s) => s.focusSecs);
  const setPostMood = useFocusStore((s) => s.setPostMood);
  const resetSession = useFocusStore((s) => s.resetSession);
  const addXP = useUserStore((s) => s.addXP);
  const updateStreak = useUserStore((s) => s.updateStreak);
  const currentStreak = useUserStore((s) => s.currentStreak);
  const totalXP = useUserStore((s) => s.totalXP);
  const xpProgress = getXPProgress(totalXP);
  const personality = usePetStore((s) => s.personality);
  const petName = usePetStore((s) => s.petName);
  const petAnimal = usePetStore((s) => s.petAnimal);
  const updateMood = usePetStore((s) => s.updateMood);
  const addBondXP = usePetStore((s) => s.addBondXP);
  const addSession = useHistoryStore((s) => s.addSession);

  const [selectedPostMood, setSelectedPostMood] = useState<PostSessionMood | null>(null);
  const hasProcessedRef = useRef(false);

  const elapsed = focusSecsCompleted;
  const elapsedMinutes = Math.floor(elapsed / 60);
  const totalPlannedFocusSecs = totalRounds * focusSecs;
  const completed = timerRemaining <= 0;
  const focusScore = calculateFocusScore(elapsed, totalPlannedFocusSecs, interruptions);
  const xpEarned = calculateSessionXP(elapsedMinutes, mode, completed, currentStreak);
  const scoreRank = getFocusScoreRank(focusScore);
  const petMoodResult = getPetMoodFromSession(focusScore, completed, personality);
  const quote = getBestieQuote(personality, 'summary');

  useEffect(() => {
    if (hasProcessedRef.current) return;
    hasProcessedRef.current = true;
    addXP(xpEarned);
    updateStreak();
    updateMood(petMoodResult);
    addBondXP(Math.round(xpEarned * 0.3));
    addSession({
      id: Date.now().toString(),
      startedAt: startedAt || new Date().toISOString(),
      endedAt: new Date().toISOString(),
      mode,
      taskType: taskType || 'admin',
      preMood: preMood || 'neutral',
      preEmotions,
      postMood: null,
      durationPlanned: totalPlannedFocusSecs,
      durationActual: elapsed,
      interruptions,
      focusScore,
      xpEarned,
      completed,
    });
  }, []);

  const handlePostMood = (mood: PostSessionMood) => {
    setSelectedPostMood(mood);
    setPostMood(mood);
  };

  const handleBackToHub = () => {
    resetSession();
    router.replace('/(tabs)');
  };

  const postMoodOptions: { mood: PostSessionMood; label: string; icon: string; emoji: string }[] = [
    { mood: 'better', label: 'BETTER', icon: 'trending-up',   emoji: '📈' },
    { mood: 'same',   label: 'SAME',   icon: 'remove',        emoji: '😐' },
    { mood: 'worse',  label: 'WORSE',  icon: 'trending-down', emoji: '📉' },
  ];

  return (
    <LinearGradient
      colors={['#1e0a35', colors.background, '#071a1c']}
      locations={[0, 0.4, 1]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>SESSION{'\n'}SECURED</Text>
          <View style={styles.xpBadge}>
            <MaterialIcons name="star" size={18} color={colors.onPrimary} />
            <Text style={[textStyles.cardTitle, styles.xpBadgeText]}>+{xpEarned} XP</Text>
          </View>
          <Text style={styles.rankLabel}>{scoreRank}</Text>
          {taskType === 'study' && studySubject ? (
            <View style={styles.subjectBadge}>
              <MaterialIcons name="menu-book" size={13} color={colors.secondary} />
              <Text style={styles.subjectText}>{studySubject}</Text>
            </View>
          ) : null}
        </View>

        {/* Level Progress */}
        <View style={styles.levelSection}>
          <View style={styles.levelHeader}>
            <Text style={[textStyles.labelSmall, { color: colors.onSurfaceVariant }]}>
              LEVEL {xpProgress.level}
            </Text>
            <Text style={[textStyles.labelSmall, { color: colors.primary }]}>
              {xpProgress.current}/{xpProgress.max} XP
            </Text>
          </View>
          <XPBar
            filled={Math.round(xpProgress.ratio * 10)}
            total={10}
            color="primary"
          />
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statWrapper}>
            <StatBlock
              label="FOCUS SCORE"
              value={String(focusScore)}
              unit="%"
              accentColor={colors.primary}
              icon="psychology"
            />
          </View>
          <View style={styles.statWrapper}>
            <StatBlock
              label="STREAK"
              value={String(currentStreak)}
              unit="D"
              accentColor={colors.tertiary}
              icon="local-fire-department"
            />
          </View>
          <View style={styles.statWrapper}>
            <StatBlock
              label="INTERRUPTS"
              value={String(interruptions)}
              accentColor={colors.secondary}
              icon="warning"
            />
          </View>
        </View>

        {/* Pet Mood Panel */}
        <RetroCard variant="high" accentColor={colors.primary} style={styles.petPanel}>
          <View style={styles.petPanelContent}>
            <PenguinSprite size={80} mood={petMoodResult} animal={petAnimal} />
            <View style={styles.petPanelText}>
              <View style={styles.moodBadge}>
                <Text style={[textStyles.labelTiny, styles.moodBadgeText]}>
                  {petMoodResult.toUpperCase()}
                </Text>
              </View>
              <Text style={[textStyles.bodyMedium, { color: colors.onSurface, marginTop: spacing.sm }]}>
                {quote}
              </Text>
              <Text style={[textStyles.bodySmall, { color: colors.onSurfaceVariant, marginTop: spacing.xs }]}>
                — {petName || 'Your Bestie'}
              </Text>
            </View>
          </View>
        </RetroCard>

        {/* Post-Session Mood */}
        <View style={styles.postMoodSection}>
          <Text style={[textStyles.sectionTitle, styles.postMoodTitle]}>
            HOW DO WE FEEL NOW?
          </Text>
          <View style={styles.postMoodRow}>
            {postMoodOptions.map((option) => {
              const isActive = selectedPostMood === option.mood;
              return (
                <Pressable
                  key={option.mood}
                  onPress={() => handlePostMood(option.mood)}
                  style={styles.postMoodButton}
                >
                  <RetroCard
                    variant={isActive ? 'high' : 'default'}
                    accentColor={isActive ? colors.secondary : undefined}
                    style={styles.postMoodCard}
                  >
                    <Text style={styles.postMoodEmoji}>{option.emoji}</Text>
                    <Text
                      style={[
                        textStyles.labelSmall,
                        {
                          color: isActive ? colors.secondary : colors.onSurfaceVariant,
                          marginTop: spacing.xs,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </RetroCard>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* CTA */}
        <PixelButton label="BACK TO HUB" onPress={handleBackToHub} icon="home" variant="primary" />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: padding.screen,
    gap: spacing.md,
  },

  // Hero
  heroSection: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  heroTitle: {
    ...textStyles.pageTitle,
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: spacing.md,
    textShadowColor: 'rgba(183,159,255,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginBottom: spacing.sm,
    gap: spacing.xs,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },
  xpBadgeText: {
    color: colors.onPrimary,
  },
  rankLabel: {
    ...textStyles.labelSmall,
    color: colors.secondary,
    letterSpacing: 2,
    textShadowColor: 'rgba(104,252,191,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  subjectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  subjectText: {
    ...textStyles.labelSmall,
    color: colors.secondary,
  },

  // Level
  levelSection: {
    backgroundColor: colors.surfaceContainerHigh,
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(183,159,255,0.15)',
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statWrapper: {
    flex: 1,
  },

  // Pet panel
  petPanel: {},
  petPanelContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  petPanelText: {
    flex: 1,
  },
  moodBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  moodBadgeText: {
    color: colors.onPrimary,
  },

  // Post mood
  postMoodSection: {},
  postMoodTitle: {
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  postMoodRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  postMoodButton: {
    flex: 1,
  },
  postMoodCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  postMoodEmoji: {
    fontSize: 28,
  },
});

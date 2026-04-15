import React, { useEffect, useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { PaperLayer } from '../../src/components/v2/PaperLayer';
import {
  RuledDivider,
  FieldLabel,
  IndexCard,
  Stamp,
  InkButton,
  Asterism,
} from '../../src/components/v2/Primitives';
import { PetGlyph } from '../../src/components/v2/PetGlyph';
import { useFocusStore } from '../../src/store/useFocusStore';
import { usePetStore } from '../../src/store/usePetStore';
import { useUserStore } from '../../src/store/useUserStore';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import { getSessionQuotes } from '../../src/utils/moodEngine';
import { formatTimer } from '../../src/utils/formatTime';
import {
  calculateSessionXP,
  calculateFocusScore,
} from '../../src/utils/xpCalculator';
import { FOCUS_MODES } from '../../src/types';
import { v2Colors, v2Text, v2Space } from '../../src/theme/v2';

const QUOTE_INTERVAL_MS = 22000;

export default function V2Session() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isActive = useFocusStore((s) => s.isActive);
  const isPaused = useFocusStore((s) => s.isPaused);
  const timerDuration = useFocusStore((s) => s.timerDuration);
  const timerRemaining = useFocusStore((s) => s.timerRemaining);
  const mode = useFocusStore((s) => s.mode);
  const interruptions = useFocusStore((s) => s.interruptions);
  const studySubject = useFocusStore((s) => s.studySubject);
  const currentRound = useFocusStore((s) => s.currentRound);
  const totalRounds = useFocusStore((s) => s.totalRounds);
  const focusSecs = useFocusStore((s) => s.focusSecs);
  const isBreak = useFocusStore((s) => s.isBreak);
  const focusSecsCompleted = useFocusStore((s) => s.focusSecsCompleted);
  const tick = useFocusStore((s) => s.tick);
  const pauseSession = useFocusStore((s) => s.pauseSession);
  const resumeSession = useFocusStore((s) => s.resumeSession);
  const startBreak = useFocusStore((s) => s.startBreak);
  const startNextRound = useFocusStore((s) => s.startNextRound);
  const endSession = useFocusStore((s) => s.endSession);
  const personality = usePetStore((s) => s.personality);
  const petName = usePetStore((s) => s.petName);
  const petAnimal = usePetStore((s) => s.petAnimal);
  const currentStreak = useUserStore((s) => s.currentStreak);
  const hapticEnabled = useSettingsStore((s) => s.hapticEnabled);

  const quotes = getSessionQuotes(personality);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const quoteOpacity = useRef(new Animated.Value(1)).current;
  const colonOpacity = useRef(new Animated.Value(1)).current;

  /* preview-mode: if no session is active (user navigated here directly),
     show a mock 25:00 countdown so the design is viewable without starting */
  const preview = !isActive && timerDuration === 0;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(colonOpacity, {
          toValue: 0.15,
          duration: 500,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(colonOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    );
    if (!isPaused && isActive) pulse.start();
    else {
      pulse.stop();
      colonOpacity.setValue(1);
    }
    return () => pulse.stop();
  }, [isPaused, isActive, colonOpacity]);

  useEffect(() => {
    if (!isActive || isPaused) return;
    const interval = setInterval(() => tick(), 1000);
    return () => clearInterval(interval);
  }, [isActive, isPaused, tick]);

  useEffect(() => {
    if (!isActive || timerRemaining > 0 || timerDuration === 0) return;
    if (!isBreak && currentRound < totalRounds) {
      if (hapticEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      startBreak();
    } else if (isBreak) {
      if (hapticEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      startNextRound();
    } else {
      if (hapticEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      endSession();
      router.replace('/v2/summary');
    }
  }, [isActive, timerRemaining, timerDuration, isBreak, currentRound, totalRounds]);

  const advanceQuote = useCallback(() => {
    Animated.timing(quoteOpacity, {
      toValue: 0,
      duration: 400,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      setQuoteIndex((i) => (i + 1) % quotes.length);
      Animated.timing(quoteOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    });
  }, [quoteOpacity, quotes.length]);

  useEffect(() => {
    if (!isActive || isPaused) return;
    const timer = setInterval(advanceQuote, QUOTE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isActive, isPaused, advanceQuote]);

  const handlePause = useCallback(
    () => (isPaused ? resumeSession() : pauseSession()),
    [isPaused, pauseSession, resumeSession],
  );
  const handleStop = useCallback(() => {
    endSession();
    router.replace('/v2/summary');
  }, [endSession, router]);

  const displayRemaining = preview ? 25 * 60 : timerRemaining;
  const { minutes, seconds } = formatTimer(displayRemaining);
  const totalFocusSecs = totalRounds * focusSecs;
  const elapsedMinutes = Math.floor(focusSecsCompleted / 60);
  const focusScore = calculateFocusScore(
    focusSecsCompleted,
    totalFocusSecs,
    interruptions,
  );
  const estimatedXP = calculateSessionXP(
    elapsedMinutes,
    mode,
    false,
    currentStreak,
  );
  const progressRatio =
    timerDuration > 0
      ? (timerDuration - timerRemaining) / timerDuration
      : 0;
  const modeLabel = FOCUS_MODES.find((m) => m.mode === mode)?.label ?? 'FOCUS';
  const currentQuote = quotes[quoteIndex];

  const accent = isBreak ? v2Colors.moss : v2Colors.coral;
  const accentWash = isBreak ? v2Colors.mossWash : v2Colors.coralWash;

  return (
    <PaperLayer>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + v2Space.md,
            paddingBottom: insets.bottom + v2Space.lg,
          },
        ]}
      >
        {/* ── RECEIPT HEADER ─────────────────────── */}
        <View style={styles.receipt}>
          <View>
            <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>
              RECEIPT N°{String(Date.now()).slice(-6)}
            </Text>
            <Text
              style={[
                v2Text.field,
                { color: v2Colors.ink, marginTop: 2, letterSpacing: 2.5 },
              ]}
            >
              {isBreak ? 'INTERMISSION' : modeLabel} · ROUND {currentRound || 1}/{totalRounds || 1}
            </Text>
          </View>
          <Pressable onPress={() => router.back()}>
            <Text style={[v2Text.serial, { color: v2Colors.coral }]}>
              ← Return
            </Text>
          </Pressable>
        </View>
        <RuledDivider variant="dashed" color={v2Colors.ink} style={{ marginTop: 8 }} />

        {/* ── HERO: TIMER × PET ──────────────────── */}
        <View style={styles.heroRow}>
          {/* LEFT — Timer */}
          <View style={styles.timerSide}>
            <Text
              style={[
                v2Text.serial,
                { color: v2Colors.stamp, marginBottom: 6 },
              ]}
            >
              TIME REMAINING · MIN : SEC
            </Text>
            <View style={styles.timerRow}>
              <Text
                // @ts-ignore
                className={
                  Platform.OS === 'web' ? 'v2-soft v2-tabular' : undefined
                }
                style={[
                  v2Text.timerHuge,
                  {
                    color: v2Colors.ink,
                    fontVariant: ['tabular-nums'] as any,
                  },
                  isPaused && { color: v2Colors.inkMuted },
                ]}
              >
                {minutes}
              </Text>
              <Animated.Text
                style={[
                  v2Text.timerHuge,
                  {
                    color: accent,
                    opacity: colonOpacity,
                    marginHorizontal: -6,
                  },
                ]}
              >
                :
              </Animated.Text>
              <Text
                // @ts-ignore
                className={
                  Platform.OS === 'web' ? 'v2-soft v2-tabular' : undefined
                }
                style={[
                  v2Text.timerHuge,
                  {
                    color: v2Colors.ink,
                    fontVariant: ['tabular-nums'] as any,
                  },
                  isPaused && { color: v2Colors.inkMuted },
                ]}
              >
                {seconds}
              </Text>
            </View>

            {/* Progress as ruler */}
            <View style={styles.ruler}>
              {Array.from({ length: 40 }).map((_, i) => {
                const passed = i / 40 < progressRatio;
                const isMajor = i % 5 === 0;
                return (
                  <View
                    key={i}
                    style={[
                      styles.rulerTick,
                      {
                        height: isMajor ? 14 : 8,
                        backgroundColor: passed ? accent : v2Colors.rule,
                        opacity: passed ? 1 : isMajor ? 1 : 0.6,
                      },
                    ]}
                  />
                );
              })}
            </View>
            <View style={styles.rulerLabels}>
              <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>0′</Text>
              <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>
                {Math.floor(timerDuration / 60) || 25}′
              </Text>
            </View>

            {studySubject ? (
              <View style={styles.subjectRow}>
                <Text style={[v2Text.field, { color: v2Colors.inkMuted }]}>
                  Studying
                </Text>
                <View style={styles.indexBar} />
                <Text
                  style={[
                    v2Text.cardSerif,
                    { color: v2Colors.ink, fontStyle: 'italic' },
                  ]}
                >
                  {studySubject}
                </Text>
              </View>
            ) : null}
          </View>

          {/* RIGHT — Pet + Quote */}
          <View style={styles.petSide}>
            <View style={{ position: 'relative' }}>
              <PetGlyph
                animal={petAnimal}
                size={150}
                label={(petName || 'BESTIE').toUpperCase()}
                serial="ON DUTY"
              />
              {isPaused && (
                <Stamp
                  label="PAUSED"
                  sub="RESUME?"
                  color={v2Colors.amber}
                  rotate={-18}
                  style={styles.pausedStamp}
                />
              )}
              {isBreak && (
                <Stamp
                  label="BREAK"
                  sub="BREATHE"
                  color={v2Colors.moss}
                  rotate={12}
                  style={styles.pausedStamp}
                />
              )}
            </View>

            <Animated.View
              style={[styles.quoteBox, { opacity: quoteOpacity }]}
            >
              <Text
                style={[v2Text.serial, { color: v2Colors.stamp }]}
              >
                BESTIE MEMO
              </Text>
              <Text
                style={[
                  v2Text.quote,
                  {
                    color: v2Colors.ink,
                    marginTop: 4,
                  },
                ]}
              >
                {isBreak
                  ? 'Pause here. Breathe in. You have done enough to deserve it.'
                  : currentQuote}
              </Text>
            </Animated.View>
          </View>
        </View>

        {/* ── STATS TAPE ─────────────────────────── */}
        <View style={styles.statsTape}>
          <View style={styles.tapeItem}>
            <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>FOCUS SCORE</Text>
            <Text style={[v2Text.displaySerif, { color: v2Colors.ink }]}>
              {focusScore}
              <Text style={[v2Text.field, { color: v2Colors.inkMuted }]}> /100</Text>
            </Text>
          </View>
          <View style={styles.tapeDivider} />
          <View style={styles.tapeItem}>
            <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>EARNED</Text>
            <Text style={[v2Text.displaySerif, { color: v2Colors.coral }]}>
              +{estimatedXP}
              <Text style={[v2Text.field, { color: v2Colors.inkMuted }]}> xp</Text>
            </Text>
          </View>
          <View style={styles.tapeDivider} />
          <View style={styles.tapeItem}>
            <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>INTERRUPTIONS</Text>
            <Text style={[v2Text.displaySerif, { color: v2Colors.moss }]}>
              {String(interruptions).padStart(2, '0')}
            </Text>
          </View>
        </View>

        {/* ── CONTROLS ───────────────────────────── */}
        <View style={styles.controls}>
          <View style={{ flex: 1 }}>
            <InkButton
              label={isPaused ? 'Resume' : 'Pause'}
              sublabel={isPaused ? 'continue your work' : 'hold this moment'}
              variant={isPaused ? 'moss' : 'paper'}
              onPress={handlePause}
              full
            />
          </View>
          <View style={{ flex: 1 }}>
            <InkButton
              label="End Session"
              sublabel="close the ledger"
              variant="coral"
              onPress={handleStop}
              full
            />
          </View>
        </View>

        {/* ── FOOTER ─────────────────────────────── */}
        <View style={styles.receiptFoot}>
          <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>
            — — — CUT HERE — — —
          </Text>
          <Text
            style={[
              v2Text.serial,
              { color: v2Colors.stamp, marginTop: 6, textAlign: 'center' },
            ]}
          >
            TRANSCRIBED · HAND STAMPED · {accent === v2Colors.moss ? 'SOOTHING' : 'INTENT'} {' '}
            <Asterism char="✦" color={accent} size={9} />
          </Text>
        </View>
      </View>
    </PaperLayer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: v2Space.lg,
  },
  receipt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  heroRow: {
    flexDirection: 'row',
    gap: v2Space.xl,
    flexWrap: 'wrap',
    marginTop: v2Space.lg,
    alignItems: 'center',
  },
  timerSide: {
    flex: 1.4,
    minWidth: 320,
  },
  petSide: {
    flex: 1,
    minWidth: 240,
    alignItems: 'center',
    gap: v2Space.md,
  },
  pausedStamp: {
    position: 'absolute',
    right: -20,
    top: -8,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ruler: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 18,
    marginTop: v2Space.md,
    gap: 3,
  },
  rulerTick: {
    flex: 1,
    borderRadius: 0.5,
  },
  rulerLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: v2Space.md,
  },
  indexBar: {
    width: 12,
    height: 1,
    backgroundColor: v2Colors.rule,
  },
  quoteBox: {
    borderLeftWidth: 2,
    borderLeftColor: v2Colors.coral,
    paddingLeft: v2Space.md,
    paddingRight: v2Space.md,
    paddingVertical: v2Space.sm,
    maxWidth: 280,
  },
  statsTape: {
    flexDirection: 'row',
    backgroundColor: v2Colors.paperBright,
    borderWidth: 1,
    borderColor: v2Colors.ink,
    padding: v2Space.md,
    marginTop: v2Space.lg,
    shadowColor: v2Colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  tapeItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  tapeDivider: {
    width: 1,
    backgroundColor: v2Colors.rule,
  },
  controls: {
    flexDirection: 'row',
    gap: v2Space.md,
    marginTop: v2Space.lg,
  },
  receiptFoot: {
    marginTop: v2Space.lg,
    alignItems: 'center',
  },
});

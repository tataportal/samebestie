import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useVideoPlayer, VideoView } from 'expo-video';
import { XPBar, BottomSheet, AmbientMixer } from '../src/components';
import { useAmbientSound } from '../src/hooks/useAmbientSound';
import { useAmbientStore } from '../src/store/useAmbientStore';
import { useFocusStore } from '../src/store/useFocusStore';
import { usePetStore } from '../src/store/usePetStore';
import { useUserStore } from '../src/store/useUserStore';
import { useSettingsStore } from '../src/store/useSettingsStore';
import { getSessionQuotes } from '../src/utils/moodEngine';
import { formatTimer } from '../src/utils/formatTime';
import { calculateSessionXP, calculateFocusScore } from '../src/utils/xpCalculator';
import { FOCUS_MODES } from '../src/types';
import { colors, spacing, padding, textStyles, fonts } from '../src/theme';

const QUOTE_INTERVAL_MS = 22000;

// Neon glow colors for timer text
const FOCUS_GLOW  = 'rgba(183,159,255,0.65)';
const BREAK_GLOW  = 'rgba(104,252,191,0.65)';

export default function SessionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isActive            = useFocusStore((s) => s.isActive);
  const isPaused            = useFocusStore((s) => s.isPaused);
  const timerDuration       = useFocusStore((s) => s.timerDuration);
  const timerRemaining      = useFocusStore((s) => s.timerRemaining);
  const mode                = useFocusStore((s) => s.mode);
  const interruptions       = useFocusStore((s) => s.interruptions);
  const studySubject        = useFocusStore((s) => s.studySubject);
  const currentRound        = useFocusStore((s) => s.currentRound);
  const totalRounds         = useFocusStore((s) => s.totalRounds);
  const focusSecs           = useFocusStore((s) => s.focusSecs);
  const isBreak             = useFocusStore((s) => s.isBreak);
  const focusSecsCompleted  = useFocusStore((s) => s.focusSecsCompleted);
  const tick                = useFocusStore((s) => s.tick);
  const pauseSession        = useFocusStore((s) => s.pauseSession);
  const resumeSession       = useFocusStore((s) => s.resumeSession);
  const startBreak          = useFocusStore((s) => s.startBreak);
  const startNextRound      = useFocusStore((s) => s.startNextRound);
  const endSession          = useFocusStore((s) => s.endSession);
  const personality         = usePetStore((s) => s.personality);
  const currentStreak       = useUserStore((s) => s.currentStreak);
  const hapticEnabled       = useSettingsStore((s) => s.hapticEnabled);

  // Ambient sound mixer
  const [showMixer, setShowMixer] = useState(false);
  const ambientTracks = useAmbientStore((s) => s.tracks);
  const ambientActive = ambientTracks.some((t) => t.active);
  useAmbientSound();

  const quotes = getSessionQuotes(personality);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const quoteOpacity = useRef(new Animated.Value(1)).current;
  const colonOpacity = useRef(new Animated.Value(1)).current;

  const player = useVideoPlayer(
    require('../assets/images/penguin-studying.mp4'),
    (p) => { p.loop = true; p.muted = true; p.play(); }
  );

  // Pause/resume video
  useEffect(() => {
    isPaused ? player.pause() : player.play();
  }, [isPaused, player]);

  // Blinking colon
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(colonOpacity, { toValue: 0.15, duration: 500, useNativeDriver: true }),
        Animated.timing(colonOpacity, { toValue: 1,    duration: 500, useNativeDriver: true }),
      ])
    );
    if (!isPaused && isActive) pulse.start();
    else { pulse.stop(); colonOpacity.setValue(1); }
    return () => pulse.stop();
  }, [isPaused, isActive, colonOpacity]);

  // Countdown
  useEffect(() => {
    if (!isActive || isPaused) return;
    const interval = setInterval(() => tick(), 1000);
    return () => clearInterval(interval);
  }, [isActive, isPaused, tick]);

  // Round / session transitions
  useEffect(() => {
    if (!isActive || timerRemaining > 0 || timerDuration === 0) return;
    if (!isBreak && currentRound < totalRounds) {
      if (hapticEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      startBreak();
    } else if (isBreak) {
      if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      startNextRound();
    } else {
      if (hapticEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      endSession();
      router.replace('/summary');
    }
  }, [isActive, timerRemaining, timerDuration, isBreak, currentRound, totalRounds]);

  // Quote crossfade every 22 s
  const advanceQuote = useCallback(() => {
    Animated.timing(quoteOpacity, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
      setQuoteIndex((i) => (i + 1) % quotes.length);
      Animated.timing(quoteOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    });
  }, [quoteOpacity, quotes.length]);

  useEffect(() => {
    if (!isActive || isPaused) return;
    const timer = setInterval(advanceQuote, QUOTE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isActive, isPaused, advanceQuote]);

  const handlePause = useCallback(() => {
    isPaused ? resumeSession() : pauseSession();
  }, [isPaused, pauseSession, resumeSession]);

  const handleStop = useCallback(() => {
    endSession();
    router.replace('/summary');
  }, [endSession, router]);

  const { minutes, seconds } = formatTimer(timerRemaining);
  const totalFocusSecs  = totalRounds * focusSecs;
  const elapsedMinutes  = Math.floor(focusSecsCompleted / 60);
  const focusScore      = calculateFocusScore(focusSecsCompleted, totalFocusSecs, interruptions);
  const estimatedXP     = calculateSessionXP(elapsedMinutes, mode, false, currentStreak);
  const progressFilled  = timerDuration > 0 ? Math.round(((timerDuration - timerRemaining) / timerDuration) * 10) : 0;
  const modeLabel       = FOCUS_MODES.find((m) => m.mode === mode)?.label ?? 'FOCUS';
  const currentQuote    = quotes[quoteIndex];

  const periodLabel = isBreak
    ? `BREAK · ROUND ${currentRound} OF ${totalRounds}`
    : totalRounds > 1
      ? `${modeLabel} · ROUND ${currentRound} OF ${totalRounds}`
      : modeLabel;

  const timerGlow = isBreak ? BREAK_GLOW : FOCUS_GLOW;
  const timerColor = isBreak ? colors.secondary : colors.onSurface;
  const pauseBg = isPaused ? colors.secondary : colors.primary;
  const pauseGlow = isPaused ? 'rgba(104,252,191,0.6)' : 'rgba(183,159,255,0.6)';

  return (
    <View style={styles.container}>

      {/* TOP — video fills upper half */}
      <View style={styles.videoSection}>
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          nativeControls={false}
        />
        {/* Period label overlay */}
        <View style={[styles.videoOverlay, { paddingTop: insets.top + spacing.sm }]}>
          <Text style={styles.periodLabel}>
            {periodLabel}{isPaused ? '  ·  PAUSED' : ''}
          </Text>
          {studySubject ? (
            <Text style={styles.subjectLabel}>{studySubject}</Text>
          ) : null}
        </View>
        {/* Gradient fade from video into info panel */}
        <LinearGradient
          colors={['transparent', '#0d0d1c']}
          style={styles.videoFade}
          pointerEvents="none"
        />
      </View>

      {/* BOTTOM — info panel */}
      <View style={[styles.infoSection, { paddingBottom: insets.bottom + spacing.lg }]}>

        {/* Crossfading quote */}
        <Animated.View style={[styles.bubble, isBreak && styles.bubbleBreak, { opacity: quoteOpacity }]}>
          <Text style={[styles.bubbleText, isBreak && styles.bubbleTextBreak]}>
            {isBreak ? '🧘 take a breath. you earned this.' : currentQuote}
          </Text>
        </Animated.View>

        {/* Timer — big neon digits */}
        <View style={styles.timerRow}>
          <Text style={[styles.timerText, {
            color: timerColor,
            textShadowColor: timerGlow,
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 18,
          }]}>{minutes}</Text>
          <Animated.Text style={[styles.timerColon, {
            opacity: colonOpacity,
            color: isBreak ? colors.secondary : colors.primary,
          }]}>:</Animated.Text>
          <Text style={[styles.timerText, {
            color: timerColor,
            textShadowColor: timerGlow,
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 18,
          }]}>{seconds}</Text>
        </View>

        {/* Progress bar */}
        <XPBar
          filled={progressFilled}
          total={10}
          color={isBreak ? 'secondary' : 'primary'}
          height={5}
        />

        {/* Stats HUD */}
        <View style={styles.statsRow}>
          <Text style={styles.stat}>
            <Text style={{ color: colors.primary }}>SCORE </Text>
            <Text style={{ color: colors.onSurface }}>{focusScore}%</Text>
          </Text>
          <Text style={styles.stat}>
            <Text style={{ color: colors.secondary }}>+{estimatedXP} </Text>
            <Text>XP</Text>
          </Text>
          <Text style={styles.stat}>
            {currentRound}/{totalRounds}
            <Text style={{ color: colors.onSurfaceVariant }}> RDS</Text>
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable onPress={handlePause} style={styles.controlBtn}>
            <View style={[
              styles.iconCircle,
              styles.iconCirclePrimary,
              {
                backgroundColor: pauseBg,
                shadowColor: pauseGlow,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 1,
                shadowRadius: 16,
                elevation: 10,
              },
            ]}>
              <MaterialIcons
                name={isPaused ? 'play-arrow' : 'pause'}
                size={28}
                color={isPaused ? colors.onSecondary : colors.onPrimary}
              />
            </View>
            <Text style={styles.controlLabel}>{isPaused ? 'RESUME' : 'PAUSE'}</Text>
          </Pressable>

          <Pressable onPress={handleStop} style={styles.controlBtn}>
            <View style={[styles.iconCircle, { backgroundColor: colors.surfaceContainerHigh }]}>
              <MaterialIcons name="stop" size={26} color={colors.onSurface} />
            </View>
            <Text style={styles.controlLabel}>STOP</Text>
          </Pressable>

          <Pressable onPress={() => setShowMixer(true)} style={styles.controlBtn}>
            <View style={[
              styles.iconCircle,
              { backgroundColor: ambientActive ? 'rgba(183,159,255,0.18)' : colors.surfaceContainerHigh },
              ambientActive && {
                borderWidth: 1,
                borderColor: 'rgba(183,159,255,0.5)',
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 10,
              },
            ]}>
              <MaterialIcons
                name={ambientActive ? 'graphic-eq' : 'volume-up'}
                size={24}
                color={ambientActive ? colors.primary : colors.onSurfaceVariant}
              />
            </View>
            <Text style={[styles.controlLabel, ambientActive && { color: colors.primary }]}>
              SOUND
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Ambient sound mixer sheet */}
      <BottomSheet visible={showMixer} onClose={() => setShowMixer(false)}>
        <AmbientMixer onClose={() => setShowMixer(false)} />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d1c',
  },
  videoSection: {
    flex: 1,
    overflow: 'hidden',
  },
  videoOverlay: {
    paddingHorizontal: padding.screen,
    alignItems: 'center',
  },
  periodLabel: {
    ...textStyles.labelSmall,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 3,
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subjectLabel: {
    ...textStyles.bodySmall,
    color: 'rgba(255,255,255,0.55)',
    fontStyle: 'italic',
  },
  videoFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  infoSection: {
    paddingHorizontal: padding.screen,
    paddingTop: spacing.md,
    gap: spacing.sm + 2,
    backgroundColor: '#0d0d1c',
  },
  bubble: {
    backgroundColor: colors.surfaceContainerHigh,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  bubbleBreak: {
    borderLeftColor: colors.secondary,
    shadowColor: colors.secondary,
  },
  bubbleText: {
    ...textStyles.bodySmall,
    color: colors.onSurface,
    fontStyle: 'italic',
  },
  bubbleTextBreak: {
    color: colors.secondary,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 76,
    fontFamily: fonts.heading,
    fontWeight: '700',
    letterSpacing: -3,
    lineHeight: 84,
  },
  timerColon: {
    fontSize: 60,
    fontWeight: '200',
    marginHorizontal: 2,
    lineHeight: 84,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    ...textStyles.labelTiny,
    color: colors.onSurfaceVariant,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlBtn: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCirclePrimary: {
    width: 62,
    height: 62,
  },
  controlLabel: {
    ...textStyles.labelTiny,
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
  },
});

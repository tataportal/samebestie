import React, { useEffect, useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Animated,
  Modal,
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
import { useAmbientStore } from '../../src/store/useAmbientStore';
import { useAmbientSound } from '../../src/hooks/useAmbientSound';
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

  // Ambient sound
  const ambientTracks = useAmbientStore((s) => s.tracks);
  const toggleTrack = useAmbientStore((s) => s.toggleTrack);
  const setVolume = useAmbientStore((s) => s.setVolume);
  useAmbientSound();

  const quotes = getSessionQuotes(personality);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [showAmbient, setShowAmbient] = useState(false);
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

        {/* ── TIMER ──────────────────────────────── */}
        <View style={styles.timerBlock}>
          <Text style={[v2Text.serial, { color: v2Colors.stamp, marginBottom: 4 }]}>
            TIME REMAINING
          </Text>
          <View style={styles.timerRow}>
            <Text
              // @ts-ignore
              className={Platform.OS === 'web' ? 'v2-soft v2-tabular' : undefined}
              style={[v2Text.timerHuge, { color: v2Colors.ink, fontSize: 96, lineHeight: 100 }, isPaused && { color: v2Colors.inkMuted }]}
            >
              {minutes}
            </Text>
            <Animated.Text
              style={[v2Text.timerHuge, { color: accent, opacity: colonOpacity, fontSize: 96, lineHeight: 100, marginHorizontal: -2 }]}
            >
              :
            </Animated.Text>
            <Text
              // @ts-ignore
              className={Platform.OS === 'web' ? 'v2-soft v2-tabular' : undefined}
              style={[v2Text.timerHuge, { color: v2Colors.ink, fontSize: 96, lineHeight: 100 }, isPaused && { color: v2Colors.inkMuted }]}
            >
              {seconds}
            </Text>
          </View>
          {/* Ruler */}
          <View style={styles.ruler}>
            {Array.from({ length: 40 }).map((_, i) => {
              const passed = i / 40 < progressRatio;
              const isMajor = i % 5 === 0;
              return (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    height: isMajor ? 12 : 6,
                    backgroundColor: passed ? accent : v2Colors.rule,
                    opacity: passed ? 1 : isMajor ? 1 : 0.6,
                  }}
                />
              );
            })}
          </View>
        </View>

        {/* ── VIDEO (BIG, full width) ────────────── */}
        <View style={styles.videoFrame}>
          {Platform.OS === 'web' ? (
            // @ts-ignore
            <video
              src={require('../../assets/images/penguin-studying.mp4')}
              autoPlay
              loop
              muted
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : null}
          {/* Memo overlay on bottom */}
          <Animated.View style={[styles.memoOverlay, { opacity: quoteOpacity }]}>
            <Text style={[v2Text.quote, { color: v2Colors.paperBright, fontSize: 15, lineHeight: 20 }]}>
              {isBreak ? 'Breathe. You have done enough.' : currentQuote}
            </Text>
          </Animated.View>
          {isPaused && (
            <Stamp label="PAUSED" sub="RESUME?" color={v2Colors.amber} rotate={-14} size={90} style={styles.sessionStamp} />
          )}
          {isBreak && !isPaused && (
            <Stamp label="BREAK" sub="BREATHE" color={v2Colors.moss} rotate={10} size={90} style={styles.sessionStamp} />
          )}
        </View>

        {/* ── STATS ROW ─────────────────────────── */}
        <View style={styles.statsTape}>
          <View style={styles.tapeItem}>
            <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>FOCUS</Text>
            <Text style={[v2Text.displaySerif, { color: v2Colors.ink, fontSize: 22 }]}>
              {focusScore}
              <Text style={[v2Text.serial, { color: v2Colors.inkMuted }]}> /100</Text>
            </Text>
          </View>
          <View style={styles.tapeDivider} />
          <View style={styles.tapeItem}>
            <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>EARNED</Text>
            <Text style={[v2Text.displaySerif, { color: v2Colors.coral, fontSize: 22 }]}>
              +{estimatedXP}
              <Text style={[v2Text.serial, { color: v2Colors.inkMuted }]}> xp</Text>
            </Text>
          </View>
          <View style={styles.tapeDivider} />
          <View style={styles.tapeItem}>
            <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>INTERRUPTS</Text>
            <Text style={[v2Text.displaySerif, { color: v2Colors.moss, fontSize: 22 }]}>
              {String(interruptions).padStart(2, '0')}
            </Text>
          </View>
        </View>

        {/* ── AMBIENT TRIGGER ────────────────────── */}
        <Pressable onPress={() => setShowAmbient(true)} style={styles.ambientTrigger}>
          <Text style={{ fontSize: 14 }}>🎧</Text>
          <Text style={[v2Text.serial, { color: v2Colors.ink }]}>
            AMBIENT · {ambientTracks.filter((t) => t.active).length > 0
              ? ambientTracks.filter((t) => t.active).map((t) => t.emoji).join(' ')
              : 'OFF'}
          </Text>
        </Pressable>

        {/* ── SPACER + CONTROLS ──────────────────── */}
        <View style={{ flex: 1, minHeight: 8 }} />
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

      {/* ── AMBIENT MODAL ───────────────────────── */}
      <Modal
        visible={showAmbient}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAmbient(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowAmbient(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={[v2Text.field, { color: v2Colors.ink, letterSpacing: 3 }]}>
                AMBIENT MIXER
              </Text>
              <Pressable onPress={() => setShowAmbient(false)}>
                <Text style={{ fontSize: 22, color: v2Colors.ink }}>×</Text>
              </Pressable>
            </View>
            <Text style={[v2Text.serial, { color: v2Colors.stamp, marginBottom: v2Space.md }]}>
              STACK LAYERS · ADJUST VOLUME
            </Text>

            {ambientTracks.map((t) => (
              <View key={t.id} style={styles.mixerRow}>
                <Pressable
                  onPress={() => toggleTrack(t.id)}
                  style={[styles.mixerToggle, t.active && styles.mixerToggleOn]}
                >
                  <Text style={{ fontSize: 18 }}>{t.emoji}</Text>
                </Pressable>
                <View style={{ flex: 1, opacity: t.active ? 1 : 0.35 }}>
                  <Text style={[v2Text.serial, { color: t.active ? v2Colors.ink : v2Colors.inkMuted }]}>
                    {t.label}
                  </Text>
                  {Platform.OS === 'web' ? (
                    // @ts-ignore
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step="any"
                      value={t.volume}
                      disabled={!t.active}
                      onChange={(e: any) => setVolume(t.id, parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: v2Colors.coral, marginTop: 4 }}
                    />
                  ) : (
                    <View style={{ height: 4, backgroundColor: v2Colors.rule, marginTop: 4 }}>
                      <View style={{ width: `${t.volume * 100}%`, height: 4, backgroundColor: v2Colors.coral }} />
                    </View>
                  )}
                </View>
                <Text style={[v2Text.serial, { color: v2Colors.stamp, width: 30, textAlign: 'right' }]}>
                  {t.active ? Math.round(t.volume * 100) : '—'}
                </Text>
              </View>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
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
  timerBlock: {
    alignItems: 'center',
    marginTop: v2Space.md,
  },
  videoFrame: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderWidth: 1.5,
    borderColor: v2Colors.ink,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: v2Space.md,
    position: 'relative',
    backgroundColor: v2Colors.paperDeep,
    shadowColor: v2Colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  memoOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(20,32,58,0.78)',
    padding: v2Space.sm,
    paddingHorizontal: v2Space.md,
  },
  sessionStamp: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  ruler: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 14,
    marginTop: 4,
    gap: 2,
    alignSelf: 'stretch',
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
  ambientTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: v2Space.md,
    borderWidth: 1,
    borderColor: v2Colors.paperShadow,
    borderRadius: 4,
    backgroundColor: v2Colors.paperBright,
    marginTop: v2Space.md,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(20,32,58,0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: v2Colors.paper,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    padding: v2Space.lg,
    borderTopWidth: 2,
    borderTopColor: v2Colors.ink,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  mixerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: v2Space.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderStyle: 'dotted',
    borderColor: v2Colors.rule,
  },
  mixerToggle: {
    width: 42,
    height: 42,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: v2Colors.paperShadow,
    backgroundColor: v2Colors.paperBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mixerToggleOn: {
    borderColor: v2Colors.ink,
    backgroundColor: v2Colors.coralWash,
    shadowColor: v2Colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
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

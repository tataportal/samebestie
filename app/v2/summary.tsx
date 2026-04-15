import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { useUserStore } from '../../src/store/useUserStore';
import { usePetStore } from '../../src/store/usePetStore';
import { useHistoryStore } from '../../src/store/useHistoryStore';
import {
  calculateSessionXP,
  calculateFocusScore,
  getFocusScoreRank,
} from '../../src/utils/xpCalculator';
import {
  getBestieQuote,
  getPetMoodFromSession,
} from '../../src/utils/moodEngine';
import { getXPProgress } from '../../src/utils/levelSystem';
import { PostSessionMood } from '../../src/types';
import { v2Colors, v2Text, v2Space } from '../../src/theme/v2';
import { V2WebFonts } from '../../src/components/v2/WebFonts';

const POST_OPTIONS: {
  mood: PostSessionMood;
  label: string;
  emoji: string;
  accent: string;
  copy: string;
}[] = [
  { mood: 'better', label: 'Better', emoji: '📈', accent: v2Colors.moss,  copy: 'a small ascent' },
  { mood: 'same',   label: 'Same',   emoji: '⚖',  accent: v2Colors.stamp, copy: 'level ground' },
  { mood: 'worse',  label: 'Worse',  emoji: '🌧',  accent: v2Colors.sky,   copy: 'a passing cloud' },
];

export default function V2Summary() {
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

  const handlePostMood = (m: PostSessionMood) => {
    setSelectedPostMood(m);
    setPostMood(m);
  };

  const handleHub = () => {
    resetSession();
    router.replace('/v2');
  };

  const dateStr = new Date()
    .toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
    .toUpperCase();

  return (
    <PaperLayer>
      <V2WebFonts />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: insets.top + v2Space.md,
            paddingBottom: insets.bottom + v2Space.xxl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── MASTHEAD ───────────────────────────── */}
        <View style={styles.masthead}>
          <View>
            <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>
              CLOSING RECEIPT · {dateStr}
            </Text>
            <Text style={[v2Text.field, { color: v2Colors.ink, marginTop: 4 }]}>
              THE LEDGER IS CLOSED
            </Text>
          </View>
          <Stamp
            label={completed ? 'CERTIFIED' : 'LOGGED'}
            sub={completed ? 'COMPLETE' : 'IN PART'}
            color={completed ? v2Colors.moss : v2Colors.amber}
            rotate={-8}
            size={68}
          />
        </View>
        <RuledDivider variant="double" color={v2Colors.ink} style={{ marginTop: 8 }} />

        {/* ── HERO ───────────────────────────────── */}
        <View style={styles.hero}>
          <Text
            // @ts-ignore
            className={Platform.OS === 'web' ? 'v2-wonk' : undefined}
            style={[v2Text.heroSerif, { color: v2Colors.ink }]}
          >
            {completed ? 'Session' : 'A partial'}
          </Text>
          <Text
            // @ts-ignore
            className={Platform.OS === 'web' ? 'v2-soft' : undefined}
            style={[
              v2Text.heroSerif,
              {
                color: v2Colors.coral,
                fontStyle: 'italic',
                fontWeight: '300',
              },
            ]}
          >
            {completed ? 'completed.' : 'entry.'}
          </Text>
        </View>

        {/* ── XP HERO BADGE ──────────────────────── */}
        <IndexCard
          style={styles.xpCard}
          tint={v2Colors.paperBright}
          accent={v2Colors.coral}
          serial={`XP · ${String(xpEarned).padStart(3, '0')}`}
        >
          <View style={styles.xpRow}>
            <View style={{ flex: 1 }}>
              <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>
                EARNED · LEVEL {xpProgress.level}
              </Text>
              <Text
                // @ts-ignore
                className={Platform.OS === 'web' ? 'v2-tabular' : undefined}
                style={[
                  v2Text.heroSerif,
                  {
                    color: v2Colors.ink,
                    fontSize: 84,
                    lineHeight: 88,
                    marginTop: 4,
                  },
                ]}
              >
                <Text style={{ color: v2Colors.coral }}>+</Text>
                {xpEarned}
                <Text
                  style={[
                    v2Text.cardSerif,
                    { color: v2Colors.stamp, fontSize: 20 },
                  ]}
                >
                  {' '}xp
                </Text>
              </Text>
              <Text
                style={[
                  v2Text.quote,
                  { color: v2Colors.inkSoft, marginTop: 4 },
                ]}
              >
                rank of this sitting · {scoreRank.toLowerCase()}
              </Text>
            </View>
          </View>

          {/* XP bar as tick ruler */}
          <View style={styles.xpRulerWrap}>
            <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>
              LV {xpProgress.level}
            </Text>
            <View style={styles.xpRuler}>
              {Array.from({ length: 30 }).map((_, i) => {
                const filled = i / 30 < xpProgress.ratio;
                return (
                  <View
                    key={i}
                    style={[
                      styles.xpTick,
                      {
                        backgroundColor: filled ? v2Colors.ink : v2Colors.rule,
                        height: filled ? 14 : 8,
                      },
                    ]}
                  />
                );
              })}
            </View>
            <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>
              {xpProgress.current}/{xpProgress.max}
            </Text>
          </View>
        </IndexCard>

        {/* ── STATS LEDGER ───────────────────────── */}
        <FieldLabel index="N°01" style={{ marginTop: v2Space.xl }}>
          Session ledger
        </FieldLabel>

        <View style={styles.ledger}>
          <View style={styles.ledgerRow}>
            <Text style={[v2Text.field, { color: v2Colors.inkMuted }]}>
              Focus score
            </Text>
            <View style={styles.dots} />
            <Text style={[v2Text.displaySerif, { color: v2Colors.ink }]}>
              {focusScore}
              <Text style={[v2Text.field, { color: v2Colors.stamp }]}> /100</Text>
            </Text>
          </View>
          <RuledDivider variant="dotted" style={{ marginVertical: 6 }} />
          <View style={styles.ledgerRow}>
            <Text style={[v2Text.field, { color: v2Colors.inkMuted }]}>
              Time held
            </Text>
            <View style={styles.dots} />
            <Text style={[v2Text.displaySerif, { color: v2Colors.coral }]}>
              {elapsedMinutes}′
            </Text>
          </View>
          <RuledDivider variant="dotted" style={{ marginVertical: 6 }} />
          <View style={styles.ledgerRow}>
            <Text style={[v2Text.field, { color: v2Colors.inkMuted }]}>
              Interruptions
            </Text>
            <View style={styles.dots} />
            <Text style={[v2Text.displaySerif, { color: v2Colors.amber }]}>
              {String(interruptions).padStart(2, '0')}
            </Text>
          </View>
          <RuledDivider variant="dotted" style={{ marginVertical: 6 }} />
          <View style={styles.ledgerRow}>
            <Text style={[v2Text.field, { color: v2Colors.inkMuted }]}>
              Streak · consecutive
            </Text>
            <View style={styles.dots} />
            <Text style={[v2Text.displaySerif, { color: v2Colors.moss }]}>
              {String(currentStreak).padStart(2, '0')}
            </Text>
          </View>
          {studySubject && (
            <>
              <RuledDivider variant="dotted" style={{ marginVertical: 6 }} />
              <View style={styles.ledgerRow}>
                <Text style={[v2Text.field, { color: v2Colors.inkMuted }]}>
                  Subject
                </Text>
                <View style={styles.dots} />
                <Text
                  style={[
                    v2Text.cardSerif,
                    {
                      color: v2Colors.ink,
                      fontStyle: 'italic',
                    },
                  ]}
                >
                  {studySubject}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* ── LETTER FROM BESTIE ─────────────────── */}
        <FieldLabel index="N°02" style={{ marginTop: v2Space.xl }}>
          Remarks from your bestie
        </FieldLabel>

        <IndexCard
          style={styles.letter}
          tint={v2Colors.paperBright}
          accent={v2Colors.moss}
          serial="MEMO"
        >
          <View style={styles.letterHead}>
            <PetGlyph
              animal={petAnimal}
              size={90}
              label={(petName || 'BESTIE').toUpperCase()}
              serial={String(petMoodResult).toUpperCase()}
            />
            <View style={{ flex: 1, marginLeft: v2Space.md }}>
              <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>
                OBSERVED MOOD · {String(petMoodResult).toUpperCase()}
              </Text>
              <Text
                style={[
                  v2Text.quote,
                  {
                    color: v2Colors.ink,
                    marginTop: 6,
                    fontSize: 18,
                    lineHeight: 26,
                  },
                ]}
              >
                <Text
                  style={{ color: v2Colors.coral, fontSize: 32, lineHeight: 24 }}
                >
                  “
                </Text>
                {quote}
                <Text
                  style={{ color: v2Colors.coral, fontSize: 32, lineHeight: 24 }}
                >
                  ”
                </Text>
              </Text>
              <Text
                style={[
                  v2Text.serial,
                  { color: v2Colors.stamp, marginTop: 8, fontStyle: 'italic' },
                ]}
              >
                — {(petName || 'Your Bestie').toUpperCase()}, ON DUTY
              </Text>
            </View>
          </View>
        </IndexCard>

        {/* ── POST-SESSION MOOD ──────────────────── */}
        <FieldLabel index="N°03" style={{ marginTop: v2Space.xl }}>
          And now — how do you leave?
        </FieldLabel>

        <View style={styles.postRow}>
          {POST_OPTIONS.map((o) => {
            const active = selectedPostMood === o.mood;
            return (
              <Pressable
                key={o.mood}
                onPress={() => handlePostMood(o.mood)}
                style={({ pressed }) => [
                  styles.postCard,
                  {
                    borderColor: active ? v2Colors.ink : v2Colors.paperShadow,
                    backgroundColor: active ? v2Colors.paperBright : v2Colors.paper,
                    transform: pressed ? [{ translateY: 1 }] : [{ translateY: 0 }],
                  },
                  active && {
                    shadowColor: v2Colors.ink,
                    shadowOffset: { width: 3, height: 3 },
                    shadowOpacity: 1,
                    shadowRadius: 0,
                  },
                ]}
              >
                <View style={[styles.postAccent, { backgroundColor: o.accent }]} />
                <Text style={styles.postEmoji}>{o.emoji}</Text>
                <Text
                  style={[
                    v2Text.cardSerif,
                    {
                      color: active ? v2Colors.ink : v2Colors.inkSoft,
                      fontStyle: 'italic',
                      marginTop: 4,
                    },
                  ]}
                >
                  {o.label}
                </Text>
                <Text
                  style={[
                    v2Text.serial,
                    { color: v2Colors.stamp, marginTop: 2, textAlign: 'center' },
                  ]}
                >
                  {o.copy}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── CUT-HERE + CTA ─────────────────────── */}
        <View style={styles.cutRow}>
          <RuledDivider variant="dashed" color={v2Colors.stamp} style={{ flex: 1 }} />
          <Text style={[v2Text.serial, { color: v2Colors.stamp, marginHorizontal: 8 }]}>
            — CUT HERE —
          </Text>
          <RuledDivider variant="dashed" color={v2Colors.stamp} style={{ flex: 1 }} />
        </View>

        <View style={{ marginTop: v2Space.lg }}>
          <InkButton
            label="Return to the library"
            sublabel="home, and a soft closing"
            variant="ink"
            onPress={handleHub}
            full
          />
        </View>

        <View style={styles.foot}>
          <Asterism char="✦ ※ ✦" color={v2Colors.stamp} size={10} />
          <Text
            style={[
              v2Text.serial,
              { color: v2Colors.stamp, textAlign: 'center', marginTop: 4, fontStyle: 'italic' },
            ]}
          >
            Stamped · Entered into the record · {dateStr}
          </Text>
        </View>
      </ScrollView>
    </PaperLayer>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { paddingHorizontal: v2Space.lg },
  masthead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  hero: {
    marginTop: v2Space.md,
    marginBottom: v2Space.lg,
  },

  xpCard: {
    shadowColor: v2Colors.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  xpRow: {
    flexDirection: 'row',
  },
  xpRulerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: v2Space.md,
    gap: 8,
  },
  xpRuler: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 18,
  },
  xpTick: {
    flex: 1,
    borderRadius: 1,
  },

  ledger: {
    backgroundColor: v2Colors.paperBright,
    borderWidth: 1,
    borderColor: v2Colors.paperShadow,
    borderRadius: 4,
    padding: v2Space.lg,
    shadowColor: v2Colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  ledgerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  dots: {
    flex: 1,
    borderBottomWidth: 1,
    borderStyle: 'dotted',
    borderColor: v2Colors.rule,
    marginBottom: 6,
  },

  letter: {
    shadowColor: v2Colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  letterHead: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  postRow: {
    flexDirection: 'row',
    gap: v2Space.sm,
  },
  postCard: {
    flex: 1,
    paddingVertical: v2Space.md,
    paddingHorizontal: v2Space.sm,
    borderWidth: 1.5,
    borderRadius: 4,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  postAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  postEmoji: {
    fontSize: 30,
    lineHeight: 34,
    marginTop: 6,
  },

  cutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: v2Space.xl,
  },

  foot: {
    marginTop: v2Space.lg,
    alignItems: 'center',
  },
});

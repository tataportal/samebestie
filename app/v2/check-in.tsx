import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
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
import { useFocusStore } from '../../src/store/useFocusStore';
import { usePetStore } from '../../src/store/usePetStore';
import { getRecommendedMode } from '../../src/utils/moodEngine';
import {
  MOOD_LEVELS,
  TASK_TYPES,
  FOCUS_MODES,
  MoodLevel,
  TaskType,
} from '../../src/types';
import { formatMinutes } from '../../src/utils/formatTime';
import { v2Colors, v2Text, v2Space } from '../../src/theme/v2';
import { V2WebFonts } from '../../src/components/v2/WebFonts';

const FOCUS_VALUES = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 75, 90];
const REST_VALUES = [1, 2, 3, 5, 7, 10, 15, 20];
const ROUNDS_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const MOOD_EMOJIS: Record<string, string> = {
  fried: '😵',
  low: '😔',
  neutral: '😐',
  good: '🙂',
  sharp: '⚡',
};

const MOOD_ACCENT: Record<string, string> = {
  fried: v2Colors.coral,
  low: v2Colors.sky,
  neutral: v2Colors.stamp,
  good: v2Colors.moss,
  sharp: v2Colors.amber,
};

const PRESETS = {
  'tiny-start': { focus: 5, rest: 1, rounds: 3 },
  gentle:       { focus: 15, rest: 3, rounds: 3 },
  classic:      { focus: 25, rest: 5, rounds: 4 },
  hyper:        { focus: 50, rest: 10, rounds: 2 },
};

function Stepper({
  label,
  value,
  values,
  onIndex,
  accent,
  suffix,
}: {
  label: string;
  value: number;
  values: number[];
  onIndex: (i: number) => void;
  accent: string;
  suffix?: string;
}) {
  const idx = Math.max(0, values.indexOf(value));
  return (
    <View style={styles.stepperBox}>
      <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>{label}</Text>
      <View style={styles.stepperRow}>
        <Pressable
          onPress={() => onIndex(Math.max(0, idx - 1))}
          style={[styles.stepBtn, { borderColor: v2Colors.ink }]}
        >
          <Text
            style={[
              v2Text.cardSerif,
              { color: v2Colors.ink, fontSize: 22, lineHeight: 24 },
            ]}
          >
            −
          </Text>
        </Pressable>
        <View style={styles.stepperValueBox}>
          <Text
            // @ts-ignore
            className={Platform.OS === 'web' ? 'v2-tabular' : undefined}
            style={[
              v2Text.displaySerif,
              { color: accent, textAlign: 'center', fontSize: 38 },
            ]}
          >
            {value}
            {suffix && (
              <Text
                style={[
                  v2Text.field,
                  { color: v2Colors.stamp, fontSize: 12 },
                ]}
              >
                {suffix}
              </Text>
            )}
          </Text>
        </View>
        <Pressable
          onPress={() => onIndex(Math.min(values.length - 1, idx + 1))}
          style={[styles.stepBtn, { borderColor: v2Colors.ink }]}
        >
          <Text
            style={[
              v2Text.cardSerif,
              { color: v2Colors.ink, fontSize: 22, lineHeight: 24 },
            ]}
          >
            +
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function V2CheckIn() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const setCheckIn = useFocusStore((s) => s.setCheckIn);
  const startSession = useFocusStore((s) => s.startSession);
  const personality = usePetStore((s) => s.personality);

  const [mood, setMood] = useState<MoodLevel | null>(null);
  const [task, setTask] = useState<TaskType | null>(null);
  const [subject, setSubject] = useState('');

  const [focusMin, setFocusMin] = useState(25);
  const [restMin, setRestMin] = useState(5);
  const [rounds, setRounds] = useState(4);

  const applyPreset = useCallback((key: keyof typeof PRESETS) => {
    const p = PRESETS[key];
    setFocusMin(p.focus);
    setRestMin(p.rest);
    setRounds(p.rounds);
  }, []);

  const onMoodSelect = (m: MoodLevel) => {
    setMood(m);
    const rec = getRecommendedMode(personality, m) as keyof typeof PRESETS;
    if (PRESETS[rec]) applyPreset(rec);
  };

  const totalMin = rounds * focusMin + (rounds - 1) * restMin;
  const canStart = mood && task;

  const handleStart = () => {
    if (!canStart) return;
    const mode =
      focusMin <= 5 ? 'tiny-start'
      : focusMin <= 15 ? 'gentle'
      : focusMin <= 30 ? 'classic'
      : 'hyper';
    setCheckIn(
      mood!,
      [],
      task!,
      task === 'study' ? subject.trim() || undefined : undefined,
    );
    startSession(mode, focusMin * 60, restMin * 60, rounds);
    router.replace('/v2/session');
  };

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
              INTAKE FORM · {new Date().toLocaleDateString()}
            </Text>
            <Text style={[v2Text.field, { color: v2Colors.ink, marginTop: 4 }]}>
              ADMIT, PLEASE — SOME QUESTIONS
            </Text>
          </View>
          <Pressable onPress={() => router.back()}>
            <Text style={[v2Text.serial, { color: v2Colors.coral }]}>
              ← Return
            </Text>
          </Pressable>
        </View>
        <RuledDivider variant="double" color={v2Colors.ink} style={{ marginTop: 8 }} />

        {/* ── HERO TITLE ────────────────────────── */}
        <View style={styles.hero}>
          <Text
            // @ts-ignore
            className={Platform.OS === 'web' ? 'v2-wonk' : undefined}
            style={[v2Text.heroSerif, { color: v2Colors.ink }]}
          >
            The
          </Text>
          <View style={styles.heroRow}>
            <Text
              // @ts-ignore
              className={Platform.OS === 'web' ? 'v2-soft' : undefined}
              style={[
                v2Text.heroSerif,
                { color: v2Colors.coral, fontStyle: 'italic', fontWeight: '300' },
              ]}
            >
              consultation
            </Text>
            <Text style={[v2Text.heroSerif, { color: v2Colors.ink }]}>.</Text>
          </View>
          <Text style={[v2Text.bodySmall, styles.tagline]}>
            A short preamble before the session begins. Your bestie will
            tailor the prescription accordingly.
          </Text>
        </View>

        {/* ── Q1 MOOD ────────────────────────────── */}
        <FieldLabel index="Q·01" style={{ marginTop: v2Space.lg }}>
          On this day, how do you arrive?
        </FieldLabel>
        <View style={styles.moodRow}>
          {MOOD_LEVELS.map((m) => {
            const active = mood === m.level;
            const accent = MOOD_ACCENT[m.level] || v2Colors.ink;
            return (
              <Pressable
                key={m.level}
                onPress={() => onMoodSelect(m.level)}
                style={({ pressed }) => [
                  styles.moodCard,
                  {
                    borderColor: active ? v2Colors.ink : v2Colors.paperShadow,
                    backgroundColor: active ? v2Colors.paperBright : v2Colors.paper,
                    transform: pressed ? [{ translateY: 2 }] : [{ translateY: 0 }],
                  },
                  active && {
                    shadowColor: v2Colors.ink,
                    shadowOffset: { width: 3, height: 3 },
                    shadowOpacity: 1,
                    shadowRadius: 0,
                  },
                ]}
              >
                <View style={[styles.moodTick, { backgroundColor: accent }]} />
                <Text style={styles.moodEmoji}>{MOOD_EMOJIS[m.level]}</Text>
                <Text
                  style={[
                    v2Text.serial,
                    {
                      color: active ? accent : v2Colors.inkMuted,
                      marginTop: 4,
                    },
                  ]}
                >
                  {m.label.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── Q2 WORKING ON ──────────────────────── */}
        <FieldLabel index="Q·02" style={{ marginTop: v2Space.xl }}>
          Today's occupation
        </FieldLabel>
        <View style={styles.taskGrid}>
          {TASK_TYPES.map((t) => {
            const active = task === t.type;
            return (
              <Pressable
                key={t.type}
                onPress={() => setTask(t.type as TaskType)}
                style={({ pressed }) => [
                  styles.taskCard,
                  {
                    borderColor: active ? v2Colors.ink : v2Colors.paperShadow,
                    backgroundColor: active
                      ? v2Colors.coralWash
                      : v2Colors.paperBright,
                    transform: pressed ? [{ translateY: 1 }] : [{ translateY: 0 }],
                  },
                ]}
              >
                <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>
                  {t.type.toUpperCase().replace('-', ' ')}
                </Text>
                <Text
                  style={[
                    v2Text.cardSerif,
                    {
                      color: v2Colors.ink,
                      fontStyle: 'italic',
                      marginTop: 2,
                    },
                  ]}
                >
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {task === 'study' && (
          <TextInput
            value={subject}
            onChangeText={setSubject}
            placeholder="What subject, specifically?"
            placeholderTextColor={v2Colors.inkMuted}
            style={styles.subjectInput}
            maxLength={60}
            returnKeyType="done"
          />
        )}

        {/* ── Q3 TIMER ───────────────────────────── */}
        <FieldLabel index="Q·03" style={{ marginTop: v2Space.xl }}>
          Prescribed dosage
        </FieldLabel>

        {/* Preset chips */}
        <View style={styles.presetRow}>
          {FOCUS_MODES.map((m) => (
            <Pressable
              key={m.mode}
              onPress={() => applyPreset(m.mode as keyof typeof PRESETS)}
              style={({ pressed }) => [
                styles.presetChip,
                {
                  backgroundColor: v2Colors.paperBright,
                  transform: pressed ? [{ translateY: 1 }] : [{ translateY: 0 }],
                },
              ]}
            >
              <Text style={[v2Text.serial, { color: v2Colors.ink }]}>
                {m.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.stepperRow}>
          <Stepper
            label="ROUNDS"
            value={rounds}
            values={ROUNDS_VALUES}
            onIndex={(i) => setRounds(ROUNDS_VALUES[i])}
            accent={v2Colors.coral}
            suffix="×"
          />
          <View style={styles.stepperDivider} />
          <Stepper
            label="FOCUS"
            value={focusMin}
            values={FOCUS_VALUES}
            onIndex={(i) => setFocusMin(FOCUS_VALUES[i])}
            accent={v2Colors.ink}
            suffix="′"
          />
          <View style={styles.stepperDivider} />
          <Stepper
            label="REST"
            value={restMin}
            values={REST_VALUES}
            onIndex={(i) => setRestMin(REST_VALUES[i])}
            accent={v2Colors.moss}
            suffix="′"
          />
        </View>

        <IndexCard
          style={styles.totalCard}
          tint={v2Colors.paperBright}
          accent={v2Colors.ink}
          serial="TOTAL"
        >
          <View style={styles.totalRow}>
            <Text style={[v2Text.field, { color: v2Colors.stamp }]}>
              Duration, total
            </Text>
            <View style={styles.totalDots} />
            <Text
              // @ts-ignore
              className={Platform.OS === 'web' ? 'v2-tabular' : undefined}
              style={[
                v2Text.heroSerif,
                {
                  color: v2Colors.ink,
                  fontSize: 44,
                  lineHeight: 46,
                },
              ]}
            >
              {formatMinutes(totalMin)}
            </Text>
          </View>
          <Text
            style={[
              v2Text.bodySmall,
              {
                color: v2Colors.inkMuted,
                marginTop: 6,
                fontStyle: 'italic',
              },
            ]}
          >
            {rounds} × {focusMin}′ focus, with {rounds - 1} × {restMin}′ rest
            between. Enough to make a dent.
          </Text>
        </IndexCard>

        {/* ── SUBMIT ─────────────────────────────── */}
        <View style={{ marginTop: v2Space.xl, flexDirection: 'row', gap: v2Space.md }}>
          <Stamp
            label={canStart ? 'READY' : 'PENDING'}
            sub={canStart ? 'TO BEGIN' : 'ANSWER Q·01–02'}
            color={canStart ? v2Colors.moss : v2Colors.stamp}
            rotate={-10}
            size={78}
          />
          <View style={{ flex: 1 }}>
            <InkButton
              label={canStart ? 'Begin Session' : 'Answer to continue'}
              sublabel={canStart ? 'the bestie awaits' : 'mood and occupation, please'}
              variant={canStart ? 'ink' : 'paper'}
              onPress={handleStart}
              disabled={!canStart}
              full
            />
          </View>
        </View>

        <View style={styles.foot}>
          <Asterism char="✦ ❋ ✦" color={v2Colors.stamp} size={10} />
          <Text
            style={[
              v2Text.serial,
              { color: v2Colors.stamp, textAlign: 'center', marginTop: 4 },
            ]}
          >
            Filed · Logged · With your consent
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
    marginBottom: v2Space.md,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  tagline: {
    color: v2Colors.inkSoft,
    marginTop: v2Space.sm,
    fontStyle: 'italic',
    maxWidth: 440,
  },

  moodRow: {
    flexDirection: 'row',
    gap: v2Space.sm,
  },
  moodCard: {
    flex: 1,
    paddingVertical: v2Space.md,
    paddingHorizontal: v2Space.sm,
    borderWidth: 1.5,
    borderRadius: 4,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  moodTick: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  moodEmoji: {
    fontSize: 30,
    lineHeight: 34,
    marginTop: 6,
  },

  taskGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: v2Space.sm,
  },
  taskCard: {
    flex: 1,
    flexBasis: '30%',
    minWidth: 140,
    paddingVertical: v2Space.md,
    paddingHorizontal: v2Space.md,
    borderWidth: 1.5,
    borderRadius: 4,
  },
  subjectInput: {
    marginTop: v2Space.md,
    backgroundColor: v2Colors.paperBright,
    borderWidth: 1.5,
    borderColor: v2Colors.ink,
    paddingHorizontal: v2Space.md,
    paddingVertical: v2Space.md,
    fontFamily:
      Platform.OS === 'web'
        ? '"Fraunces", "Hoefler Text", Georgia, serif'
        : 'serif',
    fontSize: 19,
    fontStyle: 'italic',
    color: v2Colors.ink,
    borderRadius: 2,
  },

  presetRow: {
    flexDirection: 'row',
    gap: v2Space.sm,
    marginBottom: v2Space.md,
  },
  presetChip: {
    flex: 1,
    paddingVertical: v2Space.sm,
    paddingHorizontal: v2Space.sm,
    borderWidth: 1,
    borderColor: v2Colors.ink,
    borderRadius: 2,
    alignItems: 'center',
  },

  stepperBox: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: v2Space.xs,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: v2Space.sm,
  },
  stepperValueBox: {
    flex: 1,
    alignItems: 'center',
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderWidth: 1.5,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: v2Colors.paperBright,
  },
  stepperDivider: {
    width: 1,
    height: 54,
    backgroundColor: v2Colors.rule,
  },

  totalCard: {
    marginTop: v2Space.md,
    shadowColor: v2Colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  totalDots: {
    flex: 1,
    borderBottomWidth: 1,
    borderStyle: 'dotted',
    borderColor: v2Colors.rule,
    marginBottom: 6,
  },

  foot: {
    marginTop: v2Space.xl,
    alignItems: 'center',
  },
});

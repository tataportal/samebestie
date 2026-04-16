import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PaperLayer } from '../../src/components/v2/PaperLayer';
import { InkButton } from '../../src/components/v2/Primitives';
import { WheelPicker } from '../../src/components/WheelPicker';
import { useFocusStore } from '../../src/store/useFocusStore';
import { usePetStore } from '../../src/store/usePetStore';
import { getRecommendedMode } from '../../src/utils/moodEngine';
import { MOOD_LEVELS, TASK_TYPES, MoodLevel, TaskType } from '../../src/types';
import { v2Colors, v2Text, v2Space } from '../../src/theme/v2';
import { V2WebFonts } from '../../src/components/v2/WebFonts';

/* ── Data ──────────────────────────────────────────────── */

const MOOD_EMOJI: Record<string, string> = {
  fried: '😵', low: '😔', neutral: '😐', good: '🙂', sharp: '⚡',
};

const FOCUS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 75, 90];
const REST  = [1, 2, 3, 5, 7, 10, 15];
const ROUNDS_MAX = 6;

const PRESETS: Record<string, { f: number; r: number; n: number }> = {
  'tiny-start': { f: 5,  r: 1,  n: 3 },
  gentle:       { f: 15, r: 3,  n: 3 },
  classic:      { f: 25, r: 5,  n: 4 },
  hyper:        { f: 50, r: 10, n: 2 },
};

/* ── Screen ────────────────────────────────────────────── */

export default function V2CheckIn() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setCheckIn = useFocusStore((s) => s.setCheckIn);
  const startSession = useFocusStore((s) => s.startSession);
  const personality = usePetStore((s) => s.personality);

  const [mood, setMood]       = useState<MoodLevel | null>(null);
  const [task, setTask]       = useState<TaskType | null>(null);
  const [subject, setSubject] = useState('');
  const [focusI, setFocusI]   = useState(FOCUS.indexOf(25));
  const [restI, setRestI]     = useState(REST.indexOf(5));
  const [roundsI, setRoundsI] = useState(3); // 0-indexed → rounds = i+1

  const focusMin = FOCUS[focusI];
  const restMin  = REST[restI];
  const rounds   = roundsI + 1;
  const total    = rounds * focusMin + (rounds - 1) * restMin;
  const hours    = Math.floor(total / 60);
  const mins     = total % 60;

  const onMood = (m: MoodLevel) => {
    setMood(m);
    const rec = getRecommendedMode(personality, m);
    const p = PRESETS[rec];
    if (p) {
      setFocusI(FOCUS.indexOf(p.f));
      setRestI(REST.indexOf(p.r));
      setRoundsI(p.n - 1);
    }
  };

  const canStart = mood !== null && task !== null;

  const go = () => {
    if (!canStart) return;
    const mode = focusMin <= 5 ? 'tiny-start' : focusMin <= 15 ? 'gentle' : focusMin <= 30 ? 'classic' : 'hyper';
    setCheckIn(mood!, [], task!, task === 'study' ? subject.trim() || undefined : undefined);
    startSession(mode, focusMin * 60, restMin * 60, rounds);
    router.replace('/v2/session');
  };

  return (
    <PaperLayer>
      <V2WebFonts />
      <View style={[s.root, { paddingTop: insets.top + v2Space.sm, paddingBottom: insets.bottom + v2Space.sm }]}>

        {/* ── HEADER ─────────────────────────── */}
        <View style={s.header}>
          <Pressable onPress={() => router.back()} style={s.back}>
            <Text style={{ fontSize: 22, color: v2Colors.ink }}>←</Text>
          </Pressable>
          <Text style={[v2Text.field, { color: v2Colors.ink, letterSpacing: 3 }]}>NEW SESSION</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* ── MOOD ────────────────────────────── */}
        <Text style={s.question}>How are you?</Text>
        <View style={s.moodRow}>
          {MOOD_LEVELS.map((m) => {
            const on = mood === m.level;
            return (
              <Pressable key={m.level} onPress={() => onMood(m.level)} style={[s.moodBtn, on && s.moodOn]}>
                <Text style={{ fontSize: 20 }}>{MOOD_EMOJI[m.level]}</Text>
                <Text style={[v2Text.serial, { color: on ? v2Colors.ink : v2Colors.inkMuted, fontSize: 8 }]}>
                  {m.label.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── WHEELS ─────────────────────────── */}
        <View style={s.wheels}>
          <View style={s.wCol}>
            <Text style={s.wLabel}>ROUNDS</Text>
            <WheelPicker
              items={Array.from({ length: ROUNDS_MAX }, (_, i) => String(i + 1))}
              selectedIndex={roundsI}
              onChange={setRoundsI}
              width={60}
              accentColor={v2Colors.ink}
            />
          </View>
          <View style={s.wDiv} />
          <View style={s.wCol}>
            <Text style={s.wLabel}>FOCUS</Text>
            <WheelPicker
              items={FOCUS.map((v) => `${v}'`)}
              selectedIndex={focusI}
              onChange={setFocusI}
              width={72}
              accentColor={v2Colors.coral}
            />
          </View>
          <View style={s.wDiv} />
          <View style={s.wCol}>
            <Text style={s.wLabel}>REST</Text>
            <WheelPicker
              items={REST.map((v) => `${v}'`)}
              selectedIndex={restI}
              onChange={setRestI}
              width={60}
              accentColor={v2Colors.moss}
            />
          </View>
        </View>

        {/* total */}
        <Text
          // @ts-ignore
          className={Platform.OS === 'web' ? 'v2-soft' : undefined}
          style={s.total}
        >
          {hours > 0 ? `${hours} h ` : ''}{String(mins).padStart(2, '0')} m
        </Text>

        {/* ── TASK ───────────────────────────── */}
        <Text style={s.question}>Working on?</Text>
        <View style={s.taskRow}>
          {TASK_TYPES.map((t) => {
            const on = task === t.type;
            return (
              <Pressable key={t.type} onPress={() => setTask(t.type as TaskType)} style={[s.taskPill, on && s.taskOn]}>
                <Text style={[v2Text.serial, { color: on ? v2Colors.paperBright : v2Colors.inkMuted, fontSize: 9 }]}>
                  {t.label.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {task === 'study' && (
          <TextInput
            value={subject}
            onChangeText={setSubject}
            placeholder="Subject?"
            placeholderTextColor={v2Colors.inkMuted}
            style={s.input}
            maxLength={60}
          />
        )}

        {/* ── SPACER + CTA ───────────────────── */}
        <View style={{ flex: 1, minHeight: 12 }} />
        <InkButton
          label={canStart ? 'Start' : 'Pick mood & task'}
          variant={canStart ? 'ink' : 'paper'}
          onPress={go}
          full
        />
      </View>
    </PaperLayer>
  );
}

/* ── Styles ────────────────────────────────────────────── */

const s = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: v2Space.lg,
  },

  // header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: {
    width: 44,
    height: 44,
    borderWidth: 1.5,
    borderColor: v2Colors.ink,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // question label
  question: {
    fontFamily: '"Fraunces", "Hoefler Text", Georgia, serif',
    fontSize: 17,
    color: v2Colors.ink,
    fontStyle: 'italic',
    marginTop: v2Space.lg,
    marginBottom: v2Space.sm,
  },

  // mood
  moodRow: { flexDirection: 'row', gap: 5 },
  moodBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    gap: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: v2Colors.paperShadow,
    backgroundColor: v2Colors.paperBright,
  },
  moodOn: {
    borderColor: v2Colors.ink,
    borderWidth: 1.5,
    backgroundColor: v2Colors.coralWash,
  },

  // wheels
  wheels: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: v2Space.lg,
    paddingVertical: v2Space.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: v2Colors.rule,
  },
  wCol: { flex: 1, alignItems: 'center' },
  wLabel: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 9,
    letterSpacing: 2,
    color: v2Colors.stamp,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  wDiv: {
    width: 1,
    height: 90,
    backgroundColor: v2Colors.rule,
    marginTop: 18,
  },

  // total
  total: {
    fontFamily: '"Fraunces", "Hoefler Text", Georgia, serif',
    fontSize: 28,
    color: v2Colors.ink,
    textAlign: 'center',
    marginTop: v2Space.sm,
    fontWeight: '400',
  },

  // task
  taskRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  taskPill: {
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: v2Colors.paperShadow,
    backgroundColor: v2Colors.paperBright,
  },
  taskOn: {
    backgroundColor: v2Colors.ink,
    borderColor: v2Colors.ink,
  },

  // input
  input: {
    marginTop: v2Space.sm,
    borderWidth: 1.5,
    borderColor: v2Colors.ink,
    borderRadius: 4,
    paddingHorizontal: v2Space.md,
    paddingVertical: v2Space.sm,
    fontFamily: '"Fraunces", "Hoefler Text", Georgia, serif',
    fontSize: 16,
    fontStyle: 'italic',
    color: v2Colors.ink,
    backgroundColor: v2Colors.paperBright,
  },
});

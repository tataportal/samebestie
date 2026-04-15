import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { PixelButton, WheelPicker, BottomSheet } from '../src/components';
import { useFocusStore } from '../src/store/useFocusStore';
import { usePetStore } from '../src/store/usePetStore';
import { getRecommendedMode } from '../src/utils/moodEngine';
import {
  MOOD_LEVELS,
  TASK_TYPES,
  FOCUS_MODES,
  MoodLevel,
  TaskType,
} from '../src/types';
import { formatMinutes } from '../src/utils/formatTime';
import { colors, fonts, spacing, padding, textStyles } from '../src/theme';

const FOCUS_ITEMS  = ['5m','10m','15m','20m','25m','30m','35m','40m','45m','50m','55m','60m','75m','90m'];
const FOCUS_VALUES = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 75, 90];
const REST_ITEMS   = ['1m','2m','3m','5m','7m','10m','15m','20m'];
const REST_VALUES  = [1, 2, 3, 5, 7, 10, 15, 20];
const ROUNDS_ITEMS = ['1','2','3','4','5','6','7','8','9','10'];

const MOOD_EMOJIS: Record<string, string> = {
  fried:   '😵',
  low:     '😔',
  neutral: '😐',
  good:    '🙂',
  sharp:   '⚡',
};

const PRESETS = {
  'tiny-start': { focusIdx: FOCUS_VALUES.indexOf(5),  restIdx: REST_VALUES.indexOf(1),  roundsIdx: 2 },
  'gentle':     { focusIdx: FOCUS_VALUES.indexOf(15), restIdx: REST_VALUES.indexOf(3),  roundsIdx: 2 },
  'classic':    { focusIdx: FOCUS_VALUES.indexOf(25), restIdx: REST_VALUES.indexOf(5),  roundsIdx: 3 },
  'hyper':      { focusIdx: FOCUS_VALUES.indexOf(50), restIdx: REST_VALUES.indexOf(10), roundsIdx: 1 },
};

export default function CheckInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setCheckIn = useFocusStore((s) => s.setCheckIn);
  const startSession = useFocusStore((s) => s.startSession);
  const personality = usePetStore((s) => s.personality);

  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [studySubject, setStudySubject] = useState('');
  const [taskSheetOpen, setTaskSheetOpen] = useState(false);

  const [focusIdx,  setFocusIdx]  = useState(FOCUS_VALUES.indexOf(25));
  const [restIdx,   setRestIdx]   = useState(REST_VALUES.indexOf(5));
  const [roundsIdx, setRoundsIdx] = useState(3);

  const focusMinutes = FOCUS_VALUES[focusIdx];
  const restMinutes  = REST_VALUES[restIdx];
  const rounds       = roundsIdx + 1;
  const totalMinutes = rounds * focusMinutes + (rounds - 1) * restMinutes;

  const applyPreset = useCallback((key: keyof typeof PRESETS) => {
    const p = PRESETS[key];
    setFocusIdx(p.focusIdx);
    setRestIdx(p.restIdx);
    setRoundsIdx(p.roundsIdx);
  }, []);

  const handleMoodSelect = (mood: MoodLevel) => {
    setSelectedMood(mood);
    const rec = getRecommendedMode(personality, mood) as keyof typeof PRESETS;
    if (PRESETS[rec]) applyPreset(rec);
  };

  const selectedTaskConfig = TASK_TYPES.find((t) => t.type === selectedTask);
  const canStart = selectedMood !== null && selectedTask !== null;

  const handleStart = () => {
    if (!canStart) return;
    const mode = focusMinutes <= 5 ? 'tiny-start'
      : focusMinutes <= 15 ? 'gentle'
      : focusMinutes <= 30 ? 'classic' : 'hyper';
    setCheckIn(selectedMood!, [], selectedTask!, selectedTask === 'study' ? studySubject.trim() || undefined : undefined);
    startSession(mode, focusMinutes * 60, restMinutes * 60, rounds);
    router.replace('/session');
  };

  return (
    <LinearGradient
      colors={['#1e0a35', colors.background, '#071a1c']}
      locations={[0, 0.5, 1]}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>CHECK-IN</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* 1 — Mood */}
      <View style={styles.section}>
        <View style={styles.sectionLabel}>
          <View style={[styles.sectionBar, { backgroundColor: colors.tertiary }]} />
          <Text style={styles.label}>HOW ARE YOU FEELING?</Text>
        </View>
        <View style={styles.moodRow}>
          {MOOD_LEVELS.map((mood) => {
            const active = selectedMood === mood.level;
            const emoji = MOOD_EMOJIS[mood.level] ?? '😐';
            return (
              <Pressable
                key={mood.level}
                onPress={() => handleMoodSelect(mood.level)}
                style={[styles.moodBtn, active && styles.moodBtnActive]}
              >
                <Text style={styles.moodEmoji}>{emoji}</Text>
                <Text style={[styles.moodText, { color: active ? colors.onPrimary : colors.onSurfaceVariant }]}>
                  {mood.label.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 2 — Timer */}
      <View style={styles.section}>
        <View style={styles.sectionLabel}>
          <View style={[styles.sectionBar, { backgroundColor: colors.secondary }]} />
          <Text style={styles.label}>SET YOUR TIMER</Text>
        </View>

        {/* Preset chips */}
        <View style={styles.presetRow}>
          {FOCUS_MODES.map((mode) => (
            <Pressable
              key={mode.mode}
              onPress={() => applyPreset(mode.mode as keyof typeof PRESETS)}
              style={styles.presetChip}
            >
              <MaterialIcons name={mode.icon as keyof typeof MaterialIcons.glyphMap} size={12} color={colors.primary} />
              <Text style={styles.presetText}>{mode.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Wheels */}
        <View style={styles.wheelContainer}>
          <View style={styles.wheelCol}>
            <Text style={styles.wheelLabel}>ROUNDS</Text>
            <WheelPicker items={ROUNDS_ITEMS} selectedIndex={roundsIdx} onChange={setRoundsIdx} width={70} accentColor={colors.tertiary} />
          </View>
          <View style={styles.wheelDivider} />
          <View style={styles.wheelCol}>
            <Text style={styles.wheelLabel}>FOCUS</Text>
            <WheelPicker items={FOCUS_ITEMS} selectedIndex={focusIdx} onChange={setFocusIdx} width={84} accentColor={colors.secondary} />
          </View>
          <View style={styles.wheelDivider} />
          <View style={styles.wheelCol}>
            <Text style={styles.wheelLabel}>REST</Text>
            <WheelPicker items={REST_ITEMS} selectedIndex={restIdx} onChange={setRestIdx} width={70} accentColor={colors.primary} />
          </View>
        </View>

        <Text style={styles.totalTime}>
          {rounds} × {focusMinutes}m + {rounds - 1} × {restMinutes}m break ={' '}
          <Text style={{ color: colors.onSurface, fontFamily: fonts.heading }}>{formatMinutes(totalMinutes)}</Text>
        </Text>
      </View>

      {/* 3 — Task */}
      <View style={styles.section}>
        <View style={styles.sectionLabel}>
          <View style={[styles.sectionBar, { backgroundColor: colors.primary }]} />
          <Text style={styles.label}>WORKING ON</Text>
        </View>
        <Pressable onPress={() => setTaskSheetOpen(true)} style={styles.taskPicker}>
          {selectedTaskConfig ? (
            <>
              <MaterialIcons name={selectedTaskConfig.icon as keyof typeof MaterialIcons.glyphMap} size={20} color={colors.secondary} />
              <Text style={[styles.taskPickerText, { color: colors.onSurface }]}>{selectedTaskConfig.label}</Text>
            </>
          ) : (
            <>
              <MaterialIcons name="category" size={20} color={colors.onSurfaceVariant} />
              <Text style={styles.taskPickerText}>Select task type…</Text>
            </>
          )}
          <MaterialIcons name="expand-more" size={20} color={colors.onSurfaceVariant} />
        </Pressable>
        {selectedTask === 'study' && (
          <TextInput
            style={styles.subjectInput}
            value={studySubject}
            onChangeText={setStudySubject}
            placeholder="What subject are you studying?"
            placeholderTextColor={colors.onSurfaceVariant}
            maxLength={60}
            returnKeyType="done"
          />
        )}
      </View>

      {/* CTA */}
      <View>
        <PixelButton label="LET'S GO" onPress={handleStart} icon="play-arrow" variant="secondary" disabled={!canStart} />
      </View>

      {/* Task bottom sheet */}
      <BottomSheet visible={taskSheetOpen} onClose={() => setTaskSheetOpen(false)} title="WHAT ARE YOU WORKING ON?">
        <View style={styles.taskList}>
          {TASK_TYPES.map((task) => {
            const active = selectedTask === task.type;
            return (
              <Pressable
                key={task.type}
                onPress={() => { setSelectedTask(task.type); setTaskSheetOpen(false); }}
                style={[styles.taskRow, active && styles.taskRowActive]}
              >
                <MaterialIcons name={task.icon as keyof typeof MaterialIcons.glyphMap} size={20} color={active ? colors.secondary : colors.onSurfaceVariant} />
                <Text style={[styles.taskLabel, { color: active ? colors.onSurface : colors.onSurfaceVariant }]}>{task.label}</Text>
                {active && <MaterialIcons name="check" size={18} color={colors.secondary} />}
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: padding.screen,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    ...textStyles.labelSmall,
    color: colors.onSurface,
    letterSpacing: 3,
  },

  section: {},
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionBar: {
    width: 3,
    height: 14,
    borderRadius: 2,
  },
  label: {
    ...textStyles.labelTiny,
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
  },

  // Mood
  moodRow: { flexDirection: 'row', gap: spacing.xs },
  moodBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  moodBtnActive: {
    backgroundColor: colors.primary,
    borderColor: 'rgba(183,159,255,0.6)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 10,
    elevation: 6,
  },
  moodEmoji: {
    fontSize: 22,
  },
  moodText: {
    ...textStyles.labelTiny,
    fontSize: 9,
  },

  // Presets
  presetRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.sm },
  presetChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: spacing.xs + 2,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(183,159,255,0.15)',
  },
  presetText: { ...textStyles.labelTiny, color: colors.onSurface, fontSize: 10 },

  // Wheels
  wheelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainer,
    borderRadius: 16,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(183,159,255,0.12)',
  },
  wheelCol: { alignItems: 'center', flex: 1 },
  wheelLabel: {
    ...textStyles.labelTiny,
    color: colors.onSurfaceVariant,
    letterSpacing: 1.5,
    marginBottom: 2,
    fontSize: 9,
  },
  wheelDivider: {
    width: 1,
    height: 80,
    backgroundColor: colors.outlineVariant,
    marginHorizontal: spacing.xs,
  },
  totalTime: {
    ...textStyles.bodySmall,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  subjectInput: {
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceContainer,
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: 15,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.secondary,
  },

  // Task picker
  taskPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 14,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  taskPickerText: {
    ...textStyles.bodyMedium,
    color: colors.onSurfaceVariant,
    flex: 1,
  },

  // Task list inside sheet
  taskList: { gap: spacing.sm, paddingBottom: spacing.sm },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 12,
  },
  taskRowActive: { borderLeftWidth: 3, borderLeftColor: colors.secondary },
  taskLabel: { ...textStyles.bodyMedium, flex: 1 },
});

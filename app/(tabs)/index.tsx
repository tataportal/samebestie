import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import {
  TopBar,
  PenguinSprite,
  DialogueBubble,
  ModeChip,
  PixelButton,
  XPBar,
} from '../../src/components';
import { useUserStore } from '../../src/store/useUserStore';
import { usePetStore } from '../../src/store/usePetStore';
import { useFocusStore } from '../../src/store/useFocusStore';
import { getBestieQuote } from '../../src/utils/moodEngine';
import { formatXP } from '../../src/utils/formatTime';
import { getLevelFromXP, getRankFromLevel, getXPProgress } from '../../src/utils/levelSystem';
import { FOCUS_MODES, FocusMode } from '../../src/types';
import { colors, spacing, padding, heights, textStyles } from '../../src/theme';

export default function FocusHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const totalXP = useUserStore((s) => s.totalXP);
  const currentStreak = useUserStore((s) => s.currentStreak);
  const level = getLevelFromXP(totalXP);
  const rank = getRankFromLevel(level);
  const xpProgress = getXPProgress(totalXP);
  const personality = usePetStore((s) => s.personality);
  const petMood = usePetStore((s) => s.mood);
  const petAnimal = usePetStore((s) => s.petAnimal);
  const startSession = useFocusStore((s) => s.startSession);

  const [selectedMode, setSelectedMode] = useState<FocusMode>('classic');
  const quote = getBestieQuote(personality, 'home');
  const selectedModeConfig = FOCUS_MODES.find((m) => m.mode === selectedMode)!;

  const handleQuickStart = useCallback(() => {
    startSession(
      selectedMode,
      selectedModeConfig.focusMinutes * 60,
      selectedModeConfig.breakMinutes * 60,
      selectedModeConfig.rounds,
    );
    router.replace('/session');
  }, [selectedMode, selectedModeConfig, startSession, router]);

  const handleCheckIn = useCallback(() => {
    router.push('/check-in');
  }, [router]);

  return (
    <LinearGradient
      colors={['#1e0a35', colors.background, '#071a1c']}
      locations={[0, 0.5, 1]}
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom + heights.bottomNav },
      ]}
    >
      {/* Top Bar */}
      <TopBar
        rightContent={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Pressable onPress={() => router.push('/v2')} style={styles.v2Link}>
              <Text style={styles.v2LinkText}>TRY V2 ✦</Text>
            </Pressable>
            <View style={styles.levelBadge}>
              <MaterialIcons name="local-fire-department" size={13} color={colors.tertiary} />
              <Text style={styles.levelBadgeText}>LVL {level}</Text>
            </View>
          </View>
        }
      />

      {/* Pet Hero — the star of the show */}
      <View style={styles.petHero}>
        <PenguinSprite size={130} mood={petMood} animal={petAnimal} />
        <View style={styles.bubbleWrap}>
          <DialogueBubble text={quote} position="top" />
        </View>
      </View>

      {/* Stats Strip */}
      <View style={styles.statsStrip}>
        <View style={styles.statItem}>
          <MaterialIcons name="local-fire-department" size={13} color={colors.tertiary} />
          <Text style={[styles.statValue, { color: colors.tertiary }]}>{currentStreak}</Text>
          <Text style={styles.statUnit}>DAY</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{formatXP(totalXP)}</Text>
          <Text style={styles.statUnit}>XP</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.secondary }]}>{rank.split(' ')[0]}</Text>
          <Text style={styles.statUnit}>RANK</Text>
        </View>
      </View>

      {/* XP Progress */}
      <View style={styles.xpRow}>
        <Text style={styles.xpLabel}>LVL {xpProgress.level}</Text>
        <View style={styles.xpBarWrap}>
          <XPBar filled={Math.round(xpProgress.ratio * 10)} total={10} color="primary" height={6} />
        </View>
        <Text style={styles.xpLabel}>{xpProgress.current}/{xpProgress.max}</Text>
      </View>

      {/* Focus Mode Picker */}
      <View style={styles.modeSection}>
        <Text style={styles.modeTitle}>FOCUS MODE</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.modeChipsRow}
        >
          {FOCUS_MODES.map((fm) => (
            <ModeChip
              key={fm.mode}
              label={fm.label}
              icon={fm.icon}
              isActive={selectedMode === fm.mode}
              onPress={() => setSelectedMode(fm.mode)}
            />
          ))}
        </ScrollView>
        <View style={styles.modeDesc}>
          <Text style={styles.modeDescMeta}>
            {selectedModeConfig.focusMinutes}m · {selectedModeConfig.breakMinutes}m break · {selectedModeConfig.rounds} rounds
          </Text>
          <Text style={styles.modeDescText}>{selectedModeConfig.description}</Text>
        </View>
      </View>

      {/* CTA Buttons */}
      <View style={styles.ctaRow}>
        <View style={styles.ctaBtn}>
          <PixelButton label="CUSTOM" onPress={handleCheckIn} icon="tune" variant="primary" />
        </View>
        <View style={styles.ctaBtn}>
          <PixelButton label="QUICK START" onPress={handleQuickStart} icon="play-arrow" variant="secondary" />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: padding.screen,
  },

  // Level badge in top bar
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,135,150,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,135,150,0.3)',
  },
  levelBadgeText: {
    ...textStyles.labelSmall,
    color: colors.tertiary,
  },
  v2Link: {
    backgroundColor: '#F2EADB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#14203A',
  },
  v2LinkText: {
    ...textStyles.labelSmall,
    color: '#14203A',
    fontSize: 10,
    letterSpacing: 1.5,
  },

  // Pet hero section
  petHero: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  bubbleWrap: {
    marginTop: spacing.md,
    alignSelf: 'center',
    maxWidth: 280,
  },

  // Stats strip
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 20,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(183,159,255,0.15)',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 4,
  },
  statValue: {
    ...textStyles.statMedium,
    fontSize: 18,
  },
  statUnit: {
    ...textStyles.labelTiny,
    color: colors.onSurfaceVariant,
  },
  statDivider: {
    width: 1,
    height: 22,
    backgroundColor: colors.outlineVariant,
  },

  // XP bar row
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  xpLabel: {
    ...textStyles.labelTiny,
    color: colors.onSurfaceVariant,
  },
  xpBarWrap: {
    flex: 1,
  },

  // Mode section
  modeSection: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  modeTitle: {
    ...textStyles.sectionTitle,
    color: colors.onSurface,
  },
  modeChipsRow: {
    gap: spacing.sm,
    paddingVertical: 2,
  },
  modeDesc: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  modeDescMeta: {
    ...textStyles.labelTiny,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  modeDescText: {
    ...textStyles.bodySmall,
    color: colors.onSurfaceVariant,
  },

  // CTA
  ctaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  ctaBtn: {
    flex: 1,
  },
});

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import {
  TopBar,
  BarChart,
  CompletionRate,
  BestieAdviceCard,
  RetroCard,
} from '../../src/components';
import { useUserStore } from '../../src/store/useUserStore';
import { useHistoryStore } from '../../src/store/useHistoryStore';
import { usePetStore } from '../../src/store/usePetStore';
import { getLevelFromXP } from '../../src/utils/levelSystem';
import { colors, spacing, padding, heights, textStyles } from '../../src/theme';

const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

function computeWeeklyXP(sessions: import('../../src/types').FocusSession[]): number[] {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayStr = date.toISOString().split('T')[0];
    return sessions
      .filter((s) => s.startedAt.startsWith(dayStr))
      .reduce((sum, s) => sum + s.xpEarned, 0);
  });
}

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const totalXP = useUserStore((s) => s.totalXP);
  const level = getLevelFromXP(totalXP);
  const sessions = useHistoryStore((s) => s.sessions);
  const weeklyXP = computeWeeklyXP(sessions);
  const tinyStartRate = useHistoryStore((s) => s.getCompletionRate('tiny-start'));
  const deepWorkRate = useHistoryStore((s) => s.getCompletionRate('hyper'));
  const personality = usePetStore((s) => s.personality);
  const petName = usePetStore((s) => s.petName);

  const maxXPIndex = weeklyXP.reduce(
    (maxIdx, val, idx, arr) => (val > arr[maxIdx] ? idx : maxIdx),
    0
  );

  const getTinyStartStatus = () => {
    if (tinyStartRate >= 80) return { status: 'ON FIRE', statusColor: colors.secondary };
    if (tinyStartRate >= 50) return { status: 'STEADY', statusColor: colors.primary };
    return { status: 'NEEDS WORK', statusColor: colors.tertiary };
  };

  const getDeepWorkStatus = () => {
    if (deepWorkRate >= 80) return { status: 'ELITE', statusColor: colors.secondary };
    if (deepWorkRate >= 50) return { status: 'GROWING', statusColor: colors.primary };
    return { status: 'BUILDING', statusColor: colors.tertiary };
  };

  const tinyStatus = getTinyStartStatus();
  const deepStatus = getDeepWorkStatus();

  return (
    <LinearGradient
      colors={['#0a0a1f', colors.background, '#071a1c']}
      locations={[0, 0.4, 1]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <TopBar
        rightContent={
          <View style={styles.levelBadge}>
            <MaterialIcons name="bar-chart" size={14} color={colors.primary} />
            <Text style={styles.levelText}>LVL {level}</Text>
          </View>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + heights.bottomNav + spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>
          RECORDS &{'\n'}STATS
        </Text>

        {/* Weekly Trend */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WEEKLY TREND</Text>
          <View style={styles.chartContainer}>
            <BarChart
              data={weeklyXP}
              labels={DAY_LABELS}
              highlightIndex={maxXPIndex}
              accentColor={colors.primary}
            />
          </View>
        </View>

        {/* Completion Rates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>COMPLETION RATES</Text>
          <View style={styles.completionGrid}>
            <View style={styles.completionItem}>
              <CompletionRate
                label="TINY START"
                percentage={tinyStartRate}
                status={tinyStatus.status}
                statusColor={tinyStatus.statusColor}
                description="Short sprint sessions. Great for building momentum."
                icon="flash-on"
              />
            </View>
            <View style={styles.completionItem}>
              <CompletionRate
                label="DEEP WORK"
                percentage={deepWorkRate}
                status={deepStatus.status}
                statusColor={deepStatus.statusColor}
                description="Extended focus blocks. Where real progress happens."
                icon="psychology"
              />
            </View>
          </View>
        </View>

        {/* Bestie Insight */}
        <View style={styles.section}>
          <BestieAdviceCard
            title="PATTERN DETECTED"
            body={`${petName || 'Your bestie'} noticed you focus best in the morning. Try scheduling deep work sessions before noon for maximum XP gains.`}
          />
        </View>

        {/* Focus Inventory */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FOCUS INVENTORY</Text>
          <View style={styles.inventoryGrid}>
            <RetroCard variant="high" accentColor={colors.secondary}>
              <View style={styles.inventoryItem}>
                <MaterialIcons name="local-cafe" size={28} color={colors.secondary} />
                <Text style={[textStyles.cardTitle, styles.inventoryTitle]}>
                  CAFFEINE PEAK
                </Text>
                <Text style={[textStyles.bodySmall, styles.inventoryDesc]}>
                  Your best sessions happen between 9–11 AM. Coincidence?
                </Text>
              </View>
            </RetroCard>
            <RetroCard variant="high" accentColor={colors.tertiary}>
              <View style={styles.inventoryItem}>
                <MaterialIcons name="bedtime" size={28} color={colors.tertiary} />
                <Text style={[textStyles.cardTitle, styles.inventoryTitle]}>
                  3PM CRASH
                </Text>
                <Text style={[textStyles.bodySmall, styles.inventoryDesc]}>
                  Post-lunch focus drops 40%. Try a Tiny Start to push through.
                </Text>
              </View>
            </RetroCard>
          </View>
        </View>
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
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(183,159,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(183,159,255,0.3)',
  },
  levelText: {
    ...textStyles.labelSmall,
    color: colors.primary,
  },
  pageTitle: {
    ...textStyles.pageTitle,
    color: colors.onSurface,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    textShadowColor: 'rgba(183,159,255,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...textStyles.sectionTitle,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  chartContainer: {
    backgroundColor: colors.surfaceContainerHigh,
    padding: padding.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(183,159,255,0.1)',
  },
  completionGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  completionItem: {
    flex: 1,
  },
  inventoryGrid: {
    gap: spacing.md,
  },
  inventoryItem: {
    alignItems: 'flex-start',
  },
  inventoryTitle: {
    color: colors.onSurface,
    marginTop: spacing.sm,
  },
  inventoryDesc: {
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
});

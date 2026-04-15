import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  TopBar,
  PenguinSprite,
  ToggleSwitch,
  RetroCard,
} from '../../src/components';
import { useUserStore } from '../../src/store/useUserStore';
import { usePetStore } from '../../src/store/usePetStore';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import { getLevelFromXP, getRankFromLevel } from '../../src/utils/levelSystem';
import { colors, spacing, padding, heights, textStyles } from '../../src/theme';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const totalXP = useUserStore((s) => s.totalXP);
  const level = getLevelFromXP(totalXP);
  const rank = getRankFromLevel(level);
  const petName = usePetStore((s) => s.petName);
  const personality = usePetStore((s) => s.personality);
  const petMood = usePetStore((s) => s.mood);
  const petAnimal = usePetStore((s) => s.petAnimal);

  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const usageMonitoringEnabled = useSettingsStore((s) => s.usageMonitoringEnabled);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const hapticEnabled = useSettingsStore((s) => s.hapticEnabled);
  const toggleNotifications = useSettingsStore((s) => s.toggleNotifications);
  const toggleUsageMonitoring = useSettingsStore((s) => s.toggleUsageMonitoring);
  const toggleSound = useSettingsStore((s) => s.toggleSound);
  const toggleHaptic = useSettingsStore((s) => s.toggleHaptic);

  return (
    <LinearGradient
      colors={['#0d0a2e', colors.background, '#071a14']}
      locations={[0, 0.4, 1]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <TopBar />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + heights.bottomNav + spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>GEAR</Text>

        {/* Profile Card */}
        <RetroCard variant="high" accentColor={colors.primary} style={styles.profileCard}>
          <View style={styles.profileRow}>
            {/* Live pet avatar */}
            <PenguinSprite size={64} mood={petMood} animal={petAnimal} />
            <View style={styles.profileInfo}>
              <Text style={[textStyles.cardTitle, { color: colors.onSurface }]}>
                {petName || 'BESTIE'}
              </Text>
              <Text style={[textStyles.bodySmall, { color: colors.primary }]}>
                {personality.charAt(0).toUpperCase() + personality.slice(1)} · Active
              </Text>
            </View>
          </View>
          <View style={styles.profileStats}>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatLabel}>LEVEL</Text>
              <Text style={[textStyles.statMedium, { color: colors.primary }]}>{level}</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatLabel}>RANK</Text>
              <Text style={[textStyles.statMedium, { color: colors.secondary }]}>{rank.split(' ')[0]}</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatLabel}>TOTAL XP</Text>
              <Text style={[textStyles.statMedium, { color: colors.tertiary }]}>{totalXP}</Text>
            </View>
          </View>
        </RetroCard>

        {/* Settings Toggles */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>
          <View style={styles.settingsCard}>
            <ToggleSwitch
              value={notificationsEnabled}
              onToggle={toggleNotifications}
              label="Notifications"
              sublabel="Session reminders and bestie nudges"
              icon="notifications"
            />
            <View style={styles.divider} />
            <ToggleSwitch
              value={usageMonitoringEnabled}
              onToggle={toggleUsageMonitoring}
              label="Usage Monitoring"
              sublabel="Track screen time for smarter focus tips"
              icon="visibility"
            />
            <View style={styles.divider} />
            <ToggleSwitch
              value={soundEnabled}
              onToggle={toggleSound}
              label="Sound Effects"
              sublabel="Timer ticks, completion chimes, bestie SFX"
              icon="volume-up"
            />
            <View style={styles.divider} />
            <ToggleSwitch
              value={hapticEnabled}
              onToggle={toggleHaptic}
              label="Haptic Feedback"
              sublabel="Vibration on button presses and alerts"
              icon="vibration"
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          <RetroCard variant="default" accentColor={colors.secondary}>
            <View style={styles.aboutRow}>
              <Text style={[textStyles.bodyLarge, { color: colors.onSurface }]}>App Version</Text>
              <Text style={[textStyles.bodyMedium, { color: colors.onSurfaceVariant }]}>1.0.0</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.aboutRow}>
              <Text style={[textStyles.bodyLarge, { color: colors.onSurface }]}>Runtime</Text>
              <Text style={[textStyles.bodyMedium, { color: colors.onSurfaceVariant }]}>Expo SDK 54</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.aboutRow}>
              <Text style={[textStyles.bodyLarge, { color: colors.onSurface }]}>Made with</Text>
              <Text style={[textStyles.bodyMedium, { color: colors.tertiary }]}>Focus + Chaos ✦</Text>
            </View>
          </RetroCard>
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
  pageTitle: {
    ...textStyles.pageTitle,
    color: colors.onSurface,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },

  // Profile card
  profileCard: {
    marginBottom: spacing.xl,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  profileInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    padding: spacing.md,
    borderRadius: 12,
  },
  profileStat: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  profileStatLabel: {
    ...textStyles.labelTiny,
    color: colors.onSurfaceVariant,
    fontSize: 9,
    letterSpacing: 1,
  },
  profileStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.outlineVariant,
  },

  // Settings
  settingsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...textStyles.sectionTitle,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  settingsCard: {
    backgroundColor: colors.surfaceContainerHigh,
    padding: padding.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(183,159,255,0.1)',
  },
  divider: {
    height: 1,
    backgroundColor: colors.outlineVariant,
    marginVertical: spacing.sm,
    opacity: 0.5,
  },

  // About
  aboutSection: {
    marginBottom: spacing.xl,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
});

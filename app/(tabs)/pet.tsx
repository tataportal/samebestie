import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import {
  TopBar,
  PenguinSprite,
  DialogueBubble,
  XPBar,
  RetroCard,
  PixelButton,
} from '../../src/components';
import { useUserStore } from '../../src/store/useUserStore';
import { usePetStore } from '../../src/store/usePetStore';
import { getBestieQuote } from '../../src/utils/moodEngine';
import { getBondXPMax } from '../../src/utils/levelSystem';
import { PERSONALITIES, BOND_TIER_NAMES, Personality } from '../../src/types';
import { colors, spacing, padding, heights, textStyles } from '../../src/theme';

// Accent color per personality
const PERSONALITY_COLORS: Record<Personality, string> = {
  soft:    colors.secondary,
  chaotic: colors.tertiary,
  strict:  colors.primary,
};

export default function PetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const currentStreak = useUserStore((s) => s.currentStreak);
  const petName = usePetStore((s) => s.petName);
  const personality = usePetStore((s) => s.personality);
  const mood = usePetStore((s) => s.mood);
  const bondTier = usePetStore((s) => s.bondTier);
  const bondXP = usePetStore((s) => s.bondXP);
  const level = usePetStore((s) => s.level);
  const petAnimal = usePetStore((s) => s.petAnimal);
  const setPersonality = usePetStore((s) => s.setPersonality);

  const bondMax = getBondXPMax(bondTier);
  const bondRatio = bondMax > 0 ? bondXP / bondMax : 0;
  const tierName = BOND_TIER_NAMES[bondTier];
  const quote = getBestieQuote(personality, 'idle');

  const inventoryPlaceholders = [
    { id: 'scarf',      name: 'PIXEL SCARF',   icon: 'ac-unit',        unlocked: level >= 2 },
    { id: 'glasses',    name: 'NERD GLASSES',  icon: 'visibility',     unlocked: level >= 3 },
    { id: 'crown',      name: 'FOCUS CROWN',   icon: 'emoji-events',   unlocked: level >= 5 },
    { id: 'headphones', name: 'LO-FI PHONES',  icon: 'headphones',     unlocked: level >= 7 },
    { id: 'cape',       name: 'STUDY CAPE',    icon: 'shield',         unlocked: level >= 10 },
    { id: 'aura',       name: 'GLOW AURA',     icon: 'auto-awesome',   unlocked: level >= 15 },
  ];

  return (
    <LinearGradient
      colors={['#0d0a2e', colors.background, '#071a1c']}
      locations={[0, 0.45, 1]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <TopBar
        rightContent={
          <View style={styles.streakBadge}>
            <MaterialIcons name="local-fire-department" size={13} color={colors.tertiary} />
            <Text style={styles.streakText}>{currentStreak}D</Text>
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
        {/* Pet Hero */}
        <View style={styles.heroSection}>
          <PenguinSprite size={180} mood={mood} animal={petAnimal} style={styles.sprite} />
          <Text style={styles.petNameTitle}>
            {petName || 'BESTIE'}
          </Text>
          <DialogueBubble text={quote} position="top" />

          {/* Bond Progress */}
          <View style={styles.bondProgress}>
            <View style={styles.bondHeader}>
              <View style={styles.bondTitleRow}>
                <Text style={styles.bondLabel}>BOND LVL {level}</Text>
                <View style={[styles.tierBadge, { backgroundColor: `${colors.secondary}25`, borderColor: `${colors.secondary}60` }]}>
                  <Text style={[styles.tierBadgeText, { color: colors.secondary }]}>{tierName.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.bondXPText}>{bondXP}/{bondMax} XP</Text>
            </View>
            <XPBar
              filled={Math.round(bondRatio * 10)}
              total={10}
              color="secondary"
              height={10}
            />
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <RetroCard variant="high" accentColor={colors.secondary} style={styles.statCard}>
            <Text style={styles.statLabel}>BOND TIER</Text>
            <Text style={[textStyles.statMedium, { color: colors.secondary }]}>
              {tierName}
            </Text>
          </RetroCard>
          <RetroCard variant="high" accentColor={colors.primary} style={styles.statCard}>
            <Text style={styles.statLabel}>PERSONALITY</Text>
            <Text style={[textStyles.statMedium, { color: colors.primary }]}>
              {personality.charAt(0).toUpperCase() + personality.slice(1)}
            </Text>
          </RetroCard>
        </View>

        {/* Personality Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PERSONALITY CHIP</Text>
          <View style={styles.personalityRow}>
            {PERSONALITIES.map((p) => {
              const isActive = personality === p.type;
              const accentColor = PERSONALITY_COLORS[p.type as Personality];
              return (
                <Pressable
                  key={p.type}
                  onPress={() => setPersonality(p.type)}
                  style={[
                    styles.personalityButton,
                    isActive && {
                      backgroundColor: accentColor + '25',
                      borderColor: accentColor + '80',
                      shadowColor: accentColor,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.5,
                      shadowRadius: 10,
                      elevation: 6,
                    },
                  ]}
                >
                  <MaterialIcons
                    name={p.icon as keyof typeof MaterialIcons.glyphMap}
                    size={24}
                    color={isActive ? accentColor : colors.onSurfaceVariant}
                  />
                  <Text
                    style={[
                      styles.personalityLabel,
                      { color: isActive ? accentColor : colors.onSurfaceVariant },
                    ]}
                  >
                    {p.label.toUpperCase()}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Inventory Unlocks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INVENTORY UNLOCKS</Text>
          <View style={styles.inventoryGrid}>
            {inventoryPlaceholders.map((item) => (
              <RetroCard
                key={item.id}
                variant={item.unlocked ? 'high' : 'lowest'}
                accentColor={item.unlocked ? colors.primary : undefined}
                style={styles.inventoryCard}
              >
                <MaterialIcons
                  name={item.icon as keyof typeof MaterialIcons.glyphMap}
                  size={30}
                  color={item.unlocked ? colors.primary : colors.outlineVariant}
                />
                <Text
                  style={[
                    styles.inventoryLabel,
                    { color: item.unlocked ? colors.onSurface : colors.outlineVariant },
                  ]}
                >
                  {item.name}
                </Text>
                {!item.unlocked && (
                  <MaterialIcons
                    name="lock"
                    size={13}
                    color={colors.outlineVariant}
                    style={{ marginTop: spacing.xs }}
                  />
                )}
              </RetroCard>
            ))}
          </View>
        </View>

        {/* CTA */}
        <PixelButton
          label="START FOCUS SESSION"
          onPress={() => router.navigate('/(tabs)')}
          icon="play-arrow"
        />
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
  streakBadge: {
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
  streakText: {
    ...textStyles.labelSmall,
    color: colors.tertiary,
  },

  // Hero
  heroSection: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  sprite: {
    marginBottom: spacing.md,
  },
  petNameTitle: {
    ...textStyles.pageTitle,
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: spacing.md,
    textShadowColor: 'rgba(183,159,255,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  bondProgress: {
    width: '100%',
    backgroundColor: colors.surfaceContainerHigh,
    padding: spacing.md,
    marginTop: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(104,252,191,0.2)',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  bondHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  bondTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bondLabel: {
    ...textStyles.labelSmall,
    color: colors.onSurfaceVariant,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  tierBadgeText: {
    ...textStyles.labelTiny,
    fontSize: 9,
    letterSpacing: 1,
  },
  bondXPText: {
    ...textStyles.labelSmall,
    color: colors.secondary,
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
  },
  statLabel: {
    ...textStyles.labelTiny,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
    letterSpacing: 1,
  },

  // Personality
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...textStyles.sectionTitle,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  personalityRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  personalityButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: spacing.xs,
  },
  personalityLabel: {
    ...textStyles.labelTiny,
    fontSize: 9,
    letterSpacing: 1,
  },

  // Inventory
  inventoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  inventoryCard: {
    width: '48%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  inventoryLabel: {
    ...textStyles.labelTiny,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});

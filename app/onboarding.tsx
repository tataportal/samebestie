import React, { useState } from 'react';
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
import {
  PixelButton,
  XPBar,
  PenguinSprite,
  ToggleSwitch,
  RetroCard,
} from '../src/components';
import { useUserStore } from '../src/store/useUserStore';
import { usePetStore } from '../src/store/usePetStore';
import { useSettingsStore } from '../src/store/useSettingsStore';
import { PERSONALITIES, Personality, PET_ANIMALS, PetAnimal } from '../src/types';
import { colors, fonts, spacing, padding, textStyles } from '../src/theme';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);
  const setPetName = usePetStore((s) => s.setPetName);
  const setPetAnimal = usePetStore((s) => s.setPetAnimal);
  const setPersonality = usePetStore((s) => s.setPersonality);
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const usageMonitoringEnabled = useSettingsStore((s) => s.usageMonitoringEnabled);
  const toggleNotifications = useSettingsStore((s) => s.toggleNotifications);
  const toggleUsageMonitoring = useSettingsStore((s) => s.toggleUsageMonitoring);

  const [step, setStep] = useState(1);
  const [petNameInput, setPetNameInput] = useState('');
  const [selectedAnimal, setSelectedAnimal] = useState<PetAnimal>('penguin');
  const [selectedPersonality, setSelectedPersonality] = useState<Personality>('soft');

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    const finalName = petNameInput.trim() || 'Bestie';
    setPetName(finalName);
    setPetAnimal(selectedAnimal);
    setPersonality(selectedPersonality);
    completeOnboarding();
    router.replace('/(tabs)');
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.heroSection}>
        <PenguinSprite size={160} mood="excited" style={styles.sprite} />
        <Text style={[textStyles.heroTitle, styles.heroTitle]}>
          MEET YOUR{'\n'}NEW FOCUS{'\n'}BESTIE.
        </Text>
        <Text style={[textStyles.bodyLarge, styles.heroSubtitle]}>
          A digital companion that helps you focus, tracks your progress, and
          roasts you when you open Twitter.
        </Text>
      </View>
      <View style={styles.ctaSection}>
        <PixelButton label="NEXT" onPress={handleNext} />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.contentSection}>
        <Text style={[textStyles.pageTitle, styles.sectionTitle]}>
          PICK YOUR PET
        </Text>
        <Text style={[textStyles.bodyLarge, styles.sectionBody]}>
          Choose your focus companion, then give it a name.
        </Text>

        {/* Animal selector */}
        <View style={styles.animalRow}>
          {PET_ANIMALS.map((a) => {
            const active = selectedAnimal === a.type;
            return (
              <Pressable
                key={a.type}
                onPress={() => setSelectedAnimal(a.type)}
                style={[styles.animalBtn, active && styles.animalBtnActive]}
              >
                <Text style={styles.animalEmoji}>{a.emoji}</Text>
                <Text style={[styles.animalLabel, { color: active ? colors.primary : colors.onSurfaceVariant }]}>
                  {a.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Preview + name input */}
        <PenguinSprite
          size={100}
          mood="happy"
          animal={selectedAnimal}
          style={styles.spriteSmall}
        />
        <TextInput
          style={styles.textInput}
          value={petNameInput}
          onChangeText={setPetNameInput}
          placeholder="Name your pet…"
          placeholderTextColor={colors.onSurfaceVariant}
          autoFocus
          maxLength={20}
        />
        <Text style={[textStyles.bodySmall, styles.hint]}>
          You can change this anytime in settings.
        </Text>
      </View>
      <View style={styles.ctaSection}>
        <PixelButton
          label="NEXT"
          onPress={handleNext}
          disabled={petNameInput.trim().length === 0}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.contentSection}>
        <Text style={[textStyles.pageTitle, styles.sectionTitle]}>
          CHOOSE PERSONALITY
        </Text>
        <Text style={[textStyles.bodyLarge, styles.sectionBody]}>
          How should your bestie talk to you during focus sessions?
        </Text>
        <View style={styles.personalityCards}>
          {PERSONALITIES.map((p) => {
            const isActive = selectedPersonality === p.type;
            return (
              <Pressable
                key={p.type}
                onPress={() => setSelectedPersonality(p.type)}
              >
                <RetroCard
                  variant={isActive ? 'high' : 'default'}
                  accentColor={isActive ? colors.primary : undefined}
                  style={[
                    styles.personalityCard,
                    isActive ? styles.personalityCardActive : undefined,
                  ]}
                >
                  <View style={styles.personalityHeader}>
                    <MaterialIcons
                      name={p.icon as keyof typeof MaterialIcons.glyphMap}
                      size={28}
                      color={isActive ? colors.primary : colors.onSurfaceVariant}
                    />
                    <Text
                      style={[
                        textStyles.cardTitle,
                        styles.personalityLabel,
                        { color: isActive ? colors.primary : colors.onSurface },
                      ]}
                    >
                      {p.label}
                    </Text>
                    {isActive && (
                      <MaterialIcons
                        name="check-circle"
                        size={20}
                        color={colors.secondary}
                        style={styles.checkIcon}
                      />
                    )}
                  </View>
                  <Text
                    style={[
                      textStyles.bodyMedium,
                      {
                        color: isActive
                          ? colors.onSurface
                          : colors.onSurfaceVariant,
                      },
                    ]}
                  >
                    {p.description}
                  </Text>
                </RetroCard>
              </Pressable>
            );
          })}
        </View>
      </View>
      <View style={styles.ctaSection}>
        <PixelButton label="NEXT" onPress={handleNext} />
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.contentSection}>
        <Text style={[textStyles.pageTitle, styles.sectionTitle]}>
          PERMISSIONS
        </Text>
        <Text style={[textStyles.bodyLarge, styles.sectionBody]}>
          These help your bestie give better advice. You can change them
          anytime.
        </Text>
        <View style={styles.togglesContainer}>
          <ToggleSwitch
            value={notificationsEnabled}
            onToggle={toggleNotifications}
            label="Notifications"
            sublabel="Get nudges and session reminders"
            icon="notifications"
          />
          <View style={styles.toggleDivider} />
          <ToggleSwitch
            value={usageMonitoringEnabled}
            onToggle={toggleUsageMonitoring}
            label="Usage Monitoring"
            sublabel="Track screen time for smarter focus tips"
            icon="visibility"
          />
        </View>
        <View style={styles.summaryCard}>
          <RetroCard variant="high" accentColor={colors.secondary}>
            <View style={styles.summaryRow}>
              <PenguinSprite size={48} mood="proud" />
              <View style={styles.summaryText}>
                <Text style={[textStyles.cardTitle, { color: colors.onSurface }]}>
                  {petNameInput.trim() || 'Bestie'}
                </Text>
                <Text style={[textStyles.bodySmall, { color: colors.onSurfaceVariant }]}>
                  {PERSONALITIES.find((p) => p.type === selectedPersonality)?.label}{' '}
                  Personality
                </Text>
              </View>
            </View>
          </RetroCard>
        </View>
      </View>
      <View style={styles.ctaSection}>
        <PixelButton
          label="CONFIRM CHARACTER"
          onPress={handleComplete}
          variant="secondary"
        />
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  return (
    <LinearGradient
      colors={['#1e0a35', colors.background, '#071a1c']}
      locations={[0, 0.5, 1]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        {step > 1 && (
          <Pressable onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </Pressable>
        )}
        <View style={styles.progressBar}>
          <XPBar filled={step} total={4} color="primary" height={8} />
        </View>
        <Text style={[textStyles.labelSmall, styles.stepLabel]}>
          {step}/4
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderCurrentStep()}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: padding.screen,
    paddingVertical: spacing.md,
  },
  backButton: {
    marginRight: spacing.md,
    borderRadius: 12,
  },
  progressBar: {
    flex: 1,
  },
  stepLabel: {
    color: colors.onSurfaceVariant,
    marginLeft: spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: padding.screen,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 500,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  sprite: {
    marginBottom: spacing.xl,
  },
  spriteSmall: {
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  heroTitle: {
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: spacing.lg,
    textShadowColor: 'rgba(183,159,255,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
  },
  heroSubtitle: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  contentSection: {
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  sectionBody: {
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xl,
  },
  animalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  animalBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  animalBtnActive: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: 'rgba(183,159,255,0.12)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 10,
    elevation: 6,
  },
  animalEmoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  animalLabel: {
    ...textStyles.labelTiny,
  },
  textInput: {
    backgroundColor: colors.surfaceContainer,
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: 16,
    paddingHorizontal: padding.input,
    paddingVertical: spacing.md,
    borderWidth: 2,
    borderColor: colors.outlineVariant,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  hint: {
    color: colors.onSurfaceVariant,
  },
  personalityCards: {
    gap: spacing.md,
  },
  personalityCard: {
    marginBottom: 0,
  },
  personalityCardActive: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  personalityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  personalityLabel: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  checkIcon: {
    marginLeft: spacing.sm,
  },
  togglesContainer: {
    backgroundColor: colors.surfaceContainer,
    padding: padding.card,
    marginBottom: spacing.lg,
    borderRadius: 12,
  },
  toggleDivider: {
    height: 1,
    backgroundColor: colors.outlineVariant,
    marginVertical: spacing.sm,
  },
  summaryCard: {
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  ctaSection: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
});

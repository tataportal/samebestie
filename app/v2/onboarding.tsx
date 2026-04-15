import React, { useState } from 'react';
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
import { PetGlyph } from '../../src/components/v2/PetGlyph';
import { useUserStore } from '../../src/store/useUserStore';
import { usePetStore } from '../../src/store/usePetStore';
import {
  PERSONALITIES,
  PET_ANIMALS,
  Personality,
  PetAnimal,
} from '../../src/types';
import { v2Colors, v2Text, v2Space } from '../../src/theme/v2';
import { V2WebFonts } from '../../src/components/v2/WebFonts';

const STEPS = [
  { n: 'I',   title: 'An introduction',  sub: 'Admission to the library' },
  { n: 'II',  title: 'Your companion',   sub: 'A small creature, chosen' },
  { n: 'III', title: 'Their temperament', sub: 'How they shall keep you' },
  { n: 'IV',  title: 'Ready',            sub: 'Signed, stamped, begun' },
];

const PERSONALITY_ACCENT: Record<Personality, string> = {
  soft: v2Colors.moss,
  chaotic: v2Colors.coral,
  strict: v2Colors.sky,
};

export default function V2Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const completeOnboarding = useUserStore((s) => s.completeOnboarding);
  const setPetName = usePetStore((s) => s.setPetName);
  const setPetAnimal = usePetStore((s) => s.setPetAnimal);
  const setPersonality = usePetStore((s) => s.setPersonality);

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [animal, setAnimal] = useState<PetAnimal>('penguin');
  const [personality, setP] = useState<Personality>('soft');

  const next = () => setStep((s) => Math.min(3, s + 1));
  const prev = () => setStep((s) => Math.max(0, s - 1));
  const finish = () => {
    setPetName(name.trim() || 'Bestie');
    setPetAnimal(animal);
    setPersonality(personality);
    completeOnboarding();
    router.replace('/v2');
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
        {/* ── MASTHEAD + STEP PROGRESS ──────────── */}
        <View style={styles.masthead}>
          <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>
            ADMISSION FORM · N°{STEPS[step].n}
          </Text>
          <Pressable onPress={() => router.push('/')} style={styles.skip}>
            <Text style={[v2Text.serial, { color: v2Colors.inkMuted }]}>
              skip · V1 →
            </Text>
          </Pressable>
        </View>
        <RuledDivider variant="double" color={v2Colors.ink} style={{ marginTop: 8 }} />

        {/* Step indicator */}
        <View style={styles.stepRow}>
          {STEPS.map((s, i) => {
            const filled = i <= step;
            return (
              <View key={i} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepDot,
                    {
                      backgroundColor: filled ? v2Colors.ink : v2Colors.paperDeep,
                      borderColor: v2Colors.ink,
                    },
                  ]}
                >
                  <Text
                    style={[
                      v2Text.serial,
                      {
                        color: filled ? v2Colors.paperBright : v2Colors.inkMuted,
                        fontSize: 8,
                      },
                    ]}
                  >
                    {s.n}
                  </Text>
                </View>
                {i < STEPS.length - 1 && (
                  <View
                    style={[
                      styles.stepBar,
                      {
                        backgroundColor:
                          i < step ? v2Colors.ink : v2Colors.rule,
                      },
                    ]}
                  />
                )}
              </View>
            );
          })}
        </View>

        {/* ── STEP TITLE ────────────────────────── */}
        <View style={styles.heroBlock}>
          <Text
            // @ts-ignore
            className={Platform.OS === 'web' ? 'v2-soft' : undefined}
            style={[v2Text.heroSerif, { color: v2Colors.ink }]}
          >
            {STEPS[step].title}
            <Text style={{ color: v2Colors.coral }}>.</Text>
          </Text>
          <Text
            style={[
              v2Text.sectionSerif,
              {
                color: v2Colors.inkSoft,
                fontStyle: 'italic',
                marginTop: 6,
              },
            ]}
          >
            {STEPS[step].sub}
          </Text>
        </View>

        {/* ── STEP CONTENT ──────────────────────── */}
        {step === 0 && (
          <View>
            <View style={styles.welcomeArt}>
              <PetGlyph animal="penguin" size={160} label="BESTIE" serial="001" />
              <Stamp
                label="WELCOME"
                sub="TO VOL. II"
                color={v2Colors.coral}
                rotate={-14}
                style={styles.welcomeStamp}
              />
            </View>
            <IndexCard
              tint={v2Colors.paperBright}
              accent={v2Colors.coral}
              serial="PREFACE"
              style={styles.prefaceCard}
            >
              <Text
                style={[
                  v2Text.quote,
                  { color: v2Colors.ink, fontSize: 18, lineHeight: 27 },
                ]}
              >
                <Text style={{ color: v2Colors.coral, fontSize: 36, lineHeight: 26 }}>“</Text>
                A private correspondence is about to begin between you, your
                attention, and the small creature who shall keep watch over
                it. Kindly proceed.
                <Text style={{ color: v2Colors.coral, fontSize: 36, lineHeight: 26 }}>”</Text>
              </Text>
              <Text
                style={[
                  v2Text.serial,
                  { color: v2Colors.stamp, marginTop: v2Space.md },
                ]}
              >
                — SIGNED, THE LIBRARY
              </Text>
            </IndexCard>
          </View>
        )}

        {step === 1 && (
          <View>
            <FieldLabel>Select a species</FieldLabel>
            <View style={styles.animalGrid}>
              {PET_ANIMALS.map((a) => {
                const active = animal === a.type;
                return (
                  <Pressable
                    key={a.type}
                    onPress={() => setAnimal(a.type)}
                    style={[
                      styles.animalCard,
                      {
                        borderColor: active ? v2Colors.ink : v2Colors.paperShadow,
                        backgroundColor: active
                          ? v2Colors.coralWash
                          : v2Colors.paperBright,
                      },
                      active && {
                        shadowColor: v2Colors.ink,
                        shadowOffset: { width: 3, height: 3 },
                        shadowOpacity: 1,
                        shadowRadius: 0,
                      },
                    ]}
                  >
                    <Text style={styles.animalEmoji}>{a.emoji}</Text>
                    <Text
                      style={[
                        v2Text.serial,
                        { color: v2Colors.stamp, marginTop: 4 },
                      ]}
                    >
                      {a.label.toUpperCase()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <FieldLabel style={{ marginTop: v2Space.lg }}>
              Assign a name
            </FieldLabel>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Bestie"
              placeholderTextColor={v2Colors.inkMuted}
              style={styles.nameInput}
              maxLength={24}
              returnKeyType="done"
            />
          </View>
        )}

        {step === 2 && (
          <View style={styles.persoGrid}>
            {PERSONALITIES.map((p) => {
              const active = personality === p.type;
              const accent = PERSONALITY_ACCENT[p.type as Personality];
              return (
                <Pressable
                  key={p.type}
                  onPress={() => setP(p.type)}
                  style={({ pressed }) => [
                    styles.persoCard,
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
                  <View style={[styles.persoAccent, { backgroundColor: accent }]} />
                  <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>
                    {p.label.toUpperCase()}
                  </Text>
                  <Text
                    style={[
                      v2Text.sectionSerif,
                      {
                        color: v2Colors.ink,
                        fontStyle: 'italic',
                        marginTop: 4,
                      },
                    ]}
                  >
                    {p.type}
                  </Text>
                  <Text
                    style={[
                      v2Text.bodySmall,
                      { color: v2Colors.inkSoft, marginTop: 8 },
                    ]}
                  >
                    {p.description}
                  </Text>
                  {active && (
                    <Text
                      style={[
                        v2Text.serial,
                        {
                          color: accent,
                          marginTop: 12,
                          fontWeight: '700',
                          letterSpacing: 2.5,
                        },
                      ]}
                    >
                      ✓ SELECTED
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

        {step === 3 && (
          <IndexCard
            style={styles.signCard}
            tint={v2Colors.paperBright}
            accent={v2Colors.coral}
            serial="RECEIPT"
          >
            <View style={styles.signRow}>
              <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>
                ON RECORD FOR
              </Text>
              <Text style={[v2Text.cardSerif, { color: v2Colors.ink, fontStyle: 'italic' }]}>
                {name.trim() || 'Bestie'}
              </Text>
            </View>
            <RuledDivider variant="dotted" style={{ marginVertical: 8 }} />
            <View style={styles.signRow}>
              <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>
                SPECIES
              </Text>
              <Text style={[v2Text.cardSerif, { color: v2Colors.ink, fontStyle: 'italic' }]}>
                {PET_ANIMALS.find((a) => a.type === animal)?.emoji}{' '}
                {PET_ANIMALS.find((a) => a.type === animal)?.label}
              </Text>
            </View>
            <RuledDivider variant="dotted" style={{ marginVertical: 8 }} />
            <View style={styles.signRow}>
              <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>
                TEMPERAMENT
              </Text>
              <Text
                style={[
                  v2Text.cardSerif,
                  {
                    color: PERSONALITY_ACCENT[personality],
                    fontStyle: 'italic',
                  },
                ]}
              >
                {PERSONALITIES.find((p) => p.type === personality)?.label}
              </Text>
            </View>
            <RuledDivider variant="double" color={v2Colors.ink} style={{ marginVertical: v2Space.md }} />
            <View style={styles.signFoot}>
              <Stamp
                label="APPROVED"
                sub="FOR FOCUS"
                color={v2Colors.moss}
                rotate={-6}
                size={80}
              />
              <View style={{ flex: 1, marginLeft: v2Space.md }}>
                <Text
                  style={[
                    v2Text.quote,
                    { color: v2Colors.ink, fontSize: 16, lineHeight: 22 },
                  ]}
                >
                  Welcome, {name.trim() || 'Bestie'}. Your attention will be
                  kept, briefly and with care.
                </Text>
                <Text
                  style={[
                    v2Text.serial,
                    { color: v2Colors.stamp, marginTop: 8, fontStyle: 'italic' },
                  ]}
                >
                  — BESTIE, RESIDENT COMPANION
                </Text>
              </View>
            </View>
          </IndexCard>
        )}

        {/* ── NAV ───────────────────────────────── */}
        <View style={styles.actions}>
          {step > 0 && (
            <View style={{ flex: 1 }}>
              <InkButton
                label="Back"
                sublabel="one page back"
                variant="paper"
                onPress={prev}
                full
              />
            </View>
          )}
          <View style={{ flex: 1.2 }}>
            <InkButton
              label={step === 3 ? 'Begin' : 'Continue'}
              sublabel={step === 3 ? 'open the library' : 'turn the page'}
              variant="ink"
              onPress={step === 3 ? finish : next}
              full
            />
          </View>
        </View>

        <View style={styles.foot}>
          <Asterism char="✦" color={v2Colors.stamp} size={12} />
          <Text
            style={[
              v2Text.serial,
              {
                color: v2Colors.stamp,
                textAlign: 'center',
                marginTop: 4,
                fontStyle: 'italic',
              },
            ]}
          >
            Page {step + 1} of {STEPS.length}
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
  skip: {},

  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: v2Space.md,
    marginBottom: v2Space.md,
  },
  stepItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 28,
    height: 28,
    borderWidth: 1.5,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBar: {
    flex: 1,
    height: 1.5,
    marginHorizontal: 4,
  },

  heroBlock: {
    marginTop: v2Space.md,
    marginBottom: v2Space.lg,
  },

  welcomeArt: {
    alignItems: 'center',
    marginVertical: v2Space.md,
    position: 'relative',
  },
  welcomeStamp: {
    position: 'absolute',
    right: '30%',
    top: 0,
  },
  prefaceCard: {
    marginTop: v2Space.md,
    shadowColor: v2Colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },

  animalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: v2Space.sm,
  },
  animalCard: {
    flex: 1,
    flexBasis: 90,
    minWidth: 78,
    paddingVertical: v2Space.md,
    paddingHorizontal: v2Space.sm,
    borderWidth: 1.5,
    borderRadius: 4,
    alignItems: 'center',
  },
  animalEmoji: {
    fontSize: 34,
    lineHeight: 38,
  },
  nameInput: {
    marginTop: v2Space.sm,
    backgroundColor: v2Colors.paperBright,
    borderWidth: 1.5,
    borderColor: v2Colors.ink,
    paddingHorizontal: v2Space.md,
    paddingVertical: v2Space.md,
    fontFamily:
      Platform.OS === 'web'
        ? '"Fraunces", "Hoefler Text", Georgia, serif'
        : 'serif',
    fontSize: 22,
    fontStyle: 'italic',
    color: v2Colors.ink,
    borderRadius: 2,
  },

  persoGrid: {
    flexDirection: 'column',
    gap: v2Space.md,
  },
  persoCard: {
    padding: v2Space.md,
    borderWidth: 1.5,
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  persoAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },

  signCard: {
    marginTop: v2Space.md,
    shadowColor: v2Colors.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  signRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  signFoot: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  actions: {
    flexDirection: 'row',
    gap: v2Space.md,
    marginTop: v2Space.xl,
  },

  foot: {
    marginTop: v2Space.xl,
    alignItems: 'center',
  },
});

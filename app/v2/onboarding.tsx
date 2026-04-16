import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
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
  { n: 'I',   title: 'Same, Bestie',     sub: 'Your focus companion' },
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
    router.replace('/v2/(tabs)/pet');
  };

  return (
    <PaperLayer>
      <V2WebFonts />
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + v2Space.md,
            paddingBottom: insets.bottom + v2Space.sm,
          },
        ]}
      >
        {/* Step indicator — centered */}
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

        {/* ── STEP TITLE (non-step-0) ────────────── */}
        {step > 0 && (
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
                { color: v2Colors.inkSoft, fontStyle: 'italic', marginTop: 6 },
              ]}
            >
              {STEPS[step].sub}
            </Text>
          </View>
        )}

        {/* ── STEP 0: APP INTRO ──────────────────── */}
        {step === 0 && (
          <View style={styles.introScreen}>
            <Text
              // @ts-ignore
              className={Platform.OS === 'web' ? 'v2-wonk' : undefined}
              style={styles.introTitle}
            >
              Same, <Text style={styles.introTitleAccent}>Bestie</Text>.
            </Text>

            <Text style={styles.introDesc}>
              Focusing alone is hard. So we made you a little creature that
              sits with you while you work — judges you a bit, cheers you
              on a lot, and keeps score.
            </Text>

            <View style={styles.introChips}>
              {[
                { emoji: '🍅', text: 'Adapts to your energy' },
                { emoji: '🐧', text: 'Has opinions about you' },
                { emoji: '📈', text: 'Tracks your streaks' },
                { emoji: '🧠', text: 'Learns how you focus' },
              ].map((item, i) => (
                <View key={i} style={styles.introChip}>
                  <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
                  <Text style={[v2Text.body, { color: v2Colors.ink, fontSize: 15 }]}>{item.text}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {step === 1 && (
          <View style={styles.pickScreen}>
            <Text style={[v2Text.quote, { color: v2Colors.inkSoft, fontSize: 17, lineHeight: 24, marginBottom: v2Space.md }]}>
              Who's going to keep you company?
            </Text>

            <View style={styles.speciesGrid}>
              {[
                { type: 'penguin', label: 'Penguin', available: true },
                { type: 'cat',     label: 'Cat',     available: false },
                { type: 'fox',     label: 'Fox',     available: false },
                { type: 'random',  label: 'Random',  available: false },
              ].map((a) => {
                const active = animal === a.type;
                const locked = !a.available;
                return (
                  <Pressable
                    key={a.type}
                    onPress={() => { if (a.available) setAnimal(a.type as PetAnimal); }}
                    style={[
                      styles.speciesCell,
                      active && styles.speciesCellActive,
                      locked && styles.speciesCellLocked,
                    ]}
                  >
                    {a.type === 'penguin' ? (
                      <Image
                        source={require('../../assets/images/penguin-avatar.png')}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={{ fontSize: 36, opacity: locked ? 0.3 : 1 }}>
                        {a.type === 'random' ? '🎲' : PET_ANIMALS.find(p => p.type === a.type)?.emoji || '?'}
                      </Text>
                    )}
                    <View style={styles.speciesLabel}>
                      <Text style={[v2Text.serial, { color: active ? v2Colors.paperBright : locked ? v2Colors.inkMuted : v2Colors.stamp }]}>
                        {a.label.toUpperCase()}
                      </Text>
                      {locked && (
                        <Text style={[v2Text.serial, { color: v2Colors.inkMuted, fontSize: 7 }]}>
                          SOON
                        </Text>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[v2Text.quote, { color: v2Colors.inkSoft, fontSize: 15, marginTop: v2Space.lg }]}>
              Give them a name
            </Text>
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
          <View style={[styles.persoGrid, { flex: 1 }]}>
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
          <View style={{ flex: 1 }}>
            <IndexCard
              style={styles.signCard}
              tint={v2Colors.paperBright}
              accent={v2Colors.coral}
            >
              <Text style={[v2Text.field, { color: v2Colors.stamp, marginBottom: v2Space.sm }]}>PERSONAL FILE</Text>

              {/* Photo with stamp overlapping */}
              <View style={{ alignSelf: 'center', position: 'relative', marginBottom: v2Space.md }}>
                <Stamp
                  label="APPROVED"
                  sub="FOR FOCUS"
                  color={v2Colors.moss}
                  rotate={-14}
                  size={150}
                  style={{ position: 'absolute', top: -30, right: -75, zIndex: 2 }}
                />
              <View style={styles.filePhoto}>
                <Image
                  source={require('../../assets/images/penguin-avatar.png')}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </View>
              </View>
              <RuledDivider variant="dotted" style={{ marginVertical: 8 }} />
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
                    { color: PERSONALITY_ACCENT[personality], fontStyle: 'italic' },
                  ]}
                >
                  {PERSONALITIES.find((p) => p.type === personality)?.label}
                </Text>
              </View>
              <RuledDivider variant="double" color={v2Colors.ink} style={{ marginVertical: v2Space.md }} />
              <View style={styles.signFoot}>
                <View style={{ flex: 1 }}>
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
          </View>
        )}

        {/* ── NAV ───────────────────────────────── */}
        <View style={styles.actions}>
          {step > 0 && (
            <Pressable onPress={prev} style={styles.backBtn}>
              <Text style={{ color: v2Colors.ink, fontSize: 24 }}>←</Text>
            </Pressable>
          )}
          <View style={{ flex: 1, opacity: step === 1 && !name.trim() ? 0.4 : 1 }}>
            <InkButton
              label={step === 1 && !name.trim() ? 'Name required' : step === 3 ? 'Begin' : 'Continue'}
              sublabel={step === 3 ? 'open the library' : ''}
              variant="ink"
              onPress={step === 1 && !name.trim() ? undefined : step === 3 ? finish : next}
              full
            />
          </View>
        </View>

        <Text style={[v2Text.serial, { color: v2Colors.stamp, textAlign: 'center', marginTop: v2Space.sm }]}>
          {step + 1} / {STEPS.length}
        </Text>
      </View>
    </PaperLayer>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { flex: 1, paddingHorizontal: v2Space.lg },
  masthead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  skip: {},

  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: v2Space.md,
    marginBottom: v2Space.md,
  },
  stepItem: {
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
    width: 24,
    height: 1.5,
    marginHorizontal: 4,
  },

  introScreen: {
    flex: 1,
    justifyContent: 'center',
  },
  introTitle: {
    fontFamily: '"Fraunces", "Hoefler Text", Georgia, serif',
    fontSize: 52,
    lineHeight: 56,
    color: v2Colors.ink,
    letterSpacing: -1,
    fontWeight: '400' as const,
  },
  introTitleAccent: {
    color: v2Colors.coral,
    fontStyle: 'italic',
    fontWeight: '300' as const,
  },
  introDesc: {
    fontFamily: '"Fraunces", "Hoefler Text", Georgia, serif',
    fontSize: 20,
    lineHeight: 30,
    color: v2Colors.inkSoft,
    fontStyle: 'italic',
    marginTop: v2Space.md,
    marginBottom: v2Space.lg,
  },
  introChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: v2Space.sm,
  },
  introChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: v2Colors.paperBright,
    borderWidth: 1,
    borderColor: v2Colors.paperShadow,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 18,
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

  pickScreen: {
    flex: 1,
  },
  speciesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  speciesCell: {
    width: '47%',
    flexGrow: 1,
    aspectRatio: 1,
    borderWidth: 1.5,
    borderColor: v2Colors.paperShadow,
    borderRadius: 8,
    backgroundColor: v2Colors.paperBright,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  speciesCellActive: {
    borderColor: v2Colors.ink,
    borderWidth: 2,
    shadowColor: v2Colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  speciesCellLocked: {
    backgroundColor: v2Colors.paperDeep,
    opacity: 0.6,
  },
  speciesLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(20,32,58,0.75)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

  filePhoto: {
    width: 200,
    height: 200,
    borderWidth: 1,
    borderColor: v2Colors.ink,
    borderRadius: 4,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  signRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: v2Space.sm,
    marginTop: v2Space.md,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderWidth: 1.5,
    borderColor: v2Colors.ink,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: v2Colors.paperBright,
  },

  foot: {
    marginTop: v2Space.xl,
    alignItems: 'center',
  },
});

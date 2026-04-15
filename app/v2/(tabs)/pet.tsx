import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';
import { PaperLayer } from '../../../src/components/v2/PaperLayer';
import {
  RuledDivider,
  FieldLabel,
  IndexCard,
  Stamp,
  InkButton,
  Asterism,
} from '../../../src/components/v2/Primitives';
import { useUserStore } from '../../../src/store/useUserStore';
import { usePetStore } from '../../../src/store/usePetStore';
import { getBestieQuote } from '../../../src/utils/moodEngine';
import { getBondXPMax } from '../../../src/utils/levelSystem';
import {
  PERSONALITIES,
  PET_ANIMALS,
  PetAnimal,
  BOND_TIER_NAMES,
  Personality,
} from '../../../src/types';
import { v2Colors, v2Text, v2Space } from '../../../src/theme/v2';

const PERSONALITY_ACCENT: Record<Personality, string> = {
  soft: v2Colors.moss,
  chaotic: v2Colors.coral,
  strict: v2Colors.sky,
};

const INVENTORY: {
  id: string;
  name: string;
  sub: string;
  unlockAt: number;
  glyph: string;
}[] = [
  { id: 'scarf',   name: 'Paper Scarf',    sub: 'woolen, hand-torn',   unlockAt: 2,  glyph: '§' },
  { id: 'glass',   name: 'Reading Glasses', sub: 'round, academic',    unlockAt: 3,  glyph: '⊙' },
  { id: 'crown',   name: 'Focus Crown',    sub: 'for concentrating',   unlockAt: 5,  glyph: '✦' },
  { id: 'phones',  name: 'Lo-Fi Phones',   sub: 'with soft static',    unlockAt: 7,  glyph: '♪' },
  { id: 'cape',    name: 'Study Cape',     sub: 'in navy wool',        unlockAt: 10, glyph: '❋' },
  { id: 'aura',    name: 'Glow Aura',      sub: 'evidence of depth',   unlockAt: 15, glyph: '✺' },
];

export default function V2Pet() {
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
  const setPetAnimal = usePetStore((s) => s.setPetAnimal);

  const bondMax = getBondXPMax(bondTier);
  const bondRatio = bondMax > 0 ? bondXP / bondMax : 0;
  const tierName = BOND_TIER_NAMES[bondTier];
  const quote = getBestieQuote(personality, 'idle');

  const player = useVideoPlayer(
    require('../../../assets/images/penguin-happy.mp4'),
    (p) => { p.loop = true; p.muted = true; p.play(); },
  );

  return (
    <PaperLayer>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: insets.top + v2Space.md,
            paddingBottom: insets.bottom + v2Space.xxl + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── MASTHEAD ───────────────────────────── */}
        <View style={styles.masthead}>
          <View>
            <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>
              CATALOG · VOL. {String(level).padStart(2, '0')}
            </Text>
            <Text style={[v2Text.field, { color: v2Colors.ink, marginTop: 4 }]}>
              THE COMPANION DOSSIER
            </Text>
          </View>
          <View style={styles.streak}>
            <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>STREAK</Text>
            <Text
              style={[
                v2Text.displaySerif,
                { color: v2Colors.amber, fontSize: 22, lineHeight: 24 },
              ]}
            >
              {String(currentStreak).padStart(2, '0')}
            </Text>
          </View>
        </View>

        <RuledDivider variant="double" color={v2Colors.ink} style={{ marginTop: 8 }} />

        {/* ── HERO: Name & pet ───────────────────── */}
        <View style={styles.hero}>
          <Text
            // @ts-ignore
            className={Platform.OS === 'web' ? 'v2-wonk' : undefined}
            style={[v2Text.heroSerif, { color: v2Colors.ink }]}
          >
            {petName || 'Bestie'}
            <Text style={{ color: v2Colors.coral }}>.</Text>
          </Text>
          <Text
            // @ts-ignore
            className={Platform.OS === 'web' ? 'v2-soft' : undefined}
            style={[
              v2Text.sectionSerif,
              {
                color: v2Colors.inkSoft,
                fontStyle: 'italic',
                fontWeight: '400',
                marginTop: 4,
              },
            ]}
          >
            a {personality} companion · {petAnimal}
          </Text>
        </View>

        {/* ── VIDEO PORTRAIT ────────────────────── */}
        <View style={styles.videoFrame}>
          <View style={styles.videoInner}>
            <VideoView
              player={player}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              nativeControls={false}
            />
          </View>
          {/* Bottom band */}
          <View style={styles.videoBand}>
            <Text style={[v2Text.field, { color: v2Colors.paperBright, fontSize: 9 }]}>
              {(petName || 'BESTIE').toUpperCase()} · {petAnimal.toUpperCase()} · LVL {level}
            </Text>
            <Text style={[v2Text.serial, { color: v2Colors.paperBright, opacity: 0.65 }]}>
              MOOD: {String(mood).toUpperCase()}
            </Text>
          </View>
          {/* Stamp overlay */}
          <Stamp
            label="BONDED"
            sub={tierName.toUpperCase()}
            color={PERSONALITY_ACCENT[personality as Personality]}
            rotate={-10}
            style={styles.videoStamp}
          />
        </View>

        {/* ── QUOTE ──────────────────────────────── */}
        <View style={styles.quoteCard}>
          <FieldLabel index="DIALOGUE">Current transmission</FieldLabel>
          <Text
            style={[
              v2Text.quote,
              { color: v2Colors.ink, marginTop: 8, fontSize: 18, lineHeight: 26 },
            ]}
          >
            <Text style={{ color: v2Colors.coral, fontSize: 32, lineHeight: 24 }}>"</Text>
            {quote}
            <Text style={{ color: v2Colors.coral, fontSize: 32, lineHeight: 24 }}>"</Text>
          </Text>
          <Text style={[v2Text.serial, { color: v2Colors.stamp, marginTop: 10 }]}>
            RECORDED · MOOD: {String(mood).toUpperCase()}
          </Text>
        </View>

        {/* ── BOND METER ─────────────────────────── */}
        <FieldLabel index="N°01" style={{ marginTop: v2Space.xl }}>
          The bond
        </FieldLabel>

        <IndexCard
          style={styles.bondCard}
          tint={v2Colors.mossWash}
          accent={v2Colors.moss}
          serial={`LV.${level}`}
        >
          <View style={styles.bondHeader}>
            <View>
              <Text style={[v2Text.serial, { color: v2Colors.mossInk }]}>
                TIER {bondTier} · {tierName.toUpperCase()}
              </Text>
              <Text
                style={[
                  v2Text.sectionSerif,
                  {
                    color: v2Colors.mossInk,
                    fontStyle: 'italic',
                    marginTop: 2,
                  },
                ]}
              >
                An understanding, forming.
              </Text>
            </View>
            <Text
              style={[
                v2Text.displaySerif,
                { color: v2Colors.moss, fontSize: 32 },
              ]}
            >
              {bondXP}
              <Text style={{ fontSize: 16, color: v2Colors.mossInk }}>
                /{bondMax}
              </Text>
            </Text>
          </View>

          <View style={styles.bondTrack}>
            {Array.from({ length: 30 }).map((_, i) => {
              const filled = i / 30 < bondRatio;
              return (
                <View
                  key={i}
                  style={[
                    styles.bondTick,
                    {
                      backgroundColor: filled ? v2Colors.moss : v2Colors.rule,
                      height: filled ? 16 : 10,
                    },
                  ]}
                />
              );
            })}
          </View>
        </IndexCard>

        {/* ── PERSONALITY ─────────────────────────── */}
        <FieldLabel index="N°02" style={{ marginTop: v2Space.xl }}>
          Temperament chip
        </FieldLabel>
        <View style={styles.personalityGrid}>
          {PERSONALITIES.map((p) => {
            const active = personality === p.type;
            const accent = PERSONALITY_ACCENT[p.type as Personality];
            return (
              <Pressable
                key={p.type}
                onPress={() => setPersonality(p.type)}
                style={({ pressed }) => [
                  styles.persoCard,
                  {
                    borderColor: active ? v2Colors.ink : v2Colors.paperShadow,
                    backgroundColor: active ? v2Colors.paperBright : v2Colors.paper,
                    transform: pressed ? [{ translateY: 2 }] : [{ translateY: 0 }],
                    shadowOffset: {
                      width: active ? 3 : 0,
                      height: active ? 3 : 0,
                    },
                    shadowColor: v2Colors.ink,
                    shadowOpacity: 1,
                    shadowRadius: 0,
                  },
                ]}
              >
                <View style={[styles.persoAccent, { backgroundColor: accent }]} />
                <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>
                  TEMPERAMENT · {String(p.type).slice(0, 3).toUpperCase()}
                </Text>
                <Text
                  style={[
                    v2Text.cardSerif,
                    {
                      color: v2Colors.ink,
                      marginTop: 6,
                      fontStyle: 'italic',
                    },
                  ]}
                >
                  {p.label}
                </Text>
                <Text
                  style={[
                    v2Text.bodySmall,
                    { color: v2Colors.inkMuted, marginTop: 4 },
                  ]}
                >
                  {p.description}
                </Text>
                {active && (
                  <Text
                    style={[
                      v2Text.serial,
                      { color: accent, marginTop: 8, fontWeight: '700' },
                    ]}
                  >
                    ✓ ACTIVE
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* ── SPECIES PICKER ─────────────────────── */}
        <FieldLabel index="N°03" style={{ marginTop: v2Space.xl }}>
          Species registry
        </FieldLabel>
        <View style={styles.speciesRow}>
          {PET_ANIMALS.map((a) => {
            const active = petAnimal === a.type;
            return (
              <Pressable
                key={a.type}
                onPress={() => setPetAnimal(a.type as PetAnimal)}
                style={({ pressed }) => [
                  styles.speciesCard,
                  {
                    borderColor: active ? v2Colors.ink : v2Colors.paperShadow,
                    backgroundColor: active
                      ? v2Colors.coralWash
                      : v2Colors.paperBright,
                    transform: pressed
                      ? [{ translateY: 1 }]
                      : [{ translateY: 0 }],
                  },
                ]}
              >
                {a.type === 'penguin' ? (
                  <Image
                    source={require('../../../assets/images/penguin-profile.png')}
                    style={styles.speciesImg}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={styles.speciesEmoji}>{a.emoji}</Text>
                )}
                <Text
                  style={[
                    v2Text.serial,
                    {
                      color: active ? v2Colors.coralInk : v2Colors.stamp,
                      textAlign: 'center',
                      marginTop: 4,
                    },
                  ]}
                >
                  {a.label.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── INVENTORY ──────────────────────────── */}
        <FieldLabel index="N°04" style={{ marginTop: v2Space.xl }}>
          Collected ornaments
        </FieldLabel>
        <View style={styles.invGrid}>
          {INVENTORY.map((item) => {
            const unlocked = level >= item.unlockAt;
            return (
              <IndexCard
                key={item.id}
                style={styles.invCard}
                tint={unlocked ? v2Colors.paperBright : v2Colors.paperDeep}
                accent={unlocked ? v2Colors.coral : v2Colors.rule}
                serial={`ORN-${item.id.toUpperCase().slice(0, 3)}`}
              >
                <View style={styles.invHead}>
                  <Text
                    style={[
                      styles.invGlyph,
                      { color: unlocked ? v2Colors.ink : v2Colors.rule },
                    ]}
                  >
                    {unlocked ? item.glyph : '×'}
                  </Text>
                </View>
                <Text
                  style={[
                    v2Text.cardSerif,
                    {
                      color: unlocked ? v2Colors.ink : v2Colors.inkMuted,
                      fontStyle: 'italic',
                      marginTop: 6,
                    },
                  ]}
                >
                  {item.name}
                </Text>
                <Text
                  style={[
                    v2Text.bodySmall,
                    { color: v2Colors.inkMuted, marginTop: 2 },
                  ]}
                >
                  {unlocked ? item.sub : `Unlocks at Lv. ${item.unlockAt}`}
                </Text>
              </IndexCard>
            );
          })}
        </View>

        {/* ── CTA ────────────────────────────────── */}
        <View style={{ marginTop: v2Space.xl }}>
          <InkButton
            label="Begin a session"
            sublabel="together, in focus"
            variant="ink"
            onPress={() => router.push('/v2/check-in')}
            full
          />
        </View>

        <View style={styles.foot}>
          <Asterism char="✦ ❋ ✦" color={v2Colors.stamp} size={10} />
          <Text
            style={[
              v2Text.serial,
              { color: v2Colors.stamp, textAlign: 'center', marginTop: 4 },
            ]}
          >
            Catalogued with care · Same Bestie, vol. II
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
  streak: {
    alignItems: 'flex-end',
  },

  hero: {
    marginTop: v2Space.md,
    marginBottom: v2Space.lg,
  },

  videoFrame: {
    marginVertical: v2Space.md,
    borderWidth: 1.5,
    borderColor: v2Colors.ink,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: v2Colors.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  videoInner: {
    width: '100%',
    aspectRatio: 3 / 2,
  },
  videoBand: {
    backgroundColor: v2Colors.ink,
    paddingVertical: 6,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  videoStamp: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  quoteCard: {
    paddingLeft: v2Space.md,
    borderLeftWidth: 2,
    borderLeftColor: v2Colors.coral,
    marginBottom: v2Space.md,
  },

  bondCard: {
    shadowColor: v2Colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  bondHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: v2Space.md,
  },
  bondTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 18,
  },
  bondTick: {
    flex: 1,
    borderRadius: 1,
  },

  personalityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: v2Space.md,
  },
  persoCard: {
    flex: 1,
    flexBasis: 200,
    minWidth: 180,
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

  speciesRow: {
    flexDirection: 'row',
    gap: v2Space.sm,
    flexWrap: 'wrap',
  },
  speciesCard: {
    flex: 1,
    flexBasis: 90,
    minWidth: 72,
    borderWidth: 1.5,
    borderRadius: 4,
    paddingVertical: v2Space.md,
    paddingHorizontal: v2Space.sm,
    alignItems: 'center',
  },
  speciesEmoji: {
    fontSize: 32,
    lineHeight: 36,
  },
  speciesImg: {
    width: 42,
    height: 42,
    borderRadius: 4,
  },

  invGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: v2Space.md,
  },
  invCard: {
    flex: 1,
    flexBasis: 180,
    minWidth: 160,
    padding: v2Space.md,
  },
  invHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  invGlyph: {
    fontFamily:
      Platform.OS === 'web'
        ? '"Fraunces", "Hoefler Text", Garamond, Georgia, serif'
        : 'serif',
    fontSize: 26,
    fontStyle: 'italic',
  },

  foot: {
    marginTop: v2Space.xl,
    alignItems: 'center',
  },
});

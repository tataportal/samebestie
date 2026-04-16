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
// expo-video removed — using native <video> on web for reliability
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
import { useFocusStore } from '../../../src/store/useFocusStore';
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
  const startSession = useFocusStore((s) => s.startSession);
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

  // Video source resolved at require time for Metro
  const videoSource = require('../../../assets/images/penguin-happy.mp4');

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

        {/* ── HERO: Profile pic + Name ─────────────── */}
        <View style={styles.hero}>
          <Image
            source={require('../../../assets/images/penguin-avatar.png')}
            style={styles.profilePic}
            resizeMode="cover"
          />
          <View style={styles.heroText}>
            <Text
              // @ts-ignore
              className={Platform.OS === 'web' ? 'v2-wonk' : undefined}
              style={[v2Text.heroSerif, { color: v2Colors.ink, fontSize: 42, lineHeight: 44 }]}
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
                  fontSize: 16,
                  marginTop: 4,
                },
              ]}
            >
              a {personality} companion · {petAnimal}
            </Text>
          </View>
        </View>

        {/* ── VIDEO PORTRAIT ────────────────────── */}
        <View style={styles.videoFrame}>
          {Platform.OS === 'web' ? (
            // @ts-ignore — native HTML video for web
            <video
              src={typeof videoSource === 'number' ? undefined : videoSource}
              autoPlay
              loop
              muted
              playsInline
              style={{ width: '100%', aspectRatio: '3/2', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <View style={styles.videoInner} />
          )}
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

        {/* ── QUOTE (IndexCard format) ────────────── */}
        <IndexCard
          style={styles.bondCard}
          tint={v2Colors.paperBright}
          accent={v2Colors.coral}
        >
          <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>
            {(petName || 'BESTIE').toUpperCase()} SAYS
          </Text>
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
        </IndexCard>

        {/* ── CTA ────────────────────────────────── */}
        <View style={styles.ctaRow}>
          <View style={{ flex: 1 }}>
            <InkButton
              label="New session"
              variant="ink"
              onPress={() => router.push('/v2/check-in')}
              full
            />
          </View>
          <Pressable
            onPress={() => {
              startSession('classic', 25 * 60, 5 * 60, 4);
              router.push('/v2/session');
            }}
            style={styles.quickBtn}
          >
            <Text style={{ fontSize: 18 }}>⚡</Text>
            <Text style={[v2Text.serial, { color: v2Colors.paperBright, fontSize: 7 }]}>25 MIN</Text>
          </Pressable>
        </View>
      </ScrollView>
    </PaperLayer>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  ctaRow: {
    flexDirection: 'row',
    gap: v2Space.sm,
    marginTop: v2Space.xl,
    alignItems: 'stretch',
  },
  quickBtn: {
    width: 56,
    backgroundColor: v2Colors.coral,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: v2Colors.coralInk,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    shadowColor: v2Colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
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
    marginTop: v2Space.sm,
    marginBottom: v2Space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: v2Space.md,
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: v2Colors.ink,
  },
  heroText: {
    flex: 1,
  },

  videoFrame: {
    marginTop: 0,
    marginBottom: v2Space.sm,
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
    height: 150,
    justifyContent: 'center',
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

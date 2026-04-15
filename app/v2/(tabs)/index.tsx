import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PaperLayer } from '../../../src/components/v2/PaperLayer';
import {
  RuledDivider,
  FieldLabel,
  IndexCard,
  Stamp,
  InkButton,
  Asterism,
} from '../../../src/components/v2/Primitives';
import { PetGlyph } from '../../../src/components/v2/PetGlyph';
import { useUserStore } from '../../../src/store/useUserStore';
import { usePetStore } from '../../../src/store/usePetStore';
import { useFocusStore } from '../../../src/store/useFocusStore';
import { getBestieQuote } from '../../../src/utils/moodEngine';
import { formatXP } from '../../../src/utils/formatTime';
import {
  getLevelFromXP,
  getRankFromLevel,
  getXPProgress,
} from '../../../src/utils/levelSystem';
import { FOCUS_MODES, FocusMode } from '../../../src/types';
import { v2Colors, v2Text, v2Space } from '../../../src/theme/v2';

const MODE_ACCENT: Record<FocusMode, string> = {
  'tiny-start': v2Colors.amber,
  gentle: v2Colors.sky,
  classic: v2Colors.coral,
  hyper: v2Colors.moss,
};

export default function V2Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const totalXP = useUserStore((s) => s.totalXP);
  const currentStreak = useUserStore((s) => s.currentStreak);
  const level = getLevelFromXP(totalXP);
  const rank = getRankFromLevel(level);
  const xpProgress = getXPProgress(totalXP);
  const personality = usePetStore((s) => s.personality);
  const petAnimal = usePetStore((s) => s.petAnimal);
  const petName = usePetStore((s) => s.petName);
  const startSession = useFocusStore((s) => s.startSession);

  const [selectedMode, setSelectedMode] = useState<FocusMode>('classic');
  const quote = getBestieQuote(personality, 'home');
  const cfg = FOCUS_MODES.find((m) => m.mode === selectedMode)!;

  const handleStart = useCallback(() => {
    startSession(
      selectedMode,
      cfg.focusMinutes * 60,
      cfg.breakMinutes * 60,
      cfg.rounds,
    );
    router.push('/v2/session');
  }, [selectedMode, cfg, startSession, router]);

  const dateLabel = new Date()
    .toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
    .toUpperCase();
  const serial = `N°${String(level).padStart(3, '0')}-${String(currentStreak).padStart(2, '0')}`;

  return (
    <PaperLayer>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: insets.top + v2Space.lg,
            paddingBottom: insets.bottom + v2Space.xxl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── MASTHEAD ───────────────────────────── */}
        <View style={styles.masthead}>
          <View style={styles.mastheadLeft}>
            <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>
              VOL. II
            </Text>
            <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>
              {dateLabel}
            </Text>
          </View>
          <View style={styles.mastheadCenter}>
            <Asterism char="✦" color={v2Colors.coral} size={10} />
          </View>
          <View style={styles.mastheadRight}>
            <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>
              {serial}
            </Text>
            <Pressable
              onPress={() => router.push('/')}
              style={styles.v1Link}
            >
              <Text style={[v2Text.serial, { color: v2Colors.coral }]}>
                ← V1
              </Text>
            </Pressable>
          </View>
        </View>

        <RuledDivider variant="double" color={v2Colors.ink} style={styles.rule} />

        {/* ── HERO TITLE ─────────────────────────── */}
        <View style={styles.heroBlock}>
          <Text
            // @ts-ignore
            className={Platform.OS === 'web' ? 'v2-wonk' : undefined}
            style={[v2Text.heroSerif, { color: v2Colors.ink }]}
          >
            The Focus
          </Text>
          <View style={styles.subtitleRow}>
            <Text
              // @ts-ignore
              className={Platform.OS === 'web' ? 'v2-soft' : undefined}
              style={[
                v2Text.heroSerif,
                {
                  color: v2Colors.coral,
                  fontStyle: 'italic',
                  fontWeight: '300',
                },
              ]}
            >
              Companion
            </Text>
            <Text
              style={[
                v2Text.heroSerif,
                { color: v2Colors.ink, marginLeft: 6 },
              ]}
            >
              .
            </Text>
          </View>
          <Text style={[v2Text.bodySmall, styles.tagline]}>
            A private correspondence between you, your attention, and
            the small creature who keeps watch over it.
          </Text>
        </View>

        {/* ── PET CARD ───────────────────────────── */}
        <View style={styles.petSection}>
          <View style={styles.petStack}>
            <PetGlyph
              animal={petAnimal}
              size={180}
              label={(petName || 'BESTIE').toUpperCase()}
              serial={`CAT. ${petAnimal.slice(0, 3).toUpperCase()}-${String(level).padStart(2, '0')}`}
            />
            <Stamp
              label="CERTIFIED"
              sub="FOCUS BUDDY"
              color={v2Colors.coral}
              rotate={-14}
              style={styles.stampOverlay}
            />
          </View>

          <View style={styles.quoteBlock}>
            <Text
              style={[v2Text.quote, { color: v2Colors.ink }]}
            >
              <Text style={{ color: v2Colors.coral, fontSize: 30, lineHeight: 20 }}>“</Text>
              {quote}
              <Text style={{ color: v2Colors.coral, fontSize: 30, lineHeight: 20 }}>”</Text>
            </Text>
            <Text style={[v2Text.field, { color: v2Colors.stamp, marginTop: 10 }]}>
              — {(petName || 'Bestie').toUpperCase()}, {personality.toUpperCase()} EDITION
            </Text>
          </View>
        </View>

        {/* ── LEDGER STATS ───────────────────────── */}
        <FieldLabel index="N°01" style={styles.sectionLabel}>
          The Ledger
        </FieldLabel>
        <View style={styles.ledger}>
          <View style={styles.ledgerRow}>
            <Text style={[v2Text.field, { color: v2Colors.inkMuted }]}>
              Consecutive days
            </Text>
            <View style={styles.ledgerDots} />
            <Text style={[v2Text.displaySerif, { color: v2Colors.amber }]}>
              {String(currentStreak).padStart(2, '0')}
            </Text>
          </View>
          <RuledDivider variant="dotted" style={{ marginVertical: 6 }} />
          <View style={styles.ledgerRow}>
            <Text style={[v2Text.field, { color: v2Colors.inkMuted }]}>
              Experience accrued
            </Text>
            <View style={styles.ledgerDots} />
            <Text style={[v2Text.displaySerif, { color: v2Colors.coral }]}>
              {formatXP(totalXP)}
            </Text>
          </View>
          <RuledDivider variant="dotted" style={{ marginVertical: 6 }} />
          <View style={styles.ledgerRow}>
            <Text style={[v2Text.field, { color: v2Colors.inkMuted }]}>
              Rank held
            </Text>
            <View style={styles.ledgerDots} />
            <Text
              style={[
                v2Text.sectionSerif,
                { color: v2Colors.moss, fontStyle: 'italic' },
              ]}
            >
              {rank}
            </Text>
          </View>

          {/* level bar */}
          <View style={styles.levelBarWrap}>
            <Text style={[v2Text.serial, { color: v2Colors.inkMuted }]}>
              LVL {xpProgress.level}
            </Text>
            <View style={styles.levelBarTrack}>
              {Array.from({ length: 24 }).map((_, i) => {
                const filled = i / 24 < xpProgress.ratio;
                return (
                  <View
                    key={i}
                    style={[
                      styles.levelTick,
                      {
                        backgroundColor: filled
                          ? v2Colors.ink
                          : v2Colors.rule,
                        height: filled ? 14 : 8,
                      },
                    ]}
                  />
                );
              })}
            </View>
            <Text style={[v2Text.serial, { color: v2Colors.inkMuted }]}>
              {xpProgress.current}/{xpProgress.max}
            </Text>
          </View>
        </View>

        {/* ── FOCUS SELECTOR ─────────────────────── */}
        <FieldLabel index="N°02" style={styles.sectionLabel}>
          Tonight's prescription
        </FieldLabel>

        <View style={styles.modeGrid}>
          {FOCUS_MODES.map((fm, i) => {
            const active = selectedMode === fm.mode;
            const accent = MODE_ACCENT[fm.mode];
            return (
              <Pressable
                key={fm.mode}
                onPress={() => setSelectedMode(fm.mode)}
                style={({ pressed }) => [
                  styles.modeCard,
                  {
                    borderColor: active ? v2Colors.ink : v2Colors.paperShadow,
                    backgroundColor: active
                      ? v2Colors.paperBright
                      : v2Colors.paper,
                    transform: pressed
                      ? [{ translateY: 2 }]
                      : [{ translateY: 0 }],
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
                <View
                  style={[
                    styles.modeAccent,
                    { backgroundColor: accent },
                  ]}
                />
                <View style={styles.modeHead}>
                  <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>
                    PRESCR. {String(i + 1).padStart(2, '0')}
                  </Text>
                  {active && (
                    <Text style={[v2Text.serial, { color: accent }]}>
                      ✓ SELECTED
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    v2Text.cardSerif,
                    { color: v2Colors.ink, marginTop: 8 },
                  ]}
                >
                  {fm.label
                    .toLowerCase()
                    .replace(/(^|\s)\w/g, (m) => m.toUpperCase())}
                </Text>
                <Text
                  style={[
                    v2Text.tag,
                    {
                      color: v2Colors.inkMuted,
                      marginTop: 2,
                    },
                  ]}
                >
                  {fm.focusMinutes}′ focus · {fm.breakMinutes}′ rest · ×{fm.rounds}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── SELECTED DETAIL ────────────────────── */}
        <IndexCard
          style={styles.detailCard}
          tint={v2Colors.paperBright}
          accent={MODE_ACCENT[selectedMode]}
          serial={`RX-${selectedMode.toUpperCase()}`}
        >
          <FieldLabel>How to take</FieldLabel>
          <Text
            style={[
              v2Text.cardSerif,
              {
                color: v2Colors.ink,
                fontStyle: 'italic',
                marginTop: 8,
                lineHeight: 25,
              },
            ]}
          >
            {cfg.description}
          </Text>
          <View style={styles.detailFooter}>
            <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>
              DURATION · {cfg.focusMinutes * cfg.rounds + cfg.breakMinutes * (cfg.rounds - 1)} MIN
            </Text>
            <Asterism char="❋" color={MODE_ACCENT[selectedMode]} size={12} />
            <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>
              DISPENSED BY BESTIE
            </Text>
          </View>
        </IndexCard>

        {/* ── ACTIONS ────────────────────────────── */}
        <View style={styles.actions}>
          <View style={{ flex: 1 }}>
            <InkButton
              label="Customize"
              sublabel="note it in the journal"
              variant="paper"
              onPress={() => router.push('/v2/check-in')}
              full
            />
          </View>
          <View style={{ flex: 1.2 }}>
            <InkButton
              label="Begin Session"
              sublabel={`${cfg.focusMinutes}′ — let us begin`}
              variant="ink"
              onPress={handleStart}
              full
            />
          </View>
        </View>

        {/* ── FOOTER ORNAMENT ────────────────────── */}
        <View style={styles.footOrn}>
          <RuledDivider variant="dotted" style={{ flex: 1 }} />
          <Asterism char="✦ ❋ ✦" color={v2Colors.stamp} size={10} style={{ marginHorizontal: 10 }} />
          <RuledDivider variant="dotted" style={{ flex: 1 }} />
        </View>
        <Text style={styles.footnote}>
          Printed by hand · Distilled from 24 rounds of Pomodoro
        </Text>
      </ScrollView>
    </PaperLayer>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: {
    paddingHorizontal: v2Space.lg,
  },

  masthead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mastheadLeft: { gap: 2 },
  mastheadCenter: {},
  mastheadRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  v1Link: { marginTop: 2 },
  rule: { marginVertical: v2Space.md },

  heroBlock: {
    marginTop: v2Space.md,
    marginBottom: v2Space.lg,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  tagline: {
    color: v2Colors.inkSoft,
    marginTop: v2Space.md,
    maxWidth: 360,
    fontStyle: 'italic',
  },

  petSection: {
    flexDirection: 'row',
    gap: v2Space.lg,
    alignItems: 'center',
    marginVertical: v2Space.lg,
    flexWrap: 'wrap',
  },
  petStack: {
    position: 'relative',
  },
  stampOverlay: {
    position: 'absolute',
    right: -14,
    top: -10,
  },
  quoteBlock: {
    flex: 1,
    minWidth: 240,
    paddingLeft: v2Space.md,
    borderLeftWidth: 1,
    borderLeftColor: v2Colors.rule,
  },

  sectionLabel: {
    marginTop: v2Space.xl,
    marginBottom: v2Space.md,
  },

  ledger: {
    backgroundColor: v2Colors.paperBright,
    borderWidth: 1,
    borderColor: v2Colors.paperShadow,
    borderRadius: 4,
    padding: v2Space.lg,
    shadowColor: v2Colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  ledgerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  ledgerDots: {
    flex: 1,
    borderBottomWidth: 1,
    borderStyle: 'dotted',
    borderColor: v2Colors.rule,
    marginBottom: 6,
  },
  levelBarWrap: {
    marginTop: v2Space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelBarTrack: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 18,
  },
  levelTick: {
    width: 4,
    borderRadius: 1,
  },

  modeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: v2Space.md,
  },
  modeCard: {
    flexGrow: 1,
    flexBasis: '46%',
    minWidth: 150,
    padding: v2Space.md,
    borderRadius: 4,
    borderWidth: 1.5,
    position: 'relative',
    overflow: 'hidden',
  },
  modeAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  modeHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },

  detailCard: {
    marginTop: v2Space.lg,
    shadowColor: v2Colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  detailFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: v2Space.md,
    paddingTop: v2Space.md,
    borderTopWidth: 1,
    borderStyle: 'dotted',
    borderColor: v2Colors.rule,
  },

  actions: {
    flexDirection: 'row',
    gap: v2Space.md,
    marginTop: v2Space.xl,
  },

  footOrn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: v2Space.xxl,
  },
  footnote: {
    ...v2Text.serial,
    color: v2Colors.stamp,
    textAlign: 'center',
    marginTop: v2Space.sm,
    fontStyle: 'italic',
  },
});

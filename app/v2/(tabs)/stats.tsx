import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
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
  Asterism,
} from '../../../src/components/v2/Primitives';
import { useUserStore } from '../../../src/store/useUserStore';
import { useHistoryStore } from '../../../src/store/useHistoryStore';
import { usePetStore } from '../../../src/store/usePetStore';
import { getLevelFromXP } from '../../../src/utils/levelSystem';
import { getObservations, getArchivistNote } from '../../../src/utils/analytics';
import { v2Colors, v2Text, v2Space } from '../../../src/theme/v2';

const OBS_COLOR: Record<'coral' | 'moss' | 'amber', string> = {
  coral: v2Colors.coral,
  moss: v2Colors.moss,
  amber: v2Colors.amber,
};

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAY_LONG = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

function computeWeeklyXP(
  sessions: import('../../../src/types').FocusSession[],
): number[] {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayStr = date.toISOString().split('T')[0];
    return sessions
      .filter((s) => s.startedAt.startsWith(dayStr))
      .reduce((sum, s) => sum + s.xpEarned, 0);
  });
}

export default function V2Stats() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const totalXP = useUserStore((s) => s.totalXP);
  const level = getLevelFromXP(totalXP);
  const sessions = useHistoryStore((s) => s.sessions);
  const weeklyXP = computeWeeklyXP(sessions);
  const tinyStartRate = useHistoryStore((s) => s.getCompletionRate('tiny-start'));
  const deepWorkRate = useHistoryStore((s) => s.getCompletionRate('hyper'));
  const petName = usePetStore((s) => s.petName);

  // Real data only
  const hasData = sessions.length > 0;
  const maxXP = Math.max(...weeklyXP, 1);

  // Real analytics
  const observations = getObservations(sessions);
  const archivistNote = getArchivistNote(sessions);

  return (
    <PaperLayer>
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
        {/* ── MASTHEAD ───────────────────────────── */}
        <View style={styles.masthead}>
          <View>
            <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>
              FIELD JOURNAL · ENTRY {String(Date.now()).slice(-4)}
            </Text>
            <Text style={[v2Text.field, { color: v2Colors.ink, marginTop: 4 }]}>
              THE ATTENTION ARCHIVE
            </Text>
          </View>
          <Pressable onPress={() => router.back()}>
            <Text style={[v2Text.serial, { color: v2Colors.coral }]}>
              ← Home
            </Text>
          </Pressable>
        </View>
        <RuledDivider variant="double" color={v2Colors.ink} style={{ marginTop: 8 }} />

        {/* ── HERO TITLE ─────────────────────────── */}
        <View style={styles.hero}>
          <Text
            // @ts-ignore
            className={Platform.OS === 'web' ? 'v2-wonk' : undefined}
            style={[v2Text.heroSerif, { color: v2Colors.ink }]}
          >
            Records
          </Text>
          <Text
            // @ts-ignore
            className={Platform.OS === 'web' ? 'v2-soft' : undefined}
            style={[
              v2Text.heroSerif,
              {
                color: v2Colors.moss,
                fontStyle: 'italic',
                fontWeight: '300',
              },
            ]}
          >
            & Remarks
          </Text>
          <Text style={[v2Text.bodySmall, styles.tagline]}>
            What the week left on the page. Compiled by{' '}
            <Text style={{ fontStyle: 'italic', color: v2Colors.ink }}>
              {petName || 'Bestie'}
            </Text>
            , your resident archivist.
          </Text>
        </View>

        {/* ── HORIZONTAL CHART (THE "DIAL") ──────── */}
        <FieldLabel index="N°01" style={{ marginTop: v2Space.xl }}>
          Weekly cadence
        </FieldLabel>

        <IndexCard
          style={styles.chartCard}
          tint={v2Colors.paperBright}
          accent={v2Colors.coral}
          serial="WK-07"
        >
          <View style={styles.chartRow}>
            {/* Y-axis notes */}
            <View style={styles.yAxis}>
              <Text style={[v2Text.serial, styles.axisLabel]}>MAX</Text>
              <Text style={[v2Text.serial, styles.axisLabel]}>MED</Text>
              <Text style={[v2Text.serial, styles.axisLabel]}>—</Text>
            </View>

            {/* Bars */}
            <View style={styles.barsGrid}>
              {weeklyXP.map((val, i) => {
                const ratio = val / maxXP;
                const isMax = val === maxXP;
                return (
                  <View key={i} style={styles.barColumn}>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${Math.max(ratio * 100, 4)}%`,
                            backgroundColor: isMax
                              ? v2Colors.coral
                              : v2Colors.ink,
                          },
                        ]}
                      />
                      {isMax && (
                        <Text style={styles.barStar}>✦</Text>
                      )}
                    </View>
                    <Text
                      style={[
                        v2Text.serial,
                        {
                          color: isMax ? v2Colors.coral : v2Colors.inkMuted,
                          marginTop: 6,
                          textAlign: 'center',
                          fontWeight: isMax ? '700' : '500',
                        },
                      ]}
                    >
                      {DAY_LABELS[i]}
                    </Text>
                    <Text
                      style={[
                        v2Text.serial,
                        {
                          color: v2Colors.stamp,
                          fontSize: 8,
                          marginTop: 2,
                          textAlign: 'center',
                        },
                      ]}
                    >
                      {val}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <RuledDivider variant="dotted" style={{ marginTop: v2Space.md }} />
          <View style={styles.chartFoot}>
            <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>
              7 DAYS · XP PER DAY
            </Text>
            <Text style={[v2Text.serial, { color: v2Colors.moss }]}>
              TOTAL: {weeklyXP.reduce((a, b) => a + b, 0)} XP
            </Text>
          </View>
        </IndexCard>

        {/* ── RATES — TWO SMALL CARDS ────────────── */}
        <FieldLabel index="N°02" style={{ marginTop: v2Space.xl }}>
          Completion dispatches
        </FieldLabel>
        <View style={styles.rateGrid}>
          <IndexCard
            style={styles.rateCard}
            tint={v2Colors.amberWash}
            accent={v2Colors.amber}
            serial="RX·TINY"
          >
            <Text style={[v2Text.serial, { color: v2Colors.amberInk }]}>
              TINY STARTS
            </Text>
            <Text
              // @ts-ignore
              className={Platform.OS === 'web' ? 'v2-tabular' : undefined}
              style={[
                v2Text.heroSerif,
                {
                  color: v2Colors.amberInk,
                  fontSize: 64,
                  lineHeight: 64,
                  marginTop: 4,
                },
              ]}
            >
              {hasData ? tinyStartRate : '—'}
              <Text style={{ fontSize: 28, color: v2Colors.amber }}>%</Text>
            </Text>
            <Text
              style={[
                v2Text.bodySmall,
                { color: v2Colors.ink, marginTop: 8, fontStyle: 'italic' },
              ]}
            >
              The gentle art of beginning. Showing up is already most of it.
            </Text>
          </IndexCard>

          <IndexCard
            style={styles.rateCard}
            tint={v2Colors.mossWash}
            accent={v2Colors.moss}
            serial="RX·DEEP"
          >
            <Text style={[v2Text.serial, { color: v2Colors.mossInk }]}>
              DEEP WORK
            </Text>
            <Text
              // @ts-ignore
              className={Platform.OS === 'web' ? 'v2-tabular' : undefined}
              style={[
                v2Text.heroSerif,
                {
                  color: v2Colors.mossInk,
                  fontSize: 64,
                  lineHeight: 64,
                  marginTop: 4,
                },
              ]}
            >
              {hasData ? deepWorkRate : '—'}
              <Text style={{ fontSize: 28, color: v2Colors.moss }}>%</Text>
            </Text>
            <Text
              style={[
                v2Text.bodySmall,
                { color: v2Colors.ink, marginTop: 8, fontStyle: 'italic' },
              ]}
            >
              Long, held attention. The slow muscles build here.
            </Text>
          </IndexCard>
        </View>

        {/* ── INSIGHT LETTER ─────────────────────── */}
        <FieldLabel index="N°03" style={{ marginTop: v2Space.xl }}>
          A note from the archivist
        </FieldLabel>

        <View style={styles.letter}>
          <View style={styles.letterHead}>
            <Stamp
              label="OBSERVED"
              sub="BY BESTIE"
              color={v2Colors.coral}
              rotate={-6}
              size={78}
            />
            <View style={{ flex: 1, marginLeft: v2Space.md }}>
              <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>
                WEEK IN REVIEW · ENTRY {String(level).padStart(2, '0')}
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
                A pattern, softly noted.
              </Text>
            </View>
          </View>

          <RuledDivider variant="solid" color={v2Colors.ink} style={{ marginVertical: v2Space.md }} />

          <Text
            style={[
              v2Text.quote,
              { color: v2Colors.ink, fontStyle: 'italic' },
            ]}
          >
            <Text style={{ color: v2Colors.coral, fontSize: 38, lineHeight: 28 }}>"</Text>
            {archivistNote}
            <Text style={{ color: v2Colors.coral, fontSize: 38, lineHeight: 28 }}>"</Text>
          </Text>

          <View style={styles.letterFoot}>
            <View style={{ flex: 1, height: 1, backgroundColor: v2Colors.rule }} />
            <Text
              style={[
                v2Text.quote,
                {
                  color: v2Colors.ink,
                  fontSize: 22,
                  marginHorizontal: 10,
                },
              ]}
            >
              {petName || 'Bestie'}
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: v2Colors.rule }} />
          </View>
        </View>

        {/* ── INVENTORY OF OBSERVATIONS ──────────── */}
        <FieldLabel index="N°04" style={{ marginTop: v2Space.xl }}>
          Field observations
        </FieldLabel>

        <View style={styles.obsGrid}>
          {observations.length === 0 ? (
            <IndexCard
              style={styles.obsCard}
              tint={v2Colors.paperBright}
              serial="—"
            >
              <Text style={[v2Text.field, { color: v2Colors.stamp }]}>
                NOT ENOUGH DATA
              </Text>
              <Text
                style={[
                  v2Text.cardSerif,
                  { color: v2Colors.ink, marginTop: 6, fontStyle: 'italic' },
                ]}
              >
                Patterns are still forming.
              </Text>
              <Text
                style={[
                  v2Text.bodySmall,
                  { color: v2Colors.inkMuted, marginTop: 8 },
                ]}
              >
                Complete a few more sessions and real observations will appear here.
              </Text>
            </IndexCard>
          ) : (
            observations.map((o, i) => (
              <IndexCard
                key={o.id}
                style={styles.obsCard}
                tint={v2Colors.paperBright}
                serial={`OBS-${String(i + 1).padStart(2, '0')}`}
              >
                <Text style={[v2Text.field, { color: OBS_COLOR[o.color] }]}>
                  {o.title}
                </Text>
                <Text
                  style={[
                    v2Text.cardSerif,
                    { color: v2Colors.ink, marginTop: 6, fontStyle: 'italic' },
                  ]}
                >
                  {o.subtitle}
                </Text>
                <Text
                  style={[
                    v2Text.bodySmall,
                    { color: v2Colors.inkMuted, marginTop: 8 },
                  ]}
                >
                  {o.description}
                </Text>
              </IndexCard>
            ))
          )}
        </View>

        {/* ── FOOTER ─────────────────────────────── */}
        <View style={styles.foot}>
          <RuledDivider variant="dotted" color={v2Colors.stamp} />
          <Asterism
            char="✦ ※ ✦"
            color={v2Colors.stamp}
            size={11}
            style={{ marginTop: 10 }}
          />
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
            Compiled under gentle scrutiny · For the record
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
  hero: {
    marginTop: v2Space.md,
    marginBottom: v2Space.lg,
  },
  tagline: {
    color: v2Colors.inkSoft,
    marginTop: v2Space.md,
    maxWidth: 480,
  },

  chartCard: {
    shadowColor: v2Colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  chartRow: {
    flexDirection: 'row',
    gap: v2Space.md,
    alignItems: 'stretch',
  },
  yAxis: {
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  axisLabel: {
    color: v2Colors.stamp,
    textAlign: 'right',
  },
  barsGrid: {
    flex: 1,
    flexDirection: 'row',
    gap: v2Space.sm,
  },
  barColumn: {
    flex: 1,
    alignItems: 'stretch',
  },
  barTrack: {
    height: 160,
    borderBottomWidth: 1,
    borderColor: v2Colors.rule,
    borderStyle: 'dotted',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  barFill: {
    width: '100%',
  },
  barStar: {
    position: 'absolute',
    top: -18,
    alignSelf: 'center',
    color: v2Colors.coral,
    fontSize: 14,
  },
  chartFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: v2Space.sm,
  },

  rateGrid: {
    flexDirection: 'row',
    gap: v2Space.md,
    flexWrap: 'wrap',
  },
  rateCard: {
    flex: 1,
    minWidth: 220,
    shadowColor: v2Colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },

  letter: {
    backgroundColor: v2Colors.paperBright,
    padding: v2Space.lg,
    borderWidth: 1,
    borderColor: v2Colors.ink,
    shadowColor: v2Colors.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  letterHead: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  letterFoot: {
    marginTop: v2Space.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },

  obsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: v2Space.md,
  },
  obsCard: {
    flex: 1,
    minWidth: 200,
  },

  foot: {
    marginTop: v2Space.xxl,
  },
});

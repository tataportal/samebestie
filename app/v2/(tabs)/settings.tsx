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
import { PaperLayer } from '../../../src/components/v2/PaperLayer';
import {
  RuledDivider,
  FieldLabel,
  IndexCard,
  Stamp,
  Asterism,
} from '../../../src/components/v2/Primitives';
import { PetGlyph } from '../../../src/components/v2/PetGlyph';
import { useUserStore } from '../../../src/store/useUserStore';
import { usePetStore } from '../../../src/store/usePetStore';
import { useSettingsStore } from '../../../src/store/useSettingsStore';
import {
  getLevelFromXP,
  getRankFromLevel,
} from '../../../src/utils/levelSystem';
import { v2Colors, v2Text, v2Space } from '../../../src/theme/v2';

interface ToggleRowProps {
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
}

function ToggleRow({ label, description, value, onToggle }: ToggleRowProps) {
  return (
    <Pressable onPress={onToggle} style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text
          style={[
            v2Text.cardSerif,
            { color: v2Colors.ink, fontStyle: 'italic' },
          ]}
        >
          {label}
        </Text>
        <Text
          style={[
            v2Text.bodySmall,
            { color: v2Colors.inkMuted, marginTop: 2 },
          ]}
        >
          {description}
        </Text>
      </View>

      {/* Flip-card toggle — ON face / OFF face */}
      <View
        style={[
          styles.toggle,
          {
            backgroundColor: value ? v2Colors.ink : v2Colors.paperBright,
            borderColor: v2Colors.ink,
          },
        ]}
      >
        <Text
          style={[
            v2Text.serial,
            {
              color: value ? v2Colors.paperBright : v2Colors.inkMuted,
              letterSpacing: 1.5,
            },
          ]}
        >
          {value ? 'ON' : 'OFF'}
        </Text>
      </View>
    </Pressable>
  );
}

export default function V2Settings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const totalXP = useUserStore((s) => s.totalXP);
  const level = getLevelFromXP(totalXP);
  const rank = getRankFromLevel(level);
  const petName = usePetStore((s) => s.petName);
  const personality = usePetStore((s) => s.personality);
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
              MEMBERS' ROOM · CARD {String(level).padStart(3, '0')}
            </Text>
            <Text style={[v2Text.field, { color: v2Colors.ink, marginTop: 4 }]}>
              YOUR STANDING
            </Text>
          </View>
        </View>
        <RuledDivider variant="double" color={v2Colors.ink} style={{ marginTop: 8 }} />

        {/* ── HERO ───────────────────────────────── */}
        <View style={styles.hero}>
          <Text
            // @ts-ignore
            className={Platform.OS === 'web' ? 'v2-wonk' : undefined}
            style={[v2Text.heroSerif, { color: v2Colors.ink }]}
          >
            Gear &
          </Text>
          <Text
            // @ts-ignore
            className={Platform.OS === 'web' ? 'v2-soft' : undefined}
            style={[
              v2Text.heroSerif,
              {
                color: v2Colors.sky,
                fontStyle: 'italic',
                fontWeight: '300',
              },
            ]}
          >
            provisions.
          </Text>
        </View>

        {/* ── PERSONAL FILE — same format as onboarding ─── */}
        <IndexCard
          style={styles.memberCard}
          tint={v2Colors.paperBright}
          accent={v2Colors.coral}
        >
          <Text style={[v2Text.field, { color: v2Colors.stamp, marginBottom: v2Space.sm }]}>
            PERSONAL FILE
          </Text>

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
                source={require('../../../assets/images/penguin-avatar.png')}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            </View>
          </View>

          <RuledDivider variant="dotted" style={{ marginVertical: 8 }} />
          <View style={styles.signRow}>
            <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>NAME</Text>
            <Text style={[v2Text.cardSerif, { color: v2Colors.ink, fontStyle: 'italic' }]}>
              {petName || 'Bestie'}
            </Text>
          </View>
          <RuledDivider variant="dotted" style={{ marginVertical: 8 }} />
          <View style={styles.signRow}>
            <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>SPECIES</Text>
            <Text style={[v2Text.cardSerif, { color: v2Colors.ink, fontStyle: 'italic' }]}>
              Penguin
            </Text>
          </View>
          <RuledDivider variant="dotted" style={{ marginVertical: 8 }} />
          <View style={styles.signRow}>
            <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>TEMPERAMENT</Text>
            <Text style={[v2Text.cardSerif, { color: v2Colors.coral, fontStyle: 'italic' }]}>
              {personality.charAt(0).toUpperCase() + personality.slice(1)}
            </Text>
          </View>
          <RuledDivider variant="dotted" style={{ marginVertical: 8 }} />
          <View style={styles.signRow}>
            <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>LEVEL</Text>
            <Text style={[v2Text.cardSerif, { color: v2Colors.ink, fontStyle: 'italic' }]}>
              {level}
            </Text>
          </View>
          <RuledDivider variant="dotted" style={{ marginVertical: 8 }} />
          <View style={styles.signRow}>
            <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>RANK</Text>
            <Text style={[v2Text.cardSerif, { color: v2Colors.moss, fontStyle: 'italic' }]}>
              {rank}
            </Text>
          </View>
          <RuledDivider variant="dotted" style={{ marginVertical: 8 }} />
          <View style={styles.signRow}>
            <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>TOTAL XP</Text>
            <Text style={[v2Text.cardSerif, { color: v2Colors.ink, fontStyle: 'italic' }]}>
              {totalXP.toLocaleString()}
            </Text>
          </View>
        </IndexCard>

        {/* Share button */}
        <Pressable
          onPress={async () => {
            const text = `📚 ${petName || 'Bestie'} · Lv ${level} · ${rank} · ${totalXP} XP on @samebestie`;
            if (Platform.OS === 'web') {
              if (navigator.share) {
                navigator.share({ text, url: window.location.origin });
              } else {
                await navigator.clipboard.writeText(text);
                alert('Copied! Paste in your Instagram story.');
              }
            }
          }}
          style={styles.shareBtn}
        >
          <Text style={{ fontSize: 16 }}>📸</Text>
          <Text style={[v2Text.serial, { color: v2Colors.ink, fontWeight: '700' }]}>
            SHARE TO INSTAGRAM
          </Text>
        </Pressable>

        {/* ── PREFERENCES ────────────────────────── */}
        <FieldLabel index="N°01" style={{ marginTop: v2Space.xl }}>
          House rules
        </FieldLabel>

        <View style={styles.prefCard}>
          <ToggleRow
            label="Notifications"
            description="Gentle reminders and bestie-side notes."
            value={notificationsEnabled}
            onToggle={toggleNotifications}
          />
          <RuledDivider variant="dotted" style={{ marginVertical: v2Space.sm }} />
          <ToggleRow
            label="Usage monitoring"
            description="Let bestie observe your day, in private."
            value={usageMonitoringEnabled}
            onToggle={toggleUsageMonitoring}
          />
          <RuledDivider variant="dotted" style={{ marginVertical: v2Space.sm }} />
          <ToggleRow
            label="Sound effects"
            description="Ticks, chimes, the small announcements."
            value={soundEnabled}
            onToggle={toggleSound}
          />
          <RuledDivider variant="dotted" style={{ marginVertical: v2Space.sm }} />
          <ToggleRow
            label="Haptic feedback"
            description="A soft tap when things happen."
            value={hapticEnabled}
            onToggle={toggleHaptic}
          />
        </View>

        {/* ── APP INFO ─────────────────────────── */}
        <View style={{ marginTop: v2Space.xl, alignItems: 'center' }}>
          <Text style={[v2Text.serial, { color: v2Colors.stamp }]}>
            Same, Bestie · v2.0
          </Text>
        </View>
      </ScrollView>
    </PaperLayer>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { paddingHorizontal: v2Space.lg },
  masthead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  hero: {
    marginTop: v2Space.md,
    marginBottom: v2Space.lg,
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
  shareBtn: {
    marginTop: v2Space.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: v2Colors.coralWash,
    borderWidth: 1.5,
    borderColor: v2Colors.ink,
    borderRadius: 4,
    paddingVertical: v2Space.md,
    shadowColor: v2Colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  memberCard: {
    shadowColor: v2Colors.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: v2Space.md,
  },
  memberStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberStat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statDiv: {
    width: 1,
    height: 36,
    backgroundColor: v2Colors.rule,
  },

  prefCard: {
    backgroundColor: v2Colors.paperBright,
    padding: v2Space.lg,
    borderWidth: 1,
    borderColor: v2Colors.ink,
    shadowColor: v2Colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: v2Space.sm,
    gap: v2Space.md,
  },
  toggle: {
    minWidth: 58,
    height: 28,
    borderWidth: 1.5,
    borderRadius: 2,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  colophon: {
    shadowColor: v2Colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  coloRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dots: {
    flex: 1,
    borderBottomWidth: 1,
    borderStyle: 'dotted',
    borderColor: v2Colors.rule,
    marginBottom: 4,
  },

  sideBtn: {
    flex: 1,
    paddingVertical: v2Space.md,
    paddingHorizontal: v2Space.md,
    borderWidth: 1,
    borderColor: v2Colors.ink,
    backgroundColor: v2Colors.paperBright,
    borderRadius: 2,
  },

  foot: {
    marginTop: v2Space.xl,
    alignItems: 'center',
  },
});

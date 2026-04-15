import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useAmbientStore } from '../store/useAmbientStore';
import { colors, spacing, textStyles } from '../theme';

const VOLUME_STEPS = 5;

interface AmbientMixerProps {
  onClose: () => void;
}

export const AmbientMixer: React.FC<AmbientMixerProps> = ({ onClose }) => {
  const tracks = useAmbientStore((s) => s.tracks);
  const toggleTrack = useAmbientStore((s) => s.toggleTrack);
  const setVolume = useAmbientStore((s) => s.setVolume);

  const anyActive = tracks.some((t) => t.active);

  return (
    <View style={styles.container}>
      <View style={styles.handle} />

      <View style={styles.header}>
        <Text style={styles.title}>AMBIENT SOUNDS</Text>
        <Text style={styles.subtitle}>Layers over your music</Text>
      </View>

      <View style={styles.grid}>
        {tracks.map((track) => {
          const filledSteps = Math.round(track.volume * VOLUME_STEPS);
          return (
            <Pressable
              key={track.id}
              onPress={() => toggleTrack(track.id)}
              style={[styles.card, track.active && styles.cardActive]}
            >
              <Text style={styles.emoji}>{track.emoji}</Text>
              <Text style={[styles.label, track.active && styles.labelActive]}>
                {track.label}
              </Text>

              {/* Volume bar — only shown when active */}
              {track.active && (
                <View style={styles.volRow}>
                  {Array.from({ length: VOLUME_STEPS }).map((_, i) => (
                    <Pressable
                      key={i}
                      onPress={(e) => {
                        e.stopPropagation?.();
                        setVolume(track.id, (i + 1) / VOLUME_STEPS);
                      }}
                      style={[
                        styles.volSeg,
                        i < filledSteps && styles.volSegFilled,
                      ]}
                    />
                  ))}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {anyActive && (
        <Pressable
          onPress={() => {
            useAmbientStore.getState().stopAll();
          }}
          style={styles.stopBtn}
        >
          <Text style={styles.stopText}>STOP ALL</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...textStyles.sectionTitle,
    color: colors.onSurface,
    letterSpacing: 2,
  },
  subtitle: {
    ...textStyles.bodySmall,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  card: {
    width: '47%',
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardActive: {
    backgroundColor: 'rgba(183,159,255,0.12)',
    borderColor: 'rgba(183,159,255,0.5)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 6,
  },
  emoji: {
    fontSize: 28,
  },
  label: {
    ...textStyles.labelTiny,
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
  },
  labelActive: {
    color: colors.primary,
  },
  volRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: spacing.xs,
  },
  volSeg: {
    width: 18,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  volSegFilled: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  stopBtn: {
    marginTop: spacing.lg,
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,135,150,0.4)',
    backgroundColor: 'rgba(255,135,150,0.08)',
  },
  stopText: {
    ...textStyles.labelSmall,
    color: colors.tertiary,
    letterSpacing: 2,
  },
});

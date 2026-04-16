import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { v2Colors, v2Text } from '../../theme/v2';
import { PetAnimal } from '../../types';

// Real profile image — extracted from the penguin video
const PROFILE_IMG = require('../../../assets/images/penguin-avatar.png');

// Emojis for ALL species (used when useImage=false)
const EMOJI: Record<PetAnimal, string> = {
  penguin: '🐧',
  cat: '🐱',
  fox: '🦊',
  frog: '🐸',
  panda: '🐼',
};

/**
 * Pet portrait framed as a library catalog thumbnail.
 *
 * Two modes:
 *  - useImage=false (default): emoji glyph — for initial screens, home, onboarding
 *  - useImage=true: real penguin profile pic — for settings, species selector, summary
 */
export function PetGlyph({
  animal = 'penguin',
  size = 200,
  label,
  serial,
  useImage = false,
}: {
  animal?: PetAnimal;
  size?: number;
  label?: string;
  serial?: string;
  useImage?: boolean;
}) {
  const showRealImage = useImage && animal === 'penguin';

  return (
    <View style={[styles.frame, { width: size, height: size }]}>
      {showRealImage ? (
        <Image
          source={PROFILE_IMG}
          style={[StyleSheet.absoluteFill, { borderRadius: 2 }]}
          resizeMode="cover"
        />
      ) : (
        <>
          <View
            style={[
              styles.innerRing,
              { width: size - 18, height: size - 18 },
            ]}
          />
          <Text style={[styles.emoji, { fontSize: size * 0.5 }]}>
            {EMOJI[animal]}
          </Text>
        </>
      )}

      {/* corner marks */}
      <Text
        style={[
          styles.cornerMark,
          { top: 8, left: 10 },
          showRealImage && styles.cornerMarkLight,
        ]}
      >
        §
      </Text>
      <Text
        style={[
          styles.cornerMark,
          { top: 8, right: 10 },
          showRealImage && styles.cornerMarkLight,
        ]}
      >
        §
      </Text>
      {!showRealImage && (
        <>
          <Text style={[styles.cornerMark, { bottom: 28, left: 10 }]}>§</Text>
          <Text style={[styles.cornerMark, { bottom: 28, right: 10 }]}>§</Text>
        </>
      )}

      {/* bottom serial band */}
      {(label || serial) && (
        <View style={[styles.band, showRealImage && styles.bandOverImage]}>
          {label && (
            <Text style={[v2Text.field, { color: v2Colors.paperBright, fontSize: 9 }]}>
              {label}
            </Text>
          )}
          {serial && (
            <Text style={[v2Text.serial, { color: v2Colors.paperBright, opacity: 0.7 }]}>
              {serial}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderWidth: 1.5,
    borderColor: v2Colors.ink,
    backgroundColor: v2Colors.paperBright,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: v2Colors.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  innerRing: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: v2Colors.rule,
    borderStyle: 'dashed',
    borderRadius: 999,
    top: 9,
    left: 9,
  },
  emoji: {
    textAlign: 'center',
  },
  cornerMark: {
    position: 'absolute',
    color: v2Colors.stamp,
    fontSize: 12,
    fontFamily: 'Fraunces, "Hoefler Text", Garamond, Georgia, serif',
  },
  cornerMarkLight: {
    color: 'rgba(255,255,255,0.55)',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  band: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: v2Colors.ink,
    paddingVertical: 4,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bandOverImage: {
    backgroundColor: 'rgba(20,32,58,0.82)',
  },
});

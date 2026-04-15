import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { v2Colors, v2Text } from '../../theme/v2';
import { PetAnimal } from '../../types';

const EMOJI: Record<PetAnimal, string> = {
  penguin: '🐧',
  cat: '🐱',
  fox: '🦊',
  frog: '🐸',
  panda: '🐼',
};

/**
 * Pet glyph framed as a library catalog thumbnail — emoji centered over
 * a cream wash, ringed in ink with serial/class marks. Replaces the dark
 * penguin sprite in V2.
 */
export function PetGlyph({
  animal = 'penguin',
  size = 200,
  label,
  serial,
}: {
  animal?: PetAnimal;
  size?: number;
  label?: string;
  serial?: string;
}) {
  return (
    <View style={[styles.frame, { width: size, height: size }]}>
      <View
        style={[
          styles.innerRing,
          { width: size - 18, height: size - 18 },
        ]}
      />
      <Text style={[styles.emoji, { fontSize: size * 0.5 }]}>
        {EMOJI[animal]}
      </Text>

      {/* corner marks */}
      <Text style={[styles.cornerMark, { top: 10, left: 12 }]}>§</Text>
      <Text style={[styles.cornerMark, { top: 10, right: 12 }]}>§</Text>
      <Text style={[styles.cornerMark, { bottom: 10, left: 12 }]}>§</Text>
      <Text style={[styles.cornerMark, { bottom: 10, right: 12 }]}>§</Text>

      {/* bottom serial band */}
      {(label || serial) && (
        <View style={styles.band}>
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
    fontFamily:
      'Fraunces, "Hoefler Text", Garamond, Georgia, serif',
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
});

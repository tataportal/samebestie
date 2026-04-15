import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { textStyles } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface DialogueBubbleProps {
  text: string;
  position?: 'top' | 'bottom';
  compact?: boolean;
}

export const DialogueBubble: React.FC<DialogueBubbleProps> = ({
  text,
  position = 'bottom',
  compact = false,
}) => {
  return (
    <View style={styles.wrapper}>
      {/* Tail pointing UP when bubble is below the pet */}
      {position === 'top' && (
        <View style={styles.tailUp} />
      )}

      <View style={[styles.bubble, compact && styles.bubbleCompact]}>
        <Text
          style={[styles.text, compact && styles.textCompact]}
          numberOfLines={compact ? 2 : undefined}
        >
          {text}
        </Text>
      </View>

      {/* Tail pointing DOWN when bubble is above something */}
      {position === 'bottom' && (
        <View style={styles.tailDown} />
      )}
    </View>
  );
};

const TAIL_SIZE = 10;
const BUBBLE_BG = colors.surfaceContainerHigh;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'flex-start',
  },
  bubble: {
    backgroundColor: BUBBLE_BG,
    borderWidth: 1.5,
    borderColor: 'rgba(183,159,255,0.35)',
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  bubbleCompact: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  text: {
    ...textStyles.bodyMedium,
    color: colors.onSurface,
    lineHeight: 20,
  },
  textCompact: {
    ...textStyles.bodySmall,
    color: colors.onSurface,
  },
  // Triangle pointing up (sits ABOVE the bubble)
  tailUp: {
    marginLeft: 20,
    width: 0,
    height: 0,
    borderLeftWidth: TAIL_SIZE,
    borderRightWidth: TAIL_SIZE,
    borderBottomWidth: TAIL_SIZE + 2,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(183,159,255,0.35)',
  },
  // Triangle pointing down (sits BELOW the bubble)
  tailDown: {
    marginLeft: 20,
    width: 0,
    height: 0,
    borderLeftWidth: TAIL_SIZE,
    borderRightWidth: TAIL_SIZE,
    borderTopWidth: TAIL_SIZE + 2,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(183,159,255,0.35)',
  },
});

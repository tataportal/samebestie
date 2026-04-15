import React, { useRef } from 'react';
import { Animated, Pressable, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { textStyles } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface EmotionTagProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

export const EmotionTag: React.FC<EmotionTagProps> = ({
  label,
  isSelected,
  onPress,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 2,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 2,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.tag,
          isSelected ? styles.tagSelected : styles.tagUnselected,
          { transform: [{ translateX }, { translateY }] },
        ]}
      >
        <Text
          style={[
            styles.label,
            {
              color: isSelected ? colors.onPrimary : colors.onSurfaceVariant,
            },
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
  },
  tagSelected: {
    backgroundColor: colors.primary,
  },
  tagUnselected: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  label: {
    ...textStyles.buttonMedium,
  },
});

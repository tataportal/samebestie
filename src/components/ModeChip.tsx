import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { textStyles } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface ModeChipProps {
  label: string;
  icon: string;
  isActive: boolean;
  onPress: () => void;
}

export const ModeChip: React.FC<ModeChipProps> = ({
  label,
  icon,
  isActive,
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
          styles.chip,
          isActive ? styles.chipActive : styles.chipInactive,
          { transform: [{ translateX }, { translateY }] },
        ]}
      >
        <MaterialIcons
          name={icon as keyof typeof MaterialIcons.glyphMap}
          size={18}
          color={isActive ? colors.onPrimary : colors.onSurfaceVariant}
          style={styles.icon}
        />
        <Text
          style={[
            styles.label,
            { color: isActive ? colors.onPrimary : colors.onSurfaceVariant },
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
  },
  chipActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  chipInactive: {
    backgroundColor: colors.surfaceContainerHighest,
  },
  icon: {
    marginRight: spacing.sm,
  },
  label: {
    ...textStyles.buttonMedium,
  },
});

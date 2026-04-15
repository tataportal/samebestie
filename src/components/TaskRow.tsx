import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { textStyles } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface TaskRowProps {
  label: string;
  icon: string;
  isSelected: boolean;
  onPress: () => void;
  accentColor: string;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  label,
  icon,
  isSelected,
  onPress,
  accentColor,
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
          styles.row,
          isSelected ? styles.rowSelected : styles.rowUnselected,
          isSelected && { borderLeftColor: colors.secondary },
          { transform: [{ translateX }, { translateY }] },
        ]}
      >
        <View style={styles.left}>
          <MaterialIcons
            name={icon as keyof typeof MaterialIcons.glyphMap}
            size={24}
            color={isSelected ? accentColor : colors.onSurfaceVariant}
            style={styles.icon}
          />
          <Text
            style={[
              styles.label,
              {
                color: isSelected ? colors.onSurface : colors.onSurfaceVariant,
              },
            ]}
          >
            {label}
          </Text>
        </View>
        <MaterialIcons
          name={isSelected ? 'check' : 'chevron-right'}
          size={24}
          color={isSelected ? colors.secondary : colors.onSurfaceVariant}
        />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: 12,
  },
  rowSelected: {
    backgroundColor: colors.surfaceContainerHighest,
    borderLeftWidth: 4,
  },
  rowUnselected: {
    backgroundColor: colors.surfaceContainerLow,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: spacing.md,
  },
  label: {
    ...textStyles.bodyLarge,
  },
});

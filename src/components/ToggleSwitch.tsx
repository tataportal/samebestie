import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { textStyles } from '../theme/typography';
import { spacing, heights } from '../theme/spacing';

interface ToggleSwitchProps {
  value: boolean;
  onToggle: () => void;
  label: string;
  sublabel: string;
  icon: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  value,
  onToggle,
  label,
  sublabel,
  icon,
}) => {
  const knobPosition = useRef(new Animated.Value(value ? 28 : 4)).current;

  useEffect(() => {
    Animated.spring(knobPosition, {
      toValue: value ? 28 : 4,
      friction: 5,
      tension: 200,
      useNativeDriver: true,
    }).start();
  }, [value, knobPosition]);

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <MaterialIcons
          name={icon as keyof typeof MaterialIcons.glyphMap}
          size={22}
          color={value ? colors.secondary : colors.onSurfaceVariant}
          style={styles.icon}
        />
        <View style={styles.labels}>
          <Text style={[styles.label, value && { color: colors.onSurface }]}>{label}</Text>
          <Text style={styles.sublabel}>{sublabel}</Text>
        </View>
      </View>
      <Pressable onPress={onToggle}>
        <View
          style={[
            styles.track,
            { backgroundColor: value ? colors.secondary : colors.surfaceContainerHighest },
            value && {
              shadowColor: colors.secondary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.7,
              shadowRadius: 8,
              elevation: 5,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.knob,
              {
                backgroundColor: value ? colors.onSecondary : colors.onSurfaceVariant,
                transform: [{ translateX: knobPosition }],
              },
            ]}
          />
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: spacing.md,
  },
  labels: {
    flex: 1,
  },
  label: {
    ...textStyles.bodyLarge,
    color: colors.onSurface,
  },
  sublabel: {
    ...textStyles.bodySmall,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  track: {
    width: 48,
    height: heights.toggle,
    borderRadius: 999,
    justifyContent: 'center',
  },
  knob: {
    width: 16,
    height: 16,
    borderRadius: 999,
  },
});

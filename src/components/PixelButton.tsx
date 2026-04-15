import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { textStyles } from '../theme/typography';
import { heights } from '../theme/spacing';
import { useSettingsStore } from '../store/useSettingsStore';

interface PixelButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary';
  icon?: string;
  disabled?: boolean;
}

const variantStyles = {
  primary:   { bg: colors.primary,   text: colors.onPrimary },
  secondary: { bg: colors.secondary, text: colors.onSecondary },
  tertiary:  { bg: colors.tertiary,  text: colors.onTertiary },
};

export const PixelButton: React.FC<PixelButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
}) => {
  const hapticEnabled = useSettingsStore((s) => s.hapticEnabled);
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Animated.parallel([
      Animated.timing(translateX, { toValue: 2, duration: 70, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 2, duration: 70, useNativeDriver: true }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(translateX, { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const vs = variantStyles[variant];

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.button,
          {
            backgroundColor: vs.bg,
            opacity: disabled ? 0.5 : 1,
            transform: [{ translateX }, { translateY }],
            // Color-matched glow
            shadowColor: vs.bg,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.55,
            shadowRadius: 14,
            elevation: 8,
          },
        ]}
      >
        {icon && (
          <MaterialIcons
            name={icon as keyof typeof MaterialIcons.glyphMap}
            size={20}
            color={vs.text}
            style={styles.icon}
          />
        )}
        <Text style={[styles.label, { color: vs.text }]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: heights.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    borderRadius: 18,
  },
  label: {
    ...textStyles.buttonLarge,
  },
  icon: {
    marginRight: 6,
  },
});

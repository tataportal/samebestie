import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { padding } from '../theme/spacing';

interface RetroCardProps {
  children: React.ReactNode;
  accentColor?: string;
  variant?: 'default' | 'high' | 'low' | 'lowest';
  style?: StyleProp<ViewStyle>;
}

const variantBg: Record<string, string> = {
  default:  colors.surfaceContainer,
  high:     colors.surfaceContainerHigh,
  low:      colors.surfaceContainerLow,
  lowest:   colors.surfaceContainerLowest,
};

export const RetroCard: React.FC<RetroCardProps> = ({
  children,
  accentColor,
  variant = 'default',
  style,
}) => {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: variantBg[variant] ?? variantBg.default },
        accentColor
          ? {
              borderWidth: 1,
              borderColor: accentColor + '50',
              shadowColor: accentColor,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.28,
              shadowRadius: 12,
              elevation: 5,
            }
          : styles.cardBorder,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: padding.card,
    borderRadius: 16,
  },
  cardBorder: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
});

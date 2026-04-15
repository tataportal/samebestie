import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface XPBarProps {
  filled: number;
  total: number;
  color?: 'primary' | 'secondary' | 'tertiary';
  height?: number;
}

const colorMap = {
  primary:   colors.primary,
  secondary: colors.secondary,
  tertiary:  colors.tertiary,
};

export const XPBar: React.FC<XPBarProps> = ({
  filled,
  total,
  color = 'primary',
  height = 10,
}) => {
  const fillColor = colorMap[color] ?? colors.primary;

  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => {
        const isFilled = index < filled;
        return (
          <View
            key={index}
            style={[
              {
                flex: 1,
                height,
                borderRadius: height / 2,
                backgroundColor: isFilled ? fillColor : colors.surfaceContainerHighest,
                marginRight: index < total - 1 ? 3 : 0,
              },
              isFilled && {
                shadowColor: fillColor,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.95,
                shadowRadius: 7,
                elevation: 5,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

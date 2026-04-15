import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { textStyles } from '../theme/typography';
import { spacing, heights } from '../theme/spacing';

interface StatBlockProps {
  label: string;
  value: string;
  unit?: string;
  accentColor: string;
  icon?: string;
}

export const StatBlock: React.FC<StatBlockProps> = ({
  label,
  value,
  unit,
  accentColor,
  icon,
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          borderLeftColor: accentColor,
          shadowColor: accentColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.35,
          shadowRadius: 10,
          elevation: 5,
        },
      ]}
    >
      {icon && (
        <MaterialIcons
          name={icon as keyof typeof MaterialIcons.glyphMap}
          size={18}
          color={accentColor}
          style={styles.icon}
        />
      )}
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 3,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    paddingVertical: spacing.sm + 2,
    minHeight: heights.statBlock,
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerHigh,
  },
  icon: {
    marginBottom: spacing.xs,
  },
  label: {
    ...textStyles.labelTiny,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
    fontSize: 9,
    letterSpacing: 1,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    ...textStyles.statLarge,
  },
  unit: {
    ...textStyles.bodySmall,
    color: colors.onSurfaceVariant,
    marginLeft: spacing.xs,
  },
});

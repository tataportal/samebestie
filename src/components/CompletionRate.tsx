import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { textStyles } from '../theme/typography';
import { spacing, padding } from '../theme/spacing';
import { XPBar } from './XPBar';

interface CompletionRateProps {
  label: string;
  percentage: number;
  status: string;
  statusColor: string;
  description: string;
  icon: string;
}

export const CompletionRate: React.FC<CompletionRateProps> = ({
  label,
  percentage,
  status,
  statusColor,
  description,
  icon,
}) => {
  const filledSegments = Math.round((percentage / 100) * 10);

  return (
    <View
      style={[
        styles.card,
        {
          borderLeftColor: statusColor,
          shadowColor: statusColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
          elevation: 4,
        },
      ]}
    >
      <View style={styles.header}>
        <MaterialIcons
          name={icon as keyof typeof MaterialIcons.glyphMap}
          size={20}
          color={statusColor}
          style={styles.icon}
        />
        <Text style={styles.label}>{label}</Text>
      </View>

      <Text style={[styles.percentage, { color: statusColor }]}>{percentage}%</Text>

      <View style={styles.xpBarContainer}>
        <XPBar filled={filledSegments} total={10} color="primary" height={10} />
      </View>

      <View
        style={[
          styles.statusTag,
          {
            backgroundColor: statusColor + '22',
            borderColor: statusColor + '60',
          },
        ]}
      >
        <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
      </View>

      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerHigh,
    padding: padding.card,
    borderRadius: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.06)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    borderLeftWidth: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  icon: {
    marginRight: spacing.sm,
  },
  label: {
    ...textStyles.labelSmall,
    color: colors.onSurface,
    letterSpacing: 1,
  },
  percentage: {
    ...textStyles.statLarge,
    marginBottom: spacing.sm,
  },
  xpBarContainer: {
    marginBottom: spacing.sm,
  },
  statusTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    marginBottom: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    ...textStyles.labelTiny,
    fontSize: 9,
    letterSpacing: 1,
  },
  description: {
    ...textStyles.bodySmall,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
  },
});

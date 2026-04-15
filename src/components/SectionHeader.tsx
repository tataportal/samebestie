import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { textStyles } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface SectionHeaderProps {
  title: string;
  color?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  color = colors.primary,
}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.bar, { backgroundColor: color }]} />
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bar: {
    width: 2,
    height: 24,
    marginRight: spacing.sm,
    borderRadius: 12,
  },
  title: {
    ...textStyles.sectionTitle,
    color: colors.onSurface,
  },
});

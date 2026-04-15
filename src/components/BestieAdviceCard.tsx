import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { textStyles } from '../theme/typography';
import { spacing, padding } from '../theme/spacing';
import { XPBar } from './XPBar';

interface BestieAdviceCardProps {
  title: string;
  body: string;
  xpAmount?: number;
  onAction?: () => void;
  actionLabel?: string;
}

export const BestieAdviceCard: React.FC<BestieAdviceCardProps> = ({
  title,
  body,
  xpAmount,
  onAction,
  actionLabel = 'TRY IT',
}) => {
  return (
    <View style={styles.card}>
      {/* BESTIE ADVICE badge */}
      <View style={styles.badge}>
        <MaterialIcons name="auto-awesome" size={10} color={colors.onTertiary} />
        <Text style={styles.badgeText}>BESTIE ADVICE</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <MaterialIcons name="lightbulb" size={20} color={colors.primary} />
          </View>
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text style={styles.body}>{body}</Text>

        {xpAmount != null && xpAmount > 0 && (
          <View style={styles.xpRow}>
            <Text style={styles.xpLabel}>+{xpAmount} XP</Text>
            <View style={styles.xpBar}>
              <XPBar filled={xpAmount} total={10} color="primary" height={6} />
            </View>
          </View>
        )}

        {onAction && (
          <Pressable onPress={onAction} style={styles.actionButton}>
            <Text style={styles.actionLabel}>{actionLabel}</Text>
            <MaterialIcons name="arrow-forward" size={14} color={colors.onPrimary} />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerHigh,
    padding: padding.card,
    borderRadius: 16,
    // Use individual borders so left (3px) always overrides the 1px sides
    borderTopWidth: 1,
    borderTopColor: 'rgba(183,159,255,0.18)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(183,159,255,0.18)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(183,159,255,0.18)',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    // Glow
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 5,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: colors.tertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: spacing.sm,
  },
  badgeText: {
    ...textStyles.labelTiny,
    color: colors.onTertiary,
    fontSize: 9,
    letterSpacing: 1,
  },
  content: {},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(183,159,255,0.15)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...textStyles.cardTitle,
    color: colors.onSurface,
    flex: 1,
  },
  body: {
    ...textStyles.bodyMedium,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  xpLabel: {
    ...textStyles.labelSmall,
    color: colors.primary,
  },
  xpBar: {
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    gap: spacing.xs,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  actionLabel: {
    ...textStyles.buttonMedium,
    color: colors.onPrimary,
  },
});

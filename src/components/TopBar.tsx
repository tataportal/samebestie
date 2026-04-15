import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { textStyles } from '../theme/typography';
import { heights, padding } from '../theme/spacing';

interface TopBarProps {
  rightContent?: React.ReactNode;
  onBack?: () => void;
  showBack?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  rightContent,
  onBack,
  showBack = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBack && onBack && (
          <Pressable onPress={onBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={22} color={colors.primary} />
          </Pressable>
        )}
        <Text style={styles.logo}>
          <Text style={styles.logoMain}>SAME</Text>
          <Text style={styles.logoComma}>,</Text>
          <Text style={styles.logoDim}> BESTIE</Text>
        </Text>
      </View>
      {rightContent && <View style={styles.right}>{rightContent}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: heights.topBar,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: padding.screen,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
    padding: 4,
  },
  logo: {},
  logoMain: {
    ...textStyles.cardTitle,
    color: colors.primary,
    letterSpacing: 2,
  },
  logoComma: {
    ...textStyles.cardTitle,
    color: colors.secondary,
    letterSpacing: 2,
  },
  logoDim: {
    ...textStyles.cardTitle,
    color: colors.onSurfaceVariant,
    letterSpacing: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

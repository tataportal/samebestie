import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

interface PixelBorderProps {
  children: React.ReactNode;
  color?: string;
  style?: ViewStyle;
}

export const PixelBorder: React.FC<PixelBorderProps> = ({
  children,
  color = colors.outlineVariant,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.borderTop, { backgroundColor: color }]} />
      <View style={[styles.borderRight, { backgroundColor: color }]} />
      <View style={[styles.borderBottom, { backgroundColor: color }]} />
      <View style={[styles.borderLeft, { backgroundColor: color }]} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 12,
  },
  borderTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 12,
  },
  borderRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 2,
    borderRadius: 12,
  },
  borderBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 12,
  },
  borderLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 2,
    borderRadius: 12,
  },
});

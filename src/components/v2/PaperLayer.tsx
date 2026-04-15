import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { v2Colors } from '../../theme/v2';

interface Props {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  grain?: boolean;
}

/**
 * Paper substrate for V2 screens. Applies cream background, soft radial tints,
 * and (on web) grain texture via CSS injected by V2WebFonts.
 */
export function PaperLayer({ children, style, grain = true }: Props) {
  const webClass =
    Platform.OS === 'web'
      ? `${grain ? 'v2-grain ' : ''}v2-paper-fade`
      : undefined;

  return (
    <View
      // @ts-ignore — className works on react-native-web
      className={webClass}
      style={[styles.paper, style as any]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  paper: {
    flex: 1,
    backgroundColor: v2Colors.paper,
    position: 'relative',
    overflow: 'hidden',
  },
});

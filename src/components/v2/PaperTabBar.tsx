import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { v2Colors, v2Text, v2Space } from '../../theme/v2';

export interface PaperTab {
  key: string;
  label: string;
  glyph: string; // single serif character / digit used as icon
  accent: string;
}

interface Props {
  tabs: PaperTab[];
  activeTab: string;
  onTabPress: (key: string) => void;
}

/**
 * The V2 tab bar styled as a newsprint footer strip — ink border,
 * serif glyph "icons", lettered labels like N°I · FOCUS.
 */
export function PaperTabBar({ tabs, activeTab, onTabPress }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: Math.max(insets.bottom, 8) + 6 },
      ]}
    >
      <View style={styles.rule} />
      <View style={styles.rowInner}>
        {tabs.map((t, i) => {
          const active = activeTab === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => onTabPress(t.key)}
              style={({ pressed }) => [
                styles.tab,
                pressed && { transform: [{ translateY: 1 }] },
              ]}
            >
              <View
                style={[
                  styles.glyphFrame,
                  active && { borderColor: t.accent, backgroundColor: t.accent },
                ]}
              >
                <Text
                  style={[
                    styles.glyphText,
                    {
                      color: active ? v2Colors.paperBright : v2Colors.ink,
                    },
                  ]}
                >
                  {t.glyph}
                </Text>
              </View>
              <Text
                style={[
                  v2Text.serial,
                  {
                    color: active ? t.accent : v2Colors.inkMuted,
                    marginTop: 4,
                    fontWeight: active ? '700' : '500',
                  },
                ]}
              >
                N°{['I', 'II', 'III', 'IV'][i] || String(i + 1)} · {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: v2Colors.paper,
    paddingTop: 10,
    paddingHorizontal: v2Space.sm,
    borderTopWidth: 1.5,
    borderTopColor: v2Colors.ink,
  },
  rule: {
    display: 'none',
  },
  rowInner: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 6,
    minWidth: 64,
  },
  glyphFrame: {
    width: 34,
    height: 34,
    borderWidth: 1.5,
    borderColor: v2Colors.ink,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphText: {
    fontFamily:
      Platform.OS === 'web'
        ? '"Fraunces", "Hoefler Text", Garamond, Georgia, serif'
        : 'serif',
    fontSize: 18,
    lineHeight: 22,
    fontStyle: 'italic',
    fontWeight: '500',
  },
});

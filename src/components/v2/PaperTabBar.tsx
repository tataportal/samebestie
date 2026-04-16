import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { v2Colors, v2Text, v2Space } from '../../theme/v2';

export interface PaperTab {
  key: string;
  label: string;
  glyph: string;
  accent: string;
}

interface Props {
  tabs: PaperTab[];
  activeTab: string;
  onTabPress: (key: string) => void;
}

export function PaperTabBar({ tabs, activeTab, onTabPress }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: Math.max(insets.bottom, 8) + 4 },
      ]}
    >
      <View style={styles.row}>
        {tabs.map((t) => {
          const active = activeTab === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => onTabPress(t.key)}
              style={styles.tab}
            >
              <Text style={{ fontSize: 22 }}>{t.glyph}</Text>
              <Text
                style={[
                  v2Text.serial,
                  {
                    color: active ? t.accent : v2Colors.inkMuted,
                    fontWeight: active ? '700' : '500',
                    marginTop: 2,
                  },
                ]}
              >
                {t.label}
              </Text>
              {active && (
                <View style={[styles.dot, { backgroundColor: t.accent }]} />
              )}
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
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: v2Colors.rule,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 4,
    minWidth: 70,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 5,
    marginTop: 4,
  },
});

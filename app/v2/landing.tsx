import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PaperLayer } from '../../src/components/v2/PaperLayer';
import {
  RuledDivider,
  InkButton,
  Asterism,
} from '../../src/components/v2/Primitives';
import { useUserStore } from '../../src/store/useUserStore';
import { v2Colors, v2Text, v2Space } from '../../src/theme/v2';

export default function V2Landing() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isOnboarded = useUserStore((s) => s.isOnboarded);

  return (
    <PaperLayer>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom + 80,
          },
        ]}
      >
        {/* Everything centered vertically */}
        <View style={styles.center}>
          <Text style={[v2Text.serial, { color: v2Colors.stamp, textAlign: 'center' }]}>
            VOL. II · FOCUS COMPANION
          </Text>

          <RuledDivider variant="double" color={v2Colors.ink} style={{ marginTop: v2Space.sm, marginBottom: v2Space.xl }} />

          <Text
            // @ts-ignore
            className={Platform.OS === 'web' ? 'v2-wonk' : undefined}
            style={[v2Text.heroSerif, styles.title]}
          >
            Same,
          </Text>
          <Text
            // @ts-ignore
            className={Platform.OS === 'web' ? 'v2-soft' : undefined}
            style={[v2Text.heroSerif, styles.titleAccent]}
          >
            Bestie.
          </Text>

          <Text style={[v2Text.quote, styles.tagline]}>
            A small creature that watches over your focus, nudges you
            through the slump, and keeps the record.
          </Text>

          <Text style={[v2Text.bodySmall, styles.features]}>
            Pomodoro timer · Focus tracking · XP & levels
          </Text>

          <View style={styles.cta}>
            <InkButton
              label={isOnboarded ? 'Enter' : 'Begin'}
              sublabel={isOnboarded ? 'your bestie awaits' : 'choose your companion'}
              variant="ink"
              onPress={() =>
                router.push(isOnboarded ? '/v2/(tabs)/pet' : '/v2/onboarding')
              }
              full
            />
          </View>

          <Asterism char="✦ ❋ ✦" color={v2Colors.stamp} size={10} style={{ marginTop: v2Space.xl }} />
          <Text style={[v2Text.serial, styles.foot]}>
            Handprinted · With intent
          </Text>
        </View>
      </View>
    </PaperLayer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: v2Space.xl,
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
  },
  title: {
    color: v2Colors.ink,
    fontSize: 58,
    lineHeight: 58,
    textAlign: 'center',
  },
  titleAccent: {
    color: v2Colors.coral,
    fontStyle: 'italic',
    fontWeight: '300',
    fontSize: 58,
    lineHeight: 58,
    textAlign: 'center',
    marginBottom: v2Space.lg,
  },
  tagline: {
    color: v2Colors.ink,
    fontSize: 17,
    lineHeight: 26,
    textAlign: 'center',
    maxWidth: 320,
  },
  features: {
    color: v2Colors.inkMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: v2Space.sm,
  },
  cta: {
    marginTop: v2Space.xl,
    alignSelf: 'stretch',
  },
  foot: {
    color: v2Colors.stamp,
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
});

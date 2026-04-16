import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
  Pressable,
  PressableProps,
} from 'react-native';
import { v2Colors, v2Text, v2Space, v2Radius } from '../../theme/v2';

/* ──────────────────────────────────────────────────────────
 * RuledDivider — dotted / dashed / solid paper rule
 * ────────────────────────────────────────────────────────── */

type RuleVariant = 'solid' | 'dotted' | 'dashed' | 'double';

export function RuledDivider({
  variant = 'dotted',
  color = v2Colors.rule,
  style,
}: {
  variant?: RuleVariant;
  color?: string;
  style?: ViewStyle;
}) {
  if (variant === 'double') {
    return (
      <View style={[{ paddingVertical: 2 }, style]}>
        <View style={{ height: 1, backgroundColor: color, marginBottom: 3 }} />
        <View style={{ height: 1, backgroundColor: color }} />
      </View>
    );
  }
  const border =
    variant === 'dotted'
      ? { borderTopWidth: 1, borderStyle: 'dotted' as const, borderColor: color }
      : variant === 'dashed'
      ? { borderTopWidth: 1, borderStyle: 'dashed' as const, borderColor: color }
      : { height: 1, backgroundColor: color };
  return <View style={[variant === 'solid' ? border : { ...border }, style]} />;
}

/* ──────────────────────────────────────────────────────────
 * FieldLabel — mono caps label like "N°02 · FOCUS MODE"
 * ────────────────────────────────────────────────────────── */

export function FieldLabel({
  children,
  index,
  color = v2Colors.inkMuted,
  style,
}: {
  children: React.ReactNode;
  index?: string;
  color?: string;
  style?: TextStyle;
}) {
  return (
    <View style={styles.fieldRow}>
      {index && (
        <Text style={[v2Text.field, styles.indexTag, { color: v2Colors.stamp }]}>
          {index}
        </Text>
      )}
      {index && <View style={styles.indexBar} />}
      <Text style={[v2Text.field, { color }, style]}>{children}</Text>
    </View>
  );
}

/* ──────────────────────────────────────────────────────────
 * IndexCard — the signature "library index card" container
 * ────────────────────────────────────────────────────────── */

export function IndexCard({
  children,
  style,
  tint = v2Colors.paperBright,
  accent,
  rotate = 0,
  serial,
}: {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  tint?: string;
  accent?: string;
  rotate?: number;
  serial?: string;
}) {
  const webStyle: any =
    Platform.OS === 'web'
      ? {
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 23px, ' +
            v2Colors.ruleDim +
            ' 23px, ' +
            v2Colors.ruleDim +
            ' 24px)',
          backgroundPosition: '0 38px',
        }
      : {};
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: tint },
        rotate ? { transform: [{ rotate: `${rotate}deg` }] } : undefined,
        style as any,
        webStyle,
      ]}
    >
      {accent && (
        <View
          style={[styles.cardAccent, { backgroundColor: accent }]}
          pointerEvents="none"
        />
      )}
      {serial && (
        <Text style={[v2Text.serial, styles.cardSerial]}>{serial}</Text>
      )}
      {children}
    </View>
  );
}

/* ──────────────────────────────────────────────────────────
 * Stamp — rotated circular library stamp
 * ────────────────────────────────────────────────────────── */

export function Stamp({
  label,
  sub,
  color = v2Colors.coral,
  size = 72,
  rotate = -8,
  style,
}: {
  label: string;
  sub?: string;
  color?: string;
  size?: number;
  rotate?: number;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        styles.stamp,
        {
          width: size,
          height: size,
          borderColor: color,
          transform: [{ rotate: `${rotate}deg` }],
        },
        style,
      ]}
    >
      <View style={[styles.stampInner, { borderColor: color }]}>
        <Text
          style={[
            v2Text.field,
            { color, fontSize: size * 0.09, letterSpacing: size * 0.015, textAlign: 'center' },
          ]}
        >
          {label}
        </Text>
        {sub && (
          <Text
            style={[
              v2Text.serial,
              { color, fontSize: size * 0.065, marginTop: 2, letterSpacing: size * 0.01 },
            ]}
          >
            {sub}
          </Text>
        )}
      </View>
    </View>
  );
}

/* ──────────────────────────────────────────────────────────
 * InkButton — flat, rectangular, heavy-ink CTA
 * ────────────────────────────────────────────────────────── */

interface InkButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  sublabel?: string;
  variant?: 'ink' | 'coral' | 'moss' | 'paper';
  icon?: string;
  full?: boolean;
}

export function InkButton({
  label,
  sublabel,
  variant = 'ink',
  full,
  ...rest
}: InkButtonProps) {
  const map = {
    ink: { bg: v2Colors.ink, fg: v2Colors.paperBright, border: v2Colors.ink },
    coral: { bg: v2Colors.coral, fg: v2Colors.paperBright, border: v2Colors.coralInk },
    moss: { bg: v2Colors.moss, fg: v2Colors.paperBright, border: v2Colors.mossInk },
    paper: { bg: v2Colors.paperBright, fg: v2Colors.ink, border: v2Colors.ink },
  }[variant];

  return (
    <Pressable
      {...rest}
      style={({ pressed }) => [
        styles.btn,
        full && { alignSelf: 'stretch' },
        {
          backgroundColor: map.bg,
          borderColor: map.border,
          transform: pressed ? [{ translateY: 2 }] : [{ translateY: 0 }],
          shadowOffset: { width: 3, height: pressed ? 1 : 3 },
          shadowColor: v2Colors.ink,
          shadowOpacity: 1,
          shadowRadius: 0,
        },
      ]}
    >
      <Text style={[v2Text.field, { color: map.fg, fontSize: 12, letterSpacing: 2.5 }]}>
        {label}
      </Text>
      {sublabel && (
        <Text
          style={[
            v2Text.serial,
            { color: map.fg, opacity: 0.65, marginTop: 2 },
          ]}
        >
          {sublabel}
        </Text>
      )}
    </Pressable>
  );
}

/* ──────────────────────────────────────────────────────────
 * Asterism — decorative typographic ornament
 * ────────────────────────────────────────────────────────── */

export function Asterism({
  char = '✦',
  color = v2Colors.coral,
  size = 14,
  style,
}: {
  char?: string;
  color?: string;
  size?: number;
  style?: TextStyle;
}) {
  return (
    <Text
      style={[
        { fontSize: size, color, textAlign: 'center', lineHeight: size + 2 },
        style,
      ]}
    >
      {char}
    </Text>
  );
}

/* ──────────────────────────────────────────────────────────
 * Styles
 * ────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indexTag: {
    letterSpacing: 1.5,
  },
  indexBar: {
    width: 12,
    height: 1,
    backgroundColor: v2Colors.rule,
  },
  card: {
    padding: v2Space.lg,
    borderRadius: v2Radius.card,
    borderWidth: 1,
    borderColor: v2Colors.paperShadow,
    position: 'relative',
    overflow: 'hidden',
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  cardSerial: {
    position: 'absolute',
    top: 10,
    right: 14,
    color: v2Colors.stamp,
  },
  stamp: {
    borderWidth: 2,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  stampInner: {
    borderWidth: 1,
    borderRadius: 999,
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  btn: {
    paddingVertical: v2Space.md + 2,
    paddingHorizontal: v2Space.lg,
    borderRadius: v2Radius.small,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

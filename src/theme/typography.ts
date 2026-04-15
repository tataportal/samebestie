import { TextStyle } from 'react-native';

export const fonts = {
  headline: 'SpaceGrotesk-Bold',
  headlineRegular: 'SpaceGrotesk-Regular',
  headlineMedium: 'SpaceGrotesk-Medium',
  headlineSemiBold: 'SpaceGrotesk-SemiBold',
  headlineLight: 'SpaceGrotesk-Light',
  body: 'Manrope-Regular',
  bodyMedium: 'Manrope-Medium',
  bodySemiBold: 'Manrope-SemiBold',
  bodyBold: 'Manrope-Bold',
  bodyExtraBold: 'Manrope-ExtraBold',
  label: 'SpaceGrotesk-Bold',
} as const;

export const textStyles: Record<string, TextStyle> = {
  // Headlines
  heroTitle: {
    fontFamily: fonts.headline,
    fontSize: 48,
    letterSpacing: -2,
    textTransform: 'uppercase',
  },
  pageTitle: {
    fontFamily: fonts.headline,
    fontSize: 32,
    letterSpacing: -1,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontFamily: fonts.headline,
    fontSize: 24,
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontFamily: fonts.headline,
    fontSize: 20,
    textTransform: 'uppercase',
  },

  // Timer
  timerLarge: {
    fontFamily: fonts.headline,
    fontSize: 72,
    letterSpacing: -2,
  },
  timerMedium: {
    fontFamily: fonts.headline,
    fontSize: 48,
    letterSpacing: -1,
  },

  // Stat values
  statLarge: {
    fontFamily: fonts.headline,
    fontSize: 48,
    letterSpacing: -2,
  },
  statMedium: {
    fontFamily: fonts.headline,
    fontSize: 24,
  },

  // Labels
  labelTiny: {
    fontFamily: fonts.label,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  labelSmall: {
    fontFamily: fonts.label,
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // Body
  bodyLarge: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
  },

  // Buttons
  buttonLarge: {
    fontFamily: fonts.headline,
    fontSize: 20,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  buttonMedium: {
    fontFamily: fonts.headline,
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
} as const;

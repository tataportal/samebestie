/**
 * V2 Theme — "After-Hours Library"
 * Warm paper + navy ink + risograph fluorescent accents.
 * A tactile, handmade counter-aesthetic to V1's dark neon arcade.
 */

export const v2Colors = {
  // Paper foundation — warm cream tones
  paper: '#F2EADB',          // base cream
  paperBright: '#FAF5EA',    // bright highlight
  paperDeep: '#E6DCC5',      // deep cream (cards)
  paperShadow: '#D4C7A8',    // cream shadow

  // Ink — deep navy replaces black for warmth
  ink: '#14203A',            // deep navy (text)
  inkSoft: '#384262',        // softer ink
  inkMuted: '#6E6A5C',       // muted label text

  // Risograph fluorescent accents
  coral: '#F2462E',          // fluo red — primary/focus
  coralInk: '#A21B08',       // coral darker
  coralWash: '#F9D3C8',      // coral tint background

  moss: '#1F5936',           // bottle green — bond/break
  mossInk: '#0F3A22',        // moss darker
  mossWash: '#CEDDC9',       // moss tint

  amber: '#D9992E',          // mustard/amber — streaks/XP
  amberInk: '#8A5A15',       // amber darker
  amberWash: '#F3E3BC',      // amber tint

  sky: '#3A6EA5',            // dusty blue — calm
  skyInk: '#1F3F6B',
  skyWash: '#D2DDEC',

  // Structural lines (ruled paper)
  rule: '#C9BCA0',           // rule line
  ruleDim: '#DCD3BF',        // dim rule
  stamp: '#8A7456',          // stamp ink brown
} as const;

// Font families — Google fonts injected at runtime on web.
// On native, system serif/sans fallbacks kick in (acceptable for V2 preview).
export const v2Fonts = {
  display: '"Fraunces", "Hoefler Text", "Garamond", "Times New Roman", Georgia, serif',
  displayItalic: '"Fraunces", "Hoefler Text", "Garamond", Georgia, serif',
  body: '"DM Sans", -apple-system, "Segoe UI", Helvetica, Arial, sans-serif',
  mono: '"JetBrains Mono", "Menlo", "SF Mono", "Courier New", monospace',
} as const;

// Text styles — structured for paper aesthetic
export const v2Text = {
  // Numbered index like "N°01" — riso ornament
  index: {
    fontFamily: v2Fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '500' as const,
    textTransform: 'uppercase' as const,
  },

  // Field label — small mono caps
  field: {
    fontFamily: v2Fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    fontWeight: '600' as const,
  },

  // Mono tag/price label
  tag: {
    fontFamily: v2Fonts.mono,
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: '500' as const,
  },

  // Serif display — hero titles
  heroSerif: {
    fontFamily: v2Fonts.display,
    fontSize: 56,
    lineHeight: 58,
    letterSpacing: -1.5,
    fontWeight: '400' as const,
  },

  displaySerif: {
    fontFamily: v2Fonts.display,
    fontSize: 38,
    lineHeight: 42,
    letterSpacing: -0.5,
    fontWeight: '400' as const,
  },

  sectionSerif: {
    fontFamily: v2Fonts.display,
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.2,
    fontWeight: '500' as const,
  },

  cardSerif: {
    fontFamily: v2Fonts.display,
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: -0.1,
    fontWeight: '500' as const,
  },

  // Timer — giant ink serif with tabular figures
  timerHuge: {
    fontFamily: v2Fonts.display,
    fontSize: 148,
    lineHeight: 148,
    letterSpacing: -6,
    fontWeight: '300' as const,
  },

  // Body text — DM Sans round
  body: {
    fontFamily: v2Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
  },

  bodySmall: {
    fontFamily: v2Fonts.body,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '400' as const,
  },

  // Italic serif for quotes / pet dialogue
  quote: {
    fontFamily: v2Fonts.display,
    fontSize: 17,
    lineHeight: 25,
    fontStyle: 'italic' as const,
    fontWeight: '400' as const,
  },

  // Serial number / receipt print
  serial: {
    fontFamily: v2Fonts.mono,
    fontSize: 9,
    letterSpacing: 1.8,
    fontWeight: '500' as const,
  },
} as const;

export const v2Space = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 22,
  xl: 32,
  xxl: 48,
  xxxl: 72,
} as const;

export const v2Radius = {
  none: 0,
  tiny: 2,
  small: 4,
  card: 8,
  pill: 999,
} as const;

export const colors = {
  // Primary
  primary: '#b79fff',
  primaryDim: '#a88cfb',
  primaryContainer: '#ab8ffe',
  primaryFixed: '#ab8ffe',
  primaryFixedDim: '#9d81f0',
  onPrimary: '#361083',
  onPrimaryContainer: '#290070',
  onPrimaryFixed: '#000000',
  onPrimaryFixedVariant: '#330b80',
  inversePrimary: '#684cb6',

  // Secondary
  secondary: '#68fcbf',
  secondaryDim: '#57edb1',
  secondaryContainer: '#006c4b',
  secondaryFixed: '#68fcbf',
  secondaryFixedDim: '#57edb1',
  onSecondary: '#005e40',
  onSecondaryContainer: '#e0ffec',
  onSecondaryFixed: '#004931',
  onSecondaryFixedVariant: '#006948',

  // Tertiary
  tertiary: '#ff8796',
  tertiaryDim: '#fb7185',
  tertiaryContainer: '#fb7185',
  tertiaryFixed: '#ff909d',
  tertiaryFixedDim: '#ff788b',
  onTertiary: '#5f001c',
  onTertiaryContainer: '#490013',
  onTertiaryFixed: '#39000d',
  onTertiaryFixedVariant: '#760726',

  // Error
  error: '#ff6e84',
  errorDim: '#d73357',
  errorContainer: '#a70138',
  onError: '#490013',
  onErrorContainer: '#ffb2b9',

  // Surface hierarchy
  surface: '#0d0d1c',
  surfaceDim: '#0d0d1c',
  surfaceBright: '#2a2a42',
  surfaceTint: '#b79fff',
  surfaceVariant: '#24243a',
  surfaceContainer: '#18182a',
  surfaceContainerLow: '#121223',
  surfaceContainerHigh: '#1d1e32',
  surfaceContainerHighest: '#24243a',
  surfaceContainerLowest: '#000000',

  // On surface
  onSurface: '#e6e3fa',
  onSurfaceVariant: '#aba9be',
  onBackground: '#e6e3fa',

  // Background
  background: '#0d0d1c',

  // Outline
  outline: '#757487',
  outlineVariant: '#474658',

  // Inverse
  inverseSurface: '#fcf8ff',
  inverseOnSurface: '#545366',
} as const;

export type ColorKey = keyof typeof colors;

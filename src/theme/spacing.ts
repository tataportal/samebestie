// Border radius scale
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

// 4px base grid
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// Common padding patterns from Stitch designs
export const padding = {
  screen: 24,     // px-6 = 24px
  card: 24,       // p-6 = 24px
  cardSmall: 16,  // p-4 = 16px
  input: 24,      // px-6 py-4
} as const;

// Heights from Stitch designs
export const heights = {
  topBar: 64,
  bottomNav: 80,
  button: 64,
  buttonSmall: 48,
  xpBar: 12,
  xpBarLarge: 16,
  statBlock: 128,
  toggle: 24,
} as const;

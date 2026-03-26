// =============================================================================
// SplitBliz — Color constants
// Source: audit of all hardcoded hex values across the codebase
// These are definitions only. Do NOT replace usages yet — that is a later phase.
// =============================================================================

export const colors = {
  // Primary brand purple
  primary: '#6c5ce7',
  primaryLight: '#a29bfe',
  primaryFaint: '#f0eeff',

  // Backgrounds
  pageBg: '#f4f2fb',
  surfaceBg: '#ffffff',
  darkBg: '#1a1625',
  darkSurface: '#2d2640',

  // Text
  textPrimary: '#1a1625',
  textMuted: '#9490b8',
  textOnPrimary: '#ffffff',

  // Semantic
  success: '#0f6e56',
  successLight: '#e1f5ee',
  danger: '#e74c3c',
  dangerLight: '#fdecea',
  warning: '#f39c12',
  warningLight: '#fef9e7',
  info: '#3498db',
  infoLight: '#ebf5fb',

  // Borders & dividers
  border: '#e0ddf5',
  divider: '#f0eeff',

  // Avatar palette — used for generated member avatars
  avatarPalette: [
    '#6c5ce7', '#00b894', '#fd79a8', '#fdcb6e',
    '#e17055', '#74b9ff', '#a29bfe', '#55efc4',
  ],

  // Overlays
  overlay10: 'rgba(108, 92, 231, 0.10)',
  overlay25: 'rgba(108, 92, 231, 0.25)',
  white50: 'rgba(255, 255, 255, 0.50)',
  white20: 'rgba(255, 255, 255, 0.20)',
  white18: 'rgba(255, 255, 255, 0.18)',
} as const;

export type ColorKey = keyof typeof colors;

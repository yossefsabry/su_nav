/**
 * Centralized Theme Configuration
 * 
 * This file contains all design tokens used throughout the app including:
 * - Colors (semantic and raw)
 * - Spacing scale
 * - Typography settings
 * - Animation durations
 * - Border radius
 * - Shadows and elevation
 * - Breakpoints
 */

import { Platform } from 'react-native';

// ============================================================================
// COLORS
// ============================================================================

/**
 * Base color palette - raw color values
 */
export const ColorPalette = {
  // Primary colors
  primary50: '#e0f2fe',
  primary100: '#bae6fd',
  primary200: '#7dd3fc',
  primary300: '#38bdf8',
  primary400: '#0ea5e9',
  primary500: '#0a7ea4',
  primary600: '#0284c7',
  primary700: '#0369a1',
  primary800: '#075985',
  primary900: '#0c4a6e',

  // Accent colors
  accent50: '#fdf4ff',
  accent100: '#fae8ff',
  accent200: '#f5d0fe',
  accent300: '#f0abfc',
  accent400: '#e879f9',
  accent500: '#d946ef',
  accent600: '#c026d3',
  accent700: '#a21caf',
  accent800: '#86198f',
  accent900: '#701a75',

  // Success colors
  success50: '#f0fdf4',
  success100: '#dcfce7',
  success200: '#bbf7d0',
  success300: '#86efac',
  success400: '#4ade80',
  success500: '#22c55e',
  success600: '#16a34a',
  success700: '#15803d',
  success800: '#166534',
  success900: '#14532d',

  // Warning colors
  warning50: '#fffbeb',
  warning100: '#fef3c7',
  warning200: '#fde68a',
  warning300: '#fcd34d',
  warning400: '#fbbf24',
  warning500: '#f59e0b',
  warning600: '#d97706',
  warning700: '#b45309',
  warning800: '#92400e',
  warning900: '#78350f',

  // Error colors
  error50: '#fef2f2',
  error100: '#fee2e2',
  error200: '#fecaca',
  error300: '#fca5a5',
  error400: '#f87171',
  error500: '#ef4444',
  error600: '#dc2626',
  error700: '#b91c1c',
  error800: '#991b1b',
  error900: '#7f1d1d',

  // Neutral colors (light theme)
  neutral50: '#fafafa',
  neutral100: '#f5f5f5',
  neutral200: '#e5e5e5',
  neutral300: '#d4d4d4',
  neutral400: '#a3a3a3',
  neutral500: '#737373',
  neutral600: '#525252',
  neutral700: '#404040',
  neutral800: '#262626',
  neutral900: '#171717',

  // Neutral colors (dark theme)
  dark50: '#fafafa',
  dark100: '#f4f4f5',
  dark200: '#e4e4e7',
  dark300: '#d4d4d8',
  dark400: '#a1a1aa',
  dark500: '#71717a',
  dark600: '#52525b',
  dark700: '#3f3f46',
  dark800: '#27272a',
  dark900: '#18181b',
  dark950: '#09090b',

  // Pure colors
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

/**
 * Semantic color tokens for light and dark modes
 */
export const Colors = {
  light: {
    // Primary
    primary: ColorPalette.primary500,
    primaryHover: ColorPalette.primary600,
    primaryActive: ColorPalette.primary700,
    primaryLight: ColorPalette.primary100,

    // Text
    text: '#11181C',
    textSecondary: '#687076',
    textTertiary: '#9BA1A6',
    textInverse: ColorPalette.white,
    textMuted: ColorPalette.neutral500,

    // Background (softer gray tones, not bright white)
    background: '#F8F9FA',
    backgroundSecondary: '#F0F2F5',
    backgroundTertiary: '#E4E6EB',
    backgroundElevated: '#FFFFFF',

    // Surface
    surface: '#FFFFFF',
    surfaceElevated: '#F8F9FA',
    surfaceHover: '#F0F2F5',
    surfaceActive: '#E4E6EB',

    // Borders
    border: ColorPalette.neutral200,
    borderLight: ColorPalette.neutral100,
    borderStrong: ColorPalette.neutral300,

    // Status colors
    success: ColorPalette.success500,
    successLight: ColorPalette.success100,
    warning: ColorPalette.warning500,
    warningLight: ColorPalette.warning100,
    error: ColorPalette.error500,
    errorLight: ColorPalette.error100,
    info: ColorPalette.primary500,
    infoLight: ColorPalette.primary100,

    // Tint (for navigation/tabs)
    tint: ColorPalette.primary500,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: ColorPalette.primary500,

    // Accent
    accent: ColorPalette.accent500,
    accentLight: ColorPalette.accent100,

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
    overlayStrong: 'rgba(0, 0, 0, 0.7)',
  },
  dark: {
    // Primary
    primary: ColorPalette.primary400,
    primaryHover: ColorPalette.primary300,
    primaryActive: ColorPalette.primary200,
    primaryLight: ColorPalette.primary900,

    // Text
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    textTertiary: '#687076',
    textInverse: ColorPalette.black,
    textMuted: ColorPalette.dark400,

    // Background
    background: '#151718',
    backgroundSecondary: '#1a1d1e',
    backgroundTertiary: '#202425',
    backgroundElevated: '#1f2223',

    // Surface
    surface: '#1a1d1e',
    surfaceElevated: '#202425',
    surfaceHover: '#27292a',
    surfaceActive: '#2e3031',

    // Borders
    border: ColorPalette.dark700,
    borderLight: ColorPalette.dark800,
    borderStrong: ColorPalette.dark600,

    // Status colors
    success: ColorPalette.success400,
    successLight: ColorPalette.success900,
    warning: ColorPalette.warning400,
    warningLight: ColorPalette.warning900,
    error: ColorPalette.error400,
    errorLight: ColorPalette.error900,
    info: ColorPalette.primary400,
    infoLight: ColorPalette.primary900,

    // Tint (for navigation/tabs)
    tint: ColorPalette.white,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: ColorPalette.white,

    // Accent
    accent: ColorPalette.accent400,
    accentLight: ColorPalette.accent900,

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(0, 0, 0, 0.5)',
    overlayStrong: 'rgba(0, 0, 0, 0.85)',
  },
};

// ============================================================================
// SPACING
// ============================================================================

/**
 * Spacing scale - based on 4px grid
 */
export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
  '6xl': 80,
  '7xl': 96,
  '8xl': 128,
  '9xl': 160,
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

/**
 * Font families by platform
 */
export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

/**
 * Font sizes
 */
export const FontSizes = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
  '7xl': 72,
  '8xl': 96,
  '9xl': 128,
};

/**
 * Font weights
 */
export const FontWeights = {
  thin: '100' as const,
  extralight: '200' as const,
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
};

/**
 * Line heights
 */
export const LineHeights = {
  tight: 1.2,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
};

// ============================================================================
// ANIMATION
// ============================================================================

/**
 * Animation durations in milliseconds
 */
export const AnimationDurations = {
  instant: 0,
  fast: 150,
  normal: 250,
  medium: 350,
  slow: 500,
  slower: 750,
  slowest: 1000,
};

/**
 * Animation easing curves
 */
export const AnimationEasing = {
  linear: 'linear',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  // Custom cubic bezier curves
  spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

// ============================================================================
// BORDER RADIUS
// ============================================================================

/**
 * Border radius values
 */
export const BorderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

// ============================================================================
// SHADOWS & ELEVATION
// ============================================================================

/**
 * Shadow presets for light theme
 */
export const Shadows = {
  light: {
    none: {
      shadowColor: ColorPalette.black,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: ColorPalette.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    base: {
      shadowColor: ColorPalette.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: ColorPalette.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 4,
    },
    lg: {
      shadowColor: ColorPalette.black,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    xl: {
      shadowColor: ColorPalette.black,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.18,
      shadowRadius: 16,
      elevation: 12,
    },
    '2xl': {
      shadowColor: ColorPalette.black,
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 16,
    },
  },
  dark: {
    none: {
      shadowColor: ColorPalette.black,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: ColorPalette.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 1,
    },
    base: {
      shadowColor: ColorPalette.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.35,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: ColorPalette.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 4,
    },
    lg: {
      shadowColor: ColorPalette.black,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.45,
      shadowRadius: 12,
      elevation: 8,
    },
    xl: {
      shadowColor: ColorPalette.black,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      elevation: 12,
    },
    '2xl': {
      shadowColor: ColorPalette.black,
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.55,
      shadowRadius: 24,
      elevation: 16,
    },
  },
};

// ============================================================================
// BREAKPOINTS
// ============================================================================

/**
 * Responsive breakpoints (primarily for web)
 */
export const Breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// ============================================================================
// Z-INDEX
// ============================================================================

/**
 * Z-index scale for layering
 */
export const ZIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  toast: 800,
  max: 999,
};

// ============================================================================
// OPACITY
// ============================================================================

/**
 * Opacity scale
 */
export const Opacity = {
  0: 0,
  5: 0.05,
  10: 0.1,
  20: 0.2,
  25: 0.25,
  30: 0.3,
  40: 0.4,
  50: 0.5,
  60: 0.6,
  70: 0.7,
  75: 0.75,
  80: 0.8,
  90: 0.9,
  95: 0.95,
  100: 1,
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ThemeMode = 'light' | 'dark';
export type ColorToken = keyof typeof Colors.light;
export type SpacingToken = keyof typeof Spacing;
export type FontSizeToken = keyof typeof FontSizes;
export type BorderRadiusToken = keyof typeof BorderRadius;
export type ShadowToken = keyof typeof Shadows.light;

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

/**
 * Complete theme configuration
 */
export const Theme = {
  colors: Colors,
  colorPalette: ColorPalette,
  spacing: Spacing,
  fonts: Fonts,
  fontSizes: FontSizes,
  fontWeights: FontWeights,
  lineHeights: LineHeights,
  animation: {
    durations: AnimationDurations,
    easing: AnimationEasing,
  },
  borderRadius: BorderRadius,
  shadows: Shadows,
  breakpoints: Breakpoints,
  zIndex: ZIndex,
  opacity: Opacity,
};

export default Theme;

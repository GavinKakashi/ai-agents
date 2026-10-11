/**
 * Colour tokens. Every text/background pair used in the app is verified to
 * meet WCAG 2.2 AA (4.5:1 for text, 3:1 for UI boundaries) by
 * `npm run check:contrast` at the repo root — run it after changing a value.
 * The website (apps/web/src/styles.css) uses the same values.
 */
export const Colors = {
  light: {
    background: '#FFFFFF',
    surface: '#F4F5F7',
    surfaceAlt: '#E8EAEE',
    text: '#111318',
    textSecondary: '#4A5160',
    border: '#7A8190',
    primary: '#3730A3',
    onPrimary: '#FFFFFF',
    danger: '#B42318',
    onDanger: '#FFFFFF',
    success: '#166534',
    warning: '#8A4B00',
  },
  dark: {
    background: '#0E1015',
    surface: '#181B22',
    surfaceAlt: '#232731',
    text: '#F2F4F7',
    textSecondary: '#B8BFCC',
    border: '#7D8594',
    primary: '#A5B4FC',
    onPrimary: '#12122E',
    danger: '#FDA29B',
    onDanger: '#3A0A06',
    success: '#86EFAC',
    warning: '#FCD34D',
  },
} as const;

export type ThemeColors = { [K in keyof typeof Colors.light]: string };

/** Avatar backgrounds. All carry white initials at >= 4.5:1. */
export const AvatarColors = ['#3730A3', '#9A3412', '#166534', '#155E75', '#6B21A8', '#9F1239', '#854D0E', '#1E40AF'] as const;

export const Spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const Radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;
/** Minimum touch target (WCAG 2.5.8 / platform guidelines). */
export const MinTouch = 44;
export const MaxContentWidth = 720;

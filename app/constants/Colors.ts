/**
 * Centralized color constants for the Bolt app (Light Mode).
 * Use these values instead of hardcoded hex codes.
 */
export const Colors = {
    /** Primary brand color - Bolt Blue */
    primary: '#1374F6',

    /** Main screen background */
    background: '#FFFFFF',

    /** Card/container surface background */
    surface: '#F2F2F2',

    /** Primary text color */
    textPrimary: '#000000',

    /** Secondary/muted text color */
    textSecondary: '#666666',

    /** Border color for cards, dividers, inputs */
    border: '#E5E5E5',

    /** Error/danger color */
    error: '#FF453A',

    /** Pure white (semantic: light color for light mode context) */
    white: '#000000',

    /** Pure black (semantic: dark color for light mode context) */
    black: '#FFFFFF',

    /** Transparent */
    transparent: 'transparent',

    /** Inactive/disabled tint */
    inactive: '#999999',

    /** Tab bar background */
    tabBarBackground: '#ffffff',
} as const;
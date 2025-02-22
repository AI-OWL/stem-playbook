/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#1f2937', // Dark gray for text
    background: '#ffffff', // White background
    tint: '#1e40af', // Primary blue color
    icon: '#6b7280', // Gray for icons
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#f3f4f6', // Light gray for text
    background: '#1f2937', // Dark background
    tint: '#3b82f6', // Lighter blue for dark mode
    icon: '#9ca3af', // Lighter gray for icons
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

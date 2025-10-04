/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';



export const Palette = {
  accentPink: '#e62d67',
  accentGreen: '#69b03e',
  accentYellow: '#f6ba2b',
  accentBlue: '#1daed9',
  accentPurple: '#5c5693'
};


export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: Palette.accentPink,
    icon: Palette.accentPurple,
    tabIconDefault: Palette.accentBlue,
    tabIconSelected: Palette.accentPink,
    card: Palette.accentYellow,
    cardSecondary: Palette.accentGreen
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: Palette.accentPink,
    icon: Palette.accentPurple,
    tabIconDefault: Palette.accentBlue,
    tabIconSelected: Palette.accentPink,
    card: Palette.accentYellow,
    cardSecondary: Palette.accentGreen
  }
};

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

/**
 * @hanji/react — accessible compound components on Base UI, themed by @hanji/tokens.
 *
 * Styles: import '@hanji/react/styles.css' once (tokens + base + every component, in cascade
 * layers, so your own CSS always wins). Agent-readable docs: '@hanji/react/manifest.json'.
 */

// system
export { HanjiProvider, defaultStrings, useHanjiConfig } from './system/config.tsx';
export type { HanjiConfig, HanjiProviderProps, HanjiStrings } from './system/config.tsx';
export { Theme, ThemeScope, useThemeScope } from './system/theme.tsx';
export type { ThemeProps } from './system/theme.tsx';
export { Icon } from './system/icon.tsx';
export type { IconProps } from './system/icon.tsx';
export { defaultIcons, iconNames } from './system/icons.tsx';
export type { IconMap, IconName } from './system/icons.tsx';
export { SpringValue, prefersReducedMotion, useSpring } from './system/motion.ts';
export type { SpringOptions } from './system/motion.ts';
export { elementPart, part } from './system/part.tsx';
export type { ElementPartProps, HanjiPart } from './system/part.tsx';
export { cls, flag, withDefaults } from './system/slot.ts';
export { useSlot } from './system/use-slot.ts';
export type { ClassName } from './system/slot.ts';
export { createTheme } from '@hanji/tokens';
export type { HanjiTheme, ThemeInput } from '@hanji/tokens';

// components (generated barrel — run scripts/gen-index.ts)
export * from './components/index.ts';

'use client';
import * as React from 'react';

import { defaultIcons } from './icons.tsx';
import type { IconMap } from './icons.tsx';

/** Every user-facing string a component renders on its own. Override for i18n. */
export interface HanjiStrings {
  close: string;
  loading: string;
  clear: string;
  showPassword: string;
  hidePassword: string;
  increment: string;
  decrement: string;
  dismiss: string;
  send: string;
  stop: string;
  copy: string;
  copied: string;
  more: string;
  previous: string;
  next: string;
  required: string;
  optional: string;
  /** Prefix for remove buttons: “Remove Jazz”. */
  remove: string;
  /** Read after an external link’s text. */
  opensInNewTab: string;
  skip: string;
  done: string;
  back: string;
  pagination: string;
  /** “3 of 12” */
  countOf: (n: number, total: number) => string;
  /** “Step 2 of 4” (n is 1-based) */
  stepOf: (n: number, total: number) => string;
  /** “All 4 steps done” */
  allStepsDone: (total: number) => string;
  /** Accessible name of an OTP cell after the first: “Character 2 of 6” */
  characterOf: (n: number, total: number) => string;
  /** “Rated 4.6 out of 5 from 2,184 ratings” (value and count are pre-formatted) */
  ratedOutOf: (value: string, max: number, count?: string) => string;
  /** Read once for a reorderable list: how the keyboard twin works. */
  reorderHint: string;
  /** aria-roledescription of a reorderable item. */
  reorderable: string;
  /** “Lifted Low Tide, position 2 of 6. …” */
  reorderLifted: (name: string, n: number, total: number) => string;
  /** “Low Tide, position 3 of 6.” while moving with the keyboard. */
  reorderMoved: (name: string, n: number, total: number) => string;
  /** “Moved Low Tide to position 3 of 6.” */
  reorderDropped: (name: string, n: number, total: number) => string;
  /** “Low Tide put back at position 2.” */
  reorderCancelled: (name: string, n: number) => string;
}

export const defaultStrings: HanjiStrings = {
  close: 'Close',
  loading: 'Loading',
  clear: 'Clear',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  increment: 'Increase',
  decrement: 'Decrease',
  dismiss: 'Dismiss',
  send: 'Send',
  stop: 'Stop generating',
  copy: 'Copy',
  copied: 'Copied',
  more: 'More',
  previous: 'Previous',
  next: 'Next',
  required: 'Required',
  optional: 'Optional',
  remove: 'Remove',
  opensInNewTab: 'opens in a new tab',
  skip: 'Skip',
  done: 'Done',
  back: 'Back',
  pagination: 'Pagination',
  countOf: (n, total) => `${n} of ${total}`,
  stepOf: (n, total) => `Step ${n} of ${total}`,
  allStepsDone: (total) => `All ${total} steps done`,
  characterOf: (n, total) => `Character ${n} of ${total}`,
  ratedOutOf: (value, max, count) =>
    `Rated ${value} out of ${max}${count ? ` from ${count} ratings` : ''}`,
  reorderHint:
    'Reorderable list. Space lifts an item, arrow keys move it, Space drops it, Escape cancels.',
  reorderable: 'reorderable item',
  reorderLifted: (name, n, total) =>
    `Lifted ${name}, position ${n} of ${total}. Arrow keys move it, Space drops it, Escape cancels.`,
  reorderMoved: (name, n, total) => `${name}, position ${n} of ${total}.`,
  reorderDropped: (name, n, total) => `Moved ${name} to position ${n} of ${total}.`,
  reorderCancelled: (name, n) => `${name} put back at position ${n}.`,
};

/**
 * Library-wide configuration. Read once per component render from one stable context, so it
 * costs a single context lookup and never causes extra renders.
 */
export interface HanjiConfig {
  /** Drop every hanji class. Components keep behaviour, ARIA and data-attributes. */
  unstyled: boolean;
  /** Extra classes per slot, e.g. `{ Button: 'my-btn', 'Dialog.Popup': 'my-popup' }`. */
  classNames: Readonly<Record<string, string>>;
  /** Default props per slot, e.g. `{ Button: { size: 'sm' } }`. Props passed at the call site win. */
  defaults: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
  /** Icon adapter: replace any built-in glyph with your icon set. */
  icons: IconMap;
  /** User-facing strings. */
  strings: HanjiStrings;
}

const DEFAULT_CONFIG: HanjiConfig = {
  unstyled: false,
  classNames: {},
  defaults: {},
  icons: defaultIcons,
  strings: defaultStrings,
};

const ConfigContext = React.createContext<HanjiConfig>(DEFAULT_CONFIG);

export interface HanjiProviderProps {
  unstyled?: boolean;
  classNames?: Readonly<Record<string, string>>;
  defaults?: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
  icons?: Partial<IconMap>;
  strings?: Partial<HanjiStrings>;
  children?: React.ReactNode;
}

/**
 * Optional. Configure defaults, slot classes, icons and strings for everything below it.
 * Nested providers merge with their parent.
 */
export function HanjiProvider(props: HanjiProviderProps): React.JSX.Element {
  const parent = React.useContext(ConfigContext);
  const { unstyled, classNames, defaults, icons, strings, children } = props;
  const value = React.useMemo<HanjiConfig>(
    () => ({
      unstyled: unstyled ?? parent.unstyled,
      classNames: classNames ? { ...parent.classNames, ...classNames } : parent.classNames,
      defaults: defaults ? mergeDefaults(parent.defaults, defaults) : parent.defaults,
      icons: icons ? ({ ...parent.icons, ...icons } as IconMap) : parent.icons,
      strings: strings ? { ...parent.strings, ...strings } : parent.strings,
    }),
    [parent, unstyled, classNames, defaults, icons, strings],
  );
  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

function mergeDefaults(
  a: HanjiConfig['defaults'],
  b: HanjiConfig['defaults'],
): HanjiConfig['defaults'] {
  const out: Record<string, Readonly<Record<string, unknown>>> = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = { ...a[k], ...v };
  return out;
}

/** The nearest configuration. */
export function useHanjiConfig(): HanjiConfig {
  return React.useContext(ConfigContext);
}

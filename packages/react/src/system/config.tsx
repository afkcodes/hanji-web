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
  /** SwipeActions: name of a row's menu of its swipe actions. */
  moreActions: string;
  /** SwipeActions: the same, for a named row: “More actions for Quarterly numbers”. */
  moreActionsFor: (name: string) => string;
  /** SwipeActions: said after a full swipe commits: “Archive: Quarterly numbers. Done.” */
  swipeActionDone: (action: string, name?: string) => string;
  /** DataTable: the header checkbox. */
  selectAllRows: string;
  /** DataTable: a row's checkbox, read before the row's name: “Select row Mira Okafor”. */
  selectRow: string;
  /** DataTable sort announcement: “Sorted by Amount, descending” · “No longer sorted by Amount”. */
  sortedBy: (column: string, direction: 'ascending' | 'descending' | 'none') => string;
  /** DataTable with no rows and no `empty` content. */
  noRows: string;
  /** Accessible name of the ⌘K dialog. */
  commandPalette: string;
  /** Accessible name of the command palette's search input. */
  commandSearch: string;
  /** Command palette empty state: “No results for “q”” (query may be empty). */
  commandEmpty: (query: string) => string;
  /** Drop zone prompt: “Drop files here”, or “Drop a file here” when it takes one. */
  dropFiles: (multiple: boolean) => string;
  /** The drop zone button that opens the file picker. */
  browseFiles: string;
  /** A file rejected because its type isn't accepted. */
  fileTypeRejected: string;
  /** A file rejected for size: “Over 10 MB” (the limit, formatted). */
  fileTooLarge: (max: string) => string;
  /** A file rejected past the file limit: “Over the 5-file limit”. */
  tooManyFiles: (max: number) => string;
  /** Announced when files land: “2 files added”. */
  filesAdded: (n: number) => string;
  /** A file that finished uploading. */
  uploaded: string;
  /** A failed upload, when the app gives no reason. */
  uploadFailed: string;
  /** Retry a failed upload: “Retry lease.pdf”. */
  retry: string;
  /** Tree: the row shown when a lazy item's children failed to load. */
  treeLoadFailed: string;
  /** Tree: the verb on that row — Enter or a click loads again. */
  treeRetry: string;
  /** Tree: the row inside an open item with no children. */
  treeEmpty: string;
  /** Tree: announced when lazy children arrive: “Archive 2019, 12 items”. */
  treeLoaded: (name: string, count: number) => string;
  /** Tree: announced when they fail: “Couldn’t load Archive 2019”. */
  treeLoadFailedOf: (name: string) => string;
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
  moreActions: 'More actions',
  moreActionsFor: (name) => `More actions for ${name}`,
  swipeActionDone: (action, name) => (name ? `${action}: ${name}. Done.` : `${action}. Done.`),
  selectAllRows: 'Select all rows',
  selectRow: 'Select row',
  sortedBy: (column, direction) =>
    direction === 'none' ? `No longer sorted by ${column}` : `Sorted by ${column}, ${direction}`,
  noRows: 'Nothing to show',
  commandPalette: 'Command palette',
  commandSearch: 'Search commands',
  commandEmpty: (query) => (query ? `No results for “${query}”` : 'No results'),
  dropFiles: (multiple) => (multiple ? 'Drop files here' : 'Drop a file here'),
  browseFiles: 'Browse',
  fileTypeRejected: 'File type not accepted',
  fileTooLarge: (max) => `Over ${max}`,
  tooManyFiles: (max) => (max === 1 ? 'Only one file allowed' : `Over the ${max}-file limit`),
  filesAdded: (n) => (n === 1 ? '1 file added' : `${n} files added`),
  uploaded: 'Uploaded',
  uploadFailed: 'Upload failed',
  retry: 'Retry',
  treeLoadFailed: 'Couldn’t load',
  treeRetry: 'Try again',
  treeEmpty: 'Empty',
  treeLoaded: (name, count) =>
    count === 0 ? `${name} is empty` : `${name}, ${count} ${count === 1 ? 'item' : 'items'}`,
  treeLoadFailedOf: (name) => `Couldn’t load ${name}`,
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

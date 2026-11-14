import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type {
  BodyOwnProps,
  CloseOwnProps,
  ContentOwnProps,
  PopupOwnProps,
  RootOwnProps,
} from './sheet.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Sheet',
  slug: 'sheet',
  category: 'surfaces',
  status: 'stable',
  description:
    'A surface that rises from an edge with options or detail, keeping the screen behind it in view. Swipe it away.',
  whenToUse: [
    'Actions and detail for one item (a track, an order) on a phone.',
    'Filters and settings beside a list (side sheet).',
    'A queue or lyrics that can grow from half to full height (snap points).',
  ],
  whenNotToUse: [
    'A decision that blocks the task — use Dialog or AlertDialog.',
    'A list of commands from a button on desktop — use Menu.',
  ],
  import: "import { Sheet } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: '(none)',
      base: 'Drawer.Root',
      slot: 'Sheet.Root',
      className: '',
      description:
        'State owner: open, onOpenChange, snapPoints/snapPoint (detents), modal. Tracks when the entrance lands.',
      props: props<RootOwnProps>({
        side: {
          type: "'bottom' | 'top' | 'left' | 'right'",
          default: "'bottom'",
          description: 'Edge it lives on; swiping toward it dismisses.',
        },
      }),
    },
    {
      name: 'Trigger',
      element: 'button',
      base: 'Drawer.Trigger',
      slot: 'Sheet.Trigger',
      className: 'hj-sheet-trigger',
      description: 'Opens the sheet.',
    },
    {
      name: 'Portal',
      element: '(portal)',
      base: 'Drawer.Portal',
      slot: 'Sheet.Portal',
      className: '',
      description: 'Portals and re-applies the nearest Theme.',
    },
    {
      name: 'Backdrop',
      element: 'div',
      base: 'Drawer.Backdrop',
      slot: 'Sheet.Backdrop',
      className: 'hj-sheet-backdrop',
      description:
        'Black scrim: .55 when the sheet is fully up, lighter at a lower detent, thinning while swiped away.',
      cssVars: { '--hj-sheet-scrim': 'Scrim opacity at rest. Default .55.' },
    },
    {
      name: 'Viewport',
      element: 'div',
      base: 'Drawer.Viewport',
      slot: 'Sheet.Viewport',
      className: 'hj-sheet-viewport',
      description: 'Lays the sheet on its edge, 8px in.',
      cssVars: { '--hj-sheet-inset': 'Gap from the screen edge. Default 8px.' },
    },
    {
      name: 'Popup',
      element: 'div',
      base: 'Drawer.Popup',
      slot: 'Sheet.Popup',
      className: 'hj-sheet-popup',
      description:
        'The sheet: surface-2, hairline, radius xl. Follows the finger; settles on gentle.',
      props: props<PopupOwnProps>({
        size: {
          type: "'sm' | 'md' | 'lg'",
          default: "'md'",
          description: 'Side sheets 320/400/520 wide; bottom/top sheets 420/560/720 max.',
        },
      }),
      dataAttributes: {
        'data-side': 'bottom | top | left | right',
        'data-size': 'sm | md | lg',
        'data-swiping': 'Being dragged (Base UI).',
        'data-expanded': 'At the full-height snap point (Base UI).',
        'data-starting-style': 'Entering.',
        'data-ending-style': 'Leaving.',
      },
      cssVars: {
        '--hj-sheet-width': 'Width (side) or max width (bottom/top).',
        '--hj-sheet-radius': 'Corner radius. Default radius-xl.',
        '--drawer-swipe-movement-y': 'Live swipe offset (Base UI, read-only).',
        '--drawer-snap-point-offset': 'Offset of the current detent (Base UI, read-only).',
      },
    },
    {
      name: 'Content',
      element: '(portal)',
      slot: 'Sheet.Content',
      className: 'hj-sheet-popup',
      description: 'Shorthand: Portal + Backdrop + Viewport + Popup (+ Handle). Takes Popup props.',
      props: props<ContentOwnProps>({
        backdrop: { type: 'boolean', default: 'true', description: 'Draw the scrim.' },
        handle: {
          type: 'boolean',
          default: 'true for bottom/top',
          description: 'Draw the grab bar.',
        },
        container: { type: 'HTMLElement | ShadowRoot | RefObject', description: 'Portal target.' },
        keepMounted: {
          type: 'boolean',
          default: 'false',
          description: 'Keep in the DOM while closed.',
        },
      }),
    },
    {
      name: 'Handle',
      element: 'div',
      slot: 'Sheet.Handle',
      className: 'hj-sheet-handle',
      description: '36×4 grab bar (decorative).',
    },
    {
      name: 'Header',
      element: 'div',
      slot: 'Sheet.Header',
      className: 'hj-sheet-header',
      description: 'Title row; leaves room for the corner ✕.',
    },
    {
      name: 'Title',
      element: 'h2',
      base: 'Drawer.Title',
      slot: 'Sheet.Title',
      className: 'hj-sheet-title',
      description: 'Labels the sheet.',
    },
    {
      name: 'Description',
      element: 'p',
      base: 'Drawer.Description',
      slot: 'Sheet.Description',
      className: 'hj-sheet-description',
      description: 'Describes the sheet.',
    },
    {
      name: 'Body',
      element: 'div',
      base: 'Drawer.Content',
      slot: 'Sheet.Body',
      className: 'hj-sheet-body',
      description: 'Scrolling content. Can defer mounting until the entrance lands.',
      props: props<BodyOwnProps>({
        defer: {
          type: 'boolean',
          default: 'false',
          description:
            'Mount children after the entrance; hold the room with quiet lines (PRINCIPLES §12).',
        },
        placeholder: {
          type: 'ReactNode',
          description: 'Shown while deferred. Default: three quiet lines.',
        },
      }),
      dataAttributes: { 'data-pending': 'Children not mounted yet.' },
    },
    {
      name: 'Footer',
      element: 'div',
      slot: 'Sheet.Footer',
      className: 'hj-sheet-footer',
      description: 'Pinned action row with a hairline above.',
    },
    {
      name: 'Close',
      element: 'button',
      base: 'Drawer.Close',
      slot: 'Sheet.Close',
      className: 'hj-sheet-close',
      description: 'Closes; with no children renders the corner ✕.',
      props: props<CloseOwnProps>({
        icon: {
          type: 'boolean',
          default: 'children === undefined',
          description: 'Corner icon variant.',
        },
      }),
    },
    {
      name: 'SwipeArea',
      element: 'div',
      base: 'Drawer.SwipeArea',
      slot: 'Sheet.SwipeArea',
      className: 'hj-sheet-swipe-area',
      description: 'Edge strip that opens the sheet with a swipe.',
    },
  ],
  examples: [
    {
      file: 'queue',
      title: 'Bottom sheet with detents',
      description: 'Up next at half height, drag to full; the list mounts after the sheet lands.',
    },
    {
      file: 'filters',
      title: 'Side sheet',
      description: 'Filters beside a list, with a pinned footer and a zero-results state.',
    },
  ],
  accessibility: [
    'Modal by default: focus moves in and is trapped; Escape and an outside press close it.',
    'Title and Description label it; the handle is hidden from assistive tech.',
    'Swiping is an extra — the corner ✕ and Escape always work.',
  ],
  motion:
    'Rises from its edge on gentle, clamped; follows the finger 1:1 while swiped; the scrim thins with swipe progress; a flick dismisses faster (swipe strength). Reduced motion: the slide becomes a fade.',
  tokens: ['surface-2', 'line', 'scrim', 'radius-xl', 'ease-gentle-settle', 'dur-base', 'travel'],
  related: ['dialog', 'menu', 'toast'],
  baseUi: 'drawer',
});

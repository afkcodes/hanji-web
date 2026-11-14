import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { ItemOwnProps, RootOwnProps } from './drag-list.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'DragList',
  slug: 'drag-list',
  category: 'data',
  status: 'new',
  description:
    'A list you reorder by picking a row up: the handle lifts at once, a long press lifts from anywhere else, and every drag has a keyboard twin.',
  whenToUse: [
    'A queue, a playlist, ranked choices, the order of home-screen sections.',
    'Any order the person owns and will want to change by hand.',
  ],
  whenNotToUse: [
    'Sorting by a value (date, name) — use a sort control; dragging is for order nobody can compute.',
    'Moving between lists or into folders — that is a move action, not a reorder.',
  ],
  import: "import { DragList } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'ul',
      slot: 'DragList.Root',
      className: 'hj-drag-list',
      description:
        'Owns the drag: lifts, slides the others aside, drops, auto-scrolls near the scroller’s edges and announces every step. Calls onReorder once the row has settled. `DragList.reorder(list, from, to)` does the array move.',
      props: props<RootOwnProps>({
        onReorder: {
          type: '(from: number, to: number) => void',
          description: 'After the drop settles. Move your item; DragList.reorder does it.',
        },
        disabled: { type: 'boolean', description: 'No lifting (while saving, say).' },
        render: { type: 'RenderProp', description: 'Render as another element.' },
      }),
      dataAttributes: {
        'data-dragging': 'A row is lifted.',
        'data-disabled': 'Lifting is off.',
      },
    },
    {
      name: 'Item',
      element: 'li',
      slot: 'DragList.Item',
      className: 'hj-drag-list-item',
      description:
        'A row: flex, 56 tall, hairline below. Roving focus — one row is in the tab order; ↑↓ Home End move focus.',
      props: props<ItemOwnProps>({
        label: {
          type: 'string',
          description: 'What announcements call it: “Low Tide by Mira Okafor”.',
        },
        render: { type: 'RenderProp', description: 'Render as another element.' },
      }),
      dataAttributes: {
        'data-held': 'Lifted: ×1.03, surface-2 and the one row shadow.',
        'data-keyed': 'Lifted with the keyboard.',
        'data-settling': 'Dropping into its slot.',
      },
      cssVars: {
        '--hj-drag-list-row-height': 'Default 56px (scales with density).',
        '--hj-drag-list-inset': 'Where the hairline starts. Default 16px.',
      },
    },
    {
      name: 'Handle',
      element: 'span',
      slot: 'DragList.Handle',
      className: 'hj-drag-list-handle',
      description:
        'The grip (40×44). Pressing it lifts at once; aria-hidden — the row carries the keyboard twin.',
    },
  ],
  examples: [
    {
      file: 'queue',
      title: 'Up next',
      description: 'Grab a grip, long-press a row, or focus a row and press Space.',
    },
    {
      file: 'sections',
      title: 'Rows of different heights',
      description: 'The others make room for exactly the row you hold.',
    },
  ],
  accessibility: [
    'Keyboard twin: Space or Enter lifts, ↑↓ move, Space or Enter drops, Escape cancels; Tab cancels and moves on.',
    'Every lift, move, drop and cancel is announced politely (HanjiStrings.reorder*), and the list describes the keys once.',
    'Rows carry aria-roledescription “reorderable item” and the label you give.',
    'A long press, not a touch, lifts a row, so scrolling never starts a drag.',
  ],
  motion:
    'Held rows scale to 1.03 on snappy and cast the one row shadow. Others slide one slot on snappy-settle (clamped). The drop lands on gentle-settle. Past the ends the row follows at a third of the distance. Within 72 px of the scroller’s edge it auto-scrolls at up to 14 px a frame.',
  tokens: [
    'surface-2',
    'line',
    'fg-mute',
    'focus',
    'shadow-lift',
    'radius-sm',
    'dur-snappy',
    'dur-snappy-settle',
    'dur-gentle-settle',
  ],
  related: ['list', 'virtual-list'],
});

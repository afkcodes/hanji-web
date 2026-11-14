import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { RootOwnProps } from './virtual-list.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'VirtualList',
  slug: 'virtual-list',
  category: 'data',
  status: 'new',
  description:
    'A long list that renders only the rows on screen, built on virtua: rows measure themselves, the reading position holds still as rows above change size or older rows are prepended, scrollToIndex jumps anywhere, and orientation="horizontal" makes it a shelf.',
  whenToUse: [
    'Hundreds to millions of rows: a library, search results, logs, a long chat.',
    'Infinite loading: onRangeChange says when the end is near.',
    'A long shelf of covers or cards that scrolls sideways (orientation="horizontal").',
  ],
  whenNotToUse: [
    'Under ~100 rows — render them all with List; virtualising costs find-in-page and simplicity.',
    'Content people print or search with ⌘F as a whole document.',
  ],
  import: "import { VirtualList } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      slot: 'VirtualList.Root',
      className: 'hj-virtual-list',
      description:
        'The scroll viewport (focusable) around a labelled <ul>. Children is a function of the index; each row is an <li> with aria-setsize and aria-posinset.',
      props: props<RootOwnProps>({
        count: { type: 'number', description: 'How many rows.' },
        children: { type: '(index: number) => ReactNode', description: 'Draws row `index`.' },
        orientation: {
          type: "'vertical' | 'horizontal'",
          default: "'vertical'",
          description:
            'Rows down a column, or items along a shelf. A shelf needs a height: the item’s (plus the scrollbar where it takes space).',
        },
        estimateSize: {
          type: 'number',
          description:
            'Height (width when horizontal) before measuring. Omit it and virtua estimates from the rows it has measured.',
        },
        overscan: {
          type: 'number',
          default: '6',
          description: 'Rows’ worth of space kept rendered beyond each edge.',
        },
        gap: {
          type: 'number',
          default: '0',
          description: 'Space between rows (items, when horizontal) in px.',
        },
        getKey: {
          type: '(index: number) => Key',
          description: 'A stable key per row (an id). Default: the index.',
        },
        onRangeChange: {
          type: '(range: { start: number; end: number }) => void',
          description: 'The visible rows changed — fetch more as `end` nears `count`.',
        },
        shift: {
          type: 'boolean',
          description:
            'Set while adding rows to the start (older messages) so the view holds still; not otherwise.',
        },
        keepMounted: {
          type: 'readonly number[]',
          description: 'Rows that stay mounted off screen — one being edited, a playing track.',
        },
        actionsRef: {
          type: 'Ref<{ scrollToIndex(index, { align?, behavior? }), scrollTo(px), scrollBy(px) }>',
          description: 'Jump to a row (align start · center · end · auto) or an offset.',
        },
        render: { type: 'RenderProp', description: 'Render as another element.' },
      }),
      cssVars: {
        '--hj-virtual-list-height':
          'Viewport height when you don’t size the Root. Default 480px; 200px for a horizontal shelf.',
      },
    },
  ],
  examples: [
    {
      file: 'library',
      title: 'Ten thousand tracks',
      description: 'Only the rows on screen exist; jump anywhere with scrollToIndex.',
    },
    {
      file: 'shelf',
      title: 'A horizontal shelf',
      description:
        'orientation="horizontal": 2,400 albums along one row, paged a screen at a time; the album cut off at the edge leads the next page.',
    },
    {
      file: 'messages',
      title: 'Rows of any height',
      description: 'Messages measure themselves; the list never jumps under you.',
    },
  ],
  accessibility: [
    'Rows are listitems with aria-setsize and aria-posinset, so “row 4,203 of 10,000” is read correctly.',
    'The viewport is focusable (tabindex 0) so the keyboard can scroll it — arrow keys run down a list, left and right along a shelf.',
    'scrollToIndex with behavior smooth jumps instead of gliding when reduced motion is on.',
    'Find-in-page cannot see rows that are not rendered — offer search for long lists.',
  ],
  motion:
    'None of its own: scrolling is the browser’s. virtua corrects the scroll position as rows above the viewport are measured or prepended, so nothing moves under the reader.',
  tokens: ['focus', 'fg', 'radius-sm'],
  related: ['list', 'drag-list', 'scroll-area'],
});

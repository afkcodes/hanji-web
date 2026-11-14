import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { RootOwnProps } from './virtual-list.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'VirtualList',
  slug: 'virtual-list',
  category: 'data',
  status: 'new',
  description:
    'A long list that renders only the rows on screen: rows measure themselves, the reading position holds still as rows above change size, and scrollToIndex jumps anywhere.',
  whenToUse: [
    'Hundreds to millions of rows: a library, search results, logs, a long chat.',
    'Infinite loading: onRangeChange says when the end is near.',
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
        estimateSize: {
          type: 'number | ((index: number) => number)',
          default: '56',
          description: 'Height before measuring. Close estimates mean steadier scrollbars.',
        },
        overscan: { type: 'number', default: '6', description: 'Rows kept beyond each edge.' },
        gap: { type: 'number', default: '0', description: 'Space between rows in px.' },
        getKey: {
          type: '(index: number) => Key',
          description: 'A stable key per row (an id). Default: the index.',
        },
        onRangeChange: {
          type: '(range: { start: number; end: number }) => void',
          description: 'The visible rows changed — fetch more as `end` nears `count`.',
        },
        actionsRef: {
          type: 'Ref<{ scrollToIndex(index, { align?, behavior? }) }>',
          description: 'Jump to a row: align start · center · end · auto.',
        },
        render: { type: 'RenderProp', description: 'Render as another element.' },
      }),
      cssVars: {
        '--hj-virtual-list-height': 'Viewport height when you don’t size the Root. Default 480px.',
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
      file: 'messages',
      title: 'Rows of any height',
      description: 'Messages measure themselves; the list never jumps under you.',
    },
  ],
  accessibility: [
    'Rows are listitems with aria-setsize and aria-posinset, so “row 4,203 of 10,000” is read correctly.',
    'The viewport is focusable (tabindex 0) so the keyboard can scroll it.',
    'Find-in-page cannot see rows that are not rendered — offer search for long lists.',
  ],
  motion:
    'None of its own: scrolling is the browser’s. Rows that grow above the viewport adjust scrollTop so nothing moves under the reader.',
  tokens: ['focus', 'fg', 'radius-sm'],
  related: ['list', 'drag-list', 'scroll-area'],
});

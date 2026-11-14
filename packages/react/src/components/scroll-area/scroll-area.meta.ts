import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { BoxOwnProps, ViewportOwnProps } from './scroll-area.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'ScrollArea',
  slug: 'scroll-area',
  category: 'surfaces',
  status: 'stable',
  description:
    'A native scroll container with a thin overlay scrollbar and edges that fade where content continues.',
  whenToUse: [
    'A fixed-height region inside a page or popup: a queue, a long menu, a code block, a shelf.',
  ],
  whenNotToUse: ['The page itself — let the document scroll.', 'Tiny lists that fit.'],
  import: "import { ScrollArea } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      base: 'ScrollArea.Root',
      slot: 'ScrollArea.Root',
      className: 'hj-scroll-area',
      description: 'Sizes the area. Give it a height or max-height.',
    },
    {
      name: 'Viewport',
      element: 'div',
      base: 'ScrollArea.Viewport',
      slot: 'ScrollArea.Viewport',
      className: 'hj-scroll-area-viewport',
      description: 'The native scroller, focusable when it overflows.',
      props: props<ViewportOwnProps>({
        fade: {
          type: 'boolean',
          default: 'true',
          description: 'Fade the edges where there is more content.',
        },
      }),
      dataAttributes: {
        'data-fade': 'Edge fade on.',
        'data-has-overflow-y': 'Content is taller than the viewport (Base UI).',
        'data-scrolling': 'Scrolling now (Base UI).',
      },
      cssVars: {
        '--hj-scroll-area-fade': 'Edge fade length. Default 24px.',
        '--scroll-area-overflow-y-start': 'Distance scrolled from the top (Base UI, read-only).',
      },
    },
    {
      name: 'Content',
      element: 'div',
      base: 'ScrollArea.Content',
      slot: 'ScrollArea.Content',
      className: 'hj-scroll-area-content',
      description: 'Wraps the content.',
    },
    {
      name: 'Scrollbar',
      element: 'div',
      base: 'ScrollArea.Scrollbar',
      slot: 'ScrollArea.Scrollbar',
      className: 'hj-scroll-area-scrollbar',
      description: '10px overlay rail; shows on hover or scroll. Renders its Thumb when childless.',
      dataAttributes: {
        'data-orientation': 'vertical | horizontal',
        'data-hovering': 'Pointer over the area.',
        'data-scrolling': 'Scrolling.',
      },
    },
    {
      name: 'Thumb',
      element: 'div',
      base: 'ScrollArea.Thumb',
      slot: 'ScrollArea.Thumb',
      className: 'hj-scroll-area-thumb',
      description: '6px pill at fg 28%; firms up and widens when reached for.',
      cssVars: { '--hj-scroll-area-thumb': 'Thumb colour.' },
    },
    {
      name: 'Corner',
      element: 'div',
      base: 'ScrollArea.Corner',
      slot: 'ScrollArea.Corner',
      className: 'hj-scroll-area-corner',
      description: 'Where two scrollbars meet.',
    },
    {
      name: 'Box',
      element: 'div',
      slot: 'ScrollArea.Root',
      className: 'hj-scroll-area',
      description: 'Shorthand: Root + Viewport + Content + scrollbar(s).',
      props: props<BoxOwnProps>({
        orientation: {
          type: "'vertical' | 'horizontal' | 'both'",
          default: "'vertical'",
          description: 'Which scrollbars to draw.',
        },
        fade: { type: 'boolean', default: 'true', description: 'Edge fade.' },
      }),
    },
  ],
  examples: [
    {
      file: 'queue',
      title: 'Vertical',
      description: 'A queue in a fixed height, fading where it continues.',
    },
    {
      file: 'shelf',
      title: 'Horizontal shelf',
      description: 'A row of covers that scrolls sideways.',
    },
  ],
  accessibility: [
    'Uses native scrolling: wheel, touch, keyboard and assistive tech all work.',
    'The viewport is focusable when it overflows, with a visible focus ring.',
  ],
  motion:
    'The rail fades in over 260 ms on hover and instantly while scrolling; the thumb firms up and widens on snappy.',
  tokens: ['fg', 'focus', 'radius-pill', 'dur-base'],
  related: ['sheet', 'menu'],
  baseUi: 'scroll-area',
});

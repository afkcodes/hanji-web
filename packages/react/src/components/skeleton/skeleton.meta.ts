import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { RootOwnProps, TextOwnProps } from './skeleton.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Skeleton',
  slug: 'skeleton',
  category: 'atoms',
  status: 'stable',
  description:
    'A still block in the shape of what is coming, so the page keeps its layout while it loads.',
  whenToUse: [
    'The first load of a list, card or profile whose shape you know.',
    'Anything that would otherwise jump when its content arrives.',
  ],
  whenNotToUse: [
    'A short wait inside a control — use Spinner.',
    'Refreshing content that is already on screen — keep the old content until the new arrives.',
  ],
  import: "import { Skeleton } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'span',
      slot: 'Skeleton.Root',
      className: 'hj-skeleton',
      description: 'One block: rect, circle or a line of text. aria-hidden.',
      props: props<RootOwnProps>({
        shape: {
          type: "'rect' | 'circle' | 'text'",
          default: "'rect'",
          description:
            'rect 16px tall by default · circle 40 · text .72em at the current font size.',
        },
        width: { type: 'number | string', description: 'px or any CSS length.' },
        height: {
          type: 'number | string',
          description: 'px or any CSS length. Circles take width.',
        },
        render: {
          type: 'ReactElement | (props, state) => ReactElement',
          description: 'Replace the element.',
        },
      }),
      dataAttributes: { 'data-shape': 'rect | circle | text' },
      cssVars: {
        '--hj-skeleton-color': 'Block tint. Default fg at 7% — reads on any paper step.',
        '--hj-skeleton-highlight': 'Sweep tint. Default fg at 6%.',
        '--hj-skeleton-radius': 'Corner radius for rects. Default radius-xs.',
      },
    },
    {
      name: 'Text',
      element: 'span',
      slot: 'Skeleton.Text',
      className: 'hj-skeleton-text',
      description: 'A paragraph of text lines; the last is shorter.',
      props: props<TextOwnProps>({
        lines: { type: 'number', default: '3', description: 'Number of lines.' },
        lastLine: {
          type: 'number | string',
          default: "'60%'",
          description: 'Width of the last line.',
        },
        render: {
          type: 'ReactElement | (props, state) => ReactElement',
          description: 'Replace the element.',
        },
      }),
    },
  ],
  examples: [
    {
      file: 'list',
      title: 'Loading a list',
      description: 'Rows in the shape of the real ones; Load swaps in the content.',
    },
    { file: 'card', title: 'Loading a card', description: 'Cover, title and meta lines.' },
  ],
  accessibility: [
    'Every block is aria-hidden; set aria-busy="true" on the region and announce completion if it matters.',
  ],
  motion:
    'Still by default; one soft highlight passes in 1000 ms, then rests 450 ms. It is ambient decoration, so it pauses under reduced motion (hanji retired the opacity pulse: invisible on dark, too “alive” with the sweep).',
  tokens: ['fg', 'radius-xs', 'ambient', 'ease-out'],
  related: ['spinner', 'progress', 'list'],
});

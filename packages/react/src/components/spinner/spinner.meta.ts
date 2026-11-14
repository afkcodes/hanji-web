import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { SpinnerOwnProps } from './spinner.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Spinner',
  slug: 'spinner',
  category: 'atoms',
  status: 'new',
  description: 'An ink ring for work that takes a moment and has no measurable progress.',
  whenToUse: [
    'A wait with no known length: fetching lyrics, syncing, saving.',
    'Inside a button that is busy (Button’s loading prop already draws one).',
  ],
  whenNotToUse: [
    'Work with a known amount left — use Progress so the user sees how long.',
    'Loading a whole layout — use Skeleton so the page keeps its shape.',
  ],
  import: "import { Spinner } from '@hanji/react';",
  parts: [
    {
      name: 'Spinner',
      element: 'span',
      slot: 'Spinner',
      className: 'hj-spinner',
      description: 'The ring. Turns at a constant 900 ms; the tail fades behind a round head.',
      props: props<SpinnerOwnProps>({
        size: {
          type: "'sm' | 'md' | 'lg'",
          default: "'md'",
          description: '16 / 20 / 40 px. Stroke 2 / 2 / 3.',
        },
        tone: {
          type: "'accent' | 'current'",
          default: "'accent'",
          description: 'current takes the surrounding text colour (inside buttons and links).',
        },
        delay: {
          type: 'boolean | number',
          default: 'false',
          description:
            'Appear only after the wait passes this long: true = 400 ms. Fast work never flashes a ring.',
        },
        label: { type: 'string', default: 'strings.loading', description: 'Accessible name.' },
        render: {
          type: 'ReactElement | (props, state) => ReactElement',
          description: 'Replace the element.',
        },
      }),
      dataAttributes: {
        'data-size': 'sm | md | lg',
        'data-tone': 'accent | current',
        'data-waiting': 'Present while the delay runs (hidden, not announced).',
      },
      cssVars: {
        '--hj-spinner-size': 'Diameter.',
        '--hj-spinner-stroke': 'Ring thickness.',
        '--hj-spinner-color': 'Ink.',
      },
    },
  ],
  examples: [
    {
      file: 'sizes',
      title: 'Sizes and places',
      description: 'Inline, in a button and in a panel.',
    },
    {
      file: 'delay',
      title: 'Delay',
      description: 'A fast and a slow load: only the slow one earns a ring.',
    },
  ],
  accessibility: [
    'role="progressbar" with no value (indeterminate) and an accessible name from strings.loading.',
    'While the delay runs it is hidden and not announced.',
    'Mark the region being loaded with aria-busy="true".',
  ],
  motion:
    'One element turns at a constant 900 ms with no easing — any change of speed in a spinner reads as a stall. Under reduced motion the ring holds still and pulses .55 ↔ .9 (it is feedback, so it survives).',
  tokens: ['accent', 'anim-spin', 'dur-base', 'ease-out'],
  related: ['progress', 'skeleton', 'button'],
});

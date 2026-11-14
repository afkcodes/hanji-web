import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { CountOwnProps, ItemOwnProps, RootOwnProps, TrackOwnProps } from './steps.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Steps',
  slug: 'steps',
  category: 'navigation',
  status: 'new',
  description:
    'Shows progress through a short ordered task: where you are, what’s done, what’s left.',
  whenToUse: ['Onboarding, checkout, an import or export — 3 to 6 steps done in order.'],
  whenNotToUse: [
    'Views you can visit in any order — use Tabs.',
    'Continuous progress (a download) — use Progress.',
    'A history of events with times — use Timeline.',
  ],
  import: "import { Steps } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      slot: 'Steps.Root',
      className: 'hj-steps-root',
      description:
        'Owns the current step and the total. Label it (aria-label) with the task’s name.',
      props: props<RootOwnProps>({
        value: {
          type: 'number',
          description: 'Current step, 0-based. Equal to total when every step is done.',
        },
        total: { type: 'number', description: 'Number of steps.' },
      }),
      dataAttributes: { 'data-complete': 'Every step is done — fill and count turn success.' },
    },
    {
      name: 'Count',
      element: 'span',
      slot: 'Steps.Count',
      className: 'hj-steps-count',
      description: '“Step 2 of 4” as an eyebrow.',
      props: props<CountOwnProps>({
        format: {
          type: '(value, total) => ReactNode',
          description: 'Localise or reword. Default “Step 2 of 4” / “All 4 done”.',
        },
      }),
    },
    {
      name: 'Track',
      element: 'div',
      slot: 'Steps.Track',
      className: 'hj-steps-track',
      description: 'A segmented bar (role="progressbar"), one 4px segment per step.',
      props: props<TrackOwnProps>({
        valueText: {
          type: '(value, total) => string',
          description: 'aria-valuetext. Default “Step 2 of 4”.',
        },
      }),
      cssVars: {
        '--hj-steps-track': 'Segment height. Default 4px.',
        '--hj-steps-gap': 'Gap between segments and columns. Default 4px.',
      },
    },
    {
      name: 'List',
      element: 'ol',
      slot: 'Steps.List',
      className: 'hj-steps-list',
      description: 'Labels aligned to the segments. Children are Steps.Item.',
    },
    {
      name: 'Item',
      element: 'li',
      slot: 'Steps.Item',
      className: 'hj-steps-item',
      description:
        'A step: numbered marker (a check once done), label, optional description. Current has aria-current="step".',
      props: props<ItemOwnProps>({
        description: { type: 'ReactNode', description: 'A short line under the label.' },
      }),
      dataAttributes: { 'data-state': 'complete | current | upcoming' },
    },
  ],
  examples: [
    {
      file: 'checkout',
      title: 'Checkout',
      description: 'Back and Continue move the fill; the last step completes it.',
    },
    {
      file: 'compact',
      title: 'Track only',
      description: 'A compact count and track for a sheet header, part-way through.',
    },
  ],
  accessibility: [
    'Track is a progressbar with aria-valuetext “Step 2 of 4”.',
    'The current item has aria-current="step"; done items announce “, done”.',
    'Steps are status, not navigation — let people go back with a Back button.',
    'On narrow screens only the current step’s label shows.',
  ],
  motion:
    'Reaching a step fills one segment by scaleX on snappy, clamped (no overshoot past the gap). The marker turns accent and settles from .8. Under reduced motion both become 120 ms fades.',
  tokens: [
    'accent',
    'on-accent',
    'success',
    'line',
    'fg-mute',
    'type-eyebrow',
    'ease-snappy-settle',
  ],
  related: ['progress', 'pagination', 'tabs'],
});

import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { SeparatorOwnProps } from './separator.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Separator',
  slug: 'separator',
  category: 'atoms',
  status: 'stable',
  description: 'A hairline between groups — hanji’s way of separating instead of boxing.',
  whenToUse: [
    'Between rows of a list (inset, aligned to the text).',
    'Between groups in a menu, toolbar or settings page.',
    'An “or” between two ways to do something (sign in with a link, or with a password).',
  ],
  whenNotToUse: ['To make a card — hanji does not wrap content in boxes; use space and a rule.'],
  import: "import { Separator } from '@hanji/react';",
  parts: [
    {
      name: 'Separator',
      element: 'div',
      base: 'Separator',
      slot: 'Separator',
      className: 'hj-separator',
      description: 'A 1px rule in line colour, horizontal or vertical (orientation, from Base UI).',
      props: props<SeparatorOwnProps>({
        variant: {
          type: "'full' | 'inset'",
          default: "'full'",
          description:
            'inset starts where row text starts (after a 40px leading item + 16px padding + 16px gap = 72).',
        },
        label: { type: 'ReactNode', description: 'A short word sitting in the rule, e.g. “or”.' },
      }),
      dataAttributes: {
        'data-orientation': 'horizontal | vertical (Base UI)',
        'data-variant': 'full | inset',
        'data-label': 'Present when labelled.',
      },
      cssVars: {
        '--hj-separator-color': 'Rule colour. Default line.',
        '--hj-separator-inset': 'Left inset for variant="inset". Default 72px.',
        '--hj-separator-space': 'Margin either side of the rule.',
      },
    },
  ],
  examples: [
    {
      file: 'rows',
      title: 'Between rows',
      description: 'Inset rules aligned to row text, and a full rule between groups.',
    },
    {
      file: 'labelled',
      title: 'Labelled and vertical',
      description: 'An “or” between two sign-in methods, and a vertical rule in a toolbar.',
    },
  ],
  accessibility: [
    'role="separator" with aria-orientation (Base UI). The label is visual; the rule itself is not read as text.',
  ],
  tokens: ['line', 'hairline', 'fg-mute', 'type-eyebrow'],
  related: ['list', 'menu', 'toolbar'],
  baseUi: 'separator',
});

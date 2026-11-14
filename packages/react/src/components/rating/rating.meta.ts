import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { DisplayOwnProps, RootOwnProps } from './rating.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Rating',
  slug: 'rating',
  category: 'controls',
  status: 'new',
  description: 'Choose one to five stars, or read an average as stars and a number.',
  whenToUse: [
    'Rating an album, an episode or a recording once listened.',
    'Showing an average with how many ratings make it (Rating.Display).',
  ],
  whenNotToUse: ['A like / dislike — use a Toggle.', 'Precise scores — print the number.'],
  import: "import { Rating } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      base: 'RadioGroup',
      slot: 'Rating.Root',
      className: 'hj-rating',
      description:
        'value / defaultValue (number | null) / onValueChange(number), name, required, disabled, readOnly. Renders `max` star radios. Hover previews without committing. Name it with aria-label or aria-labelledby.',
      props: props<RootOwnProps>({
        max: { type: 'number', default: '5', description: 'Number of stars.' },
        size: {
          type: "'sm' | 'md' | 'lg'",
          default: "'md'",
          description: 'Star size 20 / 28 / 36.',
        },
        getLabel: {
          type: '(value: number) => string',
          default: '“n star(s)”',
          description: 'Accessible name per star; localise it.',
        },
      }),
      dataAttributes: {
        'data-preview': 'The pointer is hovering a star (preview, not committed).',
        'data-size': 'sm | md | lg',
        'data-disabled': 'Disabled.',
        '[star] data-lit': 'This star is filled (≤ the shown value).',
        '[star] data-checked': 'This star is the chosen value.',
      },
      cssVars: {
        '--hj-rating-star': 'Star size.',
        '--hj-rating-color': 'Fill colour. Default accent.',
      },
    },
    {
      name: 'Display',
      element: 'span',
      slot: 'Rating.Display',
      className: 'hj-rating-display',
      description:
        'Read-only average: partial stars + “4.6 · 2,184 ratings”, announced as one sentence (role="img").',
      props: props<DisplayOwnProps>({
        value: { type: 'number', description: 'The average; partial stars fill to the fraction.' },
        max: { type: 'number', default: '5', description: 'Number of stars.' },
        count: { type: 'number', description: 'How many ratings it averages.' },
        size: { type: "'sm' | 'md'", default: "'sm'", description: 'Star size 14 / 18.' },
        showValue: {
          type: 'boolean',
          default: 'true',
          description: 'Print the number and count after the stars.',
        },
        locale: { type: 'Intl.LocalesArgument', description: 'Number formatting.' },
      }),
    },
  ],
  examples: [
    {
      file: 'rate',
      title: 'Rate an album',
      description:
        'Hover to preview, click to commit; the stars fill in turn and the chosen one pops.',
    },
    {
      file: 'display',
      title: 'Averages',
      description:
        'Read-only averages with counts, including a partial star, and a disabled rating.',
    },
  ],
  accessibility: [
    'A radio group: one Tab stop, arrows move and select, each star has an accessible name (“4 stars”).',
    'Display is role="img" with a full sentence (“Rated 4.6 out of 5 from 2,184 ratings”); its glyphs are hidden.',
  ],
  motion:
    'Committing fills the stars one after another (24 ms stagger) and the chosen star pops from .72 on bouncy — the component’s one celebration. Hover preview is instant and lighter. Reduced motion: no stagger, no overshoot.',
  tokens: ['accent', 'fg', 'fg-mute', 'stagger', 'ease-bouncy', 'dur-bouncy', 'touch'],
  related: ['toggle', 'radio-group'],
  baseUi: 'radio-group',
});

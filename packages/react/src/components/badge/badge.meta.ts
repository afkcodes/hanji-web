import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { AnchorOwnProps, RootOwnProps } from './badge.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Badge',
  slug: 'badge',
  category: 'atoms',
  status: 'stable',
  description:
    'A count or a dot on top of something: unread messages, new releases, items waiting.',
  whenToUse: [
    'A number of new or waiting things on a tab, icon or avatar.',
    'A dot when there is something new but the count does not matter.',
  ],
  whenNotToUse: [
    'A state (Synced, Failed) — use Status.',
    'A neutral total in a row — write the number as text; colour says “problem”.',
  ],
  import: "import { Badge } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'span',
      slot: 'Badge.Root',
      className: 'hj-badge',
      description:
        '18px pill with a tabular count (99+), or an 8px dot. Renders nothing at 0 unless showZero.',
      props: props<RootOwnProps>({
        count: { type: 'number', default: '0', description: 'The number. Above max reads “max+”.' },
        max: { type: 'number', default: '99', description: 'Cap before “+”.' },
        dot: { type: 'boolean', default: 'false', description: 'An 8px dot instead of a number.' },
        showZero: { type: 'boolean', default: 'false', description: 'Render a 0 badge.' },
        tone: {
          type: "'accent' | 'danger' | 'neutral'",
          default: "'accent'",
          description:
            'accent = new; danger = a problem needing attention; neutral = a plain count.',
        },
        label: {
          type: 'string',
          description: 'Accessible text (“3 unread messages”). Defaults to the count.',
        },
        render: {
          type: 'ReactElement | (props, state) => ReactElement',
          description: 'Replace the element.',
        },
      }),
      dataAttributes: {
        'data-tone': 'accent | danger | neutral',
        'data-dot': 'Present for the dot.',
        'data-wide': 'Present when the text is more than one character (padded pill).',
      },
      cssVars: { '--hj-badge-height': 'Pill height. Default 18px.' },
    },
    {
      name: 'Anchor',
      element: 'span',
      slot: 'Badge.Anchor',
      className: 'hj-badge-anchor',
      description:
        'Wraps the badged thing and pins a Badge.Root to its corner with a 2px paper ring.',
      props: props<AnchorOwnProps>({
        placement: {
          type: "'top-end' | 'bottom-end'",
          default: "'top-end'",
          description: 'Corner.',
        },
        shape: {
          type: "'circle' | 'rect'",
          default: "'rect'",
          description: 'circle tucks the badge toward a round avatar.',
        },
        render: {
          type: 'ReactElement | (props, state) => ReactElement',
          description: 'Replace the element.',
        },
      }),
      dataAttributes: { 'data-placement': 'top-end | bottom-end', 'data-shape': 'circle | rect' },
      cssVars: { '--hj-badge-ring': 'Ring colour separating badge from the anchor. Default bg.' },
    },
  ],
  examples: [
    {
      file: 'counts',
      title: 'Counts and dots',
      description: '1, 12, 99+, a dot and the three tones; add one to see the pop.',
    },
    { file: 'anchored', title: 'Anchored', description: 'On an icon button and on an avatar.' },
  ],
  accessibility: [
    'role="status" with the count (or your label) as its name, so a changing count is announced politely.',
    'Give dots a label when they mean something specific (“New releases”).',
  ],
  motion:
    'When the count changes the badge pops once from .72 on the bouncy spring (scale only). Reduced motion turns it into a fast ease-out.',
  tokens: ['accent', 'on-accent', 'danger', 'bg', 'radius-pill', 'ease-bouncy', 'dur-bouncy'],
  related: ['status', 'avatar', 'tab-bar'],
});

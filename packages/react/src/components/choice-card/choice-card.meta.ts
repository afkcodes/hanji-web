import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { ItemOwnProps, RootOwnProps } from './choice-card.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'ChoiceCard',
  slug: 'choice-card',
  category: 'controls',
  status: 'new',
  description: 'A radio group drawn as cards, each stating what choosing it will cost.',
  whenToUse: [
    'Two to four options whose consequences differ and should be read before choosing: plans, quality tiers, delivery speeds.',
  ],
  whenNotToUse: [
    'Options a short label explains — use RadioGroup or SegmentedControl.',
    'Picking several — use CheckboxGroup.',
  ],
  import: "import { ChoiceCard } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      base: 'RadioGroup',
      slot: 'ChoiceCard.Root',
      className: 'hj-choice-card',
      description:
        'A grid of cards with radio-group semantics (value, onValueChange, name, required).',
      props: props<RootOwnProps>({
        columns: {
          type: "1 | 2 | 3 | 4 | 'auto'",
          default: "'auto'",
          description: 'Cards per row; auto fits 220px cards.',
        },
      }),
      dataAttributes: { 'data-columns': '1 | 2 | 3 | 4 | auto' },
      cssVars: { '--hj-choice-card-min': 'Minimum card width in auto mode. Default 220px.' },
    },
    {
      name: 'Item',
      element: 'span (+ hidden input)',
      base: 'Radio.Root',
      slot: 'ChoiceCard.Item',
      className: 'hj-choice-card-item',
      description: 'One card, a radio. Requires value. Draws its ring in the corner.',
      props: props<ItemOwnProps>({
        indicator: {
          type: 'boolean',
          default: 'true',
          description: 'Draw the radio ring in the top-right corner.',
        },
      }),
      dataAttributes: {
        'data-checked': 'Selected.',
        'data-disabled': 'Disabled.',
        'data-indicator': 'The ring is drawn.',
      },
      cssVars: {
        '--hj-choice-card-radius': 'Corner radius. Default radius-md.',
        '--hj-choice-card-padding': 'Inner padding. Default space-4.',
      },
    },
    {
      name: 'Title',
      element: 'span',
      slot: 'ChoiceCard.Title',
      className: 'hj-choice-card-title',
      description: 'The option name (heading role).',
    },
    {
      name: 'Description',
      element: 'span',
      slot: 'ChoiceCard.Description',
      className: 'hj-choice-card-description',
      description: 'A sentence about it.',
    },
    {
      name: 'Consequence',
      element: 'span',
      slot: 'ChoiceCard.Consequence',
      className: 'hj-choice-card-consequence',
      description: 'What it costs, in mono at the foot; turns accent when chosen.',
    },
  ],
  examples: [
    {
      file: 'quality',
      title: 'Streaming quality',
      description: 'Three tiers with their data cost; Lossless is locked behind a plan.',
    },
    { file: 'plans', title: 'Plans', description: 'Two columns, a price as the consequence.' },
  ],
  accessibility: [
    'Each card is a radio inside a radiogroup: arrows move and select, Tab enters on the chosen card.',
    'Everything inside the card is its accessible name — keep it short; put long detail in Description.',
  ],
  motion:
    'Selection is colour plus the ring dot springing in (snappy). The card dips to .985 on press — big surfaces move less than buttons.',
  tokens: [
    'surface',
    'accent',
    'line',
    'fg-dim',
    'fg-mute',
    'radius-md',
    'type-heading',
    'type-mono',
  ],
  related: ['radio-group', 'segmented-control'],
  baseUi: 'radio-group',
});

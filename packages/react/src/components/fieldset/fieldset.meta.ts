import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { LegendOwnProps } from './fieldset.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Fieldset',
  slug: 'fieldset',
  category: 'controls',
  status: 'stable',
  description:
    'Groups related fields under a legend; consecutive groups are divided by a hairline, never boxed.',
  whenToUse: [
    'Sections of a long form or settings page.',
    'A set of fields that share a question (an address, a contact).',
  ],
  whenNotToUse: ['A single field — the Field label is enough.'],
  import: "import { Fieldset } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'fieldset',
      base: 'Fieldset.Root',
      slot: 'Fieldset.Root',
      className: 'hj-fieldset',
      description: 'The group. `disabled` disables every Field inside.',
      dataAttributes: { 'data-disabled': 'Disabled.' },
      cssVars: { '--hj-fieldset-gap': 'Gap between fields. Default space-4.' },
    },
    {
      name: 'Legend',
      element: 'div',
      base: 'Fieldset.Legend',
      slot: 'Fieldset.Legend',
      className: 'hj-fieldset-legend',
      description: 'Names the group; announced with each field.',
      props: props<LegendOwnProps>({
        variant: {
          type: "'title' | 'eyebrow'",
          default: "'title'",
          description: 'title = section heading; eyebrow = quiet caps label.',
        },
      }),
    },
    {
      name: 'Description',
      element: 'p',
      slot: 'Fieldset.Description',
      className: 'hj-fieldset-description',
      description: 'One line under the legend.',
    },
  ],
  examples: [
    {
      file: 'sections',
      title: 'Settings sections',
      description: 'Two groups divided by a hairline; the second disabled by policy.',
    },
    {
      file: 'legends',
      title: 'Eyebrow legend',
      description: 'A small group with a quiet caps legend.',
    },
  ],
  accessibility: [
    'Renders a real fieldset with a legend, so screen readers name the group with each field.',
    'Disabling the Root disables its fields and says so in the legend tone.',
  ],
  tokens: ['line', 'type-subheading', 'type-eyebrow', 'space-4', 'space-6'],
  related: ['form', 'field'],
  baseUi: 'fieldset',
});

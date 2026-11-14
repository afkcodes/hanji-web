import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { RootOwnProps } from './checkbox.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Checkbox',
  slug: 'checkbox',
  category: 'controls',
  status: 'stable',
  description: 'A box you tick for a yes/no choice that takes effect when the form is saved.',
  whenToUse: [
    'Consent and options inside a form with a Save or Submit (“Accept the terms”).',
    'Picking several items from a list — see CheckboxGroup for a parent “Select all”.',
  ],
  whenNotToUse: [
    'A setting that applies immediately — use Switch.',
    'Exactly one of several options — use RadioGroup or SegmentedControl.',
  ],
  import: "import { Checkbox } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'span (+ hidden input)',
      base: 'Checkbox.Root',
      slot: 'Checkbox.Root',
      className: 'hj-checkbox',
      description:
        'The 22px box. Renders its Indicator when given no children. Label by wrapping in <label> or Field.',
      props: props<RootOwnProps>({
        size: {
          type: "'sm' | 'md'",
          default: "'md'",
          description: 'md 22 (hanji), sm 18. Hit area stays 44.',
        },
      }),
      dataAttributes: {
        'data-checked': 'Ticked.',
        'data-unchecked': 'Not ticked.',
        'data-indeterminate': 'Mixed (a parent with some children ticked).',
        'data-disabled': 'Disabled.',
        'data-invalid': 'Fails validation (e.g. required).',
        'data-size': 'sm | md',
      },
      cssVars: {
        '--hj-checkbox-size': 'Box size.',
        '--hj-checkbox-radius': 'Corner radius. Default 6px.',
      },
    },
    {
      name: 'Indicator',
      element: 'span',
      base: 'Checkbox.Indicator',
      slot: 'Checkbox.Indicator',
      className: 'hj-checkbox-indicator',
      description:
        'The tick (or dash when indeterminate). Kept mounted by default so it can draw itself out as well as in.',
    },
  ],
  examples: [
    {
      file: 'consent',
      title: 'Labelled, required and disabled',
      description:
        'Terms that must be accepted, with the error state, plus disabled and read-only boxes.',
    },
    {
      file: 'states',
      title: 'States',
      description: 'Off, on, mixed and disabled side by side, in both sizes.',
    },
  ],
  accessibility: [
    'role="checkbox" with aria-checked (true / false / mixed); Space toggles.',
    'A hidden native input carries the value into forms; `name`, `required` and `value` work as expected.',
    'The drawing is 22px but the hit area is 44px.',
  ],
  motion:
    'The tick draws itself (stroke-dashoffset) on snappy, settled, 40 ms after the fill so it lands on colour; unticking un-draws in 180 ms. The box dips to .92 on press.',
  tokens: [
    'accent',
    'on-accent',
    'surface',
    'fg',
    'danger',
    'radius-xs',
    'ease-snappy-settle',
    'touch',
  ],
  related: ['checkbox-group', 'switch', 'field'],
  baseUi: 'checkbox',
});

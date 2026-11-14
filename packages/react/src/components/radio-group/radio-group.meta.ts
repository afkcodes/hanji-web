import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { RadioOwnProps, RootOwnProps } from './radio-group.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'RadioGroup',
  slug: 'radio-group',
  category: 'controls',
  status: 'stable',
  description: 'Exactly one of a few options, all visible at once.',
  whenToUse: [
    'Two to six mutually exclusive options the user should compare: download quality, a delivery speed.',
  ],
  whenNotToUse: [
    'Options with a consequence worth a sentence each — use ChoiceCard.',
    'Two to four short options in a toolbar — use SegmentedControl.',
    'Seven or more — use Select.',
  ],
  import: "import { Radio, RadioGroup } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      base: 'RadioGroup',
      slot: 'RadioGroup.Root',
      className: 'hj-radio-group',
      description:
        'Owns value / defaultValue / onValueChange, name, required, disabled. Label it with aria-labelledby or a Fieldset legend.',
      props: props<RootOwnProps>({
        orientation: {
          type: "'vertical' | 'horizontal'",
          default: "'vertical'",
          description: 'Stack or wrap in a row.',
        },
      }),
      dataAttributes: {
        'data-orientation': 'vertical | horizontal',
        'data-disabled': 'Disabled (Base UI).',
      },
      cssVars: { '--hj-radio-group-gap': 'Gap between items.' },
    },
    {
      name: 'Item',
      element: 'label',
      slot: 'RadioGroup.Item',
      className: 'hj-radio-group-item',
      description: 'A 44px row holding a Radio.Root and its text; the whole row selects.',
    },
    {
      name: 'Description',
      element: 'span',
      slot: 'RadioGroup.Description',
      className: 'hj-radio-group-description',
      description: 'Help line under the option text.',
    },
    {
      name: 'Radio.Root',
      element: 'span (+ hidden input)',
      base: 'Radio.Root',
      slot: 'Radio.Root',
      className: 'hj-radio-group-radio',
      description: 'The 22px ring. Requires value. Renders its Indicator when childless.',
      props: props<RadioOwnProps>({
        size: {
          type: "'sm' | 'md'",
          default: "'md'",
          description: 'md 22 (hanji), sm 18. Hit area stays 44.',
        },
      }),
      dataAttributes: {
        'data-checked': 'Selected.',
        'data-unchecked': 'Not selected.',
        'data-disabled': 'Disabled.',
        'data-size': 'sm | md',
      },
      cssVars: { '--hj-radio-size': 'Ring diameter.' },
    },
    {
      name: 'Radio.Indicator',
      element: 'span',
      base: 'Radio.Indicator',
      slot: 'Radio.Indicator',
      className: 'hj-radio-group-indicator',
      description: 'The dot, half the ring. Kept mounted by Radio.Root so it can scale out.',
    },
  ],
  examples: [
    {
      file: 'quality',
      title: 'Download quality',
      description: 'Three options with their cost in storage, one disabled by the plan.',
    },
    {
      file: 'inline',
      title: 'Inline',
      description: 'A short horizontal choice with a required error.',
    },
  ],
  accessibility: [
    'role="radiogroup" with roving focus: Tab enters on the selected option, arrows move and select.',
    'Each option is a real radio carrying name/value into forms.',
    'Name the group with aria-labelledby (or wrap in Fieldset with a Legend).',
  ],
  motion:
    'The dot scales 0 → 1 on snappy (a ~4% overshoot reads as the press landing) and leaves in 180 ms; the ring thickens to 2px accent. The ring dips to .92 on press.',
  tokens: [
    'accent',
    'surface',
    'fg',
    'fg-mute',
    'danger',
    'type-body',
    'type-sub',
    'ease-snappy',
    'touch',
  ],
  related: ['choice-card', 'segmented-control', 'select', 'checkbox-group'],
  baseUi: 'radio-group',
});

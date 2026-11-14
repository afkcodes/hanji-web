import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { RootOwnProps } from './checkbox-group.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'CheckboxGroup',
  slug: 'checkbox-group',
  category: 'controls',
  status: 'stable',
  description:
    'Several related checkboxes sharing one value array, with an optional “Select all” parent.',
  whenToUse: [
    'Choosing any number of items from a short list: which playlists to download, which emails to get.',
    'A parent that ticks or clears its children, going mixed when only some are ticked.',
  ],
  whenNotToUse: [
    'Exactly one choice — use RadioGroup.',
    'Long lists (20+) — use a searchable Combobox with multiple selection.',
  ],
  import: "import { Checkbox, CheckboxGroup } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      base: 'CheckboxGroup',
      slot: 'CheckboxGroup.Root',
      className: 'hj-checkbox-group',
      description:
        'Owns value / defaultValue / onValueChange (string[]) and allValues for a parent checkbox. Label it with aria-labelledby.',
      props: props<RootOwnProps>({
        orientation: {
          type: "'vertical' | 'horizontal'",
          default: "'vertical'",
          description: 'Stack the rows or wrap them in a line.',
        },
      }),
      dataAttributes: {
        'data-orientation': 'vertical | horizontal',
        'data-disabled': 'Disabled (Base UI).',
      },
      cssVars: {
        '--hj-checkbox-group-gap': 'Gap between rows.',
        '--hj-checkbox-group-indent': 'Indent of Children under a parent. Default 34px.',
      },
    },
    {
      name: 'Item',
      element: 'label',
      slot: 'CheckboxGroup.Item',
      className: 'hj-checkbox-group-item',
      description: 'A 44px row: a Checkbox.Root and its text, the whole row toggles.',
    },
    {
      name: 'Description',
      element: 'span',
      slot: 'CheckboxGroup.Description',
      className: 'hj-checkbox-group-description',
      description: 'Trailing mono detail inside an Item (size, count).',
    },
    {
      name: 'Children',
      element: 'div',
      slot: 'CheckboxGroup.Children',
      className: 'hj-checkbox-group-children',
      description: 'Indented block of child rows under a parent, with a hairline guide.',
    },
  ],
  examples: [
    {
      file: 'select-all',
      title: 'Select all',
      description:
        'Downloads to keep offline: a parent goes mixed when only some are ticked; sizes add up.',
    },
    {
      file: 'horizontal',
      title: 'Inline and disabled',
      description: 'Email topics in a row, one disabled by policy.',
    },
  ],
  accessibility: [
    'Each option is a real checkbox; the parent reports aria-checked="mixed" when partly ticked.',
    'Name the group with aria-labelledby pointing at a visible heading.',
  ],
  motion:
    'Rows inherit Checkbox motion: the ticks draw themselves; a parent toggling all children draws them together.',
  tokens: ['fg', 'fg-mute', 'line', 'type-body', 'type-mono', 'touch'],
  related: ['checkbox', 'radio-group', 'field'],
  baseUi: 'checkbox-group',
});

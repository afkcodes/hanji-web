import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { RootOwnProps } from './segmented-control.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'SegmentedControl',
  slug: 'segmented-control',
  category: 'controls',
  status: 'stable',
  description:
    'Two to five short, mutually exclusive options in one pill, with an indicator that slides to the choice.',
  whenToUse: [
    'Switching a view or a setting between a few short options: Day / Week / Month, Normal / High / Lossless.',
    'Icon choices in a toolbar (list / grid).',
  ],
  whenNotToUse: [
    'Options that need explaining — use RadioGroup or ChoiceCard.',
    'Navigation between pages — use Tabs.',
    'Independent on/off options — use ToggleGroup.',
  ],
  import: "import { SegmentedControl } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      base: 'RadioGroup',
      slot: 'SegmentedControl.Root',
      className: 'hj-segmented-control',
      description:
        'The pill and its indicator. Radio-group semantics (value, defaultValue, onValueChange, disabled). The indicator is one element spanning the track, revealed by an animated clip-path inset with round ends, so the active highlight is a true pill at any width and width is never animated.',
      props: props<RootOwnProps>({
        size: {
          type: "'sm' | 'md'",
          default: "'md'",
          description: 'Heights 32 / 40 (hanji), padding 3 / 4.',
        },
        block: {
          type: 'boolean',
          default: 'false',
          description: 'Full width; segments share it equally.',
        },
      }),
      dataAttributes: {
        'data-size': 'sm | md',
        'data-block': 'Present when block.',
        'data-ready': 'Set after the first measured placement; transitions only run after it.',
        'data-disabled': 'Disabled (Base UI).',
      },
      cssVars: {
        '--hj-segmented-control-height': 'Pill height.',
        '--hj-segmented-control-pad': 'Inner padding around the indicator.',
      },
    },
    {
      name: 'Item',
      element: 'span (+ hidden input)',
      base: 'Radio.Root',
      slot: 'SegmentedControl.Item',
      className: 'hj-segmented-control-item',
      description:
        'One segment; requires value. Text, an Icon, or both. Icon-only items need aria-label.',
      dataAttributes: {
        'data-checked': 'Chosen (label turns accent).',
        'data-disabled': 'Disabled.',
      },
    },
  ],
  examples: [
    {
      file: 'range',
      title: 'Unequal segments',
      description:
        'Day / Week / Month / Year — the pill stretches between widths and stays fully round.',
    },
    {
      file: 'icons',
      title: 'Icons, sizes and disabled',
      description: 'A list/grid icon switch, a small full-width control, and a disabled one.',
    },
  ],
  accessibility: [
    'role="radiogroup" with roving focus: arrows move and select, Home/End jump, Tab leaves.',
    'Name it with aria-label or aria-labelledby; label icon-only segments.',
  ],
  motion:
    'The indicator slides and stretches on snappy, clamped (an animated clip-path inset with round ends, one element). The first placement is instant; label colour cross-fades in 180 ms; segments dip to .97 on press.',
  tokens: [
    'surface',
    'line',
    'accent',
    'accent-soft',
    'fg-dim',
    'radius-pill',
    'ease-snappy-settle',
  ],
  related: ['tabs', 'toggle-group', 'radio-group'],
  baseUi: 'radio-group',
});

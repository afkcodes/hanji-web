import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { RootOwnProps } from './switch.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Switch',
  slug: 'switch',
  category: 'controls',
  status: 'stable',
  description: 'An on/off setting that applies the moment it is flipped.',
  whenToUse: ['A setting with immediate effect: Gapless playback, Download over Wi-Fi only.'],
  whenNotToUse: [
    'A choice that needs a Save — use Checkbox.',
    'More than two states — use SegmentedControl.',
  ],
  import: "import { Switch } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'button',
      base: 'Switch.Root',
      slot: 'Switch.Root',
      className: 'hj-switch',
      description: 'The track. Renders its Thumb automatically when given no children.',
      props: props<RootOwnProps>({
        size: { type: "'sm' | 'md'", default: "'md'", description: 'md 46×28 (hanji), sm 38×24.' },
      }),
      dataAttributes: {
        'data-checked': 'On.',
        'data-unchecked': 'Off.',
        'data-disabled': 'Disabled.',
        'data-size': 'sm | md',
      },
      cssVars: {
        '--hj-switch-width': 'Track width.',
        '--hj-switch-height': 'Track height.',
        '--hj-switch-thumb': 'Thumb diameter.',
      },
    },
    {
      name: 'Thumb',
      element: 'span',
      base: 'Switch.Thumb',
      slot: 'Switch.Thumb',
      className: 'hj-switch-thumb',
      description: 'The knob.',
    },
  ],
  examples: [
    {
      file: 'settings',
      title: 'Settings rows',
      description: 'Labelled switches with help text, on, off and disabled.',
    },
  ],
  accessibility: [
    'role="switch" with aria-checked; Space toggles.',
    'Label it with Field.Label or a <label> wrapping the row.',
    'The hit area is 44px even though the track is 28.',
  ],
  motion:
    'Thumb travels on snappy, clamped (two fades ride on it, an overshoot would flash). While pressed the thumb stretches 27% toward where it is going; the track never dips.',
  tokens: ['accent', 'on-accent', 'surface-2', 'fg-mute', 'line', 'ease-snappy-settle'],
  related: ['checkbox', 'segmented-control', 'field'],
  baseUi: 'switch',
});

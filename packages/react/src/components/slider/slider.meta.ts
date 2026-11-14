import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { MarksOwnProps, RootOwnProps, ThumbOwnProps } from './slider.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Slider',
  slug: 'slider',
  category: 'controls',
  status: 'stable',
  description: 'A value on a continuous scale where the feel matters more than the exact number.',
  whenToUse: [
    'Volume, crossfade, brightness — set by feel, read back in the label.',
    'A range of two values (Release year 1994 – 2011).',
    'Several bands side by side (an equaliser), vertically.',
  ],
  whenNotToUse: [
    'An exact number the user will type — use NumberField.',
    'A few discrete named steps — use SegmentedControl.',
  ],
  import: "import { Slider } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      base: 'Slider.Root',
      slot: 'Slider.Root',
      className: 'hj-slider',
      description:
        'value / defaultValue (number or number[] for a range), min, max, step, onValueChange, onValueCommitted, orientation, disabled. Childless, it renders Control › Track › Indicator + one Thumb per value. Label and Value sit on one row above the control.',
      props: props<RootOwnProps>({
        size: { type: "'md'", default: "'md'", description: '44px hit row, 4px track.' },
        pending: {
          type: 'boolean',
          default: 'false',
          description:
            "hanji pending-hold: the value lives elsewhere and hasn't agreed — the thumb draws hollow and the fill dims. Sets aria-busy.",
        },
      }),
      dataAttributes: {
        'data-dragging': 'A thumb is being dragged (Base UI).',
        'data-orientation': 'horizontal | vertical',
        'data-pending': 'Waiting for the source of truth.',
        'data-disabled': 'Disabled.',
      },
      cssVars: {
        '--hj-slider-track': 'Track thickness. Default 4px.',
        '--hj-slider-thumb': 'Thumb diameter. Default 12px.',
        '--hj-slider-length': 'Vertical control height. Default 168px.',
      },
    },
    {
      name: 'Label',
      element: 'label',
      base: 'Slider.Label',
      slot: 'Slider.Label',
      className: 'hj-slider-label',
      description: 'Names the slider.',
    },
    {
      name: 'Value',
      element: 'output',
      base: 'Slider.Value',
      slot: 'Slider.Value',
      className: 'hj-slider-value',
      description:
        'The value in mono, right-aligned. Children may be a function (formatted, values) => node.',
    },
    {
      name: 'Control',
      element: 'div',
      base: 'Slider.Control',
      slot: 'Slider.Control',
      className: 'hj-slider-control',
      description: 'The 44px interactive row; tap anywhere to jump.',
    },
    {
      name: 'Track',
      element: 'div',
      base: 'Slider.Track',
      slot: 'Slider.Track',
      className: 'hj-slider-track',
      description: '4px, accent at 24%.',
    },
    {
      name: 'Indicator',
      element: 'div',
      base: 'Slider.Indicator',
      slot: 'Slider.Indicator',
      className: 'hj-slider-indicator',
      description: 'The filled part (between thumbs in a range).',
    },
    {
      name: 'Thumb',
      element: 'div (+ input)',
      base: 'Slider.Thumb',
      slot: 'Slider.Thumb',
      className: 'hj-slider-thumb',
      description:
        'A 24px hit box drawing a 12px dot that grows ×1.6 while dragged, with a value bubble. In a range pass index and aria-label.',
      props: props<ThumbOwnProps>({
        bubble: {
          type: 'boolean',
          default: 'true',
          description:
            'Show the value above the thumb while dragged or keyboard-focused. Skipped if you pass render.',
        },
        formatValue: {
          type: '(value: number) => string',
          description: 'Bubble text. Default: runtime-locale number.',
        },
      }),
      dataAttributes: { 'data-dragging': 'Dragging (Base UI).', 'data-index': 'Thumb index.' },
    },
    {
      name: 'Marks',
      element: 'div',
      slot: 'Slider.Marks',
      className: 'hj-slider-marks',
      description: 'Static ticks with optional labels under the track (snap points, a default).',
      props: props<MarksOwnProps>({
        values: { type: 'number[]', description: 'Where to tick, in slider units.' },
        min: { type: 'number', default: '0', description: 'Same as the Root.' },
        max: { type: 'number', default: '100', description: 'Same as the Root.' },
        labels: { type: 'ReactNode[]', description: 'Labels under the ticks.' },
      }),
    },
  ],
  examples: [
    {
      file: 'playback',
      title: 'Playback',
      description:
        'Crossfade with its value, a speaker volume in pending-hold until it agrees, and a disabled slider.',
    },
    {
      file: 'range',
      title: 'Range with marks',
      description: 'Release year as two thumbs over labelled marks.',
    },
    {
      file: 'equaliser',
      title: 'Vertical equaliser',
      description: 'Five bands standing up, with a reset to flat.',
    },
  ],
  accessibility: [
    'Each thumb is a native range input: arrows step, Page Up/Down step large, Home/End jump to the ends.',
    'In a range, give each Thumb an aria-label (From / To).',
    'pending sets aria-busy so readers know the value is not final.',
  ],
  motion:
    'Drag follows the finger 1:1 (no easing on position). The dot grows to ×1.6 on snappy only while it is the thumb being dragged; the bubble rises 4px and settles. Pending is a hollow dot, never a spinner.',
  tokens: ['accent', 'fg', 'bg', 'fg-mute', 'type-mono', 'ease-snappy', 'touch'],
  related: ['number-field', 'segmented-control', 'progress'],
  baseUi: 'slider',
});

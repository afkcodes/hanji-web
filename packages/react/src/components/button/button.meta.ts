import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { ButtonOwnProps } from './button.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Button',
  slug: 'button',
  category: 'atoms',
  status: 'stable',
  description: 'The verb on a screen: triggers an action.',
  whenToUse: [
    'An action the user takes now: Save, Send, Delete, Continue.',
    'One primary per view; secondary and quiet for everything else.',
  ],
  whenNotToUse: [
    'Navigation to another page — render a link (`render={<a href />}`, `nativeButton={false}`) so it behaves as one.',
    'A setting that applies immediately — use Switch.',
    'Choosing one of a few options — use SegmentedControl or RadioGroup.',
  ],
  import: "import { Button } from '@hanji/react';",
  parts: [
    {
      name: 'Button',
      element: 'button',
      base: 'Button',
      slot: 'Button',
      className: 'hj-button',
      description:
        'A pill button. Children are wrapped in a label span so loading can hold the width.',
      props: props<ButtonOwnProps>({
        variant: {
          type: "'primary' | 'ink' | 'secondary' | 'quiet' | 'danger'",
          default: "'primary'",
          description:
            'primary = accent; ink = fg fill (use when the accent is red-family); secondary = fg 8%; quiet = no fill; danger = tint + verb.',
        },
        size: { type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Heights 34 / 44 / 52.' },
        loading: {
          type: 'boolean',
          default: 'false',
          description:
            'Shows the ink-ring spinner, keeps width and focus, sets aria-busy, ignores presses.',
        },
        iconOnly: {
          type: 'boolean',
          default: 'false',
          description: 'Square button for a single icon. Requires aria-label.',
        },
        block: { type: 'boolean', default: 'false', description: 'Full width of the container.' },
      }),
      dataAttributes: {
        'data-variant': 'primary | ink | secondary | quiet | danger',
        'data-size': 'sm | md | lg',
        'data-loading': 'Present while loading.',
        'data-icon-only': 'Present for icon-only buttons.',
        'data-block': 'Present when block.',
        'data-disabled': 'Present when disabled (Base UI).',
      },
      cssVars: {
        '--hj-button-height': 'Height. Defaults 34/44/52 by size.',
        '--hj-button-padding': 'Horizontal padding.',
        '--hj-button-radius': 'Corner radius. Default pill.',
        '--hj-button-font-size': 'Label size.',
      },
    },
  ],
  examples: [
    {
      file: 'variants',
      title: 'Variants',
      description: 'One primary, then secondary, quiet and a danger tint.',
    },
    {
      file: 'sizes',
      title: 'Sizes and icons',
      description: 'sm, md, lg, an icon-only button and a link rendered as a button.',
    },
    { file: 'loading', title: 'Loading', description: 'A save that holds its width while busy.' },
  ],
  accessibility: [
    'Renders a native <button>; Enter and Space activate.',
    'Loading keeps focus (focusableWhenDisabled) and sets aria-busy, so screen readers hear the change.',
    'Icon-only buttons must have aria-label.',
  ],
  motion:
    'Press dips to scale .97 within 70 ms and releases on the snappy spring. Loading cross-fades the label out and the spinner in.',
  tokens: [
    'accent',
    'on-accent',
    'fg',
    'bg',
    'danger',
    'danger-soft',
    'radius-pill',
    'press',
    'ease-snappy',
    'dur-snappy',
  ],
  related: ['link', 'segmented-control', 'switch'],
  baseUi: 'button',
});

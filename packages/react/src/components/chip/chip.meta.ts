import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { ActionOwnProps, InputOwnProps, ListOwnProps, RootOwnProps } from './chip.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Chip',
  slug: 'chip',
  category: 'atoms',
  status: 'stable',
  description:
    'Small, tappable facts: a filter to turn on, a value that was picked, a suggested action.',
  whenToUse: [
    'Filters above a list (Albums, Playlists, Downloaded) — Chip.Root in a Chip.Group.',
    'Values the user picked that they may remove (search filters, recipients) — Chip.Input in a Chip.List.',
    'A small suggested action next to content (Add to queue, Start radio) — Chip.Action.',
  ],
  whenNotToUse: [
    'Switching between views of the same thing — use SegmentedControl or Tabs.',
    'A state (Synced, Failed) — use Status.',
    'The main action of a screen — use Button.',
  ],
  import: "import { Chip } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'button',
      base: 'Toggle',
      slot: 'Chip.Root',
      className: 'hj-chip',
      description:
        'A filter chip. Off: surface, hairline, dim ink. On (data-pressed): accent-soft, accent ink, a check that scales in.',
      props: props<RootOwnProps>({
        size: {
          type: "'sm' | 'md'",
          default: "'md'",
          description: 'Heights 28 / 32. The hit area is 44 either way.',
        },
        icon: { type: 'ReactNode', description: 'A leading glyph.' },
        check: { type: 'boolean', default: 'true', description: 'Show the check when selected.' },
      }),
      dataAttributes: {
        'data-kind': 'filter',
        'data-pressed': 'Selected (Base UI).',
        'data-size': 'sm | md',
        'data-disabled': 'Disabled (Base UI).',
      },
      cssVars: {
        '--hj-chip-height': 'Height.',
        '--hj-chip-padding': 'Horizontal padding.',
      },
    },
    {
      name: 'Group',
      element: 'div',
      base: 'ToggleGroup',
      slot: 'Chip.Group',
      className: 'hj-chip-group',
      description:
        'A set of filter chips: single choice by default, multiple with `multiple`. value is a string[]. Neighbours glide when a chip changes width.',
      cssVars: { '--hj-chip-gap': 'Space between chips. Default 8px.' },
    },
    {
      name: 'List',
      element: 'div',
      slot: 'Chip.List',
      className: 'hj-chip-list',
      description: 'A wrapping row for input chips; the rest glide into place when one leaves.',
      props: props<ListOwnProps>({
        render: {
          type: 'ReactElement | (props, state) => ReactElement',
          description: 'Replace the element.',
        },
      }),
    },
    {
      name: 'Input',
      element: 'span',
      slot: 'Chip.Input',
      className: 'hj-chip',
      description:
        'A picked value with a ✕. Removing fades it fast, moves focus to a neighbour’s ✕, then calls onRemove.',
      props: props<InputOwnProps>({
        onRemove: {
          type: '() => void',
          description: 'Called after the fade-out. Remove the value from your state here.',
        },
        removeLabel: {
          type: 'string',
          default: "'Remove {children}'",
          description: 'Accessible name for the ✕.',
        },
        size: { type: "'sm' | 'md'", default: "'md'", description: 'Heights 28 / 32.' },
        icon: { type: 'ReactNode', description: 'Leading glyph or tiny avatar.' },
        disabled: { type: 'boolean', default: 'false', description: 'Not removable.' },
        render: {
          type: 'ReactElement | (props, state) => ReactElement',
          description: 'Replace the element.',
        },
      }),
      dataAttributes: { 'data-kind': 'input', 'data-leaving': 'Present while fading out.' },
    },
    {
      name: 'Action',
      element: 'button',
      base: 'Button',
      slot: 'Chip.Action',
      className: 'hj-chip',
      description: 'A suggested action: hairline, full ink, glyph first.',
      props: props<ActionOwnProps>({
        size: { type: "'sm' | 'md'", default: "'md'", description: 'Heights 28 / 32.' },
        icon: { type: 'ReactNode', description: 'The glyph naming the action.' },
      }),
      dataAttributes: { 'data-kind': 'action' },
    },
  ],
  examples: [
    {
      file: 'filters',
      title: 'Filters',
      description: 'A multiple-choice filter row with a disabled chip and a live result count.',
    },
    {
      file: 'inputs',
      title: 'Picked values',
      description: 'Removable search filters; the rest glide in without a bounce.',
    },
    { file: 'actions', title: 'Actions', description: 'Suggested actions under a track.' },
  ],
  accessibility: [
    'Filter chips are toggle buttons (aria-pressed). In a group, arrow keys move between them.',
    'Input chips’ ✕ is a real button named “Remove {value}”; Backspace/Delete on it removes too, and focus moves to a neighbour.',
    'Every chip draws 32px but answers a 44px target.',
  ],
  motion:
    'Press dips to .97. The check scales in from .3 on snappy. When a chip changes width or leaves, the rest glide on snappy, clamped — no bounce. Leaving chips fade in 180 ms.',
  tokens: [
    'surface',
    'line',
    'fg-dim',
    'accent',
    'accent-soft',
    'radius-pill',
    'press',
    'ease-snappy',
    'ease-snappy-settle',
    'dur-fast',
  ],
  related: ['segmented-control', 'status', 'button'],
  baseUi: 'toggle-group',
});

import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { InputOwnProps, RootOwnProps } from './number-field.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'NumberField',
  slug: 'number-field',
  category: 'controls',
  status: 'stable',
  description:
    'A number stepped with − and +, held to repeat, or typed — with changed digits rolling into place.',
  whenToUse: [
    'Small exact counts: sleep timer minutes, copies, guests, playback speed.',
    'Values with a clear min and max.',
  ],
  whenNotToUse: [
    'A value set by feel — use Slider.',
    'Long free-form numbers (phone, card) — use Field.',
  ],
  import: "import { NumberField } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      base: 'NumberField.Root',
      slot: 'NumberField.Root',
      className: 'hj-number-field',
      description:
        'value / defaultValue / onValueChange, min, max, step, smallStep, largeStep, format, disabled, readOnly, required. Childless, it renders Group › Decrement · Input · Unit · Increment.',
      props: props<RootOwnProps>({
        size: { type: "'sm' | 'md'", default: "'md'", description: 'Heights 36 / 44.' },
        unit: {
          type: 'ReactNode',
          description: 'Unit after the value in the default layout (min, ×, GB).',
        },
      }),
      dataAttributes: {
        'data-size': 'sm | md',
        'data-has-unit': 'A unit is shown.',
        'data-invalid': 'Invalid.',
        'data-disabled': 'Disabled.',
        'data-scrubbing': 'Scrubbing (Base UI).',
      },
      cssVars: {
        '--hj-number-field-height': 'Pill height.',
        '--hj-number-field-value-width': 'Minimum width of the value. Default 3.2ch.',
      },
    },
    {
      name: 'Group',
      element: 'div',
      base: 'NumberField.Group',
      slot: 'NumberField.Group',
      className: 'hj-number-field-group',
      description: 'The pill holding − value +; the focus ring sits on it.',
    },
    {
      name: 'Decrement',
      element: 'button',
      base: 'NumberField.Decrement',
      slot: 'NumberField.Decrement',
      className: 'hj-number-field-step',
      description:
        'Steps down; hold to repeat with acceleration. Renders a minus and the localised label when childless; disabled at min.',
    },
    {
      name: 'Input',
      element: 'input',
      base: 'NumberField.Input',
      slot: 'NumberField.Input',
      className: 'hj-number-field-input',
      description:
        'The value. When stepped, a rolling copy draws the changed digits; typing shows the plain input.',
      props: props<InputOwnProps>({
        roll: {
          type: 'boolean',
          default: 'true',
          description: 'Roll changed digits on steps. Skipped when you pass render.',
        },
      }),
    },
    {
      name: 'Increment',
      element: 'button',
      base: 'NumberField.Increment',
      slot: 'NumberField.Increment',
      className: 'hj-number-field-step',
      description: 'Steps up; hold to repeat. Disabled at max.',
    },
    {
      name: 'Unit',
      element: 'span',
      slot: 'NumberField.Unit',
      className: 'hj-number-field-unit',
      description: 'A muted unit after the value.',
    },
    {
      name: 'ScrubArea',
      element: 'span',
      base: 'NumberField.ScrubArea',
      slot: 'NumberField.ScrubArea',
      className: 'hj-number-field-scrub',
      description: 'Drag horizontally on a label to scrub the value (desktop).',
    },
    {
      name: 'ScrubAreaCursor',
      element: 'span',
      base: 'NumberField.ScrubAreaCursor',
      slot: 'NumberField.ScrubAreaCursor',
      className: 'hj-number-field-scrub-cursor',
      description: 'The virtual cursor while scrubbing.',
    },
  ],
  examples: [
    {
      file: 'timer',
      title: 'Sleep timer and speed',
      description:
        'Minutes with a unit, a playback speed with decimals, and limits that quiet the end buttons.',
    },
    {
      file: 'guests',
      title: 'In a form',
      description: 'Guests for a listening party with a Field label, help, and the disabled state.',
    },
  ],
  accessibility: [
    'The input has role="textbox" with spinbutton behaviour: ArrowUp/Down step, Page Up/Down step large, Home/End jump to min/max.',
    'The rolling copy is aria-hidden; the input carries the value.',
    'Default − and + carry localised labels (HanjiProvider strings).',
  ],
  motion:
    'Changed digits roll (.55 of a line, ones first, 24 ms apart, upward when the number grows) — the same engine as Counter. Steps dip to .9 on press; while held, Base UI repeats and accelerates. Reduced motion: digits fade.',
  tokens: [
    'surface',
    'line',
    'accent',
    'fg',
    'fg-mute',
    'radius-pill',
    'ease-gentle-settle',
    'touch',
  ],
  related: ['counter', 'slider', 'field'],
  baseUi: 'number-field',
});

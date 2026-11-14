import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type {
  ContentOwnProps,
  RootOwnProps,
  TriggerOwnProps,
  ValueOwnProps,
} from './date-picker.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'DatePicker',
  slug: 'date-picker',
  category: 'controls',
  status: 'new',
  description: 'A field-like trigger that opens a Calendar in a popover, for a day or a range.',
  whenToUse: [
    'A date inside a form row: due dates, reminders, a stay.',
    'A range where both ends are near today.',
  ],
  whenNotToUse: [
    'Dates of birth and other known dates — use three Fields.',
    'When the calendar itself is the screen — use Calendar inline.',
  ],
  import: "import { DatePicker } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: '(none)',
      base: 'Popover.Root',
      slot: 'DatePicker.Root',
      className: '',
      description:
        'Owns the value, the popover and the calendar options (min, max, isDateDisabled, locale…). With `name`, submits yyyy-mm-dd (or start/end).',
      props: props<RootOwnProps>({
        mode: {
          type: "'single' | 'range'",
          default: "'single'",
          description: 'Value shape: Date | null, or { start, end }.',
        },
        value: { type: 'Date | null | DateRange', description: 'Controlled value.' },
        defaultValue: { type: 'Date | null | DateRange', description: 'Initial value.' },
        onValueChange: {
          type: '(value) => void',
          description: 'Every pick (a range reports start first, then the full range).',
        },
        open: { type: 'boolean', description: 'Controlled popover.' },
        defaultOpen: { type: 'boolean', description: 'Initial popover state.' },
        onOpenChange: { type: '(open: boolean) => void', description: 'Popover open/close.' },
        name: { type: 'string', description: 'Hidden input name for form submission.' },
        disabled: { type: 'boolean', default: 'false', description: 'Disable the trigger.' },
        month: { type: 'Date', description: 'Calendar: controlled month.' },
        defaultMonth: { type: 'Date', description: 'Calendar: first month shown.' },
        onMonthChange: {
          type: '(month: Date) => void',
          description: 'Calendar: month navigation.',
        },
        min: { type: 'Date', description: 'Calendar: earliest day.' },
        max: { type: 'Date', description: 'Calendar: latest day.' },
        isDateDisabled: {
          type: '(date: Date) => boolean',
          description: 'Calendar: disable days (faded, aria-disabled; say why in words nearby).',
        },
        locale: { type: 'string', description: 'Calendar and formatting locale.' },
        weekStartsOn: { type: '0 … 6', description: 'Calendar: first column.' },
        today: { type: 'Date', description: 'Calendar: override today.' },
      }),
    },
    {
      name: 'Label',
      element: 'span',
      slot: 'DatePicker.Label',
      className: 'hj-date-picker-label',
      description: 'Names the picker; the trigger is labelled by it and by the chosen date.',
    },
    {
      name: 'Trigger',
      element: 'button',
      base: 'Popover.Trigger',
      slot: 'DatePicker.Trigger',
      className: 'hj-date-picker-trigger',
      description: 'Drawn like Field.Control. Childless, it renders Value + a calendar glyph.',
      props: props<TriggerOwnProps>({
        size: { type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Heights 40 / 48 / 56.' },
        placeholder: { type: 'ReactNode', description: 'Shown while nothing is picked.' },
      }),
      dataAttributes: { 'data-popup-open': 'Open.', 'data-disabled': 'Disabled.' },
      cssVars: {
        '--hj-date-picker-height': 'Trigger height.',
        '--hj-date-picker-radius': 'Trigger radius. Default radius-sm.',
      },
    },
    {
      name: 'Value',
      element: 'span',
      slot: 'DatePicker.Value',
      className: 'hj-date-picker-value',
      description: 'The value written out with Intl (“Fri 20 Nov 2026”, “20–24 Nov 2026”).',
      props: props<ValueOwnProps>({
        placeholder: { type: 'ReactNode', description: 'Shown while nothing is picked.' },
        format: {
          type: '(value: Date | DateRange) => string',
          description: 'Your own formatting.',
        },
      }),
      dataAttributes: { 'data-placeholder': 'Nothing picked.' },
    },
    {
      name: 'Content',
      element: 'div',
      base: 'Popover.Popup',
      slot: 'DatePicker.Content',
      className: 'hj-date-picker-popup',
      description: 'Portal + Positioner + Popup holding the Calendar; children render below it.',
      props: props<ContentOwnProps>({
        side: { type: "'top' | 'bottom' | …", description: 'Preferred side.' },
        align: {
          type: "'start' | 'center' | 'end'",
          default: "'start'",
          description: 'Alignment to the trigger.',
        },
        container: { type: 'HTMLElement | ShadowRoot | RefObject', description: 'Portal target.' },
        closeOnSelect: {
          type: 'boolean',
          default: 'true',
          description: 'Close after a day (or a range’s end) is picked.',
        },
      }),
    },
    {
      name: 'Footer',
      element: 'div',
      slot: 'DatePicker.Footer',
      className: 'hj-date-picker-footer',
      description:
        'Row under the calendar for presets or Clear; use useDatePickerActions() inside.',
    },
  ],
  examples: [
    {
      file: 'single',
      title: 'A day with presets',
      description:
        'A reminder from today (Sundays off), presets and Clear; a disabled field below.',
    },
    {
      file: 'range',
      title: 'A range',
      description: 'Check-in and check-out; the popover closes when the stay is complete.',
    },
  ],
  accessibility: [
    'The trigger is labelled by the Label and the written-out value, so it reads “Dates, 20–24 Nov 2026”.',
    'Focus moves into the calendar grid when the popover opens and returns to the trigger on close; Escape closes.',
    'All Calendar keyboard support applies inside the popover.',
  ],
  motion:
    'The popover grows from the trigger (scale .96 on snappy) and leaves in 180 ms; months slide inside as in Calendar.',
  tokens: ['surface', 'surface-2', 'line', 'accent', 'shadow-lift', 'radius-sm', 'radius-lg'],
  related: ['calendar', 'field', 'popover'],
  baseUi: 'popover',
});

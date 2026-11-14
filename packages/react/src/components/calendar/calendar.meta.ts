import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { RootOwnProps } from './calendar.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Calendar',
  slug: 'calendar',
  category: 'controls',
  status: 'new',
  description:
    'A month grid for picking a day or a range. No dependencies: local days, names from Intl.',
  whenToUse: [
    'Choosing a day where the weekday or nearby days matter (delivery, bookings).',
    'A range (a stay, a report period), with the nights or days said in words beside it.',
  ],
  whenNotToUse: [
    'A known date like a birthday — use three Fields (day, month, year).',
    'A date inside a form row — use DatePicker (Calendar in a popover).',
  ],
  import: "import { Calendar } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      slot: 'Calendar.Root',
      className: 'hj-calendar',
      description:
        'Owns selection and the visible month. Childless, it renders Header + Grid. useCalendar() exposes its state to custom parts.',
      props: props<RootOwnProps>({
        mode: {
          type: "'single' | 'range'",
          default: "'single'",
          description: 'The value shape follows the mode: Date | null, or { start, end }.',
        },
        value: { type: 'Date | null | DateRange', description: 'Controlled selection.' },
        defaultValue: { type: 'Date | null | DateRange', description: 'Initial selection.' },
        onValueChange: {
          type: '(value) => void',
          description:
            'Called with a Date (single) or a { start, end } range (range: end is null after the first pick).',
        },
        month: { type: 'Date', description: 'Controlled visible month (any day in it).' },
        defaultMonth: {
          type: 'Date',
          description: 'First month shown. Default: the selection, else today.',
        },
        onMonthChange: { type: '(month: Date) => void', description: 'Month navigation.' },
        min: {
          type: 'Date',
          description: 'Earliest selectable day; previous-month button stops here.',
        },
        max: { type: 'Date', description: 'Latest selectable day.' },
        isDateDisabled: {
          type: '(date: Date) => boolean',
          description: 'Disable individual days (faded, aria-disabled, skipped by selection).',
        },
        locale: { type: 'string', description: 'BCP 47 locale for names and the week start.' },
        weekStartsOn: {
          type: '0 | 1 | … | 6',
          description: 'First column. Default: the locale’s (Intl weekInfo).',
        },
        today: { type: 'Date', description: 'Override today (tests, other time zones).' },
      }),
      dataAttributes: { 'data-mode': 'single | range' },
      cssVars: {
        '--hj-calendar-cell': 'Day size. Default 40px.',
        '--hj-calendar-gap': 'Gap between header and grid.',
      },
    },
    {
      name: 'Header',
      element: 'div',
      slot: 'Calendar.Header',
      className: 'hj-calendar-header',
      description: 'Month title (announced politely) with previous / next buttons.',
    },
    {
      name: 'Grid',
      element: 'table',
      slot: 'Calendar.Grid',
      className: 'hj-calendar-grid',
      description:
        'Weekday header and six weeks of days (the height never jumps). role="grid" with roving focus.',
      dataAttributes: {
        'data-direction': 'next | prev — the month slides in from that side.',
        'day: data-today / data-selected / data-outside / data-disabled':
          'On each .hj-calendar-day.',
        'cell: data-in-range / data-in-preview / data-range-start / data-range-end':
          'On each .hj-calendar-cell; draw the range band.',
      },
    },
  ],
  examples: [
    {
      file: 'single',
      title: 'A day',
      description: 'Delivery within 90 days; Sundays sold out, said in words below.',
    },
    {
      file: 'range',
      title: 'A range',
      description: 'Check-in and check-out with a live preview band and nights in words.',
    },
  ],
  accessibility: [
    'Grid of buttons with one tab stop: arrows move a day/week, Home/End the week, PageUp/PageDown a month (Shift: a year), Enter/Space pick.',
    'Each day is labelled with its full date; today has aria-current="date"; disabled days are aria-disabled.',
    'The month title is a polite live region, so paging months is announced.',
  ],
  motion:
    'A new month slides 16px in from the side it came from on gentle, settled (a fade under reduced motion). A picked day settles from scale .86 on snappy.',
  tokens: [
    'accent',
    'on-accent',
    'accent-soft',
    'fg-mute',
    'type-heading',
    'type-label',
    'ease-gentle-settle',
  ],
  related: ['date-picker', 'field'],
});

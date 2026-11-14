import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { CounterOwnProps } from './counter.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Counter',
  slug: 'counter',
  category: 'data',
  status: 'stable',
  description:
    'A number whose changed digits roll into place, so a change is seen without re-reading the whole figure.',
  whenToUse: [
    'A figure that changes while the user watches: plays, a timer, a total that updates as filters change.',
    'A count-up on first view (`from={0}`) for a single headline number.',
  ],
  whenNotToUse: [
    'Static numbers — plain tabular text is quieter.',
    'Numbers that change many times a second (scrub positions) — the roll cannot keep up; print the value.',
  ],
  import: "import { Counter } from '@hanji/react';",
  parts: [
    {
      name: 'Counter',
      element: 'span',
      slot: 'Counter',
      className: 'hj-counter',
      description:
        'Visually rolling digits (aria-hidden) plus the full value as screen-reader text.',
      props: props<CounterOwnProps>({
        value: {
          type: 'number | string',
          description:
            'A number (formatted with format/locale) or a preformatted string such as "02:47".',
        },
        format: {
          type: 'Intl.NumberFormatOptions',
          description: 'Formatting when value is a number. Formatters are cached.',
        },
        locale: {
          type: 'Intl.LocalesArgument',
          default: 'runtime locale',
          description: 'Locale for formatting.',
        },
        from: {
          type: 'number | string',
          description: 'Roll in from this value on mount (0 = count-up).',
        },
        size: {
          type: "'hero' | 'display' | 'title' | 'body' | 'inherit'",
          default: "'inherit'",
          description: 'Type role; inherit takes the surrounding font.',
        },
      }),
      dataAttributes: { 'data-size': 'hero | display | title | body | inherit' },
      cssVars: { '--hj-counter-color': 'Text colour. Default inherit.' },
    },
  ],
  examples: [
    {
      file: 'live',
      title: 'A live total',
      description:
        'Plays across 41 countries, ticking and jumping; only the digits that change move.',
    },
    {
      file: 'timer',
      title: 'Count-up and a timer',
      description: 'A hero figure rolling up from zero, and a sleep timer counting down.',
    },
  ],
  accessibility: [
    'The rolling glyphs are aria-hidden; the full value is rendered as visually-hidden text, so readers hear "1,284" not ten fragments.',
    'Wrap it in an aria-live region yourself only if every change must be announced — most should not be.',
  ],
  motion:
    'Only changed characters move: the old glyph leaves by .55 of a line in 180 ms, the new arrives on gentle (settled), ones first, 24 ms apart, upward when the number grows. Reduced motion: a 160 ms fade, no travel. Imperative WAAPI — no React renders per tick.',
  tokens: ['type-hero', 'type-display', 'type-title', 'ease-gentle-settle', 'dur-gentle-settle'],
  related: ['number-field', 'stat'],
});

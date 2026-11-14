import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { RootOwnProps } from './progress-ring.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'ProgressRing',
  slug: 'progress-ring',
  category: 'data',
  status: 'stable',
  description:
    'Progress as a ring: a 40px status beside a row, or a 96px summary with the value inside.',
  whenToUse: [
    'A download or sync next to a list row, where a bar would not fit.',
    'A single summary number that is a share of something (storage used, goal reached).',
  ],
  whenNotToUse: [
    'A task the user is watching closely — the bar (Progress) reads more precisely.',
    'Several values side by side — rings are hard to compare; use bars.',
  ],
  import: "import { ProgressRing } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      base: 'Progress.Root',
      slot: 'ProgressRing.Root',
      className: 'hj-progress-ring',
      description:
        'Owns value/min/max (null = indeterminate) and draws the SVG ring. Children sit in the centre; lg rings with no children show their Value.',
      props: props<RootOwnProps>({
        size: {
          type: "'sm' | 'md' | 'lg' | number",
          default: "'md'",
          description: 'sm 24 · md 40 (hanji) · lg 96 · or px.',
        },
        thickness: {
          type: 'number',
          default: '3 / 4 / 6 by size',
          description: 'Stroke width in px.',
        },
        tone: {
          type: "'accent' | 'fg' | 'danger'",
          default: "'accent'",
          description: 'Colour of the arc; the track is the tone at 22%.',
        },
      }),
      dataAttributes: {
        'data-tone': 'accent | fg | danger',
        'data-size': 'sm | md | lg | custom',
        'data-empty': 'Value is at min — the arc hides so no dot shows.',
        'data-indeterminate': 'value is null (Base UI).',
        'data-complete': 'Reached max (Base UI).',
      },
      cssVars: {
        '--hj-progress-ring-size': 'Set by size. Read-only.',
        '--hj-progress-ring-fraction': 'Set by Root: 0–1. Read-only.',
      },
    },
    {
      name: 'Value',
      element: 'span',
      base: 'Progress.Value',
      slot: 'ProgressRing.Value',
      className: 'hj-progress-ring-value',
      description:
        'Tabular value with the % shrunk to half size. Pass a function child for your own words.',
    },
    {
      name: 'Label',
      element: 'span',
      base: 'Progress.Label',
      slot: 'ProgressRing.Label',
      className: 'hj-progress-ring-label',
      description: 'Accessible name. Usually visually hidden (hj-sr-only) inside a ring.',
    },
  ],
  examples: [
    {
      file: 'rows',
      title: 'Beside rows',
      description: 'Downloading, queued (indeterminate) and done, at 24 and 40.',
    },
    {
      file: 'summary',
      title: 'Summary',
      description: 'A 96px storage ring with the value inside and a caption.',
    },
  ],
  accessibility: [
    'role="progressbar" with aria-valuenow / min / max (Base UI).',
    'Always name it: a Label (often hj-sr-only) or aria-label on Root.',
    'The SVG is aria-hidden; the value is read from the progressbar, not the drawing.',
  ],
  motion:
    'The arc grows on snappy, clamped. Indeterminate turns a quarter arc at a constant 900 ms; under reduced motion it pulses in place instead.',
  tokens: ['accent', 'fg', 'danger', 'fg-mute', 'ease-snappy-settle', 'anim-spin'],
  related: ['progress', 'meter', 'spinner'],
  baseUi: 'progress',
});

import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { RootOwnProps } from './meter.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Meter',
  slug: 'meter',
  category: 'data',
  status: 'stable',
  description:
    'A measurement within a known range, coloured by how good it is: storage, battery, signal, password strength.',
  whenToUse: [
    'A level that is not a task: how full, how strong, how healthy.',
    'When the value has good and bad regions — set low, high and optimum and the colour follows (HTML <meter> rules).',
  ],
  whenNotToUse: [
    'A task heading for completion — use Progress.',
    'A value the user sets — use Slider.',
  ],
  import: "import { Meter } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      base: 'Meter.Root',
      slot: 'Meter.Root',
      className: 'hj-meter',
      description:
        'Owns value/min/max, computes the zone from low/high/optimum and exposes the fraction. With no children it renders Track + Indicator.',
      props: props<RootOwnProps>({
        low: { type: 'number', description: 'Upper bound of the low region.' },
        high: { type: 'number', description: 'Lower bound of the high region.' },
        optimum: {
          type: 'number',
          default: '(min + max) / 2',
          description: 'The best value: its region is green, the next amber, the far one red.',
        },
        segments: {
          type: 'number',
          description: 'Draw N segments with 3px gaps (signal bars, strength).',
        },
        tone: {
          type: "'auto' | 'accent' | 'fg'",
          default: "'auto'",
          description:
            'auto = success / warning / danger by zone when any threshold is set, otherwise accent.',
        },
      }),
      dataAttributes: {
        'data-zone': 'optimum | suboptimum | critical (when graded)',
        'data-tone': 'zone | accent | fg',
        'data-segmented': 'Present when segments > 1.',
      },
      cssVars: {
        '--hj-meter-fraction': 'Set by Root: 0–1. Read-only.',
        '--hj-meter-segments': 'Set by Root from segments. Read-only.',
        '--hj-meter-height': 'Track thickness. Default 6px (8px segmented).',
        '--hj-meter-gap': 'Gap between segments. Default 3px.',
      },
    },
    {
      name: 'Header',
      element: 'div',
      slot: 'Meter.Header',
      className: 'hj-meter-header',
      description: 'Label left, Value right.',
    },
    {
      name: 'Label',
      element: 'span',
      base: 'Meter.Label',
      slot: 'Meter.Label',
      className: 'hj-meter-label',
      description: 'Names the measurement (aria-labelledby).',
    },
    {
      name: 'Value',
      element: 'span',
      base: 'Meter.Value',
      slot: 'Meter.Value',
      className: 'hj-meter-value',
      description: 'Formatted value in tabular mono; pass a function child for words.',
    },
    {
      name: 'Track',
      element: 'div',
      base: 'Meter.Track',
      slot: 'Meter.Track',
      className: 'hj-meter-track',
      description: 'The rail, tone at 18%; masked into segments when segmented.',
    },
    {
      name: 'Indicator',
      element: 'div',
      base: 'Meter.Indicator',
      slot: 'Meter.Indicator',
      className: 'hj-meter-indicator',
      description: 'The fill: full width scaled by --hj-meter-fraction.',
    },
  ],
  examples: [
    {
      file: 'zones',
      title: 'Graded by zone',
      description: 'Storage (low is good), battery (high is good) and a healthy middle.',
    },
    {
      file: 'segments',
      title: 'Segmented',
      description: 'Password strength in four segments and a signal level.',
    },
  ],
  accessibility: [
    'role="meter" with aria-valuenow / min / max (Base UI).',
    'Colour is never the only signal: say the state in the Value or nearby ("Weak — add a number").',
    'Name it with a Label or aria-label.',
  ],
  motion: 'The fill scales between values on snappy, clamped; the colour crossfades in 260 ms.',
  tokens: ['success', 'warning', 'danger', 'accent', 'type-mono', 'ease-snappy-settle'],
  related: ['progress', 'progress-ring', 'stat'],
  baseUi: 'meter',
});

import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { RootOwnProps } from './progress.tsx';

const states = {
  'data-progressing': 'Has a value below max (Base UI).',
  'data-complete': 'Reached max (Base UI).',
  'data-indeterminate': 'value is null (Base UI).',
};

export const meta: ComponentMeta = defineMeta({
  name: 'Progress',
  slug: 'progress',
  category: 'data',
  status: 'stable',
  description: 'How far a task has got: a 4px track with a fill, and an optional label and value.',
  whenToUse: [
    'A task with a known end: downloading 34 of 48 tracks, uploading a file, a storage total.',
    'Work of unknown length that will finish soon — pass value={null} for the indeterminate sweep.',
  ],
  whenNotToUse: [
    'A measurement within a range that is not a task (battery, signal, storage health) — use Meter.',
    'A tight space or a single glyph — use ProgressRing.',
    'Steps in a flow — use Steps.',
  ],
  import: "import { Progress } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      base: 'Progress.Root',
      slot: 'Progress.Root',
      className: 'hj-progress',
      description:
        'Owns value/min/max (value={null} = indeterminate) and exposes the fraction as --hj-progress-fraction. With no children it renders Track + Indicator.',
      props: props<RootOwnProps>({
        tone: {
          type: "'accent' | 'fg' | 'danger'",
          default: "'accent'",
          description: 'accent = the task in hand; fg = neutral totals; danger = running out.',
        },
      }),
      dataAttributes: { 'data-tone': 'accent | fg | danger', ...states },
      cssVars: {
        '--hj-progress-fraction': 'Set by Root: 0–1. Read-only.',
        '--hj-progress-height': 'Track thickness. Default 4px.',
        '--hj-progress-radius': 'Track radius. Default pill.',
      },
    },
    {
      name: 'Header',
      element: 'div',
      slot: 'Progress.Header',
      className: 'hj-progress-header',
      description: 'A row above the track: Label left, Value right.',
    },
    {
      name: 'Label',
      element: 'span',
      base: 'Progress.Label',
      slot: 'Progress.Label',
      className: 'hj-progress-label',
      description: 'Names the task; wired to aria-labelledby.',
    },
    {
      name: 'Value',
      element: 'span',
      base: 'Progress.Value',
      slot: 'Progress.Value',
      className: 'hj-progress-value',
      description:
        'The formatted value in tabular mono. Pass a function child to write your own text ("212 MB left").',
    },
    {
      name: 'Track',
      element: 'div',
      base: 'Progress.Track',
      slot: 'Progress.Track',
      className: 'hj-progress-track',
      description: 'The 4px rail, tone at 22%.',
      dataAttributes: states,
    },
    {
      name: 'Indicator',
      element: 'div',
      base: 'Progress.Indicator',
      slot: 'Progress.Indicator',
      className: 'hj-progress-indicator',
      description:
        'The fill: full width, scaled by --hj-progress-fraction from the left. Overrides Base UI’s inline width.',
      dataAttributes: states,
    },
  ],
  examples: [
    {
      file: 'download',
      title: 'Download',
      description: 'A labelled download with its value, then a finished and a failed one.',
    },
    {
      file: 'tones',
      title: 'Tones and indeterminate',
      description: 'Storage in fg, a nearly-full disk in danger, and an indeterminate sync.',
    },
  ],
  accessibility: [
    'role="progressbar" with aria-valuenow / min / max; indeterminate omits aria-valuenow.',
    'Give it a Label, or aria-label on Root when there is no visible label.',
    'Use getAriaValueText for human words ("34 of 48 tracks").',
  ],
  motion:
    'The fill scales between values on snappy, clamped — never a width animation. Indeterminate sweeps a third of the track every 1.4 s; under reduced motion it holds still mid-track.',
  tokens: ['accent', 'fg', 'danger', 'radius-pill', 'type-mono', 'ease-snappy-settle', 'ambient'],
  related: ['progress-ring', 'meter', 'steps'],
  baseUi: 'progress',
});

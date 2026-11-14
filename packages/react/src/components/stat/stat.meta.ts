import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { DeltaOwnProps, RootOwnProps, SparklineOwnProps } from './stat.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Stat',
  slug: 'stat',
  category: 'data',
  status: 'new',
  description:
    'A number that matters: what it counts, the figure with its unit shrunk, how it compares in words, and the recent past as a line.',
  whenToUse: [
    'Summary figures: listening time, storage, followers, plays this week.',
    'The one hero number on a screen (size="lg").',
  ],
  whenNotToUse: [
    'A share of a whole that is being filled — use Progress or Meter.',
    'Many numbers compared across rows — use Table.',
    'A number with no comparison — say what it is relative to, or reconsider showing it.',
  ],
  import: "import { Stat } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      slot: 'Stat.Root',
      className: 'hj-stat',
      description: 'Stacks Label, Value, Delta, Description and an optional Sparkline.',
      props: props<RootOwnProps>({
        size: {
          type: "'md' | 'lg'",
          default: "'md'",
          description: 'md = 28px number (tiles); lg = 44px hero (one per screen).',
        },
      }),
      dataAttributes: { 'data-size': 'md | lg' },
      cssVars: { '--hj-stat-value-size': 'Number size. Defaults 28 / 44.' },
    },
    {
      name: 'Label',
      element: 'div',
      slot: 'Stat.Label',
      className: 'hj-stat-label',
      description: 'Eyebrow: 10px caps, muted.',
    },
    {
      name: 'Value',
      element: 'div',
      slot: 'Stat.Value',
      className: 'hj-stat-value',
      description: 'The number in tabular figures, 700, tight tracking.',
    },
    {
      name: 'Unit',
      element: 'span',
      slot: 'Stat.Unit',
      className: 'hj-stat-unit',
      description: 'Unit at half size, muted (inside Value).',
    },
    {
      name: 'Delta',
      element: 'span',
      slot: 'Stat.Delta',
      className: 'hj-stat-delta',
      description:
        'The comparison in words with an arrow glyph; colour follows sentiment, not direction.',
      props: props<DeltaOwnProps>({
        trend: {
          type: "'up' | 'down' | 'flat'",
          default: "'flat'",
          description: 'Which way it moved: arrow up, arrow down, or a dash.',
        },
        sentiment: {
          type: "'positive' | 'negative' | 'neutral'",
          default: 'from trend',
          description: 'Whether that is good. Set it when down is good (spending, errors).',
        },
      }),
      dataAttributes: {
        'data-trend': 'up | down | flat',
        'data-sentiment': 'positive | negative | neutral',
      },
    },
    {
      name: 'Description',
      element: 'p',
      slot: 'Stat.Description',
      className: 'hj-stat-description',
      description: 'A quiet context line ("of 64 GB", "updated 4 min ago").',
    },
    {
      name: 'Sparkline',
      element: 'svg',
      slot: 'Stat.Sparkline',
      className: 'hj-stat-sparkline',
      description:
        '96×24 line of the recent past, last point marked, a 10% wash under it. No axes.',
      props: props<SparklineOwnProps>({
        data: { type: 'readonly number[]', description: 'The series, oldest first.' },
        width: { type: 'number', default: '96', description: 'Width in px.' },
        height: { type: 'number', default: '24', description: 'Height in px.' },
        tone: {
          type: "'accent' | 'fg' | 'success' | 'danger'",
          default: "'accent'",
          description: 'Line colour.',
        },
        label: {
          type: 'string',
          description: 'Accessible summary; omit to keep the line decorative.',
        },
      }),
    },
  ],
  examples: [
    {
      file: 'tiles',
      title: 'Tiles',
      description: 'Three figures with comparisons in words, one where down is good.',
    },
    {
      file: 'hero',
      title: 'Hero number',
      description: 'The one number on a screen with its trend line.',
    },
  ],
  accessibility: [
    'The delta is read as its words; the arrow is aria-hidden.',
    'Sparklines are decorative unless given a label summarising the trend.',
    'Units stay in the text, so “2 h 47 min” is read in full.',
  ],
  tokens: ['type-hero', 'type-eyebrow', 'success', 'danger', 'fg-mute', 'accent'],
  related: ['meter', 'progress', 'table'],
});

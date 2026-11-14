import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { ItemOwnProps, TimeOwnProps } from './timeline.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Timeline',
  slug: 'timeline',
  category: 'data',
  status: 'new',
  description:
    'A vertical sequence of steps with their times: what happened, what is happening, what is next, and what failed.',
  whenToUse: [
    'History with timestamps: an export, a sync, an order, a migration.',
    'A process the user is waiting on, where the current step and any failure must be obvious.',
  ],
  whenNotToUse: [
    'Steps the user moves through themselves in a flow — use Steps.',
    'A feed of unrelated events — use List.',
  ],
  import: "import { Timeline } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'ol',
      slot: 'Timeline.Root',
      className: 'hj-timeline',
      description: 'The ordered sequence.',
      cssVars: {
        '--hj-timeline-marker': 'Marker diameter. Default 20px.',
        '--hj-timeline-gap': 'Space between steps. Default 22px.',
      },
    },
    {
      name: 'Item',
      element: 'li',
      slot: 'Timeline.Item',
      className: 'hj-timeline-item',
      description:
        'A step with its marker on the rail. Reads its status in words first (visually hidden), then its content.',
      props: props<ItemOwnProps>({
        status: {
          type: "'done' | 'current' | 'pending' | 'failed'",
          default: "'pending'",
          description:
            'done = filled ✓; current = ring + live pulse (aria-current="step"); pending = hollow; failed = danger ✕.',
        },
        statusLabel: {
          type: 'string',
          default: 'Done | In progress | Not started | Failed',
          description: 'Words announced before the step; localise here.',
        },
      }),
      dataAttributes: { 'data-status': 'done | current | pending | failed' },
    },
    {
      name: 'Title',
      element: 'div',
      slot: 'Timeline.Title',
      className: 'hj-timeline-title',
      description: 'What the step is. Danger-coloured when failed, dimmed when pending.',
    },
    {
      name: 'Time',
      element: 'span',
      slot: 'Timeline.Time',
      className: 'hj-timeline-time',
      description: 'Absolute time in tabular mono (a <time>), then the relative phrase.',
      props: props<TimeOwnProps>({
        dateTime: { type: 'string', description: 'ISO timestamp for the <time> element.' },
        relative: {
          type: 'string',
          description: 'Relative phrase after the absolute time ("2 min ago").',
        },
      }),
    },
    {
      name: 'Description',
      element: 'p',
      slot: 'Timeline.Description',
      className: 'hj-timeline-description',
      description: 'Detail; for a failure, what happened and what to do.',
    },
    {
      name: 'Actions',
      element: 'div',
      slot: 'Timeline.Actions',
      className: 'hj-timeline-actions',
      description: 'The step’s action — Retry on a failure.',
    },
  ],
  examples: [
    {
      file: 'export',
      title: 'Export history',
      description: 'Done, current, a failed step with Retry, and what comes next.',
    },
    {
      file: 'order',
      title: 'Compact delivery',
      description: 'A shorter rail with relative times only.',
    },
  ],
  accessibility: [
    'An ordered list; the current step has aria-current="step".',
    'Each step starts with its status in words, so the marker colour is never the only signal.',
    'Times use <time dateTime> for machines and plain words for people.',
  ],
  motion:
    'The current marker sends out a ring every 1.6 s — ambient, so it stops under reduced motion and when ambient is paused.',
  tokens: [
    'accent',
    'on-accent',
    'danger',
    'danger-soft',
    'line',
    'type-body',
    'type-mono',
    'ambient',
  ],
  related: ['steps', 'list', 'progress'],
});

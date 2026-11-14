import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { RootOwnProps, StepOwnProps } from './coach-mark.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'CoachMark',
  slug: 'coach-mark',
  category: 'surfaces',
  status: 'new',
  description:
    'A short product tour: a spotlight on a real control and a bubble that says what it does, one step at a time.',
  whenToUse: [
    'Introducing a new or moved control once, after an update.',
    'A first-run tour of at most three steps.',
  ],
  whenNotToUse: [
    'Explaining a control every time — give it a clear label or a Tooltip.',
    'More than three steps — the UI needs fixing, not a tour.',
  ],
  import: "import { CoachMark } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: '(none)',
      slot: 'CoachMark.Root',
      className: '',
      description: 'Runs the tour: which step, open/closed, finish and skip.',
      props: props<RootOwnProps>({
        open: { type: 'boolean', description: 'Controlled: the tour is running.' },
        defaultOpen: {
          type: 'boolean',
          default: 'false',
          description: 'Uncontrolled initial state.',
        },
        onOpenChange: {
          type: "(open: false, reason: 'finish' | 'skip') => void",
          description: 'Called when finished or skipped.',
        },
        step: { type: 'number', description: 'Controlled step index.' },
        defaultStep: { type: 'number', default: '0', description: 'Initial step.' },
        onStepChange: { type: '(step: number) => void', description: 'Called on Next/Back.' },
        labels: {
          type: 'Partial<{ skip, done, next, back, progress(step, count) }>',
          description: 'Footer labels for other languages.',
        },
        children: { type: 'CoachMark.Step[]', description: 'The steps, in order.' },
      }),
    },
    {
      name: 'Step',
      element: '(portal)',
      slot: 'CoachMark.Step',
      className: 'hj-coach-mark-popup',
      description:
        'Spotlight + anchored bubble. Falls back to a centred bubble when the target is missing.',
      props: props<StepOwnProps>({
        target: {
          type: 'RefObject<Element> | string | (() => Element | null)',
          description: 'The control explained: a ref, a selector or a getter.',
        },
        side: {
          type: "'top' | 'bottom' | 'left' | 'right'",
          default: "'bottom'",
          description: 'Side of the target for the bubble.',
        },
        padding: {
          type: 'number',
          default: '6',
          description: 'Spotlight padding around the target, px.',
        },
        footer: {
          type: 'boolean',
          default: 'true',
          description: 'Render progress, Skip, Back and Next/Done.',
        },
        children: { type: 'ReactNode', description: 'Title, Description, anything else.' },
      }),
      dataAttributes: { 'data-centered': 'No target found: centred bubble.' },
      cssVars: {
        '--hj-coach-mark-scrim': 'Scrim strength. Default .55.',
        '--hj-coach-mark-radius': 'Spotlight corner radius. Default radius-sm.',
        '--hj-coach-mark-width': 'Bubble width. Default 300px.',
      },
    },
    {
      name: 'Title',
      element: 'h2',
      slot: 'CoachMark.Title',
      className: 'hj-coach-mark-title',
      description: 'What the control is.',
    },
    {
      name: 'Description',
      element: 'p',
      slot: 'CoachMark.Description',
      className: 'hj-coach-mark-description',
      description: 'Why it matters, in one sentence.',
    },
  ],
  examples: [
    {
      file: 'tour',
      title: 'Three-step tour',
      description: 'Search, queue, downloads — Next, Back, Skip.',
    },
    {
      file: 'missing-target',
      title: 'When a control is hidden',
      description: 'A step whose target is not on screen falls back to a centred bubble.',
    },
  ],
  accessibility: [
    'The bubble is a non-modal popover; focus moves into it and Escape skips the tour.',
    'Stray clicks never end the tour; only Skip, Done or Escape do.',
    'Progress (“1 of 3”) is announced politely as steps change.',
  ],
  motion:
    'The scrim fades in; the bubble grows from the target on snappy, clamped; the spotlight ring beacons twice (ambient — stops under reduced motion). Moving between steps re-places the spotlight instantly and fades it in: geometry never animates.',
  tokens: ['scrim', 'accent', 'surface-2', 'line', 'shadow-lift', 'radius-md', 'ambient'],
  related: ['popover', 'tooltip'],
  baseUi: 'popover',
});

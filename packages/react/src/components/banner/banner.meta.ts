import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { RootOwnProps } from './banner.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Banner',
  slug: 'banner',
  category: 'surfaces',
  status: 'new',
  description: 'An inline notice that stays on the page until it is resolved or dismissed.',
  whenToUse: [
    'A condition that persists: offline, storage nearly full, a plan limit, an update ready.',
    'A problem with a fix the user can take from here (an action).',
  ],
  whenNotToUse: [
    'A one-off confirmation — use Toast.',
    'A question that blocks the task — use AlertDialog.',
    'An error on one field — use Field.Error.',
  ],
  import: "import { Banner } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      slot: 'Banner.Root',
      className: 'hj-banner',
      description:
        'Tint fill + hairline ring + glyph by tone. role="alert" for warning/danger, "status" otherwise.',
      props: props<RootOwnProps>({
        tone: {
          type: "'neutral' | 'info' | 'success' | 'warning' | 'danger'",
          default: "'neutral'",
          description: 'Glyph, tint and ring.',
        },
        icon: { type: 'boolean', default: 'true', description: 'Lead with the tone glyph.' },
        open: {
          type: 'boolean',
          description: 'Controlled visibility. Showing and hiding animate either way.',
        },
        defaultOpen: {
          type: 'boolean',
          default: 'true',
          description: 'Uncontrolled initial visibility.',
        },
        onOpenChange: {
          type: '(open: boolean) => void',
          description: 'Called as soon as Dismiss is pressed; the exit then plays.',
        },
        onOpenChangeComplete: {
          type: '(open: boolean) => void',
          description: 'Called once opening or closing has finished.',
        },
      }),
      dataAttributes: {
        'data-tone': 'neutral | info | success | warning | danger',
        'data-starting-style': 'The frame before it opens (space closed, content below and clear).',
        'data-ending-style': 'Closing: content fades and lifts, then the space closes.',
        'data-animating': 'The space is opening or closing (content is clipped meanwhile).',
      },
      cssVars: {
        '--hj-banner-radius': 'Corner radius. Default radius-md.',
        '--hj-banner-padding': 'Inner padding.',
      },
    },
    {
      name: 'Content',
      element: 'div',
      slot: 'Banner.Content',
      className: 'hj-banner-content',
      description: 'Column for Title and Description.',
    },
    {
      name: 'Title',
      element: 'p',
      slot: 'Banner.Title',
      className: 'hj-banner-title',
      description: 'What is true, in a few words.',
    },
    {
      name: 'Description',
      element: 'p',
      slot: 'Banner.Description',
      className: 'hj-banner-description',
      description: 'Why, and what to do.',
    },
    {
      name: 'Actions',
      element: 'div',
      slot: 'Banner.Actions',
      className: 'hj-banner-actions',
      description: 'One or two Buttons.',
    },
    {
      name: 'Dismiss',
      element: 'button',
      slot: 'Banner.Dismiss',
      className: 'hj-banner-dismiss',
      description: 'The ✕, labelled with strings.dismiss.',
    },
  ],
  examples: [
    { file: 'tones', title: 'Tones', description: 'Every tone, each with a glyph and a sentence.' },
    {
      file: 'resolve',
      title: 'With an action',
      description:
        'Offline, with Retry. Dismiss it or flip the toggle: the space and the gap below open and close in one motion.',
    },
  ],
  accessibility: [
    'Warning and danger use role="alert" (announced once when shown); others use role="status".',
    'Tone is never colour alone: glyph + title carry it.',
    'The dismiss button has a 44px hit area.',
  ],
  motion:
    'Show: the space opens on the gentle spring (≈320 ms) while the notice fades in a beat later and rises 6 px. Hide: the notice fades and lifts 4 px on the fast clock (180 ms) while the space closes from 60 ms over 260 ms. A parent row gap opens and closes with it (the neighbour’s margin is animated with Web Animations and released at rest). grid-template-rows is the one declared layout transition, because the rows below must follow. Reduced motion: fade, then the space snaps. Re-opening mid-exit reverses from where it is.',
  tokens: ['info-soft', 'success-soft', 'warning-soft', 'danger-soft', 'line', 'radius-md'],
  related: ['toast', 'alert-dialog', 'field'],
});

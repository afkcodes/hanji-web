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
        open: { type: 'boolean', description: 'Controlled visibility.' },
        defaultOpen: {
          type: 'boolean',
          default: 'true',
          description: 'Uncontrolled initial visibility.',
        },
        onOpenChange: {
          type: '(open: boolean) => void',
          description: 'Called after a dismissal finishes.',
        },
      }),
      dataAttributes: {
        'data-tone': 'neutral | info | success | warning | danger',
        'data-ending-style': 'Fading out after Dismiss.',
        'data-collapsing': 'Closing the space it held.',
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
      description: 'Offline, with Retry; dismissing closes the space.',
    },
  ],
  accessibility: [
    'Warning and danger use role="alert" (announced once when shown); others use role="status".',
    'Tone is never colour alone: glyph + title carry it.',
    'The dismiss button has a 44px hit area.',
  ],
  motion:
    'Dismiss fades and lifts 4 px in 180 ms, then the space closes over 260 ms — the one layout transition, declared because the rows below must follow.',
  tokens: ['info-soft', 'success-soft', 'warning-soft', 'danger-soft', 'line', 'radius-md'],
  related: ['toast', 'alert-dialog', 'field'],
});

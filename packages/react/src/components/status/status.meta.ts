import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { StatusOwnProps } from './status.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Status',
  slug: 'status',
  category: 'atoms',
  status: 'new',
  description: 'A state in words — word, glyph and tint — with when it happened.',
  whenToUse: [
    'The state of a thing in a list or detail: Synced, Downloading, Couldn’t sync, Storage almost full.',
    'Work in progress that the user is waiting on (tone="pending").',
  ],
  whenNotToUse: [
    'A count — use Badge.',
    'A message that needs action — use Banner or Toast.',
    'A filter the user can toggle — use Chip.',
  ],
  import: "import { Status } from '@hanji/react';",
  parts: [
    {
      name: 'Status',
      element: 'span',
      slot: 'Status',
      className: 'hj-status',
      description: 'Glyph + word (+ muted meta) on a soft tint pill, or plain inline.',
      props: props<StatusOwnProps>({
        tone: {
          type: "'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'pending'",
          default: "'neutral'",
          description:
            'success ✓ moss · warning △ amber · danger ✕ danger · info i azure · neutral dot · pending live ring in the accent.',
        },
        variant: {
          type: "'tint' | 'plain'",
          default: "'tint'",
          description: 'tint pill for lists; plain inline in text.',
        },
        meta: {
          type: 'ReactNode',
          description: 'Muted qualifier after a dot — usually a time (“2 min ago”).',
        },
        icon: {
          type: 'boolean',
          default: 'true',
          description: 'Show the glyph. Keep it unless the word is unmistakable.',
        },
        render: {
          type: 'ReactElement | (props, state) => ReactElement',
          description: 'Replace the element.',
        },
      }),
      dataAttributes: { 'data-tone': 'The tone.', 'data-variant': 'tint | plain' },
      cssVars: { '--hj-status-height': 'Pill height. Default 26px.' },
    },
  ],
  examples: [
    {
      file: 'tones',
      title: 'Tones',
      description: 'Every tone with a real word and when it happened.',
    },
    {
      file: 'in-a-list',
      title: 'In a list',
      description: 'Download states, one failed with a reason, one pending.',
    },
  ],
  accessibility: [
    'The word carries the meaning; the glyph and tint repeat it — never colour alone.',
    'For a status that changes while the user watches, put it inside an aria-live="polite" region.',
  ],
  motion:
    'Pending draws a ring that breathes outward every 1.6 s. It is ambient: it pauses under reduced motion (animation-play-state: var(--hj-ambient)).',
  tokens: [
    'success',
    'success-soft',
    'warning',
    'warning-soft',
    'danger',
    'danger-soft',
    'info',
    'info-soft',
    'accent',
    'accent-soft',
    'ambient',
  ],
  related: ['badge', 'banner', 'chip'],
});

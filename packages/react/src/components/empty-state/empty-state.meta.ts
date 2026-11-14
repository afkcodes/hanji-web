import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { RootOwnProps } from './empty-state.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'EmptyState',
  slug: 'empty-state',
  category: 'data',
  status: 'stable',
  description:
    'What fills a region when there is nothing to show: a glyph, a title, one sentence and the way out.',
  whenToUse: [
    'A list or page with no items yet — with the action that creates the first one.',
    'A search or filter with no matches — with a way to widen it.',
    'Offline, or a load that failed — with Retry.',
  ],
  whenNotToUse: [
    'While loading — use skeletons; an empty state during a load is a lie.',
    'A transient error after an action — use Toast or a field error.',
  ],
  import: "import { EmptyState } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      slot: 'EmptyState.Root',
      className: 'hj-empty-state',
      description:
        'The block. Rises in like surface content. Offline and error variants are role="status" so the change is announced.',
      props: props<RootOwnProps>({
        variant: {
          type: "'empty' | 'no-results' | 'offline' | 'error'",
          default: "'empty'",
          description: 'Picks the default glyph and tone (error is danger).',
        },
        align: {
          type: "'center' | 'start'",
          default: "'center'",
          description: 'center for a whole region; start inside a column.',
        },
      }),
      dataAttributes: {
        'data-variant': 'empty | no-results | offline | error',
        'data-align': 'center | start',
      },
      cssVars: {
        '--hj-empty-state-max': 'Text measure. Default 360px.',
        '--hj-empty-state-glyph': 'Glyph disc size. Default 56px.',
      },
    },
    {
      name: 'Glyph',
      element: 'span',
      slot: 'EmptyState.Glyph',
      className: 'hj-empty-state-glyph',
      description:
        'A 24px glyph in a soft 56px disc. With no children: tray, search, wifi-off or alert by variant.',
    },
    {
      name: 'Title',
      element: 'h3',
      slot: 'EmptyState.Title',
      className: 'hj-empty-state-title',
      description: 'Says what is missing. render={<h2 />} to fit the outline.',
    },
    {
      name: 'Description',
      element: 'p',
      slot: 'EmptyState.Description',
      className: 'hj-empty-state-description',
      description: 'One sentence: why, and what to do.',
    },
    {
      name: 'Actions',
      element: 'div',
      slot: 'EmptyState.Actions',
      className: 'hj-empty-state-actions',
      description: 'One primary action, at most one quiet one.',
    },
  ],
  examples: [
    {
      file: 'variants',
      title: 'Four variants',
      description: 'Nothing yet, no results, offline and failed — each with its way out.',
    },
    {
      file: 'inline',
      title: 'Inside a column',
      description: 'Start-aligned, in a narrow side panel.',
    },
  ],
  accessibility: [
    'The glyph is decorative; the title and sentence carry the meaning.',
    'Offline and error are role="status", so a screen reader hears the change.',
    'Choose the heading level with render so the page outline stays right.',
  ],
  motion: 'Rises 12px and fades in on gentle, settled — a fade only under reduced motion.',
  tokens: ['fg-dim', 'danger', 'type-heading', 'rise', 'travel', 'ease-gentle-settle'],
  related: ['list', 'table', 'button'],
});

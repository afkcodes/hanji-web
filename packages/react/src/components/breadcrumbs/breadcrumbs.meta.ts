import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { ItemOwnProps, RootOwnProps } from './breadcrumbs.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Breadcrumbs',
  slug: 'breadcrumbs',
  category: 'navigation',
  status: 'new',
  description: 'Where this page sits in a hierarchy, with a way back up each level.',
  whenToUse: [
    'Deep hierarchies on the web: Library › Playlists › Shared with you › Late Night Drive.',
  ],
  whenNotToUse: [
    'Flat apps or mobile screens — a back button says enough.',
    'Steps in a process — use Steps.',
  ],
  import: "import { Breadcrumbs } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'nav',
      slot: 'Breadcrumbs.Root',
      className: 'hj-breadcrumbs-root',
      description: 'A labelled <nav> with an <ol>; inserts separators and collapses long trails.',
      props: props<RootOwnProps>({
        maxItems: {
          type: 'number',
          description:
            'Collapse beyond this many: first item, “…”, then the last maxItems − 1. “…” reveals the rest in place.',
        },
        separator: {
          type: 'ReactNode',
          default: 'chevronRight icon',
          description: 'Drawn between items (aria-hidden).',
        },
        expandLabel: {
          type: '(hidden: number) => string',
          default: '(n) => `Show ${n} more`',
          description: 'Accessible label of the “…” button (localise it).',
        },
      }),
      dataAttributes: { 'data-collapsed': 'Some middle items are hidden behind “…”.' },
      cssVars: {
        '--hj-breadcrumbs-gap': 'Gap around separators. Default 6px.',
        '--hj-breadcrumbs-font-size': 'Text size. Default 13.5px.',
      },
    },
    {
      name: 'Item',
      element: 'li > a',
      slot: 'Breadcrumbs.Item',
      className: 'hj-breadcrumbs-link',
      description:
        'One crumb. `current` renders the page as text with aria-current="page". Long names truncate.',
      props: props<ItemOwnProps>({
        current: {
          type: 'boolean',
          default: 'false',
          description: 'This page; rendered as text, not a link.',
        },
        href: {
          type: 'string',
          description: 'Destination. Or use render with your router’s Link.',
        },
      }),
      dataAttributes: { 'data-current': 'This page.' },
    },
  ],
  examples: [
    { file: 'trail', title: 'A trail', description: 'Four levels ending on the current page.' },
    {
      file: 'collapsed',
      title: 'Collapsed',
      description: 'Six levels collapsed to three, with a long final name that truncates.',
    },
  ],
  accessibility: [
    'nav landmark (label it “Breadcrumb”) with an ordered list; separators are aria-hidden.',
    'The current page carries aria-current="page" and is not a link.',
    'The “…” button has a label that says how many levels it reveals, and a 44px hit area.',
  ],
  motion: 'Revealed items fade in (base, ease-out). Links change colour on a 180 ms ease-out.',
  tokens: ['fg', 'fg-mute', 'fg-dim'],
  related: ['navigation-menu', 'steps'],
});

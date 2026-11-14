import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { KbdOwnProps } from './kbd.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Kbd',
  slug: 'kbd',
  category: 'atoms',
  status: 'new',
  description:
    'A keyboard key, set in mono on a hairline, for shortcuts in menus, fields and help text.',
  whenToUse: ['Showing a shortcut: ⌘K in a search field, Esc in a dialog hint, ⇧⌘P in a menu.'],
  whenNotToUse: ['Inline code or values — use Text variant="mono".'],
  import: "import { Kbd } from '@hanji/react';",
  parts: [
    {
      name: 'Kbd',
      element: 'kbd',
      slot: 'Kbd',
      className: 'hj-kbd',
      description:
        'One key. Place keys side by side for a chord; adjacent keys get 3px between them.',
      props: props<KbdOwnProps>({
        size: { type: "'sm' | 'md'", default: "'md'", description: '18 / 22 px tall.' },
        render: {
          type: 'ReactElement | (props, state) => ReactElement',
          description: 'Replace the element.',
        },
      }),
      dataAttributes: { 'data-size': 'sm | md' },
      cssVars: { '--hj-kbd-height': 'Key height.', '--hj-kbd-bg': 'Key fill. Default surface-2.' },
    },
  ],
  examples: [
    {
      file: 'shortcuts',
      title: 'Shortcuts',
      description: 'Chords in prose and a hint inside a search field.',
    },
    {
      file: 'menu',
      title: 'In a list',
      description: 'Small keys aligned right in a list of commands.',
    },
  ],
  accessibility: [
    'Renders <kbd>, which screen readers announce as keyboard input.',
    'Symbols like ⌘ are read literally; add a visually hidden word (“Command”) where it matters.',
  ],
  tokens: ['surface-2', 'line', 'fg-dim', 'font-mono'],
  related: ['text', 'field'],
});

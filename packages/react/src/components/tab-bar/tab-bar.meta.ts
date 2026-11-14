import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { ItemOwnProps, RootOwnProps } from './tab-bar.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'TabBar',
  slug: 'tab-bar',
  category: 'navigation',
  status: 'new',
  description: 'The mobile-web bottom bar: three to five top-level destinations, icon over label.',
  whenToUse: ['Primary navigation of a phone-sized web app with 3–5 destinations of equal weight.'],
  whenNotToUse: [
    'Actions (compose, record, scan) — a tab never opens a sheet or starts something. Use a Button.',
    'Desktop layouts — use NavigationMenu or a sidebar.',
    'Views of one thing — use Tabs.',
  ],
  import: "import { TabBar } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'nav',
      slot: 'TabBar.Root',
      className: 'hj-tab-bar-root',
      description:
        'Equal columns, 56px + the safe-area inset, page background with a top hairline.',
      props: props<RootOwnProps>({
        value: { type: 'string', description: 'Active item (controlled).' },
        defaultValue: { type: 'string', description: 'Initially active item (uncontrolled).' },
        onValueChange: {
          type: '(value: string) => void',
          description: 'Called when an item with a value is pressed.',
        },
        fixed: {
          type: 'boolean',
          default: 'false',
          description: 'Pin to the bottom of the viewport.',
        },
      }),
      dataAttributes: { 'data-fixed': 'Pinned to the viewport.' },
      cssVars: {
        '--hj-tab-bar-height': 'Bar height before the safe-area inset. Default 56px.',
        '--hj-tab-bar-bg': 'Background. Default the paper (bg).',
      },
    },
    {
      name: 'Item',
      element: 'button',
      slot: 'TabBar.Item',
      className: 'hj-tab-bar-item',
      description:
        'One destination. Render a link with render={<a href />}; active items get aria-current="page".',
      props: props<ItemOwnProps>({
        value: { type: 'string', description: 'Identifies the item for Root’s value.' },
        active: {
          type: 'boolean',
          description: 'Force active (e.g. from your router). Overrides Root’s value.',
        },
        icon: { type: 'ReactNode', description: '24px glyph above the label.' },
        badge: {
          type: 'number | boolean',
          description: 'A count pill (99+) or true for a dot. Announced to screen readers.',
        },
      }),
      dataAttributes: { 'data-active': 'Current destination — accent icon and label.' },
    },
  ],
  examples: [
    {
      file: 'app',
      title: 'App bar',
      description: 'Five destinations with a badge, switching the screen above.',
    },
    {
      file: 'links',
      title: 'Router links',
      description: 'Items rendered as links, active from the URL; a dot badge and four items.',
    },
  ],
  accessibility: [
    'A <nav> landmark — give it aria-label (e.g. "Main").',
    'The active item has aria-current="page"; badges are announced as “, 3 new”.',
    'Every item is a full 56px-tall column: well over the 44px target.',
  ],
  motion:
    'Colour changes on a 180 ms ease-out. When an item becomes active its icon settles once from .82 on the bouncy spring (never on load, never looped; a quick scale under reduced motion). Press dips the icon to .9.',
  tokens: ['bg', 'line', 'accent', 'on-accent', 'fg-dim', 'ease-bouncy', 'dur-bouncy'],
  related: ['tabs', 'navigation-menu', 'badge'],
});

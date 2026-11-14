import { defineMeta } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';

export const meta: ComponentMeta = defineMeta({
  name: 'Menubar',
  slug: 'menubar',
  category: 'surfaces',
  status: 'stable',
  description: 'A row of menus (File · Edit · View) that behave as one, for desktop-style apps.',
  whenToUse: ['Dense, desktop-class tools with many commands: editors, consoles, admin.'],
  whenNotToUse: [
    'Consumer screens and phones — use a Menu on a “more” button.',
    'Site navigation — use NavigationMenu.',
  ],
  import: "import { Menubar } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      base: 'Menubar',
      slot: 'Menubar.Root',
      className: 'hj-menubar',
      description: 'role="menubar"; orientation, loopFocus, modal, disabled.',
      dataAttributes: {
        'data-orientation': 'horizontal | vertical',
        'data-has-submenu-open': 'A menu in the bar is open.',
      },
    },
    {
      name: 'Menu',
      element: '(none)',
      base: 'Menu.Root',
      slot: 'Menu.Root',
      className: '',
      description: 'One menu in the bar.',
    },
    {
      name: 'Trigger',
      element: 'button',
      base: 'Menu.Trigger',
      slot: 'Menubar.Trigger',
      className: 'hj-menubar-trigger',
      description: 'Quiet text trigger; fg 6% while hovered or open.',
      cssVars: { '--hj-menubar-trigger-height': 'Trigger height. Default 32px.' },
    },
    {
      name: 'Content, Item, CheckboxItem, RadioGroup, RadioItem, SubmenuRoot, SubmenuTrigger, Group, GroupLabel, Separator, Shortcut, LinkItem, Popup, Positioner, Portal, Arrow, Backdrop',
      element: '(see Menu)',
      slot: 'Menu.*',
      className: 'hj-menu-*',
      description: 'Menu’s own parts, re-exported.',
    },
  ],
  examples: [
    {
      file: 'editor',
      title: 'Editor bar',
      description: 'File, Edit and View with shortcuts, checks and a disabled item.',
    },
    {
      file: 'vertical',
      title: 'Vertical',
      description: 'A side bar of menus that open to the right; one is unavailable.',
    },
  ],
  accessibility: [
    '←/→ move between triggers; ↓ opens a menu; hovering moves between open menus.',
    'Rows behave exactly as in Menu.',
  ],
  motion: 'Menus grow from their trigger on snappy; moving between open menus is instant.',
  tokens: ['surface', 'line', 'fg-dim', 'radius-sm', 'radius-xs'],
  related: ['menu', 'context-menu', 'toolbar'],
  baseUi: 'menubar',
});

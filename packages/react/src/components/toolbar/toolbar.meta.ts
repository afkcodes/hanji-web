import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { ButtonOwnProps, RootOwnProps, ToggleOwnProps } from './toolbar.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Toolbar',
  slug: 'toolbar',
  category: 'navigation',
  status: 'stable',
  description: 'A group of controls that acts as one tab stop; arrow keys move inside it.',
  whenToUse: [
    'Formatting bars, editor actions, list actions above a table, a player’s secondary controls.',
  ],
  whenNotToUse: [
    'One or two actions — use Buttons.',
    'Page navigation — use Tabs or NavigationMenu.',
  ],
  import: "import { Toolbar } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      base: 'Toolbar.Root',
      slot: 'Toolbar.Root',
      className: 'hj-toolbar-root',
      description: 'The toolbar. orientation, loopFocus and disabled come from Base UI.',
      props: props<RootOwnProps>({
        variant: {
          type: "'surface' | 'plain'",
          default: "'surface'",
          description: 'surface = hairlined surface-2 tray; plain = items only.',
        },
      }),
      dataAttributes: {
        'data-variant': 'surface | plain',
        'data-orientation': 'horizontal | vertical',
      },
      cssVars: {
        '--hj-toolbar-size': 'Button height. Default 36px.',
        '--hj-toolbar-radius': 'Tray radius. Default radius-sm; buttons nest at radius − 4.',
        '--hj-toolbar-gap': 'Gap between items. Default 2px.',
      },
    },
    {
      name: 'Button',
      element: 'button',
      base: 'Toolbar.Button',
      slot: 'Toolbar.Button',
      className: 'hj-toolbar-button',
      description: 'A quiet button. Compose triggers (Menu, Select, Popover) through render.',
      props: props<ButtonOwnProps>({
        iconOnly: {
          type: 'boolean',
          default: 'false',
          description: 'Square, for a lone icon. Needs aria-label.',
        },
      }),
      dataAttributes: {
        'data-icon-only': 'Square.',
        'data-disabled': 'Disabled.',
        'data-popup-open': 'A composed popup is open.',
      },
    },
    {
      name: 'Toggle',
      element: 'button',
      base: 'Toolbar.Button + Toggle',
      slot: 'Toolbar.Toggle',
      className: 'hj-toolbar-button',
      description:
        'A button that stays pressed (bold, italic). One-of-many inside a Base UI ToggleGroup.',
      props: props<ToggleOwnProps>({
        iconOnly: { type: 'boolean', default: 'false', description: 'Square, for a lone icon.' },
        pressed: { type: 'boolean', description: 'Controlled pressed state.' },
        defaultPressed: {
          type: 'boolean',
          default: 'false',
          description: 'Initial pressed state.',
        },
        onPressedChange: {
          type: '(pressed: boolean, details) => void',
          description: 'Called when pressed changes.',
        },
        value: { type: 'string', description: 'Identifies it inside a ToggleGroup.' },
      }),
      dataAttributes: { 'data-pressed': 'Pressed — accent on accent-soft.' },
    },
    {
      name: 'Group',
      element: 'div',
      base: 'Toolbar.Group',
      slot: 'Toolbar.Group',
      className: 'hj-toolbar-group',
      description: 'Groups related items; label it with aria-label.',
    },
    {
      name: 'Separator',
      element: 'div',
      base: 'Toolbar.Separator',
      slot: 'Toolbar.Separator',
      className: 'hj-toolbar-separator',
      description: 'A 1px rule between groups.',
    },
    {
      name: 'Link',
      element: 'a',
      base: 'Toolbar.Link',
      slot: 'Toolbar.Link',
      className: 'hj-toolbar-link',
      description: 'A link inside the toolbar, in the accent.',
    },
    {
      name: 'Input',
      element: 'input',
      base: 'Toolbar.Input',
      slot: 'Toolbar.Input',
      className: 'hj-toolbar-input',
      description: 'A compact input that joins the roving focus.',
    },
  ],
  examples: [
    {
      file: 'formatting',
      title: 'Formatting bar',
      description: 'Toggles, an alignment group, a separator and a disabled action.',
    },
    {
      file: 'list-actions',
      title: 'List actions',
      description: 'A plain toolbar over a list with a filter input and a link.',
    },
  ],
  accessibility: [
    'role="toolbar"; one Tab stop for the whole bar, arrow keys move between items (Base UI).',
    'Disabled buttons stay focusable by default so the keyboard path doesn’t shift.',
    'Icon-only buttons need aria-label; groups need aria-label.',
  ],
  motion:
    'Press dips to .97 in 70 ms and releases on snappy; pressed state is colour on a 180 ms ease-out.',
  tokens: ['surface-2', 'surface', 'line', 'accent', 'accent-soft', 'fg-dim', 'radius-sm'],
  related: ['button', 'segmented-control', 'menu'],
  baseUi: 'toolbar',
});

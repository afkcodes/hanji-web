import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { ContentOwnProps } from './context-menu.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'ContextMenu',
  slug: 'context-menu',
  category: 'surfaces',
  status: 'stable',
  description: 'A Menu opened by right-click or long-press on an area, at the pointer.',
  whenToUse: [
    'Power-user shortcuts on rows, tiles or a canvas — always duplicated somewhere visible.',
  ],
  whenNotToUse: [
    'The only way to reach an action — add a visible “more” Menu too.',
    'Touch-first screens where long-press is undiscoverable.',
  ],
  import: "import { ContextMenu } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: '(none)',
      base: 'ContextMenu.Root',
      slot: 'ContextMenu.Root',
      className: '',
      description: 'State owner.',
    },
    {
      name: 'Trigger',
      element: 'div',
      base: 'ContextMenu.Trigger',
      slot: 'ContextMenu.Trigger',
      className: 'hj-context-menu-trigger',
      description:
        'The area that responds to right-click / long-press. Outlined in accent while open.',
      dataAttributes: { 'data-popup-open': 'The menu is open.' },
    },
    {
      name: 'Positioner',
      element: 'div',
      base: 'ContextMenu.Positioner',
      slot: 'ContextMenu.Positioner',
      className: 'hj-context-menu-positioner',
      description: 'Places the popup at the pointer.',
    },
    {
      name: 'Content',
      element: '(portal)',
      slot: 'ContextMenu.Content',
      className: 'hj-menu-popup',
      description: 'Shorthand: Portal + Positioner + Popup.',
      props: props<ContentOwnProps>({
        container: { type: 'HTMLElement | ShadowRoot | RefObject', description: 'Portal target.' },
        keepMounted: {
          type: 'boolean',
          default: 'false',
          description: 'Keep in the DOM while closed.',
        },
      }),
    },
    {
      name: 'Item, CheckboxItem, RadioGroup, RadioItem, SubmenuRoot, SubmenuTrigger, Group, GroupLabel, Separator, Shortcut, LinkItem, Popup, Portal, Arrow, Backdrop',
      element: '(see Menu)',
      slot: 'Menu.*',
      className: 'hj-menu-*',
      description: 'Menu’s own parts, re-exported. Customise them through the Menu.* slots.',
    },
  ],
  examples: [
    { file: 'track', title: 'On a row', description: 'Right-click (or long-press) a track.' },
    {
      file: 'canvas',
      title: 'On an empty area',
      description: 'An empty library offers to create, not just to act.',
    },
  ],
  accessibility: [
    'Opens with the context-menu key or Shift+F10 on the focused trigger as well as right-click.',
    'Same roles and keys as Menu.',
  ],
  motion: 'Same as Menu: grows from the pointer on snappy; leaves in 180 ms.',
  tokens: ['accent', 'surface-2', 'line', 'shadow-lift'],
  related: ['menu', 'menubar'],
  baseUi: 'context-menu',
});

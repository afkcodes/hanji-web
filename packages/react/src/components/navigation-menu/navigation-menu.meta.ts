import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { LinkOwnProps, SurfaceOwnProps, TriggerOwnProps } from './navigation-menu.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'NavigationMenu',
  slug: 'navigation-menu',
  category: 'navigation',
  status: 'stable',
  description:
    'A site’s top navigation: links and triggers that open rich link panels in one shared, morphing surface.',
  whenToUse: [
    'Primary web navigation with a handful of sections, some of which group several destinations.',
  ],
  whenNotToUse: [
    'Actions on the current page — use Menu.',
    'Mobile-web primary navigation — use TabBar.',
    'Switching views of one thing — use Tabs.',
  ],
  import: "import { NavigationMenu } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'nav',
      base: 'NavigationMenu.Root',
      slot: 'NavigationMenu.Root',
      className: 'hj-navigation-menu-root',
      description:
        'Owns the open item (value / defaultValue / onValueChange), delay and orientation.',
    },
    {
      name: 'List',
      element: 'ul',
      base: 'NavigationMenu.List',
      slot: 'NavigationMenu.List',
      className: 'hj-navigation-menu-list',
      description: 'The top-level row.',
    },
    {
      name: 'Item',
      element: 'li',
      base: 'NavigationMenu.Item',
      slot: 'NavigationMenu.Item',
      className: 'hj-navigation-menu-item',
      description: 'One entry: a Trigger + Content, or a Link.',
    },
    {
      name: 'Trigger',
      element: 'button',
      base: 'NavigationMenu.Trigger',
      slot: 'NavigationMenu.Trigger',
      className: 'hj-navigation-menu-trigger',
      description: 'Opens its Content on hover or click; a 36px pill.',
      props: props<TriggerOwnProps>({
        chevron: { type: 'boolean', default: 'true', description: 'Append the chevron Icon.' },
      }),
      dataAttributes: { 'data-popup-open': 'Its content is showing.' },
      cssVars: { '--hj-navigation-menu-height': 'Trigger and item-link height. Default 36px.' },
    },
    {
      name: 'Icon',
      element: 'span',
      base: 'NavigationMenu.Icon',
      slot: 'NavigationMenu.Icon',
      className: 'hj-navigation-menu-icon',
      description: 'The chevron; turns 180° when open.',
    },
    {
      name: 'Content',
      element: 'div',
      base: 'NavigationMenu.Content',
      slot: 'NavigationMenu.Content',
      className: 'hj-navigation-menu-content',
      description: 'What a Trigger opens; rendered inside the Surface’s Viewport.',
      dataAttributes: {
        'data-activation-direction': 'left | right — the pointer’s direction between triggers.',
      },
    },
    {
      name: 'Link',
      element: 'a',
      base: 'NavigationMenu.Link',
      slot: 'NavigationMenu.Link',
      className: 'hj-navigation-menu-link',
      description:
        'A destination. Use render for your router’s Link and `active` for the current page.',
      props: props<LinkOwnProps>({
        variant: {
          type: "'item' | 'card'",
          default: "'card'",
          description:
            'item = top-level pill in the List; card = a block link in Content (LinkTitle + LinkDescription).',
        },
      }),
      dataAttributes: { 'data-variant': 'item | card', 'data-active': 'The current page.' },
    },
    {
      name: 'LinkTitle',
      element: 'span',
      slot: 'NavigationMenu.LinkTitle',
      className: 'hj-navigation-menu-link-title',
      description: 'Card title.',
    },
    {
      name: 'LinkDescription',
      element: 'span',
      slot: 'NavigationMenu.LinkDescription',
      className: 'hj-navigation-menu-link-description',
      description: 'Card description, one line.',
    },
    {
      name: 'Surface',
      element: '(portal)',
      slot: 'NavigationMenu.Popup',
      className: 'hj-navigation-menu-popup',
      description: 'Shorthand: Portal + Positioner + Popup + Viewport. Place once after the List.',
      props: props<SurfaceOwnProps>({
        arrow: {
          type: 'boolean',
          default: 'false',
          description: 'Draw an arrow toward the trigger.',
        },
        sideOffset: {
          type: 'number',
          default: '8',
          description: 'Gap between trigger and surface.',
        },
      }),
      cssVars: {
        '--hj-navigation-menu-radius': 'Surface radius. Default radius-md.',
        '--popup-width': 'Measured by Base UI (read-only).',
        '--popup-height': 'Measured by Base UI (read-only).',
      },
    },
    {
      name: 'Portal',
      element: '(portal)',
      base: 'NavigationMenu.Portal',
      slot: 'NavigationMenu.Portal',
      className: '',
      description: 'Portals and re-applies the nearest Theme.',
    },
    {
      name: 'Positioner',
      element: 'div',
      base: 'NavigationMenu.Positioner',
      slot: 'NavigationMenu.Positioner',
      className: 'hj-navigation-menu-positioner',
      description: 'Places the surface; defaults sideOffset 8, collisionPadding 12.',
    },
    {
      name: 'Popup',
      element: 'nav',
      base: 'NavigationMenu.Popup',
      slot: 'NavigationMenu.Popup',
      className: 'hj-navigation-menu-popup',
      description: 'The surface: surface-2, hairline, lift.',
    },
    {
      name: 'Viewport',
      element: 'div',
      base: 'NavigationMenu.Viewport',
      slot: 'NavigationMenu.Viewport',
      className: 'hj-navigation-menu-viewport',
      description: 'Clips the active Content.',
    },
    {
      name: 'Arrow',
      element: 'div',
      base: 'NavigationMenu.Arrow',
      slot: 'NavigationMenu.Arrow',
      className: 'hj-navigation-menu-arrow',
      description: 'Optional pointer to the trigger.',
    },
    {
      name: 'Backdrop',
      element: 'div',
      base: 'NavigationMenu.Backdrop',
      slot: 'NavigationMenu.Backdrop',
      className: 'hj-navigation-menu-backdrop',
      description: 'Optional dim behind the open menu.',
    },
  ],
  examples: [
    {
      file: 'site',
      title: 'Site navigation',
      description: 'Two panels of link cards, a plain link and a current page.',
    },
    {
      file: 'compact',
      title: 'Compact with arrow',
      description: 'Smaller triggers, an arrow, and one disabled section.',
    },
  ],
  accessibility: [
    'A <nav> landmark with a list; triggers expose aria-expanded and open on Enter, Space or ArrowDown.',
    'Escape closes and returns focus to the trigger; Tab moves into the open content.',
    'Mark the current page with Link’s `active` (aria-current="page").',
  ],
  motion:
    'Declared layout transition: the surface’s width/height and the positioner’s offset glide between items on gentle (clamped) so it morphs rather than reopening. Content steps 24px toward the pointer’s direction and fades (a fade under reduced motion). The surface enters from .96 on snappy, clamped, and leaves in 180 ms.',
  tokens: [
    'surface-2',
    'line',
    'shadow-lift',
    'radius-md',
    'accent',
    'fg-dim',
    'ease-gentle-settle',
    'ease-snappy-settle',
  ],
  related: ['menu', 'tab-bar', 'breadcrumbs'],
  baseUi: 'navigation-menu',
});

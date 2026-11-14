import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { ListOwnProps } from './tabs.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Tabs',
  slug: 'tabs',
  category: 'navigation',
  status: 'stable',
  description: 'Switches between views of the same subject without leaving the page.',
  whenToUse: [
    'Two to six sibling views of one thing: Overview / Tracks / Credits.',
    'pill for a compact view switch inside a card or toolbar; underline for page-level sections.',
  ],
  whenNotToUse: [
    'Moving between app destinations — use TabBar (mobile) or NavigationMenu.',
    'Filtering one list by a value — use SegmentedControl or Chips.',
    'A sequence the user must complete in order — use Steps.',
  ],
  import: "import { Tabs } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      base: 'Tabs.Root',
      slot: 'Tabs.Root',
      className: 'hj-tabs-root',
      description: 'Owns the value (value / defaultValue / onValueChange) and orientation.',
      dataAttributes: {
        'data-orientation': 'horizontal | vertical',
        'data-activation-direction': 'left | right | up | down | none — where the user moved from.',
      },
    },
    {
      name: 'List',
      element: 'div',
      base: 'Tabs.List',
      slot: 'Tabs.List',
      className: 'hj-tabs-list',
      description:
        'The row of tabs. Renders the moving indicator after its children. activateOnFocus and loopFocus come from Base UI.',
      props: props<ListOwnProps>({
        variant: {
          type: "'underline' | 'pill'",
          default: "'underline'",
          description:
            'underline = 2px accent rule; pill = accent-soft pill inside a surface track.',
        },
        size: {
          type: "'sm' | 'md'",
          default: "'md'",
          description: 'Tab height 36 / 44 (underline), 26 / 32 inside the pill track.',
        },
        indicator: {
          type: 'boolean',
          default: 'true',
          description: 'Render Tabs.Indicator automatically. Off to place or style your own.',
        },
        fill: {
          type: 'boolean',
          default: 'false',
          description: 'Tabs share the full width equally.',
        },
      }),
      dataAttributes: {
        'data-variant': 'underline | pill',
        'data-size': 'sm | md',
        'data-fill': 'Present when tabs fill the width.',
        'data-ready':
          'Present after the first measured frame; the indicator animates from then on.',
      },
      cssVars: {
        '--hj-tabs-height': 'Tab height.',
        '--hj-tabs-gap': 'Gap between underline tabs. Default space-6.',
        '--hj-tabs-indicator': 'Indicator colour. Default accent (underline) / accent-soft (pill).',
        '--hj-tabs-radius': 'Pill radius. Default pill.',
      },
    },
    {
      name: 'Tab',
      element: 'button',
      base: 'Tabs.Tab',
      slot: 'Tabs.Tab',
      className: 'hj-tabs-tab',
      description: 'One tab. Needs a value matching its Panel.',
      dataAttributes: { 'data-active': 'The selected tab.', 'data-disabled': 'Disabled.' },
    },
    {
      name: 'Indicator',
      element: 'span',
      base: 'Tabs.Indicator',
      slot: 'Tabs.Indicator',
      className: 'hj-tabs-indicator',
      description: 'Follows the active tab by clip-path using Base UI’s --active-tab-* offsets.',
      cssVars: {
        '--active-tab-left': 'Set by Base UI (read-only).',
        '--active-tab-right': 'Set by Base UI (read-only).',
        '--active-tab-top': 'Set by Base UI (read-only).',
        '--active-tab-bottom': 'Set by Base UI (read-only).',
      },
    },
    {
      name: 'Panel',
      element: 'div',
      base: 'Tabs.Panel',
      slot: 'Tabs.Panel',
      className: 'hj-tabs-panel',
      description: 'Content for one tab. Unmounted while hidden unless keepMounted.',
      dataAttributes: {
        'data-hidden': 'Hidden.',
        'data-activation-direction': 'Direction of travel.',
      },
    },
  ],
  examples: [
    {
      file: 'underline',
      title: 'Page sections',
      description: 'Underline tabs over three panels, one disabled.',
    },
    {
      file: 'pill',
      title: 'Pill switch',
      description: 'A compact pill switch that fills its container.',
    },
  ],
  accessibility: [
    'role="tablist" / "tab" / "tabpanel" with aria-selected and aria-controls, from Base UI.',
    'Arrow keys move between tabs (looping); Enter or Space activates, or set activateOnFocus.',
    'Pill tabs keep a 44px hit area around the 32px drawing.',
  ],
  motion:
    'The indicator is one element clipped to the active tab and moves on snappy, clamped — no width or left animation. It is placed without motion on the first frame. Panels fade in with an 8px step from the direction of travel (a pure fade under reduced motion).',
  tokens: [
    'accent',
    'accent-soft',
    'surface',
    'line',
    'fg',
    'fg-dim',
    'ease-snappy-settle',
    'ease-gentle-settle',
  ],
  related: ['segmented-control', 'tab-bar', 'navigation-menu'],
  baseUi: 'tabs',
});

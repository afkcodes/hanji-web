import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { ContentOwnProps, HintOwnProps } from './tooltip.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Tooltip',
  slug: 'tooltip',
  category: 'surfaces',
  status: 'stable',
  description: 'A short label that names a control on hover or keyboard focus.',
  whenToUse: [
    'Naming an icon-only control (Copy link, Shuffle).',
    'A keyboard shortcut or a short hint that the UI already implies.',
  ],
  whenNotToUse: [
    'Anything the user must read to proceed — put it on the page.',
    'Interactive content (links, buttons) — use Popover or PreviewCard.',
    'Touch-first surfaces — tooltips never appear on tap.',
  ],
  import: "import { Tooltip } from '@hanji/react';",
  parts: [
    {
      name: 'Provider',
      element: '(none)',
      base: 'Tooltip.Provider',
      slot: 'Tooltip.Provider',
      className: '',
      description:
        'Groups tooltips: after one opens, neighbours open instantly. Delay defaults to 500 ms.',
    },
    {
      name: 'Root',
      element: '(none)',
      base: 'Tooltip.Root',
      slot: 'Tooltip.Root',
      className: '',
      description: 'State owner: open, onOpenChange, disabled.',
    },
    {
      name: 'Trigger',
      element: 'button',
      base: 'Tooltip.Trigger',
      slot: 'Tooltip.Trigger',
      className: 'hj-tooltip-trigger',
      description: 'The element being explained. Delay defaults to 500 ms (Base UI: 600).',
    },
    {
      name: 'Portal',
      element: '(portal)',
      base: 'Tooltip.Portal',
      slot: 'Tooltip.Portal',
      className: '',
      description: 'Portals to body and re-applies the nearest Theme.',
    },
    {
      name: 'Positioner',
      element: 'div',
      base: 'Tooltip.Positioner',
      slot: 'Tooltip.Positioner',
      className: 'hj-tooltip-positioner',
      description: 'Places the popup (side top by default).',
    },
    {
      name: 'Popup',
      element: 'div',
      base: 'Tooltip.Popup',
      slot: 'Tooltip.Popup',
      className: 'hj-tooltip-popup',
      description: 'The ink pill: fg fill, bg text, 12.5/600.',
      dataAttributes: {
        'data-instant': 'Opened from a neighbour — no transition (Base UI).',
        'data-side': 'top | bottom | left | right',
      },
      cssVars: {
        '--hj-tooltip-width': 'Max width. Default 240px.',
        '--hj-tooltip-radius': 'Corner radius. Default radius-xs.',
      },
    },
    {
      name: 'Arrow',
      element: 'div',
      base: 'Tooltip.Arrow',
      slot: 'Tooltip.Arrow',
      className: 'hj-tooltip-arrow',
      description: 'Small ink arrow.',
    },
    {
      name: 'Viewport',
      element: 'div',
      base: 'Tooltip.Viewport',
      slot: 'Tooltip.Viewport',
      className: 'hj-tooltip-viewport',
      description: 'Animates label changes when one tooltip serves several triggers.',
    },
    {
      name: 'Content',
      element: '(portal)',
      slot: 'Tooltip.Content',
      className: 'hj-tooltip-popup',
      description: 'Shorthand: Portal + Positioner + Popup + Arrow.',
      props: props<ContentOwnProps>({
        side: {
          type: "'top' | 'bottom' | 'left' | 'right'",
          default: "'top'",
          description: 'Side of the anchor.',
        },
        align: {
          type: "'start' | 'center' | 'end'",
          default: "'center'",
          description: 'Alignment.',
        },
        sideOffset: { type: 'number', default: '8', description: 'Gap from the anchor.' },
        arrow: { type: 'boolean', default: 'true', description: 'Draw the arrow.' },
        container: { type: 'HTMLElement | ShadowRoot | RefObject', description: 'Portal target.' },
      }),
    },
    {
      name: 'Hint',
      element: '(composite)',
      slot: 'Tooltip.Content',
      className: 'hj-tooltip-popup',
      description: 'One-liner: Root + Trigger (rendering your child) + Content.',
      props: props<HintOwnProps>({
        label: { type: 'ReactNode', description: 'The tooltip text.' },
        children: {
          type: 'ReactElement',
          description: 'The element to explain; must forward ref and props.',
        },
        side: {
          type: "'top' | 'bottom' | 'left' | 'right'",
          default: "'top'",
          description: 'Side.',
        },
        delay: { type: 'number', default: '500', description: 'Open delay in ms.' },
        disabled: { type: 'boolean', default: 'false', description: 'Never open.' },
      }),
    },
  ],
  examples: [
    {
      file: 'toolbar',
      title: 'Icon toolbar',
      description: 'Grouped hints: hover one, glide to the next.',
    },
    {
      file: 'shortcut',
      title: 'With a shortcut',
      description: 'A label plus its key, on any side.',
    },
  ],
  accessibility: [
    'Opens on hover after 500 ms and immediately on keyboard focus; Escape closes.',
    'The popup is aria-describedby supplementary text — icon-only controls still need aria-label.',
    'Never put interactive content in a tooltip.',
  ],
  motion:
    'Scale .94 → 1 from the anchor on snappy, clamped, with a 180 ms fade; leaves in 180 ms. Moving between grouped tooltips is instant (data-instant).',
  tokens: ['fg', 'bg', 'radius-xs', 'ease-snappy-settle', 'dur-fast'],
  related: ['popover', 'preview-card', 'button'],
  baseUi: 'tooltip',
});

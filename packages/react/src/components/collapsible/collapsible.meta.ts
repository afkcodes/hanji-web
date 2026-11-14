import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { TriggerOwnProps } from './collapsible.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Collapsible',
  slug: 'collapsible',
  category: 'navigation',
  status: 'stable',
  description: 'One region the user can show or hide: “Show 6 more”, “Advanced options”.',
  whenToUse: [
    'Secondary detail under a summary: more tracks, advanced settings, the full description.',
  ],
  whenNotToUse: [
    'Several sibling sections — use Accordion.',
    'Content that should float over the page — use Popover.',
  ],
  import: "import { Collapsible } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      base: 'Collapsible.Root',
      slot: 'Collapsible.Root',
      className: 'hj-collapsible-root',
      description: 'Owns open / defaultOpen / onOpenChange / disabled.',
      dataAttributes: { 'data-open': 'Open.', 'data-closed': 'Closed.' },
    },
    {
      name: 'Trigger',
      element: 'button',
      base: 'Collapsible.Trigger',
      slot: 'Collapsible.Trigger',
      className: 'hj-collapsible-trigger',
      description:
        'A quiet accent text button with a trailing chevron. Compose with Button via render for other looks.',
      props: props<TriggerOwnProps>({
        chevron: { type: 'boolean', default: 'true', description: 'Draw the trailing chevron.' },
      }),
      dataAttributes: { 'data-panel-open': 'The panel is open.', 'data-chevron': 'Chevron drawn.' },
    },
    {
      name: 'Panel',
      element: 'div',
      base: 'Collapsible.Panel',
      slot: 'Collapsible.Panel',
      className: 'hj-collapsible-panel',
      description: 'The hidden region. Height animates from --collapsible-panel-height.',
      dataAttributes: {
        'data-open': 'Open.',
        'data-starting-style': 'Opening.',
        'data-ending-style': 'Closing.',
      },
      cssVars: { '--collapsible-panel-height': 'Measured by Base UI (read-only).' },
    },
  ],
  examples: [
    { file: 'more', title: 'Show more', description: 'A track list that reveals the rest.' },
    {
      file: 'advanced',
      title: 'Advanced options',
      description: 'A closed group of settings under a form, plus a disabled case.',
    },
  ],
  accessibility: [
    'Trigger is a button with aria-expanded and aria-controls.',
    'Keep the trigger’s text honest about what opens (“Show 6 more tracks”), and update it when open.',
    'hiddenUntilFound on Panel lets find-in-page reveal it.',
  ],
  motion:
    'Chevron turns on snappy. Panel height is the one declared layout transition — clipped, gentle (clamped) in, 180 ms out, text fading with it.',
  tokens: ['accent', 'fg', 'ease-snappy', 'ease-gentle-settle', 'dur-fast'],
  related: ['accordion', 'popover'],
  baseUi: 'collapsible',
});

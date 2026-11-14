import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { RootOwnProps, TriggerOwnProps } from './accordion.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Accordion',
  slug: 'accordion',
  category: 'navigation',
  status: 'stable',
  description: 'A stack of headings that each reveal their own section.',
  whenToUse: [
    'Questions and answers, settings groups, or long detail most people skip.',
    'Use multiple when sections are independent; single when one at a time keeps the page short.',
  ],
  whenNotToUse: [
    'One show/hide region — use Collapsible.',
    'Content most people need — show it; don’t make them open it.',
    'Switching views of the same thing — use Tabs.',
  ],
  import: "import { Accordion } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      base: 'Accordion.Root',
      slot: 'Accordion.Root',
      className: 'hj-accordion-root',
      description:
        'Owns open items: value / defaultValue (arrays), onValueChange, multiple, disabled.',
      props: props<RootOwnProps>({
        variant: {
          type: "'lined' | 'plain'",
          default: "'lined'",
          description: 'lined = hairline rules between items; plain = no rules, for nesting.',
        },
      }),
      dataAttributes: { 'data-variant': 'lined | plain', 'data-disabled': 'Disabled.' },
    },
    {
      name: 'Item',
      element: 'div',
      base: 'Accordion.Item',
      slot: 'Accordion.Item',
      className: 'hj-accordion-item',
      description: 'One section. Give it a value to control it.',
      dataAttributes: {
        'data-open': 'Open.',
        'data-disabled': 'Disabled.',
        'data-index': 'Position.',
      },
    },
    {
      name: 'Header',
      element: 'h3',
      base: 'Accordion.Header',
      slot: 'Accordion.Header',
      className: 'hj-accordion-header',
      description: 'The heading. Use render={<h2 />} to fit the page’s heading levels.',
    },
    {
      name: 'Trigger',
      element: 'button',
      base: 'Accordion.Trigger',
      slot: 'Accordion.Trigger',
      className: 'hj-accordion-trigger',
      description: 'The 56px row: label and a chevron that turns 180° when open.',
      props: props<TriggerOwnProps>({
        chevron: { type: 'boolean', default: 'true', description: 'Draw the chevron.' },
      }),
      dataAttributes: { 'data-panel-open': 'Its panel is open.', 'data-chevron': 'Chevron drawn.' },
      cssVars: { '--hj-accordion-row-height': 'Minimum row height. Default 56px.' },
    },
    {
      name: 'Panel',
      element: 'div',
      base: 'Accordion.Panel',
      slot: 'Accordion.Panel',
      className: 'hj-accordion-panel',
      description: 'The section body. Height animates from Base UI’s --accordion-panel-height.',
      dataAttributes: {
        'data-open': 'Open.',
        'data-starting-style': 'Opening.',
        'data-ending-style': 'Closing.',
      },
      cssVars: {
        '--accordion-panel-height': 'Measured by Base UI (read-only).',
        '--hj-accordion-gap': 'Space under the last paragraph. Default space-4.',
      },
    },
  ],
  examples: [
    {
      file: 'faq',
      title: 'Help questions',
      description: 'One open at a time, the first open; one item disabled.',
    },
    {
      file: 'multiple',
      title: 'Independent sections',
      description: 'Several open at once, plain variant.',
    },
  ],
  accessibility: [
    'Each Trigger is a button with aria-expanded and aria-controls; panels are labelled by their trigger.',
    'Header renders an <h3> — change it with render to match your outline.',
    'Use hiddenUntilFound on Root so the browser’s find-in-page can open closed sections.',
  ],
  motion:
    'The chevron turns on snappy. The panel height is the one declared layout transition: measured by Base UI, clipped, on gentle (clamped) to open and 180 ms ease-out to close, with the text fading alongside.',
  tokens: ['line', 'fg', 'fg-dim', 'fg-mute', 'ease-snappy', 'ease-gentle-settle', 'dur-fast'],
  related: ['collapsible', 'tabs'],
  baseUi: 'accordion',
});

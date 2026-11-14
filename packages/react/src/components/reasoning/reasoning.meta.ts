import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { RootOwnProps, TriggerOwnProps } from './reasoning.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Reasoning',
  slug: 'reasoning',
  category: 'ai',
  status: 'new',
  description:
    'A model’s visible thinking: open while it works, folded to “Thought for 12 s” when the answer starts.',
  whenToUse: [
    'Reasoning or planning text that the person may want to inspect but shouldn’t have to read.',
  ],
  whenNotToUse: [
    'The answer itself.',
    'Tool activity — use ToolCall, which shows status and results.',
  ],
  import: "import { Reasoning } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      base: 'Collapsible.Root',
      slot: 'Reasoning.Root',
      className: 'hj-reasoning',
      description:
        'Follows `thinking`: opens while true, collapses when it turns false. Controllable with open/onOpenChange.',
      props: props<RootOwnProps>({
        thinking: {
          type: 'boolean',
          default: 'false',
          description: 'Still thinking: open, shimmering label, aria-busy panel.',
        },
        duration: { type: 'number', description: 'Seconds thought, for the done label.' },
      }),
      dataAttributes: { 'data-thinking': 'Still thinking.', 'data-open': 'Expanded (Base UI).' },
    },
    {
      name: 'Trigger',
      element: 'button',
      base: 'Collapsible.Trigger',
      slot: 'Reasoning.Trigger',
      className: 'hj-reasoning-trigger',
      description: 'Sparkle, label, chevron. The label shimmers while thinking.',
      props: props<TriggerOwnProps>({
        thinkingLabel: {
          type: 'ReactNode',
          default: "'Thinking'",
          description: 'Label while thinking.',
        },
        doneLabel: {
          type: 'ReactNode',
          default: "'Thought for {duration}'",
          description: 'Label when done.',
        },
      }),
      dataAttributes: { 'data-panel-open': 'Expanded (Base UI).' },
    },
    {
      name: 'Panel',
      element: 'div',
      base: 'Collapsible.Panel',
      slot: 'Reasoning.Panel',
      className: 'hj-reasoning-panel',
      description:
        'Muted 13.5px text behind a hairline; scrolls past its max height. Height reveal is the declared layout transition.',
      cssVars: { '--hj-reasoning-max-height': 'Body height before it scrolls. Default 280px.' },
    },
  ],
  examples: [
    {
      file: 'thinking',
      title: 'Thinking, then done',
      description: 'Streams its thoughts, then folds when the answer begins.',
    },
    {
      file: 'done',
      title: 'Folded',
      description: 'A finished reasoning step the person can open.',
    },
  ],
  accessibility: [
    'The trigger is a button with aria-expanded (Base UI Collapsible).',
    'The panel is aria-busy while thinking so its text is read once complete.',
    'The shimmer is decorative — the label’s words carry the state.',
  ],
  motion:
    'While thinking a light passes along the label (ambient; it stops under reduced motion). Folding is a height reveal on gentle, clamped; the chevron turns on snappy.',
  tokens: ['fg-dim', 'fg-mute', 'accent', 'line', 'ambient', 'ease-gentle-settle'],
  related: ['tool-call', 'message', 'streaming-text'],
  baseUi: 'collapsible',
});

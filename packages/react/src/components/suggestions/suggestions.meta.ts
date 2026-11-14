import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { ItemOwnProps, RootOwnProps } from './suggestions.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Suggestions',
  slug: 'suggestions',
  category: 'ai',
  status: 'new',
  description: 'A row of ready-made prompts the person can send with one tap.',
  whenToUse: [
    'An empty conversation, to show what the assistant can do.',
    'Follow-ups after a reply.',
  ],
  whenNotToUse: [
    'Filters — use Chip.',
    'More than ~6 at once — fewer, sharper suggestions read faster.',
  ],
  import: "import { Suggestions } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      slot: 'Suggestions.Root',
      className: 'hj-suggestions',
      description: 'role="group" row that wraps.',
      props: props<RootOwnProps>({
        onSelect: { type: '(prompt: string) => void', description: 'The chosen prompt.' },
        label: { type: 'string', default: "'Suggestions'", description: 'Accessible group name.' },
      }),
    },
    {
      name: 'Item',
      element: 'button',
      base: 'Button',
      slot: 'Suggestions.Item',
      className: 'hj-suggestions-item',
      description: '36px chip; tints accent on hover. Cascades in on mount.',
      props: props<ItemOwnProps>({
        prompt: { type: 'string', description: 'What is sent. Default: the chip text.' },
        icon: { type: 'ReactNode', description: 'Leading glyph.' },
      }),
      cssVars: { '--hj-suggestions-height': 'Chip height. Default 36px.' },
    },
  ],
  examples: [
    {
      file: 'empty',
      title: 'Starting a conversation',
      description: 'Four prompts that show what the assistant can do.',
    },
    {
      file: 'follow-ups',
      title: 'Follow-ups',
      description: 'Short next steps after a reply; the chip text differs from the prompt sent.',
    },
  ],
  accessibility: [
    'A labelled group of buttons; each sends on Enter or Space.',
    'Keep chip text the action itself (“Make it 30 minutes”), not a label for it.',
  ],
  motion:
    'Chips rise 12pt and fade in on gentle, 24 ms apart, capped at ten — a fade only under reduced motion. Hover tints; press dips .97.',
  tokens: ['surface', 'line', 'accent', 'accent-soft', 'stagger', 'rise', 'travel'],
  related: ['prompt-input', 'chip', 'conversation'],
});

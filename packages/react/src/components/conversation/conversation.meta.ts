import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { JumpToLatestOwnProps, RootOwnProps } from './conversation.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Conversation',
  slug: 'conversation',
  category: 'ai',
  status: 'new',
  description:
    'A scrolling log of turns that keeps the newest reply in view while it streams — until the person scrolls up to read.',
  whenToUse: ['The scroll area of a chat or assistant panel, above a PromptInput.'],
  whenNotToUse: [
    'A single answer with no history — render a Message on its own.',
    'Feeds and timelines — use a list.',
  ],
  import: "import { Conversation } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      slot: 'Conversation.Root',
      className: 'hj-conversation',
      description: 'Owns stick-to-bottom. Give it a height (or a flex parent) — it fills it.',
      props: props<RootOwnProps>({
        streaming: {
          type: 'boolean',
          default: 'false',
          description:
            'A reply is arriving: the log is aria-busy and growth keeps the end in view (unless the person scrolled up).',
        },
        threshold: {
          type: 'number',
          default: '48',
          description: 'Pixels from the end that still count as “at the bottom”.',
        },
      }),
      dataAttributes: {
        'data-at-bottom': 'The newest message is in view.',
        'data-streaming': 'A reply is arriving.',
      },
    },
    {
      name: 'Viewport',
      element: 'div',
      slot: 'Conversation.Viewport',
      className: 'hj-conversation-viewport',
      description:
        'The scroll container; focusable and labelled so keyboard users can scroll the history.',
    },
    {
      name: 'Content',
      element: 'div',
      slot: 'Conversation.Content',
      className: 'hj-conversation-content',
      description:
        'role="log", aria-live="polite", aria-busy while streaming: each finished reply is announced once.',
      cssVars: {
        '--hj-conversation-gap': 'Space between turns. Default space-6.',
        '--hj-conversation-padding': 'Inner padding. Default space-6 space-4.',
      },
    },
    {
      name: 'JumpToLatest',
      element: 'button',
      base: 'Button',
      slot: 'Conversation.JumpToLatest',
      className: 'hj-conversation-jump',
      description:
        'Floating pill that rises into view when the person is away from the end; scrolls back and re-sticks.',
      props: props<JumpToLatestOwnProps>({
        label: { type: 'string', default: "'Jump to latest'", description: 'Button text.' },
      }),
      dataAttributes: { 'data-hidden': 'At the bottom — hidden and out of the tab order.' },
    },
  ],
  examples: [
    {
      file: 'chat',
      title: 'An assistant conversation',
      description: 'Reasoning, a tool call, a streamed reply with sources, and the composer.',
    },
    {
      file: 'history',
      title: 'Reading history while it streams',
      description: 'Scroll up mid-reply: the view stays put and Jump to latest appears.',
    },
  ],
  accessibility: [
    'Content is role="log" with polite announcements; aria-busy while streaming defers them to the finished text.',
    'The viewport is focusable and labelled “Conversation”, so arrow keys and Page Up/Down scroll it.',
    'Jump to latest is removed from the tab order and hidden from assistive tech while at the bottom.',
  ],
  motion:
    'While sticking, growth snaps to the end (no smooth scrolling per token). Jump to latest rises 12pt and fades in on gentle; it sinks out in 180 ms. Its scroll is smooth, or instant under reduced motion.',
  tokens: ['surface-2', 'line', 'shadow-lift', 'space-6', 'rise', 'travel', 'ease-gentle-settle'],
  related: ['message', 'prompt-input', 'streaming-text'],
});

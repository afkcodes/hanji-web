import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { ErrorOwnProps, RootOwnProps } from './message.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'Message',
  slug: 'message',
  category: 'ai',
  status: 'new',
  description:
    'One turn in a conversation: the person’s bubble, the assistant’s reply, or a system note.',
  whenToUse: [
    'Each turn inside a Conversation.',
    'A single assistant answer embedded in a page (help panel, summary card).',
  ],
  whenNotToUse: [
    'Notifications — use Toast.',
    'Comments between people with threads and reactions — compose ListRow and Avatar instead.',
  ],
  import: "import { Message } from '@hanji/react';",
  parts: [
    {
      name: 'Root',
      element: 'div',
      slot: 'Message.Root',
      className: 'hj-message',
      description: 'The turn. Rises 12pt and fades in once when it mounts.',
      props: props<RootOwnProps>({
        from: {
          type: "'user' | 'assistant' | 'system'",
          default: "'assistant'",
          description:
            'user = right-aligned bubble on surface; assistant = flush text on the paper; system = centred muted note.',
        },
        status: {
          type: "'complete' | 'streaming' | 'error'",
          default: "'complete'",
          description:
            'streaming sets aria-busy; error dims the content — pair with Message.Error.',
        },
      }),
      dataAttributes: {
        'data-from': 'user | assistant | system',
        'data-status': 'complete | streaming | error',
        'data-streaming': 'Still arriving.',
      },
      cssVars: {
        '--hj-message-bubble-bg': 'User bubble fill. Default surface.',
        '--hj-message-bubble-max': 'User bubble max width. Default min(80%, 560px).',
      },
    },
    {
      name: 'Avatar',
      element: 'div',
      slot: 'Message.Avatar',
      className: 'hj-message-avatar',
      description:
        '28px circle slot (initials, image or the assistant mark). Hidden for user and system turns.',
    },
    {
      name: 'Author',
      element: 'div',
      slot: 'Message.Author',
      className: 'hj-message-author',
      description: 'Name and a <time> on one line.',
    },
    {
      name: 'Content',
      element: 'div',
      slot: 'Message.Content',
      className: 'hj-message-content',
      description: 'The text — put StreamingText or your markdown renderer here.',
    },
    {
      name: 'Footer',
      element: 'div',
      slot: 'Message.Footer',
      className: 'hj-message-footer',
      description: 'MessageActions, sources, attachments, a timestamp.',
    },
    {
      name: 'Error',
      element: 'div',
      slot: 'Message.Error',
      className: 'hj-message-error',
      description:
        'A failed or refused reply: alert glyph + what happened + what to do, on a danger tint.',
      props: props<ErrorOwnProps>({
        action: { type: 'ReactNode', description: 'A retry control placed at the end.' },
      }),
    },
  ],
  examples: [
    {
      file: 'exchange',
      title: 'An exchange',
      description: 'A question, an answer with sources and actions, and a system note.',
    },
    {
      file: 'failed',
      title: 'Failed and refused',
      description: 'A network failure with Retry, and a refusal that says why.',
    },
  ],
  accessibility: [
    'Render turns inside Conversation (role="log") so each finished message is announced once.',
    'status="streaming" sets aria-busy so screen readers wait for the full text.',
    'Message.Error is role="alert"; write what happened and what the person can do.',
    'The avatar is decorative — name the author in Message.Author or visually hidden text.',
  ],
  motion:
    'Each turn rises 12pt and fades in on gentle, clamped, once. Under reduced motion it only fades.',
  tokens: [
    'surface',
    'line',
    'fg',
    'fg-mute',
    'danger',
    'danger-soft',
    'radius-lg',
    'rise',
    'travel',
  ],
  related: [
    'conversation',
    'streaming-text',
    'message-actions',
    'citation',
    'tool-call',
    'reasoning',
  ],
});

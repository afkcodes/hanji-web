import { defineMeta, props } from '../../system/meta.ts';
import type { ComponentMeta } from '../../system/meta.ts';
import type { StreamingTextOwnProps } from './streaming-text.tsx';

export const meta: ComponentMeta = defineMeta({
  name: 'StreamingText',
  slug: 'streaming-text',
  category: 'ai',
  status: 'new',
  description: 'Renders a model’s streamed text with zero React work per token.',
  whenToUse: [
    'The body of an assistant message while it streams.',
    'Any long text that arrives in chunks (transcripts, logs).',
  ],
  whenNotToUse: [
    'Rich markdown that must be parsed as it streams — render your markdown component with the growing string instead.',
    'Static text — use a plain element.',
  ],
  import: "import { StreamingText } from '@hanji/react';",
  parts: [
    {
      name: 'StreamingText',
      element: 'span',
      slot: 'StreamingText',
      className: 'hj-streaming-text',
      description:
        'Chunks are buffered and appended to one text node once per animation frame. Pass an AsyncIterable (`stream`) or a growing string (`text`).',
      props: props<StreamingTextOwnProps>({
        stream: {
          type: 'AsyncIterable<string>',
          description:
            'Token stream; each chunk is appended. Re-renders only when it starts and ends.',
        },
        text: {
          type: 'string',
          description: 'Controlled text. A growing suffix is appended; anything else replaces.',
        },
        streaming: {
          type: 'boolean',
          default: 'false',
          description:
            'Controlled mode: whether more text is coming (shows the caret, sets aria-busy).',
        },
        caret: { type: 'boolean', default: 'true', description: 'Blinking caret while streaming.' },
        onDone: {
          type: '(text: string) => void',
          description: 'Once, with the full text, when the stream ends.',
        },
        onError: {
          type: '(error: unknown) => void',
          description: 'If the stream throws. Text received so far stays visible.',
        },
      }),
      dataAttributes: { 'data-streaming': 'Present while text is still arriving.' },
      cssVars: { '--hj-streaming-text-caret': 'Caret colour. Default accent.' },
    },
  ],
  examples: [
    {
      file: 'stream',
      title: 'Streaming a reply',
      description: 'An async iterable of tokens, appended per frame.',
    },
    {
      file: 'controlled',
      title: 'Controlled text',
      description: 'Your store holds the growing string; only the delta is written.',
    },
  ],
  accessibility: [
    'Sets aria-busy while streaming so assistive tech waits for the finished text instead of reading every token.',
    'Put it inside a Conversation (role="log") so the completed message is announced once.',
    'The caret is aria-hidden.',
  ],
  motion:
    'Text appears as it arrives — no per-token animation. The caret blinks in 1 s steps as ambient decoration and stops under reduced motion.',
  tokens: ['accent', 'ambient'],
  related: ['message', 'conversation', 'reasoning'],
});

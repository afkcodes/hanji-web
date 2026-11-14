import { Button, Conversation, Message, StreamingText } from '@hanji/react';
import * as React from 'react';

const HISTORY = [
  ['user', 'What did I listen to most this year?'],
  ['assistant', 'Noor Haddad — 41 hours across 312 plays. “Night Bus Home” alone is 47 plays.'],
  ['user', 'And the least, of things I liked?'],
  [
    'assistant',
    'Of your 1,284 liked songs, 96 have never been played. Most are from “Field Recordings, Jeju”.',
  ],
  ['user', 'Why so many unplayed from that album?'],
  ['assistant', 'You liked the whole album in one go on 3 March and played the first two tracks.'],
] as const;

const LONG = Array.from(
  { length: 6 },
  (_, i) =>
    `Part ${i + 1}: here is a longer answer that keeps streaming so you can scroll up while it arrives. ` +
    'The view stays where you left it, and a button offers to take you back to the newest text. ',
).join('');

/** A fake model stream: one word every ~40 ms, as an AsyncIterable. */
function tokens(text: string): AsyncIterable<string> {
  const words = text.split(/(?<= )/);
  return {
    [Symbol.asyncIterator]: () => {
      let i = 0;
      return {
        next: () =>
          new Promise<IteratorResult<string>>((resolve) => {
            if (i >= words.length) resolve({ done: true, value: undefined });
            else
              setTimeout(
                () => resolve({ done: false, value: words[i++] ?? '' }),
                40 + Math.random() * 40,
              );
          }),
      };
    },
  };
}

export function Example(): React.JSX.Element {
  const [stream, setStream] = React.useState<AsyncIterable<string> | null>(null);
  const [streaming, setStreaming] = React.useState(false);
  return (
    <div style={{ width: '100%', maxWidth: 560, display: 'grid', gap: 12 }}>
      <Conversation.Root
        streaming={streaming}
        style={{
          height: 360,
          borderRadius: 16,
          boxShadow: 'inset 0 0 0 1px var(--hj-line)',
          background: 'var(--hj-bg)',
        }}
      >
        <Conversation.Viewport>
          <Conversation.Content>
            {HISTORY.map(([from, text]) => (
              <Message.Root key={text} from={from}>
                <Message.Content>{text}</Message.Content>
              </Message.Root>
            ))}
            {stream ? (
              <Message.Root from="assistant" status={streaming ? 'streaming' : 'complete'}>
                <Message.Content>
                  <StreamingText stream={stream} onDone={() => setStreaming(false)} />
                </Message.Content>
              </Message.Root>
            ) : null}
          </Conversation.Content>
        </Conversation.Viewport>
        <Conversation.JumpToLatest />
      </Conversation.Root>
      <div>
        <Button
          size="sm"
          variant="secondary"
          disabled={streaming}
          onClick={() => {
            setStreaming(true);
            setStream(tokens(LONG));
          }}
        >
          Stream a long reply
        </Button>
      </div>
    </div>
  );
}

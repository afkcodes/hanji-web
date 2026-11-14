import {
  Citation,
  Conversation,
  Message,
  MessageActions,
  PromptInput,
  Reasoning,
  StreamingText,
  Suggestions,
  ToolCall,
} from '@hanji/react';
import type { PromptStatus } from '@hanji/react';
import * as React from 'react';

const REPLY =
  'Done — “Tempo run · 41 min” has 37 of your liked songs between 165 and 175 BPM. I left out two live versions with long intros, and the lyrics lookup timed out, so there are no lyric previews this time.';

/** A fake model stream: one word every ~30 ms, as an AsyncIterable. */
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
                30 + Math.random() * 30,
              );
          }),
      };
    },
  };
}

/** The assistant's first, finished reply: reasoning, two tool calls, a cited answer. */
function PlaylistReply(): React.JSX.Element {
  return (
    <Message.Root from="assistant">
      <Message.Avatar>한</Message.Avatar>
      <Reasoning.Root duration={4}>
        <Reasoning.Trigger />
        <Reasoning.Panel>
          Runs at ~170 steps a minute, so 165–175 BPM. Liked songs in range: 39, about 46 minutes.
          Drop the two live takes to land near 40.
        </Reasoning.Panel>
      </Reasoning.Root>
      <div style={{ display: 'grid', gap: 8 }}>
        <ToolCall.Root status="done">
          <ToolCall.Trigger>
            <ToolCall.Name>library.search</ToolCall.Name>
            <ToolCall.Status duration="0.4 s" />
          </ToolCall.Trigger>
          <ToolCall.Panel>
            <ToolCall.Section label="Arguments">
              <ToolCall.Code value={{ liked: true, bpm: [165, 175] }} />
            </ToolCall.Section>
          </ToolCall.Panel>
        </ToolCall.Root>
        <ToolCall.Root status="failed">
          <ToolCall.Trigger>
            <ToolCall.Name>lyrics.preview</ToolCall.Name>
            <ToolCall.Status duration="5.0 s" />
          </ToolCall.Trigger>
          <ToolCall.Panel>
            <ToolCall.Section label="Error">
              <ToolCall.Code>Timed out after 5 s. Continuing without lyric previews.</ToolCall.Code>
            </ToolCall.Section>
          </ToolCall.Panel>
        </ToolCall.Root>
      </div>
      <Message.Content>
        <p>
          Here’s “Tempo run · 41 min”: 37 songs, mostly Kōya Lanes and Noor Haddad. Average 170 BPM
          <Citation.Root>
            <Citation.Trigger index={1} href="https://example.org/cadence" />
            <Citation.Content>
              <Citation.Domain>example.org</Citation.Domain>
              <Citation.Title>Matching music tempo to running cadence</Citation.Title>
              <Citation.Snippet>
                Runners tend to settle into music within ±5 BPM of their stride rate.
              </Citation.Snippet>
            </Citation.Content>
          </Citation.Root>
          .
        </p>
      </Message.Content>
      <Message.Footer>
        <MessageActions.Root text="Here’s “Tempo run · 41 min”: 37 songs…">
          <MessageActions.Copy />
          <MessageActions.Regenerate />
          <MessageActions.Feedback />
        </MessageActions.Root>
      </Message.Footer>
    </Message.Root>
  );
}

interface Turn {
  id: number;
  /** `reply` is the finished first answer; `assistant` turns stream. */
  from: 'user' | 'assistant' | 'reply';
  text: string;
  stream?: AsyncIterable<string>;
}

export function Example(): React.JSX.Element {
  const [turns, setTurns] = React.useState<Turn[]>([
    {
      id: 1,
      from: 'user',
      text: 'Make a 40-minute running playlist from my liked songs, 165–175 BPM.',
    },
    { id: 2, from: 'reply', text: '' },
  ]);
  const [streamingId, setStreamingId] = React.useState<number | null>(null);
  const [status, setStatus] = React.useState<PromptStatus>('idle');
  const [thinking, setThinking] = React.useState(false);
  const nextId = React.useRef(10);

  const ask = (prompt: string): void => {
    const id = nextId.current++;
    setTurns((t) => [...t, { id, from: 'user', text: prompt }]);
    setStatus('streaming');
    setThinking(true);
    window.setTimeout(() => {
      setThinking(false);
      setStreamingId(id + 1000);
      setTurns((t) => [
        ...t,
        { id: id + 1000, from: 'assistant', text: '', stream: tokens(REPLY) },
      ]);
    }, 1200);
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 680,
        height: 620,
        display: 'grid',
        gridTemplateRows: '1fr auto',
        borderRadius: 20,
        background: 'var(--hj-bg)',
        boxShadow: 'inset 0 0 0 1px var(--hj-line)',
        overflow: 'hidden',
      }}
    >
      <Conversation.Root streaming={status === 'streaming'}>
        <Conversation.Viewport>
          <Conversation.Content>
            {turns.map((t) =>
              t.from === 'reply' ? (
                <PlaylistReply key={t.id} />
              ) : t.from === 'user' ? (
                <Message.Root key={t.id} from="user">
                  <Message.Content>{t.text}</Message.Content>
                </Message.Root>
              ) : (
                <Message.Root
                  key={t.id}
                  from="assistant"
                  status={t.id === streamingId ? 'streaming' : 'complete'}
                >
                  <Message.Avatar>한</Message.Avatar>
                  <Message.Content>
                    <StreamingText
                      stream={t.stream}
                      onDone={() => {
                        setStreamingId(null);
                        setStatus('idle');
                      }}
                    />
                  </Message.Content>
                  <Message.Footer>
                    <MessageActions.Root text={REPLY}>
                      <MessageActions.Copy />
                      <MessageActions.Regenerate />
                      <MessageActions.Feedback />
                    </MessageActions.Root>
                  </Message.Footer>
                </Message.Root>
              ),
            )}
            {thinking ? (
              <Message.Root from="assistant" status="streaming">
                <Message.Avatar>한</Message.Avatar>
                <Reasoning.Root thinking>
                  <Reasoning.Trigger />
                  <Reasoning.Panel>Reading the playlist and your request…</Reasoning.Panel>
                </Reasoning.Root>
              </Message.Root>
            ) : null}
          </Conversation.Content>
        </Conversation.Viewport>
        <Conversation.JumpToLatest />
      </Conversation.Root>
      <div style={{ padding: 12, display: 'grid', gap: 10 }}>
        {status === 'idle' ? (
          <Suggestions.Root onSelect={ask} label="Follow-ups">
            <Suggestions.Item prompt="Shorten it to 30 minutes">
              Make it 30 minutes
            </Suggestions.Item>
            <Suggestions.Item prompt="Remove songs I skip often">
              Drop skipped songs
            </Suggestions.Item>
          </Suggestions.Root>
        ) : null}
        <PromptInput.Root status={status} onSubmit={ask} onStop={() => setStatus('idle')}>
          <PromptInput.Textarea placeholder="Reply to hanji…" />
          <PromptInput.Toolbar>
            <PromptInput.Attach />
            <PromptInput.Submit />
          </PromptInput.Toolbar>
        </PromptInput.Root>
      </div>
    </div>
  );
}

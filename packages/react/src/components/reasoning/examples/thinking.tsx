import { Button, Reasoning, StreamingText } from '@hanji/react';
import * as React from 'react';

const THOUGHTS =
  'The person runs at about 170 steps a minute, so songs between 165 and 175 BPM will feel natural. ' +
  'They asked for 40 minutes; their liked songs in that range add up to 41. ' +
  'Two of them are live versions with long intros — skip those and keep the studio takes.';

/** A fake model stream: one word every ~35 ms, as an AsyncIterable. */
function think(): AsyncIterable<string> {
  const words = THOUGHTS.split(/(?<= )/);
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
                35 + Math.random() * 35,
              );
          }),
      };
    },
  };
}

export function Example(): React.JSX.Element {
  const [stream, setStream] = React.useState(think);
  const [thinking, setThinking] = React.useState(true);
  const [duration, setDuration] = React.useState<number>();
  const started = React.useRef(0);
  React.useEffect(() => {
    started.current = performance.now();
  }, []);
  return (
    <div style={{ width: '100%', maxWidth: 560, display: 'grid', gap: 12 }}>
      <Reasoning.Root thinking={thinking} duration={duration}>
        <Reasoning.Trigger />
        <Reasoning.Panel>
          <StreamingText
            stream={stream}
            caret={false}
            onDone={() => {
              setDuration((performance.now() - started.current) / 1000);
              setThinking(false);
            }}
          />
        </Reasoning.Panel>
      </Reasoning.Root>
      <div>
        <Button
          size="sm"
          variant="secondary"
          disabled={thinking}
          onClick={() => {
            setThinking(true);
            setDuration(undefined);
            started.current = performance.now();
            setStream(think());
          }}
        >
          Think again
        </Button>
      </div>
    </div>
  );
}

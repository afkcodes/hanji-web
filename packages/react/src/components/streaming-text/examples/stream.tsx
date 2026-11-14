import { Button, StreamingText } from '@hanji/react';
import * as React from 'react';

const REPLY =
  'Lossless keeps every bit of the original recording, so it uses about 1.4 GB an hour. ' +
  'High (320 kbps) sounds the same to most ears on phone speakers and uses about 140 MB. ' +
  'If you mostly listen on the train, High is the better trade.';

/** A fake model stream: one word every ~34 ms, as an AsyncIterable. */
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
                34 + Math.random() * 34,
              );
          }),
      };
    },
  };
}

export function Example(): React.JSX.Element {
  const [stream, setStream] = React.useState(() => tokens(REPLY));
  const [done, setDone] = React.useState(false);
  return (
    <div style={{ maxWidth: 520, display: 'grid', gap: 16, fontSize: 15, lineHeight: 1.6 }}>
      <StreamingText stream={stream} onDone={() => setDone(true)} />
      <div>
        <Button
          size="sm"
          variant="secondary"
          disabled={!done}
          onClick={() => {
            setDone(false);
            setStream(tokens(REPLY));
          }}
        >
          Stream again
        </Button>
      </div>
    </div>
  );
}

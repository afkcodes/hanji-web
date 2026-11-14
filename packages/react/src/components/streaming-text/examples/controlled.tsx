import { Button, StreamingText } from '@hanji/react';
import * as React from 'react';

const FULL =
  'Your library has 1,284 songs. 312 are downloaded (4.2 GB). The 41 songs in “Field Recordings, Jeju” are still downloading.';

export function Example(): React.JSX.Element {
  const [text, setText] = React.useState('');
  const [streaming, setStreaming] = React.useState(false);
  const run = (): void => {
    setText('');
    setStreaming(true);
    let i = 0;
    const id = window.setInterval(() => {
      i += 3;
      setText(FULL.slice(0, i));
      if (i >= FULL.length) {
        window.clearInterval(id);
        setStreaming(false);
      }
    }, 30);
  };
  return (
    <div style={{ maxWidth: 520, display: 'grid', gap: 16, fontSize: 15, lineHeight: 1.6 }}>
      <p style={{ margin: 0, minHeight: 48 }}>
        <StreamingText text={text} streaming={streaming} />
      </p>
      <div>
        <Button size="sm" variant="secondary" onClick={run} disabled={streaming}>
          {text ? 'Replay' : 'Summarise my library'}
        </Button>
      </div>
    </div>
  );
}

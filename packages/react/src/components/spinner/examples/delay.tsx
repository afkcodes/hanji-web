import { Button, Spinner, Text } from '@hanji/react';
import * as React from 'react';

export function Example(): React.JSX.Element {
  const [state, setState] = React.useState<'idle' | 'loading' | 'done'>('idle');
  const [run, setRun] = React.useState(0);
  const load = (ms: number): void => {
    setState('loading');
    setRun((r) => r + 1);
    window.setTimeout(() => setState('done'), ms);
  };
  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button size="sm" variant="secondary" onClick={() => load(200)}>
          Fast load · 200 ms
        </Button>
        <Button size="sm" variant="secondary" onClick={() => load(2400)}>
          Slow load · 2.4 s
        </Button>
      </div>
      <div
        aria-busy={state === 'loading'}
        style={{ display: 'flex', gap: 10, alignItems: 'center', minHeight: 24 }}
      >
        {state === 'loading' ? <Spinner key={run} delay /> : null}
        <Text variant="sub" tone="dim">
          {state === 'idle'
            ? 'Try both. Only one of them earns a ring.'
            : state === 'loading'
              ? 'Loading your library…'
              : 'Library up to date'}
        </Text>
      </div>
    </div>
  );
}

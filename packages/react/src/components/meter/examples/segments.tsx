import { Field, Meter } from '@hanji/react';
import * as React from 'react';

function strength(pw: string): { score: number; words: string } {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 14) s++;
  if (/[0-9]/.test(pw) && /[a-zA-Z]/.test(pw)) s++;
  if (/[^a-zA-Z0-9]/.test(pw)) s++;
  const words = ['Too short', 'Weak — add a number', 'Fair — longer is stronger', 'Good', 'Strong'];
  return { score: s, words: words[s] ?? 'Strong' };
}

export function Example(): React.JSX.Element {
  const [pw, setPw] = React.useState('night-bus');
  const { score, words } = strength(pw);
  return (
    <div style={{ display: 'grid', gap: 28, width: 'min(100%, 360px)' }}>
      <Field.Root>
        <Field.Label>New password</Field.Label>
        <Field.Control type="text" value={pw} onChange={(e) => setPw(e.currentTarget.value)} />
        <Meter.Root value={score} max={4} segments={4} low={1} high={2} optimum={4}>
          <Meter.Header>
            <Meter.Label className="hj-sr-only">Password strength</Meter.Label>
            <Meter.Value>{() => `${words} · ${pw.length} characters`}</Meter.Value>
          </Meter.Header>
          <Meter.Track>
            <Meter.Indicator />
          </Meter.Track>
        </Meter.Root>
      </Field.Root>

      <Meter.Root value={3} max={5} segments={5} tone="fg" style={{ width: 120 }}>
        <Meter.Header>
          <Meter.Label>Signal</Meter.Label>
          <Meter.Value>{() => '3 of 5'}</Meter.Value>
        </Meter.Header>
        <Meter.Track>
          <Meter.Indicator />
        </Meter.Track>
      </Meter.Root>
    </div>
  );
}

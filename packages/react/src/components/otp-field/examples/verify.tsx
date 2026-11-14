import { Button, Field, OTPField } from '@hanji/react';
import * as React from 'react';

const CORRECT = '482915';

export function Example(): React.JSX.Element {
  const [value, setValue] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'error' | 'success'>('idle');
  return (
    <Field.Root style={{ gap: 10 }}>
      <Field.Label>Verification code</Field.Label>
      <OTPField.Root
        length={6}
        value={value}
        status={status}
        onValueChange={(v) => {
          setValue(v);
          setStatus('idle');
        }}
        onValueComplete={(v) => setStatus(v === CORRECT ? 'success' : 'error')}
      />
      {status === 'error' ? (
        <p style={{ margin: 0, fontSize: 12.5, color: 'var(--hj-danger)' }}>
          That code doesn’t match. Check the latest message from us — codes expire after 10 minutes.
        </p>
      ) : status === 'success' ? (
        <p style={{ margin: 0, fontSize: 12.5, color: 'var(--hj-success)' }}>
          Verified. Signing you in…
        </p>
      ) : (
        <Field.Description>
          We sent a 6-digit code to •••• 4417. Paste it or type it.
        </Field.Description>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
        <Button size="sm" variant="secondary" onClick={() => setValue(CORRECT)}>
          Paste 482915
        </Button>
        <Button size="sm" variant="quiet" onClick={() => setValue('')}>
          Clear
        </Button>
      </div>
    </Field.Root>
  );
}

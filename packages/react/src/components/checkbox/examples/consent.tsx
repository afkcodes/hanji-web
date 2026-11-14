import { Button, Checkbox, Field } from '@hanji/react';
import * as React from 'react';

const row: React.CSSProperties = { display: 'flex', alignItems: 'flex-start', gap: 12 };

export function Example(): React.JSX.Element {
  const [accepted, setAccepted] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const missing = submitted && !accepted;
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      style={{ display: 'grid', gap: 18, maxWidth: 420 }}
    >
      <Field.Root invalid={missing}>
        <div style={row}>
          <Checkbox.Root
            id="cb-terms"
            name="terms"
            checked={accepted}
            onCheckedChange={setAccepted}
          />
          <label htmlFor="cb-terms" style={{ cursor: 'pointer' }}>
            <span className="hj-text-body">I accept the terms of the Family plan</span>
            <br />
            <span className="hj-text-sub hj-tone-mute">Up to six members · £16.99 a month</span>
          </label>
        </div>
        {missing ? <Field.Error match>Accept the terms to continue.</Field.Error> : null}
      </Field.Root>
      <div style={row}>
        <Checkbox.Root id="cb-receipts" defaultChecked name="receipts" />
        <label htmlFor="cb-receipts" className="hj-text-body" style={{ cursor: 'pointer' }}>
          Email me receipts
        </label>
      </div>
      <div style={row}>
        <Checkbox.Root id="cb-share" disabled />
        <label htmlFor="cb-share" className="hj-text-body hj-tone-mute">
          Share listening with friends — off by your admin
        </label>
      </div>
      <div style={row}>
        <Checkbox.Root id="cb-keep" defaultChecked readOnly />
        <label htmlFor="cb-keep" className="hj-text-body">
          Keep downloads on this device (your plan requires it)
        </label>
      </div>
      <div>
        <Button type="submit">{submitted && accepted ? 'Plan confirmed' : 'Continue'}</Button>
      </div>
    </form>
  );
}

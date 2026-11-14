import { Button, Field, Radio, RadioGroup } from '@hanji/react';
import * as React from 'react';

export function Example(): React.JSX.Element {
  const [value, setValue] = React.useState<string | null>(null);
  const [tried, setTried] = React.useState(false);
  const missing = tried && value === null;
  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
      <Field.Root invalid={missing}>
        <span id="when" className="hj-text-label">
          Send the receipt
        </span>
        <RadioGroup.Root
          aria-labelledby="when"
          orientation="horizontal"
          value={value}
          onValueChange={(v) => setValue(v as string)}
        >
          <RadioGroup.Item>
            <Radio.Root value="now" />
            Now
          </RadioGroup.Item>
          <RadioGroup.Item>
            <Radio.Root value="weekly" />
            In a weekly digest
          </RadioGroup.Item>
          <RadioGroup.Item>
            <Radio.Root value="never" />
            Never
          </RadioGroup.Item>
        </RadioGroup.Root>
        {missing ? <Field.Error match>Choose when to send receipts.</Field.Error> : null}
      </Field.Root>
      <Button size="sm" onClick={() => setTried(true)}>
        Save
      </Button>
    </div>
  );
}

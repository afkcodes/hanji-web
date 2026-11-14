import { Button, Steps } from '@hanji/react';
import * as React from 'react';

const steps = [
  { label: 'Account', description: 'mira.okafor@hey.com' },
  { label: 'Plan', description: 'Family · £16.99/mo' },
  { label: 'Payment', description: 'Card or PayPal' },
  { label: 'Confirm', description: 'Review and start' },
];

export function Example(): React.JSX.Element {
  const [step, setStep] = React.useState(1);
  const done = step >= steps.length;
  return (
    <div style={{ display: 'grid', gap: 24, width: '100%', maxWidth: 560 }}>
      <Steps.Root value={step} total={steps.length} aria-label="Subscription">
        <Steps.Count />
        <Steps.Track />
        <Steps.List>
          {steps.map((s) => (
            <Steps.Item key={s.label} description={s.description}>
              {s.label}
            </Steps.Item>
          ))}
        </Steps.List>
      </Steps.Root>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Button
          variant="secondary"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          Back
        </Button>
        <Button onClick={() => setStep((s) => (s >= steps.length ? 0 : s + 1))}>
          {done ? 'Start again' : step === steps.length - 1 ? 'Start subscription' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}

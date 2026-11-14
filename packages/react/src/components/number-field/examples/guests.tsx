import { Field, NumberField } from '@hanji/react';
import * as React from 'react';

export function Example(): React.JSX.Element {
  const [guests, setGuests] = React.useState<number | null>(6);
  return (
    <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
      <Field.Root>
        <Field.Label>Guests</Field.Label>
        <NumberField.Root value={guests} onValueChange={setGuests} min={1} max={12}>
          <NumberField.Group>
            <NumberField.Decrement />
            <NumberField.Input />
            <NumberField.Increment />
          </NumberField.Group>
        </NumberField.Root>
        <Field.Description>
          A listening party fits 12. {guests ? `${12 - guests} seats left.` : 'Enter a number.'}
        </Field.Description>
      </Field.Root>
      <Field.Root disabled>
        <Field.Label>Devices</Field.Label>
        <NumberField.Root defaultValue={3} unit="of 3" disabled />
        <Field.Description>Your plan allows three devices.</Field.Description>
      </Field.Root>
    </div>
  );
}

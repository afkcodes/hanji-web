import { Autocomplete, Field } from '@hanji/react';
import * as React from 'react';

const cities = [
  'Busan',
  'Lisbon',
  'Lagos',
  'Leeds',
  'Lima',
  'London',
  'Los Angeles',
  'Seoul',
  'São Paulo',
  'Sapporo',
];

export function Example(): React.JSX.Element {
  const [city, setCity] = React.useState('Lo');
  return (
    <div style={{ display: 'grid', gap: 24, width: 360 }}>
      <Field.Root>
        <Autocomplete.Root items={cities} value={city} onValueChange={setCity} mode="both">
          <Field.Label>Concert city</Field.Label>
          <Autocomplete.Input placeholder="Start typing a city" />
          <Autocomplete.Content
            empty={
              <>
                No city called <b>“{city}”</b> yet — we add new ones every month.
              </>
            }
          >
            {(c: string) => (
              <Autocomplete.Item key={c} value={c}>
                <Autocomplete.Highlight text={c} query={city} />
              </Autocomplete.Item>
            )}
          </Autocomplete.Content>
        </Autocomplete.Root>
        <Field.Description>
          The rest of the name completes inline; Tab accepts it.
        </Field.Description>
      </Field.Root>
      <Field.Root disabled>
        <Autocomplete.Root items={cities} defaultValue="Seoul">
          <Field.Label>Home city</Field.Label>
          <Autocomplete.Input size="sm" />
        </Autocomplete.Root>
        <Field.Description>Change this from your account page.</Field.Description>
      </Field.Root>
    </div>
  );
}

import { Combobox, Field } from '@hanji/react';

interface Artist {
  value: string;
  label: string;
  meta: string;
}

const artists: Artist[] = [
  { value: 'koya-lanes', label: 'Kōya Lanes', meta: 'Artist · 412K monthly listeners' },
  { value: 'low-tide-choir', label: 'Low Tide Choir', meta: 'Artist · 88K monthly listeners' },
  { value: 'ilse-brandt', label: 'Ilse Brandt', meta: 'Artist · 1.2M monthly listeners' },
  { value: 'saltmarsh', label: 'Saltmarsh', meta: 'Band · 64K monthly listeners' },
  { value: 'paper-cranes', label: 'Paper Cranes', meta: 'Band · 230K monthly listeners' },
  { value: 'noor-haddad', label: 'Noor Haddad', meta: 'Artist · 51K monthly listeners' },
];

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'grid', gap: 24, width: 380 }}>
      <Field.Root>
        <Combobox.Root items={artists}>
          <Field.Label>Featured artist</Field.Label>
          <Combobox.InputGroup>
            <Combobox.Input placeholder="Search artists" />
            <Combobox.Clear />
            <Combobox.Trigger aria-label="Show artists" />
          </Combobox.InputGroup>
          <Combobox.Content empty="No artists match that name.">
            {(a: Artist) => (
              <Combobox.Option key={a.value} value={a} description={a.meta}>
                {a.label}
              </Combobox.Option>
            )}
          </Combobox.Content>
        </Combobox.Root>
      </Field.Root>
      <Field.Root invalid>
        <Combobox.Root items={artists}>
          <Field.Label>Opening act</Field.Label>
          <Combobox.Input placeholder="Search artists" />
          <Combobox.Content empty="No artists match that name.">
            {(a: Artist) => (
              <Combobox.Option key={a.value} value={a}>
                {a.label}
              </Combobox.Option>
            )}
          </Combobox.Content>
        </Combobox.Root>
        <Field.Error match>Choose an artist from the list — free text can’t be booked.</Field.Error>
      </Field.Root>
    </div>
  );
}

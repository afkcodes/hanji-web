import { Combobox, Field } from '@hanji/react';

interface Genre {
  value: string;
  label: string;
}

const genres: Genre[] = [
  { value: 'ambient', label: 'Ambient' },
  { value: 'bossa-nova', label: 'Bossa nova' },
  { value: 'city-pop', label: 'City pop' },
  { value: 'dream-pop', label: 'Dream pop' },
  { value: 'gugak', label: 'Gugak' },
  { value: 'highlife', label: 'Highlife' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'krautrock', label: 'Krautrock' },
  { value: 'neo-soul', label: 'Neo-soul' },
  { value: 'post-rock', label: 'Post-rock' },
  { value: 'shoegaze', label: 'Shoegaze' },
  { value: 'trip-hop', label: 'Trip-hop' },
];

export function Example(): React.JSX.Element {
  return (
    <Field.Root style={{ width: 400 }}>
      <Combobox.Root
        items={genres}
        multiple
        defaultValue={[genres[2], genres[6]].filter((g) => g !== undefined)}
      >
        <Field.Label>Genres for your weekly mix</Field.Label>
        <Combobox.InputGroup>
          <Combobox.Value>
            {(value: Genre[]) => (
              <Combobox.Chips aria-label={value.length > 0 ? 'Selected genres' : undefined}>
                {value.map((g) => (
                  <Combobox.Chip key={g.value} aria-label={g.label}>
                    {g.label}
                    <Combobox.ChipRemove aria-label={`Remove ${g.label}`} />
                  </Combobox.Chip>
                ))}
                <Combobox.Input placeholder={value.length > 0 ? 'Add another' : 'e.g. Shoegaze'} />
              </Combobox.Chips>
            )}
          </Combobox.Value>
          <Combobox.Trigger aria-label="Show genres" />
        </Combobox.InputGroup>
        <Combobox.Content empty="No genres match. Try a broader word like “pop”.">
          {(g: Genre) => (
            <Combobox.Option key={g.value} value={g}>
              {g.label}
            </Combobox.Option>
          )}
        </Combobox.Content>
      </Combobox.Root>
      <Field.Description>Pick up to five. Backspace removes the last one.</Field.Description>
    </Field.Root>
  );
}

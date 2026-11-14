import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import * as Field from '../field/field.tsx';
import * as Combobox from './combobox.tsx';

interface Genre {
  value: string;
  label: string;
}
const genres: Genre[] = [
  { value: 'ambient', label: 'Ambient' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'shoegaze', label: 'Shoegaze' },
];

function Multi(): React.JSX.Element {
  return (
    <Field.Root>
      <Combobox.Root
        items={genres}
        multiple
        defaultValue={[genres[1]].filter((g) => g !== undefined)}
      >
        <Field.Label>Genres</Field.Label>
        <Combobox.InputGroup>
          <Combobox.Value>
            {(value: Genre[]) => (
              <Combobox.Chips>
                {value.map((g) => (
                  <Combobox.Chip key={g.value}>
                    {g.label}
                    <Combobox.ChipRemove aria-label={`Remove ${g.label}`} />
                  </Combobox.Chip>
                ))}
                <Combobox.Input placeholder="Add a genre" />
              </Combobox.Chips>
            )}
          </Combobox.Value>
        </Combobox.InputGroup>
        <Combobox.Content empty="No genres match.">
          {(g: Genre) => (
            <Combobox.Option key={g.value} value={g}>
              {g.label}
            </Combobox.Option>
          )}
        </Combobox.Content>
      </Combobox.Root>
    </Field.Root>
  );
}

describe('Combobox', () => {
  it('renders chips for the selected values inside the field box', () => {
    render(<Multi />);
    const chip = screen.getByText('Jazz').closest('.hj-combobox-chip');
    expect(chip).not.toBeNull();
    expect(chip?.closest('.hj-combobox-group')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Remove Jazz' }).className).toContain(
      'hj-combobox-chip-remove',
    );
  });

  it('filters as you type and shows the empty message', async () => {
    render(<Multi />);
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'sho');
    expect(await screen.findByRole('option', { name: /Shoegaze/ })).toBeTruthy();
    expect(screen.queryByRole('option', { name: /Ambient/ })).toBeNull();
    await userEvent.clear(input);
    await userEvent.type(input, 'zzz');
    await waitFor(() => expect(screen.getByText('No genres match.')).toBeTruthy());
  });

  it('removes a chip from its ✕', async () => {
    render(<Multi />);
    await userEvent.click(screen.getByRole('button', { name: 'Remove Jazz' }));
    await waitFor(() => expect(screen.queryByText('Jazz')).toBeNull());
  });
});

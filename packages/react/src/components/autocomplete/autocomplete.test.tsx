import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, it } from 'vitest';

import * as Autocomplete from './autocomplete.tsx';

const cities = ['Lisbon', 'London', 'Seoul'];

function Search(): React.JSX.Element {
  const [q, setQ] = React.useState('');
  return (
    <Autocomplete.Root items={cities} value={q} onValueChange={setQ}>
      <Autocomplete.InputGroup>
        <Autocomplete.Icon />
        <Autocomplete.Input aria-label="City" />
        {q ? <Autocomplete.Clear /> : null}
      </Autocomplete.InputGroup>
      <Autocomplete.Content empty={`No results for “${q}”`}>
        {(c: string) => (
          <Autocomplete.Item key={c} value={c}>
            <Autocomplete.Highlight text={c} query={q} />
          </Autocomplete.Item>
        )}
      </Autocomplete.Content>
    </Autocomplete.Root>
  );
}

describe('Autocomplete', () => {
  it('bolds the typed part of each suggestion', async () => {
    render(<Search />);
    await userEvent.type(screen.getByRole('combobox', { name: 'City' }), 'lo');
    // happy-dom has no layout, so Base UI hides the anchored popup; hidden nodes have no
    // computed name, so match on text.
    await waitFor(() => expect(screen.queryAllByRole('option', { hidden: true }).length).toBe(1));
    const option = screen.getAllByRole('option', { hidden: true })[0] as HTMLElement;
    expect(option.textContent).toBe('London');
    const marks = Array.from(option.querySelectorAll('mark')).map((m) => m.textContent);
    expect(marks).toEqual(['Lo']);
  });

  it('names the query when nothing matches, and clears', async () => {
    render(<Search />);
    const input = screen.getByRole('combobox', { name: 'City' });
    await userEvent.type(input, 'xyz');
    await waitFor(() => expect(screen.getByText('No results for “xyz”')).toBeTruthy());
    // Clear is aria-hidden by design (Escape clears from the keyboard).
    const clear = screen
      .getAllByRole('button', { hidden: true })
      .find((b) => b.getAttribute('aria-label') === 'Clear') as HTMLElement;
    await userEvent.click(clear);
    await waitFor(() => expect((input as HTMLInputElement).value).toBe(''));
  });

  it('Highlight escapes regex characters', () => {
    render(<Autocomplete.Highlight text="Seoul (4 a.m.)" query="(4" />);
    expect(document.querySelector('mark')?.textContent).toBe('(4');
  });
});

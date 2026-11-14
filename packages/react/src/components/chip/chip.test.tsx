import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Action, Group, Input, List, Root } from './chip.tsx';

function Picks(): React.JSX.Element {
  const [v, setV] = React.useState(['Jazz', '1960s']);
  return (
    <List>
      {v.map((p) => (
        <Input key={p} onRemove={() => setV((all) => all.filter((x) => x !== p))}>
          {p}
        </Input>
      ))}
    </List>
  );
}

describe('Chip', () => {
  it('filter chips toggle as a multiple group', async () => {
    const onValueChange = vi.fn<(v: string[]) => void>();
    render(
      <Group multiple defaultValue={['a']} onValueChange={onValueChange} aria-label="Filters">
        <Root value="a">Albums</Root>
        <Root value="b">Playlists</Root>
      </Group>,
    );
    const albums = screen.getByRole('button', { name: 'Albums' });
    const playlists = screen.getByRole('button', { name: 'Playlists' });
    expect(albums.className).toBe('hj-chip');
    expect(albums.getAttribute('aria-pressed')).toBe('true');
    expect(albums.hasAttribute('data-pressed')).toBe(true);
    await userEvent.click(playlists);
    expect(onValueChange.mock.calls.at(-1)?.[0]).toEqual(['a', 'b']);
    expect(playlists.getAttribute('aria-pressed')).toBe('true');
  });

  it('input chip fades out, then calls onRemove', async () => {
    vi.useFakeTimers();
    const onRemove = vi.fn<() => void>();
    render(
      <List>
        <Input onRemove={onRemove}>Jazz</Input>
      </List>,
    );
    const x = screen.getByRole('button', { name: 'Remove Jazz' });
    act(() => {
      x.click();
    });
    expect(x.closest('.hj-chip')?.hasAttribute('data-leaving')).toBe(true);
    expect(onRemove).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(onRemove).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('removing hands focus to the neighbour', async () => {
    vi.useFakeTimers();
    render(<Picks />);
    act(() => {
      screen.getByRole('button', { name: 'Remove Jazz' }).click();
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.queryByText('Jazz')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Remove 1960s' }));
    vi.useRealTimers();
  });

  it('action chip is a button with its kind', () => {
    render(<Action>Start radio</Action>);
    expect(screen.getByRole('button', { name: 'Start radio' }).getAttribute('data-kind')).toBe(
      'action',
    );
  });
});

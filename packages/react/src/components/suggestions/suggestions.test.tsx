import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import * as Suggestions from './suggestions.tsx';

describe('Suggestions', () => {
  it('sends the prompt (or the chip text) on select', async () => {
    const onSelect = vi.fn<(p: string) => void>();
    render(
      <Suggestions.Root onSelect={onSelect}>
        <Suggestions.Item>What did I play most?</Suggestions.Item>
        <Suggestions.Item prompt="Shorten the playlist to 30 minutes">
          Make it 30 minutes
        </Suggestions.Item>
      </Suggestions.Root>,
    );
    expect(screen.getByRole('group', { name: 'Suggestions' })).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'What did I play most?' }));
    await userEvent.click(screen.getByRole('button', { name: 'Make it 30 minutes' }));
    expect(onSelect.mock.calls).toEqual([
      ['What did I play most?'],
      ['Shorten the playlist to 30 minutes'],
    ]);
  });
});

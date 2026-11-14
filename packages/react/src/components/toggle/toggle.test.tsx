import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Toggle, ToggleGroupContext } from './toggle.tsx';

describe('Toggle', () => {
  it('is a pressed-state button with hanji hooks', async () => {
    render(<Toggle aria-label="Shuffle">S</Toggle>);
    const btn = screen.getByRole('button', { name: 'Shuffle' });
    expect(btn.className).toBe('hj-toggle');
    expect(btn.getAttribute('data-variant')).toBe('quiet');
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    await userEvent.click(btn);
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    expect(btn.hasAttribute('data-pressed')).toBe(true);
  });

  it('takes the group size and becomes grouped inside a ToggleGroup context', () => {
    render(
      <ToggleGroupContext.Provider value="sm">
        <Toggle variant="outline">B</Toggle>
      </ToggleGroupContext.Provider>,
    );
    const btn = screen.getByRole('button', { name: 'B' });
    expect(btn.getAttribute('data-size')).toBe('sm');
    expect(btn.getAttribute('data-variant')).toBe('grouped');
  });
});

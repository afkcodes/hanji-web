import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Toggle } from '../toggle/toggle.tsx';
import { ToggleGroup } from './toggle-group.tsx';

describe('ToggleGroup', () => {
  it('frames toggles, passes its size, and supports multiple', async () => {
    render(
      <ToggleGroup multiple size="sm" aria-label="Style" defaultValue={['bold']}>
        <Toggle value="bold">Bold</Toggle>
        <Toggle value="italic">Italic</Toggle>
      </ToggleGroup>,
    );
    const group = screen.getByRole('group', { name: 'Style' });
    expect(group.className).toBe('hj-toggle-group');
    const italic = screen.getByRole('button', { name: 'Italic' });
    expect(italic.getAttribute('data-size')).toBe('sm');
    expect(italic.getAttribute('data-variant')).toBe('grouped');
    await userEvent.click(italic);
    expect(screen.getByRole('button', { name: 'Bold' }).getAttribute('aria-pressed')).toBe('true');
    expect(italic.getAttribute('aria-pressed')).toBe('true');
  });
});

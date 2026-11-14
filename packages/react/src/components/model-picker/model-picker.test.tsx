import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import * as ModelPicker from './model-picker.tsx';

const ITEMS = [
  { value: 'swift', label: 'Swift' },
  { value: 'deep', label: 'Deep' },
];

describe('ModelPicker', () => {
  it('shows the current model and selects another', async () => {
    const onValueChange = vi.fn<(v: string | null) => void>();
    render(
      <ModelPicker.Root defaultValue="swift" items={ITEMS} onValueChange={(v) => onValueChange(v)}>
        <ModelPicker.Trigger aria-label="Model" />
        <ModelPicker.Content>
          <ModelPicker.Item value="swift" name="Swift" badges={['fast']} />
          <ModelPicker.Item
            value="deep"
            name="Deep"
            description="Careful plans."
            badges={['reasoning']}
          />
        </ModelPicker.Content>
      </ModelPicker.Root>,
    );
    const trigger = screen.getByRole('combobox', { name: 'Model' });
    expect(trigger.textContent).toContain('Swift');
    await userEvent.click(trigger);
    const deep = await screen.findByRole('option', { name: /Deep/ });
    expect(deep.textContent).toContain('Careful plans.');
    await userEvent.click(deep);
    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith('deep'));
  });
});

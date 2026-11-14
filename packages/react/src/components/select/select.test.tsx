import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import * as Select from './select.tsx';

const items = [
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'lossless', label: 'Lossless' },
];

function Quality({ onChange }: { onChange?: (v: unknown) => void }): React.JSX.Element {
  return (
    <Select.Root items={items} onValueChange={onChange}>
      <Select.Label>Quality</Select.Label>
      <Select.Trigger placeholder="Choose a quality" />
      <Select.Content>
        {items.map((i) => (
          <Select.Option
            key={i.value}
            value={i.value}
            description={i.value === 'lossless' ? 'Wi-Fi only' : undefined}
          >
            {i.label}
          </Select.Option>
        ))}
      </Select.Content>
    </Select.Root>
  );
}

describe('Select', () => {
  it('renders a field-like trigger with the placeholder and chevron', () => {
    render(<Quality />);
    const trigger = screen.getByRole('combobox');
    expect(trigger.className).toContain('hj-select-trigger');
    expect(trigger.getAttribute('data-size')).toBe('md');
    expect(trigger.textContent).toContain('Choose a quality');
    expect(trigger.querySelector('.hj-select-icon svg')).not.toBeNull();
  });

  it('opens a themed listbox and selects an option', async () => {
    const onChange = vi.fn<(v: unknown) => void>();
    render(<Quality onChange={onChange} />);
    await userEvent.click(screen.getByRole('combobox'));
    const option = await screen.findByRole('option', { name: /Lossless/ });
    expect(option.className).toContain('hj-select-item');
    expect(option.textContent).toContain('Wi-Fi only');
    await userEvent.click(option);
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(onChange.mock.calls[0]?.[0]).toBe('lossless');
    await waitFor(() => expect(screen.getByRole('combobox').textContent).toContain('Lossless'));
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Item, Radio, Root } from './radio-group.tsx';

function Quality({ onChange }: { onChange?: (v: unknown) => void }): React.ReactElement {
  return (
    <Root aria-label="Quality" defaultValue="high" onValueChange={onChange}>
      <Item>
        <Radio value="normal" /> Normal
      </Item>
      <Item>
        <Radio value="high" /> High
      </Item>
      <Item>
        <Radio value="lossless" disabled /> Lossless
      </Item>
    </Root>
  );
}

describe('RadioGroup', () => {
  it('renders a radiogroup with complete radios and selects on click', async () => {
    const onChange = vi.fn<(v: unknown) => void>();
    render(<Quality onChange={onChange} />);
    expect(screen.getByRole('radiogroup', { name: 'Quality' }).className).toBe('hj-radio-group');
    const high = screen.getByRole('radio', { name: 'High' });
    expect(high.getAttribute('aria-checked')).toBe('true');
    expect(high.querySelector('.hj-radio-group-indicator')).not.toBeNull();
    await userEvent.click(screen.getByRole('radio', { name: 'Normal' }));
    expect(onChange).toHaveBeenCalledWith('normal', expect.anything());
  });

  it('marks disabled options', () => {
    render(<Quality />);
    expect(screen.getByRole('radio', { name: 'Lossless' }).hasAttribute('data-disabled')).toBe(
      true,
    );
  });
});

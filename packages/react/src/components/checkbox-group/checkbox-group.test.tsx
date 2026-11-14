import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, it } from 'vitest';

import { Root as Checkbox } from '../checkbox/checkbox.tsx';
import { Children, Item, Root } from './checkbox-group.tsx';

function Downloads(): React.ReactElement {
  const [value, setValue] = React.useState<string[]>(['a']);
  return (
    <Root aria-label="Downloads" value={value} onValueChange={setValue} allValues={['a', 'b']}>
      <Item>
        <Checkbox parent /> All
      </Item>
      <Children>
        <Item>
          <Checkbox value="a" /> Alpha
        </Item>
        <Item>
          <Checkbox value="b" /> Beta
        </Item>
      </Children>
    </Root>
  );
}

describe('CheckboxGroup', () => {
  it('goes mixed when some children are ticked, and select-all ticks the rest', async () => {
    render(<Downloads />);
    const all = screen.getByRole('checkbox', { name: 'All' });
    expect(all.getAttribute('aria-checked')).toBe('mixed');
    await userEvent.click(all);
    expect(screen.getByRole('checkbox', { name: 'Beta' }).getAttribute('aria-checked')).toBe(
      'true',
    );
    expect(all.getAttribute('aria-checked')).toBe('true');
  });

  it('applies hanji classes and orientation', () => {
    const { container } = render(
      <Root aria-label="x" orientation="horizontal">
        <Item>
          <Checkbox value="a" /> A
        </Item>
      </Root>,
    );
    const group = container.querySelector('.hj-checkbox-group');
    expect(group?.getAttribute('data-orientation')).toBe('horizontal');
    expect(container.querySelector('label.hj-checkbox-group-item')).not.toBeNull();
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import * as Accordion from './accordion.tsx';

function Example(): React.JSX.Element {
  return (
    <Accordion.Root defaultValue={['a']}>
      <Accordion.Item value="a">
        <Accordion.Header>
          <Accordion.Trigger>First</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>First body</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="b">
        <Accordion.Header>
          <Accordion.Trigger chevron={false}>Second</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>Second body</Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  );
}

describe('Accordion', () => {
  it('renders lined by default with a chevron in the trigger', () => {
    const { container } = render(<Example />);
    expect(container.querySelector('.hj-accordion-root')?.getAttribute('data-variant')).toBe(
      'lined',
    );
    const first = screen.getByRole('button', { name: 'First' });
    expect(first.querySelector('.hj-accordion-chevron')).not.toBeNull();
    expect(first.getAttribute('aria-expanded')).toBe('true');
    expect(
      screen.getByRole('button', { name: 'Second' }).querySelector('.hj-accordion-chevron'),
    ).toBeNull();
  });

  it('opens an item on click', async () => {
    render(<Example />);
    const second = screen.getByRole('button', { name: 'Second' });
    expect(second.getAttribute('aria-expanded')).toBe('false');
    await userEvent.click(second);
    expect(second.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('Second body')).toBeTruthy();
  });
});

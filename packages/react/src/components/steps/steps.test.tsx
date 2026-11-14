import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import * as Steps from './steps.tsx';

function Example({ value }: { value: number }): React.JSX.Element {
  return (
    <Steps.Root value={value} total={3} aria-label="Checkout">
      <Steps.Count />
      <Steps.Track />
      <Steps.List>
        <Steps.Item>Account</Steps.Item>
        <Steps.Item>Plan</Steps.Item>
        <Steps.Item description="Card">Payment</Steps.Item>
      </Steps.List>
    </Steps.Root>
  );
}

describe('Steps', () => {
  it('marks complete, current and upcoming steps', () => {
    const { container } = render(<Example value={1} />);
    expect(screen.getByRole('group', { name: 'Checkout' }).className).toBe('hj-steps-root');
    expect(screen.getByText('Step 2 of 3')).toBeTruthy();
    const items = container.querySelectorAll('.hj-steps-item');
    expect([...items].map((i) => i.getAttribute('data-state'))).toEqual([
      'complete',
      'current',
      'upcoming',
    ]);
    expect(items[1]?.getAttribute('aria-current')).toBe('step');
    const segments = container.querySelectorAll('.hj-steps-segment');
    expect(segments).toHaveLength(3);
    expect(segments[2]?.getAttribute('data-state')).toBe('upcoming');
  });

  it('exposes progress and completion', () => {
    const { container } = render(<Example value={3} />);
    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-valuetext')).toBe('All 3 steps done');
    expect(container.querySelector('.hj-steps-root')?.hasAttribute('data-complete')).toBe(true);
    expect(screen.getAllByText('All 3 steps done').length).toBeGreaterThan(0);
  });
});

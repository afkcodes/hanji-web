import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import * as Reasoning from './reasoning.tsx';

function R({ thinking, duration }: { thinking?: boolean; duration?: number }): React.JSX.Element {
  return (
    <Reasoning.Root thinking={thinking} duration={duration}>
      <Reasoning.Trigger />
      <Reasoning.Panel>Checking tempo…</Reasoning.Panel>
    </Reasoning.Root>
  );
}

describe('Reasoning', () => {
  it('is open while thinking and folds to “Thought for 12 s” when done', () => {
    const { rerender } = render(<R thinking />);
    const trigger = screen.getByRole('button');
    expect(trigger.textContent).toContain('Thinking');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    rerender(<R thinking={false} duration={12.2} />);
    expect(trigger.textContent).toContain('Thought for 12 s');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('falls back to “Reasoning” without a duration', () => {
    render(<R />);
    expect(screen.getByRole('button').textContent).toContain('Reasoning');
  });
});

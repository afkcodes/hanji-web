import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import * as Tooltip from './tooltip.tsx';

describe('Tooltip', () => {
  it('Hint names its child on keyboard focus with the ink pill', async () => {
    render(
      <Tooltip.Hint label="Copy link">
        <button type="button" aria-label="Copy link">
          ⧉
        </button>
      </Tooltip.Hint>,
    );
    const trigger = screen.getByRole('button', { name: 'Copy link' });
    expect(trigger.className).toContain('hj-tooltip-trigger');
    act(() => trigger.focus());
    const pill = await screen.findByText('Copy link', { selector: '.hj-tooltip-popup' });
    expect(pill.querySelector('.hj-tooltip-arrow')).not.toBeNull();
  });

  it('opens on top by default with an ink arrow, and can drop the arrow', async () => {
    render(
      <>
        <Tooltip.Root defaultOpen>
          <Tooltip.Trigger>Shuffle</Tooltip.Trigger>
          <Tooltip.Content>Shuffle ⌘S</Tooltip.Content>
        </Tooltip.Root>
        <Tooltip.Root defaultOpen>
          <Tooltip.Trigger>Repeat</Tooltip.Trigger>
          <Tooltip.Content side="bottom" arrow={false}>
            Repeat ⌘R
          </Tooltip.Content>
        </Tooltip.Root>
      </>,
    );
    const top = await screen.findByText('Shuffle ⌘S', { selector: '.hj-tooltip-popup' });
    expect(top.getAttribute('data-side')).toBe('top');
    expect(top.querySelector('.hj-tooltip-arrow')).not.toBeNull();
    const bottom = await screen.findByText('Repeat ⌘R', { selector: '.hj-tooltip-popup' });
    expect(bottom.getAttribute('data-side')).toBe('bottom');
    expect(bottom.querySelector('.hj-tooltip-arrow')).toBeNull();
  });
});

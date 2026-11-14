import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import * as Collapsible from './collapsible.tsx';

describe('Collapsible', () => {
  it('toggles its panel and turns the chevron hook on', async () => {
    render(
      <Collapsible.Root>
        <Collapsible.Trigger>Show 5 more tracks</Collapsible.Trigger>
        <Collapsible.Panel>Hidden tracks</Collapsible.Panel>
      </Collapsible.Root>,
    );
    const trigger = screen.getByRole('button', { name: 'Show 5 more tracks' });
    expect(trigger.className).toBe('hj-collapsible-trigger');
    expect(trigger.querySelector('.hj-collapsible-chevron')).not.toBeNull();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    await userEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.hasAttribute('data-panel-open')).toBe(true);
    expect(screen.getByText('Hidden tracks')).toBeTruthy();
  });

  it('respects disabled', async () => {
    render(
      <Collapsible.Root disabled>
        <Collapsible.Trigger chevron={false}>Developer options</Collapsible.Trigger>
        <Collapsible.Panel>Secret</Collapsible.Panel>
      </Collapsible.Root>,
    );
    const trigger = screen.getByRole('button', { name: 'Developer options' });
    await userEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.querySelector('.hj-collapsible-chevron')).toBeNull();
  });
});

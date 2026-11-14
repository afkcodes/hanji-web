import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import * as TabBar from './tab-bar.tsx';

describe('TabBar', () => {
  it('marks the active item, switches on press and reports the value', async () => {
    const onValueChange = vi.fn<(v: string) => void>();
    render(
      <TabBar.Root aria-label="Main" defaultValue="home" onValueChange={onValueChange}>
        <TabBar.Item value="home" icon={<svg />}>
          Home
        </TabBar.Item>
        <TabBar.Item value="inbox" icon={<svg />} badge={128}>
          Inbox
        </TabBar.Item>
      </TabBar.Root>,
    );
    expect(screen.getByRole('navigation', { name: 'Main' }).className).toBe('hj-tab-bar-root');
    const home = screen.getByRole('button', { name: 'Home' });
    expect(home.getAttribute('aria-current')).toBe('page');
    const inbox = screen.getByRole('button', { name: /^Inbox/ });
    expect(inbox.textContent).toContain(', 128 new');
    expect(inbox.textContent).toContain('99+');
    await userEvent.click(inbox);
    expect(onValueChange).toHaveBeenCalledWith('inbox');
    expect(inbox.getAttribute('aria-current')).toBe('page');
    expect(home.hasAttribute('aria-current')).toBe(false);
  });

  it('renders links with an explicit active flag', () => {
    render(
      <TabBar.Root aria-label="Player">
        {/* oxlint-disable-next-line jsx-a11y/control-has-associated-label -- the Item supplies the text */}
        <TabBar.Item active icon={<svg />} render={<a href="/queue" />}>
          Queue
        </TabBar.Item>
      </TabBar.Root>,
    );
    const link = screen.getByRole('link', { name: 'Queue' });
    expect(link.getAttribute('aria-current')).toBe('page');
    expect(link.hasAttribute('type')).toBe(false);
  });
});

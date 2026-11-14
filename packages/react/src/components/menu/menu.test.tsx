import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Theme } from '../../system/theme.tsx';
import * as Menu from './menu.tsx';

function Demo({ onDelete }: { onDelete: () => void }): React.JSX.Element {
  return (
    <Theme paper="ink">
      <Menu.Root>
        <Menu.Trigger>More</Menu.Trigger>
        <Menu.Content>
          <Menu.Item>
            Copy link <Menu.Shortcut>⌘L</Menu.Shortcut>
          </Menu.Item>
          <Menu.CheckboxItem defaultChecked>Album art</Menu.CheckboxItem>
          <Menu.Separator />
          <Menu.Item tone="danger" onClick={onDelete}>
            Delete playlist
          </Menu.Item>
        </Menu.Content>
      </Menu.Root>
    </Theme>
  );
}

describe('Menu', () => {
  it('opens a themed menu with hanji rows, shortcut and danger tone', async () => {
    const onDelete = vi.fn<() => void>();
    render(<Demo onDelete={onDelete} />);
    await userEvent.click(screen.getByRole('button', { name: 'More' }));
    const menu = await screen.findByRole('menu');
    expect(menu.className).toContain('hj-menu-popup');
    expect(menu.closest('[data-hj-paper]')?.getAttribute('data-hj-paper')).toBe('ink');
    const items = screen.getAllByRole('menuitem');
    expect(items[0]?.querySelector('.hj-menu-shortcut')?.textContent).toBe('⌘L');
    const del = screen.getByRole('menuitem', { name: 'Delete playlist' });
    expect(del.getAttribute('data-tone')).toBe('danger');
    await userEvent.click(del);
    expect(onDelete).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });

  it('checkbox items render a check column that reflects state', async () => {
    render(<Demo onDelete={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: 'More' }));
    const art = await screen.findByRole('menuitemcheckbox', { name: 'Album art' });
    const indicator = art.querySelector('.hj-menu-indicator');
    expect(indicator?.hasAttribute('data-checked')).toBe(true);
    await userEvent.click(art);
    expect(art.getAttribute('aria-checked')).toBe('false');
  });
});

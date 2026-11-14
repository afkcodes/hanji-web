import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import * as Menubar from './menubar.tsx';

describe('Menubar', () => {
  it('renders a menubar of quiet triggers that open Menu-styled popups', async () => {
    render(
      <Menubar.Root>
        <Menubar.Menu>
          <Menubar.Trigger>File</Menubar.Trigger>
          <Menubar.Content>
            <Menubar.Item>New playlist</Menubar.Item>
          </Menubar.Content>
        </Menubar.Menu>
        <Menubar.Menu>
          <Menubar.Trigger>Edit</Menubar.Trigger>
          <Menubar.Content>
            <Menubar.Item>Undo</Menubar.Item>
          </Menubar.Content>
        </Menubar.Menu>
      </Menubar.Root>,
    );
    const bar = screen.getByRole('menubar');
    expect(bar.className).toBe('hj-menubar');
    const file = screen.getByRole('menuitem', { name: 'File' });
    expect(file.className).toBe('hj-menubar-trigger');
    await userEvent.click(file);
    const menu = await screen.findByRole('menu');
    expect(menu.className).toContain('hj-menu-popup');
    expect(screen.getByRole('menuitem', { name: 'New playlist' }).className).toContain(
      'hj-menu-item',
    );
  });
});

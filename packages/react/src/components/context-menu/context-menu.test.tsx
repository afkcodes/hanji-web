import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import * as ContextMenu from './context-menu.tsx';

describe('ContextMenu', () => {
  it('opens Menu-styled rows on right-click', async () => {
    render(
      <ContextMenu.Root>
        <ContextMenu.Trigger>Track row</ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Item>Play next</ContextMenu.Item>
          <ContextMenu.Item tone="danger">Remove</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Root>,
    );
    const trigger = screen.getByText('Track row');
    expect(trigger.className).toBe('hj-context-menu-trigger');
    fireEvent.contextMenu(trigger, { clientX: 40, clientY: 40 });
    const menu = await screen.findByRole('menu');
    expect(menu.className).toContain('hj-menu-popup');
    expect(screen.getByRole('menuitem', { name: 'Play next' }).className).toContain('hj-menu-item');
    expect(screen.getByRole('menuitem', { name: 'Remove' }).getAttribute('data-tone')).toBe(
      'danger',
    );
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import * as NavigationMenu from './navigation-menu.tsx';

function Example(): React.JSX.Element {
  return (
    <NavigationMenu.Root aria-label="Main">
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>Library</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <NavigationMenu.Link href="#downloads">
              <NavigationMenu.LinkTitle>Downloads</NavigationMenu.LinkTitle>
            </NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link variant="item" href="#pricing" active>
            Pricing
          </NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
      <NavigationMenu.Surface />
    </NavigationMenu.Root>
  );
}

describe('NavigationMenu', () => {
  it('renders a labelled nav with hanji classes and a chevron', () => {
    const { container } = render(<Example />);
    expect(screen.getByRole('navigation', { name: 'Main' }).className).toContain(
      'hj-navigation-menu-root',
    );
    const trigger = screen.getByRole('button', { name: 'Library' });
    expect(trigger.className).toBe('hj-navigation-menu-trigger');
    expect(container.querySelector('.hj-navigation-menu-icon')).not.toBeNull();
    const pricing = screen.getByRole('link', { name: 'Pricing' });
    expect(pricing.getAttribute('data-variant')).toBe('item');
    expect(pricing.getAttribute('aria-current')).toBe('page');
  });

  it('opens content in the surface on click', async () => {
    render(<Example />);
    const trigger = screen.getByRole('button', { name: 'Library' });
    await userEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const link = await screen.findByRole('link', { name: 'Downloads' });
    expect(link.closest('.hj-navigation-menu-popup')).not.toBeNull();
  });
});

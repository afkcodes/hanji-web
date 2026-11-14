import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import * as Tabs from './tabs.tsx';

function Example({ variant }: { variant?: 'underline' | 'pill' }): React.JSX.Element {
  return (
    <Tabs.Root defaultValue="a">
      <Tabs.List variant={variant}>
        <Tabs.Tab value="a">Overview</Tabs.Tab>
        <Tabs.Tab value="b">Tracks</Tabs.Tab>
        <Tabs.Tab value="c" disabled>
          Lyrics
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="a">Overview panel</Tabs.Panel>
      <Tabs.Panel value="b">Tracks panel</Tabs.Panel>
    </Tabs.Root>
  );
}

describe('Tabs', () => {
  it('renders a tablist with hanji classes, variant hooks and the indicator', () => {
    const { container } = render(<Example variant="pill" />);
    const list = screen.getByRole('tablist');
    expect(list.className).toBe('hj-tabs-list');
    expect(list.getAttribute('data-variant')).toBe('pill');
    expect(container.querySelector('.hj-tabs-indicator')).not.toBeNull();
    expect(screen.getByRole('tab', { name: 'Overview' }).className).toBe('hj-tabs-tab');
  });

  it('switches panels on click and keeps disabled tabs inert', async () => {
    render(<Example />);
    expect(screen.getByText('Overview panel')).toBeTruthy();
    await userEvent.click(screen.getByRole('tab', { name: 'Tracks' }));
    expect(screen.getByRole('tab', { name: 'Tracks' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText('Tracks panel')).toBeTruthy();
    await userEvent.click(screen.getByRole('tab', { name: 'Lyrics' }));
    expect(screen.getByRole('tab', { name: 'Tracks' }).getAttribute('aria-selected')).toBe('true');
  });

  it('can leave the indicator out', () => {
    const { container } = render(
      <Tabs.Root defaultValue="a">
        <Tabs.List indicator={false}>
          <Tabs.Tab value="a">One</Tabs.Tab>
        </Tabs.List>
      </Tabs.Root>,
    );
    expect(container.querySelector('.hj-tabs-indicator')).toBeNull();
  });
});

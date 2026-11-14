import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import * as Breadcrumbs from './breadcrumbs.tsx';

function Trail({ maxItems }: { maxItems?: number }): React.JSX.Element {
  return (
    <Breadcrumbs.Root aria-label="Breadcrumb" maxItems={maxItems}>
      <Breadcrumbs.Item href="/a">Library</Breadcrumbs.Item>
      <Breadcrumbs.Item href="/b">Playlists</Breadcrumbs.Item>
      <Breadcrumbs.Item href="/c">Shared</Breadcrumbs.Item>
      <Breadcrumbs.Item href="/d">Mixes</Breadcrumbs.Item>
      <Breadcrumbs.Item current>Late Night Drive</Breadcrumbs.Item>
    </Breadcrumbs.Root>
  );
}

describe('Breadcrumbs', () => {
  it('renders an ordered trail with separators and the current page as text', () => {
    const { container } = render(<Trail />);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeTruthy();
    expect(screen.getAllByRole('link')).toHaveLength(4);
    const current = screen.getByText('Late Night Drive');
    expect(current.tagName).toBe('SPAN');
    expect(current.getAttribute('aria-current')).toBe('page');
    expect(container.querySelectorAll('.hj-breadcrumbs-separator')).toHaveLength(4);
  });

  it('collapses the middle and reveals it in place', async () => {
    render(<Trail maxItems={3} />);
    expect(screen.queryByText('Playlists')).toBeNull();
    expect(screen.getByText('Library')).toBeTruthy();
    expect(screen.getByText('Mixes')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Show 2 more' }));
    expect(screen.getByText('Playlists')).toBeTruthy();
    expect(screen.getByText('Shared')).toBeTruthy();
  });
});

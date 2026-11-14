import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Link } from './link.tsx';

describe('Link', () => {
  it('renders an anchor with tone hooks', () => {
    render(<Link href="/terms">terms</Link>);
    const a = screen.getByRole('link', { name: 'terms' });
    expect(a.getAttribute('href')).toBe('/terms');
    expect(a.className).toBe('hj-link');
    expect(a.getAttribute('data-tone')).toBe('accent');
    expect(a.hasAttribute('target')).toBe(false);
  });

  it('external opens safely in a new tab and says so', () => {
    render(
      <Link href="https://example.com" external>
        Help centre
      </Link>,
    );
    const a = screen.getByRole('link', { name: 'Help centre (opens in a new tab)' });
    expect(a.getAttribute('target')).toBe('_blank');
    expect(a.getAttribute('rel')).toBe('noopener noreferrer');
  });
});

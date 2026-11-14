import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import * as Citation from './citation.tsx';

describe('Citation', () => {
  it('the chip is a labelled link to the source', () => {
    render(
      <Citation.Root>
        <Citation.Trigger index={2} href="https://example.com/a" />
      </Citation.Root>,
    );
    const link = screen.getByRole('link', { name: 'Source 2' });
    expect(link.getAttribute('href')).toBe('https://example.com/a');
    expect(link.textContent).toBe('2');
    expect(link.className).toBe('hj-citation-trigger');
  });

  it('list items link out with number, title and domain', () => {
    render(
      <Citation.List>
        <Citation.ListItem index={1} href="https://example.org" domain="example.org">
          Loudness normalisation
        </Citation.ListItem>
      </Citation.List>,
    );
    const link = screen.getByRole('link');
    expect(link.textContent).toBe('1Loudness normalisationexample.org');
    expect(link.getAttribute('target')).toBe('_blank');
  });
});

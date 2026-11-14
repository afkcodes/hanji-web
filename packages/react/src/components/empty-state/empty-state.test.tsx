import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Description, Glyph, Root, Title } from './empty-state.tsx';

describe('EmptyState', () => {
  it('draws the variant glyph when given no children', () => {
    const { container } = render(
      <Root variant="no-results">
        <Glyph />
        <Title>No results</Title>
        <Description>Try another word.</Description>
      </Root>,
    );
    const root = container.querySelector('.hj-empty-state') as HTMLElement;
    expect(root.getAttribute('data-variant')).toBe('no-results');
    expect(root.getAttribute('role')).toBeNull();
    const glyph = container.querySelector('.hj-empty-state-glyph') as HTMLElement;
    expect(glyph.getAttribute('aria-hidden')).toBe('true');
    expect(glyph.querySelector('svg')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'No results' }).tagName).toBe('H3');
  });

  it('offline and error announce themselves as status', () => {
    render(
      <Root variant="error">
        <Title>Couldn’t load</Title>
      </Root>,
    );
    expect(screen.getByRole('status').getAttribute('data-variant')).toBe('error');
  });

  it('heading level follows render', () => {
    render(
      <Root>
        <Title render={(props) => <h2 {...props}>{props.children}</h2>}>Nothing yet</Title>
      </Root>,
    );
    expect(screen.getByRole('heading', { name: 'Nothing yet' }).tagName).toBe('H2');
  });
});

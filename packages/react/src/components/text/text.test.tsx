import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Text } from './text.tsx';

describe('Text', () => {
  it('defaults to a body paragraph that inherits ink', () => {
    render(<Text>48 tracks</Text>);
    const el = screen.getByText('48 tracks');
    expect(el.tagName).toBe('P');
    expect(el.className).toBe('hj-text');
    expect(el.getAttribute('data-variant')).toBe('body');
    expect(el.hasAttribute('data-tone')).toBe(false);
  });

  it('picks the tag by role and sets tone and truncation hooks', () => {
    render(
      <Text variant="title" tone="mute" truncate>
        Recently played
      </Text>,
    );
    const el = screen.getByRole('heading', { name: 'Recently played' });
    expect(el.tagName).toBe('H2');
    expect(el.getAttribute('data-tone')).toBe('mute');
    expect(el.hasAttribute('data-truncate')).toBe(true);
  });

  it('render replaces the element', () => {
    render(
      <Text variant="title" render={(props) => <h1 {...props}>{props.children}</h1>}>
        Library
      </Text>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Library' })).toBeTruthy();
  });
});

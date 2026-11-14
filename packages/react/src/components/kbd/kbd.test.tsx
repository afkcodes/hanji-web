import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Kbd } from './kbd.tsx';

describe('Kbd', () => {
  it('renders a kbd with size hook', () => {
    render(<Kbd size="sm">Esc</Kbd>);
    const el = screen.getByText('Esc');
    expect(el.tagName).toBe('KBD');
    expect(el.className).toBe('hj-kbd');
    expect(el.getAttribute('data-size')).toBe('sm');
  });
});

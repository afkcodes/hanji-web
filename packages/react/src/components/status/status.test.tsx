import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Status } from './status.tsx';

describe('Status', () => {
  it('pairs a glyph with the word and a muted meta', () => {
    const { container } = render(
      <Status tone="success" meta="2 min ago">
        Synced
      </Status>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toBe('hj-status');
    expect(el.getAttribute('data-tone')).toBe('success');
    expect(el.querySelector('.hj-status-glyph svg')).not.toBeNull();
    expect(screen.getByText('Synced').className).toBe('hj-status-word');
    expect(screen.getByText('2 min ago').className).toBe('hj-status-meta');
  });

  it('pending draws a live dot instead of a glyph', () => {
    const { container } = render(<Status tone="pending">Syncing</Status>);
    expect(container.querySelector('.hj-status-dot[data-tone="pending"]')).not.toBeNull();
  });

  it('plain variant without icon', () => {
    const { container } = render(
      <Status tone="danger" variant="plain" icon={false}>
        Failed
      </Status>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute('data-variant')).toBe('plain');
    expect(el.querySelector('svg')).toBeNull();
  });
});

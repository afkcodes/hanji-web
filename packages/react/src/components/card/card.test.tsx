import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import * as Card from './card.tsx';

describe('Card', () => {
  it('renders as a pressable link with hanji parts', () => {
    render(
      <Card.Root pressable render={<a href="#album/saltmarsh" aria-label="Saltmarsh" />}>
        <Card.Media ratio="1:1" />
        <Card.Body>
          <Card.Title>Saltmarsh</Card.Title>
        </Card.Body>
      </Card.Root>,
    );
    const link = screen.getByRole('link', { name: 'Saltmarsh' });
    expect(link.className).toBe('hj-card');
    expect(link.hasAttribute('data-pressable')).toBe(true);
    expect(link.getAttribute('data-orientation')).toBe('vertical');
    expect(screen.getByRole('heading', { name: 'Saltmarsh' }).className).toBe('hj-card-title');
    const media = link.querySelector<HTMLElement>('.hj-card-media');
    expect(media?.style.getPropertyValue('--_ratio')).toBe('1 / 1');
  });
});

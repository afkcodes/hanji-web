import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Content, Layer, Root } from './scrim.tsx';

describe('Scrim', () => {
  it('layers a decorative gradient under content', () => {
    const { container } = render(
      <Root>
        <img alt="Cover" src="data:," />
        <Layer edge="top" strength={0.5} extent="40%" color="#3b1d05" />
        <Content edge="top">Saltmarsh</Content>
      </Root>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toBe('hj-scrim');
    const layer = root.querySelector('.hj-scrim-layer') as HTMLElement;
    expect(layer.getAttribute('aria-hidden')).toBe('true');
    expect(layer.getAttribute('data-edge')).toBe('top');
    expect(layer.style.getPropertyValue('--hj-scrim-strength')).toBe('50%');
    expect(layer.style.getPropertyValue('--hj-scrim-extent')).toBe('40%');
    expect(layer.style.getPropertyValue('--hj-scrim-color')).toBe('#3b1d05');
    expect(screen.getByText('Saltmarsh').className).toBe('hj-scrim-content');
  });

  it('clamps strength', () => {
    const { container } = render(<Layer strength={3} />);
    expect(
      (container.firstElementChild as HTMLElement).style.getPropertyValue('--hj-scrim-strength'),
    ).toBe('100%');
  });
});

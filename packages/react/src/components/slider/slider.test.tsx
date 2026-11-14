import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Control, Indicator, Marks, Root, Thumb, Track } from './slider.tsx';

describe('Slider', () => {
  it('renders a complete slider when childless', () => {
    const { container } = render(<Root defaultValue={30} aria-label="Volume" />);
    expect(
      container.querySelector(
        '.hj-slider .hj-slider-control .hj-slider-track .hj-slider-indicator',
      ),
    ).not.toBeNull();
    expect(container.querySelectorAll('.hj-slider-thumb')).toHaveLength(1);
    expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('30');
  });

  it('renders two thumbs for a range and a bubble per thumb', () => {
    const { container } = render(<Root defaultValue={[20, 80]} />);
    expect(container.querySelectorAll('.hj-slider-thumb')).toHaveLength(2);
    const bubbles = Array.from(container.querySelectorAll('.hj-slider-bubble')).map(
      (b) => b.textContent,
    );
    expect(bubbles).toEqual(['20', '80']);
  });

  it('steps with the keyboard and formats the bubble', () => {
    const onChange = vi.fn<(v: unknown) => void>();
    const { container } = render(
      <Root defaultValue={5} min={0} max={12} onValueChange={(v) => onChange(v)}>
        <Control>
          <Track>
            <Indicator />
            <Thumb aria-label="Crossfade" formatValue={(v) => `${v} s`} />
          </Track>
        </Control>
      </Root>,
    );
    const input = screen.getByRole('slider', { name: 'Crossfade' });
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith(6);
    expect(container.querySelector('.hj-slider-bubble')?.textContent).toBe('6 s');
  });

  it('marks pending and draws marks', () => {
    const { container } = render(
      <Root defaultValue={40} pending>
        <Marks values={[0, 50, 100]} labels={['0', '50', '100']} />
      </Root>,
    );
    const root = container.querySelector('.hj-slider');
    expect(root?.hasAttribute('data-pending')).toBe(true);
    expect(root?.getAttribute('aria-busy')).toBe('true');
    expect(container.querySelectorAll('.hj-slider-mark')).toHaveLength(3);
  });
});

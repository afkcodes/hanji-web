import { act, fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import * as Artwork from './artwork.tsx';
import { ARTWORK_FACES, artworkSpec, artworkSvg } from './generate.ts';

describe('generated art', () => {
  it('gives an id the same face every time, and 100 distinct faces by number', () => {
    expect(artworkSvg('Late Night Drive')).toBe(artworkSvg('Late Night Drive'));
    expect(artworkSpec('Late Night Drive').face).toBe(artworkSpec('Late Night Drive').face);
    expect(ARTWORK_FACES).toBe(100);
    const faces = new Set(Array.from({ length: 100 }, (_, f) => artworkSvg(f)));
    expect(faces.size).toBe(100);
    expect(artworkSpec(42)).toMatchObject({ face: 42, composition: 'stripes' });
  });

  it('is flat, light SVG', () => {
    const svg = artworkSvg('Paper Lanterns');
    expect(svg).not.toMatch(/filter|Gradient|<image/);
    expect((svg.match(/<(rect|circle|path|polygon)/g) ?? []).length).toBeLessThanOrEqual(40);
  });
});

describe('Artwork', () => {
  it('draws decorative art for an id', () => {
    const { container } = render(<Artwork.Root id="Low Tide" size={56} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('hj-artwork');
    expect(root.style.getPropertyValue('--_s')).toBe('56px');
    expect(root.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('tiles a collage from up to four covers, and never leaves a hole', () => {
    const { container, rerender } = render(
      <Artwork.Root>
        <Artwork.Collage ids={['a', 'b', 'c', 'd', 'e']} />
      </Artwork.Root>,
    );
    expect(container.querySelectorAll('.hj-artwork-cell')).toHaveLength(4);
    rerender(
      <Artwork.Root>
        <Artwork.Collage ids={[]} fallback="New playlist" />
      </Artwork.Root>,
    );
    expect(container.querySelectorAll('.hj-artwork-cell')).toHaveLength(0);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('sizes a glyph for its box', () => {
    const { container } = render(
      <Artwork.Root size={120}>
        <Artwork.Glyph id="Made for you">
          <svg data-testid="g" />
        </Artwork.Glyph>
      </Artwork.Root>,
    );
    const glyph = container.querySelector('.hj-artwork-glyph') as HTMLElement;
    expect(glyph.style.getPropertyValue('--_g')).toBe('28px');
    expect(container.querySelector('.hj-artwork-scrim')).toBeTruthy();
  });

  it('stands art in only when an image is slow or fails', () => {
    vi.useFakeTimers();
    const { container } = render(
      <Artwork.Root>
        <Artwork.Image src="/cover.jpg" alt="" id="Glasshouse" />
      </Artwork.Root>,
    );
    expect(container.querySelector('.hj-artwork-art')).toBeNull();
    act(() => {
      vi.advanceTimersByTime(450);
    });
    expect(container.querySelector('.hj-artwork-art')).toBeTruthy();
    fireEvent.error(container.querySelector('img') as HTMLImageElement);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('.hj-artwork-art')).toBeTruthy();
    vi.useRealTimers();
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { endpoints, hanjiPath, parse } from '../scripts/corners.ts';
import { iconAdapter } from './adapter.tsx';
import { catalog } from './catalog.ts';
import { DynamicIcon, isIconName } from './dynamic.tsx';
import { IconArrowUp, IconHome, iconNames, toSvg } from './index.ts';

describe('continuous corners', () => {
  it('turns a rounded rectangle into one closed curve that keeps its bounds', () => {
    const out = hanjiPath(
      'M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6',
    );
    expect(out).not.toMatch(/a/);
    const pts = endpoints(out);
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    expect(Math.min(...xs)).toBeCloseTo(5);
    expect(Math.max(...xs)).toBeCloseTo(19);
    expect(Math.min(...ys)).toBeCloseTo(11);
    expect(Math.max(...ys)).toBeCloseTo(21);
    // closed: the last point lands back on the first
    expect(pts.at(-1)?.[0]).toBeCloseTo(pts[0]?.[0] ?? NaN);
    expect(pts.at(-1)?.[1]).toBeCloseTo(pts[0]?.[1] ?? NaN);
  });

  it('leaves circles, open ends and large arcs alone', () => {
    expect(hanjiPath('M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0')).toContain('a9 9 0 1 0 18 0');
    expect(hanjiPath('M12 5l0 14')).toBe('M12 5v14');
  });

  it('parses every command tabler uses', () => {
    expect(parse('M1 1l1 1h1v1c1 1 1 1 1 1s1 1 1 1q1 1 1 1t1 1a1 1 0 0 1 1 1z')).toHaveLength(10);
  });
});

describe('icons', () => {
  it('ships more than a thousand outline icons with solid counterparts', () => {
    expect(iconNames.length).toBeGreaterThan(2000);
    expect(catalog.filter((c) => c.filled).length).toBeGreaterThan(1000);
    expect(catalog.some((c) => c.name.startsWith('brand-'))).toBe(false);
  });

  it('draws outline, solid and wash', () => {
    const { container, rerender } = render(<IconHome />);
    const svg = (): SVGSVGElement => container.querySelector('svg') as SVGSVGElement;
    expect(svg().getAttribute('fill')).toBe('none');
    expect(svg().getAttribute('aria-hidden')).toBe('true');
    expect(svg().getAttribute('width')).toBe('1em');
    rerender(<IconHome variant="solid" />);
    expect(svg().getAttribute('fill')).toBe('currentColor');
    rerender(<IconHome variant="wash" />);
    expect(svg().querySelector('g')?.getAttribute('opacity')).toBe('0.16');
  });

  it('labels when asked and gives line icons a bold solid', () => {
    render(<IconArrowUp variant="solid" label="Scroll to top" size={24} />);
    const svg = screen.getByRole('img', { name: 'Scroll to top' });
    expect(svg.getAttribute('stroke-width')).toBe('2.25');
    expect(svg.getAttribute('width')).toBe('24');
  });

  it('renders standalone SVG strings', () => {
    expect(toSvg(IconHome, 'solid')).toMatch(/^<svg[^>]+fill="currentColor"><path d="M/);
    expect(toSvg(IconArrowUp, 'solid')).toContain('stroke-width="2.25"');
  });

  it('loads an icon by name', async () => {
    expect(isIconName('home')).toBe(true);
    expect(isIconName('no-such-icon')).toBe(false);
    const { container } = render(<DynamicIcon name="home" variant="solid" />);
    await waitFor(() => expect(container.querySelector('[data-hj-icon="home"]')).toBeTruthy());
  });

  it('covers every glyph hanji components draw', () => {
    expect(Object.keys(iconAdapter())).toHaveLength(22);
  });
});

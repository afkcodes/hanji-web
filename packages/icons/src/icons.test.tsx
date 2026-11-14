import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { endpoints, hanjiPath, parse } from '../scripts/corners.ts';
import { iconAdapter } from './adapter.tsx';
import { catalog } from './catalog.ts';
import { DynamicIcon, isIconName } from './dynamic.tsx';
import {
  IconBell,
  IconChevronDown,
  IconAltArrowDown,
  IconSearch,
  iconNames,
  toSvg,
} from './index.ts';

describe('hanji geometry', () => {
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
    expect(pts.at(-1)?.[0]).toBeCloseTo(pts[0]?.[0] ?? NaN);
    expect(pts.at(-1)?.[1]).toBeCloseTo(pts[0]?.[1] ?? NaN);
  });

  it('grows corners drawn as curves into rounder squircles', () => {
    const out = hanjiPath(
      'M6 3h12C19.66 3 21 4.34 21 6V18C21 19.66 19.66 21 18 21H6C4.34 21 3 19.66 3 18V6C3 4.34 4.34 3 6 3Z',
      { precision: 2 },
    );
    expect(out.startsWith('M6.9 3')).toBe(true);
  });

  it('softens sharp vertices but keeps the ends where they were', () => {
    const out = hanjiPath('M5 13l4 4L19 7', { fillet: 1.2, precision: 2 });
    expect(out).toMatch(/c/);
    const pts = endpoints(out);
    expect(pts[0]).toEqual([5, 13]);
    expect(pts.at(-1)?.[0]).toBeCloseTo(19);
    expect(pts.at(-1)?.[1]).toBeCloseTo(7);
  });

  it('keeps zero-length dots and leaves circles alone', () => {
    expect(hanjiPath('M16 14h.001', { precision: 2 })).toBe('M16 14h0');
    expect(hanjiPath('M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0')).toContain('a9 9 0 1 0 18 0');
  });

  it('parses every path command', () => {
    expect(parse('M1 1l1 1h1v1c1 1 1 1 1 1s1 1 1 1q1 1 1 1t1 1a1 1 0 0 1 1 1z')).toHaveLength(10);
  });
});

describe('icons', () => {
  it('ships more than a thousand icons, each with a solid, crediting Solar', () => {
    expect(catalog.length).toBeGreaterThan(1000);
    expect(iconNames.length).toBeGreaterThan(catalog.length);
    expect(catalog.filter((c) => c.original).map((c) => c.name)).toEqual(['search', 'wrench']);
  });

  it('draws all five styles', () => {
    const { container, rerender } = render(<IconBell />);
    const svg = (): SVGSVGElement => container.querySelector('svg') as SVGSVGElement;
    expect(svg().getAttribute('fill')).toBe('none');
    expect(svg().getAttribute('aria-hidden')).toBe('true');
    expect(svg().getAttribute('width')).toBe('1em');
    rerender(<IconBell variant="solid" />);
    expect(svg().querySelector('path')?.getAttribute('fill')).toBe('currentColor');
    rerender(<IconBell variant="wash" />);
    expect(svg().querySelector('g')?.getAttribute('opacity')).toBe('0.16');
    rerender(<IconBell variant="duotone" />);
    expect(svg().querySelector('[style*="--hj-icon-second"]')).toBeTruthy();
    rerender(<IconBell variant="duotone-solid" />);
    expect(svg().getAttribute('data-variant')).toBe('duotone-solid');
  });

  it('exports familiar aliases for the same drawing', () => {
    expect(IconChevronDown).toBe(IconAltArrowDown);
    expect(isIconName('chevron-down')).toBe(true);
  });

  it('labels when asked', () => {
    render(<IconSearch label="Search" size={24} />);
    expect(screen.getByRole('img', { name: 'Search' }).getAttribute('width')).toBe('24');
  });

  it('renders standalone SVG strings', () => {
    expect(toSvg(IconBell, 'solid')).toMatch(/^<svg[^>]+><path d="M[^"]+" fill="currentColor"/);
    expect(toSvg(IconBell, 'duotone')).toContain('opacity="0.5"');
  });

  it('loads an icon by name or alias', async () => {
    expect(isIconName('no-such-icon')).toBe(false);
    const { container } = render(<DynamicIcon name="trash" variant="solid" />);
    await waitFor(() =>
      expect(container.querySelector('[data-hj-icon="trash-bin-trash"]')).toBeTruthy(),
    );
  });

  it('covers every glyph hanji components draw', () => {
    expect(Object.keys(iconAdapter())).toHaveLength(22);
  });
});

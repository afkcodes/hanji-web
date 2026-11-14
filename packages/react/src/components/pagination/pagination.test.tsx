import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import * as Pagination from './pagination.tsx';

describe('pageRange', () => {
  it('shows everything when short', () => {
    expect(Pagination.pageRange(2, 5)).toEqual([1, 2, 3, 4, 5]);
  });
  it('keeps a constant length with ellipses', () => {
    expect(Pagination.pageRange(1, 24)).toEqual([1, 2, 3, 4, 5, 'ellipsis-end', 24]);
    expect(Pagination.pageRange(7, 24)).toEqual([1, 'ellipsis-start', 6, 7, 8, 'ellipsis-end', 24]);
    expect(Pagination.pageRange(24, 24)).toEqual([1, 'ellipsis-start', 20, 21, 22, 23, 24]);
  });
});

describe('Pagination', () => {
  it('lays itself out and moves between pages', async () => {
    const onPageChange = vi.fn<(p: number) => void>();
    render(<Pagination.Root count={24} defaultPage={7} onPageChange={onPageChange} />);
    expect(screen.getByRole('navigation', { name: 'Pagination' }).className).toBe(
      'hj-pagination-root',
    );
    const current = screen.getByRole('button', { name: 'Page 7' });
    expect(current.getAttribute('aria-current')).toBe('page');
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onPageChange).toHaveBeenLastCalledWith(8);
    expect(screen.getByRole('button', { name: 'Page 8' }).getAttribute('aria-current')).toBe(
      'page',
    );
  });

  it('disables Previous on the first page but keeps it focusable', async () => {
    const onPageChange = vi.fn<(p: number) => void>();
    render(<Pagination.Root count={3} onPageChange={onPageChange} />);
    const prev = screen.getByRole('button', { name: 'Previous' });
    expect(prev.getAttribute('aria-disabled')).toBe('true');
    await userEvent.click(prev);
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('compact shows the summary; getHref renders links', () => {
    render(
      <>
        <Pagination.Root count={12} defaultPage={3} variant="compact" aria-label="A" />
        <Pagination.Root count={3} getHref={(p) => `/p/${p}`} aria-label="B" />
      </>,
    );
    expect(screen.getByText('3 of 12')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Page 2' }).getAttribute('href')).toBe('/p/2');
  });
});

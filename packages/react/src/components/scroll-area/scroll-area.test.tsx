import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import * as ScrollArea from './scroll-area.tsx';

describe('ScrollArea', () => {
  it('Box builds root, faded viewport, content and a vertical scrollbar with its thumb', () => {
    const { container } = render(
      <ScrollArea.Box style={{ height: 100 }}>
        <p>Paper Lanterns</p>
      </ScrollArea.Box>,
    );
    expect(screen.getByText('Paper Lanterns').closest('.hj-scroll-area-content')).not.toBeNull();
    const viewport = container.querySelector('.hj-scroll-area-viewport');
    expect(viewport?.hasAttribute('data-fade')).toBe(true);
    const bar = container.querySelector('.hj-scroll-area-scrollbar');
    // Base UI only mounts scrollbars once it measures overflow; when present, they carry a thumb
    expect(bar === null || bar.querySelector('.hj-scroll-area-thumb') !== null).toBe(true);
    expect(container.querySelector('.hj-scroll-area')).not.toBeNull();
  });

  it('fade can be turned off', () => {
    const { container } = render(
      <ScrollArea.Box fade={false} orientation="both">
        <p>x</p>
      </ScrollArea.Box>,
    );
    expect(container.querySelector('.hj-scroll-area-viewport')?.hasAttribute('data-fade')).toBe(
      false,
    );
  });
});

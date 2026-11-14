import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import * as Toolbar from './toolbar.tsx';

describe('Toolbar', () => {
  it('renders a toolbar with hanji classes and the surface variant', () => {
    render(
      <Toolbar.Root aria-label="Formatting">
        <Toolbar.Button>Insert link</Toolbar.Button>
        <Toolbar.Separator />
        <Toolbar.Input aria-label="Font size" defaultValue="15" />
      </Toolbar.Root>,
    );
    const bar = screen.getByRole('toolbar', { name: 'Formatting' });
    expect(bar.className).toBe('hj-toolbar-root');
    expect(bar.getAttribute('data-variant')).toBe('surface');
    expect(screen.getByRole('button', { name: 'Insert link' }).className).toBe('hj-toolbar-button');
  });

  it('Toggle stays pressed and reports it', async () => {
    render(
      <Toolbar.Root aria-label="Style">
        <Toolbar.Toggle aria-label="Bold" iconOnly>
          B
        </Toolbar.Toggle>
      </Toolbar.Root>,
    );
    const bold = screen.getByRole('button', { name: 'Bold' });
    expect(bold.getAttribute('aria-pressed')).toBe('false');
    expect(bold.hasAttribute('data-icon-only')).toBe(true);
    await userEvent.click(bold);
    expect(bold.getAttribute('aria-pressed')).toBe('true');
    expect(bold.hasAttribute('data-pressed')).toBe(true);
  });
});

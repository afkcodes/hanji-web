import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button, HanjiProvider } from '../../index.ts';

describe('Button', () => {
  it('renders a native button with hanji class and variant hooks', () => {
    render(
      <Button variant="ink" size="sm">
        Publish
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'Publish' });
    expect(btn.tagName).toBe('BUTTON');
    expect(btn).toHaveProperty('className', 'hj-button');
    expect(btn.getAttribute('data-variant')).toBe('ink');
    expect(btn.getAttribute('data-size')).toBe('sm');
  });

  it('loading: busy, focusable, ignores presses', async () => {
    const onClick = vi.fn<() => void>();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'Save' });
    expect(btn.getAttribute('aria-busy')).toBe('true');
    expect(btn.hasAttribute('data-loading')).toBe(true);
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
    btn.focus();
    expect(document.activeElement).toBe(btn);
  });

  it('merges provider defaults, slot classes and the call-site class', () => {
    render(
      <HanjiProvider defaults={{ Button: { size: 'lg' } }} classNames={{ Button: 'brand-btn' }}>
        <Button className="mine">Go</Button>
      </HanjiProvider>,
    );
    const btn = screen.getByRole('button', { name: 'Go' });
    expect(btn.getAttribute('data-size')).toBe('lg');
    expect(btn.className).toBe('hj-button brand-btn mine');
  });

  it('unstyled drops hanji classes but keeps data hooks', () => {
    render(
      <HanjiProvider unstyled>
        <Button>Go</Button>
      </HanjiProvider>,
    );
    const btn = screen.getByRole('button', { name: 'Go' });
    expect(btn.className).toBe('');
    expect(btn.getAttribute('data-variant')).toBe('primary');
  });

  it('className as a function of state still gets hanji’s class', () => {
    render(
      <Button disabled className={(s) => (s.disabled ? 'off' : 'on')}>
        Go
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Go' }).className).toBe('hj-button off');
  });
});

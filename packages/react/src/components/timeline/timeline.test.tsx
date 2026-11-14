import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Item, Root, Time, Title } from './timeline.tsx';

describe('Timeline', () => {
  it('is an ordered list whose steps announce their status in words', () => {
    render(
      <Root aria-label="Export">
        <Item status="done">
          <Title>Collected</Title>
        </Item>
        <Item status="failed">
          <Title>Upload</Title>
        </Item>
        <Item status="current">
          <Title>Waiting</Title>
        </Item>
      </Root>,
    );
    const list = screen.getByRole('list', { name: 'Export' });
    expect(list.tagName).toBe('OL');
    const items = screen.getAllByRole('listitem');
    expect(items.map((i) => i.getAttribute('data-status'))).toEqual(['done', 'failed', 'current']);
    expect(items[1]?.textContent).toContain('Failed:');
    expect(items[2]?.getAttribute('aria-current')).toBe('step');
    expect(items[0]?.querySelector('.hj-timeline-marker')?.getAttribute('aria-hidden')).toBe(
      'true',
    );
  });

  it('time renders a <time> and the relative phrase', () => {
    render(
      <Time dateTime="2026-11-14T21:12" relative="6 min ago">
        21:12
      </Time>,
    );
    const t = document.querySelector('time');
    expect(t?.getAttribute('dateTime')).toBe('2026-11-14T21:12');
    expect(screen.getByText(/6 min ago/)).toBeTruthy();
  });

  it('statusLabel localises the announced status', () => {
    render(
      <Root>
        <Item status="done" statusLabel="Terminé">
          <Title>Export</Title>
        </Item>
      </Root>,
    );
    expect(screen.getByRole('listitem').textContent).toContain('Terminé:');
  });
});

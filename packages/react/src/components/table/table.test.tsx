import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Body, Cell, Empty, Head, Header, Loading, Root, Row } from './table.tsx';

describe('Table', () => {
  it('a scroll container around a labelled table; numeric cells align end', () => {
    render(
      <Root aria-label="Plays" className="mine">
        <Header>
          <Row>
            <Head>Track</Head>
            <Head numeric>Plays</Head>
          </Row>
        </Header>
        <Body>
          <Row selected>
            <Cell>Night Bus Home</Cell>
            <Cell numeric>37</Cell>
          </Row>
        </Body>
      </Root>,
    );
    const table = screen.getByRole('table', { name: 'Plays' });
    expect(table.className).toBe('hj-table-element');
    expect(table.parentElement?.className).toBe('hj-table mine');
    expect(table.parentElement?.hasAttribute('data-sticky')).toBe(true);
    expect(screen.getByRole('columnheader', { name: 'Track' }).getAttribute('scope')).toBe('col');
    expect(screen.getByRole('cell', { name: '37' }).getAttribute('data-align')).toBe('end');
    expect(screen.getByRole('row', { name: /Night Bus/ }).getAttribute('aria-selected')).toBe(
      'true',
    );
  });

  it('sortable headers are buttons and the th carries aria-sort', async () => {
    const onSort = vi.fn<() => void>();
    render(
      <Root aria-label="t">
        <Header>
          <Row>
            <Head numeric sort="descending" onSort={onSort}>
              Plays
            </Head>
          </Row>
        </Header>
      </Root>,
    );
    const th = screen.getByRole('columnheader');
    expect(th.getAttribute('aria-sort')).toBe('descending');
    await userEvent.click(screen.getByRole('button', { name: 'Plays' }));
    expect(onSort).toHaveBeenCalledTimes(1);
  });

  it('empty and loading rows', () => {
    render(
      <Root aria-label="t">
        <Body>
          <Empty colSpan={3}>Nothing here</Empty>
          <Loading columns={3} rows={2} />
        </Body>
      </Root>,
    );
    expect(screen.getByRole('cell', { name: 'Nothing here' }).getAttribute('colspan')).toBe('3');
    expect(screen.getByText('Loading')).toBeTruthy();
    expect(document.querySelectorAll('.hj-table-loading')).toHaveLength(2);
  });
});

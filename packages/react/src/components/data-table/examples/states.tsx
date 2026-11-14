import { Button, DataTable, EmptyState } from '@hanji/react';
import type { DataTableColumn } from '@hanji/react';
import * as React from 'react';

type Payout = { id: string; date: string; payee: string; reference: string; amount: number };

const columns: DataTableColumn<Payout>[] = [
  { id: 'date', header: 'Date', width: 120, value: (p) => p.date },
  {
    id: 'payee',
    header: 'Payee',
    minWidth: 160,
    flex: 1.4,
    rowHeader: true,
    value: (p) => p.payee,
  },
  { id: 'reference', header: 'Reference', minWidth: 140, value: (p) => p.reference },
  {
    id: 'amount',
    header: 'Amount',
    width: 128,
    numeric: true,
    value: (p) => p.amount,
    cell: (p) => `£${p.amount.toFixed(2)}`,
  },
];
const NONE: Payout[] = [];

export function Example(): React.JSX.Element {
  const [query, setQuery] = React.useState('Brandt');
  return (
    <div style={{ display: 'grid', gap: 40, width: 'min(100%, 720px)' }}>
      <DataTable.Root
        aria-label="Payouts, loading"
        rows={NONE}
        columns={columns}
        loading
        loadingRows={4}
      />
      <DataTable.Root
        aria-label="Payouts"
        rows={NONE}
        columns={columns}
        selectable
        empty={
          <EmptyState.Root variant="no-results" style={{ paddingBlock: 8 }}>
            <EmptyState.Glyph />
            <EmptyState.Title>
              {query ? `No payouts to “${query}”` : 'No payouts yet'}
            </EmptyState.Title>
            <EmptyState.Description>
              {query
                ? 'Nothing this quarter matches. Check the name, or search every quarter.'
                : 'Payouts you send will be listed here.'}
            </EmptyState.Description>
            {query ? (
              <EmptyState.Actions>
                <Button size="sm" variant="secondary" onClick={() => setQuery('')}>
                  Clear search
                </Button>
              </EmptyState.Actions>
            ) : null}
          </EmptyState.Root>
        }
      />
    </div>
  );
}

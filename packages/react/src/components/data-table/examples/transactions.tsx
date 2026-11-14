import { DataTable, Status } from '@hanji/react';
import type { DataTableColumn, StatusTone } from '@hanji/react';
import * as React from 'react';

type State = 'settled' | 'pending' | 'failed' | 'refunded';
type Txn = {
  id: string;
  at: Date;
  counterparty: string;
  reference: string;
  state: State;
  /** Minor units; negative is money out. */
  amount: number;
  currency: 'GBP' | 'EUR';
};

/* Ten thousand invented transactions, the same every time (a seeded generator). */
const PAYEES: readonly [string, string, number][] = [
  ['Kestrel Freight', 'INV', -1],
  ['Harbour & Finch Coffee', 'Card', -1],
  ['Northlight Studio', 'INV', -1],
  ['Mira Okafor', 'Consulting', 1],
  ['Brandt Architekten', 'Rechnung', 1],
  ['Saltmarsh Ceramics', 'Order', 1],
  ['Jun-seo Park', 'Expenses', -1],
  ['Tomás Reyes Joinery', 'INV', -1],
  ['Sato & Haddad LLP', 'Retainer', -1],
  ['Quayside Lettings', 'Rent', -1],
  ['Malhotra Print Co.', 'INV', -1],
  ['Fernway Utilities', 'DD', -1],
  ['Aiko Sato', 'Refund', 1],
  ['Little Dock Bakery', 'Order', 1],
];
function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const TXNS: Txn[] = (() => {
  const rand = seeded(42);
  const out: Txn[] = [];
  let t = Date.UTC(2026, 10, 14, 17, 20);
  for (let i = 0; i < 10_000; i++) {
    t -= Math.floor(rand() * 25 + 3) * 60_000;
    const [name, ref, sign] = PAYEES[Math.floor(rand() * PAYEES.length)] as [
      string,
      string,
      number,
    ];
    const r = rand();
    // today's payments are still clearing, and one bounced; further back, the odd failure
    const state: State =
      i === 4
        ? 'failed'
        : i < 6 && r < 0.6
          ? 'pending'
          : r < 0.004
            ? 'failed'
            : r < 0.02
              ? 'refunded'
              : 'settled';
    const size = rand() < 0.15 ? 250_000 : 18_000;
    out.push({
      id: `tx_${(10_000 - i).toString(36).padStart(4, '0')}`,
      at: new Date(t),
      counterparty: name,
      reference: `${ref} ${Math.floor(rand() * 9000 + 1000)}`,
      state,
      amount: sign * Math.round(rand() * size + 120),
      currency: rand() < 0.22 ? 'EUR' : 'GBP',
    });
  }
  return out;
})();

const STATUS: Record<State, [StatusTone, string]> = {
  settled: ['neutral', 'Settled'],
  pending: ['pending', 'Pending'],
  failed: ['danger', 'Failed'],
  refunded: ['info', 'Refunded'],
};
const money = {
  GBP: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }),
  EUR: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR' }),
};
const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const time = new Intl.DateTimeFormat('en-GB', { timeStyle: 'short', timeZone: 'UTC' });

function Amount({ t }: { t: Txn }): React.JSX.Element {
  const text = money[t.currency].format(Math.abs(t.amount) / 100);
  return (
    <span
      style={{
        color:
          t.state === 'failed'
            ? 'var(--hj-fg-mute)'
            : t.amount > 0
              ? 'var(--hj-success)'
              : 'var(--hj-fg)',
        textDecoration: t.state === 'failed' ? 'line-through' : undefined,
      }}
    >
      {t.amount < 0 ? '−' : '+'}
      {text}
    </span>
  );
}

const columns: DataTableColumn<Txn>[] = [
  {
    id: 'date',
    header: 'Date',
    width: 132,
    sortable: true,
    value: (t) => t.at,
    cell: (t) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {day.format(t.at)}
        <span style={{ color: 'var(--hj-fg-mute)' }}> · {time.format(t.at)}</span>
      </span>
    ),
  },
  {
    id: 'counterparty',
    header: 'Counterparty',
    minWidth: 180,
    flex: 1.4,
    rowHeader: true,
    sortable: true,
    value: (t) => t.counterparty,
    cell: (t) => <span style={{ fontWeight: 500 }}>{t.counterparty}</span>,
  },
  {
    id: 'reference',
    header: 'Reference',
    minWidth: 140,
    value: (t) => t.reference,
    cell: (t) => <span style={{ color: 'var(--hj-fg-mute)' }}>{t.reference}</span>,
  },
  {
    id: 'status',
    header: 'Status',
    width: 132,
    sortable: true,
    value: (t) => STATUS[t.state][1],
    cell: (t) => {
      const [tone, word] = STATUS[t.state];
      // only failures get a tint: pending breathes in place, settled is the quiet default
      return (
        <Status tone={tone} variant={t.state === 'failed' ? 'tint' : 'plain'}>
          {word}
        </Status>
      );
    },
  },
  {
    id: 'amount',
    header: 'Amount',
    width: 148,
    numeric: true,
    sortable: true,
    // pounds and euros sort by face value
    value: (t) => t.amount,
    cell: (t) => <Amount t={t} />,
  },
];

const getId = (t: Txn): string => t.id;

export function Example(): React.JSX.Element {
  const [opened, setOpened] = React.useState<Txn | null>(null);
  return (
    <div style={{ display: 'grid', gap: 12, width: 'min(100%, 880px)' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: '4px 16px',
        }}
      >
        <h4 id="txn-title" style={{ margin: 0, fontSize: 15, letterSpacing: '-0.01em' }}>
          Main account · 10,000 transactions
        </h4>
        <span style={{ fontSize: 13, color: 'var(--hj-fg-mute)' }} aria-live="polite">
          {opened
            ? `Opened ${opened.counterparty}, ${opened.reference}`
            : 'Click a row or press Enter to open it'}
        </span>
      </div>
      <DataTable.Root
        // the header's ground once rows pass under it: match the surface it sits on
        style={{ '--hj-data-table-header-bg': 'var(--hj-bg-soft)' } as React.CSSProperties}
        aria-labelledby="txn-title"
        rows={TXNS}
        columns={columns}
        getRowId={getId}
        defaultSort={{ column: 'date', direction: 'descending' }}
        onRowAction={setOpened}
      />
    </div>
  );
}

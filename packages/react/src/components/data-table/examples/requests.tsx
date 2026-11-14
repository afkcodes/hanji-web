import { Button, DataTable, Status } from '@hanji/react';
import type { DataTableActions, DataTableColumn, StatusTone } from '@hanji/react';
import * as React from 'react';

type State = 'open' | 'waiting' | 'solved' | 'escalated';
type Request = {
  id: string;
  no: number;
  summary: string;
  requester: string;
  state: State;
  /** Hours since the last reply. */
  updated: number;
};

/* Summaries from one line to three, so rows grow to fit and virtua measures each. */
const SUMMARIES = [
  'Card declined at checkout',
  'Export to CSV drops the time zone on every date after the clocks changed, so the March report is an hour out for anything after the 30th.',
  'Can’t add a second director',
  'Invoice INV-5389 shows the old address',
  'Two-factor codes arrive late on the train — sometimes after they have expired. Happens on two phones, both on the same network.',
  'Request to close the Euro account and move the remaining balance into the main account before the end of the quarter.',
  'Statement PDF won’t open on iPad',
  'Payee name check says “close match” for a supplier we have paid every month for three years',
];
const PEOPLE = [
  'Mira Okafor',
  'Jun-seo Park',
  'Ilse Brandt',
  'Tomás Reyes',
  'Aiko Sato',
  'Dev Malhotra',
  'Noor Haddad',
];
const STATES: State[] = ['open', 'waiting', 'open', 'solved', 'solved', 'escalated', 'solved'];
const COUNT = 2_000;

const REQUESTS: Request[] = Array.from({ length: COUNT }, (_, i) => ({
  id: `req-${i}`,
  no: 4_812 - i,
  summary: SUMMARIES[(i * 5) % SUMMARIES.length] as string,
  requester: PEOPLE[(i * 3) % PEOPLE.length] as string,
  state: STATES[i % STATES.length] as State,
  updated: Math.floor(i * 1.7) + (i % 3),
}));

const STATUS: Record<State, [StatusTone, string]> = {
  open: ['info', 'Open'],
  waiting: ['pending', 'Waiting on you'],
  solved: ['neutral', 'Solved'],
  escalated: ['danger', 'Escalated'],
};

function ago(h: number): string {
  if (h < 1) return 'Just now';
  if (h < 24) return `${h} h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'Yesterday' : `${d} days ago`;
}

const columns: DataTableColumn<Request>[] = [
  {
    id: 'no',
    header: 'No.',
    width: 84,
    numeric: true,
    sortable: true,
    value: (r) => r.no,
    cell: (r) => `#${r.no}`,
  },
  {
    id: 'summary',
    header: 'Summary',
    minWidth: 260,
    flex: 2.4,
    rowHeader: true,
    value: (r) => r.summary,
  },
  {
    id: 'requester',
    header: 'Requester',
    minWidth: 140,
    sortable: true,
    value: (r) => r.requester,
  },
  {
    id: 'state',
    header: 'Status',
    width: 156,
    sortable: true,
    value: (r) => STATUS[r.state][1],
    cell: (r) => {
      const [tone, word] = STATUS[r.state];
      return (
        <Status tone={tone} variant={r.state === 'escalated' ? 'tint' : 'plain'}>
          {word}
        </Status>
      );
    },
  },
  {
    id: 'updated',
    header: 'Updated',
    width: 116,
    align: 'end',
    sortable: true,
    value: (r) => -r.updated,
    cell: (r) => ago(r.updated),
  },
];

const getId = (r: Request): string => r.id;

export function Example(): React.JSX.Element {
  const titleId = React.useId();
  const actions = React.useRef<DataTableActions>(null);
  return (
    <div style={{ display: 'grid', gap: 12, width: 'min(100%, 880px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <h4 id={titleId} style={{ flex: 1, margin: 0, fontSize: 15, letterSpacing: '-0.01em' }}>
          Support requests · {COUNT.toLocaleString()}
        </h4>
        <Button size="sm" variant="secondary" onClick={() => actions.current?.scrollToIndex(0)}>
          Newest
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => actions.current?.scrollToIndex(1_499, { align: 'start' })}
        >
          No. 1,500 down
        </Button>
      </div>
      <DataTable.Root
        style={
          {
            height: 440,
            '--hj-data-table-header-bg': 'var(--hj-bg-soft)',
          } as React.CSSProperties
        }
        aria-labelledby={titleId}
        rows={REQUESTS}
        columns={columns}
        getRowId={getId}
        rowHeight="auto"
        actionsRef={actions}
      />
    </div>
  );
}

import { List, Status, SwipeActions, Text } from '@hanji/react';
import * as React from 'react';

// Not in the icon adapter: a bin and a paper plane, on hanji's 24 grid at 1.5 stroke.
const TRASH =
  'M4 6.5h16M9.5 6.5v-2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2M6.5 6.5l.8 12.1a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9l.8-12.1M10 10.5v6M14 10.5v6';
const SEND = 'M20.5 3.5 10 14M20.5 3.5l-6.5 17-4-6.5-6.5-4 17-6.5Z';

function Glyph({ d }: { d: string }): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

type State = 'draft' | 'submitted' | 'approved';

interface Claim {
  id: string;
  title: string;
  amount: string;
  state: State;
  note: string;
}

const CLAIMS: Claim[] = [
  {
    id: 'c1',
    title: 'Team dinner, Lisbon offsite',
    amount: '€412.60',
    state: 'submitted',
    note: 'Locked until Noor Haddad approves',
  },
  {
    id: 'c2',
    title: 'Train to Rotterdam',
    amount: '€86.00',
    state: 'draft',
    note: 'Receipt attached',
  },
  {
    id: 'c3',
    title: 'Hotel, 2 nights in Porto',
    amount: '€318.00',
    state: 'approved',
    note: 'Paid out 8 Nov',
  },
];

const STATUS = {
  draft: { tone: 'neutral', word: 'Draft' },
  submitted: { tone: 'pending', word: 'Submitted' },
  approved: { tone: 'success', word: 'Approved' },
} as const;

export function Example(): React.JSX.Element {
  const [claims, setClaims] = React.useState(CLAIMS);
  const submit = (id: string): void =>
    setClaims((list) =>
      list.map((c) =>
        c.id === id ? { ...c, state: 'submitted', note: 'Locked until Noor Haddad approves' } : c,
      ),
    );
  const duplicate = (c: Claim): void =>
    setClaims((list) => [
      ...list,
      {
        ...c,
        id: `${c.id}-copy-${list.length}`,
        title: `${c.title} (copy)`,
        state: 'draft',
        note: 'No receipt yet',
      },
    ]);
  const remove = (id: string): void => setClaims((list) => list.filter((c) => c.id !== id));

  return (
    <div
      style={{
        width: 'min(100%, 420px)',
        borderRadius: 'var(--hj-radius-lg)',
        background: 'var(--hj-surface)',
        border: '1px solid var(--hj-line)',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '16px 16px 8px' }}>
        <Text variant="heading" style={{ flex: 1 }}>
          Expenses
        </Text>
        <Text variant="sub" tone="mute">
          Dev Malhotra · November
        </Text>
      </div>
      <SwipeActions.Group
        aria-label="Expense claims"
        style={{ ['--hj-swipe-actions-bg' as string]: 'var(--hj-surface)' }}
      >
        {claims.map((c) => {
          const s = STATUS[c.state];
          return (
            <SwipeActions.Root
              key={c.id}
              label={c.title}
              // a submitted claim is with the approver: nothing to do here until it comes back
              disabled={c.state === 'submitted'}
            >
              {c.state === 'draft' ? (
                <SwipeActions.Leading fullSwipe>
                  <SwipeActions.Action
                    tone="accent"
                    icon={<Glyph d={SEND} />}
                    onAction={() => submit(c.id)}
                  >
                    Submit
                  </SwipeActions.Action>
                </SwipeActions.Leading>
              ) : null}
              <SwipeActions.Content>
                <List.Content>
                  <List.Title>{c.title}</List.Title>
                  <List.Description>
                    <Status tone={s.tone} variant="plain">
                      {s.word}
                    </Status>
                    · {c.note}
                  </List.Description>
                </List.Content>
                <List.Value>{c.amount}</List.Value>
              </SwipeActions.Content>
              <SwipeActions.Trailing>
                <SwipeActions.Action tone="neutral" icon="copy" onAction={() => duplicate(c)}>
                  Copy
                </SwipeActions.Action>
                <SwipeActions.Action
                  tone="danger"
                  icon={<Glyph d={TRASH} />}
                  removes
                  // paid out: the record has to stay
                  disabled={c.state === 'approved'}
                  onAction={() => remove(c.id)}
                >
                  Delete
                </SwipeActions.Action>
              </SwipeActions.Trailing>
            </SwipeActions.Root>
          );
        })}
      </SwipeActions.Group>
    </div>
  );
}

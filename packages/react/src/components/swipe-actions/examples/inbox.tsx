import { Icon, List, SwipeActions, Text, Toast, useToast } from '@hanji/react';
import * as React from 'react';

// Glyphs the icon adapter doesn't carry, drawn on hanji's 24 grid at 1.5 stroke.
const ARCHIVE =
  'M4 4.5h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1ZM4.5 8.5V18a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8.5M10 12.5h4';
const FLAG = 'M5 21V4.5M5 4.5h12l-2.5 4 2.5 4H5';
const ENVELOPE =
  'M4 5.5h16a1 1 0 0 1 1 1V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6.5a1 1 0 0 1 1-1ZM3.5 6.5l8.5 6.5 8.5-6.5';

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

interface Message {
  id: string;
  from: string;
  initials: string;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
  flagged: boolean;
  bounced?: boolean;
}

const INBOX: Message[] = [
  {
    id: 'q3',
    from: 'Ilse Brandt',
    initials: 'IB',
    subject: 'Quarterly numbers',
    preview: 'Revenue is up 12%. Deck attached — can you check slide 4 before Thursday?',
    time: '9:41',
    unread: true,
    flagged: false,
  },
  {
    id: 'studio',
    from: 'Jun-seo Park',
    initials: 'JP',
    subject: 'Re: Studio booking',
    preview: 'Room B is free from two. I’ll bring the cables and the second mic.',
    time: '9:12',
    unread: true,
    flagged: true,
  },
  {
    id: 'deposit',
    from: 'Dev Malhotra',
    initials: 'DM',
    subject: 'Venue deposit',
    preview: 'Your reply couldn’t be delivered — the mailbox is full.',
    time: '8:30',
    unread: false,
    flagged: false,
    bounced: true,
  },
  {
    id: 'contract',
    from: 'Noor Haddad',
    initials: 'NH',
    subject: 'Contract — final draft',
    preview: 'Legal signed off on clause 7. One small change to the payment terms.',
    time: 'Yesterday',
    unread: false,
    flagged: false,
  },
  {
    id: 'flight',
    from: 'Tomás Reyes',
    initials: 'TR',
    subject: 'Flight change: LIS → BER',
    preview: 'Your 18:05 departure now leaves at 19:40. Seat 14C is kept.',
    time: 'Mon',
    unread: false,
    flagged: false,
  },
];

function Inbox(): React.JSX.Element {
  const toast = useToast();
  const [messages, setMessages] = React.useState(INBOX);
  const toggle = (id: string, key: 'unread' | 'flagged'): void =>
    setMessages((list) => list.map((m) => (m.id === id ? { ...m, [key]: !m[key] } : m)));
  const archive = (m: Message): void => {
    const at = messages.findIndex((x) => x.id === m.id);
    setMessages((list) => list.filter((x) => x.id !== m.id));
    toast.show({
      title: 'Archived',
      description: m.subject,
      action: {
        label: 'Undo',
        onClick: () =>
          setMessages((list) =>
            list.some((x) => x.id === m.id)
              ? list
              : list.toSpliced(Math.min(at, list.length), 0, m),
          ),
      },
    });
  };
  const unread = messages.filter((m) => m.unread).length;

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
          Inbox
        </Text>
        <Text variant="sub" tone="mute">
          {unread ? `${unread} unread` : 'All read'}
        </Text>
      </div>
      {messages.length === 0 ? (
        <Text tone="mute" style={{ padding: '24px 16px 32px', textAlign: 'center' }}>
          Nothing left in the inbox.
        </Text>
      ) : null}
      <SwipeActions.Group
        aria-label="Inbox"
        style={{
          ['--hj-swipe-actions-bg' as string]: 'var(--hj-surface)',
          ['--hj-swipe-actions-inset' as string]: '68px',
        }}
      >
        {messages.map((m) => (
          <SwipeActions.Root key={m.id} label={`${m.subject}, ${m.from}`}>
            <SwipeActions.Leading fullSwipe>
              <SwipeActions.Action
                tone="info"
                icon={m.unread ? 'check' : <Glyph d={ENVELOPE} />}
                onAction={() => toggle(m.id, 'unread')}
              >
                {m.unread ? 'Read' : 'Unread'}
              </SwipeActions.Action>
            </SwipeActions.Leading>
            <SwipeActions.Content>
              <List.Leading variant="avatar">{m.initials}</List.Leading>
              <List.Content>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {m.unread ? (
                    <span
                      style={{
                        flex: 'none',
                        width: 8,
                        height: 8,
                        borderRadius: 99,
                        background: 'var(--hj-accent)',
                      }}
                    >
                      <span className="hj-sr-only">Unread, </span>
                    </span>
                  ) : null}
                  <List.Title style={{ flex: 1, fontWeight: m.unread ? 650 : 500 }}>
                    {m.from}
                  </List.Title>
                  {m.flagged ? (
                    <span style={{ display: 'inline-flex', color: 'var(--hj-warning)' }}>
                      <span className="hj-icon" style={{ fontSize: 14 }}>
                        <Glyph d={FLAG} />
                      </span>
                      <span className="hj-sr-only">Flagged</span>
                    </span>
                  ) : null}
                  <Text variant="sub" tone="mute" render={<span />}>
                    {m.time}
                  </Text>
                </span>
                <Text variant="sub" style={{ fontWeight: 600, color: 'var(--hj-fg)' }} truncate>
                  {m.subject}
                </Text>
                {m.bounced ? (
                  <List.Description style={{ color: 'var(--hj-danger)' }}>
                    <Icon name="alert" /> {m.preview}
                  </List.Description>
                ) : (
                  <List.Description>{m.preview}</List.Description>
                )}
              </List.Content>
            </SwipeActions.Content>
            <SwipeActions.Trailing fullSwipe>
              <SwipeActions.Action
                tone="warning"
                icon={<Glyph d={FLAG} />}
                onAction={() => toggle(m.id, 'flagged')}
              >
                {m.flagged ? 'Unflag' : 'Flag'}
              </SwipeActions.Action>
              <SwipeActions.Action
                tone="success"
                icon={<Glyph d={ARCHIVE} />}
                removes
                onAction={() => archive(m)}
              >
                Archive
              </SwipeActions.Action>
            </SwipeActions.Trailing>
          </SwipeActions.Root>
        ))}
      </SwipeActions.Group>
    </div>
  );
}

export function Example(): React.JSX.Element {
  return (
    <Toast.Provider>
      <Inbox />
      <Toast.Viewport />
    </Toast.Provider>
  );
}

import { Avatar, Button, DataTable, Status } from '@hanji/react';
import type { DataTableColumn, DataTableRowId } from '@hanji/react';
import * as React from 'react';

type Role = 'Owner' | 'Admin' | 'Member' | 'Viewer';
type Member = {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** Days since last active; null = invited, never signed in. */
  lastActive: number | null;
  twoFactor: boolean;
};

const PEOPLE: [string, Role, number | null, boolean][] = [
  ['Mira Okafor', 'Owner', 0, true],
  ['Jun-seo Park', 'Admin', 0, true],
  ['Ilse Brandt', 'Admin', 2, true],
  ['Tomás Reyes', 'Member', 1, false],
  ['Aiko Sato', 'Member', 0, true],
  ['Dev Malhotra', 'Member', 6, true],
  ['Noor Haddad', 'Member', 13, false],
  ['Kofi Mensah', 'Member', 3, true],
  ['Léa Fontaine', 'Viewer', 41, false],
  ['Rafael Duarte', 'Viewer', null, false],
  ['Hana Kowalczyk', 'Member', 1, true],
  ['Sipho Ndlovu', 'Viewer', null, false],
];
/** “Tomás Reyes” → tomas-reyes */
const slug = (name: string): string =>
  name.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replaceAll(' ', '-');
const MEMBERS: Member[] = PEOPLE.map(([name, role, lastActive, twoFactor]) => ({
  id: slug(name),
  name,
  email: `${slug(name).split('-')[0]}@fernway.studio`,
  role,
  lastActive,
  twoFactor,
}));

const RANK: Record<Role, number> = { Owner: 0, Admin: 1, Member: 2, Viewer: 3 };
const seen = (days: number | null): string =>
  days === null ? 'Invited' : days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago`;

const columns: DataTableColumn<Member>[] = [
  {
    id: 'name',
    header: 'Name',
    minWidth: 200,
    flex: 1.6,
    rowHeader: true,
    sortable: true,
    value: (m) => m.name,
    cell: (m) => (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <Avatar.Root name={m.name} size={24} aria-hidden />
        <span style={{ fontWeight: 500 }}>{m.name}</span>
      </span>
    ),
  },
  {
    id: 'email',
    header: 'Email',
    minWidth: 180,
    flex: 1.4,
    value: (m) => m.email,
    cell: (m) => <span style={{ color: 'var(--hj-fg-dim)' }}>{m.email}</span>,
  },
  {
    id: 'role',
    header: 'Role',
    width: 112,
    sortable: true,
    // by rank, not alphabet: Owner, Admin, Member, Viewer
    compare: (a, b) => RANK[a.role] - RANK[b.role],
    value: (m) => m.role,
  },
  {
    id: 'twoFactor',
    header: 'Two-factor',
    width: 128,
    sortable: true,
    value: (m) => m.twoFactor,
    cell: (m) =>
      m.twoFactor ? (
        <Status tone="success" variant="plain">
          On
        </Status>
      ) : (
        <Status tone="warning" variant="plain">
          Off
        </Status>
      ),
  },
  {
    id: 'lastActive',
    header: 'Last active',
    width: 128,
    align: 'end',
    sortable: true,
    value: (m) => m.lastActive,
    cell: (m) => (
      <span style={{ color: m.lastActive === null ? 'var(--hj-fg-mute)' : undefined }}>
        {seen(m.lastActive)}
      </span>
    ),
  },
];

const getId = (m: Member): string => m.id;

export function Example(): React.JSX.Element {
  const [selected, setSelected] = React.useState<ReadonlySet<DataTableRowId>>(
    () => new Set(['tomas-reyes', 'noor-haddad', 'lea-fontaine']),
  );
  const n = selected.size;
  return (
    <div style={{ display: 'grid', gap: 12, width: 'min(100%, 820px)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          minHeight: 34,
        }}
      >
        <span
          aria-live="polite"
          style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
        >
          {n ? `${n} selected` : `${MEMBERS.length} members`}
        </span>
        {n ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="sm" variant="quiet" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
            <Button size="sm" variant="secondary">
              Change role
            </Button>
            <Button size="sm" variant="danger">
              Remove {n === 1 ? 'member' : `${n} members`}
            </Button>
          </div>
        ) : (
          <Button size="sm">Invite people</Button>
        )}
      </div>
      <DataTable.Root
        style={{ '--hj-data-table-header-bg': 'var(--hj-bg-soft)' } as React.CSSProperties}
        aria-label="Members of Fernway Studio"
        rows={MEMBERS}
        columns={columns}
        getRowId={getId}
        selectable
        selected={selected}
        onSelectedChange={setSelected}
      />
    </div>
  );
}

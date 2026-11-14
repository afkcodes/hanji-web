import { Icon, ProgressRing } from '@hanji/react';

const rows = [
  {
    title: 'Paper Cranes',
    sub: '12 songs · 214 MB',
    value: 64 as number | null,
    tone: 'accent' as const,
  },
  { title: 'Seoul, 4 a.m.', sub: 'Waiting for Wi-Fi', value: null, tone: 'fg' as const },
  { title: 'Quiet Machines', sub: '17 songs · Downloaded', value: 100, tone: 'accent' as const },
];

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'grid', width: 'min(100%, 380px)' }}>
      {rows.map((r) => (
        <div
          key={r.title}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            minHeight: 56,
            borderBottom: '1px solid var(--hj-line)',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, fontSize: 15 }}>{r.title}</div>
            <div style={{ fontSize: 12.5, color: 'var(--hj-fg-mute)' }}>{r.sub}</div>
          </div>
          <ProgressRing.Root
            value={r.value}
            tone={r.tone}
            size="sm"
            aria-label={`${r.title} download`}
          >
            {r.value === 100 ? <Icon name="check" size={12} /> : undefined}
          </ProgressRing.Root>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 16, marginTop: 20, alignItems: 'center' }}>
        <ProgressRing.Root value={0} aria-label="Not started" />
        <ProgressRing.Root value={38} aria-label="Uploading" />
        <ProgressRing.Root value={null} aria-label="Preparing" />
        <ProgressRing.Root value={88} tone="danger" aria-label="Storage" />
      </div>
    </div>
  );
}

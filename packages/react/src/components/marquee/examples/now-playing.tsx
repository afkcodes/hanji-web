import { Marquee } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'grid', gap: 24, width: 260 }}>
      <div>
        <Marquee style={{ fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em' }}>
          The Long Way Round the Harbour (Live at Saltmarsh Hall, 2025)
        </Marquee>
        <div style={{ fontSize: 14, color: 'var(--hj-fg-dim)' }}>Ilse Brandt · Saltmarsh</div>
      </div>
      <div>
        <Marquee style={{ fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em' }}>
          Night Bus Home
        </Marquee>
        <div style={{ fontSize: 14, color: 'var(--hj-fg-dim)' }}>Noor Haddad · Paper Cranes</div>
      </div>
    </div>
  );
}

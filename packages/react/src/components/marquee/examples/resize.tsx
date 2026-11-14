import { Marquee } from '@hanji/react';
import * as React from 'react';

export function Example(): React.JSX.Element {
  const [width, setWidth] = React.useState(220);
  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      <label
        style={{
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          fontSize: 13,
          color: 'var(--hj-fg-dim)',
        }}
      >
        Width
        <input
          type="range"
          min={140}
          max={480}
          value={width}
          onChange={(e) => setWidth(Number(e.currentTarget.value))}
        />
        <span style={{ fontFamily: 'var(--hj-font-mono)' }}>{width}px</span>
      </label>
      <div
        style={{
          width,
          padding: '10px 12px',
          borderRadius: 12,
          background: 'var(--hj-surface)',
          boxShadow: 'inset 0 0 0 1px var(--hj-line)',
        }}
      >
        <Marquee style={{ fontSize: 15, fontWeight: 500 }}>
          Kōya Lanes — Field Recordings, Jeju (side B)
        </Marquee>
      </div>
    </div>
  );
}

import { Squircle, squirclePath } from '@hanji/react';

const SIZE = 132;
const R = 36;
const tiles = [
  { smoothing: 0, label: 'Circular', note: 'smoothing 0' },
  { smoothing: 0.72, label: 'hanji', note: 'smoothing .72' },
  { smoothing: 1, label: 'Continuous', note: 'smoothing 1' },
];

/** The dashed line is the circular corner of the same radius, so the squircle's extra fullness shows. */
export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
      {tiles.map((t) => (
        <figure
          key={t.label}
          style={{ margin: 0, display: 'grid', gap: 10, justifyItems: 'center' }}
        >
          <div style={{ position: 'relative', width: SIZE, height: SIZE }}>
            <Squircle
              radius={R}
              smoothing={t.smoothing}
              exact
              style={{ width: SIZE, height: SIZE, background: 'var(--hj-accent-soft)' }}
            />
            <svg
              width={SIZE}
              height={SIZE}
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
              aria-hidden="true"
            >
              <path
                d={squirclePath(SIZE, SIZE, R, 0)}
                fill="none"
                stroke="var(--hj-fg-mute)"
                strokeDasharray="3 4"
              />
              <path
                d={squirclePath(SIZE, SIZE, R, t.smoothing)}
                fill="none"
                stroke="var(--hj-accent)"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <figcaption style={{ textAlign: 'center', font: 'var(--hj-type-sub)' }}>
            <b style={{ display: 'block', fontWeight: 600 }}>{t.label}</b>
            <span style={{ color: 'var(--hj-fg-mute)', fontFamily: 'var(--hj-font-mono)' }}>
              {t.note}
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

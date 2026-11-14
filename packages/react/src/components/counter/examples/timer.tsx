import { Counter } from '@hanji/react';
import * as React from 'react';

const clock = (s: number): string =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export function Example(): React.JSX.Element {
  const [left, setLeft] = React.useState(15 * 60);
  React.useEffect(() => {
    const id = window.setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 15 * 60)), 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div style={{ display: 'flex', gap: 56, alignItems: 'end', flexWrap: 'wrap' }}>
      <div style={{ display: 'grid', gap: 6 }}>
        <span className="hj-text-eyebrow hj-tone-mute">Listened today</span>
        <span className="hj-text-hero">
          <Counter value={167} from={0} /> <span className="hj-text-title hj-tone-mute">min</span>
        </span>
      </div>
      <div style={{ display: 'grid', gap: 6 }}>
        <span className="hj-text-eyebrow hj-tone-mute">Sleep timer</span>
        <Counter value={clock(left)} size="title" />
      </div>
      <div style={{ display: 'grid', gap: 6 }}>
        <span className="hj-text-eyebrow hj-tone-mute">Storage used</span>
        <Counter
          value={0.716}
          format={{ style: 'percent', maximumFractionDigits: 1 }}
          size="title"
          from={0}
        />
      </div>
    </div>
  );
}

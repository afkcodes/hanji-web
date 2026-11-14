import { Button, Counter } from '@hanji/react';
import * as React from 'react';

export function Example(): React.JSX.Element {
  const [plays, setPlays] = React.useState(128_406);
  React.useEffect(() => {
    const id = window.setInterval(
      () => setPlays((p) => p + 1 + Math.floor(Math.random() * 3)),
      1400,
    );
    return () => window.clearInterval(id);
  }, []);
  return (
    <div style={{ display: 'grid', gap: 14, justifyItems: 'start' }}>
      <span className="hj-text-eyebrow hj-tone-mute">Plays this week</span>
      <Counter value={plays} size="display" />
      <span className="hj-text-sub hj-tone-mute">across 41 countries · updates live</span>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button size="sm" variant="secondary" onClick={() => setPlays((p) => p + 1)}>
          +1
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setPlays((p) => p + 2_500)}>
          +2,500
        </Button>
        <Button size="sm" variant="quiet" onClick={() => setPlays((p) => Math.max(0, p - 999))}>
          −999
        </Button>
      </div>
    </div>
  );
}

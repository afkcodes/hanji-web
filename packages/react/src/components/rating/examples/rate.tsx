import { Rating } from '@hanji/react';
import * as React from 'react';

const words = ['', 'Not for me', 'It was fine', 'Good', 'Really good', 'On repeat'];

export function Example(): React.JSX.Element {
  const [stars, setStars] = React.useState<number | null>(null);
  return (
    <div style={{ display: 'grid', gap: 10, justifyItems: 'center' }}>
      <span id="rate-album" className="hj-text-heading">
        How was “Low Tide Choir”?
      </span>
      <Rating.Root aria-labelledby="rate-album" value={stars} onValueChange={setStars} size="lg" />
      <span className="hj-text-sub hj-tone-mute" aria-live="polite">
        {stars ? `${words[stars]} — thanks, Aiko` : 'Your rating is private to you and the artist.'}
      </span>
    </div>
  );
}

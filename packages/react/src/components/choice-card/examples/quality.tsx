import { ChoiceCard } from '@hanji/react';
import * as React from 'react';

export function Example(): React.JSX.Element {
  const [quality, setQuality] = React.useState<unknown>('high');
  return (
    <div style={{ width: '100%', maxWidth: 760 }}>
      <h3 id="sq" className="hj-text-eyebrow hj-tone-mute" style={{ marginBottom: 10 }}>
        Streaming quality
      </h3>
      <ChoiceCard.Root aria-labelledby="sq" value={quality} onValueChange={setQuality} columns={3}>
        <ChoiceCard.Item value="normal">
          <ChoiceCard.Title>Normal</ChoiceCard.Title>
          <ChoiceCard.Description>
            Fine for phone speakers and patchy signal.
          </ChoiceCard.Description>
          <ChoiceCard.Consequence>≈ 40 MB / hour</ChoiceCard.Consequence>
        </ChoiceCard.Item>
        <ChoiceCard.Item value="high">
          <ChoiceCard.Title>High</ChoiceCard.Title>
          <ChoiceCard.Description>What most headphones can tell apart.</ChoiceCard.Description>
          <ChoiceCard.Consequence>≈ 150 MB / hour</ChoiceCard.Consequence>
        </ChoiceCard.Item>
        <ChoiceCard.Item value="lossless" disabled>
          <ChoiceCard.Title>Lossless</ChoiceCard.Title>
          <ChoiceCard.Description>CD quality. Needs the Studio plan.</ChoiceCard.Description>
          <ChoiceCard.Consequence>≈ 1.4 GB / hour</ChoiceCard.Consequence>
        </ChoiceCard.Item>
      </ChoiceCard.Root>
    </div>
  );
}

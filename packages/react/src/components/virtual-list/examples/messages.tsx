import { Button, Text, VirtualList } from '@hanji/react';
import type { VirtualListActions } from '@hanji/react';
import * as React from 'react';

const LINES = [
  'Is lossless worth it on the train?',
  'Not really with AirPods — they re-compress to AAC over Bluetooth, so High (320 kbps) sounds the same and uses a tenth of the data.',
  'Makes sense.',
  'Could you queue something slower for the walk home? Nothing with vocals, ideally around 70 bpm, and skip anything I have already played twice this week.',
  'Done — eight tracks, 34 minutes, starting with Low Tide.',
  'Thanks!',
  'One more: download it for the tunnel.',
];
const COUNT = 2_000;

export function Example(): React.JSX.Element {
  const actions = React.useRef<VirtualListActions>(null);
  return (
    <div style={{ display: 'grid', gap: 12, width: '100%', maxWidth: 480 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button size="sm" variant="secondary" onClick={() => actions.current?.scrollToIndex(0)}>
          First message
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => actions.current?.scrollToIndex(COUNT - 1, { align: 'end' })}
        >
          Latest
        </Button>
      </div>
      <VirtualList.Root
        count={COUNT}
        estimateSize={64}
        gap={8}
        actionsRef={actions}
        aria-label="Conversation"
        style={{ height: 380, padding: 12, boxShadow: 'inset 0 0 0 1px var(--hj-line)' }}
      >
        {(i) => {
          const mine = i % 2 === 0;
          return (
            <div style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
              <div
                style={{
                  maxWidth: '78%',
                  padding: '8px 12px',
                  borderRadius: 14,
                  background: mine ? 'var(--hj-accent-soft)' : 'var(--hj-surface)',
                  boxShadow: mine ? 'none' : 'inset 0 0 0 1px var(--hj-line)',
                }}
              >
                <Text variant="sub" tone="mute">
                  #{i + 1} · {mine ? 'You' : 'hanji'}
                </Text>
                <Text>{LINES[(i * 3) % LINES.length]}</Text>
              </div>
            </div>
          );
        }}
      </VirtualList.Root>
    </div>
  );
}

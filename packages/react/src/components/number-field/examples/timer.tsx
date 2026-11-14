import { NumberField } from '@hanji/react';

const row: React.CSSProperties = { display: 'grid', gap: 8, justifyItems: 'start' };

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'end' }}>
      <div style={row}>
        <span className="hj-text-label">Sleep timer</span>
        <NumberField.Root
          aria-label="Sleep timer in minutes"
          defaultValue={45}
          min={5}
          max={120}
          step={5}
          unit="min"
        />
      </div>
      <div style={row}>
        <span className="hj-text-label">Playback speed</span>
        <NumberField.Root
          aria-label="Playback speed"
          defaultValue={1.25}
          min={0.5}
          max={3}
          step={0.25}
          format={{ minimumFractionDigits: 2 }}
          unit="×"
        />
      </div>
      <div style={row}>
        <span className="hj-text-label">Copies (at the limit)</span>
        <NumberField.Root aria-label="Copies" defaultValue={10} min={1} max={10} size="sm" />
      </div>
    </div>
  );
}

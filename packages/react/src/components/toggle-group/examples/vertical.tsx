import { Toggle, ToggleGroup } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
      <div style={{ display: 'grid', gap: 8, justifyItems: 'start' }}>
        <span className="hj-text-eyebrow hj-tone-mute">EQ preset</span>
        <ToggleGroup orientation="vertical" aria-label="EQ preset" defaultValue={['warm']}>
          <Toggle value="flat">Flat</Toggle>
          <Toggle value="warm">Warm</Toggle>
          <Toggle value="vocal">Vocal</Toggle>
          <Toggle value="bass">Bass boost</Toggle>
        </ToggleGroup>
      </div>
      <div style={{ display: 'grid', gap: 8, justifyItems: 'start' }}>
        <span className="hj-text-eyebrow hj-tone-mute">Output (locked while casting)</span>
        <ToggleGroup disabled aria-label="Output" defaultValue={['speaker']}>
          <Toggle value="phone">Phone</Toggle>
          <Toggle value="speaker">Living room</Toggle>
        </ToggleGroup>
      </div>
    </div>
  );
}

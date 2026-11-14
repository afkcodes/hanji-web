import { Checkbox } from '@hanji/react';

const cell: React.CSSProperties = { display: 'grid', justifyItems: 'center', gap: 8 };

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'flex', gap: 36, alignItems: 'end' }}>
      <div style={cell}>
        <Checkbox.Root aria-label="Off" />
        <span className="hj-text-label hj-tone-mute">off</span>
      </div>
      <div style={cell}>
        <Checkbox.Root defaultChecked aria-label="On" />
        <span className="hj-text-label hj-tone-mute">on</span>
      </div>
      <div style={cell}>
        <Checkbox.Root indeterminate aria-label="Mixed" />
        <span className="hj-text-label hj-tone-mute">mixed</span>
      </div>
      <div style={cell}>
        <Checkbox.Root defaultChecked disabled aria-label="Disabled" />
        <span className="hj-text-label hj-tone-mute">disabled</span>
      </div>
      <div style={cell}>
        <Checkbox.Root size="sm" defaultChecked aria-label="Small" />
        <span className="hj-text-label hj-tone-mute">sm</span>
      </div>
    </div>
  );
}

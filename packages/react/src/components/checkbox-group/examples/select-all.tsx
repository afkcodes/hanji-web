import { Checkbox, CheckboxGroup } from '@hanji/react';
import * as React from 'react';

const playlists = [
  { id: 'late-night', name: 'Late Night Drive', mb: 212 },
  { id: 'run-club', name: 'Run Club', mb: 148 },
  { id: 'field-notes', name: 'Field Notes — podcast', mb: 391 },
  { id: 'sunday', name: 'Sunday, slowly', mb: 96 },
];

export function Example(): React.JSX.Element {
  const [value, setValue] = React.useState<string[]>(['late-night', 'sunday']);
  const total = playlists.filter((p) => value.includes(p.id)).reduce((t, p) => t + p.mb, 0);
  return (
    <div style={{ width: 380 }}>
      <h3 id="dl-heading" className="hj-text-eyebrow hj-tone-mute" style={{ marginBottom: 8 }}>
        Keep offline
      </h3>
      <CheckboxGroup.Root
        aria-labelledby="dl-heading"
        value={value}
        onValueChange={setValue}
        allValues={playlists.map((p) => p.id)}
      >
        <CheckboxGroup.Item>
          <Checkbox.Root parent />
          All playlists
          <CheckboxGroup.Description>{total} MB</CheckboxGroup.Description>
        </CheckboxGroup.Item>
        <CheckboxGroup.Children>
          {playlists.map((p) => (
            <CheckboxGroup.Item key={p.id}>
              <Checkbox.Root value={p.id} />
              {p.name}
              <CheckboxGroup.Description>{p.mb} MB</CheckboxGroup.Description>
            </CheckboxGroup.Item>
          ))}
        </CheckboxGroup.Children>
      </CheckboxGroup.Root>
    </div>
  );
}

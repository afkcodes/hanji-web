import { Field, Switch } from '@hanji/react';

const rows = [
  { label: 'Gapless playback', help: 'No silence between album tracks', on: true },
  { label: 'Normalise volume', help: 'Same loudness across tracks', on: false },
  {
    label: 'Download over cellular',
    help: 'Needs a plan with data. Ask your admin.',
    on: false,
    disabled: true,
  },
];

export function Example(): React.JSX.Element {
  return (
    <div style={{ maxWidth: 420 }}>
      {rows.map((r) => (
        <Field.Root
          key={r.label}
          disabled={r.disabled}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
            padding: '12px 0',
            borderBottom: '1px solid var(--hj-line)',
          }}
        >
          <div style={{ flex: 1 }}>
            <Field.Label>{r.label}</Field.Label>
            <Field.Description>{r.help}</Field.Description>
          </div>
          <Switch.Root defaultChecked={r.on} />
        </Field.Root>
      ))}
    </div>
  );
}

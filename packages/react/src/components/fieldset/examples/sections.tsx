import { Field, Fieldset, Switch } from '@hanji/react';

const row = { flexDirection: 'row', alignItems: 'center', gap: 16 } as const;

export function Example(): React.JSX.Element {
  return (
    <div style={{ width: 420 }}>
      <Fieldset.Root>
        <Fieldset.Legend>Playback</Fieldset.Legend>
        <Fieldset.Description>Applies on this device only.</Fieldset.Description>
        <Field.Root style={row}>
          <div style={{ flex: 1 }}>
            <Field.Label>Gapless playback</Field.Label>
            <Field.Description>No silence between album tracks</Field.Description>
          </div>
          <Switch.Root defaultChecked />
        </Field.Root>
        <Field.Root style={row}>
          <div style={{ flex: 1 }}>
            <Field.Label>Normalise volume</Field.Label>
            <Field.Description>Same loudness across tracks</Field.Description>
          </div>
          <Switch.Root />
        </Field.Root>
      </Fieldset.Root>
      <Fieldset.Root disabled>
        <Fieldset.Legend>Downloads</Fieldset.Legend>
        <Fieldset.Description>Your organisation manages download settings.</Fieldset.Description>
        <Field.Root style={row}>
          <div style={{ flex: 1 }}>
            <Field.Label>Download over cellular</Field.Label>
          </div>
          <Switch.Root />
        </Field.Root>
      </Fieldset.Root>
    </div>
  );
}

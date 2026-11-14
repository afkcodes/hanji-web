import { Collapsible, Field, Switch } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'grid', gap: 24, width: '100%', maxWidth: 420 }}>
      <Collapsible.Root>
        <Collapsible.Trigger>Advanced playback</Collapsible.Trigger>
        <Collapsible.Panel>
          <div style={{ paddingTop: 8 }}>
            <Field.Root
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 16,
                padding: '12px 0',
                borderTop: '1px solid var(--hj-line)',
              }}
            >
              <div style={{ flex: 1 }}>
                <Field.Label>Crossfade between albums</Field.Label>
                <Field.Description>Off keeps live recordings gapless.</Field.Description>
              </div>
              <Switch.Root />
            </Field.Root>
            <Field.Root
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 16,
                padding: '12px 0',
                borderTop: '1px solid var(--hj-line)',
              }}
            >
              <div style={{ flex: 1 }}>
                <Field.Label>Mono audio</Field.Label>
                <Field.Description>Both channels in each ear.</Field.Description>
              </div>
              <Switch.Root />
            </Field.Root>
          </div>
        </Collapsible.Panel>
      </Collapsible.Root>
      <Collapsible.Root disabled>
        <Collapsible.Trigger>Developer options</Collapsible.Trigger>
        <Collapsible.Panel>
          <p>Hidden.</p>
        </Collapsible.Panel>
      </Collapsible.Root>
    </div>
  );
}

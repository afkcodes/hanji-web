import { ModelPicker } from '@hanji/react';

const ITEMS = [
  { value: 'swift', label: 'Swift' },
  { value: 'deep', label: 'Deep' },
  { value: 'local-small', label: 'On-device (small)' },
];

export function Example(): React.JSX.Element {
  return (
    <ModelPicker.Root defaultValue="deep" items={ITEMS}>
      <ModelPicker.Trigger aria-label="Model" />
      <ModelPicker.Content side="bottom">
        <ModelPicker.Group>
          <ModelPicker.GroupLabel>Cloud</ModelPicker.GroupLabel>
          <ModelPicker.Item
            value="swift"
            name="Swift"
            provider="hanji"
            description="Quick answers. ~1 s."
            badges={['fast']}
          />
          <ModelPicker.Item
            value="deep"
            name="Deep"
            provider="hanji"
            description="Careful, multi-step plans."
            badges={['reasoning']}
          />
        </ModelPicker.Group>
        <ModelPicker.Separator />
        <ModelPicker.Group>
          <ModelPicker.GroupLabel>On this device</ModelPicker.GroupLabel>
          <ModelPicker.Item
            value="local-small"
            name="On-device (small)"
            description="Needs 2.1 GB free — you have 1.4 GB. Free up space to use it offline."
            badges={['offline']}
            disabled
          />
        </ModelPicker.Group>
      </ModelPicker.Content>
    </ModelPicker.Root>
  );
}

import { Field, Select } from '@hanji/react';

const qualities = [
  { value: 'normal', label: 'Normal', note: 'About 40 MB an hour' },
  { value: 'high', label: 'High', note: 'About 150 MB an hour' },
  { value: 'lossless', label: 'Lossless', note: 'About 1.4 GB an hour, Wi-Fi only' },
];

export function Example(): React.JSX.Element {
  return (
    <Field.Root style={{ width: 320 }}>
      <Select.Root items={qualities} defaultValue="high">
        <Select.Label>Streaming quality</Select.Label>
        <Select.Trigger placeholder="Choose a quality" />
        <Select.Content>
          {qualities.map((q) => (
            <Select.Option key={q.value} value={q.value} description={q.note}>
              {q.label}
            </Select.Option>
          ))}
        </Select.Content>
      </Select.Root>
      <Field.Description>
        Applies to new downloads. Existing ones keep their quality.
      </Field.Description>
    </Field.Root>
  );
}

import { Field, Select } from '@hanji/react';

const zones = {
  Europe: [
    { value: 'Europe/London', label: 'London · GMT' },
    { value: 'Europe/Berlin', label: 'Berlin · CET' },
    { value: 'Europe/Lisbon', label: 'Lisbon · WET' },
  ],
  Asia: [
    { value: 'Asia/Seoul', label: 'Seoul · KST' },
    { value: 'Asia/Tokyo', label: 'Tokyo · JST' },
    { value: 'Asia/Kolkata', label: 'Kolkata · IST' },
  ],
  Americas: [
    { value: 'America/Mexico_City', label: 'Mexico City · CST' },
    { value: 'America/Sao_Paulo', label: 'São Paulo · BRT' },
  ],
};
const items = Object.values(zones).flat();

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'grid', gap: 24, width: 320 }}>
      <Field.Root>
        <Select.Root items={items} defaultValue="Asia/Seoul">
          <Select.Label>Time zone</Select.Label>
          <Select.Trigger />
          <Select.Content>
            {Object.entries(zones).map(([region, list], i) => (
              <Select.Group key={region}>
                {i > 0 ? <Select.Separator /> : null}
                <Select.GroupLabel>{region}</Select.GroupLabel>
                {list.map((z) => (
                  <Select.Option key={z.value} value={z.value}>
                    {z.label}
                  </Select.Option>
                ))}
              </Select.Group>
            ))}
          </Select.Content>
        </Select.Root>
      </Field.Root>
      <Field.Root invalid>
        <Select.Root items={items}>
          <Select.Label>Billing region</Select.Label>
          <Select.Trigger placeholder="Choose a region" />
          <Select.Content>
            {items.map((z) => (
              <Select.Option key={z.value} value={z.value}>
                {z.label}
              </Select.Option>
            ))}
          </Select.Content>
        </Select.Root>
        <Field.Error match>Choose where you’re billed so we can show prices with tax.</Field.Error>
      </Field.Root>
      <Field.Root disabled>
        <Select.Root items={items} defaultValue="Europe/London">
          <Select.Label>Home region</Select.Label>
          <Select.Trigger size="sm" />
          <Select.Content />
        </Select.Root>
        <Field.Description>Set by your organisation.</Field.Description>
      </Field.Root>
    </div>
  );
}

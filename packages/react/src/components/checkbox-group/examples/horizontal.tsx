import { Checkbox, CheckboxGroup } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div>
      <h3 id="topics" className="hj-text-eyebrow hj-tone-mute" style={{ marginBottom: 4 }}>
        Email me about
      </h3>
      <CheckboxGroup.Root
        aria-labelledby="topics"
        orientation="horizontal"
        defaultValue={['releases']}
      >
        <CheckboxGroup.Item>
          <Checkbox.Root value="releases" />
          New releases
        </CheckboxGroup.Item>
        <CheckboxGroup.Item>
          <Checkbox.Root value="concerts" />
          Concerts nearby
        </CheckboxGroup.Item>
        <CheckboxGroup.Item>
          <Checkbox.Root value="offers" disabled />
          Offers (off for Family plans)
        </CheckboxGroup.Item>
      </CheckboxGroup.Root>
    </div>
  );
}

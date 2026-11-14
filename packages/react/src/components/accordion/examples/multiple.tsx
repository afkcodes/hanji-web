import { Accordion } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <Accordion.Root
      multiple
      variant="plain"
      defaultValue={['quality', 'storage']}
      style={{ width: '100%', maxWidth: 480 }}
    >
      <Accordion.Item value="quality">
        <Accordion.Header>
          <Accordion.Trigger>Streaming quality</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>
          <p>
            High on Wi-Fi, Normal on cellular. Lossless is off because this plan doesn’t include it.
          </p>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="storage">
        <Accordion.Header>
          <Accordion.Trigger>Storage</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>
          <p>48.6 GB used of 64 GB. Downloads you haven’t played in 90 days are removed first.</p>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="devices">
        <Accordion.Header>
          <Accordion.Trigger>Devices</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>
          <p>
            This iPhone, Kitchen speaker and Mira’s MacBook. Signed in 3 days ago on the MacBook.
          </p>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  );
}

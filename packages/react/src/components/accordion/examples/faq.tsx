import { Accordion } from '@hanji/react';

const faqs = [
  {
    q: 'Where are my downloads stored?',
    a: 'On this device only, in the app’s own storage. They don’t appear in Files and aren’t backed up to iCloud.',
  },
  {
    q: 'Why did a download stop halfway?',
    a: 'Downloads pause when you leave Wi-Fi with “Download over cellular” off, or when the device has less than 1 GB free. They resume on their own.',
  },
  {
    q: 'How much space will downloads use?',
    a: 'About 40 MB an hour at Normal, 150 MB at High and 1.4 GB at Lossless.',
  },
  {
    q: 'Can I download on more than one device?',
    a: 'Family plans can download on up to five devices. Ask the plan owner to add yours.',
    disabled: true,
  },
];

export function Example(): React.JSX.Element {
  return (
    <Accordion.Root defaultValue={[0]} style={{ width: '100%', maxWidth: 560 }}>
      {faqs.map((f, i) => (
        <Accordion.Item key={f.q} value={i} disabled={f.disabled}>
          <Accordion.Header>
            <Accordion.Trigger>{f.q}</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>
            <p>{f.a}</p>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

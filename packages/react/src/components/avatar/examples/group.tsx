import { Avatar, Text } from '@hanji/react';

const people = [
  'Mira Okafor',
  'Jun-seo Park',
  'Ilse Brandt',
  'Tomás Reyes',
  'Aiko Sato',
  'Dev Malhotra',
  'Noor Haddad',
];

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'grid', gap: 18, justifyItems: 'start' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Avatar.Group max={4} label="Mira, Jun-seo, Ilse, Tomás and 3 others">
          {people.map((p) => (
            <Avatar.Root key={p} name={p} />
          ))}
        </Avatar.Group>
        <Text variant="sub" tone="dim">
          7 people edit Late Night Drive
        </Text>
      </div>
      <Avatar.Group size={24} label="Liked by Aiko and Noor">
        <Avatar.Root name="Aiko Sato" />
        <Avatar.Root name="Noor Haddad" />
      </Avatar.Group>
    </div>
  );
}

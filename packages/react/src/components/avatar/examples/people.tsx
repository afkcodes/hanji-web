import { Avatar } from '@hanji/react';

const portrait = (seed: number): string =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="hsl(${seed} 32% 62%)"/><circle cx="40" cy="31" r="15" fill="hsl(${seed} 30% 84%)"/><path d="M12 80c4-18 16-26 28-26s24 8 28 26z" fill="hsl(${seed} 30% 84%)"/></svg>`,
  )}`;

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'grid', gap: 22, justifyItems: 'start' }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <Avatar.Root name="Mira Okafor" src={portrait(18)} size={56} presence="online" />
        <Avatar.Root name="Jun-seo Park" size={56} presence="away" />
        <Avatar.Root name="Ilse Brandt" size={56} presence="busy" />
        <Avatar.Root name="Tomás Reyes" src="/missing/tomas.jpg" size={56} presence="offline" />
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <Avatar.Root name="Aiko Sato" size={40} />
        <Avatar.Root name="Dev Malhotra" size={32} />
        <Avatar.Root name="Noor Haddad" size={24} />
        <Avatar.Root size={32} title="Unknown listener" />
      </div>
    </div>
  );
}

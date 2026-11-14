import { ScrollArea } from '@hanji/react';

const tracks = [
  'The Long Way Round the Harbour — Ilse Brandt',
  'Paper Lanterns — Jun-seo Park',
  'Night Bus Home — Noor Haddad',
  'Saltmarsh — Ilse Brandt',
  'Kettle Hymn — Kōya Lanes',
  'Seoul, 4 a.m. — Jun-seo Park',
  'Low Tide Choir — Aiko Sato',
  'Field Notes — Tomás Reyes',
  'Quiet Machines — Dev Malhotra',
  'Sunday, slowly — Mira Okafor',
  'Harbour Lights — Noor Haddad',
  'Glass Weather — Kōya Lanes',
];

export function Example(): React.JSX.Element {
  return (
    <ScrollArea.Box
      style={{
        height: 240,
        width: 'min(380px, 100%)',
        borderRadius: 16,
        boxShadow: 'inset 0 0 0 1px var(--hj-line)',
      }}
    >
      <ol style={{ margin: 0, padding: '6px 16px', listStyle: 'none' }}>
        {tracks.map((t, i) => (
          <li
            key={t}
            style={{
              display: 'flex',
              gap: 12,
              padding: '10px 0',
              borderBottom: '1px solid var(--hj-line)',
              fontSize: 14,
            }}
          >
            <span
              style={{
                font: '500 12px var(--hj-font-mono)',
                color: 'var(--hj-fg-mute)',
                width: 20,
              }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            {t}
          </li>
        ))}
      </ol>
    </ScrollArea.Box>
  );
}

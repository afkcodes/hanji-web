import { Kbd, Text } from '@hanji/react';

const commands = [
  { label: 'Play or pause', keys: ['Space'] },
  { label: 'Next track', keys: ['⌘', '→'] },
  { label: 'Like', keys: ['L'] },
  { label: 'Open queue', keys: ['⇧', '⌘', 'Q'] },
];

export function Example(): React.JSX.Element {
  return (
    <div style={{ width: '100%', maxWidth: 360 }}>
      {commands.map((c) => (
        <div
          key={c.label}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 0',
            borderBottom: '1px solid var(--hj-line)',
          }}
        >
          <Text>{c.label}</Text>
          <span>
            {c.keys.map((k) => (
              <Kbd key={k} size="sm">
                {k}
              </Kbd>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}

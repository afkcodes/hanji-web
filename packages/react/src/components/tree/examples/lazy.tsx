import { Text, Tree } from '@hanji/react';
import * as React from 'react';

/* Inline glyphs, 24 grid, 1.5 stroke — folder, open folder, photo, document. */
function Glyph({ d }: { d: string }): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}
const FOLDER = 'M3.5 7a2 2 0 0 1 2-2h3.7l2 2h7.3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z';
const FOLDER_OPEN =
  'M3.5 17V7a2 2 0 0 1 2-2h3.7l2 2h6.3a2 2 0 0 1 2 2v1.5M3.5 17l2.1-5.4a1.6 1.6 0 0 1 1.5-1.1h13a1 1 0 0 1 .9 1.4l-2.2 5.8a2 2 0 0 1-1.9 1.3H5.5a2 2 0 0 1-2-2Z';
const PHOTO =
  'M6 4.5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2ZM4 16l4.5-4.5 3.5 3.5 2.5-2.5L20 17.5M15.5 9.5h.01';
const DOC =
  'M13.5 3.5h-6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8.5ZM13.5 3.5v5h5M9 13h6M9 16.5h4';

interface File {
  name: string;
  size: string;
  photo?: boolean;
}

const LISBON: File[] = [
  { name: 'Alfama, first light.heic', size: '4.8 MB', photo: true },
  { name: 'Soundcheck — Aiko Sato.heic', size: '3.9 MB', photo: true },
  { name: 'Coliseu, from the desk.heic', size: '5.2 MB', photo: true },
  { name: 'Setlist v3.pdf', size: '182 KB' },
];
const ARCHIVE: File[] = [
  { name: 'Harbour Lights — masters.zip', size: '1.2 GB' },
  { name: 'Liner notes, Ilse Brandt.pdf', size: '640 KB' },
  { name: 'Press shots.zip', size: '318 MB' },
];

const wait = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

function Folder({ expanded }: { expanded: boolean }): React.JSX.Element {
  return <Glyph d={expanded ? FOLDER_OPEN : FOLDER} />;
}

function Files({ files }: { files: File[] }): React.JSX.Element {
  return (
    <Tree.Group>
      {files.map((f) => (
        <Tree.Item key={f.name} id={f.name}>
          <Tree.Icon>
            <Glyph d={f.photo ? PHOTO : DOC} />
          </Tree.Icon>
          <Tree.Label>{f.name}</Tree.Label>
          <Tree.Meta>{f.size}</Tree.Meta>
        </Tree.Item>
      ))}
    </Tree.Group>
  );
}

export function Example(): React.JSX.Element {
  const [loaded, setLoaded] = React.useState<Record<string, File[]>>({});
  const attempts = React.useRef(0);
  return (
    <div style={{ width: '100%', maxWidth: 380, display: 'grid', gap: 8 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          padding: '0 10px',
        }}
      >
        <Text variant="subheading">Studio Okafor</Text>
        <Text variant="sub" tone="mute">
          Shared drive
        </Text>
      </div>
      <div
        style={{
          padding: 6,
          borderRadius: 16,
          background: 'var(--hj-surface)',
          boxShadow: 'inset 0 0 0 1px var(--hj-line)',
        }}
      >
        <Tree.Root aria-label="Studio Okafor shared drive">
          <Tree.Item
            id="lisbon"
            load={async () => {
              await wait(1100);
              setLoaded((l) => ({ ...l, lisbon: LISBON }));
            }}
          >
            <Tree.Icon>{({ expanded }) => <Folder expanded={expanded} />}</Tree.Icon>
            <Tree.Label>Tour 2024 · Lisbon</Tree.Label>
            {loaded.lisbon ? <Files files={loaded.lisbon} /> : null}
          </Tree.Item>
          <Tree.Item
            id="archive"
            load={async () => {
              attempts.current += 1;
              await wait(900);
              // The drive is offline the first time; try again and it answers.
              if (attempts.current === 1) throw new Error('Drive offline');
              setLoaded((l) => ({ ...l, archive: ARCHIVE }));
            }}
          >
            <Tree.Icon>{({ expanded }) => <Folder expanded={expanded} />}</Tree.Icon>
            <Tree.Label>Archive 2019</Tree.Label>
            {loaded.archive ? <Files files={loaded.archive} /> : null}
          </Tree.Item>
          <Tree.Item id="contracts" load={() => wait(700)}>
            <Tree.Icon>{({ expanded }) => <Folder expanded={expanded} />}</Tree.Icon>
            <Tree.Label>Contracts</Tree.Label>
          </Tree.Item>
          <Tree.Item id="rider">
            <Tree.Icon>
              <Glyph d={DOC} />
            </Tree.Icon>
            <Tree.Label>Tech rider — Noor Haddad.pdf</Tree.Label>
            <Tree.Meta>96 KB</Tree.Meta>
          </Tree.Item>
        </Tree.Root>
      </div>
    </div>
  );
}

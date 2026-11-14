import { Badge, Text, Tree } from '@hanji/react';
import * as React from 'react';

/* Inline glyphs, 24 grid, 1.5 stroke — folder, open folder, file. */
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
const FILE = 'M13.5 3.5h-6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8.5ZM13.5 3.5v5h5';

interface Node {
  name: string;
  size?: string;
  unsaved?: boolean;
  children?: Node[];
}

const REPO: Node[] = [
  {
    name: 'apps',
    children: [
      {
        name: 'playground',
        children: [
          { name: 'index.html', size: '0.6 KB' },
          { name: 'vite.config.ts', size: '1.2 KB' },
        ],
      },
    ],
  },
  {
    name: 'packages',
    children: [
      {
        name: 'react',
        children: [
          {
            name: 'src',
            children: [
              {
                name: 'tree',
                children: [
                  { name: 'index.ts', size: '0.4 KB' },
                  { name: 'tree.css', size: '7.9 KB', unsaved: true },
                  { name: 'tree.meta.ts', size: '6.1 KB' },
                  { name: 'tree.tsx', size: '24.8 KB' },
                ],
              },
              { name: 'index.ts', size: '1.9 KB' },
            ],
          },
          { name: 'package.json', size: '1.4 KB' },
        ],
      },
      {
        name: 'tokens',
        children: [
          { name: 'motion.ts', size: '3.3 KB' },
          { name: 'palette.ts', size: '11.0 KB' },
        ],
      },
    ],
  },
  { name: 'AGENTS.md', size: '9.7 KB' },
  { name: 'package.json', size: '2.1 KB' },
];

/** Folder ids, so activating one doesn't 'open' it in the editor. */
const DIRS = new Set<string>();
function collect(nodes: Node[], path: string): void {
  for (const n of nodes) {
    if (!n.children) continue;
    DIRS.add(`${path}/${n.name}`);
    collect(n.children, `${path}/${n.name}`);
  }
}
collect(REPO, '');

function render(node: Node, path: string): React.JSX.Element {
  const id = `${path}/${node.name}`;
  if (!node.children) {
    return (
      <Tree.Item key={id} id={id}>
        <Tree.Icon>
          <Glyph d={FILE} />
        </Tree.Icon>
        <Tree.Label>{node.name}</Tree.Label>
        <Tree.Meta>
          {node.unsaved ? <Badge.Root dot label="Unsaved changes" /> : null}
          {node.size}
        </Tree.Meta>
      </Tree.Item>
    );
  }
  return (
    <Tree.Item key={id} id={id}>
      <Tree.Icon>{({ expanded }) => <Glyph d={expanded ? FOLDER_OPEN : FOLDER} />}</Tree.Icon>
      <Tree.Label>{node.name}</Tree.Label>
      <Tree.Meta>{node.children.length}</Tree.Meta>
      <Tree.Group>{node.children.map((child) => render(child, id))}</Tree.Group>
    </Tree.Item>
  );
}

export function Example(): React.JSX.Element {
  const [open, setOpen] = React.useState('/packages/react/src/tree/tree.css');
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 360,
        padding: 6,
        borderRadius: 16,
        background: 'var(--hj-surface)',
        boxShadow: 'inset 0 0 0 1px var(--hj-line)',
      }}
    >
      <Tree.Root
        aria-label="hanji-web"
        defaultExpanded={[
          '/packages',
          '/packages/react',
          '/packages/react/src',
          '/packages/react/src/tree',
        ]}
        defaultSelected={[open]}
        onAction={(id) => {
          if (!DIRS.has(id)) setOpen(id);
        }}
      >
        {REPO.map((node) => render(node, ''))}
      </Tree.Root>
      <div
        style={{ padding: '10px 10px 6px', borderTop: '1px solid var(--hj-line)', marginTop: 6 }}
      >
        <Text variant="sub" tone="mute">
          Open in editor · {open.slice(1)}
        </Text>
      </div>
    </div>
  );
}

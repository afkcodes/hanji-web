import { Attachment, PromptInput, formatBytes } from '@hanji/react';
import * as React from 'react';

interface Item {
  id: number;
  name: string;
  size: number;
  status: 'uploading' | 'ready' | 'error';
  progress?: number;
  error?: string;
}

const START: Item[] = [
  { id: 1, name: 'october-listening.csv', size: 48_211, status: 'uploading', progress: 0.1 },
  { id: 2, name: 'gig-poster.jpg', size: 1_836_402, status: 'ready' },
  {
    id: 3,
    name: 'live-set-full.wav',
    size: 612_000_000,
    status: 'error',
    error: 'Too large — 25 MB max',
  },
];

export function Example(): React.JSX.Element {
  const [items, setItems] = React.useState(START);
  React.useEffect(() => {
    const id = window.setInterval(() => {
      setItems((list) =>
        list.map((it) => {
          if (it.status !== 'uploading') return it;
          const p = Math.min(1, (it.progress ?? 0) + 0.12);
          return p >= 1 ? { ...it, status: 'ready', progress: undefined } : { ...it, progress: p };
        }),
      );
    }, 400);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div style={{ width: '100%', maxWidth: 600 }}>
      <PromptInput.Root>
        <Attachment.List>
          {items.map((it) => (
            <Attachment.Root key={it.id} name={it.name} status={it.status} progress={it.progress}>
              <Attachment.Icon />
              <Attachment.Name />
              <Attachment.Meta>
                {it.status === 'error'
                  ? it.error
                  : it.status === 'uploading'
                    ? `${Math.round((it.progress ?? 0) * 100)}% of ${formatBytes(it.size)}`
                    : formatBytes(it.size)}
              </Attachment.Meta>
              <Attachment.Remove
                onRemove={() => setItems((l) => l.filter((x) => x.id !== it.id))}
              />
              <Attachment.Progress />
            </Attachment.Root>
          ))}
        </Attachment.List>
        <PromptInput.Textarea placeholder="What should I do with these?" />
        <PromptInput.Toolbar>
          <PromptInput.Attach />
          <PromptInput.Submit />
        </PromptInput.Toolbar>
      </PromptInput.Root>
    </div>
  );
}

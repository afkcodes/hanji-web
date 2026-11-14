import { Attachment, formatBytes } from '@hanji/react';

const FILES = [
  { name: 'cover-art.png', size: 2_412_003 },
  { name: 'liner-notes.pdf', size: 884_120 },
  { name: 'demo-take-3.flac', size: 41_204_221 },
  { name: 'tempo-filter.ts', size: 3_140 },
  { name: 'stems.zip', size: 312_884_002 },
  { name: 'lyrics-draft.md', size: 2_048 },
];

export function Example(): React.JSX.Element {
  return (
    <Attachment.List style={{ maxWidth: 600 }}>
      {FILES.map((f) => (
        <Attachment.Root key={f.name} name={f.name}>
          <Attachment.Icon />
          <Attachment.Name />
          <Attachment.Meta>{formatBytes(f.size)}</Attachment.Meta>
        </Attachment.Root>
      ))}
    </Attachment.List>
  );
}

import { Citation } from '@hanji/react';

const sources = [
  {
    index: 1,
    href: 'https://example.org/loudness',
    domain: 'example.org',
    title: 'Loudness normalisation across streaming services',
    snippet:
      'Most services normalise to about −14 LUFS, so quieter masters are turned up and louder ones down.',
  },
  {
    index: 2,
    href: 'https://example.com/replaygain',
    domain: 'example.com',
    title: 'Album gain versus track gain',
    snippet:
      'Album gain keeps the intended difference between a quiet interlude and a loud single.',
  },
];

export function Example(): React.JSX.Element {
  return (
    <div style={{ maxWidth: 560, fontSize: 15, lineHeight: 1.6 }}>
      <p style={{ margin: '0 0 16px' }}>
        “Normalise volume” levels every track to about −14 LUFS
        <Citation.Root>
          <Citation.Trigger index={1} href={sources[0]?.href} />
          <Citation.Content>
            <Citation.Domain>{sources[0]?.domain}</Citation.Domain>
            <Citation.Title>{sources[0]?.title}</Citation.Title>
            <Citation.Snippet>{sources[0]?.snippet}</Citation.Snippet>
          </Citation.Content>
        </Citation.Root>
        . On albums it uses album gain, so quiet tracks stay quiet relative to the rest
        <Citation.Root>
          <Citation.Trigger index={2} href={sources[1]?.href} />
          <Citation.Content>
            <Citation.Domain>{sources[1]?.domain}</Citation.Domain>
            <Citation.Title>{sources[1]?.title}</Citation.Title>
            <Citation.Snippet>{sources[1]?.snippet}</Citation.Snippet>
          </Citation.Content>
        </Citation.Root>
        .
      </p>
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: 1.6,
          textTransform: 'uppercase',
          color: 'var(--hj-fg-mute)',
          marginBottom: 4,
        }}
      >
        Sources
      </div>
      <Citation.List>
        {sources.map((s) => (
          <Citation.ListItem key={s.index} index={s.index} href={s.href} domain={s.domain}>
            {s.title}
          </Citation.ListItem>
        ))}
      </Citation.List>
    </div>
  );
}

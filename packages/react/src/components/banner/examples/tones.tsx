import { Banner } from '@hanji/react';

const items = [
  {
    tone: 'neutral',
    title: 'Lyrics are community-sourced',
    text: 'Spot a mistake? Tap a line to suggest a fix.',
  },
  {
    tone: 'info',
    title: 'Update ready',
    text: 'Version 4.2 adds gapless playback on AirPlay. Restart to install.',
  },
  {
    tone: 'success',
    title: '48 tracks saved offline',
    text: 'Late Night Drive will play without a connection.',
  },
  {
    tone: 'warning',
    title: 'Storage 92% full',
    text: '1.1 GB left. New downloads pause at 200 MB.',
  },
  {
    tone: 'danger',
    title: 'Payment didn’t go through',
    text: 'Your plan ends on 2 Dec. Update your card to keep downloads.',
  },
] as const;

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'grid', gap: 10, width: 'min(520px, 100%)' }}>
      {items.map((b) => (
        <Banner.Root key={b.tone} tone={b.tone}>
          <Banner.Content>
            <Banner.Title>{b.title}</Banner.Title>
            <Banner.Description>{b.text}</Banner.Description>
          </Banner.Content>
        </Banner.Root>
      ))}
    </div>
  );
}

import { PreviewCard } from '@hanji/react';

const art: React.CSSProperties = {
  width: '100%',
  height: '100%',
  background:
    'radial-gradient(120% 90% at 20% 10%, var(--hj-data-4), transparent 60%), linear-gradient(150deg, var(--hj-data-1), var(--hj-data-6))',
};

export function Example(): React.JSX.Element {
  return (
    <p style={{ maxWidth: 440, margin: 0, fontSize: 15, lineHeight: 1.6 }}>
      Tonight’s mix opens with{' '}
      <PreviewCard.Root>
        <PreviewCard.Trigger href="#artist/koya-lanes">Kōya Lanes</PreviewCard.Trigger>
        <PreviewCard.Content>
          <PreviewCard.Media>
            <div style={art} />
          </PreviewCard.Media>
          <PreviewCard.Body>
            <PreviewCard.Title>Kōya Lanes</PreviewCard.Title>
            <PreviewCard.Description>
              Ambient trio from Osaka · 212,480 monthly listeners · new album “Paper Weather” out
              Friday.
            </PreviewCard.Description>
          </PreviewCard.Body>
        </PreviewCard.Content>
      </PreviewCard.Root>{' '}
      and drifts toward the slower end of Ilse Brandt’s back catalogue.
    </p>
  );
}

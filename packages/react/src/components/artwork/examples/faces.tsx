import { ARTWORK_FACES, Artwork, artworkSpec } from '@hanji/react';

const faces = Array.from({ length: ARTWORK_FACES }, (_, face) => face);

export function Example(): React.JSX.Element {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(10, minmax(0, 1fr))',
        gap: 8,
        width: '100%',
        maxWidth: 640,
      }}
    >
      {faces.map((face) => {
        const spec = artworkSpec(face);
        return (
          <Artwork.Root
            key={face}
            style={{ width: '100%', height: 'auto', aspectRatio: '1' }}
            title={`${face} · ${spec.composition} · ${spec.palette.name}`}
          >
            <Artwork.Art face={face} />
          </Artwork.Root>
        );
      })}
    </div>
  );
}

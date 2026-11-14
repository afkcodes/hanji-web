import { Toggle } from '@hanji/react';

const Shuffle = (): React.JSX.Element => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22M18 2l4 4-4 4M2 6h1.9c1.5 0 2.9.9 3.6 2.2M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8M18 14l4 4-4 4" />
  </svg>
);
const Repeat = (): React.JSX.Element => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m17 2 4 4-4 4M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v1a4 4 0 0 1-4 4H3" />
  </svg>
);

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      <Toggle iconOnly aria-label="Shuffle" defaultPressed>
        <Shuffle />
      </Toggle>
      <Toggle iconOnly aria-label="Repeat">
        <Repeat />
      </Toggle>
      <Toggle variant="outline">Lyrics</Toggle>
      <Toggle variant="outline" size="sm" defaultPressed>
        Crossfade
      </Toggle>
      <Toggle variant="outline" disabled>
        Spatial audio
      </Toggle>
    </div>
  );
}

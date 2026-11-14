import { SegmentedControl } from '@hanji/react';

const List = (): React.JSX.Element => (
  <svg
    viewBox="0 0 24 24"
    width="17"
    height="17"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
  </svg>
);
const Grid = (): React.JSX.Element => (
  <svg
    viewBox="0 0 24 24"
    width="17"
    height="17"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="7.5" height="7.5" rx="1.8" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.8" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.8" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.8" />
  </svg>
);

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'grid', gap: 20, width: 340, justifyItems: 'start' }}>
      <SegmentedControl.Root aria-label="Layout" defaultValue="list">
        <SegmentedControl.Item value="list" aria-label="List">
          <List />
        </SegmentedControl.Item>
        <SegmentedControl.Item value="grid" aria-label="Grid">
          <Grid />
        </SegmentedControl.Item>
      </SegmentedControl.Root>
      <SegmentedControl.Root aria-label="Quality" size="sm" block defaultValue="high">
        <SegmentedControl.Item value="normal">Normal</SegmentedControl.Item>
        <SegmentedControl.Item value="high">High</SegmentedControl.Item>
        <SegmentedControl.Item value="lossless" disabled>
          Lossless
        </SegmentedControl.Item>
      </SegmentedControl.Root>
      <SegmentedControl.Root
        aria-label="Sort (locked while syncing)"
        disabled
        defaultValue="recent"
      >
        <SegmentedControl.Item value="az">A–Z</SegmentedControl.Item>
        <SegmentedControl.Item value="recent">Recent</SegmentedControl.Item>
      </SegmentedControl.Root>
    </div>
  );
}

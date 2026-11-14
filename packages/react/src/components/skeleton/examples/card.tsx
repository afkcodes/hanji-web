import { Skeleton } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div aria-busy="true" style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      {[0, 1].map((k) => (
        <div key={k} style={{ width: 200, display: 'grid', gap: 10 }}>
          <Skeleton.Root height={200} style={{ borderRadius: 16 }} />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Skeleton.Root shape="circle" width={28} />
            <Skeleton.Text lines={2} lastLine="45%" style={{ fontSize: 14 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

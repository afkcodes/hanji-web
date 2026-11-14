import { Pagination } from '@hanji/react';
import * as React from 'react';

export function Example(): React.JSX.Element {
  const [page, setPage] = React.useState(7);
  const first = (page - 1) * 20 + 1;
  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
      <p className="hj-text-sub hj-tone-mute" style={{ margin: 0 }}>
        Showing {first}–{Math.min(first + 19, 471)} of 471 listening sessions
      </p>
      <Pagination.Root count={24} page={page} onPageChange={setPage} />
    </div>
  );
}

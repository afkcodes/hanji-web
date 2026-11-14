import { Pagination } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'grid', gap: 24, justifyItems: 'center' }}>
      <Pagination.Root
        count={12}
        defaultPage={1}
        variant="compact"
        aria-label="Search results pages"
      />
      <Pagination.Root
        count={5}
        defaultPage={5}
        getHref={(p) => `#page-${p}`}
        aria-label="Episodes pages"
      >
        <Pagination.Previous>Newer</Pagination.Previous>
        <Pagination.Pages />
        <Pagination.Next>Older</Pagination.Next>
      </Pagination.Root>
    </div>
  );
}

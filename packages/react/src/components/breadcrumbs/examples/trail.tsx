import { Breadcrumbs } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <Breadcrumbs.Root aria-label="Breadcrumb">
      <Breadcrumbs.Item href="#library">Library</Breadcrumbs.Item>
      <Breadcrumbs.Item href="#playlists">Playlists</Breadcrumbs.Item>
      <Breadcrumbs.Item href="#shared">Shared with you</Breadcrumbs.Item>
      <Breadcrumbs.Item current>Late Night Drive</Breadcrumbs.Item>
    </Breadcrumbs.Root>
  );
}

import { Breadcrumbs } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div style={{ maxWidth: 460 }}>
      <Breadcrumbs.Root aria-label="Breadcrumb" maxItems={3}>
        <Breadcrumbs.Item href="#workspace">Kōya Studio</Breadcrumbs.Item>
        <Breadcrumbs.Item href="#projects">Projects</Breadcrumbs.Item>
        <Breadcrumbs.Item href="#2026">2026</Breadcrumbs.Item>
        <Breadcrumbs.Item href="#records">Low Tide Choir — second record</Breadcrumbs.Item>
        <Breadcrumbs.Item href="#mixes">Mixes</Breadcrumbs.Item>
        <Breadcrumbs.Item current>
          The Long Way Round the Harbour (alternate mix, Jun-seo’s notes)
        </Breadcrumbs.Item>
      </Breadcrumbs.Root>
    </div>
  );
}

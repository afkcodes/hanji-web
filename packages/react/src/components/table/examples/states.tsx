import { Button, Table } from '@hanji/react';

function Head(): React.JSX.Element {
  return (
    <Table.Header>
      <Table.Row>
        <Table.Head>Device</Table.Head>
        <Table.Head>Last seen</Table.Head>
        <Table.Head numeric>Downloads</Table.Head>
      </Table.Row>
    </Table.Header>
  );
}

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'grid', gap: 40, width: 'min(100%, 560px)' }}>
      <Table.Root aria-label="Devices, loading" size="sm">
        <Head />
        <Table.Body>
          <Table.Loading columns={3} numeric={[2]} label="Loading devices" />
        </Table.Body>
      </Table.Root>
      <Table.Root aria-label="Devices" size="sm">
        <Head />
        <Table.Body>
          <Table.Empty colSpan={3}>
            No devices yet. Sign in on a phone or laptop and it will appear here.
            <div style={{ marginTop: 12 }}>
              <Button size="sm" variant="secondary">
                Get the app
              </Button>
            </div>
          </Table.Empty>
        </Table.Body>
      </Table.Root>
    </div>
  );
}

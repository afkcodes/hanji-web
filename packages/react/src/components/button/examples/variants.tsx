import { Button, Icon } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <Button>Save changes</Button>
      <Button variant="ink">Publish</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="quiet">Skip for now</Button>
      <Button variant="danger">
        <Icon name="x" /> Delete playlist
      </Button>
      <Button disabled>Unavailable</Button>
    </div>
  );
}

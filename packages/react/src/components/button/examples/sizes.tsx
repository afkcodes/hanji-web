import { Button, Icon } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      <Button size="sm">Small</Button>
      <Button>Medium</Button>
      <Button size="lg">Large</Button>
      <Button iconOnly variant="secondary" aria-label="Add to queue">
        <Icon name="plus" />
      </Button>
      <Button variant="quiet" nativeButton={false} render={<a href="#new" />}>
        New playlist <Icon name="chevronRight" />
      </Button>
    </div>
  );
}

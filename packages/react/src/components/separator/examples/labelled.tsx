import { Button, Icon, Separator } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div
      style={{ display: 'grid', gap: 32, width: '100%', maxWidth: 340, justifyItems: 'stretch' }}
    >
      <div style={{ display: 'grid', gap: 14 }}>
        <Button block variant="ink">
          Email me a sign-in link
        </Button>
        <Separator label="or" />
        <Button block variant="secondary">
          Use a password
        </Button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifySelf: 'center' }}>
        <Button iconOnly variant="quiet" size="sm" aria-label="Previous">
          <Icon name="chevronLeft" />
        </Button>
        <Button iconOnly variant="quiet" size="sm" aria-label="Next">
          <Icon name="chevronRight" />
        </Button>
        <Separator
          orientation="vertical"
          style={{ height: 20, alignSelf: 'center', margin: '0 6px' }}
        />
        <Button iconOnly variant="quiet" size="sm" aria-label="More">
          <Icon name="more" />
        </Button>
      </div>
    </div>
  );
}

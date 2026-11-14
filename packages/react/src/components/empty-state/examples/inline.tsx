import { Button, EmptyState, Icon } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div
      style={{
        width: 'min(100%, 300px)',
        padding: 20,
        borderRadius: 16,
        background: 'var(--hj-surface)',
        boxShadow: 'inset 0 0 0 1px var(--hj-line)',
      }}
    >
      <div
        style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.6, color: 'var(--hj-fg-mute)' }}
      >
        UP NEXT
      </div>
      <EmptyState.Root align="start" style={{ paddingBottom: 0 }}>
        <EmptyState.Glyph>
          <Icon name="plus" />
        </EmptyState.Glyph>
        <EmptyState.Title render={(props) => <h4 {...props}>{props.children}</h4>}>
          Your queue is empty
        </EmptyState.Title>
        <EmptyState.Description>
          Add songs from any album or playlist with “Play next”.
        </EmptyState.Description>
        <EmptyState.Actions>
          <Button size="sm" variant="secondary">
            Shuffle your likes
          </Button>
        </EmptyState.Actions>
      </EmptyState.Root>
    </div>
  );
}

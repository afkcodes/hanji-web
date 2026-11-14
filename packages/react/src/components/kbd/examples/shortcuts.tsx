import { Field, Icon, Kbd, Text } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div style={{ display: 'grid', gap: 20, width: '100%', maxWidth: 420 }}>
      <Text tone="dim">
        Press <Kbd>⌘</Kbd>
        <Kbd>K</Kbd> to search anywhere, or <Kbd>Esc</Kbd> to close what’s open.
      </Text>
      <Field.Root>
        <Field.Label className="hj-sr-only">Search</Field.Label>
        <Field.Shell>
          <Field.Adornment>
            <Icon name="search" />
          </Field.Adornment>
          <Field.Control placeholder="Artists, songs or podcasts" />
          <Field.Adornment>
            <Kbd size="sm">⌘</Kbd>
            <Kbd size="sm">K</Kbd>
          </Field.Adornment>
        </Field.Shell>
      </Field.Root>
    </div>
  );
}

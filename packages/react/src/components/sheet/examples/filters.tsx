import { Button, Field, Sheet, Switch } from '@hanji/react';
import * as React from 'react';

const filters = [
  {
    id: 'downloaded',
    label: 'Downloaded only',
    help: '38 of 214 tracks are on this device',
    keep: 38 / 214,
  },
  {
    id: 'lossless',
    label: 'Lossless available',
    help: 'Hides 61 tracks streamed in High',
    keep: 153 / 214,
  },
  { id: 'liked', label: 'Liked', help: 'Tracks with a heart', keep: 0 },
] as const;

export function Example(): React.JSX.Element {
  const [on, setOn] = React.useState<Record<string, boolean>>({
    downloaded: false,
    lossless: true,
    liked: false,
  });
  const count = Math.round(filters.reduce((n, f) => (on[f.id] ? n * f.keep : n), 214));
  return (
    <Sheet.Root side="right">
      <Sheet.Trigger render={<Button variant="secondary" />}>Filters</Sheet.Trigger>
      <Sheet.Content size="md">
        <Sheet.Header>
          <Sheet.Title>Filter tracks</Sheet.Title>
          <Sheet.Description>Late Night Drive · 214 tracks</Sheet.Description>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Body>
          {filters.map((f) => (
            <Field.Root
              key={f.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 16,
                padding: '12px 0',
                borderBottom: '1px solid var(--hj-line)',
              }}
            >
              <div style={{ flex: 1 }}>
                <Field.Label>{f.label}</Field.Label>
                <Field.Description>{f.help}</Field.Description>
              </div>
              <Switch.Root
                checked={Boolean(on[f.id])}
                onCheckedChange={(v) => setOn((s) => ({ ...s, [f.id]: v }))}
              />
            </Field.Root>
          ))}
          {count === 0 ? (
            <p style={{ margin: '16px 0 0', fontSize: 13.5, color: 'var(--hj-fg-dim)' }}>
              No tracks match all of these. Turn a filter off to see more.
            </p>
          ) : null}
        </Sheet.Body>
        <Sheet.Footer>
          <Button
            variant="quiet"
            onClick={() => setOn({ downloaded: false, lossless: false, liked: false })}
          >
            Reset
          </Button>
          <Sheet.Close render={<Button disabled={count === 0} />}>
            {count === 0 ? 'No results' : `Show ${count} tracks`}
          </Sheet.Close>
        </Sheet.Footer>
      </Sheet.Content>
    </Sheet.Root>
  );
}

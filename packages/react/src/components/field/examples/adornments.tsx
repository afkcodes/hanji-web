import { Button, Field, Icon } from '@hanji/react';
import * as React from 'react';

export function Example(): React.JSX.Element {
  const [q, setQ] = React.useState('Kōya');
  return (
    <Field.Root style={{ maxWidth: 420 }}>
      <Field.Label className="hj-sr-only">Search</Field.Label>
      <Field.Shell style={{ borderRadius: 999 }}>
        <Field.Adornment>
          <Icon name="search" />
        </Field.Adornment>
        <Field.Control
          type="search"
          placeholder="Artists, songs or podcasts"
          value={q}
          onChange={(e) => setQ(e.currentTarget.value)}
        />
        {q ? (
          <Field.Adornment>
            <Button
              size="sm"
              variant="quiet"
              iconOnly
              aria-label="Clear search"
              onClick={() => setQ('')}
            >
              <Icon name="x" size={16} />
            </Button>
          </Field.Adornment>
        ) : null}
      </Field.Shell>
    </Field.Root>
  );
}

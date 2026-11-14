import { Button } from '@hanji/react';
import * as React from 'react';

export function Example(): React.JSX.Element {
  const [saving, setSaving] = React.useState(false);
  const save = (): void => {
    setSaving(true);
    window.setTimeout(() => setSaving(false), 1600);
  };
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <Button loading={saving} onClick={save}>
        {saving ? 'Saving…' : 'Save changes'}
      </Button>
      <Button variant="secondary" disabled={saving}>
        Cancel
      </Button>
    </div>
  );
}

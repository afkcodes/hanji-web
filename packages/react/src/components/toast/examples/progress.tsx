import { Button, Toast, createToaster } from '@hanji/react';
import * as React from 'react';

// A toaster made outside React — call it from a store, a fetch wrapper, anywhere.
const toast = createToaster();

function exportPlaylist(fail: boolean): void {
  const id = toast.show({
    title: 'Exporting “Late Night Drive”…',
    description: '48 tracks',
    timeout: 0,
  });
  window.setTimeout(() => {
    if (fail) {
      toast.update(id, {
        title: 'Export failed',
        description: 'Not enough space on this device — 212 MB needed.',
        tone: 'danger',
        action: { label: 'Retry', onClick: () => exportPlaylist(false) },
      });
    } else {
      toast.update(id, {
        title: 'Exported to Files › Exports',
        description: '212.4 MB',
        tone: 'success',
        timeout: 3200,
      });
    }
  }, 1600);
}

export function Example(): React.JSX.Element {
  return (
    <Toast.Provider toastManager={toast.manager}>
      <div style={{ display: 'flex', gap: 10 }}>
        <Button onClick={() => exportPlaylist(false)}>Export playlist</Button>
        <Button variant="secondary" onClick={() => exportPlaylist(true)}>
          Export (no space)
        </Button>
      </div>
      <Toast.Viewport placement="bottom-end" />
    </Toast.Provider>
  );
}

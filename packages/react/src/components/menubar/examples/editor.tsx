import { Menubar } from '@hanji/react';
import * as React from 'react';

export function Example(): React.JSX.Element {
  const [waveform, setWaveform] = React.useState(true);
  return (
    <Menubar.Root>
      <Menubar.Menu>
        <Menubar.Trigger>File</Menubar.Trigger>
        <Menubar.Content align="start">
          <Menubar.Item>
            New playlist <Menubar.Shortcut>⌘N</Menubar.Shortcut>
          </Menubar.Item>
          <Menubar.Item>
            Import from folder… <Menubar.Shortcut>⌘O</Menubar.Shortcut>
          </Menubar.Item>
          <Menubar.SubmenuRoot>
            <Menubar.SubmenuTrigger>Export as</Menubar.SubmenuTrigger>
            <Menubar.Content>
              <Menubar.Item>M3U playlist</Menubar.Item>
              <Menubar.Item>CSV (title, artist, length)</Menubar.Item>
            </Menubar.Content>
          </Menubar.SubmenuRoot>
          <Menubar.Separator />
          <Menubar.Item tone="danger">Delete playlist</Menubar.Item>
        </Menubar.Content>
      </Menubar.Menu>
      <Menubar.Menu>
        <Menubar.Trigger>Edit</Menubar.Trigger>
        <Menubar.Content align="start">
          <Menubar.Item disabled>
            Undo <Menubar.Shortcut>⌘Z</Menubar.Shortcut>
          </Menubar.Item>
          <Menubar.Item>
            Select all tracks <Menubar.Shortcut>⌘A</Menubar.Shortcut>
          </Menubar.Item>
        </Menubar.Content>
      </Menubar.Menu>
      <Menubar.Menu>
        <Menubar.Trigger>View</Menubar.Trigger>
        <Menubar.Content align="start">
          <Menubar.CheckboxItem checked={waveform} onCheckedChange={setWaveform}>
            Waveform in rows
          </Menubar.CheckboxItem>
          <Menubar.CheckboxItem defaultChecked={false}>Lyrics panel</Menubar.CheckboxItem>
        </Menubar.Content>
      </Menubar.Menu>
    </Menubar.Root>
  );
}

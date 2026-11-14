import { Button, Icon, Menu } from '@hanji/react';
import * as React from 'react';

export function Example(): React.JSX.Element {
  const [art, setArt] = React.useState(true);
  const [explicit, setExplicit] = React.useState(false);
  const [sort, setSort] = React.useState('recent');
  return (
    <Menu.Root>
      <Menu.Trigger render={<Button variant="secondary" size="sm" />}>
        View <Icon name="chevronDown" size={16} />
      </Menu.Trigger>
      <Menu.Content align="start">
        <Menu.Group>
          <Menu.GroupLabel>Show</Menu.GroupLabel>
          <Menu.CheckboxItem checked={art} onCheckedChange={setArt}>
            Album art
          </Menu.CheckboxItem>
          <Menu.CheckboxItem checked={explicit} onCheckedChange={setExplicit}>
            Explicit tracks
          </Menu.CheckboxItem>
        </Menu.Group>
        <Menu.Separator />
        <Menu.Group>
          <Menu.GroupLabel>Sort by</Menu.GroupLabel>
          <Menu.RadioGroup value={sort} onValueChange={(v) => setSort(String(v))}>
            <Menu.RadioItem value="recent">Recently added</Menu.RadioItem>
            <Menu.RadioItem value="title">Title</Menu.RadioItem>
            <Menu.RadioItem value="artist">Artist</Menu.RadioItem>
            <Menu.RadioItem value="plays" disabled>
              Most played (syncing…)
            </Menu.RadioItem>
          </Menu.RadioGroup>
        </Menu.Group>
      </Menu.Content>
    </Menu.Root>
  );
}

import { MessageActions } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <MessageActions.Root reveal="always" text="Saltmarsh by Ilse Brandt — 12 tracks, 48 min.">
      <MessageActions.Copy />
      <MessageActions.Regenerate disabled />
      <MessageActions.Feedback defaultValue="up" />
    </MessageActions.Root>
  );
}

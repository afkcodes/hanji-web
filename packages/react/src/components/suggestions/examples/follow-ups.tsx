import { Suggestions } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <Suggestions.Root label="Follow-ups">
      <Suggestions.Item prompt="Shorten the playlist to 30 minutes">
        Make it 30 minutes
      </Suggestions.Item>
      <Suggestions.Item prompt="Remove songs I've skipped more than twice">
        Drop skipped songs
      </Suggestions.Item>
      <Suggestions.Item prompt="Save this as a playlist called Tempo run">
        Save as playlist
      </Suggestions.Item>
      <Suggestions.Item disabled>Share (sign in first)</Suggestions.Item>
    </Suggestions.Root>
  );
}

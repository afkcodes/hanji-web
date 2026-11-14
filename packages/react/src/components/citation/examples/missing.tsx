import { Citation } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <p style={{ maxWidth: 520, margin: 0, fontSize: 15, lineHeight: 1.6 }}>
      The tour was announced on 3 October
      <Citation.Root>
        <Citation.Trigger index={3} href="https://example.net/press/tour-2027" />
        <Citation.Content>
          <Citation.Domain>example.net</Citation.Domain>
          <Citation.Title>Preview unavailable</Citation.Title>
          <Citation.Snippet>
            This page couldn’t be fetched when the answer was written (403). Open the link to check
            it yourself.
          </Citation.Snippet>
        </Citation.Content>
      </Citation.Root>
      .
    </p>
  );
}

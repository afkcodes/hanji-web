import { Citation, Message, MessageActions } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div style={{ width: '100%', maxWidth: 620, display: 'grid', gap: 20 }}>
      <Message.Root from="user">
        <Message.Content>Is lossless worth it on the train with AirPods?</Message.Content>
        <Message.Footer>
          <time dateTime="2026-11-14T08:12">08:12</time>
        </Message.Footer>
      </Message.Root>

      <Message.Root from="assistant">
        <Message.Avatar>한</Message.Avatar>
        <Message.Author>
          hanji assistant <time dateTime="2026-11-14T08:12">08:12</time>
        </Message.Author>
        <Message.Content>
          <p>
            Not really. AirPods receive audio over Bluetooth AAC at about 256 kbps, so a lossless
            file is re-compressed before you hear it
            <Citation.Root>
              <Citation.Trigger index={1} href="https://example.com/bluetooth-codecs" />
              <Citation.Content>
                <Citation.Domain>example.com</Citation.Domain>
                <Citation.Title>Which Bluetooth codecs do wireless earbuds use?</Citation.Title>
                <Citation.Snippet>
                  AAC tops out near 256 kbps; lossless streams are transcoded on the phone.
                </Citation.Snippet>
              </Citation.Content>
            </Citation.Root>
            . High (320 kbps) uses about 140 MB an hour instead of 1.4 GB.
          </p>
        </Message.Content>
        <Message.Footer>
          <MessageActions.Root text="Not really. AirPods receive audio over Bluetooth AAC…">
            <MessageActions.Copy />
            <MessageActions.Regenerate />
            <MessageActions.Feedback />
          </MessageActions.Root>
        </Message.Footer>
      </Message.Root>

      <Message.Root from="system">
        <Message.Content>Streaming quality changed to High on this device.</Message.Content>
      </Message.Root>
    </div>
  );
}
